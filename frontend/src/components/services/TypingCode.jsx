import React, { useState, useEffect, useRef } from 'react';

/**
 * Self-typing code mockup: types out `lines` character by character once it
 * scrolls into view, holds, erases, pauses, then types again — forever.
 * `lines` is [{ indent, segments: [{ t, c? }] }]; segments without `c` use
 * the surrounding text color. Scheduling lives entirely in useEffect (not
 * inside the setRevealed updater) so it stays correct under React Strict
 * Mode's dev-only double-invoke of updater functions.
 */
const TypingCode = ({ lines }) => {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const total = lines.reduce((sum, l) => sum + l.segments.reduce((s, seg) => s + seg.t.length, 0) + 1, 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const dirRef = useRef(1);
  useEffect(() => {
    if (!started) return undefined;
    let delay = dirRef.current === 1 ? 18 : 10;
    if (revealed >= total) { dirRef.current = -1; delay = 2200; }
    else if (revealed <= 0 && dirRef.current === -1) { dirRef.current = 1; delay = 600; }
    const id = setTimeout(() => {
      setRevealed((r) => Math.max(0, Math.min(total, r + dirRef.current)));
    }, delay);
    return () => clearTimeout(id);
  }, [started, revealed, total]);

  let budget = revealed;
  const rendered = lines.map((line) => {
    const segs = [];
    line.segments.forEach((seg) => {
      const take = Math.min(seg.t.length, budget);
      if (take > 0) segs.push({ c: seg.c, t: seg.t.slice(0, take) });
      budget = Math.max(0, budget - take);
    });
    budget = Math.max(0, budget - 1);
    return segs;
  });
  const cursorLine = Math.max(0, rendered.reduce((acc, segs, i) => (segs.length > 0 ? i : acc), 0));

  return (
    <div ref={ref}>
      {rendered.map((segs, li) => (
        <div key={li} style={{ paddingLeft: lines[li].indent }}>
          {segs.map((seg, si) => <span key={si} style={{ color: seg.c }}>{seg.t}</span>)}
          {li === cursorLine && started && (
            <span style={{ display: 'inline-block', width: '7px', height: '1em', background: 'var(--accent-primary)', verticalAlign: 'text-bottom', marginLeft: '2px', animation: 'blinkCursor 0.75s step-end infinite' }} />
          )}
        </div>
      ))}
    </div>
  );
};

export default TypingCode;
