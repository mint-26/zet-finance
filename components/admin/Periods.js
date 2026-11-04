'use client';

import SmoothHeight from '../SmoothHeight';

const localDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// period: 'individuell' (uses von/bis, both optional), 'gesamt', or a year as string.
export function inPeriod(row, { period, von, bis }) {
  if (period === 'gesamt') return true;
  if (!row.created_at) return false;
  const date = new Date(row.created_at);
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

// Rows (newest first) as month blocks, newest month first; months without leads are left out.
export function groupByMonth(rows) {
  const groups = new Map();
  rows.forEach((row) => {
    const date = row.created_at ? new Date(row.created_at) : null;
    const key = date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : 'ohne-datum';
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: date ? date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : 'Ohne Datum',
        rows: [],
      });
    }
    groups.get(key).rows.push(row);
  });
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

// Closed: month, year and number of leads. Open leads stay visible as a label, so a new
// enquiry cannot disappear unnoticed inside a closed month.
export function MonthBlock({ label, count, openCount, open, onToggle, children }) {
  return (
    <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
      <button
        type="button" aria-expanded={open} onClick={onToggle}
        style={{
          width: '100%', minHeight: 60, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12,
          background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left',
          fontFamily: "'DM Sans', sans-serif", color: 'var(--text-primary)',
        }}
      >
        <Chevron open={open} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 600 }}>{label}</span>
        {openCount > 0 && (
          <span style={{
            flexShrink: 0, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
            background: 'var(--accent-dim)', color: 'var(--text-primary)', border: '1px solid var(--accent)',
          }}>{openCount} offen</span>
        )}
        <span style={{ flexShrink: 0, fontSize: 14, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {count} {count === 1 ? 'Lead' : 'Leads'}
        </span>
      </button>
      <SmoothHeight duration={350}>
        {open && <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 12px 12px' }}>{children}</div>}
      </SmoothHeight>
    </section>
  );
}
