'use client';

// Offer for one lead in the look of Marco's Canva offers: three tariffs side by side with monthly
// premium, rating, benefits and premium development by age. Opened from the CRM ("Angebot
// erstellen"); the choice comes in the URL: t=Gesellschaft|Tarif|Spaltenname (three times),
// e=index of the recommended column, g=1 shows the insurer under the column name.
// "Als PDF speichern" uses the browser's print dialog; the print styles below lay it out on A4.

import { Fragment, useEffect, useState } from 'react';
import { berechneBeitrag, beitragsVerlauf, geburtsjahr, euro } from '../../../../lib/tarife';
import { SECTIONS, leistungenVon, begrenzungText, LEISTUNGEN_STAND } from '../../../../lib/leistungen';
import { CONTACT } from '../../../../lib/brand';
import { formatBirthdate } from '../../../../lib/format';

const NAVY = '#1d3a5c';
const GREEN = '#2e8b3a';
const GREY_HEAD = '#d6d6d6';
const GREY_LABEL = '#ededed';
const LINE = '#dedede';
const SERIES = ['#2a78d6', '#eb6834', '#1baf7a'];
const FONT = 'Arial, Helvetica, sans-serif';
const PARTNER = [
  ['Württembergische', 'gesellschaften/wuerttembergische.png'], ['Münchener Verein', 'gesellschaften/muenchener-verein.png'],
  ['Allianz', 'gesellschaften/allianz.png'], ['Nürnberger', 'gesellschaften/nuernberger.png'], ['AXA', 'gesellschaften/axa.png'],
  ['Barmenia', 'gesellschaften/barmenia.png'], ['DKV', 'gesellschaften/dkv.png'], ['SIGNAL IDUNA', 'gesellschaften/signal-iduna.png'],
  ['BBKK', 'gesellschaften/bbkk.png'], ['SDK', 'gesellschaften/sdk.png'], ['HanseMerkur', 'gesellschaften/hansemerkur.png'], ['uniVersa', 'gesellschaften/universa.png'],
];

const dateDe = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

function parseAuswahl(params) {
  return params.getAll('t').slice(0, 3).map((v) => {
    const [gesellschaft, tarif, label] = v.split('|');
    return { gesellschaft, tarif, label: label || tarif };
  });
}

function Icon({ s }) {
  if (s === 'ja') {
    return <svg aria-label="enthalten" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7cb342" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><polyline points="7.5 12.5 10.5 15.5 16.5 9" /></svg>;
  }
  if (s === 'nein') {
    return <svg aria-label="nicht enthalten" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="7" x2="12" y2="13" /><line x1="12" y1="16.5" x2="12" y2="16.6" /></svg>;
  }
  return null;
}

function Sterne({ wert }) {
  const voll = Math.round(wert);
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: '#333' }}>{wert.toLocaleString('de-DE')} von <strong>5</strong> Sternen</div>
      <div aria-hidden="true" style={{ color: '#f2c14e', fontSize: 15, letterSpacing: 2, marginTop: 2 }}>
        {'★'.repeat(voll)}<span style={{ color: '#d9d9d9' }}>{'★'.repeat(5 - voll)}</span>
      </div>
    </div>
  );
}

function Zelle({ wert, startJahr }) {
  if (!wert) return <span style={{ color: '#9a9a9a', fontStyle: 'italic' }}>Angaben folgen</span>;
  if (wert.staffel) return <span style={{ whiteSpace: 'pre-line' }}>{begrenzungText(wert, startJahr)}</span>;
  return (
    <span style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <Icon s={wert.s} />
      <span style={{ whiteSpace: 'pre-line' }}>{wert.t}</span>
    </span>
  );
}

