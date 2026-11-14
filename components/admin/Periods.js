'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
        display: 'inline-flex', maxWidth: '100%', overflowX: 'auto', scrollbarWidth: 'none', background: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: 10,
      }}>
        {tabs.map((tab, i) => {
          const active = period === tab.id;
          return (
            <button
              key={tab.id} type="button" aria-pressed={active}
              onClick={() => onChange({ ...value, period: tab.id })}
              style={{
                flex: '0 0 auto', minWidth: 72, minHeight: 44, padding: '0 20px', cursor: 'pointer',
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

const MONTH_NAMES = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// One row per year with all twelve months, January to December, like a calendar strip; months
// without leads stay faint and cannot be chosen. Newest year on top. Each tile: month, number of
// leads and, if any, how many are open, so a new enquiry cannot go unnoticed. The chosen month's
// status counts hang right below its tile (StatusPopover). Narrow screens: rows of six or four.
export function MonthTabs({ months, activeKey, onToggle }) {
  const byKey = new Map(months.map((m) => [m.key, m]));
  const years = [...new Set(months.filter((m) => m.key !== 'ohne-datum').map((m) => m.key.slice(0, 4)))].sort().reverse();
  const undated = byKey.get('ohne-datum');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {years.map((year) => (
        <YearRow key={year} year={year} showYear={years.length > 1} byKey={byKey} activeKey={activeKey} onToggle={onToggle} />
      ))}
      {undated && <YearRow year="ohne-datum" showYear byKey={byKey} activeKey={activeKey} onToggle={onToggle} />}
    </div>
  );
}

function YearRow({ year, showYear, byKey, activeKey, onToggle }) {
  const undated = year === 'ohne-datum';
  const keys = undated ? ['ohne-datum'] : MONTH_NAMES.map((_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
  const activeIndex = keys.indexOf(activeKey);
  const active = activeIndex >= 0 ? byKey.get(activeKey) : null;
  const rowRef = useRef(null);
  const [cols, setCols] = useState(12);
  const [center, setCenter] = useState(null);

  // Columns per row (12, 6 or 4, see .crm-months) and the chosen tile's centre, for the status box.
  useIsoLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;
    const measure = () => {
      setCols(getComputedStyle(row).gridTemplateColumns.split(' ').filter(Boolean).length || 12);
      const tile = activeIndex >= 0 ? row.querySelector(`[data-index="${activeIndex}"]`) : null;
      setCenter(tile ? Math.round(tile.getBoundingClientRect().left - row.getBoundingClientRect().left + tile.offsetWidth / 2) : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    return () => ro.disconnect();
  }, [activeIndex]);

  // The status box takes the full width right after the last tile in the chosen month's row.
  const insertAfter = activeIndex >= 0 ? Math.min(keys.length - 1, Math.floor(activeIndex / cols) * cols + cols - 1) : -1;

  return (
    <div>
      {showYear && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>{undated ? 'Ohne Datum' : year}</div>}
      <div ref={rowRef} role="group" aria-label={undated ? 'Ohne Datum' : `Monate ${year}`} className="crm-months">
        {keys.flatMap((key, i) => {
          const month = byKey.get(key);
          const isActive = key === activeKey;
          const count = month?.rows.length || 0;
          const offen = month ? month.rows.filter((r) => (r.status || 'offen') === 'offen').length : 0;
          const tile = (
            <button
              key={key} type="button" className="crm-tile" data-index={i} disabled={!month}
              aria-expanded={month ? isActive : undefined} onClick={() => onToggle(key)}
              aria-label={month ? `${month.label}: ${count} ${count === 1 ? 'Lead' : 'Leads'}${offen ? `, ${offen} offen` : ''}` : undefined}
              style={{
                minWidth: 0, padding: '9px 10px', borderRadius: 10, textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 1, fontFamily: "'DM Sans', sans-serif",
                cursor: month ? 'pointer' : 'default', opacity: month ? 1 : 0.4,
                background: isActive ? 'var(--accent)' : month ? 'var(--bg-card)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                borderStyle: month ? 'solid' : 'dashed',
                color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{undated ? 'Ohne Datum' : MONTH_NAMES[i]}</span>
              <span style={{ fontSize: 12, whiteSpace: 'nowrap', opacity: isActive ? 0.85 : 0.65, fontVariantNumeric: 'tabular-nums' }}>
                {month ? `${count} ${count === 1 ? 'Lead' : 'Leads'}` : '–'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', minHeight: 15, fontVariantNumeric: 'tabular-nums' }}>
                {offen > 0 ? `${offen} offen` : ''}
              </span>
            </button>
          );
          return i === insertAfter && active ? [tile, <StatusPopover key="status" month={active} center={center} />] : [tile];
        })}
      </div>
    </div>
  );
}

const GAP = 12; // space between the tiles and the status box
const GRID_GAP = 6; // row gap of .crm-months, the line starts at the tile's lower edge

// Status counts of the chosen month: always on the left, right below the row of the chosen month,
// joined to the month by a thin line: straight up when the month sits above the box, otherwise
// from the box's right edge across and up. On phones the counts stack.
function StatusPopover({ month, center }) {
  const boxRef = useRef(null);
  const [box, setBox] = useState(null);

  useIsoLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setBox((prev) => (prev && prev.w === el.offsetWidth && prev.h === el.offsetHeight ? prev : { w: el.offsetWidth, h: el.offsetHeight }));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [month.key]);

  const above = box && center != null && center <= box.w - 18;
  const elbow = box && center != null && !above;
  const midY = GRID_GAP + GAP + (box ? box.h / 2 : 0);

  return (
    <div key={month.key} className="crm-month" style={{ gridColumn: '1 / -1', position: 'relative', paddingTop: GAP }}>
      <div ref={boxRef} className="crm-status-box" style={{
        position: 'relative', width: 'max-content', maxWidth: '100%', boxSizing: 'border-box', padding: '8px 14px',
        background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
      }}>
        {STATUS_OPTIONS.map((option) => {
          const amount = month.rows.filter((r) => (r.status || 'offen') === option.value).length;
          return (
            <span key={option.value} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, whiteSpace: 'nowrap',
              color: amount > 0 ? 'var(--text-body)' : 'var(--text-dim)',
              fontWeight: option.value === 'offen' && amount > 0 ? 700 : 400,
            }}>
              <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: option.color, opacity: amount > 0 ? 1 : 0.45 }} />
              {option.label}
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{amount}</span>
            </span>
          );
        })}
      </div>
      {(above || elbow) && (
        <svg aria-hidden="true" width={Math.max(center, box.w) + 2} height={midY} style={{ position: 'absolute', top: -GRID_GAP, left: 0, overflow: 'visible', pointerEvents: 'none' }}>
          <path
            d={above ? `M ${center} 0 V ${GRID_GAP + GAP}` : `M ${box.w} ${midY} H ${center} V 0`}
            fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"
          />
        </svg>
      )}
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
