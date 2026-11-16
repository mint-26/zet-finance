'use client';

import { useState } from 'react';
import SmoothHeight from '../SmoothHeight';
import { Chevron } from './Periods';
import { isAntrag } from './Auswertung';
import { berechneBeitrag, tarifOderStandard, euro } from '../../lib/tarife';

const th = { padding: '8px 10px', fontSize: 11, fontWeight: 400, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left', whiteSpace: 'nowrap' };
const td = { padding: '9px 10px', verticalAlign: 'top' };
const num = { ...td, textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' };

// Insured customers whose premium rises on the coming 1 January because they reach the next age
// band (lib/tarife.js): a reason for Marco to call, and later the base for Bestandsprovision.
// Worked out from the premium tables, so it is today's table price, not the policy.
export default function Erhoehungen({ rows, onOpenLead }) {
  const [open, setOpen] = useState(false);
  const heute = new Date();
  const stichtag = new Date(heute.getFullYear() + 1, 0, 1);
  const liste = rows.filter(isAntrag).map((row) => {
    const args = { gesellschaft: row.gesellschaft, tarif: row.tarif, geburtsdatum: row.geburtsdatum, fehlendeZaehne: row.fehlende_zaehne };
    const jetzt = berechneBeitrag(args, heute);
    const dann = berechneBeitrag(args, stichtag);
    if (!jetzt.ok || !dann.ok || dann.beitrag <= jetzt.beitrag) return null;
    return { row, jetzt, dann, mehr: Math.round((dann.beitrag - jetzt.beitrag) * 100) / 100 };
  }).filter(Boolean).sort((a, b) => b.mehr - a.mehr);
  const summe = Math.round(liste.reduce((s, x) => s + x.mehr, 0) * 100) / 100;
  const datum = stichtag.toLocaleDateString('de-DE');

  return (
    <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24 }}>
      <button
        type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', minHeight: 60, padding: '12px 20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 12px',
          background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)',
        }}
      >
        <Chevron open={open} />
        <span style={{ fontSize: 17, fontWeight: 600 }}>Altersbedingte Erhöhungen zum {datum}</span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {liste.length} {liste.length === 1 ? 'Kunde' : 'Kunden'}{liste.length ? `, zusammen + ${euro(summe)} mtl.` : ''}
        </span>
      </button>
      <SmoothHeight duration={350}>
        {open && (
          <div style={{ padding: '0 20px 20px' }}>
            {liste.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)' }}>Zum {datum} wechselt kein versicherter Kunde in eine teurere Altersstufe.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 620, borderCollapse: 'collapse', fontSize: 14, color: 'var(--text-body)' }}>
                  <thead>
                    <tr>
                      <th scope="col" style={th}>Kunde</th>
                      <th scope="col" style={th}>Gesellschaft, Tarif</th>
                      <th scope="col" style={{ ...th, textAlign: 'right' }}>Alter ab Jan.</th>
                      <th scope="col" style={{ ...th, textAlign: 'right' }}>Heute</th>
                      <th scope="col" style={{ ...th, textAlign: 'right' }}>Ab {datum}</th>
                      <th scope="col" style={{ ...th, textAlign: 'right' }}>Erhöhung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liste.map(({ row, jetzt, dann, mehr }) => (
                      <tr key={row.id} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={td}>
                          <button
                            type="button" onClick={() => onOpenLead(row)} title="Kunden in den Leads öffnen"
                            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left', font: 'inherit', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: 'var(--border-strong)', textUnderlineOffset: 3 }}
                          >{row.name || 'Ohne Name'}</button>
                        </td>
                        <td style={{ ...td, color: 'var(--text-muted)' }}>{row.gesellschaft}, {tarifOderStandard(row.gesellschaft, row.tarif)}</td>
                        <td style={num}>{dann.alter}</td>
                        <td style={num}>{euro(jetzt.beitrag)}</td>
                        <td style={num}>{euro(dann.beitrag)}</td>
                        <td style={{ ...num, fontWeight: 600, color: 'var(--text-primary)' }}>+ {euro(mehr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Alle versicherten Kunden der fünf Fokusgesellschaften, über alle Jahre. Gerechnet mit den hinterlegten Beitragstabellen (heute gegen {datum}),
              inklusive Zuschlag für fehlende Zähne; der tatsächliche Vertragsbeitrag kann abweichen.
            </p>
          </div>
        )}
      </SmoothHeight>
    </section>
  );
}