// Step chart of the monthly premium by age, one line per tariff, from today's age to 80.
function Verlauf({ reihen }) {
  const W = 620; const H = 230; const L = 46; const R = 12; const T = 12; const B = 34;
  const alle = reihen.flatMap((r) => r.punkte);
  if (!alle.length) return <p style={{ fontSize: 13, color: '#777', margin: 0 }}>Für diese Tarife ist keine Beitragstabelle hinterlegt.</p>;
  const minAlter = Math.min(...alle.map((p) => p.abAlter));
  const maxAlter = Math.max(80, minAlter + 10);
  const maxBeitrag = Math.ceil(Math.max(...alle.map((p) => p.beitrag)) / 20) * 20 || 20;
  const x = (a) => L + ((a - minAlter) / (maxAlter - minAlter)) * (W - L - R);
  const y = (b) => T + (1 - b / maxBeitrag) * (H - T - B);
  const ticksY = Array.from({ length: maxBeitrag / 20 + 1 }, (_, i) => i * 20).filter((v, i, arr) => arr.length <= 8 || i % 2 === 0);
  const ticksX = [];
  for (let a = Math.ceil(minAlter / 5) * 5; a <= maxAlter; a += 5) ticksX.push(a);
  const pfad = (punkte) => punkte.map((p, i) => {
    const nx = i + 1 < punkte.length ? punkte[i + 1].abAlter : maxAlter;
    return `${i === 0 ? 'M' : 'V'} ${i === 0 ? `${x(p.abAlter)} ${y(p.beitrag)}` : y(p.beitrag)} H ${x(nx)}`;
  }).join(' ');
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 28px', fontSize: 13, color: '#333', marginBottom: 8 }}>
        {reihen.map((r, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 12, height: 12, background: SERIES[i], borderRadius: 2 }} />{r.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Monatsbeitrag nach Alter" style={{ display: 'block', fontFamily: FONT }}>
        {ticksY.map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#e6e6e6" />
            <text x={L - 8} y={y(v) + 4} fontSize="10" textAnchor="end" fill="#777">{v} €</text>
          </g>
        ))}
        {ticksX.map((a) => <text key={a} x={x(a)} y={H - B + 16} fontSize="10" textAnchor="middle" fill="#777">{a}</text>)}
        <text x={(L + W - R) / 2} y={H - 4} fontSize="10" textAnchor="middle" fill="#555" fontWeight="700">Alter</text>
        {reihen.map((r, i) => r.punkte.length > 0 && (
          <path key={i} d={pfad(r.punkte)} fill="none" stroke={SERIES[i]} strokeWidth="2" strokeLinejoin="round">
            <title>{`${r.label}: ${r.punkte.map((p) => `ab ${p.abAlter}: ${euro(p.beitrag)}`).join(', ')}`}</title>
          </path>
        ))}
      </svg>
    </div>
  );
}

