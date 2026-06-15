'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

// Picks a theme based on the visitor's local time of day:
// daytime (07:00–18:59) → light, otherwise → dark.
function getScheduledTheme() {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 19 ? 'light' : 'dark';
}

export function ThemeProvider({ children, defaultTheme = 'dark', storageKey = 'marco-theme', autoSchedule = false }) {
  const [theme, setTheme] = useState(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // A manually saved choice always wins. Otherwise, when autoSchedule is on,
    // derive the theme from the time of day; else fall back to defaultTheme.
    const saved = localStorage.getItem(storageKey);
    const initial = saved || (autoSchedule ? getScheduledTheme() : defaultTheme);
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    setMounted(true);
  }, [defaultTheme, storageKey, autoSchedule]);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(storageKey, next);
  };

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
