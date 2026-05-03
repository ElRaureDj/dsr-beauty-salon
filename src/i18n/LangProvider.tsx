// DSR — Language context provider.
// Persiste en localStorage como ThemeProvider. Cuando hay sesión, el
// componente PrefsSync (App.tsx) sincroniza con profile.preferred_lang
// para que la preferencia siga al user entre dispositivos.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { I18N, type I18nKey, type I18nStrings, type Lang } from './strings';

const STORAGE_KEY = 'dsr-lang-v1';
const DEFAULT_LANG: Lang = 'es';

function loadFromStorage(initial: Lang): Lang {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === 'es' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return initial;
}

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate a top-level string key. Returns the key if not found. */
  t: <K extends I18nKey>(k: K) => I18nStrings[K] extends string ? string : I18nStrings[K];
}

const LangCtx = createContext<LangContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: ((k: string) => k) as LangContextValue['t'],
});

export function LangProvider({
  initialLang = DEFAULT_LANG,
  children,
}: {
  initialLang?: Lang;
  children: ReactNode;
}) {
  const [lang, setLang] = useState<Lang>(() => loadFromStorage(initialLang));

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = useCallback(
    ((k: I18nKey) => I18N[lang][k] ?? k) as LangContextValue['t'],
    [lang],
  );
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useI18n = () => useContext(LangCtx);
