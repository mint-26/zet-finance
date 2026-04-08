'use client';

import { useState } from 'react';
import { useInView } from './useInView';

export default function Questionnaire() {
  const [ref, inView] = useInView(0.05);
  const [form, setForm] = useState({
    anrede: '', vorname: '', nachname: '', geburtsdatum: '',
    email: '', telefon: '', hatVersicherung: '', versicherer: '',
    zahnzustand: '', wichtig: [], nachricht: '', datenschutz: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const update = (key, val) => setForm({ ...form, [key]: val });

  const toggleWichtig = (val) => {
    const arr = form.wichtig.includes(val)
      ? form.wichtig.filter((v) => v !== val)
      : [...form.wichtig, val];
    update('wichtig', arr);
  };

  const canSubmit = form.anrede && form.vorname && form.nachname &&
    form.geburtsdatum && form.email && form.zahnzustand && form.datenschutz && !sending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    try {
      await fetch('https://formsubmit.co/ajax/marco.arpa@outlook.de', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: 'Neues Angebot angefragt: ' + form.vorname + ' ' + form.nachname,
          Anrede: form.anrede,
          Vorname: form.vorname,
          Nachname: form.nachname,
          Geburtsdatum: form.geburtsdatum,
          'E-Mail': form.email,
          Telefon: form.telefon || '\u2014',
          'Bestehende Versicherung': form.hatVersicherung === 'ja'
            ? 'Ja, bei ' + (form.versicherer || 'unbekannt')
            : 'Nein',
          Zahnzustand: form.zahnzustand,
          'Wichtige Bereiche': form.wichtig.length ? form.wichtig.join(', ') : '\u2014',
          Nachricht: form.nachricht || '\u2014',
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

  const labelStyle = {
    fontSize: 13, color: 'var(--text-muted)',
    display: 'block', marginBottom: 6,
  };

  if (submitted) {
    return (
      <section id="fragebogen" style={{
        padding: '100px 24px',
        background: 'var(--bg-secondary)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 500, margin: '0 auto', animation: 'fadeInUp 0.6s ease' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
            background: 'var(--accent-dim)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: 'var(--accent)',
          }}>{'\u2713'}</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32, color: 'var(--text-primary)', marginBottom: 12,
          }}>
            Anfrage gesendet!
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7,
          }}>
            Danke, {form.vorname}! Ich melde mich innerhalb von 24 Stunden mit Ihrem persönlichen Angebot.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="fragebogen" ref={ref} style={{
      padding: '100px 24px',
      background: 'var(--bg-secondary)',
      transition: 'background 0.5s ease',
    }}>
      <div style={{
        maxWidth: 680, margin: '0 auto',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: 'var(--accent)',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            Fragebogen
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700, color: 'var(--text-primary)',
            marginTop: 12, lineHeight: 1.2,
          }}>
            Ihr persönliches Angebot in 2 Minuten
          </h2>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20, padding: 36,
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            {/* Anrede */}
            <div>
              <label style={labelStyle}>Anrede *</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Herr', 'Frau', 'Divers'].map((a) => (
                  <button key={a} type="button" onClick={() => update('anrede', a)} style={{
                    flex: 1, padding: '12px 0',
                    background: form.anrede === a
                      ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
                      : 'var(--input-bg)',
                    border: `1px solid ${form.anrede === a ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 10,
                    color: form.anrede === a ? 'var(--bg-primary)' : 'var(--text-body)',
                    fontWeight: form.anrede === a ? 700 : 500,
                    fontSize: 14, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.3s',
                  }}>{a}</button>
                ))}
              </div>
            </div>

            {/* Vor- und Nachname */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Vorname *</label>
                <input style={inputStyle} value={form.vorname}
                  onChange={(e) => update('vorname', e.target.value)}
                  placeholder="Vorname" />
              </div>
              <div>
                <label style={labelStyle}>Nachname *</label>
                <input style={inputStyle} value={form.nachname}
                  onChange={(e) => update('nachname', e.target.value)}
                  placeholder="Nachname" />
              </div>
            </div>

            {/* Geburtsdatum */}
            <div>
              <label style={labelStyle}>Geburtsdatum *</label>
              <input style={inputStyle} type="date" value={form.geburtsdatum}
                onChange={(e) => update('geburtsdatum', e.target.value)} />
            </div>

            {/* E-Mail */}
            <div>
              <label style={labelStyle}>E-Mail *</label>
              <input style={inputStyle} type="email" value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="ihre@email.de" />
            </div>

            {/* Telefon */}
            <div>
              <label style={labelStyle}>Telefon (optional)</label>
              <input style={inputStyle} type="tel" value={form.telefon}
                onChange={(e) => update('telefon', e.target.value)}
                placeholder="+49 ..." />
            </div>

            {/* Bestehende Versicherung */}
            <div>
              <label style={labelStyle}>Haben Sie bereits eine Zahnzusatzversicherung? *</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ v: 'ja', l: 'Ja' }, { v: 'nein', l: 'Nein' }].map((o) => (
                  <button key={o.v} type="button" onClick={() => update('hatVersicherung', o.v)} style={{
                    flex: 1, padding: '12px 0',
                    background: form.hatVersicherung === o.v
                      ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
                      : 'var(--input-bg)',
                    border: `1px solid ${form.hatVersicherung === o.v ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 10,
                    color: form.hatVersicherung === o.v ? 'var(--bg-primary)' : 'var(--text-body)',
                    fontWeight: form.hatVersicherung === o.v ? 700 : 500,
                    fontSize: 14, cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'all 0.3s',
                  }}>{o.l}</button>
                ))}
              </div>
            </div>

            {/* Versicherer (conditional) */}
            {form.hatVersicherung === 'ja' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <label style={labelStyle}>Bei welcher Versicherung?</label>
                <input style={inputStyle} value={form.versicherer}
                  onChange={(e) => update('versicherer', e.target.value)}
                  placeholder="Name der Versicherung" />
              </div>
            )}

            {/* Zahnzustand */}
            <div>
              <label style={labelStyle}>Wie ist der aktuelle Zustand Ihrer Zähne? *</label>
              <select
                style={{
                  ...inputStyle, appearance: 'none', cursor: 'pointer',
                  backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%239ca3af\'%3e%3cpath d=\'M7 10l5 5 5-5z\'/%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '20px',
                  paddingRight: 40,
                }}
                value={form.zahnzustand}
                onChange={(e) => update('zahnzustand', e.target.value)}
              >
                <option value="" style={{ background: 'var(--select-option-bg)' }}>Bitte wählen...</option>
                <option value="Sehr gut - keine Probleme" style={{ background: 'var(--select-option-bg)' }}>Sehr gut - keine Probleme</option>
                <option value="Gut - kleinere Füllungen" style={{ background: 'var(--select-option-bg)' }}>Gut - kleinere Füllungen</option>
                <option value="Mittel - Kronen oder Brücken vorhanden" style={{ background: 'var(--select-option-bg)' }}>Mittel - Kronen oder Brücken vorhanden</option>
                <option value="Behandlung geplant oder empfohlen" style={{ background: 'var(--select-option-bg)' }}>Behandlung geplant oder empfohlen</option>
              </select>
            </div>

            {/* Was ist Ihnen wichtig - Checkboxes */}
            <div>
              <label style={labelStyle}>Was ist Ihnen besonders wichtig? (Mehrfachauswahl)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Zahnersatz (Kronen, Brücken, Implantate)',
                  'Professionelle Zahnreinigung',
                  'Kieferorthopädie',
                  'Günstiger Beitrag',
                  'Hohe Erstattung',
                ].map((option) => (
                  <label key={option} onClick={() => toggleWichtig(option)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    background: form.wichtig.includes(option) ? 'var(--accent-dim)' : 'var(--input-bg)',
                    border: `1px solid ${form.wichtig.includes(option) ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${form.wichtig.includes(option) ? 'var(--accent)' : 'var(--border)'}`,
                      background: form.wichtig.includes(option)
                        ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
                        : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.3s',
                    }}>
                      {form.wichtig.includes(option) && (
                        <span style={{ color: 'var(--bg-primary)', fontSize: 12, fontWeight: 700 }}>{'\u2713'}</span>
                      )}
                    </div>
                    <span style={{
                      fontSize: 14,
                      color: form.wichtig.includes(option) ? 'var(--accent)' : 'var(--text-body)',
                      fontWeight: form.wichtig.includes(option) ? 600 : 400,
                    }}>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nachricht */}
            <div>
              <label style={labelStyle}>Nachricht an Marco (optional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                value={form.nachricht}
                onChange={(e) => update('nachricht', e.target.value)}
                placeholder="Gibt es etwas, das ich wissen sollte?"
              />
            </div>

            {/* Datenschutz */}
            <label onClick={() => update('datenschutz', !form.datenschutz)} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              cursor: 'pointer', padding: '8px 0',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 2,
                border: `2px solid ${form.datenschutz ? 'var(--accent)' : 'var(--border)'}`,
                background: form.datenschutz
                  ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
                  : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                {form.datenschutz && (
                  <span style={{ color: 'var(--bg-primary)', fontSize: 12, fontWeight: 700 }}>{'\u2713'}</span>
                )}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Ich stimme der Verarbeitung meiner Daten gemäß der Datenschutzerklärung zu. *
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: '100%', padding: '16px',
                background: canSubmit
                  ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
                  : 'var(--text-dim)',
                border: 'none', borderRadius: 10,
                color: canSubmit ? 'var(--bg-primary)' : 'var(--text-muted)',
                fontWeight: 700, fontSize: 16,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.3s',
                boxShadow: canSubmit ? '0 4px 30px var(--shadow-accent)' : 'none',
                marginTop: 8,
              }}
            >
              {sending ? 'Wird gesendet...' : 'Angebot anfordern'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
