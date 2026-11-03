'use client';

import { useState, useRef, useEffect } from 'react';

const OTHER = '__andere__';

const normalize = (s) => s.toLowerCase()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z0-9]/g, '');

const initials = (name) => name.replace(/[^\p{L}\p{N} ]/gu, ' ').trim().split(/\s+/)
  .slice(0, 2).map((w) => w[0]).join('').toUpperCase();

function Logo({ item }) {
  const box = {
    flexShrink: 0, width: 64, height: 34, borderRadius: 6, background: '#FFFFFF',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', boxSizing: 'border-box', padding: 3,
  };
  if (item.logo) {
    return (
      <span style={box}>
        <img src={item.logo} alt="" loading="lazy" width="56" height="26" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </span>
    );
  }
  return (
    <span aria-hidden="true" style={{ ...box, fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)' }}>
      {initials(item.name)}
    </span>
  );
}

const Rate = ({ value }) => (value ? (
  <span style={{ flexShrink: 0, fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{value}&nbsp;%</span>
) : null);

// Searchable dropdown with logos. The list opens in the page flow instead of floating,
// because the questionnaire card clips overflowing content (SmoothHeight, DentalReveal).
// value: name of the chosen item, or '' ; isOther: "Nicht in der Liste" was chosen.
export default function InsurerSelect({ id, items, value, isOther, onSelect, onChooseOther, placeholder, searchLabel, invalid }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const buttonRef = useRef(null);

  const q = normalize(query);
  const matches = q ? items.filter((i) => normalize(i.name).includes(q)) : items;
  const options = [...matches, { name: 'Nicht in der Liste', key: OTHER }];
  const selected = items.find((i) => i.name === value);

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus({ preventScroll: true });
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const choose = (opt) => {
    if (opt.key === OTHER) onChooseOther();
    else onSelect(opt);
    setOpen(false);
    setQuery('');
    buttonRef.current?.focus({ preventScroll: true });
  };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (options[active]) choose(options[active]); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); buttonRef.current?.focus({ preventScroll: true }); }
  };

  const shell = {
    width: '100%', boxSizing: 'border-box', background: 'var(--input-bg)',
    border: `1px solid ${invalid ? '#A33A2A' : (open ? 'var(--accent)' : 'var(--border)')}`, borderRadius: 10,
    transition: 'border-color 0.2s',
  };

  return (
    <div ref={rootRef}>
      <button
        ref={buttonRef} id={id} type="button" aria-haspopup="listbox" aria-expanded={open}
        aria-invalid={invalid || undefined} aria-describedby={invalid ? `${id}-error` : undefined}
        onClick={() => setOpen((o) => !o)}
        style={{
          ...shell, display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '10px 14px',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: 16, color: 'var(--text-body)',
        }}
      >
        {selected && <Logo item={selected} />}
        <span style={{ flex: 1, minWidth: 0, color: selected || isOther ? 'var(--text-body)' : 'var(--text-muted)', lineHeight: 1.35 }}>
          {selected ? selected.name : (isOther ? 'Nicht in der Liste' : placeholder)}
        </span>
        {selected && <Rate value={selected.rate} />}
        <span aria-hidden="true" style={{ flexShrink: 0, fontSize: 11, color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {open && (
        <div style={{ ...shell, marginTop: 8, overflow: 'hidden' }}>
          <input
            ref={inputRef} type="text" role="combobox" aria-expanded="true" aria-autocomplete="list"
            aria-controls={`${id}-list`} aria-activedescendant={`${id}-opt-${active}`} aria-label={searchLabel}
            value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKey}
            placeholder="Namen eingeben ..." autoComplete="off"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '13px 16px', border: 0, outline: 'none',
              borderBottom: '1px solid var(--border)', background: 'transparent',
              fontFamily: 'inherit', fontSize: 16, color: 'var(--text-body)',
            }}
          />
          <ul ref={listRef} id={`${id}-list`} role="listbox" aria-label={searchLabel} style={{ listStyle: 'none', margin: 0, padding: 4, maxHeight: 300, overflowY: 'auto', overscrollBehavior: 'contain' }}>
            {options.map((opt, i) => (
              <li
                key={opt.key || opt.name} id={`${id}-opt-${i}`} role="option" aria-selected={opt.name === value}
                onMouseDown={(e) => e.preventDefault()} onClick={() => choose(opt)} onMouseEnter={() => setActive(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, minHeight: 48, padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                  background: active === i ? 'var(--accent-dim)' : 'transparent',
                  borderTop: opt.key === OTHER ? '1px solid var(--border)' : 0,
                  fontSize: 14, lineHeight: 1.35, color: 'var(--text-body)',
                }}
              >
                {opt.key !== OTHER && <Logo item={opt} />}
                <span style={{ flex: 1, minWidth: 0, fontWeight: opt.key === OTHER ? 600 : 400 }}>{opt.name}</span>
                <Rate value={opt.rate} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
