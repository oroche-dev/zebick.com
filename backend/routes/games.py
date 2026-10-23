"""Cross-Game Achievements: player auth, game events, achievements engine, rewards-as-leads.

Separate from admin auth — uses its own /api/player namespace and Bearer JWT
(role='player') validated against the `players` collection.
"""

import logging
import secrets
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from pydantic import BaseModel, EmailStr, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

import config
from security import (
    db, sanitize_text, audit_log, get_current_user, require_crm_access,
    is_locked_out, record_login_attempt,
)

logger = logging.getLogger("zebick.games")
router = APIRouter(prefix="/api")
limiter = Limiter(key_func=get_remote_address, enabled=config.RATE_LIMIT_ENABLED)

# ============ HELPERS ============

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode()


def _verify_pw(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:  # noqa: BLE001
        return False


def _create_player_jwt(player_id: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": player_id,
        "email": email,
        "role": "player",
        "iat": now,
        "exp": now + timedelta(days=14),
        "jti": uuid.uuid4().hex,
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)


async def get_current_player_optional(
    authorization: Optional[str] = Header(None),
) -> Optional[dict]:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization[7:].strip()
    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
    if payload.get("role") != "player":
        return None
    player = await db.players.find_one(
        {"id": payload.get("sub")},
        {"_id": 0, "password_hash": 0},
    )
    return player


async def get_current_player(
    authorization: Optional[str] = Header(None),
) -> dict:
    player = await get_current_player_optional(authorization)
    if not player:
        raise HTTPException(status_code=401, detail="Bitte einloggen.")
    return player


def _level_for_xp(xp: int) -> int:
    """Simple progression: 100 XP = lvl 2, then every +150 XP."""
    if xp < 100:
        return 1
    return 1 + 1 + (xp - 100) // 150


def _xp_for_next_level(level: int) -> int:
    if level <= 1:
        return 100
    return 100 + (level - 1) * 150


# ============ MODELS ============

class PlayerRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=2, max_length=40)
    guest_id: Optional[str] = Field(None, max_length=80)


class PlayerLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class PlayerAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    player: dict


class GameEventCreate(BaseModel):
    game_id: Literal["brick", "snake", "memory", "2048"]
    score: int = Field(ge=0, le=10_000_000)
    won: bool = False
    duration_ms: int = Field(default=0, ge=0, le=24 * 3600 * 1000)
    guest_id: Optional[str] = Field(None, max_length=80)
    player_name: Optional[str] = Field(None, max_length=24)


class RewardRedeem(BaseModel):
    achievement_key: str = Field(min_length=1, max_length=80)
    # For anonymous redemption (after unlock as guest), allow registering on the fly
    email: EmailStr
    name: str = Field(min_length=2, max_length=80)
    phone: Optional[str] = Field(None, max_length=40)
    company: Optional[str] = Field(None, max_length=120)
    message: Optional[str] = Field(None, max_length=1000)


# ============ ACHIEVEMENT ENGINE ============

