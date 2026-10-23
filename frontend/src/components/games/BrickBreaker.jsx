import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Trophy, Zap, Shield, Heart } from 'lucide-react';
import { submitGameEvent } from '../../lib/playerApi';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const CW = 480;
const CH = 420;

const BRICK_COLS = 10;
const BRICK_W = 40;
const BRICK_H = 18;
const BRICK_PAD = 4;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = (CW - (BRICK_COLS * (BRICK_W + BRICK_PAD) - BRICK_PAD)) / 2;

// Levels: 0 = empty, 1-3 = hp, 9 = indestructible, 5 = explosive, 4 = power-up brick
const LEVELS = [
  // L1 — classic
  [
    [1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1],
    [2,2,2,2,2,2,2,2,2,2],
    [1,1,4,1,1,1,1,4,1,1],
    [3,3,3,3,3,3,3,3,3,3],
  ],
  // L2 — diamond
  [
    [0,0,0,0,2,2,0,0,0,0],
    [0,0,0,2,1,1,2,0,0,0],
    [0,0,2,1,4,4,1,2,0,0],
    [0,2,1,1,3,3,1,1,2,0],
    [2,1,1,1,5,5,1,1,1,2],
    [0,2,1,1,1,1,1,1,2,0],
  ],
  // L3 — fortress
  [
    [9,2,2,2,9,9,2,2,2,9],
    [2,1,4,1,2,2,1,4,1,2],
    [1,3,3,3,5,5,3,3,3,1],
    [1,1,1,1,1,1,1,1,1,1],
    [4,1,1,4,1,1,4,1,1,4],
  ],
];

const colorForHp = (hp) => {
  switch (hp) {
    case 1: return '#FFA050';
    case 2: return '#FF6B00';
    case 3: return '#FF4444';
    case 5: return '#FFD166'; // explosive
    default: return '#5a5a5a';
  }
};

const POWER_TYPES = ['wide', 'multi', 'slow', 'life', 'shield'];

