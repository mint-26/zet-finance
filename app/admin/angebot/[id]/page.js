'use client';

// Offer for one lead: three tariffs side by side, in Marco's brand (black, ivory, champagne,
// Georgia). Opened from the CRM ("Angebot erstellen"); the choice comes in the URL:
// t=Gesellschaft|Tarif|Spaltenname (three times), e=index of the recommended column, g=1 names the
// insurer under the column name. Marco's rule: no insurer or tariff names by default, the
// customer only sees his column names; the partner logos sit at the very end.
// "PDF herunterladen" gets the PDF from app/api/angebot/[id], where Chrome renders this page with
// its print styles (A4, vector, a few hundred KB, so it opens on a phone via WhatsApp), and files
// it with the lead's documents.

import { Fragment, useEffect, useState } from 'react';
import { berechneBeitrag, beitragsVerlauf, geburtsjahr, euro } from '../../../../lib/tarife';
import { SECTIONS, leistungenVon, begrenzungText, kurzfakten, LEISTUNGEN_STAND, BEWERTUNG_QUELLE } from '../../../../lib/leistungen';
import { C, CONTACT } from '../../../../lib/brand';
import { formatBirthdate } from '../../../../lib/format';
import { angebotMail } from '../../../../lib/angebotMail';

// Gelasio and Arimo, the free, metric-compatible twins of the brand fonts Georgia and Arial, loaded
// below from Google Fonts. Used on screen too, so the page looks exactly like the PDF that Chrome
// renders on the server (Linux, where Georgia and Arial do not exist).
const SERIF = "Gelasio, Georgia, 'Times New Roman', serif";
const SANS = 'Arimo, Arial, Helvetica, sans-serif';
const INK = '#141414';
const MUTED = '#6b665e';
const LINE = 'rgba(9,9,9,0.10)';
const TINT = '#F8F5EE';
const OK = '#2F6B45';
const NO = '#A8473A';
// Chart: the recommended tariff in brand gold, the other two in a deep blue and a teal. The three
// lie far apart in lightness (about 35 / 58 / 67), so they stay apart with colour blindness and in
// greyscale print too.
const GOLD = '#B5A171';
const ANDERE = ['#1F4E8C', '#2E9C8A'];
function farbenFuer(anzahl, empfohlen) {
  const hero = empfohlen >= 0 && empfohlen < anzahl ? empfohlen : anzahl - 1;
  let n = 0;
  return Array.from({ length: anzahl }, (_, i) => (i === hero ? GOLD : ANDERE[n++ % ANDERE.length]));
}
const PARTNER = [
  ['Allianz', 'allianz'], ['AXA', 'axa'], ['Münchener Verein', 'muenchener-verein'], ['Württembergische', 'wuerttembergische'],
  ['BBKK', 'bbkk'], ['Barmenia Gothaer', 'barmenia'], ['DKV', 'dkv'], ['Nürnberger', 'nuernberger'],
  ['SIGNAL IDUNA', 'signal-iduna'], ['SDK', 'sdk'], ['HanseMerkur', 'hansemerkur'], ['uniVersa', 'universa'],
];

const dateDe = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const preis = (n) => euro(n).replace(/\s€$/, ' €');

function parseAuswahl(params) {
  return params.getAll('t').slice(0, 3).map((v) => {
    const [gesellschaft, tarif, label] = v.split('|');
    return { gesellschaft, tarif, label: label || tarif };
  });
}

function Icon({ s, size = 14 }) {
  if (s === 'ja') {
    return <svg aria-label="enthalten" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={OK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="4 12.5 9.5 18 20 6.5" /></svg>;
  }
  if (s === 'nein') {
    return <svg aria-label="nicht enthalten" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={NO} strokeWidth="2.4" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>;
  }
  return null;
}

const STERN = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z';

function Sterne({ wert, hell }) {
  const voll = Math.round(wert);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: hell ? 'rgba(241,238,230,0.75)' : MUTED }}>
      <span aria-hidden="true" style={{ display: 'inline-flex', gap: 2 }}>
        {[0, 1, 2, 3, 4].map((i) => <svg key={i} width="12" height="12" viewBox="0 0 24 24"><path d={STERN} fill={C.champagne} opacity={i < voll ? 1 : 0.3} /></svg>)}
      </span>
      {wert.toLocaleString('de-DE')} / 5 Kundenbewertung
    </div>
  );
}

