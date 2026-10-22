'use client';

import { useRef, useState, useEffect } from 'react';

// Follows the height of its content with a soft transition instead of jumping,
// e.g. when the questionnaire switches steps or shows a follow-up question.
// Same ease-in-out curve as the unfolding questionnaire on the start page.
// The 6 px padding keeps focus rings from being clipped by overflow: hidden.
const PAD = 6;

export default function SmoothHeight({ children, duration = 500 }) {
  const inner = useRef(null);
  const [height, setHeight] = useState(null);
  const [ms, setMs] = useState(duration);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setMs(0);
    const el = inner.current;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight + 2 * PAD));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{
      height: height ?? 'auto', overflow: 'hidden', margin: -PAD, padding: PAD,
      transition: height == null ? 'none' : `height ${ms}ms cubic-bezier(0.65, 0, 0.35, 1)`,
    }}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
