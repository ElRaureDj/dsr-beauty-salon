// DSR — Typography atoms
import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeProvider';

interface TypoProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Eyebrow({ children, style }: TypoProps) {
  const T = useTheme();
  return (
    <div
      style={{
        fontFamily: T.sans,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: 2.4,
        textTransform: 'uppercase',
        color: T.label,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function H1({ children, style }: TypoProps) {
  const T = useTheme();
  return (
    <h1
      style={{
        fontFamily: T.serif,
        fontWeight: 400,
        fontSize: 44,
        lineHeight: 1.02,
        letterSpacing: -0.6,
        color: T.text,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

export function H2({ children, style }: TypoProps) {
  const T = useTheme();
  return (
    <h2
      style={{
        fontFamily: T.serif,
        fontWeight: 400,
        fontSize: 30,
        lineHeight: 1.05,
        letterSpacing: -0.3,
        color: T.text,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

export function H3({ children, style }: TypoProps) {
  const T = useTheme();
  return (
    <h3
      style={{
        fontFamily: T.serif,
        fontWeight: 400,
        fontSize: 22,
        lineHeight: 1.15,
        letterSpacing: -0.2,
        color: T.text,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </h3>
  );
}

interface MutableTypoProps extends TypoProps {
  muted?: boolean;
}

export function Body({ children, muted = false, style }: MutableTypoProps) {
  const T = useTheme();
  return (
    <div
      style={{
        fontFamily: T.sans,
        fontSize: 14,
        lineHeight: 1.5,
        color: muted ? T.textMuted : T.text,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Tiny({ children, muted = false, style }: MutableTypoProps) {
  const T = useTheme();
  return (
    <div
      style={{
        fontFamily: T.sans,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: 0.3,
        color: muted ? T.textMuted : T.text,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Numeral({ value, style }: { value: ReactNode; style?: CSSProperties }) {
  const T = useTheme();
  return (
    <span
      style={{
        fontFamily: T.serif,
        fontStyle: 'italic',
        fontWeight: 300,
        color: T.gold,
        ...style,
      }}
    >
      {value}
    </span>
  );
}

export function Divider({ style }: { style?: CSSProperties }) {
  const T = useTheme();
  return <div style={{ height: 1, background: T.line, ...style }} />;
}

export function GoldRule({ width = 32, style }: { width?: number; style?: CSSProperties }) {
  const T = useTheme();
  return <div style={{ width, height: 1, background: T.gold, opacity: 0.7, ...style }} />;
}
