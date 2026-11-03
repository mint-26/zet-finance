'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';

const MIN_CHARS = 4;
const DEBOUNCE_MS = 250;

// Text field with address suggestions from /api/adresse. Free typing always works, so a
// missing address or a failing service never blocks the form. The list opens in the page
// flow because the questionnaire card clips overflowing content.
const AddressInput = forwardRef(function AddressInput({ id, value, onChange, style, placeholder, ...rest }, ref) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [missingNumber, setMissingNumber] = useState(false);
  // Also true on mount: a value restored by "Zurück" should not trigger a new search.
  const skipSearch = useRef(true);

  useEffect(() => {
    if (skipSearch.current) { skipSearch.current = false; return undefined; }
    const q = value.trim();
    if (q.length < MIN_CHARS) { setResults([]); setOpen(false); return undefined; }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/adresse?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = await res.json();
        setResults(data.results || []);
        setActive(-1);
        setOpen((data.results || []).length > 0 && document.activeElement?.id === id);
      } catch {
        // Aborted or offline: keep typing by hand.
      }
    }, DEBOUNCE_MS);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [value, id]);

  const choose = (item) => {
    skipSearch.current = true;
    // A street without number: leave the cursor behind it, so the number can be typed right away.
    onChange(item.complete ? item.label : `${item.label} `);
    setMissingNumber(!item.complete);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); choose(results[active]); }
  };

  return (
    <div>
      <input
        {...rest} ref={ref} id={id} style={style} value={value} placeholder={placeholder}
        role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`}
        aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
        onChange={(e) => { setMissingNumber(false); onChange(e.target.value); }}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
        onFocus={() => { if (results.length && !missingNumber) setOpen(true); }}
      />
      {missingNumber && (
        <p style={{ fontSize: 13, color: 'var(--accent)', lineHeight: 1.45, margin: '7px 0 0' }}>Bitte ergänzen Sie noch Ihre Hausnummer.</p>
      )}
      {open && (
        <div style={{ marginTop: 8, background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <ul id={`${id}-list`} role="listbox" aria-label="Adressvorschläge" style={{ listStyle: 'none', margin: 0, padding: 4 }}>
            {results.map((item, i) => (
              <li
                key={item.label} id={`${id}-opt-${i}`} role="option" aria-selected={active === i}
                onMouseDown={(e) => { e.preventDefault(); choose(item); }} onMouseEnter={() => setActive(i)}
                style={{
                  minHeight: 44, display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                  background: active === i ? 'var(--accent-dim)' : 'transparent',
                  fontSize: 14, lineHeight: 1.35, color: 'var(--text-body)',
                }}
              >
                {item.label}
              </li>
            ))}
          </ul>
          <p style={{ margin: 0, padding: '6px 16px 8px', fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
            Adressdaten © OpenStreetMap-Mitwirkende
          </p>
        </div>
      )}
    </div>
  );
});

export default AddressInput;
