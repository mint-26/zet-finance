'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { useLang } from './LanguageProvider';

const DEBOUNCE_MS = 120;

// Text field for the street with suggestions from /api/adresse, limited to the postcode.
// Free typing always works, so an unknown street or a failing service never blocks the form.
// The list opens in the page flow because the questionnaire card clips overflowing content.
const StreetInput = forwardRef(function StreetInput({ id, plz, value, onChange, onPick, style, placeholder, ...rest }, ref) {
  const { t } = useLang();
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [noMatch, setNoMatch] = useState(false);
  const typedNumber = useRef('');
  // Also true on mount: a value restored by "Zurück" should not trigger a new search.
  const skipSearch = useRef(true);
  // Answers may overtake each other. One is shown unless a newer one is already on screen,
  // so the list keeps updating while typing instead of waiting for a pause.
  const latest = useRef(0);
  const shown = useRef(0);

  useEffect(() => {
    if (skipSearch.current) { skipSearch.current = false; return undefined; }
    const ticket = ++latest.current;
    const q = value.trim();
    if (!/^\d{5}$/.test(plz) || (q.match(/\p{L}/gu) || []).length < 2) {
      shown.current = ticket;
      setResults([]);
      setNoMatch(false);
      setOpen(false);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/adresse?plz=${plz}&q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (ticket <= shown.current) return;
        shown.current = ticket;
        const found = data.results || [];
        typedNumber.current = data.number || '';
        setResults(found);
        setNoMatch(found.length === 0);
        setActive(-1);
        setOpen(found.length > 0 && document.activeElement?.id === id);
      } catch {
        // Offline or service down: typing by hand still works.
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value, plz, id]);

  const choose = (item) => {
    skipSearch.current = true;
    shown.current = latest.current + 1; // Answers still under way no longer count.
    latest.current = shown.current;
    setNoMatch(false);
    setOpen(false);
    onPick(item.label, typedNumber.current);
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
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
        onFocus={() => { if (results.length) setOpen(true); }}
      />
      {noMatch && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45, margin: '7px 0 0' }}>{t('Keine passende Straße in dieser Postleitzahl gefunden. Sie können sie einfach selbst eintragen.')}</p>
      )}
      {open && (
        <div style={{ marginTop: 8, background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <ul id={`${id}-list`} role="listbox" aria-label={t('Straßenvorschläge')} style={{ listStyle: 'none', margin: 0, padding: 4 }}>
            {results.map((item, i) => (
              <li
                key={item.label} id={`${id}-opt-${i}`} role="option" aria-selected={active === i}
                onMouseDown={(e) => { e.preventDefault(); choose(item); }} onMouseEnter={() => setActive(i)}
                style={{
                  minHeight: 44, display: 'flex', alignItems: 'center', padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                  background: active === i ? 'var(--accent-dim)' : 'transparent',
                  fontSize: 15, lineHeight: 1.35, color: 'var(--text-body)',
                }}
              >
                {item.label}
              </li>
            ))}
          </ul>
          <p style={{ margin: 0, padding: '6px 16px 8px', fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
            {t('Straßenverzeichnis: OpenPLZ API')}
          </p>
        </div>
      )}
    </div>
  );
});

export default StreetInput;
