import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const THEME_KEY = 'lf.theme';
const ThemeContext = createContext(null);

function readStored() {
  try {
    return localStorage.getItem(THEME_KEY) || 'system';
  } catch {
    return 'system';
  }
}

function apply(theme) {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const dark = theme === 'dark' || (theme === 'system' && mql.matches);
  document.documentElement.classList.toggle('dark', dark);
  return dark;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStored);
  const [isDark, setIsDark] = useState(() =>
    typeof window === 'undefined' ? false : apply(readStored())
  );

  useEffect(() => {
    setIsDark(apply(theme));
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (readStored() === 'system') setIsDark(apply('system'));
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((t) => setThemeState(t), []);
  const cycle = useCallback(() => {
    setThemeState((t) => (t === 'light' ? 'dark' : t === 'dark' ? 'system' : 'light'));
  }, []);

  const value = useMemo(() => ({ theme, isDark, setTheme, cycle }), [theme, isDark, setTheme, cycle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
