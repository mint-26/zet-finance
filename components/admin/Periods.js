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

// Months side by side as switches, newest first, all the same height: month, year, number of
// leads and, if any, how many are open, so a new enquiry cannot go unnoticed in another month.
// The chosen month's status counts sit above its list (MonthSummary), not in the tile, so the
// tiles never grow and the rows stay even. Tiles wrap instead of scrolling, so no month is hidden.
export function MonthTabs({ months, activeKey, onToggle }) {
  return (
    <div role="group" aria-label="Monat" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
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
              <span style={{ display: 'flex', opacity: active ? 0.85 : 0.5, transform: active ? 'rotate(90deg)' : 'none', transition: 'transform 0.25s ease' }}><Chevron open={false} /></span>
            </span>
            <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
              <span style={{ opacity: active ? 0.85 : 0.65 }}>{count} {count === 1 ? 'Lead' : 'Leads'}</span>
              {offen > 0 && <span style={{ fontWeight: 700 }}> · {offen} offen</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Status counts of the chosen month, as a calm row above its leads.
export function MonthSummary({ month }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 18px', padding: '12px 16px',
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginRight: 4 }}>{month.label}</span>
      {STATUS_OPTIONS.map((option) => {
        const amount = month.rows.filter((r) => (r.status || 'offen') === option.value).length;
        return (
          <span key={option.value} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, whiteSpace: 'nowrap',
            color: amount > 0 ? 'var(--text-body)' : 'var(--text-dim)',
            fontWeight: option.value === 'offen' && amount > 0 ? 700 : 400,
          }}>
            <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: option.color, opacity: amount > 0 ? 1 : 0.45 }} />
            {option.label}
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{amount}</span>
          </span>
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
