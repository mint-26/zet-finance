'use client';

import { useState } from 'react';
import { useTheme } from '../ThemeProvider';
import SmoothHeight from '../SmoothHeight';
import { InsurerLogo } from '../InsurerSelect';
import { Chevron } from './Periods';
import { selectLook } from './ui';
import { GESELLSCHAFTEN, gesellschaftByName } from '../../lib/gesellschaften';

// Marco's rule (04.11.2026): the Gesellschaft is chosen as soon as a customer gets an offer,
// whatever the status; a customer counts in this overview once set to "Versichert".
const ANTRAG_STATUS = ['versichert'];

export const isAntrag = (row) => !!row.gesellschaft && ANTRAG_STATUS.includes(row.status) && row.quelle !== 'whatsapp_test';

// Eight-colour chart palette, checked with the dataviz validator against both CRM themes. The
// first seven colours follow the entities with the most applications overall, so a colour
// does not change with the period. Everything else folds into grey "Sonstige".
const PALETTE = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9'],
};
const NEUTRAL = { light: { rest: '#a9a9a3', none: '#d4d4cf' }, dark: { rest: '#8d8d88', none: '#6c6c68' } };
const REST = '__sonstige';
const NO_TARIF = '__ohne';

const percent = (count, total) => `${(total ? (count / total) * 100 : 0).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`;

// Rows grouped by Gesellschaft, or by Tarif (optionally of one Gesellschaft). Spelling of a
// tariff may vary, since it is typed by hand: case and outer spaces do not count.
function buildItems(rows, view, scope) {
  const items = new Map();
  rows.filter((r) => view === 'gesellschaften' || !scope || r.gesellschaft === scope).forEach((r) => {
    const tarif = (r.tarif || '').trim();
    let item;
    if (view === 'gesellschaften') item = { key: r.gesellschaft, label: r.gesellschaft, logoOf: r.gesellschaft };
    else if (!tarif) item = { key: NO_TARIF, label: 'Ohne Tarifangabe' };
    else item = { key: `${r.gesellschaft}|${tarif.toLowerCase()}`, label: tarif, logoOf: scope ? null : r.gesellschaft };
    if (!items.has(item.key)) items.set(item.key, { ...item, count: 0 });
    items.get(item.key).count += 1;
  });
  return [...items.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'de'));
}

