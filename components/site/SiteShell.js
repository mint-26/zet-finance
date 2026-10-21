'use client';

import { useState, useEffect } from 'react';
import { C, SERIF, SANS, CONTACT } from '../../lib/brand';
import { Arrow } from './Icons';

const HEADER_HEIGHT = 76;

const NAV = [
  { label: 'Privatkunden', hash: 'privat' },
  { label: 'Unternehmen', hash: 'unternehmen' },
  { label: 'Über Marco', hash: 'ueber-marco' },
];

// Frame of the main site: sticky header with mobile menu, footer and
// shared global styles. `base` is '' on the start page and '/' elsewhere,
// so the menu links jump back to the start page sections.
export default function SiteShell({ base = '', onNavigate, children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const follow = (hash) => {
    setOpen(false);
    if (onNavigate) onNavigate(hash);
  };

  const pad = '0 clamp(20px, 5vw, 56px)';

  return (
    <div style={{ background: C.black, color: C.ivory, fontFamily: SANS, minHeight: '100vh' }}>
      <a href="#inhalt" className="site-skip">Zum Inhalt springen</a>

      <header style={{
        position: 'sticky', top: 0, zIndex: 50, background: C.black,
        borderBottom: `1px solid ${C.lineDark}`,
      }}>
        <div style={{
          maxWidth: 1120, margin: '0 auto', padding: pad, height: HEADER_HEIGHT,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <a href={base || '#top'} className="site-link" style={{
            fontFamily: SERIF, fontSize: 15, letterSpacing: '0.32em',
            color: C.ivory, textDecoration: 'none', padding: '13px 0',
          }}>
            MARCO ARPA
          </a>

          <nav aria-label="Hauptnavigation" className="site-nav-desktop" style={{
            display: 'flex', alignItems: 'center', gap: 32,
          }}>
            {NAV.map((l) => (
              <a
                key={l.hash} href={`${base}#${l.hash}`} onClick={() => follow(l.hash)}
                className="site-link" style={{ fontSize: 13, color: C.ivory, textDecoration: 'none', padding: '14px 0' }}
              >
                {l.label}
              </a>
            ))}
            <a
              href={`${base}#kontakt`} className="site-link"
              style={{
                fontSize: 13, color: C.ivory, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 0 8px', borderBottom: `1px solid ${C.champagne}`,
              }}
            >
              Gespräch anfragen <Arrow size={10} />
            </a>
          </nav>

          <button
            type="button" className="site-nav-mobile"
            aria-expanded={open} aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
            style={{
              display: 'none', minHeight: 44, minWidth: 64, padding: '0 14px',
              background: 'transparent', color: C.ivory, cursor: 'pointer',
              border: `1px solid ${C.champagne}`, fontFamily: SANS, fontSize: 13,
            }}
          >
            {open ? 'Schließen' : 'Menü'}
          </button>
        </div>

        {open && (
          <nav id="site-menu" aria-label="Hauptnavigation" style={{
            position: 'absolute', left: 0, right: 0, top: HEADER_HEIGHT,
            background: C.black, borderBottom: `1px solid ${C.lineDark}`,
            padding: '8px clamp(20px, 5vw, 56px) 24px',
          }}>
            {[...NAV, { label: 'Gespräch anfragen', hash: 'kontakt' }].map((l) => (
              <a
                key={l.hash} href={`${base}#${l.hash}`} onClick={() => follow(l.hash)}
                className="site-link"
                style={{
                  display: 'flex', alignItems: 'center', minHeight: 52,
                  borderTop: `1px solid ${C.lineDark}`, color: C.ivory,
                  textDecoration: 'none', fontFamily: SERIF, fontSize: 22,
                }}
              >
                {l.label}
              </a>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16, fontSize: 14 }}>
              <a href={CONTACT.phoneHref} className="site-link" style={{ color: C.grey, textDecoration: 'none', padding: '10px 0' }}>{CONTACT.phone}</a>
              <a href={`mailto:${CONTACT.email}`} className="site-link" style={{ color: C.grey, textDecoration: 'none', padding: '10px 0' }}>{CONTACT.email}</a>
            </div>
          </nav>
        )}
      </header>

      <main id="inhalt">{children}</main>

      <footer style={{ borderTop: `1px solid ${C.lineDark}`, background: C.black }}>
        <div style={{
          maxWidth: 1120, margin: '0 auto', padding: '28px clamp(20px, 5vw, 56px) 32px',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'space-between', gap: '12px 32px',
        }}>
          <span style={{ fontFamily: SERIF, fontSize: 12, letterSpacing: '0.32em', color: C.ivory }}>MARCO ARPA</span>
          <span style={{ fontSize: 12, color: C.grey }}>Versicherungsmakler nach § 34d GewO</span>
          <nav aria-label="Rechtliches" style={{ display: 'flex', flexWrap: 'wrap', gap: '0 20px' }}>
            {[
              { label: 'Impressum', href: '/impressum' },
              { label: 'Datenschutz', href: '/datenschutz' },
              { label: 'Erstinformation', href: '/erstinformation' },
            ].map((l) => (
              <a key={l.href} href={l.href} className="site-link" style={{ fontSize: 12, color: C.grey, textDecoration: 'none', padding: '15px 0' }}>
                {l.label}
              </a>
            ))}
            <a
              href="https://www.vermittlerregister.info" target="_blank" rel="noopener noreferrer" className="site-link"
              style={{ fontSize: 12, color: C.grey, textDecoration: 'none', padding: '15px 0', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              Vermittlerregister <Arrow size={9} />
            </a>
          </nav>
        </div>
      </footer>

      <style jsx global>{`
        body { background: ${C.black}; }
        html { scroll-padding-top: ${HEADER_HEIGHT + 8}px; }
        .site-link { transition: color 0.2s ease, opacity 0.2s ease; }
        .site-link:hover { color: ${C.champagne} !important; }
        .site-skip {
          position: absolute; left: -9999px; top: 8px; z-index: 100;
          background: ${C.ivory}; color: ${C.black}; padding: 14px 16px; font-size: 14px;
        }
        .site-skip:focus { left: 8px; }
        a:focus-visible, button:focus-visible {
          outline: 2px solid ${C.champagne};
          outline-offset: 3px;
        }
        @media (max-width: 860px) {
          .site-nav-desktop { display: none !important; }
          .site-nav-mobile { display: inline-flex !important; align-items: center; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
