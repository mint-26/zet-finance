'use client';

import SmoothHeight from '../SmoothHeight';
import { STATUS_OPTIONS } from './ui';

const localDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// The date that places a lead: closing a customer moves them to that month, at the top, and so
// does getting back in touch ("In aktuellen Monat holen"). Otherwise a lead stays with the date
// of its enquiry, as do customers closed before the closing date existed.
export const leadDate = (row) => row.abgeschlossen_am || row.wieder_aktiv_am || row.created_at;

export const monthKeyOf = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

// period: 'individuell' (uses von/bis, both optional), 'gesamt', or a year as string.
export function inPeriod(row, { period, von, bis }) {
  if (period === 'gesamt') return true;
  if (!leadDate(row)) return false;
  const date = new Date(leadDate(row));
  if (period === 'individuell') {
    const day = localDate(date);
    return (!von || day >= von) && (!bis || day <= bis);
  }
  return String(date.getFullYear()) === period;
}

export const periodLabel = ({ period, von, bis }) => {
  if (period === 'gesamt') return 'Gesamt';
  if (period !== 'individuell') return period;
  const de = (iso) => iso.split('-').reverse().join('.');
  if (von && bis) return `${de(von)} bis ${de(bis)}`;
  if (von) return `ab ${de(von)}`;
  return bis ? `bis ${de(bis)}` : 'Gesamt';
};

// All years from the first lead up to today, oldest first.
export function yearsOf(rows) {
  const now = new Date().getFullYear();
  const first = rows.reduce((min, r) => (r.created_at ? Math.min(min, new Date(r.created_at).getFullYear()) : min), now);
  return Array.from({ length: now - first + 1 }, (_, i) => String(first + i));
}

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

// Rows grouped by month, newest month and newest lead first; months without leads are left out.
export function groupByMonth(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const date = leadDate(row) ? new Date(leadDate(row)) : null;
    const key = date ? monthKeyOf(date) : 'ohne-datum';
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: date ? date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : 'Ohne Datum',
        short: date ? `${MONTHS[date.getMonth()]} ${date.getFullYear()}` : 'Ohne Datum',
        rows: [],
      });
    }
    groups.get(key).rows.push(row);
  });
  groups.forEach((group) => group.rows.sort((a, b) => new Date(leadDate(b)) - new Date(leadDate(a))));
  return [...groups.values()].sort((a, b) => b.key.localeCompare(a.key));
}

const dateInput = {
  padding: '8px 10px', minHeight: 40, boxSizing: 'border-box', background: 'var(--input-bg)',
  border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-body)',
  fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none',
};

export function PeriodTabs({ years, value, onChange }) {
  const { period, von, bis } = value;
  const tabs = [
    { id: 'individuell', label: 'Individuell' },
    { id: 'gesamt', label: 'Gesamt' },
    ...years.map((y) => ({ id: y, label: y })),
  ];
  return (
    <div style={{ marginBottom: 16 }}>
      <div role="group" aria-label="Zeitraum" style={{
        display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', background: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: 10,
      }}>
        {tabs.map((tab, i) => {
          const active = period === tab.id;
          return (
            <button
              key={tab.id} type="button" aria-pressed={active}
              onClick={() => onChange({ ...value, period: tab.id })}
              style={{
                flex: '1 0 auto', minWidth: 64, minHeight: 48, padding: '0 12px', cursor: 'pointer',
                background: active ? 'var(--accent)' : 'transparent', border: 0,
                borderLeft: i === 0 ? 0 : '1px solid var(--border)',
                color: active ? 'var(--bg-primary)' : 'var(--text-body)',
                fontWeight: active ? 700 : 500, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                fontVariantNumeric: 'tabular-nums', transition: 'background 0.2s ease, color 0.2s ease',
              }}
            >{tab.label}</button>
          );
        })}
      </div>
      {period === 'individuell' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 16px', marginTop: 12 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            Von
            <input type="date" value={von} max={bis || undefined} onChange={(e) => onChange({ ...value, von: e.target.value })} style={dateInput} />
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            Bis
            <input type="date" value={bis} min={von || undefined} onChange={(e) => onChange({ ...value, bis: e.target.value })} style={dateInput} />
          </label>
        </div>
      )}
    </div>
  );
}

