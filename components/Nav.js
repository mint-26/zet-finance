'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export default function Nav({ activeSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { id: 'about', label: 'Über mich' },
    { id: 'process', label: 'So läuft\'s' },
    { id: 'fragebogen', label: 'Fragebogen', highlight: true },
    { id: 'testimonials', label: 'Kundenstimmen' },
    { id: 'contact', label: 'Kontakt' },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: scrolled ? '12px 0' : '20px 0',
      background: scrolled ? 'var(--nav-bg)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : 'none',
      transition: 'all 0.4s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img
            src={theme === 'dark' ? '/logo-white.svg' : '/logo-black.svg'}
            alt="Marco Arpa"
            style={{ height: 36, width: 'auto', transition: 'opacity 0.3s' }}
          />
        </div>

        {/* Desktop Nav */}
        <div className="nav-desktop" style={{
          display: 'flex', gap: 28, alignItems: 'center',
        }}>
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              style={l.highlight ? {
                background: 'var(--accent-dim)',
                border: '1px solid var(--accent)',
                borderRadius: 100,
                padding: '4px 14px',
                color: 'var(--accent)',
                fontSize: 14, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
                transition: 'all 0.3s',
              } : {
                background: 'none', border: 'none', cursor: 'pointer',
                color: activeSection === l.id ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                letterSpacing: 0.3, transition: 'color 0.3s', padding: 0,
              }}
            >
              {l.label}
            </button>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={toggle}
            aria-label="Theme wechseln"
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '1px solid var(--border)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 18, transition: 'all 0.3s',
              color: 'var(--accent)',
            }}
          >
            {theme === 'dark' ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
          </button>

        </div>

        {/* Mobile: theme + burger */}
        <div className="nav-mobile" style={{
          display: 'none', alignItems: 'center', gap: 8,
        }}>
          <button
            onClick={toggle}
            aria-label="Theme wechseln"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--accent-dim)',
              border: '1px solid var(--border)',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: 'var(--accent)',
            }}
          >
            {theme === 'dark' ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menü"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 8, display: 'flex', flexDirection: 'column', gap: 5,
            }}
          >
            <span style={{
              width: 22, height: 2, background: 'var(--accent)', borderRadius: 2,
              transition: '0.3s',
              transform: mobileOpen ? 'rotate(45deg) translateY(7px)' : 'none',
            }} />
            <span style={{
              width: 22, height: 2, background: 'var(--accent)', borderRadius: 2,
              transition: '0.3s', opacity: mobileOpen ? 0 : 1,
            }} />
            <span style={{
              width: 22, height: 2, background: 'var(--accent)', borderRadius: 2,
              transition: '0.3s',
              transform: mobileOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
            }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '16px 24px', borderBottom: '1px solid var(--border)',
        }}>
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              style={l.highlight ? {
                display: 'block', width: '100%', textAlign: 'left',
                background: 'var(--accent-dim)',
                border: '1px solid var(--accent)',
                borderRadius: 10,
                cursor: 'pointer',
                color: 'var(--accent)', fontSize: 16, fontWeight: 600,
                padding: '14px 16px', marginTop: 8, marginBottom: 8,
                fontFamily: "'DM Sans', sans-serif",
              } : {
                display: 'block', width: '100%', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-body)', fontSize: 16, padding: '14px 0',
                fontFamily: "'DM Sans', sans-serif",
                borderBottom: '1px solid var(--border)',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