function Wert({ wert, beginn }) {
  if (!wert) return <span style={{ color: '#a29c92', fontStyle: 'italic' }}>Angaben folgen</span>;
  if (wert.staffel) return <span style={{ whiteSpace: 'pre-line' }}>{begrenzungText(wert, beginn)}</span>;
  if ((!wert.t || wert.t.trim() === '-') && !wert.s) return <span style={{ color: '#b9b3a8' }}>–</span>;
  return (
    <span style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: (wert.t || '').length > 70 ? 11.5 : undefined, color: (wert.t || '').length > 70 ? '#45413b' : undefined }}>
      <Icon s={wert.s} />
      <span style={{ whiteSpace: 'pre-line' }}>{wert.t || (wert.s === 'ja' ? 'Enthalten' : '')}</span>
    </span>
  );
}

// Step chart of the monthly premium by age, from today's age to 80, one line per tariff.
function Verlauf({ reihen }) {
  const W = 680; const H = 215; const L = 48; const R = 16; const T = 14; const B = 36;
  const alle = reihen.flatMap((r) => r.punkte);
  if (!alle.length) return <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Für diese Tarife ist keine Beitragstabelle hinterlegt.</p>;
  const minAlter = Math.min(...alle.map((p) => p.abAlter));
  const maxAlter = Math.max(80, minAlter + 10);
  const schritt = Math.max(...alle.map((p) => p.beitrag)) > 100 ? 40 : 20;
  const maxBeitrag = Math.ceil(Math.max(...alle.map((p) => p.beitrag)) / schritt) * schritt || schritt;
  const x = (a) => L + ((a - minAlter) / (maxAlter - minAlter)) * (W - L - R);
  const y = (b) => T + (1 - b / maxBeitrag) * (H - T - B);
  const ticksY = Array.from({ length: maxBeitrag / schritt + 1 }, (_, i) => i * schritt);
  const ticksX = [];
  for (let a = Math.ceil(minAlter / 10) * 10; a <= maxAlter; a += 10) ticksX.push(a);
  if (ticksX[0] - minAlter >= 4) ticksX.unshift(minAlter);
  const pfad = (punkte) => punkte.map((p, i) => {
    const bis = i + 1 < punkte.length ? punkte[i + 1].abAlter : maxAlter;
    return `${i === 0 ? `M ${x(p.abAlter)} ${y(p.beitrag)}` : `V ${y(p.beitrag)}`} H ${x(bis)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Monatsbeitrag nach Alter" style={{ display: 'block', fontFamily: SANS }}>
      {ticksY.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={v === 0 ? 'rgba(9,9,9,0.25)' : 'rgba(9,9,9,0.07)'} />
          <text x={L - 8} y={y(v) + 4} fontSize="10.5" textAnchor="end" fill={MUTED}>{v} €</text>
        </g>
      ))}
      {ticksX.map((a) => <text key={a} x={x(a)} y={H - B + 18} fontSize="10.5" textAnchor="middle" fill={MUTED}>{a}</text>)}
      <text x={W - R} y={H - 4} fontSize="10.5" textAnchor="end" fill={MUTED}>Alter in Jahren</text>
      {[...reihen].sort((a, b) => Number(a.farbe === GOLD) - Number(b.farbe === GOLD)).map((r) => r.punkte.length > 0 && (
        <path key={r.label} d={pfad(r.punkte)} fill="none" stroke={r.farbe} strokeWidth={r.farbe === GOLD ? 3 : 2.25} strokeLinejoin="round">
          <title>{`${r.label}: ${r.punkte.map((p) => `ab ${p.abAlter}: ${euro(p.beitrag)}`).join(', ')}`}</title>
        </path>
      ))}
    </svg>
  );
}

// A row nobody fills (e.g. "Besonderheiten Erstattung" without any) is left out.
const istLeer = (v) => !v || (!v.s && !v.staffel && (!v.t || v.t.trim() === '-'));
const leer = (spalten, key) => spalten.every((s) => s.leistungen && istLeer(s.leistungen[key]));

// Rows where all tariffs say the same are merged into one line ("Bei allen Tarifen: 100 %"), so
// only the differences take space.
function zeilenVon(sec, spalten) {
  const rows = sec.rows.filter(([key]) => !leer(spalten, key));
  if (spalten.length < 2 || spalten.some((s) => !s.leistungen)) return rows.map(([key, text, sub]) => ({ key, text, sub }));
  const out = [];
  const gruppen = new Map();
  rows.forEach(([key, text, sub]) => {
    const vals = spalten.map((s) => s.leistungen[key]);
    const gleich = vals.every((v) => v && !v.staffel && v.s === vals[0].s && (v.t || '') === (vals[0].t || ''));
    if (!gleich) { out.push({ key, text, sub }); return; }
    const sig = `${vals[0].s}|${vals[0].t || ''}`;
    if (gruppen.has(sig)) { gruppen.get(sig).texte.push(text); return; }
    const g = { key, texte: [text], gemeinsam: vals[0] };
    gruppen.set(sig, g);
    out.push(g);
  });
  return out;
}

const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '4915254611314').replace(/\D/g, '');

const kicker = { fontFamily: SANS, fontSize: 11.5, fontWeight: 700, letterSpacing: 2.4, textTransform: 'uppercase', color: C.champagneDark, marginBottom: 8 };
const h2 = { fontFamily: SERIF, fontWeight: 400, fontSize: 31, lineHeight: 1.2, color: INK, margin: '0 0 16px', paddingBottom: 12, borderBottom: `2px solid ${C.champagne}` };

export default function AngebotPage({ params }) {
  const [lead, setLead] = useState(null);
  const [state, setState] = useState('laden');
  const [auswahl, setAuswahl] = useState([]);
  const [empfohlen, setEmpfohlen] = useState(-1);
  const [mitGesellschaft, setMitGesellschaft] = useState(false);
  const [notiz, setNotiz] = useState('');
  const [statusGesetzt, setStatusGesetzt] = useState(false);
  const [pdfState, setPdfState] = useState('');
  const [mail, setMail] = useState(null); // open e-mail draft { an, betreff, text, state, fehler }

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setAuswahl(parseAuswahl(p));
    setEmpfohlen(p.has('e') ? Number(p.get('e')) : -1);
    setMitGesellschaft(p.get('g') === '1');
    setNotiz((p.get('n') || '').slice(0, 600));
    fetch('/api/submissions').then(async (res) => {
      if (res.status === 401) { setState('login'); return; }
      const data = await res.json();
      const found = (data.submissions || []).find((s) => String(s.id) === String(params.id));
      setLead(found || null);
      setState(found ? 'ok' : 'fehlt');
    }).catch(() => setState('fehler'));
  }, [params.id]);

  useEffect(() => {
    if (lead) document.title = `Zahnzusatz-Vergleich ${lead.name || ''}`.trim();
  }, [lead]);

  if (state !== 'ok') {
    const text = { laden: 'Lade Angebot …', login: 'Bitte zuerst im CRM anmelden.', fehlt: 'Diesen Kunden gibt es nicht.', fehler: 'Das Angebot konnte nicht geladen werden.' }[state];
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, background: C.ivory, color: INK, padding: 24 }}>
        <p>{text} {state !== 'laden' && <a href="/admin" style={{ color: C.champagneDark }}>Zum CRM</a>}</p>
      </main>
    );
  }

  const heute = new Date();
  const beginn = new Date(heute.getFullYear(), heute.getMonth() + 1, 1);
  const startJahr = beginn.getFullYear();
  const jahr = geburtsjahr(lead.geburtsdatum);
  const alter = jahr ? startJahr - jahr : null;
  const zaehne = String(lead.fehlende_zaehne || '0');
  const spalten = auswahl.map((a) => ({
    ...a,
    beitrag: berechneBeitrag({ gesellschaft: a.gesellschaft, tarif: a.tarif, geburtsdatum: lead.geburtsdatum, fehlendeZaehne: lead.fehlende_zaehne }, beginn),
    leistungen: leistungenVon(a.gesellschaft, a.tarif),
    verlauf: alter != null ? beitragsVerlauf({ gesellschaft: a.gesellschaft, tarif: a.tarif, fehlendeZaehne: lead.fehlende_zaehne }, alter) : [],
  })).map((sp) => {
    // The next age band, shown on the card when it starts within a year of the insurance start.
    const n = sp.verlauf[1];
    const ab = n && jahr ? new Date(jahr + n.abAlter, 0, 1) : null;
    const bald = ab && ab > beginn && ab - beginn <= 366 * 86400000;
    return { ...sp, sprung: bald ? { ab, beitrag: n.beitrag } : null };
  });
  const gueltigBis = new Date(beginn.getFullYear(), beginn.getMonth(), 0);
  const cols = `minmax(0, 0.95fr) repeat(${spalten.length}, minmax(0, 1fr))`;
  const farben = farbenFuer(spalten.length, empfohlen);

  const pdfLaden = async () => {
    setPdfState('laeuft');
    try {
      const res = await fetch(`/api/angebot/${lead.id}${window.location.search}&ablegen=1`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Zahnzusatz-Vergleich ${lead.name || 'Kunde'} ${dateDe(new Date())}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      setPdfState(res.headers.get('X-Angebot-Abgelegt') === '1' ? 'abgelegt' : 'fertig');
    } catch {
      setPdfState('fehler');
    }
  };

  const mailOeffnen = () => {
    const entwurf = angebotMail({ lead, spalten, empfohlen, notiz, beginn, gueltigBis });
    setMail({ an: lead.email || '', ...entwurf, state: '', fehler: '' });
  };

  const mailSenden = async () => {
    setMail((m) => ({ ...m, state: 'laeuft', fehler: '' }));
    try {
      const res = await fetch(`/api/angebot/${lead.id}/senden`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ an: mail.an, betreff: mail.betreff, text: mail.text, query: window.location.search.slice(1) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Die E-Mail konnte nicht gesendet werden');
      if (data.status === 'angebot_verschickt') setStatusGesetzt(true);
      setMail((m) => ({ ...m, state: data.testmodus ? 'test' : 'gesendet', abgelegt: data.abgelegt }));
    } catch (err) {
      setMail((m) => ({ ...m, state: '', fehler: err.message }));
    }
  };

  const markieren = async () => {
    const res = await fetch(`/api/submissions/${lead.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'angebot_verschickt' }),
    }).catch(() => null);
    if (res?.ok) setStatusGesetzt(true);
    else alert('Der Status konnte nicht gesetzt werden.');
  };

  const meta = [
    lead.geburtsdatum && ['Geburtsdatum', formatBirthdate(lead.geburtsdatum)],
    ['Versicherungsbeginn', dateDe(beginn)],
    zaehne !== '0' && ['Fehlende Zähne', zaehne],
    ['Angebot gültig bis', dateDe(gueltigBis)],
  ].filter(Boolean);

  const cell = (i, extra = {}) => ({ padding: '9px 12px', fontSize: 12.5, lineHeight: 1.45, color: INK, background: i === empfohlen ? TINT : 'transparent', ...extra });
  const rowLabel = { padding: '9px 12px 9px 0', fontSize: 12.5, lineHeight: 1.35, color: MUTED };

  return (
    <div className="angebot" data-angebot-fertig={lead.name || 'Kunde'} style={{ background: '#fff', minHeight: '100vh', fontFamily: SANS, color: INK }}>
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 5, background: '#2a2925', color: '#fff', padding: '10px 16px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <a href="/admin" style={{ color: '#fff', fontSize: 14 }}>← CRM</a>
        <span style={{ fontSize: 14, opacity: 0.75 }}>Angebot für {lead.name}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {lead.status !== 'angebot_verschickt' && !statusGesetzt && (
            <button type="button" onClick={markieren} style={toolbarBtn(false)}>Status „Angebot verschickt“ setzen</button>
          )}
          {statusGesetzt && <span style={{ fontSize: 13 }}>Status gesetzt</span>}
          {pdfState && pdfState !== 'laeuft' && (
            <span style={{ fontSize: 13, color: pdfState === 'fehler' ? '#ffb4a8' : C.champagne }}>
              {{ abgelegt: 'PDF geladen und bei den Dokumenten abgelegt', fertig: 'PDF geladen', fehler: 'PDF fehlgeschlagen, bitte nochmal' }[pdfState]}
            </span>
          )}
          <button type="button" onClick={mailOeffnen} style={toolbarBtn(false)}>Per E-Mail senden</button>
          <button type="button" onClick={pdfLaden} disabled={pdfState === 'laeuft'} style={toolbarBtn(true)}>
            {pdfState === 'laeuft' ? 'PDF wird erstellt …' : 'PDF herunterladen'}
          </button>
        </span>
      </div>

      {mail && (
        <div className="no-print" role="dialog" aria-modal="true" aria-label="Angebot per E-Mail senden" style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'rgba(9,9,9,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 720, background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', fontFamily: SANS, color: INK }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 24, margin: 0 }}>Angebot per E-Mail senden</h2>
              <button type="button" onClick={() => setMail(null)} aria-label="Schließen" style={{ marginLeft: 'auto', background: 'none', border: 0, fontSize: 26, lineHeight: 1, cursor: 'pointer', color: MUTED }}>×</button>
            </div>
            {mail.state === 'gesendet' || mail.state === 'test' ? (
              <div>
                <p style={{ fontSize: 15, lineHeight: 1.55, margin: '0 0 8px' }}>
                  {mail.state === 'test' ? 'Testmodus: Die E-Mail wurde vorbereitet, aber nicht gesendet.' : `Gesendet an ${mail.an}, mit dem Angebot als PDF im Anhang. Eine Kopie ist in deinem Postfach.`}
                </p>
                <p style={{ fontSize: 13, color: MUTED, margin: '0 0 20px' }}>
                  {mail.state === 'gesendet' && `${mail.abgelegt ? 'Das PDF liegt bei den Dokumenten, ' : ''}der Versand ist in der Beratungsdokumentation vermerkt.`}
                </p>
                <button type="button" onClick={() => setMail(null)} style={dialogBtn(true)}>Fertig</button>
              </div>
            ) : (
              <>
                <label style={dialogLabel}>
                  An
                  <input type="email" value={mail.an} onChange={(e) => setMail({ ...mail, an: e.target.value })} placeholder="E-Mail-Adresse des Kunden" style={dialogField} />
                </label>
                <label style={dialogLabel}>
                  Betreff
                  <input value={mail.betreff} onChange={(e) => setMail({ ...mail, betreff: e.target.value })} style={dialogField} />
                </label>
                <label style={dialogLabel}>
                  Nachricht
                  <textarea value={mail.text} onChange={(e) => setMail({ ...mail, text: e.target.value })} rows={18} style={{ ...dialogField, height: 'auto', padding: '12px 14px', lineHeight: 1.5, resize: 'vertical' }} />
                </label>
                <p style={{ fontSize: 12.5, color: MUTED, margin: '4px 0 16px' }}>
                  Anhang: Zahnzusatz-Vergleich als PDF (wird beim Senden erstellt). Antworten des Kunden gehen an {CONTACT.email}, du bekommst eine Kopie.
                </p>
                {mail.fehler && <p style={{ fontSize: 13.5, color: NO, margin: '0 0 12px' }}>{mail.fehler}</p>}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setMail(null)} style={dialogBtn(false)}>Abbrechen</button>
                  <button type="button" onClick={mailSenden} disabled={mail.state === 'laeuft' || !mail.an.trim()} style={dialogBtn(true)}>
                    {mail.state === 'laeuft' ? 'Wird gesendet …' : 'Jetzt senden'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Page 1: brand, customer, the three tariffs */}
      <header style={{ background: C.black, color: C.ivory }}>
        <div className="blatt" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '26px 40px' }}>
          <img src="/logo-white.svg?v=7" alt="" style={{ height: 58, width: 'auto', display: 'block' }} />
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 21, letterSpacing: 5 }}>MARCO ARPA</div>
            <div style={{ ...kicker, color: C.champagne, fontSize: 10, marginTop: 4 }}>Versicherungsmakler</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ ...kicker, color: C.champagne }}>Zahnzusatzversicherung</div>
            <div style={{ fontFamily: SERIF, fontSize: 15, marginTop: 4, color: 'rgba(241,238,230,0.85)' }}>Ihr persönlicher Vergleich</div>
          </div>
        </div>
      </header>

      <section className="intro" style={{ background: C.ivory }}>
        <div className="blatt" style={{ padding: '34px 40px 30px' }}>
          <div style={kicker}>Angebot für</div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 38, lineHeight: 1.15, margin: '0 0 20px', color: INK }}>{lead.name}</h1>
          <dl style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 40px', margin: 0 }}>
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt style={{ fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: MUTED }}>{k}</dt>
                <dd style={{ margin: '3px 0 0', fontSize: 15, color: INK }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <main className="blatt" style={{ padding: '30px 40px 10px' }}>
        <div className="karten" style={{ display: 'grid', gridTemplateColumns: `repeat(${spalten.length}, minmax(0, 1fr))`, gap: 14, alignItems: 'stretch' }}>
          {spalten.map((s, i) => {
            const top = i === empfohlen;
            return (
              <article key={i} style={{
                position: 'relative', borderRadius: 14, padding: '26px 20px 22px', display: 'flex', flexDirection: 'column', gap: 14,
                background: top ? C.black : '#fff', color: top ? C.ivory : INK, border: top ? `1px solid ${C.black}` : `1px solid ${LINE}`,
              }}>
                {top && (
                  <span style={{ position: 'absolute', top: -11, left: 20, background: C.champagne, color: C.black, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', padding: '5px 10px', borderRadius: 999 }}>
                    Unsere Empfehlung
                  </span>
                )}
                <div>
                  <div style={{ fontFamily: SERIF, fontSize: 24 }}>{s.label}</div>
                  {mitGesellschaft && <div style={{ fontSize: 11.5, marginTop: 4, color: top ? 'rgba(241,238,230,0.7)' : MUTED }}>{s.gesellschaft}, {s.tarif}</div>}
                </div>
                <div>
                  {s.beitrag.ok ? (
                    <>
                      <span style={{ fontFamily: SERIF, fontSize: 40, lineHeight: 1, color: top ? C.champagne : INK }}>{preis(s.beitrag.beitrag)}</span>
                      <div style={{ fontSize: 12, marginTop: 6, color: top ? 'rgba(241,238,230,0.75)' : MUTED }}>
                        monatlich{s.beitrag.zuschlag > 0 ? `, inkl. ${euro(s.beitrag.zuschlag)} Zuschlag` : ''}
                      </div>
                      {s.sprung && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '4px 9px', borderRadius: 999, fontSize: 11.5,
                          background: top ? 'rgba(181,161,113,0.18)' : '#f4efe3', color: top ? C.champagne : C.champagneDark,
                        }}>
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 16 10 10 14 14 20 8" /><polyline points="15 8 20 8 20 13" /></svg>
                          ab {dateDe(s.sprung.ab)}: {euro(s.sprung.beitrag)}
                        </div>
                      )}
                    </>
                  ) : <div style={{ fontSize: 13 }}>{s.beitrag.grund}</div>}
                </div>
                {s.leistungen?.sterne && <Sterne wert={s.leistungen.sterne} hell={top} />}
                <ul style={{ listStyle: 'none', margin: 0, padding: '14px 0 0', borderTop: `1px solid ${top ? 'rgba(241,238,230,0.18)' : LINE}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {kurzfakten(s.leistungen, beginn).map((f) => (
                    <li key={f.t} style={{ display: 'flex', gap: 8, fontSize: 12.5, lineHeight: 1.4 }}>
                      {f.s === 'ja'
                        ? <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={top ? C.champagne : OK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="4 12.5 9.5 18 20 6.5" /></svg>
                        : <span aria-hidden="true" style={{ width: 14, flexShrink: 0, textAlign: 'center', color: top ? C.champagne : C.champagneDark }}>·</span>}
                      <span>{f.t}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
        {notiz.trim() && (
          <div style={{ marginTop: 22, padding: '18px 22px', background: C.ivory, borderLeft: `3px solid ${C.champagne}`, borderRadius: '0 12px 12px 0' }}>
            <div style={{ ...kicker, marginBottom: 6 }}>Meine Empfehlung für Sie</div>
            <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: INK, whiteSpace: 'pre-line' }}>{notiz.trim()}</p>
            <div style={{ marginTop: 8, fontSize: 12, color: MUTED }}>Marco Arpa</div>
          </div>
        )}
      </main>

      {/* Premium development */}
      <div className="blatt abschnitt" style={{ padding: '26px 40px 0' }}>
        <div style={kicker}>Beitragsentwicklung</div>
        <h2 style={h2}>So entwickelt sich Ihr Beitrag mit dem Alter</h2>
        <p style={{ fontSize: 12.5, color: MUTED, margin: '0 0 20px', lineHeight: 1.55 }}>
          Zahnzusatztarife steigen in Altersstufen, jeweils zum 1. Januar des Jahres, in dem Sie die nächste Stufe erreichen.
        </p>
        <div style={{ border: `1px solid ${LINE}`, borderRadius: 14, padding: '18px 18px 10px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px', marginBottom: 10 }}>
            {spalten.map((s, i) => {
              const naechste = s.verlauf[1];
              return (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12.5 }}>
                  <span style={{ width: 18, height: 3, background: farben[i], marginTop: 8, borderRadius: 2 }} />
                  <span>
                    <strong style={{ fontWeight: 700 }}>{s.label}</strong>
                    <span style={{ display: 'block', color: MUTED, fontSize: 11.5 }}>
                      {s.verlauf.length ? `heute ${euro(s.verlauf[0].beitrag)}${naechste ? `, ab ${naechste.abAlter}: ${euro(naechste.beitrag)}` : ''}` : 'keine Beitragstabelle'}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          <Verlauf reihen={spalten.map((s, i) => ({ label: s.label, punkte: s.verlauf, farbe: farben[i] }))} />
        </div>
      </div>

      {/* Details */}
      <div className="blatt details" style={{ padding: '40px 40px 0' }}>
        <div style={kicker}>Im Detail</div>
        <h2 style={h2}>Leistungen im Vergleich</h2>
        {SECTIONS.map((sec) => (
          <section key={sec.key} className="abschnitt" style={{ marginTop: 52, display: 'grid', gridTemplateColumns: cols }}>
            <div style={{ fontFamily: SERIF, fontSize: 23, fontWeight: 400, color: INK, padding: '10px 12px 10px 0', borderBottom: `2px solid ${C.champagne}` }}>{sec.title}</div>
            {spalten.map((s, i) => (
              <div key={i} style={{ ...cell(i, { padding: '10px 12px' }), borderBottom: `1.5px solid ${C.champagne}`, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: MUTED }}>
                {s.label}
                {sec.note && s.leistungen?.noten?.[sec.key] && <span style={{ display: 'block', textTransform: 'none', letterSpacing: 0, color: OK, fontSize: 11.5, marginTop: 2 }}>{s.leistungen.noten[sec.key]}</span>}
              </div>
            ))}
            {zeilenVon(sec, spalten).map((z) => (
              <Fragment key={z.key}>
                <div className="zeile" style={{ ...rowLabel, borderBottom: `1px solid ${LINE}` }}>
                  {z.texte ? z.texte.join(', ') : z.text}
                  {z.sub && <div style={{ fontSize: 10.5, color: '#9a948a' }}>{z.sub}</div>}
                </div>
                {z.gemeinsam ? (
                  <div className="zeile" style={{ ...cell(-2), gridColumn: '2 / -1', borderBottom: `1px solid ${LINE}`, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: MUTED, whiteSpace: 'nowrap' }}>Bei allen Tarifen:</span>
                    <Wert wert={z.gemeinsam} beginn={beginn} />
                  </div>
                ) : spalten.map((s, i) => (
                  <div key={i} className="zeile" style={{ ...cell(i), borderBottom: `1px solid ${LINE}` }}>
                    <Wert wert={s.leistungen ? (s.leistungen[z.key] || {}) : null} beginn={beginn} />
                  </div>
                ))}
              </Fragment>
            ))}
          </section>
        ))}
      </div>

      {/* Partners and contact, kept together on the last page */}
      <div className="schluss">
      <div className="blatt" style={{ padding: '40px 40px 0' }}>
        <div className="abschnitt" style={{ background: C.black, color: C.ivory, borderRadius: 16, padding: '26px 28px' }}>
          <div style={{ ...kicker, color: C.champagne }}>So geht's weiter</div>
          <h2 style={{ ...h2, color: C.ivory }}>In drei Schritten zu Ihrem Schutz</h2>
          <ol className="schritte" style={{ listStyle: 'none', margin: '6px 0 0', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18 }}>
            {[
              ['Tarif wählen', 'Sagen Sie mir kurz, welcher Tarif es sein soll, oder stellen Sie Ihre Fragen.'],
              ['Antrag unterschreiben', 'Ich bereite den Antrag vor, Sie unterschreiben ihn bequem digital.'],
              [`Geschützt ab ${dateDe(beginn)}`, 'Ihr Versicherungsschutz beginnt, die Police kommt per Post oder E-Mail.'],
            ].map(([t, d], i) => (
              <li key={t} style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1, color: C.champagne }}>{i + 1}</span>
                <span>
                  <strong style={{ display: 'block', fontSize: 13.5, marginBottom: 3 }}>{t}</strong>
                  <span style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(241,238,230,0.75)' }}>{d}</span>
                </span>
              </li>
            ))}
          </ol>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
            <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hallo Marco, ich habe mir das Zahnzusatz-Angebot angesehen.')}`} style={ctaBtn(true)}>Per WhatsApp antworten</a>
            <a href={CONTACT.phoneHref} style={ctaBtn(false)}>Anrufen: {CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent('Mein Zahnzusatz-Angebot')}`} style={ctaBtn(false)}>{CONTACT.email}</a>
          </div>
        </div>
      </div>
      <div className="abschnitt">
      <div className="blatt" style={{ padding: '36px 40px 28px' }}>
        <div style={kicker}>Unabhängig verglichen</div>
        <h2 style={h2}>Unsere Partnergesellschaften</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '16px 20px', alignItems: 'center', justifyItems: 'center', marginTop: 24 }} className="partner">
          {PARTNER.map(([name, file]) => (
            <img key={name} src={`/insurers/gesellschaften/${file}.png`} alt={name} style={{ maxHeight: 32, maxWidth: '100%', objectFit: 'contain' }} />
          ))}
        </div>
        <p style={{ fontSize: 10.5, color: '#8f897f', lineHeight: 1.6, margin: '26px 0 0' }}>
          Unverbindlicher Vergleich vom {dateDe(heute)} für einen Versicherungsbeginn am {dateDe(beginn)}. Monatsbeiträge nach tariflichem Alter
          (Kalenderjahr minus Geburtsjahr){zaehne !== '0' ? ', inklusive Risikozuschlag für fehlende Zähne' : ''}. Leistungsangaben Stand {LEISTUNGEN_STAND}. {BEWERTUNG_QUELLE}.
          Das Angebot gilt für einen Versicherungsbeginn am {dateDe(beginn)}; bei späterem Beginn kann sich der Beitrag ändern.
          Maßgeblich sind allein die Versicherungsbedingungen und der Antrag der jeweiligen Gesellschaft.
        </p>
      </div>

      <footer style={{ background: C.black, color: C.ivory }}>
        <div className="blatt" style={{ padding: '22px 40px', display: 'flex', flexWrap: 'wrap', gap: '8px 28px', alignItems: 'center', fontSize: 12.5 }}>
          <span style={{ fontFamily: SERIF, fontSize: 15, letterSpacing: 3 }}>MARCO ARPA</span>
          <span style={{ color: 'rgba(241,238,230,0.7)' }}>Versicherungsmakler nach § 34d GewO</span>
          <span style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px 22px', color: C.champagne }}>
            <span>{CONTACT.phone}</span><span>{CONTACT.email}</span><span>marcoarpa.com</span>
          </span>
        </div>
      </footer>
      </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&family=Gelasio:wght@400;700&display=swap');
        .angebot .blatt { max-width: 980px; margin: 0 auto; box-sizing: border-box; }
        .angebot .zeile, .angebot article, .angebot .abschnitt { break-inside: avoid; }
        @media (max-width: 720px) {
          .angebot .karten { grid-template-columns: minmax(0, 1fr) !important; }
          .angebot .blatt { padding-left: 18px !important; padding-right: 18px !important; }
          .angebot .partner { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .angebot .schritte { grid-template-columns: minmax(0, 1fr) !important; }
        }
        @media print {
          @page { size: A4; margin: 14mm 13mm; }
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .angebot { -webkit-print-color-adjust: exact; print-color-adjust: exact; min-height: 0 !important; zoom: 0.7; }
          .angebot .blatt { max-width: none; padding-left: 0 !important; padding-right: 0 !important; }
          .angebot header .blatt, .angebot footer .blatt, .angebot .intro .blatt { padding-left: 7mm !important; padding-right: 7mm !important; }
          .angebot header, .angebot .intro { border-radius: 0; }
          .angebot .details { break-before: page; padding-top: 0 !important; }
        }
      `}</style>
    </div>
  );
}

const dialogLabel = { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, marginBottom: 14 };
const dialogField = {
  height: 44, padding: '0 14px', border: `1px solid ${LINE}`, borderRadius: 10, fontSize: 15, fontFamily: SANS, color: INK,
  textTransform: 'none', letterSpacing: 0, fontWeight: 400, background: '#fff', boxSizing: 'border-box', width: '100%',
};
const dialogBtn = (primary) => ({
  minHeight: 44, padding: '0 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: SANS,
  background: primary ? C.black : '#fff', color: primary ? C.ivory : INK, border: primary ? 0 : `1px solid ${LINE}`,
});

const ctaBtn = (primary) => ({
  display: 'inline-flex', alignItems: 'center', minHeight: 40, padding: '0 16px', borderRadius: 999, textDecoration: 'none',
  fontFamily: SANS, fontSize: 12.5, fontWeight: 700,
  background: primary ? C.champagne : 'transparent', color: primary ? C.black : C.ivory, border: primary ? 0 : '1px solid rgba(241,238,230,0.3)',
});

const toolbarBtn = (primary) => ({
  minHeight: 36, padding: '0 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: SANS,
  background: primary ? C.champagne : 'transparent', color: primary ? C.black : '#fff', border: primary ? 0 : '1px solid rgba(255,255,255,0.4)',
});