export default function AngebotPage({ params }) {
  const [lead, setLead] = useState(null);
  const [state, setState] = useState('laden');
  const [auswahl, setAuswahl] = useState([]);
  const [empfohlen, setEmpfohlen] = useState(-1);
  const [mitGesellschaft, setMitGesellschaft] = useState(false);
  const [statusGesetzt, setStatusGesetzt] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setAuswahl(parseAuswahl(p));
    setEmpfohlen(p.has('e') ? Number(p.get('e')) : -1);
    setMitGesellschaft(p.get('g') === '1');
    fetch('/api/submissions').then(async (res) => {
      if (res.status === 401) { setState('login'); return; }
      const data = await res.json();
      const found = (data.submissions || []).find((s) => String(s.id) === String(params.id));
      setLead(found || null);
      setState(found ? 'ok' : 'fehlt');
    }).catch(() => setState('fehler'));
  }, [params.id]);

  if (state !== 'ok') {
    const text = { laden: 'Lade Angebot …', login: 'Bitte zuerst im CRM anmelden.', fehlt: 'Diesen Kunden gibt es nicht.', fehler: 'Das Angebot konnte nicht geladen werden.' }[state];
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, background: '#fff', color: '#333', padding: 24 }}>
        <p>{text} {state !== 'laden' && <a href="/admin" style={{ color: NAVY }}>Zum CRM</a>}</p>
      </main>
    );
  }

  const heute = new Date();
  const beginn = new Date(heute.getFullYear(), heute.getMonth() + 1, 1);
  const jahr = geburtsjahr(lead.geburtsdatum);
  const alter = jahr ? beginn.getFullYear() - jahr : null;
  const spalten = auswahl.map((a) => ({
    ...a,
    beitrag: berechneBeitrag({ gesellschaft: a.gesellschaft, tarif: a.tarif, geburtsdatum: lead.geburtsdatum, fehlendeZaehne: lead.fehlende_zaehne }, beginn),
    leistungen: leistungenVon(a.gesellschaft, a.tarif),
    verlauf: alter != null ? beitragsVerlauf({ gesellschaft: a.gesellschaft, tarif: a.tarif, fehlendeZaehne: lead.fehlende_zaehne }, alter) : [],
  }));
  const cols = `minmax(150px, 0.9fr) repeat(${spalten.length}, minmax(0, 1fr))`;
  const zaehne = String(lead.fehlende_zaehne || '0');

  const markieren = async () => {
    const res = await fetch(`/api/submissions/${lead.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'angebot_verschickt' }),
    }).catch(() => null);
    if (res?.ok) setStatusGesetzt(true);
    else alert('Der Status konnte nicht gesetzt werden.');
  };

  const randRechts = (i) => (i === empfohlen ? `2px solid ${GREEN}` : `1px solid ${LINE}`);
  const zelle = (i, extra = {}) => ({
    padding: '10px 12px', fontSize: 12.5, lineHeight: 1.45, color: '#333', background: '#fff',
    borderTop: `1px solid ${LINE}`, borderLeft: i === empfohlen ? `2px solid ${GREEN}` : `1px solid ${LINE}`, borderRight: randRechts(i), ...extra,
  });
  const label = { padding: '10px 12px', fontSize: 12.5, lineHeight: 1.35, color: '#333', background: GREY_LABEL, borderTop: `1px solid ${LINE}` };

  return (
    <div className="angebot" style={{ background: '#fff', minHeight: '100vh', fontFamily: FONT, color: '#333' }}>
      <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 5, background: '#1f1f1f', color: '#fff', padding: '10px 16px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <a href="/admin" style={{ color: '#fff', fontSize: 14 }}>← CRM</a>
        <span style={{ fontSize: 14, opacity: 0.8 }}>Angebot für {lead.name}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {lead.status !== 'angebot_verschickt' && !statusGesetzt && (
            <button type="button" onClick={markieren} style={toolbarBtn(false)}>Status „Angebot verschickt“ setzen</button>
          )}
          {statusGesetzt && <span style={{ fontSize: 13, alignSelf: 'center' }}>Status gesetzt ✓</span>}
          <button type="button" onClick={() => window.print()} style={toolbarBtn(true)}>Als PDF speichern</button>
        </span>
      </div>

      <header style={{ background: '#e8e8e8', padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src="/logo-black.svg?v=7" alt="" style={{ height: 56, width: 'auto', display: 'block' }} />
        <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 18, letterSpacing: 3, color: '#111' }}>MARCO ARPA</span>
      </header>

      <div className="blatt" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px 40px' }}>
        {/* Head: customer and the three tariffs */}
        <div className="block" style={{ display: 'grid', gridTemplateColumns: cols, marginTop: 0 }}>
          <div style={{ ...label, borderTop: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '28px 12px', gap: 6 }}>
            <div style={{ fontSize: 17 }}>Zahnzusatzvergleich</div>
            <div style={{ fontSize: 17, color: NAVY }}>{lead.name}</div>
            <div style={{ fontSize: 11.5, color: '#666', lineHeight: 1.5, marginTop: 6 }}>
              {lead.geburtsdatum && <>geb. {formatBirthdate(lead.geburtsdatum)}<br /></>}
              Beginn {dateDe(beginn)}
              {zaehne !== '0' && <><br />{zaehne} fehlende{zaehne === '1' ? 'r Zahn' : ' Zähne'}</>}
            </div>
          </div>
          {spalten.map((s, i) => (
            <div key={i} style={{ ...zelle(i, { borderTop: i === empfohlen ? `2px solid ${GREEN}` : 0 }), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '24px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, letterSpacing: 0.5, textTransform: 'uppercase', color: '#222' }}>{s.label}</div>
              {mitGesellschaft && <div style={{ fontSize: 11.5, color: '#666', marginTop: -8 }}>{s.gesellschaft}, {s.tarif}</div>}
              <div style={{ background: NAVY, color: '#fff', borderRadius: 8, padding: '12px 10px', minWidth: 140, maxWidth: '100%', boxSizing: 'border-box' }}>
                {s.beitrag.ok ? (
                  <>
                    <div style={{ fontSize: 22 }}>{euro(s.beitrag.beitrag).replace(' €', '€')}</div>
                    <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>pro Monat</div>
                  </>
                ) : <div style={{ fontSize: 12 }}>{s.beitrag.grund}</div>}
              </div>
              {s.beitrag.ok && s.beitrag.zuschlag > 0 && <div style={{ fontSize: 11, color: '#666', marginTop: -6 }}>inkl. {euro(s.beitrag.zuschlag)} Zuschlag</div>}
              {i === empfohlen && <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: -4 }}>Empfehlung</div>}
            </div>
          ))}
          <div style={label}>Kundenbewertung</div>
          {spalten.map((s, i) => (
            <div key={i} style={zelle(i, { borderBottom: i === empfohlen ? `2px solid ${GREEN}` : `1px solid ${LINE}` })}>
              {s.leistungen?.sterne ? <Sterne wert={s.leistungen.sterne} /> : <div style={{ textAlign: 'center', color: '#9a9a9a' }}>–</div>}
            </div>
          ))}
        </div>

        {SECTIONS.map((sec) => (
          <section key={sec.key} className="block" style={{ marginTop: 36, display: 'grid', gridTemplateColumns: cols, border: `1px solid ${LINE}` }}>
            <div style={{ background: GREY_HEAD, padding: '12px 12px', fontSize: 15, color: '#333', gridColumn: sec.note ? 'auto' : '1 / -1' }}>{sec.title}</div>
            {sec.note && spalten.map((s, i) => (
              <div key={i} style={{ background: GREY_HEAD, padding: 6 }}>
                <div style={{ background: '#fff', textAlign: 'center', padding: '6px 4px', fontSize: 12.5, color: GREEN }}>{s.leistungen?.noten?.[sec.key] || '–'}</div>
              </div>
            ))}
            {sec.rows.map(([key, text, sub]) => (
              <Fragment key={key}>
                <div className="zeile" style={label}>
                  {text}
                  {sub && <div style={{ fontSize: 10.5, color: '#777' }}>{sub}</div>}
                </div>
                {spalten.map((s, i) => (
                  <div key={i} className="zeile" style={zelle(i)}>
                    <Zelle wert={s.leistungen ? (s.leistungen[key] || { t: '' }) : null} startJahr={beginn.getFullYear()} />
                  </div>
                ))}
              </Fragment>
            ))}
          </section>
        ))}

        <section className="block" style={{ marginTop: 36, display: 'grid', gridTemplateColumns: cols, border: `1px solid ${LINE}` }}>
          <div style={{ background: GREY_HEAD, padding: 12, fontSize: 15, gridColumn: '1 / -1' }}>Beitragsentwicklung</div>
          <div style={label}>Beitragsentwicklung im Alter</div>
          {spalten.map((s, i) => (
            <div key={i} style={zelle(i)}>
              {s.verlauf.length > 1
                ? `Altersbedingte Beitragserhöhung, siehe Beitragschart. Ab ${s.verlauf[1].abAlter} Jahren ${euro(s.verlauf[1].beitrag)}.`
                : s.verlauf.length === 1 ? 'Keine weitere Altersstufe.' : 'Keine Beitragstabelle hinterlegt.'}
            </div>
          ))}
          <div style={label} />
          <div style={{ gridColumn: '2 / -1', padding: '14px 16px', borderTop: `1px solid ${LINE}`, background: '#fff' }}>
            <Verlauf reihen={spalten.map((s) => ({ label: s.label, punkte: s.verlauf }))} />
          </div>
        </section>

        <p style={{ fontSize: 11, color: '#777', lineHeight: 1.6, marginTop: 24 }}>
          Unverbindlicher Vergleich vom {dateDe(heute)} für einen Versicherungsbeginn am {dateDe(beginn)}. Monatsbeiträge nach dem tariflichen Alter
          (Kalenderjahr minus Geburtsjahr){zaehne !== '0' ? ' inklusive Risikozuschlag für fehlende Zähne' : ''}. Leistungsangaben Stand {LEISTUNGEN_STAND}.
          Maßgeblich sind allein die Versicherungsbedingungen und der Antrag der jeweiligen Gesellschaft.
          <br />Marco Arpa, Versicherungsmakler nach § 34d GewO · {CONTACT.phone} · {CONTACT.email}
        </p>
      </div>

      <footer className="block" style={{ background: '#e8e8e8', padding: '28px 16px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '18px 24px', alignItems: 'center', justifyItems: 'center' }}>
          {PARTNER.map(([name, file]) => <img key={name} src={`/insurers/${file}`} alt={name} style={{ maxHeight: 42, maxWidth: 140, objectFit: 'contain' }} />)}
        </div>
      </footer>

      <style>{`
        .angebot .zeile { break-inside: avoid; }
        @media print {
          @page { size: A4; margin: 8mm; }
          html, body { background: #fff !important; }
          .no-print { display: none !important; }
          .angebot { -webkit-print-color-adjust: exact; print-color-adjust: exact; min-height: 0 !important; }
          .angebot .blatt { max-width: none !important; padding: 0 !important; }
          .angebot section.block { break-inside: auto; }
        }
      `}</style>
    </div>
  );
}

const toolbarBtn = (primary) => ({
  minHeight: 36, padding: '0 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: FONT,
  background: primary ? '#B5A171' : 'transparent', color: primary ? '#111' : '#fff', border: primary ? 0 : '1px solid rgba(255,255,255,0.4)',
});
