import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, Edit2, X, Gift, Trophy, CheckCircle2, ListOrdered } from 'lucide-react';
import { BACKEND_URL, authHeaders, input, btnPrimary, btnSecondary, btnGhost, btnDanger } from './_adminShared';

const CONDITION_TYPES = [
  { v: 'total_plays', label: 'Anzahl gespielter Runden (gesamt)' },
  { v: 'total_wins', label: 'Anzahl Siege' },
  { v: 'games_explored', label: 'Verschiedene Spiele gespielt' },
  { v: 'score_min_game', label: 'Mindestpunktzahl in einem Spiel' },
];
const GAMES = [
  { v: 'brick', label: 'Brick Breaker' },
  { v: 'snake', label: 'Snake' },
  { v: 'memory', label: 'Memory' },
  { v: '2048', label: '2048' },
];
const ICONS = ['Trophy', 'Sparkles', 'Compass', 'Flame', 'Crown', 'Medal', 'Star', 'Shield', 'Bot', 'Brain', 'Zap', 'Gift'];

const empty = () => ({
  key: '', title: '', description: '', icon: 'Trophy',
  condition_type: 'total_plays', condition_game: null, condition_value: 1,
  xp: 20, reward_code: '', reward_label: '', is_active: true, order: 0,
});

export default function AchievementsAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState([]);
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState([]);
  const [tab, setTab] = useState('achievements');

  const load = async () => {
    setLoading(true);
    try {
      const [a, r, p, s] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/achievements`, { headers: authHeaders() }),
        axios.get(`${BACKEND_URL}/api/admin/reward-codes`, { headers: authHeaders() }),
        axios.get(`${BACKEND_URL}/api/admin/players`, { headers: authHeaders() }),
        axios.get(`${BACKEND_URL}/api/admin/game-scores`, { headers: authHeaders() }),
      ]);
      setItems(a.data || []);
      setRewards(r.data || []);
      setPlayers(p.data || []);
      setScores(s.data?.scores || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...editing };
    if (payload.condition_type !== 'score_min_game') payload.condition_game = null;
    if (!payload.reward_code) payload.reward_code = null;
    if (!payload.reward_label) payload.reward_label = null;
    try {
      if (editing.id) {
        await axios.patch(`${BACKEND_URL}/api/admin/achievements/${editing.id}`, payload, { headers: authHeaders() });
      } else {
        await axios.post(`${BACKEND_URL}/api/admin/achievements`, payload, { headers: authHeaders() });
      }
      setEditing(null); load();
    } catch (e) {
      alert(e.response?.data?.detail || 'Speichern fehlgeschlagen');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Wirklich löschen?')) return;
    await axios.delete(`${BACKEND_URL}/api/admin/achievements/${id}`, { headers: authHeaders() });
    load();
  };

  const markUsed = async (id) => {
    await axios.post(`${BACKEND_URL}/api/admin/reward-codes/${id}/mark-used`, {}, { headers: authHeaders() });
    load();
  };

  const delScore = async (id) => {
    if (!window.confirm('Diesen Leaderboard-Eintrag wirklich löschen?')) return;
    await axios.delete(`${BACKEND_URL}/api/admin/game-scores/${id}`, { headers: authHeaders() });
    load();
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Achievements & Rewards</h1>
          <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>Cross-Game-Erfolge, Belohnungs-Codes & Spieler-Übersicht</div>
        </div>
        {tab === 'achievements' && (
          <button data-testid="add-achievement" onClick={() => setEditing(empty())} style={btnPrimary}>
            <Plus size={14} /> Neues Achievement
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[
          { v: 'achievements', label: 'Achievements', icon: Trophy },
          { v: 'rewards', label: 'Reward-Codes', icon: Gift },
          { v: 'players', label: 'Spieler', icon: Trophy },
          { v: 'leaderboard', label: 'Leaderboard', icon: ListOrdered },
        ].map(t => (
          <button
            key={t.v}
            data-testid={`tab-${t.v}`}
            onClick={() => setTab(t.v)}
            style={{
              ...btnSecondary,
              background: tab === t.v ? 'rgba(255,107,0,0.18)' : '#111',
              border: '1px solid ' + (tab === t.v ? '#FF6B00' : '#2a2a2a'),
              color: tab === t.v ? '#FF6B00' : '#ccc',
            }}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#888' }}>Lädt…</div>
      ) : tab === 'achievements' ? (
        <div data-testid="achievements-table" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it) => (
            <div key={it.id} style={{
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 12,
              padding: 14, background: '#111', border: '1px solid #1f1f1f', borderRadius: 8,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ color: '#FF6B00', fontWeight: 700, fontSize: 14 }}>{it.title}</span>
                  <code style={{ background: '#0a0a0a', padding: '2px 6px', borderRadius: 4, fontSize: 11, color: '#888' }}>{it.key}</code>
                  {!it.is_active && <span style={{ color: '#888', fontSize: 11 }}>inaktiv</span>}
                </div>
                <div style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>{it.description}</div>
                <div style={{ color: '#666', fontSize: 11 }}>
                  Bedingung: {it.condition_type}
                  {it.condition_game && ` (${it.condition_game})`} ≥ {it.condition_value} · +{it.xp} XP
                  {it.reward_code && ` · Reward-Prefix: ${it.reward_code}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button data-testid={`edit-${it.key}`} onClick={() => setEditing(it)} style={btnGhost}>
                  <Edit2 size={14} />
                </button>
                <button data-testid={`delete-${it.key}`} onClick={() => del(it.id)} style={btnDanger}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'rewards' ? (
        <div data-testid="rewards-table" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rewards.length === 0 && <div style={{ color: '#888' }}>Noch keine Codes generiert.</div>}
          {rewards.map((r) => (
            <div key={r.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, alignItems: 'center',
              padding: 12, background: '#111', border: '1px solid #1f1f1f', borderRadius: 8,
            }}>
              <code style={{ color: '#FFD166', fontWeight: 700 }}>{r.code}</code>
              <div style={{ color: '#ddd', fontSize: 13 }}>{r.reward_label || '—'}</div>
              <div style={{ fontSize: 12, color: '#888' }}>
                {r.claimed ? '✓ Lead erfasst' : 'unbeansprucht'}
                {r.used && ' · eingelöst'}
              </div>
              {r.claimed && !r.used && (
                <button data-testid={`mark-used-${r.id}`} onClick={() => markUsed(r.id)} style={btnSecondary}>
                  <CheckCircle2 size={14} /> Als eingelöst markieren
                </button>
              )}
            </div>
          ))}
        </div>
      ) : tab === 'players' ? (
        <div data-testid="players-table" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {players.length === 0 && <div style={{ color: '#888' }}>Noch keine registrierten Spieler.</div>}
          {players.map((p) => (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10,
              padding: 12, background: '#111', border: '1px solid #1f1f1f', borderRadius: 8,
            }}>
              <div style={{ color: '#fff', fontWeight: 600 }}>{p.name}</div>
              <div style={{ color: '#ddd', fontSize: 13 }}>{p.email}</div>
              <div style={{ color: '#FF6B00', fontSize: 13 }}>Lvl {p.level} · {p.total_xp} XP</div>
              <div style={{ color: '#888', fontSize: 12 }}>{(p.created_at || '').slice(0, 10)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div data-testid="leaderboard-table" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>
            Öffentliches Mini-Game-Leaderboard — jeder kann einen Namen einschicken, hier können Missbrauchs-/Fake-Einträge entfernt werden.
          </div>
          {scores.length === 0 && <div style={{ color: '#888' }}>Noch keine Einträge.</div>}
          {scores.map((s) => (
            <div key={s.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'center',
              padding: 12, background: '#111', border: '1px solid #1f1f1f', borderRadius: 8,
            }}>
              <div style={{ color: '#fff', fontWeight: 600 }}>{s.player_name}</div>
              <div style={{ color: '#FF6B00', fontSize: 13 }}>{s.score} Punkte</div>
              <div style={{ color: '#ddd', fontSize: 13 }}>{s.game_id}</div>
              <div style={{ color: '#888', fontSize: 12 }}>{(s.timestamp || '').slice(0, 16).replace('T', ' ')}</div>
              <button data-testid={`delete-score-${s.id}`} onClick={() => delScore(s.id)} style={btnDanger}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div onClick={() => setEditing(null)} style={modalOverlay}>
          <div onClick={(e) => e.stopPropagation()} style={modalBody}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{editing.id ? 'Bearbeiten' : 'Neues Achievement'}</div>
              <button onClick={() => setEditing(null)} style={{ background: 'transparent', border: 0, color: '#aaa', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Key (z.B. brick-master)">
                <input data-testid="field-key" value={editing.key} onChange={e => setEditing({ ...editing, key: e.target.value.toLowerCase() })} style={input} placeholder="kebab-case" />
              </Field>
              <Field label="Titel">
                <input data-testid="field-title" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} style={input} />
              </Field>
              <Field label="Icon" full>
                <select data-testid="field-icon" value={editing.icon} onChange={e => setEditing({ ...editing, icon: e.target.value })} style={input}>
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Beschreibung" full>
                <textarea data-testid="field-description" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} style={{ ...input, minHeight: 60 }} />
              </Field>
              <Field label="Bedingung">
                <select data-testid="field-condition-type" value={editing.condition_type} onChange={e => setEditing({ ...editing, condition_type: e.target.value })} style={input}>
                  {CONDITION_TYPES.map(c => <option key={c.v} value={c.v}>{c.label}</option>)}
                </select>
              </Field>
              {editing.condition_type === 'score_min_game' && (
                <Field label="Spiel">
                  <select data-testid="field-condition-game" value={editing.condition_game || ''} onChange={e => setEditing({ ...editing, condition_game: e.target.value })} style={input}>
                    <option value="">— wählen —</option>
                    {GAMES.map(g => <option key={g.v} value={g.v}>{g.label}</option>)}
                  </select>
                </Field>
              )}
              <Field label="Schwellwert">
                <input data-testid="field-condition-value" type="number" value={editing.condition_value} onChange={e => setEditing({ ...editing, condition_value: Number(e.target.value) })} style={input} />
              </Field>
              <Field label="XP">
                <input data-testid="field-xp" type="number" value={editing.xp} onChange={e => setEditing({ ...editing, xp: Number(e.target.value) })} style={input} />
              </Field>
              <Field label="Reihenfolge">
                <input data-testid="field-order" type="number" value={editing.order} onChange={e => setEditing({ ...editing, order: Number(e.target.value) })} style={input} />
              </Field>
              <Field label="Reward-Code-Präfix (optional)">
                <input data-testid="field-reward-code" value={editing.reward_code || ''} onChange={e => setEditing({ ...editing, reward_code: e.target.value })} style={input} placeholder="z.B. ZEBICK-SEO10" />
              </Field>
              <Field label="Reward-Beschreibung">
                <input data-testid="field-reward-label" value={editing.reward_label || ''} onChange={e => setEditing({ ...editing, reward_label: e.target.value })} style={input} placeholder="z.B. Kostenloser SEO-Check" />
              </Field>
              <Field label="Aktiv">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ddd', fontSize: 13 }}>
                  <input data-testid="field-active" type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
                  Veröffentlicht
                </label>
              </Field>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setEditing(null)} style={btnSecondary}>Abbrechen</button>
              <button data-testid="save-achievement" onClick={save} style={btnPrimary}><Save size={14} /> Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, children, full }) => (
  <div style={{ gridColumn: full ? '1 / span 2' : 'auto' }}>
    <div style={{ color: '#888', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
    {children}
  </div>
);

const modalOverlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 2000,
  display: 'grid', placeItems: 'center', padding: 18, backdropFilter: 'blur(6px)',
};
const modalBody = {
  width: '100%', maxWidth: 720, background: '#101010',
  border: '1px solid #1f1f1f', borderRadius: 12, padding: 22,
  maxHeight: '90vh', overflowY: 'auto',
};
