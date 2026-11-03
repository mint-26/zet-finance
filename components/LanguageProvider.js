'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { EN } from '../lib/translations';

const STORAGE_KEY = 'marco-lang';

const LanguageContext = createContext({ lang: 'de', setLang: () => {}, t: (s) => s });

export const useLang = () => useContext(LanguageContext);

// German is written directly in the components; lib/translations.js maps it to English.
// t() returns the German text in German mode and for anything without a translation, so a
// missing entry shows German instead of breaking. Answers sent to the CRM are never passed
// through t(), they stay German. The server always renders German, the choice is applied
// after loading, because it lives in the browser.
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('de');

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'en') setLangState('en');
    } catch {
      // Storage blocked: stay on German.
    }
  }, []);

  const setLang = (next) => {
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* Only lasts for this page then. */ }
  };

  const value = useMemo(() => ({
    lang,
    setLang,
    t: (text) => (lang === 'en' ? (EN[text] ?? text) : text),
  }), [lang]);

  // Page language and tab title follow the choice.
  useEffect(() => {
    document.documentElement.lang = lang;
    if (!document.documentElement.dataset.titleDe) document.documentElement.dataset.titleDe = document.title;
    document.title = value.t(document.documentElement.dataset.titleDe);
  }, [lang, value]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// DE | EN switch for the headers. Colours come from the surrounding header.
export function LanguageSwitch({ color, accent }) {
  const { lang, setLang } = useLang();
  const option = (code) => {
    const active = lang === code;
    return (
      <button
        type="button" lang={code.toLowerCase()} aria-pressed={active}
        aria-label={code === 'de' ? 'Deutsch' : 'English'}
        onClick={() => setLang(code)}
        style={{
          background: 'none', border: 0, cursor: 'pointer', font: 'inherit', letterSpacing: '0.06em',
          minWidth: 32, minHeight: 44, padding: '0 4px', color,
          opacity: active ? 1 : 0.6, fontWeight: active ? 700 : 400,
          textDecoration: active ? 'underline' : 'none', textDecorationColor: accent,
          textDecorationThickness: 1, textUnderlineOffset: 6,
        }}
      >
        {code.toUpperCase()}
      </button>
    );
  };
  return (
    <div role="group" aria-label={lang === 'en' ? 'Choose language' : 'Sprache wählen'} style={{ display: 'inline-flex', alignItems: 'center', fontSize: 13, flexShrink: 0 }}>
      {option('de')}
      <span aria-hidden="true" style={{ color, opacity: 0.4 }}>|</span>
      {option('en')}
    </div>
  );
}
