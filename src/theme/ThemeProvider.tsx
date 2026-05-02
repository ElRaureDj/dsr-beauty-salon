// DSR — Theme context provider
import { createContext, useContext, type ReactNode } from 'react';
import { noir, type ThemeTokens } from './tokens';

const ThemeCtx = createContext<ThemeTokens>(noir);

export function ThemeProvider({
  theme = noir,
  children,
}: {
  theme?: ThemeTokens;
  children: ReactNode;
}) {
  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
