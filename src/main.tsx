import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { queryClient } from './lib/query';
import { initSentry, SentryErrorBoundary } from './lib/sentry';
import './theme/global.css';

// Sentry init (no-op si VITE_SENTRY_DSN no está set).
initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SentryErrorBoundary
      fallback={
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#0A0908',
            color: '#EFEAE0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            textAlign: 'center',
            fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif',
          }}
        >
          <div
            style={{
              fontFamily: 'Georgia,"Times New Roman",serif',
              fontStyle: 'italic',
              fontSize: 28,
              color: '#C4A05A',
              marginBottom: 14,
            }}
          >
            Algo se salió de su sitio.
          </div>
          <div
            style={{
              fontSize: 13,
              color: '#B5AEA1',
              maxWidth: 320,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Hemos sido notificadas. Refresca la app — si vuelve a pasar,
            escríbenos a hola@dsr-maison.com.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#C4A05A',
              color: '#0A0908',
              border: 'none',
              padding: '12px 22px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Recargar
          </button>
        </div>
      }
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </SentryErrorBoundary>
  </StrictMode>,
);
