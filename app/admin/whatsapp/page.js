'use client';

import { useState, useRef, useEffect } from 'react';
import { ThemeProvider } from '../../../components/ThemeProvider';
import { WHATSAPP_TRIGGER_TEXT } from '../../../lib/whatsapp/link';

// Preview numbers start with 49000 (no real German number does), see /api/whatsapp/simulate.
const newPreviewNumber = () => '49000' + String(Math.floor(Math.random() * 1e7)).padStart(7, '0');

function BotPreview() {
  // Set after mount, a random initial value would differ between server and browser.
  const [waId, setWaId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [openList, setOpenList] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { setWaId(newPreviewNumber()); }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, openList]);

  const send = async (input, shown) => {
    if (busy) return;
    setBusy(true);
    setError('');
    setOpenList(null);
    setMessages((prev) => [...prev, { from: 'lead', text: shown ?? input.text }]);
    try {
      const res = await fetch('/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waId, ...input }),
      });
      if (res.status === 401) {
        setError('Bitte zuerst im Admin anmelden.');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler');
        return;
      }
      const bot = data.replies.map((r) => ({ from: 'bot', ...r }));
      if (!bot.length) bot.push({ from: 'system', text: 'Keine Antwort: Der Bot schweigt hier, Marco antwortet selbst.' });
      if (data.submissionId) bot.push({ from: 'system', text: `Im CRM gespeichert (Eintrag ${data.submissionId}, Quelle „WhatsApp (Test)“).` });
      setMessages((prev) => [...prev, ...bot]);
    } catch (err) {
      setError(err?.message || 'Netzwerkfehler');
    } finally {
      setBusy(false);
    }
  };

  const submitText = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText('');
    send({ text: t });
  };

  const restart = () => {
    setWaId(newPreviewNumber());
    setMessages([]);
    setError('');
    setOpenList(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-body)', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <a href="/admin" style={{ fontSize: 14, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>← Zurück zum CRM</a>
          <button onClick={restart} style={ghostBtn}>Neuer Test</button>
        </div>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 160px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(24px, 3vw, 32px)', color: 'var(--text-primary)', margin: 0 }}>
          WhatsApp-Bot: Vorschau
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 8 }}>
          Derselbe Dialog wie in WhatsApp, nur ohne WhatsApp. Abgeschlossene Tests landen im CRM mit der Quelle
          „WhatsApp (Test)“ und lösen keine Mail aus. Testnummer: +{waId}
        </p>

        <div style={{
          marginTop: 24, padding: 16, borderRadius: 16, minHeight: 320,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>
              Ein Lead tippt auf der Website auf „Per WhatsApp schreiben“. WhatsApp öffnet sich mit diesem Text:
              <div style={{ margin: '12px 0 20px', fontStyle: 'italic', color: 'var(--text-body)' }}>„{WHATSAPP_TRIGGER_TEXT}“</div>
              <button onClick={() => send({ text: WHATSAPP_TRIGGER_TEXT })} disabled={busy} style={primaryBtn}>
                Chat über den Website-Link starten
              </button>
            </div>
          )}

          {messages.map((m, i) => (
            <Bubble key={i} m={m} index={i} openList={openList} setOpenList={setOpenList} onAnswer={send} busy={busy} />
          ))}
          {busy && <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Bot schreibt…</div>}
          <div ref={endRef} />
        </div>

        {error && <div style={{ marginTop: 12, color: '#dc3c3c', fontSize: 14 }}>{error}</div>}
      </main>

      <form onSubmit={submitText} style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', padding: '14px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 10 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nachricht schreiben"
            aria-label="Nachricht"
            style={{
              flex: 1, minWidth: 0, padding: '12px 16px', borderRadius: 999,
              background: 'var(--input-bg)', border: '1px solid var(--border)',
              color: 'var(--text-body)', fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none',
            }}
          />
          <button type="submit" disabled={busy || !text.trim()} style={{ ...primaryBtn, opacity: busy || !text.trim() ? 0.5 : 1 }}>Senden</button>
        </div>
      </form>
    </div>
  );
}

function Bubble({ m, index, openList, setOpenList, onAnswer, busy }) {
  if (m.from === 'system') {
    return <div style={{ alignSelf: 'center', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '4px 8px' }}>{m.text}</div>;
  }
  const lead = m.from === 'lead';
  return (
    <div style={{ alignSelf: lead ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        background: lead ? 'var(--accent-dim)' : 'var(--bg-card)',
        border: `1px solid ${lead ? 'var(--accent)' : 'var(--border)'}`,
        color: 'var(--text-body)',
      }}>
        <WaText text={m.text} />
      </div>
      {m.buttons && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {m.buttons.map((b) => (
            <button key={b.id} disabled={busy} onClick={() => onAnswer({ text: b.title, id: b.id })} style={choiceBtn}>{b.title}</button>
          ))}
        </div>
      )}
      {m.list && (
        <>
          <button disabled={busy} onClick={() => setOpenList(openList === index ? null : index)} style={choiceBtn}>
            ☰ Antwort wählen
          </button>
          {openList === index && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 8, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {m.list.map((r) => (
                <button key={r.id} disabled={busy} onClick={() => onAnswer({ text: r.title, id: r.id })} style={{ ...choiceBtn, textAlign: 'left' }}>
                  {r.title}
                  {r.description && <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>{r.description}</span>}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// WhatsApp formatting: *bold*.
function WaText({ text }) {
  return text.split(/(\*[^*\n]+\*)/g).map((part, i) => (
    /^\*[^*\n]+\*$/.test(part) ? <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(1, -1)}</strong> : part
  ));
}

const choiceBtn = {
  padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  color: 'var(--accent)', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
};

const primaryBtn = {
  padding: '12px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
  color: 'var(--bg-primary)', fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
};

const ghostBtn = {
  padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8,
  color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
};

export default function WhatsAppPreviewPage() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="marco-admin-theme">
      <BotPreview />
    </ThemeProvider>
  );
}
