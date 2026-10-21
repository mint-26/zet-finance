'use client';

import { useState, useEffect } from 'react';
import { Arrow, Mail, Phone } from './Icons';
import { C, SERIF, SANS, CONTACT } from '../../lib/brand';

const TOPICS = ['Privat', 'Unternehmen', 'Zahnzusatz', 'Sonstiges'];

const EMPTY = { name: '', email: '', phone: '', service: '', message: '' };

function ContactButton({ href, icon, children }) {
  return (
    <a href={href} className="contact-btn" style={{
      display: 'flex', alignItems: 'center', gap: 14, minHeight: 60, padding: '0 22px',
      background: C.ivory, color: C.black, textDecoration: 'none', fontSize: 16,
    }}>
      {icon}
      <span style={{ flex: 1 }}>{children}</span>
      <Arrow size={11} />
    </a>
  );
}

function Field({ id, label, required, children }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, color: C.grey, marginBottom: 8 }}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
    </div>
  );
}

// Contact form posting to /api/contact (mail via Resend, see lib/notify.js).
export default function ContactSection() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const sending = status === 'sending';

  // The request must finish for the mail to go out; warn before closing the tab.
  useEffect(() => {
    if (!sending) return undefined;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; return ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [sending]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || sending) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="kontakt" aria-labelledby="kontakt-title" style={{ background: C.black, borderTop: `1px solid ${C.lineDark}` }}>
      <div className="cf-grid" style={{
        maxWidth: 1120, margin: '0 auto', padding: 'clamp(64px, 8vw, 104px) clamp(20px, 5vw, 56px)',
      }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.champagne, margin: 0 }}>Kontakt</p>
          <h2 id="kontakt-title" style={{
            fontFamily: SERIF, fontWeight: 400, color: C.ivory, margin: '24px 0 0',
            fontSize: 'clamp(34px, 4.2vw, 48px)', lineHeight: 1.12,
          }}>
            Lassen Sie uns sprechen.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: C.grey, margin: '20px 0 32px', maxWidth: 400 }}>
            Das Erstgespräch ist kostenlos und unverbindlich. Schreiben Sie mir oder rufen Sie an, ich melde mich persönlich bei Ihnen.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 340 }}>
            <ContactButton href={`mailto:${CONTACT.email}`} icon={<Mail />}>{CONTACT.email}</ContactButton>
            <ContactButton href={CONTACT.phoneHref} icon={<Phone />}>{CONTACT.phone}</ContactButton>
          </div>
          <p style={{ fontSize: 13, color: C.grey, margin: '20px 0 0' }}>Rhein-Main, Beratung deutschlandweit</p>
        </div>

        <div>
          {status === 'sent' ? (
            <div role="status" style={{ borderTop: `1px solid ${C.champagne}`, paddingTop: 28 }}>
              <p style={{ fontFamily: SERIF, fontSize: 28, color: C.ivory, margin: 0 }}>Vielen Dank für Ihre Anfrage.</p>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: C.grey, margin: '14px 0 0' }}>
                Danke, {form.name}. Ich melde mich persönlich bei Ihnen.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="cf-row">
                <Field id="cf-name" label="Name" required>
                  <input id="cf-name" className="cf-input" required autoComplete="name" value={form.name} onChange={set('name')} placeholder="Ihr Name" />
                </Field>
                <Field id="cf-email" label="E-Mail" required>
                  <input id="cf-email" className="cf-input" type="email" required autoComplete="email" value={form.email} onChange={set('email')} placeholder="ihre@email.de" />
                </Field>
              </div>
              <div className="cf-row">
                <Field id="cf-phone" label="Telefon">
                  <input id="cf-phone" className="cf-input" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="+49 ..." />
                </Field>
                <Field id="cf-service" label="Thema">
                  <select id="cf-service" className="cf-input" value={form.service} onChange={set('service')}>
                    <option value="">Bitte wählen</option>
                    {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
              <Field id="cf-message" label="Nachricht">
                <textarea
                  id="cf-message" className="cf-input" rows={4} value={form.message} onChange={set('message')}
                  placeholder="Worum geht es Ihnen?" style={{ resize: 'vertical' }}
                />
              </Field>

              {status === 'error' && (
                <p role="alert" style={{ fontSize: 14, lineHeight: 1.6, color: C.ivory, margin: 0, borderLeft: `2px solid ${C.champagne}`, paddingLeft: 12 }}>
                  Ihre Nachricht konnte gerade nicht gesendet werden. Bitte versuchen Sie es noch einmal oder schreiben Sie direkt an{' '}
                  <a href={`mailto:${CONTACT.email}`} style={{ color: C.ivory }}>{CONTACT.email}</a>.
                </p>
              )}

              <button
                type="submit" disabled={sending} className="cf-submit"
                style={{
                  minHeight: 56, border: 'none', cursor: sending ? 'wait' : 'pointer',
                  background: C.ivory, color: C.black, fontFamily: SANS, fontSize: 15,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  opacity: sending ? 0.7 : 1,
                }}
              >
                {sending ? 'Wird gesendet …' : <>Nachricht senden <Arrow size={11} /></>}
              </button>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: C.grey, margin: 0 }}>
                Felder mit * sind Pflichtfelder. Ihre Angaben verwende ich nur zur Bearbeitung Ihrer Anfrage. Mehr dazu in der{' '}
                <a href="/datenschutz" style={{ color: C.grey }}>Datenschutzerklärung</a>.
              </p>
            </form>
          )}
        </div>
      </div>

      <style jsx global>{`
        .cf-grid { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: 32px clamp(40px, 6vw, 88px); align-items: start; }
        .cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .cf-input {
          width: 100%; box-sizing: border-box; padding: 14px 16px; border-radius: 0;
          background: rgba(241,238,230,0.06); border: 1px solid rgba(241,238,230,0.22);
          color: ${C.ivory}; font-family: ${SANS}; font-size: 16px;
          transition: border-color 0.2s ease;
        }
        .cf-input::placeholder { color: rgba(241,238,230,0.38); }
        .cf-input:focus { outline: none; border-color: ${C.champagne}; box-shadow: 0 0 0 1px ${C.champagne}; }
        .cf-input option { background: ${C.black}; color: ${C.ivory}; }
        .cf-submit:hover:not(:disabled), .contact-btn:hover { background: #ffffff !important; }
        .contact-btn, .cf-submit { transition: background 0.2s ease; }
        @media (max-width: 860px) {
          .cf-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 520px) {
          .cf-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
