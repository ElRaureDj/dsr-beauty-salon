// DSR Admin — SidePanel: drawer lateral desde la derecha.
// Patrón usado para editar entidades. Animado con transform/opacity.

import { useEffect, type ReactNode } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import { Eyebrow, Ico, Icons, Tiny } from '../components/atoms';

const ANIMATION_MS = 280;

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Footer fijo abajo. Típicamente botones cancelar/guardar. */
  footer?: ReactNode;
  width?: number;
}

export function SidePanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 480,
}: SidePanelProps) {
  const T = useTheme();
  const { lang } = useI18n();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          zIndex: 95,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: `opacity ${ANIMATION_MS}ms ease`,
        }}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label={title}
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width,
          maxWidth: '100vw',
          background: T.bg,
          boxShadow: `-20px 0 60px rgba(0,0,0,0.4), inset 1px 0 0 ${T.line}`,
          zIndex: 96,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: `transform ${ANIMATION_MS}ms cubic-bezier(0.2, 0.7, 0.3, 1)`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '22px 26px 18px',
            borderBottom: `1px solid ${T.line}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Eyebrow style={{ fontSize: 9 }}>
              {subtitle || (lang === 'es' ? 'Editar' : 'Edit')}
            </Eyebrow>
            <div
              style={{
                fontFamily: T.serif,
                fontStyle: 'italic',
                fontSize: 22,
                marginTop: 4,
                color: T.text,
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={lang === 'es' ? 'Cerrar' : 'Close'}
            className="dsr-press"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: 'none',
              background: T.surface,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              flexShrink: 0,
            }}
          >
            <Ico size={14} color={T.text}>
              {Icons.close}
            </Ico>
          </button>
        </div>

        {/* Body — scrollable */}
        <div
          className="dsr-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 26px 24px',
            minHeight: 0,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 26px 22px',
              borderTop: `1px solid ${T.line}`,
              background: T.bg,
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}

/** Field row helper for forms inside SidePanel. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const T = useTheme();
  return (
    <div style={{ marginBottom: 16 }}>
      <Tiny
        muted
        style={{
          display: 'block',
          fontFamily: T.mono,
          fontSize: 9,
          letterSpacing: 1.2,
          marginBottom: 6,
        }}
      >
        {label.toUpperCase()}
      </Tiny>
      {children}
      {hint && (
        <Tiny
          muted
          style={{
            display: 'block',
            fontSize: 10,
            letterSpacing: 0.3,
            textTransform: 'none',
            marginTop: 4,
            color: T.textFaint,
          }}
        >
          {hint}
        </Tiny>
      )}
    </div>
  );
}

/** Text input estilizado para forms del admin. */
export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'url';
  multiline?: boolean;
  rows?: number;
}) {
  const T = useTheme();
  const baseStyle = {
    width: '100%',
    padding: '10px 12px',
    background: T.surface,
    border: 'none',
    boxShadow: `inset 0 0 0 1px ${T.line}`,
    color: T.text,
    fontFamily: T.sans,
    fontSize: 13,
    outline: 'none',
    resize: 'none' as const,
  };
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ ...baseStyle, lineHeight: 1.5 }}
      />
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={baseStyle}
    />
  );
}