# Built-in defaults (DB collection `achievements_catalog` is the source of truth).
DEFAULT_ACHIEVEMENTS = [
    # PLAY counts
    {"key": "first-step", "title": "Erster Schritt", "description": "Spiele dein erstes Spiel.",
     "icon": "Sparkles", "condition_type": "total_plays", "condition_value": 1, "xp": 20,
     "reward_code": None, "reward_label": None},
    {"key": "explorer", "title": "Entdecker", "description": "Spiele alle 4 Spiele mindestens einmal.",
     "icon": "Compass", "condition_type": "games_explored", "condition_value": 4, "xp": 80,
     "reward_code": None, "reward_label": None},
    {"key": "playful-10", "title": "Aufgewärmt", "description": "Spiele 10 Runden insgesamt.",
     "icon": "Flame", "condition_type": "total_plays", "condition_value": 10, "xp": 60,
     "reward_code": "ZEBICK-SEO10", "reward_label": "Kostenloser SEO-Quickcheck (Wert 199 €)"},
    {"key": "playful-25", "title": "Sammler", "description": "Spiele 25 Runden insgesamt.",
     "icon": "Trophy", "condition_type": "total_plays", "condition_value": 25, "xp": 150,
     "reward_code": "ZEBICK-AUDIT15", "reward_label": "15 % Rabatt auf Security-Audit"},
    {"key": "marathon", "title": "Marathon", "description": "Spiele 50 Runden insgesamt.",
     "icon": "Crown", "condition_type": "total_plays", "condition_value": 50, "xp": 300,
     "reward_code": "ZEBICK-PROJ20", "reward_label": "20 % Rabatt auf dein erstes Projekt"},
    # WINS
    {"key": "winner", "title": "Sieger", "description": "Gewinne ein Spiel.",
     "icon": "Medal", "condition_type": "total_wins", "condition_value": 1, "xp": 40,
     "reward_code": None, "reward_label": None},
    {"key": "winning-streak", "title": "Sieges-Sammlung", "description": "Gewinne 5 Spiele.",
     "icon": "Star", "condition_type": "total_wins", "condition_value": 5, "xp": 120,
     "reward_code": None, "reward_label": None},
    # GAME-specific score thresholds
    {"key": "brick-master", "title": "Brick-Master", "description": "Erreiche 1500 Punkte in Brick Breaker.",
     "icon": "Shield", "condition_type": "score_min_game", "condition_game": "brick",
     "condition_value": 1500, "xp": 100, "reward_code": None, "reward_label": None},
    {"key": "snake-charmer", "title": "Snake Charmer", "description": "Erreiche 300 Punkte in Snake.",
     "icon": "Bot", "condition_type": "score_min_game", "condition_game": "snake",
     "condition_value": 300, "xp": 100, "reward_code": None, "reward_label": None},
    {"key": "memory-genius", "title": "Memory-Genie", "description": "Finde alle Memory-Paare.",
     "icon": "Brain", "condition_type": "score_min_game", "condition_game": "memory",
     "condition_value": 1, "xp": 100, "reward_code": None, "reward_label": None},
    {"key": "2048-legend", "title": "2048 Legende", "description": "Erreiche das 2048er-Feld.",
     "icon": "Zap", "condition_type": "score_min_game", "condition_game": "2048",
     "condition_value": 2048, "xp": 200,
     "reward_code": "ZEBICK-VIP", "reward_label": "VIP-Strategiegespräch (60 Min)"},
]


async def seed_default_achievements_if_empty() -> int:
    cnt = await db.achievements_catalog.count_documents({})
    if cnt > 0:
        return 0
    now = _now_iso()
    docs = []
    for i, a in enumerate(DEFAULT_ACHIEVEMENTS):
        docs.append({
            "id": str(uuid.uuid4()),
            **a,
            "is_active": True,
            "order": i,
            "created_at": now,
            "updated_at": now,
        })
    if docs:
        await db.achievements_catalog.insert_many(docs)
    return len(docs)


