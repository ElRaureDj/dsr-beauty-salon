// DSR — Button atoms
import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeProvider';

interface BtnProps {
  children: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Btn({
  children,
  primary = true,
  onClick,
  style,
  disabled = false,
  fullWidth = true,
}: BtnProps) {
  const T = useTheme();
  const base: CSSProperties = {
    height: 52,
    padding: '0 22px',
    width: fullWidth ? '100%' : undefined,
    fontFamily: T.sans,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: 'uppercase',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    opacity: disabled ? 0.4 : 1,
    transition: 'all .2s',
    borderRadius: 0,
  };
  const themed: CSSProperties = primary
    ? { background: T.gold, color: T.bg }
    : { background: 'transparent', color: T.text, boxShadow: `inset 0 0 0 1px ${T.lineStrong}` };
  return (
    <button
      className="dsr-press"
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...themed, ...style }}
    >
      {children}
    </button>
  );
}

interface GhostProps {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}

export function GhostBtn({ children, onClick, style }: GhostProps) {
  const T = useTheme();
  return (
    <button
      className="dsr-press"
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 0',
        fontFamily: T.sans,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        color: T.gold,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Chip({ children, active, onClick, style }: ChipProps) {
  const T = useTheme();
  return (
    <button
      className="dsr-press"
      onClick={onClick}
      style={{
        height: 30,
        padding: '0 14px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        fontFamily: T.sans,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        background: active ? T.gold : 'transparent',
        color: active ? T.bg : T.textMuted,
        boxShadow: active ? 'none' : `inset 0 0 0 1px ${T.line}`,
        transition: 'all .2s',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
