// DSR — Sentry init.
// Solo se activa si VITE_SENTRY_DSN está definido (vacío en dev / mock).
// En producción Vercel, setear la env var apunta al proyecto Sentry.
//
// Configuración mínima: error tracking + browser performance básico.
// Sin replay session (privacidad de salón de belleza).

import * as Sentry from '@sentry/react';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    // Sample rate de errores: 100% (capturamos todo).
    // Sample rate de transactions (perf): 10% en prod para no inflar quota.
    sampleRate: 1.0,
    tracesSampleRate: 0.1,
    // No mandamos PII por defecto (cumple con la privacy policy del salón).
    sendDefaultPii: false,
    // Ignoramos errores frequentemente "ruidosos" del browser.
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
  });
}

/** Wrapper para reportar errors manualmente con contexto extra. */
export function captureError(err: unknown, context?: Record<string, unknown>): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  Sentry.captureException(err, { extra: context });
}

/** ErrorBoundary HOC que muestra un fallback custom y reporta a Sentry. */
export const SentryErrorBoundary = Sentry.ErrorBoundary;
