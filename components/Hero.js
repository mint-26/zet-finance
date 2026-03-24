'use client';

import { useState, useEffect } from 'react';

export default function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 150); }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      background: 'var(--bg-primary)',
      transition: 'background 0.5s ease',
    }}>
      {/* Radial glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 50%, var(--accent-dim) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, var(--accent-dim) 0%, transparent 50%)',
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        opacity: 'var(--grid-opacity)',
        backgroundImage: 'linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }} />

      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '130px 24px 80px',
        position: 'relative', zIndex: 2, width: '100%',
      }}>
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent-dim)',
            border: '1px solid var(--border)',
            borderRadius: 100, padding: '6px 16px', marginBottom: 28,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--success)', animation: 'pulse 2s infinite',
            }} />
            <span style={{
              fontSize: 13, color: 'var(--accent)', fontWeight: 500,
            }}>
              Freie Termine verfügbar
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth: 700,
            transition: 'color 0.5s ease',
          }}>
            Deine Finanzen.{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Klar durchdacht.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            maxWidth: 520,
            marginBottom: 40,
            transition: 'color 0.5s ease',
          }}>
            Unabhängige Finanzberatung, die auf dich zugeschnitten ist.
            Kein Verkaufsdruck, keine versteckten Kosten. Nur ehrliche Empfehlungen.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => scrollTo('contact')}
              className="hero-cta-primary"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                border: 'none', borderRadius: 10, padding: '16px 36px',
                color: 'var(--bg-primary)', fontWeight: 700, fontSize: 16,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 4px 30px var(--shadow-accent)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Kostenloses Erstgespräch
            </button>
            <button
              onClick={() => scrollTo('services')}
              className="hero-cta-secondary"
              style={{
                background: 'transparent',
                border: '1px solid var(--border)', borderRadius: 10,
                padding: '16px 36px', color: 'var(--text-body)',
                fontWeight: 500, fontSize: 16, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'border-color 0.3s, color 0.3s',
              }}
            >
              Mehr erfahren ↓
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 24, marginTop: 80, maxWidth: 600,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s',
        }}>
          {[
            { num: '500+', label: 'Zufriedene Kunden' },
            { num: '7+', label: 'Jahre Erfahrung' },
            { num: '100%', label: 'Unabhängig' },
          ].map((s, i) => (
            <div key={i} style={{
              borderLeft: '2px solid var(--border)',
              paddingLeft: 16,
              transition: 'border-color 0.3s',
            }}>
              <div style={{
                fontSize: 28, fontWeight: 700, color: 'var(--accent)',
                transition: 'color 0.3s',
              }}>{s.num}</div>
              <div style={{
                fontSize: 13, color: 'var(--text-dim)', marginTop: 4,
                transition: 'color 0.3s',
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hero-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px var(--shadow-accent) !important;
        }
        .hero-cta-secondary:hover {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
        }
      `}</style>
    </section>
  );
}