async def _evaluate_achievements(*, player_id: Optional[str], guest_id: Optional[str]) -> List[dict]:
    """Recompute aggregates from `game_events` for the given identity and unlock new achievements.

    Returns list of newly unlocked achievement dicts (each enriched with reward_code if generated).
    """
    if not player_id and not guest_id:
        return []
    q = {"player_id": player_id} if player_id else {"guest_id": guest_id, "player_id": None}
    cursor = db.game_events.find(q, {"_id": 0})
    events = await cursor.to_list(20000)
    total_plays = len(events)
    total_wins = sum(1 for e in events if e.get("won"))
    games_explored = len({e["game_id"] for e in events})
    best_per_game: dict[str, int] = {}
    for e in events:
        gid = e["game_id"]
        sc = int(e.get("score", 0) or 0)
        if sc > best_per_game.get(gid, -1):
            best_per_game[gid] = sc

    catalog = await db.achievements_catalog.find({"is_active": True}, {"_id": 0}).to_list(500)

    # which keys are already unlocked
    already_q = {"player_id": player_id} if player_id else {"guest_id": guest_id, "player_id": None}
    already = await db.player_achievements.find(already_q, {"_id": 0, "achievement_key": 1}).to_list(500)
    already_keys = {a["achievement_key"] for a in already}

    newly: List[dict] = []
    for ach in catalog:
        if ach["key"] in already_keys:
            continue
        ct = ach.get("condition_type")
        cv = int(ach.get("condition_value", 0) or 0)
        unlocked = False
        if ct == "total_plays":
            unlocked = total_plays >= cv
        elif ct == "total_wins":
            unlocked = total_wins >= cv
        elif ct == "games_explored":
            unlocked = games_explored >= cv
        elif ct == "score_min_game":
            gid = ach.get("condition_game")
            unlocked = bool(gid) and best_per_game.get(gid, 0) >= cv
        if not unlocked:
            continue
        # Persist unlock
        unlock_doc = {
            "id": str(uuid.uuid4()),
            "player_id": player_id,
            "guest_id": guest_id if not player_id else None,
            "achievement_key": ach["key"],
            "unlocked_at": _now_iso(),
            "xp": int(ach.get("xp", 0) or 0),
            "reward_claimed": False,
            "reward_code_id": None,
        }
        # Generate reward code if applicable
        rc_id = None
        if ach.get("reward_code"):
            rc_doc = {
                "id": str(uuid.uuid4()),
                "code": f"{ach['reward_code']}-{secrets.token_hex(3).upper()}",
                "player_id": player_id,
                "guest_id": guest_id if not player_id else None,
                "achievement_key": ach["key"],
                "reward_label": ach.get("reward_label") or "",
                "claimed": False,  # user has lead-redeemed
                "used": False,     # admin marks used
                "created_at": _now_iso(),
                "claimed_at": None,
                "used_at": None,
                "lead_id": None,
            }
            await db.reward_codes.insert_one(rc_doc)
            rc_id = rc_doc["id"]
            unlock_doc["reward_code_id"] = rc_id

        await db.player_achievements.insert_one(unlock_doc)
        # XP bump for registered players
        if player_id:
            new_xp_doc = await db.players.find_one_and_update(
                {"id": player_id},
                {"$inc": {"total_xp": int(ach.get("xp", 0) or 0)}},
                return_document=True,
            )
            if new_xp_doc:
                new_lvl = _level_for_xp(int(new_xp_doc.get("total_xp", 0)))
                if new_lvl != new_xp_doc.get("level"):
                    await db.players.update_one({"id": player_id}, {"$set": {"level": new_lvl}})

        enriched = {
            **ach,
            "unlocked_at": unlock_doc["unlocked_at"],
            "reward_code_id": rc_id,
        }
        if rc_id:
            rc = await db.reward_codes.find_one({"id": rc_id}, {"_id": 0})
            enriched["reward"] = rc
        newly.append(enriched)
    return newly


# ============ PLAYER AUTH ENDPOINTS ============

@router.post("/player/register", response_model=PlayerAuthResponse)
@limiter.limit("10/minute")
async def player_register(request: Request, data: PlayerRegister):
    email = data.email.lower().strip()
    existing = await db.players.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="E-Mail bereits registriert.")
    player_id = str(uuid.uuid4())
    doc = {
        "id": player_id,
        "email": email,
        "name": sanitize_text(data.name, 40) or "Spieler",
        "password_hash": _hash_pw(data.password),
        "total_xp": 0,
        "level": 1,
        "created_at": _now_iso(),
        "guest_id_origin": sanitize_text(data.guest_id, 80) if data.guest_id else None,
    }
    await db.players.insert_one(doc)

    # Migrate guest data if provided
    if data.guest_id:
        gid = sanitize_text(data.guest_id, 80)
        await db.game_events.update_many(
            {"guest_id": gid, "player_id": None},
            {"$set": {"player_id": player_id}},
        )
        await db.player_achievements.update_many(
            {"guest_id": gid, "player_id": None},
            {"$set": {"player_id": player_id, "guest_id": None}},
        )
        await db.reward_codes.update_many(
            {"guest_id": gid, "player_id": None},
            {"$set": {"player_id": player_id, "guest_id": None}},
        )

    # Recompute XP / level from already-unlocked achievements
    catalog = {a["key"]: a for a in await db.achievements_catalog.find({}, {"_id": 0}).to_list(500)}
    unlocked = await db.player_achievements.find({"player_id": player_id}, {"_id": 0}).to_list(500)
    total_xp = sum(int(catalog.get(u["achievement_key"], {}).get("xp", 0) or 0) for u in unlocked)
    await db.players.update_one({"id": player_id}, {"$set": {"total_xp": total_xp, "level": _level_for_xp(total_xp)}})

    # Re-evaluate (player_id-based, e.g. brand-new account discovers more on first play later)
    await _evaluate_achievements(player_id=player_id, guest_id=None)

    token = _create_player_jwt(player_id, email)
    player = await db.players.find_one({"id": player_id}, {"_id": 0, "password_hash": 0})
    await audit_log("player.register", email, request, {"player_id": player_id})
    return PlayerAuthResponse(access_token=token, player=player or {})