function Donut({ segments, total, center, activeKey, onHover }) {
  const size = 240;
  const r = 96;
  const gap = segments.length > 1 ? 0.7 : 0;
  let start = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Ringdiagramm, ${total} Anträge. Die Zahlen stehen in der Tabelle.`} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        {segments.map((seg) => {
          const share = (seg.count / total) * 100;
          const length = Math.max(share - gap, 0.2);
          const offset = -start;
          start += share;
          return (
            <circle
              key={seg.key} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={seg.color} strokeWidth={32}
              pathLength={100} strokeDasharray={`${length} ${100 - length}`} strokeDashoffset={offset}
              onMouseEnter={() => onHover(seg.key)} onMouseLeave={() => onHover(null)} onClick={() => onHover(seg.key)}
              style={{
                cursor: 'pointer', opacity: activeKey && activeKey !== seg.key ? 0.3 : 1,
                transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease, opacity 0.2s ease',
              }}
            />
          );
        })}
      </svg>
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 48, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', pointerEvents: 'none',
      }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 30, lineHeight: 1.1, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{center.value}</span>
        <span style={{ fontSize: 13, lineHeight: 1.3, color: 'var(--text-muted)', marginTop: 4 }}>{center.label}</span>
      </div>
    </div>
  );
}

const switchBtn = (active) => ({
  minHeight: 40, padding: '0 16px', cursor: 'pointer', border: 0,
  background: active ? 'var(--accent)' : 'transparent',
  color: active ? 'var(--bg-primary)' : 'var(--text-body)',
  fontWeight: active ? 700 : 500, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
});

const th = { padding: '0 0 8px', fontSize: 11, fontWeight: 400, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 };
const num = { textAlign: 'right', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', paddingLeft: 12 };

// Fold-out overview above the lead list: how the applications of the chosen period spread
// over insurers and tariffs, as a ring plus a table with count and share.
export default function Auswertung({ rows, allRows, periodText }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('gesellschaften');
  const [scope, setScope] = useState('');
  const [hover, setHover] = useState(null);

  const mode = theme === 'dark' ? 'dark' : 'light';
  const antraege = rows.filter(isAntrag);
  const ohneGesellschaft = rows.filter((r) => ANTRAG_STATUS.includes(r.status) && !r.gesellschaft && r.quelle !== 'whatsapp_test').length;
  const items = buildItems(antraege, view, scope);
  const total = items.reduce((sum, i) => sum + i.count, 0);

  const colorKeys = buildItems(allRows.filter(isAntrag), view, scope).filter((i) => i.key !== NO_TARIF).slice(0, PALETTE.light.length).map((i) => i.key);
  const colorOf = (key) => {
    if (key === NO_TARIF) return NEUTRAL[mode].none;
    const slot = colorKeys.indexOf(key);
    return slot === -1 ? NEUTRAL[mode].rest : PALETTE[mode][slot];
  };
  const segmentOf = (item) => (item.key === NO_TARIF || colorKeys.includes(item.key) ? item.key : REST);

  const segments = [];
  items.forEach((item) => {
    const key = segmentOf(item);
    const existing = segments.find((s) => s.key === key);
    if (existing) existing.count += item.count;
    else segments.push({ key, count: item.count, label: key === REST ? 'Sonstige' : item.label, color: colorOf(item.key) });
  });
  // Grey parts last, so the named segments run clockwise from largest to smallest.
  segments.sort((a, b) => Number(a.key === REST || a.key === NO_TARIF) - Number(b.key === REST || b.key === NO_TARIF));

  const active = segments.find((s) => s.key === hover);
  const center = active
    ? { value: percent(active.count, total), label: `${active.label}, ${active.count}` }
    : { value: total, label: total === 1 ? 'Antrag' : 'Anträge' };

  const summaryItems = buildItems(antraege, 'gesellschaften', '');
  const summaryTotal = antraege.length;
  const top = summaryItems[0];
  const inData = summaryItems.map((i) => i.key);
  const scopeOptions = GESELLSCHAFTEN.map((g) => g.name).filter((n) => inData.includes(n) || n === scope);

  const showTarife = (name) => { setScope(name); setView('tarife'); setHover(null); };

  return (
    <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24 }}>
      <button
        type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', minHeight: 60, padding: '12px 20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 12px',
          background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left',
          fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)',
        }}
      >
        <Chevron open={open} />
        <span style={{ fontSize: 17, fontWeight: 600 }}>Auswertung</span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {periodText}: {summaryTotal} {summaryTotal === 1 ? 'Antrag' : 'Anträge'}
          {top ? `, davon ${percent(top.count, summaryTotal)} ${top.label}` : ''}
        </span>
      </button>

      <SmoothHeight duration={400}>
        {open && (
          <div style={{ padding: '8px 20px 24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div role="group" aria-label="Ansicht" style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <button type="button" aria-pressed={view === 'gesellschaften'} onClick={() => { setView('gesellschaften'); setHover(null); }} style={switchBtn(view === 'gesellschaften')}>Gesellschaften</button>
                <button type="button" aria-pressed={view === 'tarife'} onClick={() => { setView('tarife'); setHover(null); }} style={switchBtn(view === 'tarife')}>Tarife</button>
              </div>
              {view === 'tarife' && (
                <select
                  value={scope} onChange={(e) => { setScope(e.target.value); setHover(null); }} aria-label="Gesellschaft für die Tarife"
                  style={{
                    height: 42, padding: '0 12px', background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8,
                    color: 'var(--text-body)', fontSize: 14, fontFamily: "'DM Sans', sans-serif", maxWidth: '100%', ...selectLook,
                  }}
                >
                  <option value="">Alle Gesellschaften</option>
                  {scopeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              )}
            </div>

            {total === 0 ? (
              <p style={{ margin: 0, padding: '24px 0', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
                In diesem Zeitraum sind keine Anträge erfasst.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '24px 48px' }}>
                <div style={{ flex: '0 1 240px', margin: '0 auto' }}>
                  <Donut segments={segments} total={total} center={center} activeKey={hover} onHover={setHover} />
                </div>
                <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, color: 'var(--text-body)' }}>
                    <thead>
                      <tr>
                        <th scope="col" style={{ ...th, textAlign: 'left' }}>{view === 'tarife' ? 'Tarif' : 'Gesellschaft'}</th>
                        <th scope="col" style={{ ...th, ...num }}>Anzahl</th>
                        <th scope="col" style={{ ...th, ...num }}>Anteil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item.key} onMouseEnter={() => setHover(segmentOf(item))} onMouseLeave={() => setHover(null)}
                          style={{ borderTop: '1px solid var(--border)', background: hover && hover === segmentOf(item) ? 'var(--accent-dim)' : 'transparent', transition: 'background 0.2s ease' }}
                        >
                          <td style={{ padding: '6px 0' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px 10px', minWidth: 0, overflowWrap: 'anywhere' }}>
                              <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: colorOf(item.key) }} />
                              {item.logoOf && <InsurerLogo item={gesellschaftByName(item.logoOf) || { name: item.logoOf }} />}
                              {view === 'gesellschaften' ? (
                                <button
                                  type="button" onClick={() => showTarife(item.key)} title="Tarife dieser Gesellschaft ansehen"
                                  style={{
                                    background: 'none', border: 0, padding: '6px 0', cursor: 'pointer', textAlign: 'left', minWidth: 0,
                                    font: 'inherit', color: 'inherit', textDecoration: 'underline', textDecorationColor: 'var(--border-strong)', textUnderlineOffset: 3,
                                  }}
                                >{item.label}</button>
                              ) : <span style={{ padding: '6px 0' }}>{item.label}</span>}
                            </div>
                          </td>
                          <td style={num}>{item.count}</td>
                          <td style={num}>{percent(item.count, total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <p style={{ margin: '20px 0 0', fontSize: 12, lineHeight: 1.5, color: 'var(--text-dim)' }}>
              Gezählt werden Kunden mit Status „Versichert“ und gewählter Gesellschaft, nach Datum der Anfrage.
              {ohneGesellschaft > 0 && ` ${ohneGesellschaft} ${ohneGesellschaft === 1 ? 'versicherter Kunde hat' : 'versicherte Kunden haben'} in diesem Zeitraum noch keine Gesellschaft und ${ohneGesellschaft === 1 ? 'fehlt' : 'fehlen'} hier.`}
            </p>
          </div>
        )}
      </SmoothHeight>
    </section>
  );
}
