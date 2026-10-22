'use client';

import { useState, useEffect, useRef } from 'react';
import Questionnaire from '../Questionnaire';
import { C, SERIF, SANS } from '../../lib/brand';

const HEADER = 76;
const DURATION = 1200;
// Slow start, fast middle, slow arrival. The CSS curve and the JS function are the same
// ease-in-out cubic, so the unfolding form and the page scroll move in step.
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Eased page scroll; stops as soon as the visitor scrolls by hand.
function scrollToY(target, ms) {
  const start = window.scrollY;
  const dist = target - start;
  if (ms === 0) { window.scrollTo({ top: target, behavior: 'instant' }); return; }
  let stopped = false;
  const stop = () => { stopped = true; };
  const events = ['wheel', 'touchstart', 'keydown'];
  events.forEach((ev) => window.addEventListener(ev, stop, { passive: true, once: true }));
  const t0 = performance.now();
  const step = (now) => {
    if (stopped) return;
    const p = Math.min(1, (now - t0) / ms);
    window.scrollTo({ top: start + dist * easeInOut(p), behavior: 'instant' });
    if (p < 1) requestAnimationFrame(step);
    else events.forEach((ev) => window.removeEventListener(ev, stop));
  };
  requestAnimationFrame(step);
}

const topOf = (el) => el.getBoundingClientRect().top + window.scrollY - HEADER;

// Unfolds the questionnaire below the dental teaser instead of linking to /zahnzusatz.
// /zahnzusatz stays as its own page (QR codes); /#fragebogen opens the form directly.
export default function DentalReveal({ teaser }) {
  const [state, setState] = useState('closed'); // closed | opening | open | closing
  const rootRef = useRef(null);
  const formRef = useRef(null);
  const timer = useRef(null);

  const open = (e) => {
    e?.preventDefault();
    const ms = reducedMotion() ? 0 : DURATION;
    if (state === 'open' || state === 'opening') {
      scrollToY(topOf(formRef.current), ms);
      return;
    }
    clearTimeout(timer.current);
    setState('opening');
  };

  // Mounted collapsed in 'opening'; force a layout, then expand so the transition runs.
  useEffect(() => {
    if (state !== 'opening') return;
    void formRef.current.offsetHeight;
    setState('open');
    scrollToY(topOf(formRef.current), reducedMotion() ? 0 : DURATION);
  }, [state]);

  const close = () => {
    const ms = reducedMotion() ? 0 : DURATION;
    setState('closing');
    scrollToY(topOf(rootRef.current), ms);
    timer.current = setTimeout(() => setState('closed'), ms);
  };

  useEffect(() => {
    if (window.location.hash === '#fragebogen') open();
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expanded = state === 'open';

  return (
    <div ref={rootRef}>
      {teaser(open)}
      <div ref={formRef} style={{
        display: 'grid', gridTemplateRows: expanded ? '1fr' : '0fr',
        transition: `grid-template-rows ${DURATION}ms ${EASE}`,
      }}>
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          {state !== 'closed' && (
            <div className="dental-form" style={{
              opacity: expanded ? 1 : 0,
              transition: `opacity ${DURATION}ms ${EASE}`,
            }}>
              <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 24px 0', textAlign: 'right' }}>
                <button type="button" onClick={close} className="dental-close">Fragebogen schließen ×</button>
              </div>
              <Questionnaire />
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .dental-form {
          background: #E9E5DB;
          --bg-secondary: #E9E5DB;
          --bg-card: #F6F4EE;
          --text-primary: ${C.black};
          --text-body: ${C.black};
          --text-muted: ${C.graphite};
          --text-dim: #8C877E;
          --input-bg: #FFFFFF;
          --select-option-bg: #FFFFFF;
          --bg-primary: ${C.ivory};
          --success: #3E7B4F;
        }
        .dental-form #fragebogen {
          --accent: ${C.champagneDark};
          --accent-light: ${C.champagneDark};
          --accent-dim: rgba(125,109,73,0.1);
          --border: rgba(9,9,9,0.14);
          --border-strong: rgba(9,9,9,0.3);
          --shadow-accent: rgba(125,109,73,0.18);
          padding-top: 24px !important;
          font-family: ${SANS};
        }
        .dental-form h2, .dental-form h3 { font-family: ${SERIF} !important; font-weight: 400 !important; }
        .dental-close {
          background: none; border: 0; cursor: pointer; padding: 10px 0; min-height: 44px;
          font-family: ${SANS}; font-size: 13px; color: ${C.graphite};
          border-bottom: 1px solid ${C.champagne};
        }
        .dental-close:hover { color: ${C.black}; }
      `}</style>
    </div>
  );
}
