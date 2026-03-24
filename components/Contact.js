'use client';

import { useState } from 'react';
import { useInView } from './useInView';

export default function Contact() {
  const [ref, inView] = useInView();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', message: '', service: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState('form'); // 'form' or 'booking'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    setSubmitted(true);
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    background: 'var(--input-bg)',
    border: '1px solid var(--border)', borderRadius: 10,
    color: 'var(--text-body)', fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  };

  if (submitted) {
    return (
      <section id="contact" style={{
        padding: '100px 24px',
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 500, margin: '0 auto', animation: 'fadeInUp 0.6s ease' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
            background: 'var(--accent-dim)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: 'var(--accent)',
          }}>✓</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32, color: 'var(--text-primary)', marginBottom: 12,
          }}>
            Anfrage gesendet!
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7,
          }}>
            Danke, {form.name}. Ich melde mich innerhalb von 24 Stunden bei dir.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" ref={ref} style={{
      padding: '100px 24px',
      background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
      transition: 'background 0.5s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 60,
      }}>
        {/* Left: Info */}
        <div style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0)' : 'translateX(-20px)',
          transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--accent)',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            Kontakt
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700, color: 'var(--text-primary)',
            marginTop: 12, marginBottom: 20, lineHeight: 1.2,
          }}>
            Lass uns sprechen
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--text-muted)',
            lineHeight: 1.7, marginBottom: 40,
          }}>
            Das Erstgespräch ist kostenlos und unverbindlich.
            Schreib mir, und ich melde mich innerhalb von 24 Stunden.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { icon: '📧', label: 'E-Mail', value: 'marco.arpa@outlook.de' },
              { icon: '📱', label: 'Telefon', value: '+49 123 456 7890' },
              { icon: '📍', label: 'Standort', value: 'Frankfurt am Main' },
            ].map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{c.label}</div>
                  <div style={{
                    fontSize: 15, color: 'var(--text-body)', fontWeight: 500,
                  }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{
            marginTop: 40, padding: '20px 24px',
            background: 'var(--accent-dim)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--accent)',
              marginBottom: 8,
            }}>
              🔒 Datenschutz-Garantie
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Deine Daten werden vertraulich behandelt und niemals an Dritte weitergegeben.
              DSGVO-konform.
            </p>
          </div>
        </div>

        {/* Right: Form / Booking */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20, overflow: 'hidden',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateX(0)' : 'translateX(20px)',
          transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s',
        }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)',
          }}>
            {[
              { id: 'form', label: '✉️  Nachricht' },
              { id: 'booking', label: '📅  Termin buchen' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1, padding: '16px', border: 'none',
                  background: tab === t.id ? 'var(--accent-dim)' : 'transparent',
                  color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.3s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'form' ? (
            <div style={{ padding: 36 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{
                    fontSize: 13, color: 'var(--text-muted)',
                    display: 'block', marginBottom: 6,
                  }}>Name *</label>
                  <input
                    style={inputStyle}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Dein Name"
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: 13, color: 'var(--text-muted)',
                    display: 'block', marginBottom: 6,
                  }}>E-Mail *</label>
                  <input
                    style={inputStyle}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="deine@email.de"
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: 13, color: 'var(--text-muted)',
                    display: 'block', marginBottom: 6,
                  }}>Telefon</label>
                  <input
                    style={inputStyle}
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+49 ..."
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: 13, color: 'var(--text-muted)',
                    display: 'block', marginBottom: 6,
                  }}>Wobei kann ich helfen?</label>
                  <select
                    style={{
                      ...inputStyle, appearance: 'none', cursor: 'pointer',
                      backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%239ca3af\'%3e%3cpath d=\'M7 10l5 5 5-5z\'/%3e%3c/svg%3e")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '20px',
                      paddingRight: 40,
                    }}
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                  >
                    <option value="" style={{ background: 'var(--select-option-bg)' }}>Bitte wählen...</option>
                    <option value="vorsorge" style={{ background: 'var(--select-option-bg)' }}>Altersvorsorge</option>
                    <option value="versicherung" style={{ background: 'var(--select-option-bg)' }}>Versicherungen</option>
                    <option value="geldanlage" style={{ background: 'var(--select-option-bg)' }}>Geldanlage</option>
                    <option value="immobilien" style={{ background: 'var(--select-option-bg)' }}>Immobilienfinanzierung</option>
                    <option value="sonstiges" style={{ background: 'var(--select-option-bg)' }}>Sonstiges</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    fontSize: 13, color: 'var(--text-muted)',
                    display: 'block', marginBottom: 6,
                  }}>Nachricht</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Erzähl mir kurz, was dich bewegt..."
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!form.name || !form.email}
                  style={{
                    width: '100%', padding: '16px',
                    background: (!form.name || !form.email)
                      ? 'var(--text-dim)'
                      : 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                    border: 'none', borderRadius: 10,
                    color: (!form.name || !form.email) ? 'var(--text-muted)' : 'var(--bg-primary)',
                    fontWeight: 700, fontSize: 16,
                    cursor: (!form.name || !form.email) ? 'not-allowed' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.3s',
                    boxShadow: (!form.name || !form.email) ? 'none' : '0 4px 30px var(--shadow-accent)',
                    marginTop: 8,
                  }}
                >
                  Nachricht senden
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: 36 }}>
              {/* Calendly Integration Placeholder */}
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, margin: '0 auto 20px',
                }}>📅</div>
                <h3 style={{
                  fontSize: 20, fontWeight: 600, color: 'var(--text-primary)',
                  marginBottom: 12,
                  fontFamily: "'Playfair Display', serif",
                }}>
                  Termin direkt buchen
                </h3>
                <p style={{
                  fontSize: 14, color: 'var(--text-muted)',
                  lineHeight: 1.7, marginBottom: 28, maxWidth: 360, margin: '0 auto 28px',
                }}>
                  Wähle einen passenden Zeitpunkt für dein kostenloses
                  30-minütiges Erstgespräch.
                </p>

                {/*
                  CALENDLY INTEGRATION:
                  Ersetze den Button unten mit dem Calendly-Widget:

                  1. Installiere: npm install react-calendly
                  2. Importiere: import { InlineWidget } from 'react-calendly'
                  3. Ersetze den Button mit:
                     <InlineWidget
                       url="https://calendly.com/DEIN-CALENDLY-LINK"
                       styles={{ height: '600px', width: '100%' }}
                     />

                  Oder nutze den einfachen Embed-Link direkt.
                */}
                <a
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '16px 40px',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                    color: 'var(--bg-primary)',
                    fontWeight: 700, fontSize: 16, borderRadius: 10,
                    textDecoration: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: '0 4px 30px var(--shadow-accent)',
                    transition: 'transform 0.2s',
                  }}
                >
                  Zu Calendly →
                </a>

                <div style={{
                  marginTop: 32, padding: '16px 20px',
                  background: 'var(--accent-dim)',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                }}>
                  <div style={{
                    fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6,
                  }}>
                    <strong style={{ color: 'var(--accent)' }}>Tipp:</strong>{' '}
                    Wenn du dir nicht sicher bist, welche Beratung du brauchst,
                    schreib mir einfach eine Nachricht. Wir finden das gemeinsam raus.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
