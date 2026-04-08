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
        <div className="hero-layout" style={{
          display: 'flex', alignItems: 'center', gap: 48,
        }}>
          <div style={{
            flex: 1,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 6vw, 72px)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: 32,
              maxWidth: 700,
              transition: 'color 0.5s ease',
            }}>
              <span style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Damit die Rechnung
              </span><br />
              nicht wehtut.
            </h1>

            <div style={{
              maxWidth: 640,
              marginBottom: 40,
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <p style={{ fontSize: 'clamp(15px, 1.8vw, 17px)', lineHeight: 1.7 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'block' }}>Was kostet meine Beratung?</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Nichts.</span>
              </p>
              <p style={{ fontSize: 'clamp(15px, 1.8vw, 17px)', lineHeight: 1.7 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'block' }}>Für wen arbeite ich?</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Für Sie. Nicht für eine Versicherung.</span>
              </p>
              <p style={{ fontSize: 'clamp(15px, 1.8vw, 17px)', lineHeight: 1.7 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'block' }}>Und dann?</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 400 }}>Einmal im Jahr checke ich, ob Ihr Tarif noch der beste ist. Wenn nicht, wechseln wir. Ohne Papierkram für Sie.</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => scrollTo('fragebogen')}
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
                Jetzt Angebot anfordern
              </button>
              <button
                onClick={() => scrollTo('process')}
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
                So läuft&apos;s ↓
              </button>
            </div>
          </div>

          {/* Logo rechts */}
          <div className="hero-logo" style={{
            flexShrink: 0,
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.9)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}>
            <img
              src="/marco.jpg"
              alt="Marco Arpa"
              style={{
                width: 320, height: 320,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--border-strong)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 80px var(--accent-dim)',
              }}
            />
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
        @media (max-width: 900px) {
          .hero-layout {
            flex-direction: column-reverse !important;
            text-align: center;
            align-items: center !important;
          }
          .hero-layout > div:first-child {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-logo img {
            width: 200px !important;
            height: 200px !important;
          }
        }
      `}</style>
    </section>
  );
}
