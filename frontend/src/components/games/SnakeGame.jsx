import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { submitGameEvent } from '../../lib/playerApi';

const SIZE = 18;
const TILE = 22;

const DIRS = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
};

function randCell(snake) {
  while (true) {
    const x = Math.floor(Math.random() * SIZE);
    const y = Math.floor(Math.random() * SIZE);
    if (!snake.some(s => s[0] === x && s[1] === y)) return [x, y];
  }
}

export default function SnakeGame({ onUnlock }) {
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState('menu'); // menu, play, over
  const [score, setScore] = useState(0);
  const stateRef = useRef({
    snake: [[8, 8]], dir: [1, 0], food: [12, 8], tick: 0,
  });

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, SIZE * TILE, SIZE * TILE);
    // grid
    ctx.strokeStyle = '#191919';
    for (let i = 0; i <= SIZE; i++) {
      ctx.beginPath(); ctx.moveTo(i * TILE, 0); ctx.lineTo(i * TILE, SIZE * TILE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * TILE); ctx.lineTo(SIZE * TILE, i * TILE); ctx.stroke();
    }
    const { snake, food } = stateRef.current;
    ctx.fillStyle = '#FFD166';
    ctx.fillRect(food[0] * TILE + 3, food[1] * TILE + 3, TILE - 6, TILE - 6);
    snake.forEach(([x, y], i) => {
      ctx.fillStyle = i === 0 ? '#FF6B00' : '#FFA050';
      ctx.fillRect(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2);
    });
  }, []);

  const finish = useCallback(async (finalScore) => {
    setPhase('over');
    try {
      const res = await submitGameEvent({
        game_id: 'snake', score: finalScore, won: finalScore >= 300,
      });
      if (res?.new_achievements?.length && onUnlock) onUnlock(res.new_achievements);
    } catch (e) {
      console.error('Snake submit', e);
    }
  }, [onUnlock]);

  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => {
      const st = stateRef.current;
      const [hx, hy] = st.snake[0];
      const [dx, dy] = st.dir;
      const nx = hx + dx;
      const ny = hy + dy;
      if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE) {
        clearInterval(id); finish(score); return;
      }
      if (st.snake.some(([x, y]) => x === nx && y === ny)) {
        clearInterval(id); finish(score); return;
      }
      const ateFood = nx === st.food[0] && ny === st.food[1];
      const newSnake = [[nx, ny], ...st.snake];
      if (!ateFood) newSnake.pop();
      else {
        st.food = randCell(newSnake);
        setScore((s) => s + 20);
      }
      st.snake = newSnake;
      draw();
    }, 110);
    return () => clearInterval(id);
  }, [phase, score, draw, finish]);

  useEffect(() => {
    const onKey = (e) => {
      const d = DIRS[e.key];
      if (!d) return;
      const cur = stateRef.current.dir;
      // prevent reversal
      if (cur[0] + d[0] === 0 && cur[1] + d[1] === 0) return;
      stateRef.current.dir = d;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { draw(); }, [draw]);

  const start = () => {
    stateRef.current = { snake: [[8, 8], [7, 8], [6, 8]], dir: [1, 0], food: [12, 8], tick: 0 };
    setScore(0);
    setPhase('play');
  };

  return (
    <div data-testid="snake-game" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: SIZE * TILE, fontFamily: 'monospace', color: '#FF6B00', fontSize: 14 }}>
        <span data-testid="snake-score">SCORE: {score}</span>
        <span style={{ color: '#888' }}>Pfeiltasten / WASD</span>
      </div>
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} width={SIZE * TILE} height={SIZE * TILE} style={{ border: '1px solid #1f1f1f', borderRadius: 8 }} />
        {phase !== 'play' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.78)',
            display: 'grid', placeItems: 'center', borderRadius: 8, gap: 12,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                {phase === 'menu' ? 'Snake' : `Game Over — ${score} Punkte`}
              </div>
              <button
                data-testid="snake-start"
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