const BrickBreaker = ({ onUnlock }) => {
  const canvasRef = useRef(null);
  const audioCtx = useRef(null);
  const [phase, setPhase] = useState('menu');
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1, combo: 0 });
  const [finalScore, setFinalScore] = useState(0);
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('brickHS') || '0'));
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('brickPN') || '');
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [leaderboard, setLeaderboard] = useState([]);
  const [showBoard, setShowBoard] = useState(false);
  const G = useRef(null);

  const playSound = (freq, dur = 0.05, type = 'square', vol = 0.05) => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = vol;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch (e) { /* ignore */ }
  };

  const buildBricks = (levelIdx) => {
    const layout = LEVELS[levelIdx % LEVELS.length];
    const bricks = [];
    layout.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 0) return;
        bricks.push({
          x: BRICK_OFFSET_LEFT + c * (BRICK_W + BRICK_PAD),
          y: BRICK_OFFSET_TOP + r * (BRICK_H + BRICK_PAD),
          w: BRICK_W, h: BRICK_H,
          hp: cell === 9 ? 99 : cell === 5 ? 1 : cell === 4 ? 1 : cell,
          maxHp: cell === 9 ? 99 : cell,
          type: cell === 9 ? 'wall' : cell === 5 ? 'bomb' : cell === 4 ? 'power' : 'normal',
          alive: true,
        });
      });
    });
    return bricks;
  };

  const mkGame = (level = 0) => ({
    paddle: { x: CW / 2 - 50, y: CH - 28, w: 100, h: 12, baseW: 100, laser: false, lastShot: 0 },
    balls: [{ x: CW / 2, y: CH - 50, r: 7, vx: 0, vy: 0, attached: true, trail: [] }],
    bricks: buildBricks(level),
    particles: [],
    powerUps: [],
    lasers: [],
    popups: [],
    stars: Array.from({ length: 40 }, () => ({
      x: Math.random() * CW, y: Math.random() * CH,
      spd: 0.2 + Math.random() * 0.6, r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.4 + 0.15,
    })),
    score: 0,
    lives: 3,
    level: level + 1,
    combo: 0,
    lastHit: 0,
    mx: CW / 2,
    frame: 0,
    shakeT: 0,
    wideT: 0,
    slowT: 0,
    shieldY: 0,
    shieldT: 0,
  });

  const fetchBoard = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/api/game/leaderboard?game_id=brick-breaker&limit=10`);
      if (r.ok) setLeaderboard(await r.json());
    } catch (e) { /* ignore */ }
  }, []);
  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const submitScore = useCallback(async () => {
    if (!playerName.trim() || finalScore <= 0) return;
    setSubmitStatus('loading');
    try {
      const r = await fetch(`${API_URL}/api/game/submit-score`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName.trim(), score: finalScore, game_id: 'brick-breaker' }),
      });
      if (r.ok) {
        localStorage.setItem('brickPN', playerName.trim());
        setSubmitStatus('done');
        fetchBoard();
      } else setSubmitStatus('error');
    } catch (e) { setSubmitStatus('error'); }
  }, [playerName, finalScore, fetchBoard]);

  const start = () => {
    G.current = mkGame(0);
    setHud({ score: 0, lives: 3, level: 1, combo: 0 });
    setPhase('playing');
    setSubmitStatus('idle');
  };

  const endGame = useCallback(() => {
    const s = G.current?.score || 0;
    const lvl = G.current?.level || 0;
    setFinalScore(s);
    const high = s > highScore;
    setIsNewHigh(high);
    if (high) { setHighScore(s); localStorage.setItem('brickHS', String(s)); }
    setPhase('gameover');
    playSound(120, 0.4, 'sawtooth', 0.08);
    // Cross-Game-Achievements
    (async () => {
      try {
        const res = await submitGameEvent({
          game_id: 'brick', score: s, won: lvl >= LEVELS.length,
        });
        if (res?.new_achievements?.length && onUnlock) onUnlock(res.new_achievements);
      } catch (e) { /* silent */ }
    })();
  }, [highScore, onUnlock]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const x = ((cx - rect.left) / rect.width) * CW;
      const g = G.current; if (!g) return;
      g.mx = Math.max(g.paddle.w / 2, Math.min(CW - g.paddle.w / 2, x));
    };
    const onClick = () => {
      const g = G.current; if (!g) return;
      const attached = g.balls.find((b) => b.attached);
      if (attached) {
        attached.attached = false;
        attached.vx = (Math.random() > 0.5 ? 1 : -1) * 3.5;
        attached.vy = -4.5;
        playSound(660, 0.06, 'square');
      } else if (g.paddle.laser && g.frame - g.paddle.lastShot > 12) {
        g.lasers.push({ x: g.paddle.x + 8, y: g.paddle.y });
        g.lasers.push({ x: g.paddle.x + g.paddle.w - 12, y: g.paddle.y });
        g.paddle.lastShot = g.frame;
        playSound(880, 0.04, 'square');
      }
    };
    const onKey = (e) => {
      if (e.code === 'Space') onClick();
      if (e.code === 'ArrowLeft') { const g = G.current; if (g) g.mx = Math.max(g.paddle.w / 2, g.mx - 24); }
      if (e.code === 'ArrowRight') { const g = G.current; if (g) g.mx = Math.min(CW - g.paddle.w / 2, g.mx + 24); }
    };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('touchmove', onMove, { passive: true });
    canvas.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);

    const spawnParticles = (x, y, color, n = 10) => {
      for (let i = 0; i < n; i++) {
        G.current.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          life: 28 + Math.random() * 14,
          maxLife: 36, size: 2 + Math.random() * 2, color,
        });
      }
    };

    const spawnPowerUp = (x, y) => {
      const type = POWER_TYPES[Math.floor(Math.random() * POWER_TYPES.length)];
      G.current.powerUps.push({ x, y, type, vy: 1.6 });
    };

    const explodeBrick = (b, isChain = false) => {
      b.alive = false;
      G.current.score += 10 * (1 + Math.min(5, G.current.combo));
      G.current.combo += 1;
      G.current.lastHit = G.current.frame;
      spawnParticles(b.x + b.w / 2, b.y + b.h / 2, colorForHp(b.maxHp), 12);
      playSound(440 + b.maxHp * 80, 0.05, 'triangle');
      if (b.type === 'power') spawnPowerUp(b.x + b.w / 2, b.y + b.h / 2);
      if (b.type === 'bomb' && !isChain) {
        G.current.shakeT = 14;
        playSound(80, 0.25, 'sawtooth', 0.1);
        G.current.bricks.forEach((other) => {
          if (!other.alive || other.type === 'wall') return;
          const dx = (other.x + other.w / 2) - (b.x + b.w / 2);
          const dy = (other.y + other.h / 2) - (b.y + b.h / 2);
          if (Math.hypot(dx, dy) < 80) explodeBrick(other, true);
        });
      }
    };

    const loop = () => {
      const g = G.current; if (!g) return;
      g.frame++;
      // combo decay
      if (g.frame - g.lastHit > 60) g.combo = 0;

      // paddle
      const targetW = g.wideT > 0 ? 160 : g.paddle.baseW;
      g.paddle.w += (targetW - g.paddle.w) * 0.18;
      g.paddle.x = g.mx - g.paddle.w / 2;
      if (g.wideT > 0) g.wideT--;
      if (g.shieldT > 0) g.shieldT--;
      if (g.slowT > 0) g.slowT--;
      const speedMult = g.slowT > 0 ? 0.55 : 1;

      // balls
      g.balls.forEach((ball) => {
        if (ball.attached) {
          ball.x = g.paddle.x + g.paddle.w / 2;
          ball.y = g.paddle.y - ball.r - 2;
          return;
        }
        // trail
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 8) ball.trail.shift();

        ball.x += ball.vx * speedMult;
        ball.y += ball.vy * speedMult;
        if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -1; playSound(330, 0.03, 'square'); }
        if (ball.x + ball.r > CW) { ball.x = CW - ball.r; ball.vx *= -1; playSound(330, 0.03, 'square'); }
        if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -1; playSound(330, 0.03, 'square'); }
        // paddle
        if (
          ball.y + ball.r >= g.paddle.y &&
          ball.y - ball.r <= g.paddle.y + g.paddle.h &&
          ball.x >= g.paddle.x && ball.x <= g.paddle.x + g.paddle.w &&
          ball.vy > 0
        ) {
          const hit = (ball.x - (g.paddle.x + g.paddle.w / 2)) / (g.paddle.w / 2);
          const angle = hit * Math.PI / 3;
          const speed = Math.min(8, Math.hypot(ball.vx, ball.vy) + 0.05);
          ball.vx = speed * Math.sin(angle);
          ball.vy = -Math.abs(speed * Math.cos(angle));
          ball.y = g.paddle.y - ball.r - 1;
          playSound(520, 0.04, 'square');
        }
        // bricks
        for (const b of g.bricks) {
          if (!b.alive) continue;
          if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + b.w &&
              ball.y + ball.r > b.y && ball.y - ball.r < b.y + b.h) {
            const overlapX = Math.min(ball.x + ball.r - b.x, b.x + b.w - (ball.x - ball.r));
            const overlapY = Math.min(ball.y + ball.r - b.y, b.y + b.h - (ball.y - ball.r));
            if (overlapX < overlapY) ball.vx *= -1; else ball.vy *= -1;
            if (b.type === 'wall') {
              spawnParticles(ball.x, ball.y, '#888', 4);
              playSound(180, 0.04, 'square');
            } else {
              b.hp -= 1;
              if (b.hp <= 0) explodeBrick(b);
              else { spawnParticles(ball.x, ball.y, colorForHp(b.maxHp), 4); playSound(660, 0.04, 'triangle'); }
            }
            break;
          }
        }
        // out
        if (ball.y - ball.r > CH) {
          if (g.shieldT > 0 && ball.vy > 0 && ball.y < CH + 20) {
            ball.y = CH - 20; ball.vy *= -1;
            g.shieldT = 0;
            spawnParticles(ball.x, CH - 10, '#06D6A0', 14);
            playSound(440, 0.1, 'sine');
          } else {
            ball._dead = true;
          }
        }
      });
      g.balls = g.balls.filter((b) => !b._dead);
      if (g.balls.length === 0) {
        g.lives -= 1;
        if (g.lives <= 0) { endGame(); return; }
        g.balls = [{ x: CW / 2, y: CH - 50, r: 7, vx: 0, vy: 0, attached: true, trail: [] }];
        g.combo = 0;
        playSound(180, 0.15, 'sawtooth');
      }

      // lasers
      g.lasers.forEach((l) => { l.y -= 7; });
      g.lasers = g.lasers.filter((l) => {
        if (l.y < -10) return false;
        for (const b of g.bricks) {
          if (!b.alive || b.type === 'wall') continue;
          if (l.x >= b.x && l.x <= b.x + b.w && l.y >= b.y && l.y <= b.y + b.h) {
            b.hp -= 1;
            if (b.hp <= 0) explodeBrick(b);
            return false;
          }
        }
        return true;
      });

      // power-ups
      g.powerUps.forEach((p) => { p.y += p.vy; });
      g.powerUps = g.powerUps.filter((p) => {
        if (p.y > CH) return false;
        if (p.x >= g.paddle.x && p.x <= g.paddle.x + g.paddle.w &&
            p.y >= g.paddle.y && p.y <= g.paddle.y + g.paddle.h + 10) {
          applyPowerUp(p.type);
          return false;
        }
        return true;
      });

      function applyPowerUp(type) {
        playSound(880, 0.12, 'sine');
        if (type === 'wide') { g.wideT = 600; g.popups.push({ text: 'WIDE PADDLE', y: CH / 2, life: 60 }); }
        if (type === 'multi') {
          const main = g.balls[0];
          if (main && !main.attached) {
            for (let i = 0; i < 2; i++) {
              const a = (Math.random() - 0.5) * Math.PI / 2;
              g.balls.push({ x: main.x, y: main.y, r: main.r, vx: 4 * Math.sin(a), vy: -4 * Math.cos(a), attached: false, trail: [] });
            }
            g.popups.push({ text: 'MULTI-BALL', y: CH / 2, life: 60 });
          }
        }
        if (type === 'slow') { g.slowT = 360; g.popups.push({ text: 'SLOW-MO', y: CH / 2, life: 60 }); }
        if (type === 'life') { g.lives = Math.min(5, g.lives + 1); g.popups.push({ text: '+1 LIFE', y: CH / 2, life: 60 }); }
        if (type === 'shield') { g.shieldT = 360; g.popups.push({ text: 'SHIELD', y: CH / 2, life: 60 }); }
      }

      // popups
      g.popups.forEach((p) => { p.y -= 0.6; p.life--; });
      g.popups = g.popups.filter((p) => p.life > 0);

      // particles
      g.particles.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--; });
      g.particles = g.particles.filter((p) => p.life > 0);

      // stars
      g.stars.forEach((s) => { s.y += s.spd; if (s.y > CH) { s.y = 0; s.x = Math.random() * CW; } });

      // next level
      const playable = g.bricks.filter((b) => b.alive && b.type !== 'wall');
      if (playable.length === 0) {
        const newLevel = g.level;
        g.score += 200;
        g.popups.push({ text: `LEVEL ${newLevel + 1}`, y: CH / 2, life: 80 });
        playSound(660, 0.1, 'triangle', 0.08);
        setTimeout(() => playSound(880, 0.15, 'triangle', 0.08), 100);
        g.bricks = buildBricks(newLevel);
        g.balls = [{ x: CW / 2, y: CH - 50, r: 7, vx: 0, vy: 0, attached: true, trail: [] }];
        g.level += 1;
      }

      // ===== RENDER =====
      const shake = g.shakeT > 0 ? (Math.random() - 0.5) * 6 : 0;
      g.shakeT = Math.max(0, g.shakeT - 1);
      ctx.save();
      ctx.translate(shake, shake);

      // bg gradient
      const grad = ctx.createLinearGradient(0, 0, 0, CH);
      grad.addColorStop(0, '#0a0612');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CW, CH);

      // stars
      g.stars.forEach((s) => {
        ctx.globalAlpha = s.a;
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // bricks
      g.bricks.forEach((b) => {
        if (!b.alive) return;
        const baseColor = b.type === 'wall' ? '#5a5a5a' : colorForHp(b.maxHp);
        ctx.fillStyle = baseColor;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = b.type === 'bomb' ? 14 : 8;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.shadowBlur = 0;
        // top highlight
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(b.x, b.y, b.w, 3);
        // power icon
        if (b.type === 'power') { ctx.fillStyle = '#fff'; ctx.font = 'bold 10px monospace'; ctx.fillText('?', b.x + b.w / 2 - 3, b.y + b.h / 2 + 4); }
        if (b.type === 'bomb') { ctx.fillStyle = '#000'; ctx.font = 'bold 11px monospace'; ctx.fillText('●', b.x + b.w / 2 - 3, b.y + b.h / 2 + 4); }
        if (b.type === 'wall') { ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4); }
      });

      // shield
      if (g.shieldT > 0) {
        ctx.strokeStyle = '#06D6A0';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#06D6A0'; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.moveTo(0, CH - 4); ctx.lineTo(CW, CH - 4); ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // paddle
      const paddleGrad = ctx.createLinearGradient(g.paddle.x, g.paddle.y, g.paddle.x, g.paddle.y + g.paddle.h);
      paddleGrad.addColorStop(0, '#FFA050');
      paddleGrad.addColorStop(1, '#FF6B00');
      ctx.fillStyle = paddleGrad;
      ctx.shadowColor = '#FF6B00'; ctx.shadowBlur = 22;
      ctx.fillRect(g.paddle.x, g.paddle.y, g.paddle.w, g.paddle.h);
      ctx.shadowBlur = 0;

      // power-ups
      g.powerUps.forEach((p) => {
        const colorByType = { wide: '#FF6B00', multi: '#FFD166', slow: '#A78BFA', life: '#06D6A0', shield: '#3B82F6' };
        const c = colorByType[p.type] || '#fff';
        ctx.fillStyle = c;
        ctx.shadowColor = c; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.font = 'bold 11px monospace';
        const letter = { wide: 'W', multi: 'M', slow: 'S', life: '+', shield: 'D' }[p.type] || '?';
        ctx.fillText(letter, p.x - 3, p.y + 4);
      });

      // lasers
      g.lasers.forEach((l) => {
        ctx.fillStyle = '#FFD166';
        ctx.shadowColor = '#FFD166'; ctx.shadowBlur = 10;
        ctx.fillRect(l.x - 1, l.y - 8, 2, 12);
        ctx.shadowBlur = 0;
      });

      // balls + trails
      g.balls.forEach((ball) => {
        ball.trail.forEach((t, i) => {
          ctx.globalAlpha = (i / ball.trail.length) * 0.4;
          ctx.fillStyle = '#FF6B00';
          ctx.beginPath(); ctx.arc(t.x, t.y, ball.r * (i / ball.trail.length), 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
        const ballGrad = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 0, ball.x, ball.y, ball.r);
        ballGrad.addColorStop(0, '#fff');
        ballGrad.addColorStop(1, '#FF6B00');
        ctx.fillStyle = ballGrad;
        ctx.shadowColor = '#FF6B00'; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      // particles
      g.particles.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1;

      // popups
      g.popups.forEach((p) => {
        ctx.globalAlpha = Math.min(1, p.life / 30);
        ctx.fillStyle = '#FF6B00';
        ctx.font = 'bold 20px monospace';
        const tw = ctx.measureText(p.text).width;
        ctx.fillText(p.text, CW / 2 - tw / 2, p.y);
      });
      ctx.globalAlpha = 1;

      // HUD top bar
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, CW, 36);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace';
      ctx.fillText(`SCORE ${g.score}`, 10, 22);
      ctx.fillStyle = '#FFD166'; ctx.fillText(`HI ${highScore}`, 110, 22);
      ctx.fillStyle = '#FF6B00';
      ctx.fillText(`L${g.level}`, CW - 110, 22);
      // hearts
      for (let i = 0; i < g.lives; i++) {
        ctx.fillStyle = '#FF4444';
        ctx.shadowColor = '#FF4444'; ctx.shadowBlur = 4;
        ctx.fillText('♥', CW - 80 + i * 14, 22);
      }
      ctx.shadowBlur = 0;
      // combo
      if (g.combo >= 2) {
        ctx.fillStyle = '#FFD166';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`x${g.combo} COMBO`, 170, 22);
      }

      ctx.restore();

      // sync hud
      if (hud.score !== g.score || hud.lives !== g.lives || hud.level !== g.level || hud.combo !== g.combo) {
        setHud({ score: g.score, lives: g.lives, level: g.level, combo: g.combo });
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [phase, endGame, highScore, hud.score, hud.lives, hud.level, hud.combo]);

  return (
    <div style={{ width: '100%', maxWidth: CW + 40, margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(160deg, rgba(255,107,0,0.04), rgba(0,0,0,0.6))',
        border: '1px solid rgba(255, 107, 0, 0.25)',
        borderRadius: 16, padding: 18, position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, background: '#FF6B00' }} />
            <span style={{ fontWeight: 800, fontSize: 12, color: '#FF6B00', letterSpacing: '0.18em' }}>BRICK BREAKER · v2</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#FFD166' }}>
            <Trophy size={12} /> HIGH: {highScore}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            style={{
              width: '100%', height: 'auto', display: 'block',
              background: '#000', borderRadius: 8,
              cursor: phase === 'playing' ? 'none' : 'default',
              touchAction: 'none',
            }}
          />

          {phase === 'menu' && (
            <div style={overlayStyle}>
              <div style={{ fontSize: 11, color: '#FF6B00', letterSpacing: '0.2em', fontWeight: 700 }}>ARCADE CLASSIC · ENHANCED</div>
              <h3 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                BRICK <span style={{ color: '#FF6B00' }}>BREAKER</span>
              </h3>
              <div style={{ color: '#b5b5b5', fontSize: 12, lineHeight: 1.7, textAlign: 'center', maxWidth: 340 }}>
                <strong style={{ color: '#FF6B00' }}>Maus / Touch</strong> → Paddle &nbsp;·&nbsp; <strong style={{ color: '#FF6B00' }}>Klick / Space</strong> → Ball / Laser
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360 }}>
                {[
                  ['W', 'Wide Paddle', '#FF6B00'],
                  ['M', 'Multi-Ball', '#FFD166'],
                  ['S', 'Slow-Mo', '#A78BFA'],
                  ['+', '+1 Life', '#06D6A0'],
                  ['D', 'Shield', '#3B82F6'],
                ].map(([k, label, c]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9a9a9a' }}>
                    <span style={{ width: 18, height: 18, background: c, color: '#000', fontWeight: 800, borderRadius: 4, display: 'inline-grid', placeItems: 'center', fontSize: 11 }}>{k}</span>
                    {label}
                  </div>
                ))}
              </div>
              <button onClick={start} data-testid="brick-start-btn" style={startBtnStyle}>
                <Play size={18} /> SPIELEN
              </button>
              {leaderboard.length > 0 && (
                <button onClick={() => setShowBoard(true)} style={ghostBtnStyle}>
                  <Trophy size={14} /> Leaderboard
                </button>
              )}
            </div>
          )}

          {phase === 'gameover' && (
            <div style={overlayStyle}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#FF4444', letterSpacing: '0.04em' }}>GAME OVER</div>
              {isNewHigh && <div style={{ color: '#FFD166', fontWeight: 700, fontSize: 13 }}>🏆 NEUER HIGHSCORE</div>}
              <div style={{ color: '#fff', fontSize: 14 }}>Punkte: <strong style={{ color: '#FF6B00', fontSize: 26 }}>{finalScore}</strong></div>
              <div style={{ color: '#9a9a9a', fontSize: 12 }}>Level erreicht: {hud.level}</div>
              {finalScore > 0 && submitStatus !== 'done' && (
                <div style={{ display: 'flex', gap: 6, width: '100%', maxWidth: 320 }}>
                  <input
                    placeholder="Dein Name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.slice(0, 24))}
                    style={{
                      flex: 1, padding: '10px 12px', background: '#0a0a0a', border: '1px solid #2a2a2a',
                      borderRadius: 6, color: '#fff', fontSize: 13, outline: 'none',
                    }}
                  />
                  <button onClick={submitScore} disabled={!playerName.trim() || submitStatus === 'loading'} style={{
                    padding: '10px 14px', background: '#FF6B00', color: '#000',
                    border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  }}>
                    {submitStatus === 'loading' ? '…' : 'Senden'}
                  </button>
                </div>
              )}
              {submitStatus === 'done' && <div style={{ color: '#06D6A0', fontSize: 12 }}>✓ Score gespeichert</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={start} style={startBtnStyle}>
                  <RotateCcw size={14} /> Nochmal
                </button>
                <button onClick={() => setShowBoard(true)} style={ghostBtnStyle}>
                  <Trophy size={14} /> Leaderboard
                </button>
              </div>
            </div>
          )}

          {showBoard && (
            <div style={{ ...overlayStyle, justifyContent: 'flex-start', padding: 22 }}>
              <div style={{ fontWeight: 900, color: '#FF6B00', fontSize: 18, letterSpacing: '0.1em' }}>🏆 TOP 10</div>
              <div style={{ width: '100%', display: 'grid', gap: 4, maxHeight: 240, overflowY: 'auto' }}>
                {leaderboard.length === 0 ? (
                  <div style={{ color: '#9a9a9a', textAlign: 'center', padding: 16, fontSize: 12 }}>
                    Noch keine Einträge — sei der Erste!
                  </div>
                ) : (
                  leaderboard.map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: i === 0 ? 'rgba(255,209,102,0.12)' : 'rgba(255,107,0,0.04)',
                      border: '1px solid ' + (i === 0 ? '#FFD166' : '#222'),
                      borderRadius: 4, fontSize: 13,
                    }}>
                      <span style={{ color: i === 0 ? '#FFD166' : '#fff' }}>
                        <strong style={{ display: 'inline-block', width: 22 }}>{i + 1}.</strong> {p.player_name}
                      </span>
                      <span style={{ color: '#FF6B00', fontWeight: 700 }}>{p.score}</span>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => setShowBoard(false)} style={ghostBtnStyle}>Schließen</button>
            </div>
          )}
        </div>

        {/* Power-up legend below canvas */}
        {phase === 'playing' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, gap: 8, flexWrap: 'wrap', fontSize: 11, color: '#9a9a9a' }}>
            <span><Zap size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Combo {hud.combo}x</span>
            <span><Heart size={12} style={{ display: 'inline', verticalAlign: 'middle', color: '#FF4444' }} /> {hud.lives}</span>
            <span><Shield size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Level {hud.level}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'absolute', inset: 0,
  background: 'rgba(0,0,0,0.92)',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  gap: 16, borderRadius: 8, padding: 24,
};
const startBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '14px 28px', background: '#FF6B00', color: '#000',
  border: 'none', borderRadius: 6, fontWeight: 800, fontSize: 14, cursor: 'pointer',
  letterSpacing: '0.05em',
};
const ghostBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', background: 'transparent', color: '#9a9a9a',
  border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 12, cursor: 'pointer',
};

export default BrickBreaker;
