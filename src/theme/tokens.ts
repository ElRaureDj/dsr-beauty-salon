// DSR — Theme tokens
// Noir Couture: deep black + warm gold + cream serif
// Marbre Doré: ivory marble + bronze gold + warm noir text

export interface ThemeTokens {
  bg: string;
  /** RGB triple del bg para usar en rgba(...) — gradients que se desvanecen al fondo. */
  bgRgb: string;
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

const FONT_SERIF = '"Cormorant Garamond", "Playfair Display", Georgia, serif';
const FONT_SANS = '"Inter Tight", -apple-system, "SF Pro Display", system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

export const noir: ThemeTokens = {
  bg: '#0A0908',
  bgRgb: '10, 9, 8',
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
  serif: FONT_SERIF,
  sans: FONT_SANS,
  mono: FONT_MONO,
  label: '#A88B4F',
  cardShadow: '0 1px 0 rgba(212, 184, 134, 0.06) inset, 0 20px 50px rgba(0, 0, 0, 0.5)',
  grain: true,
};

// Marbre Doré: paleta clara, mármol cremoso + dorado bronceado.
// Diseñada para invertir bien Noir: text ↔ bg se cambian, dorado se oscurece
// para mantener contraste sobre fondo claro, líneas usan tinta cálida.
export const marbre: ThemeTokens = {
  bg: '#F4ECDC',
  bgRgb: '244, 236, 220',
  bgAlt: '#EAE0CC',
  surface: '#E0D4BB',
  surfaceHi: '#D4C5A6',
  line: 'rgba(56, 40, 24, 0.12)',
  lineStrong: 'rgba(56, 40, 24, 0.28)',
  text: '#1A1410',
  textMuted: 'rgba(26, 20, 16, 0.62)',
  textFaint: 'rgba(26, 20, 16, 0.38)',
  gold: '#9C7E45',
  goldDeep: '#7A6231',
  goldHi: '#C29F5A',
  accent: '#9C7E45',
  rouge: '#9A2E2E',
  serif: FONT_SERIF,
  sans: FONT_SANS,
  mono: FONT_MONO,
  label: '#7A6231',
  cardShadow: '0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 20px 50px rgba(56, 40, 24, 0.15)',
  grain: false,
};

export const themes = { noir, marbre } as const;
export type ThemeName = keyof typeof themes;
