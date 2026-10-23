import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { submitGameEvent } from '../../lib/playerApi';

const SIZE = 4;

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandom(board) {
  const empty = [];
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++)
      if (board[y][x] === 0) empty.push([x, y]);
  if (!empty.length) return board;
  const [x, y] = empty[Math.floor(Math.random() * empty.length)];
  const v = Math.random() < 0.9 ? 2 : 4;
  const nb = board.map(r => [...r]);
  nb[y][x] = v;
  return nb;
}

function newBoard() {
  return addRandom(addRandom(emptyBoard()));
}

function slideRow(row) {
  const filtered = row.filter(v => v !== 0);
  const merged = [];
  let gained = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      gained += filtered[i] * 2;
      i++;
    } else merged.push(filtered[i]);
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, gained };
}

function rotateCW(b) {
  const n = emptyBoard();
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) n[x][SIZE - 1 - y] = b[y][x];
  return n;
}

function move(board, dir) {
  // dir: 0=left, 1=up, 2=right, 3=down — rotate to "left" then back
  let b = board.map(r => [...r]);
  for (let i = 0; i < dir; i++) b = rotateCW(b);
  let gained = 0;
  let changed = false;
  const after = b.map(r => {
    const { row, gained: g } = slideRow(r);
    gained += g;
    if (!changed && r.some((v, i) => v !== row[i])) changed = true;
    return row;
  });
  let out = after;
  for (let i = 0; i < (4 - dir) % 4; i++) out = rotateCW(out);
  return { board: out, gained, changed };
}

function tileColor(v) {
  const map = {
    0: '#161616', 2: '#2a2a2a', 4: '#3a2a1a', 8: '#5a3a0a', 16: '#7a4a08',
    32: '#a05a05', 64: '#c46e02', 128: '#e07800', 256: '#ff8c1e',
    512: '#ff9933', 1024: '#ffb260', 2048: '#FFD166',
  };
  return map[v] || '#FFE8A8';
}

export default function Game2048({ onUnlock }) {
  const [phase, setPhase] = useState('menu');
  const [board, setBoard] = useState(newBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const wonRef = useRef(false);

  const finish = useCallback(async (finalScore, finalBest) => {
    setPhase('over');
    try {
      const res = await submitGameEvent({
        game_id: '2048', score: finalBest, won: finalBest >= 2048,
      });
      if (res?.new_achievements?.length && onUnlock) onUnlock(res.new_achievements);
    } catch (e) { console.error('2048 submit', e); }
  }, [onUnlock]);

  const handleMove = useCallback((dir) => {
    if (phase !== 'play') return;
    const { board: next, gained, changed } = move(board, dir);
    if (!changed) return;
    const withTile = addRandom(next);
    setBoard(withTile);
    setScore((s) => s + gained);
    let curBest = best;
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        if (withTile[y][x] > curBest) curBest = withTile[y][x];
      }
    setBest(curBest);
    // Check game over
    const movesPossible = [0, 1, 2, 3].some((d) => move(withTile, d).changed);
    if (!movesPossible) finish(score + gained, curBest);
    if (curBest >= 2048 && !wonRef.current) {
      wonRef.current = true;
      // celebrate but allow continue
    }
  }, [board, phase, finish, score, best]);

  useEffect(() => {
    const handler = (e) => {
      const map = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3 };
      if (map[e.key] !== undefined) {
        e.preventDefault();
        handleMove(map[e.key]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleMove]);

  const start = () => {
    setBoard(newBoard());
    setScore(0); setBest(0);
    wonRef.current = false;
    setPhase('play');
  };

  return (
    <div data-testid="game-2048" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: 380, fontFamily: 'monospace', color: '#FF6B00', fontSize: 14 }}>
        <span data-testid="game-2048-score">SCORE: {score}</span>
        <span>BEST: {best}</span>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 80px)`, gap: 8,
          padding: 12, background: '#0d0d0d', border: '1px solid #1f1f1f', borderRadius: 12,
        }}>
          {board.flat().map((v, i) => (
            <div key={i} style={{
              width: 80, height: 80, display: 'grid', placeItems: 'center',
              background: tileColor(v), borderRadius: 8,
              fontSize: v >= 1024 ? 20 : (v >= 128 ? 26 : 30),
              fontWeight: 800, color: v === 0 ? 'transparent' : (v <= 4 ? '#fff' : '#000'),
              transition: 'background 150ms',
            }}>{v || ''}</div>
          ))}
        </div>
        {phase !== 'play' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'grid', placeItems: 'center', borderRadius: 12,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>
                {phase === 'menu' ? '2048' : `Vorbei — Best ${best}`}
              </div>
              <button
                data-testid="game-2048-start"
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
      <div style={{ color: '#666', fontSize: 12 }}>Pfeiltasten zum Verschieben</div>
    </div>
  );
}
