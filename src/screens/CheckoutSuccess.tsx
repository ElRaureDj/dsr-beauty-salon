// DSR — Checkout success (mock).
// Confirmación editorial tras Apple Pay. Limpia el carrito al montar
// para que volver a 'shop' refleje el estado real.

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Eyebrow,
  GoldRule,
  H1,
  Ico,
  Icons,
  Screen,
  Tiny,
} from '../components/atoms';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '../router/Router';
import { useCart } from '../cart/CartProvider';
import { useUser } from '../data/UserProvider';
import { confirmCheckout, incrementPromoUse } from '../lib/db';
import { useToast } from '../components/atoms/Toast';

function generateOrderId(): string {
  // 6-digit random; suficiente para mock
  const n = Math.floor(100000 + Math.random() * 900000);
  return `DSR-${n}`;
}

export function CheckoutSuccess() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const cart = useCart();
  const { session, refreshProfile } = useUser();
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();
  const { show: showToast } = useToast();

  // Snapshot del total ANTES de limpiar — sino se ve €0 en pantalla.
  const [snapshot] = useState(() => ({
    total: cart.subtotal,
    count: cart.count,
    orderId: generateOrderId(),
    promoCode: cart.appliedPromoCode,
  }));

  useEffect(() => {
    // Incrementar el contador de uso de la promo aplicada (si había una).
    // Atómico vía RPC SECURITY DEFINER en Supabase. Fire-and-forget — el
    // checkout ya pasó desde la perspectiva del cliente; un fallo aquí solo
    // significa que el contador de admin queda atrás.
    if (snapshot.promoCode) {
      void incrementPromoUse(snapshot.promoCode).catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[checkout] incrementPromoUse failed:', err);
      });
    }

    if (userId) {
      // Authed: pasa pendings → appointments + decrementa stock + suma
      // points/visits/spent. Atómico via RPC. Después invalidamos caches
      // para que Profile/Home reflejen las nuevas appointments y points.
      void confirmCheckout()
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: ['my-appointments', userId],
          });
          void queryClient.invalidateQueries({ queryKey: ['product_stocks'] });
          void refreshProfile();
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('[checkout] confirmCheckout failed:', err);
          showToast({
            kind: 'error',
            message:
              lang === 'es'
                ? 'No pudimos confirmar tu pedido del todo'
                : 'We could not fully confirm your order',
            detail: err instanceof Error ? err.message : String(err),
            duration: 6000,
          });
        });
    }
    // El cart.clear() local es siempre necesario:
    // - Guest: única forma de vaciar (no hay DB).
    // - Authed: la RPC ya borró pendings/cart_items en DB, pero el state
    //   local todavía los tiene hasta el próximo refetch.
    cart.clear();
    // intencional: solo en mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const date = useMemo(() => {
    const d = new Date();
    return lang === 'es'
      ? d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
      : d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [lang]);

  return (
    <Screen padTop={0} padBottom={0}>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 36px',
          textAlign: 'center',
          gap: 20,
        }}
      >
        {/* Check con halo dorado */}
        <div
          className="dsr-fadein"
          style={{
            width: 88,
            height: 88,
            borderRadius: 999,
            background: `radial-gradient(circle at 30% 30%, ${T.goldHi}, ${T.gold})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 0 1px ${T.gold}33, 0 20px 60px ${T.gold}22`,
          }}
        >
          <Ico size={36} color={T.bg} stroke={2.5}>
            {Icons.check}
          </Ico>
        </div>

        <Eyebrow style={{ color: T.gold, marginTop: 8 }}>{snapshot.orderId}</Eyebrow>
        <H1 style={{ fontSize: 36, fontStyle: 'italic', lineHeight: 1.1 }}>
          {t('orderConfirmed')}
        </H1>
        <GoldRule width={32} />
        <Body style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.6, maxWidth: 280 }}>
          {t('orderConfirmedSub')}
        </Body>

        {/* Resumen mínimo */}
        <div
          style={{
            marginTop: 8,
            padding: '14px 22px',
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            alignItems: 'center',
          }}
        >
          <Tiny muted style={{ letterSpacing: 0.4, textTransform: 'none', fontSize: 11 }}>
            {date} · {snapshot.count}{' '}
            {lang === 'es'
              ? snapshot.count === 1
                ? 'producto'
                : 'productos'
              : snapshot.count === 1
                ? 'item'
                : 'items'}
          </Tiny>
          <div
            style={{
              fontFamily: T.serif,
              fontStyle: 'italic',
              fontSize: 22,
              color: T.gold,
              fontWeight: 300,
            }}
          >
            €{snapshot.total}
          </div>
        </div>

        <Tiny
          muted
          style={{
            fontSize: 10,
            letterSpacing: 0.4,
            textTransform: 'none',
            marginTop: 4,
          }}
        >
          {t('emailReceipt')}
        </Tiny>

        <div style={{ marginTop: 12, width: '100%', maxWidth: 280 }}>
          <Btn onClick={() => go('shop')}>{t('backToBoutique')}</Btn>
        </div>
      </div>
    </Screen>
  );
}
