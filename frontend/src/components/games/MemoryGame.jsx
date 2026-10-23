import React, { useEffect, useState, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { submitGameEvent } from '../../lib/playerApi';

const SYMBOLS = ['🚀', '⭐', '⚡', '🎯', '🔥', '💎', '🎮', '🛡️'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newDeck() {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  return shuffle(pairs).map((sym, i) => ({ id: i, sym, flipped: false, matched: false }));
}

export default function MemoryGame({ onUnlock }) {
  const [phase, setPhase] = useState('menu');
  const [deck, setDeck] = useState(() => newDeck());
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState(0);

  const flip = (idx) => {
    if (phase !== 'play') return;
    if (selected.length === 2) return;
    if (deck[idx].flipped || deck[idx].matched) return;
    const newDeckCopy = [...deck];
    newDeckCopy[idx] = { ...newDeckCopy[idx], flipped: true };
    setDeck(newDeckCopy);
    setSelected((s) => [...s, idx]);
  };

  const finish = useCallback(async () => {
    setPhase('won');
    try {
      const res = await submitGameEvent({
        game_id: 'memory', score: 1, won: true, duration_ms: Date.now() - startedAt,
      });
      if (res?.new_achievements?.length && onUnlock) onUnlock(res.new_achievements);
    } catch (e) { console.error('Memory submit', e); }
  }, [onUnlock, startedAt]);

  useEffect(() => {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    setMoves((m) => m + 1);
    const timer = setTimeout(() => {
      const updated = [...deck];
      if (deck[a].sym === deck[b].sym) {
        updated[a] = { ...updated[a], matched: true };
        updated[b] = { ...updated[b], matched: true };
      } else {
        updated[a] = { ...updated[a], flipped: false };
        updated[b] = { ...updated[b], flipped: false };
      }
      setDeck(updated);
      setSelected([]);
      if (updated.every((c) => c.matched)) finish();
    }, 650);
    return () => clearTimeout(timer);
  }, [selected, deck, finish]);

  const start = () => {
    setDeck(newDeck());
    setSelected([]);
    setMoves(0);
    setStartedAt(Date.now());
    setPhase('play');
  };

  return (
    <div data-testid="memory-game" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: 380, fontFamily: 'monospace', color: '#FF6B00', fontSize: 14 }}>
        <span data-testid="memory-moves">MOVES: {moves}</span>
        <span style={{ color: '#888' }}>Finde alle Paare</span>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 80px)', gap: 10,
          width: 380, padding: 16, background: '#0d0d0d',
          border: '1px solid #1f1f1f', borderRadius: 12,
        }}>
          {deck.map((card, i) => (
            <button
              key={card.id}
              data-testid={`memory-card-${i}`}
              onClick={() => flip(i)}
              style={{
                width: 80, height: 80, fontSize: 30,
                background: card.matched ? 'rgba(255,107,0,0.16)' : (card.flipped ? '#1a1a1a' : '#161616'),
                border: '1px solid ' + (card.matched ? '#FF6B00' : '#222'),
                borderRadius: 10, cursor: card.matched || card.flipped ? 'default' : 'pointer',
                color: '#fff', transition: 'all 200ms',
              }}
            >
              {(card.flipped || card.matched) ? card.sym : ''}
            </button>
          ))}
        </div>
        {phase !== 'play' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'grid', placeItems: 'center', borderRadius: 12,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
                {phase === 'menu' ? 'Memory' : `Geschafft! ${moves} Züge`}
              </div>
              <button
                data-testid="memory-start"
                onClick={start}
                style={{
                  background: '#FF6B00', color: '#000', border: 0, padding: '10px 20px',
                  borderRadius: 999, fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                {phase === 'menu' ? <Play size={16} /> : <RotateCcw size={16} />}
                {phase === 'menu' ? 'Start' : 'Nochmal'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