@router.post("/player/login", response_model=PlayerAuthResponse)
@limiter.limit("10/minute")
async def player_login(request: Request, data: PlayerLogin):
    email = data.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    if await is_locked_out(email, ip):
        raise HTTPException(status_code=429, detail="Zu viele Fehlversuche. Bitte später erneut versuchen.")
    p = await db.players.find_one({"email": email})
    if not p or not _verify_pw(data.password, p.get("password_hash", "")):
        await record_login_attempt(email, ip, False)
        raise HTTPException(status_code=401, detail="E-Mail oder Passwort falsch.")
    await record_login_attempt(email, ip, True)
    token = _create_player_jwt(p["id"], email)
    player = await db.players.find_one({"id": p["id"]}, {"_id": 0, "password_hash": 0})
    return PlayerAuthResponse(access_token=token, player=player or {})


@router.get("/player/me")
async def player_me(current: dict = Depends(get_current_player)):
    next_xp = _xp_for_next_level(int(current.get("level", 1)) + 1)
    return {**current, "xp_for_next_level": next_xp}


# ============ GAME EVENTS ============

@router.post("/player/event")
@limiter.limit("30/minute")
async def submit_event(
    request: Request,
    data: GameEventCreate,
    authorization: Optional[str] = Header(None),
):
    player = await get_current_player_optional(authorization)
    player_id = player["id"] if player else None
    guest_id = None if player_id else (sanitize_text(data.guest_id, 80) or None)
    if not player_id and not guest_id:
        # Create transient guest id if none provided
        guest_id = "g-" + uuid.uuid4().hex[:16]

    ev_doc = {
        "id": str(uuid.uuid4()),
        "player_id": player_id,
        "guest_id": guest_id,
        "player_name": sanitize_text(data.player_name, 24) or (player["name"] if player else "Gast"),
        "game_id": data.game_id,
        "score": int(data.score),
        "won": bool(data.won),
        "duration_ms": int(data.duration_ms),
        "played_at": _now_iso(),
    }
    await db.game_events.insert_one(ev_doc)

    # Also bump the legacy game_scores (used by existing leaderboard)
    await db.game_scores.insert_one({
        "id": ev_doc["id"],
        "player_name": ev_doc["player_name"],
        "score": ev_doc["score"],
        "game_id": ev_doc["game_id"],
        "timestamp": ev_doc["played_at"],
    })

    new_unlocks = await _evaluate_achievements(player_id=player_id, guest_id=None if player_id else guest_id)

    return {
        "event_id": ev_doc["id"],
        "guest_id": guest_id if not player_id else None,
        "new_achievements": new_unlocks,
    }


# ============ ACHIEVEMENT CATALOG / PROGRESS ============

@router.get("/player/achievements")
async def list_achievements_catalog():
    rows = await db.achievements_catalog.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(500)
    return rows


