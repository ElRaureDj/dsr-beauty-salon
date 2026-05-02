// DSR — Theme context provider con selección + persistencia.
// Default: noir. La elección se guarda en localStorage para persistir entre cargas.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { themes, type ThemeName, type ThemeTokens } from './tokens';

const STORAGE_KEY = 'dsr-theme-v1';
const DEFAULT_THEME: ThemeName = 'noir';

function loadFromStorage(): ThemeName {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v && v in themes) return v as ThemeName;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

interface ThemeValue extends ThemeTokens {
  name: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

const noirTokens = themes[DEFAULT_THEME];
const ThemeCtx = createContext<ThemeValue>({
  ...noirTokens,
  name: DEFAULT_THEME,
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState<ThemeName>(loadFromStorage);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, name);
    } catch {
      /* ignore */
    }
  }, [name]);

  const setTheme = useCallback((next: ThemeName) => setName(next), []);
  const toggleTheme = useCallback(
    () => setName((prev) => (prev === 'noir' ? 'marbre' : 'noir')),
    [],
  );

  const value = useMemo<ThemeValue>(
    () => ({ ...themes[name], name, setTheme, toggleTheme }),
    [name, setTheme, toggleTheme],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
