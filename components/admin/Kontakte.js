'use client';

import { useState } from 'react';

// Follow-up log in the lead details: "Kunde kontaktiert" with a date (default today) and a short
// note on where things stand. Stored in the column kontakte as [{ am, text }], newest first; the
// lead row in the list shows the count and the last date (KontaktIcon).

const heuteIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const datumDe = (iso) => String(iso || '').slice(0, 10).split('-').reverse().join('.');
export const kontakteVon = (s) => (Array.isArray(s.kontakte) ? s.kontakte : []);

const field = {
  height: 42, padding: '0 12px', boxSizing: 'border-box', background: 'var(--input-bg)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text-body)', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
};
const btn = (primary) => ({
  minHeight: 40, padding: '0 16px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
  background: primary ? 'linear-gradient(135deg, var(--accent), var(--accent-light))' : 'transparent',
  color: primary ? 'var(--bg-primary)' : 'var(--text-primary)', border: primary ? 0 : '1px solid var(--accent)',
  display: 'inline-flex', alignItems: 'center', gap: 8,
});

export function KontaktSymbol({ size = 16 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

// Small marker for the lead row: how often and when the customer was last contacted.
export function KontaktIcon({ s }) {
  const liste = kontakteVon(s);
  if (!liste.length) return null;
  const letzter = liste[0];
  const titel = `${liste.length} ${liste.length === 1 ? 'Kontakt' : 'Kontakte'}, zuletzt am ${datumDe(letzter.am)}${letzter.text ? `: ${letzter.text}` : ''}`;
  return (
    <span
      role="img" title={titel} aria-label={titel}
      style={{
        flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999,
        fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-dim)', fontVariantNumeric: 'tabular-nums',
      }}
    >
      <KontaktSymbol size={12} />
      {datumDe(letzter.am).slice(0, 6)}{liste.length > 1 ? ` · ${liste.length}` : ''}
    </span>
  );
}

export default function Kontakte({ s, onSave }) {
  const liste = kontakteVon(s);
  const [entwurf, setEntwurf] = useState(null); // { am, text } while adding
  const [speichert, setSpeichert] = useState(false);

  const speichern = async () => {
    setSpeichert(true);
    const neu = [{ am: entwurf.am || heuteIso(), text: entwurf.text.trim() }, ...liste];
    const ok = await onSave(neu);
    setSpeichert(false);
    if (ok !== false) setEntwurf(null);
  };
  const loeschen = (i) => {
    if (!confirm('Diesen Kontakt aus dem Verlauf löschen?')) return;
    onSave(liste.filter((_, j) => j !== i));
  };

  return (
    <section style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: liste.length || entwurf ? 12 : 0 }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Wiedervorlage</span>
        {!entwurf && (
          <button type="button" onClick={() => setEntwurf({ am: heuteIso(), text: '' })} style={btn(false)}>
            <KontaktSymbol /> Kunde kontaktiert
          </button>
        )}
        {liste.length > 0 && !entwurf && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {liste.length} {liste.length === 1 ? 'Kontakt' : 'Kontakte'}, zuletzt am {datumDe(liste[0].am)}
          </span>
        )}
      </div>

      {entwurf && (
        <div style={{ border: '1px solid var(--accent)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12, background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              Kontaktiert am
              <input type="date" value={entwurf.am} max={heuteIso()} onChange={(e) => setEntwurf({ ...entwurf, am: e.target.value })} style={field} />
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            Stand der Dinge
            <textarea
              value={entwurf.text} onChange={(e) => setEntwurf({ ...entwurf, text: e.target.value })} rows={3} maxLength={2000} autoFocus
              placeholder="z. B. Hat das Angebot gelesen, überlegt noch, meldet sich bis Freitag."
              style={{ ...field, height: 'auto', minHeight: 72, padding: '10px 12px', resize: 'vertical', lineHeight: 1.45 }}
            />
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setEntwurf(null)} style={btn(false)}>Abbrechen</button>
            <button type="button" onClick={speichern} disabled={speichert || !entwurf.am} style={btn(true)}>{speichert ? 'Speichert …' : 'Kontakt speichern'}</button>
          </div>
        </div>
      )}

      {liste.length > 0 && (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
          {liste.map((k, i) => (
            <li key={`${k.am}-${i}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderTop: '1px dashed var(--border)', fontSize: 14 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', minWidth: 86 }}>{datumDe(k.am)}</span>
              <span style={{ flex: 1, color: k.text ? 'var(--text-body)' : 'var(--text-dim)', whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{k.text || 'Ohne Notiz'}</span>
              <button type="button" onClick={() => loeschen(i)} aria-label={`Kontakt vom ${datumDe(k.am)} löschen`} title="Löschen" style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--text-dim)', fontSize: 18, lineHeight: 1, padding: '0 4px' }}>×</button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