@router.get("/player/progress")
async def my_progress(
    request: Request,
    guest_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
):
    player = await get_current_player_optional(authorization)
    player_id = player["id"] if player else None
    gid = sanitize_text(guest_id, 80) if guest_id else None

    # aggregate stats
    q = {"player_id": player_id} if player_id else {"guest_id": gid, "player_id": None}
    events = await db.game_events.find(q, {"_id": 0}).to_list(20000)
    total_plays = len(events)
    total_wins = sum(1 for e in events if e.get("won"))
    games_explored = len({e["game_id"] for e in events})
    best_per_game: dict[str, int] = {}
    for e in events:
        sc = int(e.get("score", 0) or 0)
        if sc > best_per_game.get(e["game_id"], -1):
            best_per_game[e["game_id"]] = sc

    unlocked = await db.player_achievements.find(q, {"_id": 0}).sort("unlocked_at", -1).to_list(500)
    unlocked_keys = {u["achievement_key"] for u in unlocked}
    catalog = await db.achievements_catalog.find({"is_active": True}, {"_id": 0}).sort("order", 1).to_list(500)

    def _progress(ach: dict) -> dict:
        ct = ach.get("condition_type")
        cv = int(ach.get("condition_value", 0) or 0)
        cur = 0
        if ct == "total_plays":
            cur = total_plays
        elif ct == "total_wins":
            cur = total_wins
        elif ct == "games_explored":
            cur = games_explored
        elif ct == "score_min_game":
            cur = best_per_game.get(ach.get("condition_game") or "", 0)
        return {"current": cur, "target": cv, "pct": min(100, int(cur * 100 / cv)) if cv else 0}

    items = []
    for ach in catalog:
        items.append({
            **ach,
            "unlocked": ach["key"] in unlocked_keys,
            "unlocked_at": next((u["unlocked_at"] for u in unlocked if u["achievement_key"] == ach["key"]), None),
            "progress": _progress(ach),
        })

    rewards = await db.reward_codes.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)

    player_info = None
    if player_id:
        player_info = await db.players.find_one({"id": player_id}, {"_id": 0, "password_hash": 0})

    return {
        "stats": {
            "total_plays": total_plays,
            "total_wins": total_wins,
            "games_explored": games_explored,
            "best_per_game": best_per_game,
        },
        "achievements": items,
        "rewards": rewards,
        "player": player_info,
        "guest_id": gid if not player_id else None,
    }


# ============ REWARD REDEEM (creates a Lead) ============

@router.post("/player/redeem-reward")
@limiter.limit("10/minute")
async def redeem_reward(
    request: Request,
    data: RewardRedeem,
    authorization: Optional[str] = Header(None),
):
    player = await get_current_player_optional(authorization)
    player_id = player["id"] if player else None

    # Find reward code that the user has earned and has not yet claimed
    q = {"achievement_key": data.achievement_key, "claimed": False}
    if player_id:
        q["player_id"] = player_id
    else:
        # allow guest_id-based lookup via querystring/body
        gid = sanitize_text(request.query_params.get("guest_id", ""), 80) if request.query_params.get("guest_id") else None
        if gid:
            q["guest_id"] = gid
        else:
            raise HTTPException(status_code=400, detail="Login oder guest_id erforderlich.")
    # Atomic claim: the filter still requires claimed=False, so two concurrent
    # requests for the same code can't both win (the loser's match fails and it
    # gets None back) — avoids a double-redeem race from a find-then-update split.
    rc = await db.reward_codes.find_one_and_update(
        q, {"$set": {"claimed": True, "claimed_at": _now_iso()}}, projection={"_id": 0},
    )
    if not rc:
        raise HTTPException(status_code=404, detail="Belohnung nicht gefunden oder bereits eingelöst.")

    # Create a lead in the existing `leads` collection
    lead_id = str(uuid.uuid4())
    lead_doc = {
        "id": lead_id,
        "name": sanitize_text(data.name, 80),
        "email": data.email.lower().strip(),
        "phone": sanitize_text(data.phone, 40),
        "company": sanitize_text(data.company, 120),
        "message": sanitize_text(data.message, 1000) or f"Reward-Einlösung: {rc.get('reward_label')} (Code: {rc.get('code')})",
        "source": "game-achievement",
        "status": "new",
        "budget": None,
        "service": "Achievement-Reward",
        "tags": ["games", "achievement", data.achievement_key],
        "score": 35,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
        "notes": [],
        "owner": None,
        "next_follow_up": None,
        "reward_code": rc.get("code"),
    }
    await db.leads.insert_one(lead_doc)

    # claimed/claimed_at were already stamped atomically above; just link the lead.
    await db.reward_codes.update_one(
        {"id": rc["id"]},
        {"$set": {"lead_id": lead_id}},
    )

    return {
        "ok": True,
        "code": rc["code"],
        "reward_label": rc.get("reward_label"),
        "lead_id": lead_id,
    }


