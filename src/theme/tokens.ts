// DSR — Theme tokens (Noir Couture)
// Deep black + warm gold + cream serif palette

export interface ThemeTokens {
  bg: string;
  bgAlt: string;
  surface: string;
  surfaceHi: string;
  line: string;
  lineStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  gold: string;
  goldDeep: string;
  goldHi: string;
  accent: string;
  rouge: string;
  serif: string;
  sans: string;
  mono: string;
  label: string;
  cardShadow: string;
  grain: boolean;
}

export const noir: ThemeTokens = {
  bg: '#0A0908',
  bgAlt: '#13110F',
  surface: '#1B1815',
  surfaceHi: '#252119',
  line: 'rgba(212, 184, 134, 0.12)',
  lineStrong: 'rgba(212, 184, 134, 0.28)',
  text: '#F5EDDC',
  textMuted: 'rgba(245, 237, 220, 0.62)',
  textFaint: 'rgba(245, 237, 220, 0.38)',
  gold: '#D4B886',
  goldDeep: '#A88B4F',
  goldHi: '#EBD5A8',
  accent: '#D4B886',
  rouge: '#7A1F1F',
  serif: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
  sans: '"Inter Tight", -apple-system, "SF Pro Display", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  label: '#A88B4F',
  cardShadow: '0 1px 0 rgba(212, 184, 134, 0.06) inset, 0 20px 50px rgba(0, 0, 0, 0.5)',
  grain: true,
};

export const themes = { noir } as const;
export type ThemeName = keyof typeof themes;
