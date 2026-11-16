'use client';

import { useState } from 'react';
import SmoothHeight from '../SmoothHeight';
import { InsurerLogo } from '../InsurerSelect';
import { Chevron } from './Periods';
import { isAntrag } from './Auswertung';
import { gesellschaftByName } from '../../lib/gesellschaften';
import { tarifOderStandard, euro } from '../../lib/tarife';
import { PROVISION, PROVISION_STAND, berechneProvision } from '../../lib/provision';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 };
const th = { padding: '10px 12px', fontSize: 11, fontWeight: 400, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left', whiteSpace: 'nowrap' };
const td = { padding: '10px 12px', verticalAlign: 'top' };
const num = { ...td, textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' };
const thNum = { ...th, textAlign: 'right' };
const sum = (list, key) => Math.round(list.reduce((s, x) => s + (x.p.ok ? x.p[key] || 0 : 0), 0) * 100) / 100;
const satzText = (satz) => `${satz.toLocaleString('de-DE', { minimumFractionDigits: 2 })} MB`;

function Kennzahl({ label, value, note }) {
  return (
    <div style={{ ...card, padding: '14px 18px', flex: '1 1 140px', minWidth: 0 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{value}</div>
      {note && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{note}</div>}
    </div>
  );
}

// The conditions of one insurer, as Marco sent them.
function Konditionen() {
  const [open, setOpen] = useState(false);
  return (
    <section style={{ ...card, marginTop: 24 }}>
      <button
        type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', minHeight: 56, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
          background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)',
        }}
      >
        <Chevron open={open} />
        <span style={{ fontSize: 16, fontWeight: 600 }}>Konditionen der Gesellschaften</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>Stand {PROVISION_STAND}</span>
      </button>
      <SmoothHeight duration={350}>
        {open && (
          <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {Object.entries(PROVISION).map(([name, r]) => (
              <div key={name} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16, fontSize: 13, lineHeight: 1.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <InsurerLogo item={gesellschaftByName(name) || { name }} />
                  <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{name}</strong>
                </div>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px' }}>
                  {[
                    ['Courtage', `${satzText(r.mb)}, Faktor ${r.faktor}`],
                    ['Stornoreserve', `${Math.round(r.reserve * 100)} % einbehalten`],
                    ['Haftungszeit', r.haftung],
                    ['Storno', r.storno],
                    ['Zuschläge', r.zuschlaege],
                    ['Auszahlung', r.auszahlung],
                    ['Bestandsprov.', r.bestand],
                    ...(r.sonderregel ? [['Sonderregel', r.sonderregel]] : []),
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'contents' }}>
                      <dt style={{ color: 'var(--text-dim)' }}>{k}</dt>
                      <dd style={{ margin: 0, color: 'var(--text-body)' }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            <p style={{ gridColumn: '1 / -1', margin: 0, fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Noch offen laut Provisionsübersicht: Höhe der Bestandsprovision, genaue Rückforderungsformeln und Freigabe der Reserve,
              die 65-Jahre-Regel der Allianz sowie die Konditionen der BBKK Direktanbindung (11 MB) und der zusätzlichen Münchener-Verein-Anbindung.
            </p>
          </div>
        )}
      </SmoothHeight>
    </section>
  );
}

// Commission for every customer set to "Versichert" in the chosen period, by insurer: customer,
// tariff, premium and what it brings. Customers count in the month of their closing, like
// everywhere in the CRM.
export default function Abrechnung({ rows, periodText, onOpenLead }) {
  const vertraege = rows.filter(isAntrag).map((row) => ({ row, p: berechneProvision(row) }));
  const groups = new Map();
  vertraege.forEach((v) => {
    if (!groups.has(v.row.gesellschaft)) groups.set(v.row.gesellschaft, []);
    groups.get(v.row.gesellschaft).push(v);
  });
  const sorted = [...groups.entries()]
    .map(([name, list]) => ({ name, list: list.sort((a, b) => (a.row.name || '').localeCompare(b.row.name || '', 'de')) }))
    .sort((a, b) => sum(b.list, 'courtage') - sum(a.list, 'courtage') || b.list.length - a.list.length);

  const ohneProvision = vertraege.filter((v) => !v.p.ok).length;
  const offen = vertraege.filter((v) => v.p.ok && !v.row.abgerechnet);
  const beitraege = Math.round(vertraege.reduce((s, v) => s + (v.p.beitrag || 0), 0) * 100) / 100;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <Kennzahl label={`Verträge, ${periodText}`} value={vertraege.length} note={ohneProvision ? `${ohneProvision} ohne berechenbare Provision` : null} />
        <Kennzahl label="Beiträge" value={euro(beitraege)} note="pro Monat, alle Verträge" />
        <Kennzahl label="Provision" value={euro(sum(vertraege, 'courtage'))} note="Abschlussprovision gesamt" />
        <Kennzahl label="Stornoreserve" value={euro(sum(vertraege, 'reserve'))} note="10 % einbehalten" />
        <Kennzahl label="Auszahlung" value={euro(sum(vertraege, 'auszahlung'))} note={offen.length ? `${euro(sum(offen, 'auszahlung'))} noch nicht abgerechnet` : 'alles abgerechnet'} />
      </div>

      {sorted.length === 0 ? (
        <p style={{ ...card, margin: 0, padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>In diesem Zeitraum ist kein Kunde versichert.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sorted.map(({ name, list }) => {
            const regel = PROVISION[name];
            return (
              <section key={name} style={{ ...card, overflow: 'hidden' }}>
                <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 14px', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <InsurerLogo item={gesellschaftByName(name) || { name }} />
                  <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>{name}</strong>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {list.length} {list.length === 1 ? 'Vertrag' : 'Verträge'}{regel ? `, ${satzText(regel.mb)}` : ', keine Courtagevereinbarung hinterlegt'}
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{list.some((v) => v.p.ok) ? euro(sum(list, 'courtage')) : '–'}</span>
                </header>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse', fontSize: 14, color: 'var(--text-body)' }}>
                    <thead>
                      <tr>
                        <th scope="col" style={th}>Kunde</th>
                        <th scope="col" style={th}>Tarif</th>
                        <th scope="col" style={thNum}>Beitrag</th>
                        <th scope="col" style={thNum}>Provision</th>
                        <th scope="col" style={thNum}>Reserve</th>
                        <th scope="col" style={thNum}>Auszahlung</th>
                        <th scope="col" style={th}>Abgerechnet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map(({ row, p }) => (
                        <tr key={row.id} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={td}>
                            <button
                              type="button" onClick={() => onOpenLead(row)} title="Kunden in den Leads öffnen"
                              style={{
                                background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left', font: 'inherit', fontWeight: 600,
                                color: 'var(--text-primary)', textDecoration: 'underline', textDecorationColor: 'var(--border-strong)', textUnderlineOffset: 3,
                              }}
                            >{row.name || 'Ohne Name'}</button>
                            {(p.hinweise || []).concat(p.ok ? [] : [p.grund]).map((h) => (
                              <div key={h} style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{h}</div>
                            ))}
                          </td>
                          <td style={{ ...td, color: 'var(--text-muted)' }}>{tarifOderStandard(row.gesellschaft, row.tarif) || '–'}</td>
                          <td style={num}>
                            {p.beitrag != null ? euro(p.beitrag) : '–'}
                            {p.beitragQuelle && <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{p.beitragQuelle}</div>}
                          </td>
                          <td style={{ ...num, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {p.ok ? euro(p.courtage) : '–'}
                            {p.ok && <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-dim)' }}>{p.satz ? `${euro(p.basis)} × ${satzText(p.satz)}` : p.quelle}</div>}
                          </td>
                          <td style={num}>{p.ok ? euro(p.reserve) : '–'}</td>
                          <td style={num}>{p.ok ? euro(p.auszahlung) : '–'}</td>
                          <td style={{ ...td, color: row.abgerechnet ? 'var(--pill-versichert-fg)' : 'var(--text-muted)' }}>{row.abgerechnet ? 'Ja' : 'Nein'}</td>
                        </tr>
                      ))}
                    </tbody>
                    {regel && (
                      <tfoot>
                        <tr style={{ borderTop: '1px solid var(--border-strong)' }}>
                          <td style={{ ...td, fontWeight: 600 }} colSpan={2}>Summe</td>
                          <td style={num}>{euro(Math.round(list.reduce((s, v) => s + (v.p.beitrag || 0), 0) * 100) / 100)}</td>
                          <td style={{ ...num, fontWeight: 600, color: 'var(--text-primary)' }}>{euro(sum(list, 'courtage'))}</td>
                          <td style={num}>{euro(sum(list, 'reserve'))}</td>
                          <td style={num}>{euro(sum(list, 'auszahlung'))}</td>
                          <td style={td} />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                {regel && (
                  <p style={{ margin: 0, padding: '10px 18px 14px', fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5, borderTop: '1px solid var(--border)' }}>
                    {`Haftung ${regel.haftung}. Storno: ${regel.storno.replace(/\.$/, '')}. Auszahlung: ${regel.auszahlung}.`}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}

      <p style={{ margin: '16px 0 0', fontSize: 12, lineHeight: 1.5, color: 'var(--text-dim)' }}>
        Gezählt werden Kunden mit Status „Versichert“ im Monat ihres Abschlusses. Provision = provisionsfähiger Monatsbeitrag × Courtagesatz (MB) × Faktor,
        davon 10 % Stornoreserve. Beitrag und Provision aus Marcos bisheriger Liste gelten unverändert. Ohne Tarifangabe wird mit dem 100er gerechnet.
        Prognose, keine Abrechnung der Gesellschaft: maßgeblich bleiben Police und tatsächlicher Zahlungseingang.
      </p>

      <Konditionen />
    </div>
  );
}
