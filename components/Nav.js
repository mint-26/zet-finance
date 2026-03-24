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
    { id: 'services', label: 'Leistungen' },
    { id: 'process', label: 'So läuft\'s' },
    { id: 'testimonials', label: 'Kundenstimmen' },
    { id: 'questionnaire', label: 'Fragebogen' },
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
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 16, color: 'var(--bg-primary)',
            transition: 'all 0.3s',
          }}>M</div>
          <span style={{
            fontFamily: "'Playfair Display', serif", fontSize: 18,
            fontWeight: 600, color: 'var(--text-primary)', letterSpacing: 0.5,
            transition: 'color 0.3s',
          }}>
            Marco Finanzen
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="nav-desktop" style={{
          display: 'flex', gap: 28, alignItems: 'center',
        }}>
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              style={{
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
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            onClick={() => scrollTo('contact')}
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              border: 'none', borderRadius: 8, padding: '10px 22px',
              color: 'var(--bg-primary)', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 0 20px var(--shadow-accent)',
              transition: 'all 0.3s',
            }}
          >
            Termin buchen
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
            {theme === 'dark' ? '☀️' : '🌙'}
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
              style={{
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
          <button
            onClick={() => scrollTo('contact')}
            style={{
              display: 'block', width: '100%', marginTop: 16,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              border: 'none', borderRadius: 8, padding: '14px',
              color: 'var(--bg-primary)', fontWeight: 600, fontSize: 15,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              textAlign: 'center',
            }}
          >
            Termin buchen
          </button>
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
