'use client';

import { useState } from 'react';
import { useInView } from './useInView';

export default function Contact() {
  const [ref, inView] = useInView();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', message: '', service: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || sending) return;
    setSending(true);
    try {
      await fetch('https://formsubmit.co/ajax/marco.arpa@outlook.de', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'Neue Kontaktanfrage von ' + form.name,
          Name: form.name,
          'E-Mail': form.email,
          Telefon: form.phone || '—',
          Bereich: form.service || '—',
          Nachricht: form.message || '—',
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSending(false);
    }
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
            Danke, {form.name}. Ich melde mich innerhalb von 24 Stunden bei Ihnen.
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
            Lassen Sie uns sprechen
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--text-muted)',
            lineHeight: 1.7, marginBottom: 40,
          }}>
            Das Erstgespräch ist kostenlos und unverbindlich.
            Schreiben Sie mir, und ich melde mich innerhalb von 24 Stunden.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>, label: 'E-Mail', value: 'marco.arpa@outlook.de' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>, label: 'Telefon', value: '+49 152 5461 1314' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Standort', value: 'Frankfurt am Main' },
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle',marginRight:6}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Datenschutz-Garantie
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Ihre Daten werden vertraulich behandelt und niemals an Dritte weitergegeben.
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
                    placeholder="Ihr Name"
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
                    placeholder="ihre@email.de"
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
                    placeholder="Erzählen Sie mir kurz, was Sie bewegt..."
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!form.name || !form.email || sending}
                  style={{
                    width: '100%', padding: '16px',
                    background: (!form.name || !form.email || sending)
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
                  {sending ? 'Wird gesendet...' : 'Nachricht senden'}
                </button>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