# ============ LEADERBOARD (CROSS GAME) ============

@router.get("/games/leaderboard")
async def global_leaderboard(limit: int = 20):
    """Aggregate top players by total_xp + total score across all games."""
    pipeline = [
        {"$group": {
            "_id": {"player_id": "$player_id", "name": "$player_name"},
            "total_score": {"$sum": "$score"},
            "plays": {"$sum": 1},
            "wins": {"$sum": {"$cond": ["$won", 1, 0]}},
        }},
        {"$sort": {"total_score": -1}},
        {"$limit": min(max(1, limit), 100)},
    ]
    rows = await db.game_events.aggregate(pipeline).to_list(100)
    out = []
    for i, r in enumerate(rows):
        out.append({
            "rank": i + 1,
            "player_name": r["_id"].get("name") or "Anonym",
            "total_score": int(r.get("total_score", 0)),
            "plays": int(r.get("plays", 0)),
            "wins": int(r.get("wins", 0)),
        })
    return out


# ============ ADMIN: ACHIEVEMENTS CRUD ============

class AchievementCreate(BaseModel):
    key: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9\-]+$")
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=600)
    icon: str = Field(default="Trophy", max_length=40)
    condition_type: Literal["total_plays", "total_wins", "games_explored", "score_min_game"]
    condition_game: Optional[Literal["brick", "snake", "memory", "2048"]] = None
    condition_value: int = Field(ge=0, le=10_000_000)
    xp: int = Field(default=0, ge=0, le=10000)
    reward_code: Optional[str] = Field(None, max_length=40)
    reward_label: Optional[str] = Field(None, max_length=200)
    is_active: bool = True
    order: int = 0


@router.get("/admin/achievements")
async def admin_list_achievements(current: dict = Depends(get_current_user)):
    return await db.achievements_catalog.find({}, {"_id": 0}).sort("order", 1).to_list(500)


@router.post("/admin/achievements")
async def admin_create_achievement(data: AchievementCreate, request: Request,
                                   current: dict = Depends(get_current_user)):
    existing = await db.achievements_catalog.find_one({"key": data.key})
    if existing:
        raise HTTPException(status_code=400, detail="Key bereits vergeben.")
    doc = {"id": str(uuid.uuid4()), **data.model_dump(),
           "created_at": _now_iso(), "updated_at": _now_iso()}
    await db.achievements_catalog.insert_one(doc)
    await audit_log("achievement.create", current.get("email"), request, {"key": data.key})
    doc.pop("_id", None)
    return doc


@router.patch("/admin/achievements/{ach_id}")
async def admin_update_achievement(ach_id: str, data: AchievementCreate, request: Request,
                                   current: dict = Depends(get_current_user)):
    upd = {**data.model_dump(), "updated_at": _now_iso()}
    res = await db.achievements_catalog.update_one({"id": ach_id}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    await audit_log("achievement.update", current.get("email"), request, {"id": ach_id})
    return await db.achievements_catalog.find_one({"id": ach_id}, {"_id": 0})


@router.delete("/admin/achievements/{ach_id}")
async def admin_delete_achievement(ach_id: str, request: Request,
                                   current: dict = Depends(get_current_user)):
    res = await db.achievements_catalog.delete_one({"id": ach_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    await audit_log("achievement.delete", current.get("email"), request, {"id": ach_id})
    return {"ok": True}


@router.get("/admin/reward-codes")
async def admin_list_reward_codes(current: dict = Depends(require_crm_access)):
    return await db.reward_codes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.post("/admin/reward-codes/{code_id}/mark-used")
async def admin_mark_used(code_id: str, request: Request, current: dict = Depends(require_crm_access)):
    res = await db.reward_codes.update_one({"id": code_id}, {"$set": {"used": True, "used_at": _now_iso()}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Nicht gefunden")
    await audit_log("reward.mark_used", current.get("email"), request, {"id": code_id})
    return {"ok": True}


@router.get("/admin/players")
async def admin_list_players(current: dict = Depends(require_crm_access)):
    rows = await db.players.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(1000)
    return rows
