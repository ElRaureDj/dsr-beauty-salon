// DSR — Language context provider
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { I18N, type I18nKey, type I18nStrings, type Lang } from './strings';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate a top-level string key. Returns the key if not found. */
  t: <K extends I18nKey>(k: K) => I18nStrings[K] extends string ? string : I18nStrings[K];
}

const LangCtx = createContext<LangContextValue>({
  lang: 'es',
  setLang: () => {},
  t: ((k: string) => k) as LangContextValue['t'],
});

export function LangProvider({
  initialLang = 'es',
  children,
}: {
  initialLang?: Lang;
  children: ReactNode;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const t = useCallback(
    ((k: I18nKey) => I18N[lang][k] ?? k) as LangContextValue['t'],
    [lang],
  );
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useI18n = () => useContext(LangCtx);
