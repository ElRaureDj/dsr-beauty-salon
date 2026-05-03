// DSR — Toast notifications context.
// Sistema global de notificaciones temporales para reemplazar console.error
// silenciosos en mutations. Stack vertical bottom-center con auto-dismiss
// a los 4s. Variantes: success (gold check), error (rouge), info (sutil).
//
// Uso:
//   const { show } = useToast();
//   show({ kind: 'success', message: 'Cita guardada' });
//   show({ kind: 'error', message: 'No se pudo cargar', detail: err.message });
//
// Provider va en App.tsx debajo de ThemeProvider para tener acceso a tokens.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { Body, Tiny } from './Typography';
import { Ico, Icons } from './Icon';

type ToastKind = 'success' | 'error' | 'info';

interface ToastInput {
  kind?: ToastKind;
  message: string;
  /** Texto secundario (opcional). Útil para err.message tras un fallo. */
  detail?: string;
  /** ms antes del auto-dismiss. Default 4000. 0 = sticky. */
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastInput, 'detail' | 'duration'>> {
  id: string;
  detail?: string;
  duration: number;
}

interface ToastValue {
  show: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastCtx = createContext<ToastValue>({
  show: () => '',
  dismiss: () => {},
});

const ANIMATION_MS = 220;

export function ToastProvider({ children }: { children: ReactNode }) {
  const T = useTheme();
  const [items, setItems] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (input: ToastInput): string => {
      const id = `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const item: ToastItem = {
        id,
        kind: input.kind ?? 'info',
        message: input.message,
        detail: input.detail,
        duration: input.duration ?? 4000,
      };
      setItems((prev) => [...prev, item]);
      if (item.duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), item.duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo<ToastValue>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {/* Stack — abajo + centrado. zIndex muy alto para vivir sobre cualquier modal. */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          zIndex: 200,
          pointerEvents: 'none',
          width: 'calc(100% - 32px)',
          maxWidth: 360,
        }}
      >
        {items.map((t) => {
          const accent =
            t.kind === 'success' ? T.gold : t.kind === 'error' ? T.rouge : T.text;
          const iconPath =
            t.kind === 'success'
              ? Icons.check
              : t.kind === 'error'
                ? Icons.close
                : Icons.sparkle;
          return (
            <div
              key={t.id}
              role="status"
              onClick={() => dismiss(t.id)}
              style={{
                background: T.surface,
                boxShadow: `inset 0 0 0 1px ${accent}66, 0 12px 40px rgba(0,0,0,0.45)`,
                padding: '12px 14px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                pointerEvents: 'auto',
                cursor: 'pointer',
                animation: `dsr-fade-up ${ANIMATION_MS}ms cubic-bezier(0.2, 0.7, 0.3, 1) both`,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: `${accent}1A`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <Ico size={11} color={accent} stroke={2.2}>
                  {iconPath}
                </Ico>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Body
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: 1.35,
                    color: T.text,
                  }}
                >
                  {t.message}
                </Body>
                {t.detail && (
                  <Tiny
                    muted
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      lineHeight: 1.4,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                    }}
                  >
                    {t.detail}
                  </Tiny>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
