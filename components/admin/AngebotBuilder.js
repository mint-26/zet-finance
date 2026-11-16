'use client';

import { useState } from 'react';
import SmoothHeight from '../SmoothHeight';
import { FOKUS, fokusTarife, standardTarif, berechneBeitrag, euro } from '../../lib/tarife';
import { leistungenVon } from '../../lib/leistungen';
import { selectLook } from './ui';

// Marco's usual comparison: his three column names and the tariffs of the "ZZV 100%" offer.
const VORLAGE = [
  { gesellschaft: 'Allianz', tarif: 'MeinZahnschutz 100', label: 'Komfort+' },
  { gesellschaft: 'Münchener Verein', tarif: 'ZahnGesund 100', label: 'Premium' },
  { gesellschaft: 'Bayerische Beamtenkrankenkasse (BBKK)', tarif: 'ZahnPRIVAT 100', label: 'Premium+' },
];

const field = {
  height: 40, padding: '0 10px', boxSizing: 'border-box', background: 'var(--input-bg)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text-body)', fontSize: 14, fontFamily: "'DM Sans', sans-serif", minWidth: 0, width: '100%',
};
const optionStyle = { background: 'var(--select-option-bg)', color: 'var(--text-body)' };

// "Angebot erstellen" in the lead details: three tariffs, their column names and the recommended
// one; opens the offer page (app/admin/angebot/[id]) in a new tab, ready to save as PDF.
export default function AngebotBuilder({ s }) {
  const [open, setOpen] = useState(false);
  const [spalten, setSpalten] = useState(VORLAGE);
  const [empfohlen, setEmpfohlen] = useState(2);
  const [mitGesellschaft, setMitGesellschaft] = useState(false);

  const heute = new Date();
  const beginn = new Date(heute.getFullYear(), heute.getMonth() + 1, 1);
  const set = (i, patch) => setSpalten((prev) => prev.map((sp, j) => (j === i ? { ...sp, ...patch } : sp)));

  const oeffnen = () => {
    const p = new URLSearchParams();
    spalten.forEach((sp) => p.append('t', `${sp.gesellschaft}|${sp.tarif}|${sp.label.trim() || sp.tarif}`));
    if (empfohlen >= 0) p.set('e', String(empfohlen));
    if (mitGesellschaft) p.set('g', '1');
    window.open(`/admin/angebot/${s.id}?${p.toString()}`, '_blank', 'noopener');
  };

  return (
    <section style={{ border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20, background: 'var(--bg-card)' }}>
      <button
        type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', minHeight: 52, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          background: 'transparent', border: 0, textAlign: 'left', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)',
        }}
      >
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></svg>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Angebot erstellen</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>Vergleich von drei Tarifen, als PDF</span>
      </button>
      <SmoothHeight duration={300}>
        {open && (
          <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {spalten.map((sp, i) => {
              const r = berechneBeitrag({ gesellschaft: sp.gesellschaft, tarif: sp.tarif, geburtsdatum: s.geburtsdatum, fehlendeZaehne: s.fehlende_zaehne }, beginn);
              const hatLeistungen = !!leistungenVon(sp.gesellschaft, sp.tarif);
              return (
                <div key={i} className="angebot-zeile">
                  <input aria-label={`Spaltenname ${i + 1}`} value={sp.label} onChange={(e) => set(i, { label: e.target.value })} style={field} />
                  <select
                    aria-label={`Gesellschaft ${i + 1}`} value={sp.gesellschaft} style={{ ...field, ...selectLook }}
                    onChange={(e) => set(i, { gesellschaft: e.target.value, tarif: standardTarif(e.target.value) || fokusTarife(e.target.value)[0] })}
                  >
                    {Object.keys(FOKUS).map((g) => <option key={g} value={g} style={optionStyle}>{g}</option>)}
                  </select>
                  <select aria-label={`Tarif ${i + 1}`} value={sp.tarif} onChange={(e) => set(i, { tarif: e.target.value })} style={{ ...field, ...selectLook }}>
                    {fokusTarife(sp.gesellschaft).map((t) => <option key={t} value={t} style={optionStyle}>{t}</option>)}
                  </select>
                  <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums', color: r.ok ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: r.ok ? 600 : 400 }}>
                    {r.ok ? `${euro(r.beitrag)} mtl.` : r.grund}
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 400, color: hatLeistungen ? 'var(--text-muted)' : '#c9762b' }}>
                      {hatLeistungen ? 'Leistungen hinterlegt' : 'Leistungen fehlen noch'}
                    </span>
                  </span>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="radio" name={`empfehlung-${s.id}`} checked={empfohlen === i} onChange={() => setEmpfohlen(i)} />
                    Empfehlung
                  </label>
                </div>
              );
            })}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" checked={mitGesellschaft} onChange={(e) => setMitGesellschaft(e.target.checked)} />
                Gesellschaft und Tarif im Angebot nennen
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="radio" name={`empfehlung-${s.id}`} checked={empfohlen === -1} onChange={() => setEmpfohlen(-1)} />
                Ohne Empfehlung
              </label>
              <button
                type="button" onClick={oeffnen} disabled={!s.geburtsdatum}
                style={{
                  marginLeft: 'auto', minHeight: 42, padding: '0 18px', borderRadius: 10, border: 0, cursor: s.geburtsdatum ? 'pointer' : 'not-allowed',
                  background: s.geburtsdatum ? 'linear-gradient(135deg, var(--accent), var(--accent-light))' : 'var(--text-dim)',
                  color: 'var(--bg-primary)', fontWeight: 700, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                }}
              >Angebot öffnen</button>
            </div>
            {!s.geburtsdatum && <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Für die Beiträge fehlt das Geburtsdatum (unter „Kundenangaben“ eintragen).</p>}
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-dim)' }}>
              Beiträge für einen Beginn am {beginn.toLocaleDateString('de-DE')}. Das Angebot öffnet sich in einem neuen Tab, dort „Als PDF speichern“.
            </p>
          </div>
        )}
      </SmoothHeight>
    </section>
  );
}