export function Chevron({ open }) {
  return (
    <svg
      aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.25s ease' }}
    ><polyline points="9 6 15 12 9 18" /></svg>
  );
}

const TILE_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Months side by side as switches, newest first. Closed, a tile shows month, year and number of
// leads; open leads stay visible as a label, so a new enquiry cannot go unnoticed in another month.
// The chosen month's tile unfolds to show every status with its count, while its leads open below.
// Tiles wrap instead of scrolling, so no month is hidden.
export function MonthTabs({ months, activeKey, onToggle }) {
  return (
    <div role="group" aria-label="Monat" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(158px, 1fr))', gap: 8, alignItems: 'start' }}>
      {months.map((month) => {
        const active = month.key === activeKey;
        const count = month.rows.length;
        const offen = month.rows.filter((r) => (r.status || 'offen') === 'offen').length;
        return (
          <button
            key={month.key} type="button" className="crm-tile" aria-expanded={active} onClick={() => onToggle(month.key)}
            style={{
              padding: 12, borderRadius: 10, cursor: 'pointer', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 2, fontFamily: "'DM Sans', sans-serif",
              background: active ? 'var(--accent)' : 'var(--bg-card)',
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
              transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{month.short}</span>
              <span style={{ display: 'flex', opacity: active ? 0.85 : 0.5 }}><Chevron open={active} /></span>
            </span>
            <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
              <span style={{ opacity: active ? 0.85 : 0.65 }}>{count} {count === 1 ? 'Lead' : 'Leads'}</span>
              {offen > 0 && <span style={{ fontWeight: 700, opacity: active ? 0 : 1, transition: 'opacity 0.2s ease' }}> · {offen} offen</span>}
            </span>
            <span aria-hidden={!active} style={{
              display: 'grid', gridTemplateRows: active ? '1fr' : '0fr', transition: `grid-template-rows 0.45s ${TILE_EASE}`,
            }}>
              <span style={{ display: 'block', minHeight: 0, overflow: 'hidden', margin: '0 -2px', padding: '0 2px' }}>
                <span style={{
                  display: 'flex', flexDirection: 'column', gap: 3, marginTop: 8, paddingTop: 8,
                  borderTop: `1px solid ${active ? 'currentColor' : 'var(--border)'}`,
                }}>
                  {STATUS_OPTIONS.map((option, i) => {
                    const amount = month.rows.filter((r) => (r.status || 'offen') === option.value).length;
                    const shown = amount > 0 ? 1 : 0.78;
                    return (
                      <span key={option.value} style={{
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, lineHeight: 1.35,
                        fontWeight: option.value === 'offen' && amount > 0 ? 700 : 400,
                        opacity: active ? shown : 0, transform: active ? 'none' : 'translateY(-4px)',
                        transition: active
                          ? `opacity 0.35s ease ${0.06 + i * 0.04}s, transform 0.45s ${TILE_EASE} ${0.06 + i * 0.04}s`
                          : 'opacity 0.12s ease, transform 0.12s ease',
                      }}>
                        <span aria-hidden="true" style={{
                          width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: option.color,
                          boxShadow: '0 0 0 1px var(--bg-primary)',
                        }} />
                        <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap' }}>{option.label}</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{amount}</span>
                      </span>
                    );
                  })}
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// The leads of the chosen month open downwards below the switches.
export function MonthPanel({ monthKey, children }) {
  return (
    <SmoothHeight duration={350}>
      {monthKey && (
        <div key={monthKey} className="crm-month" style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12 }}>
          {children}
        </div>
      )}
    </SmoothHeight>
  );
}
