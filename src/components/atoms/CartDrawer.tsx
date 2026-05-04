// DSR — Cart drawer (bottom sheet)
// Drawer accesible desde cualquier pantalla via el cart chip en TopChrome.
// Dividido en dos secciones: servicios pendientes + productos.
// Se mantiene siempre montado en el DOM y se oculta con transform/opacity
// para tener animación suave de entrada y salida.

import { useEffect } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { useCart } from '../../cart/CartProvider';
import { useRouter } from '../../router/Router';
import { useCatalog } from '../../data/CatalogProvider';
import { Body, Eyebrow, GoldRule, H2, Tiny } from './Typography';
import { Btn, GhostBtn } from './Buttons';
import { Ico, Icons } from './Icon';
import { Img } from './Layout';
import { PromoInput } from './PromoInput';

import { useCurrency } from '../../lib/format';
const ANIMATION_MS = 320;

export function CartDrawer() {
  const T = useTheme();
  const { format: fmt } = useCurrency();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const cart = useCart();
  const { getProduct, getService, getArtisan, getCombo } = useCatalog();

  // Cerrar con Escape cuando está abierto.
  useEffect(() => {
    if (!cart.drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cart.closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cart]);

  const handleCheckout = () => {
    cart.closeDrawer();
    go('checkout-success');
  };

  const handleViewFull = () => {
    cart.closeDrawer();
    go('bag');
  };

  const open = cart.drawerOpen;
  const empty = cart.count === 0;

  return (
    <>
      {/* Backdrop — siempre montado, opacity 0 cuando cerrado para fade suave. */}
      <div
        onClick={cart.closeDrawer}
        aria-hidden={!open}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 90,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: `opacity ${ANIMATION_MS}ms ease`,
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-label={t('bag')}
        aria-modal="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '88%',
          height: 'auto',
          background: T.bg,
          boxShadow: `0 -20px 60px rgba(0,0,0,0.5), inset 0 1px 0 ${T.line}`,
          zIndex: 91,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: `transform ${ANIMATION_MS}ms cubic-bezier(0.2, 0.7, 0.3, 1)`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Drag handle decorativo */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 10,
            paddingBottom: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 4,
              borderRadius: 2,
              background: T.lineStrong,
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 22px 14px',
            flexShrink: 0,
          }}
        >
          <div>
            <Eyebrow>{t('bag')}</Eyebrow>
            <H2 style={{ fontSize: 22, fontStyle: 'italic', marginTop: 2 }}>
              {empty
                ? t('emptyBag')
                : `${cart.count} ${
                    cart.count === 1
                      ? lang === 'es'
                        ? 'artículo'
                        : 'item'
                      : lang === 'es'
                        ? 'artículos'
                        : 'items'
                  }`}
            </H2>
          </div>
          <button
            onClick={cart.closeDrawer}
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
            }}
          >
            <Ico size={14} color={T.text}>
              {Icons.close}
            </Ico>
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="dsr-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 22px 18px',
            minHeight: 0,
          }}
        >
          {/* SERVICIOS */}
          <SectionHeader
            label={t('cartServices')}
            count={cart.serviceCount}
          />
          {cart.pendingBookings.length === 0 ? (
            <EmptyRow text={t('cartEmptyServices')} T={T} />
          ) : (
            cart.pendingBookings.map((b) => {
              const ar = getArtisan(b.artisanId);
              const services = b.serviceIds
                .map(getService)
                .filter((s): s is NonNullable<ReturnType<typeof getService>> => !!s);
              const combo = b.comboId ? getCombo(b.comboId) : null;
              const dateLabel = new Date(b.date)
                .toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })
                .toUpperCase();
              return (
                <div
                  key={b.id}
                  style={{
                    padding: '14px 0',
                    borderBottom: `1px solid ${T.line}`,
                    display: 'flex',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Tiny
                      style={{
                        color: T.gold,
                        letterSpacing: 1.4,
                        fontSize: 10,
                      }}
                    >
                      {dateLabel} · {b.time}
                      {combo && b.discountPct ? ` · −${b.discountPct}%` : ''}
                    </Tiny>
                    <Body style={{ marginTop: 4, fontSize: 13, fontWeight: 500 }}>
                      {combo
                        ? lang === 'es'
                          ? combo.name_es
                          : combo.name_en
                        : services
                            .map((s) => (lang === 'es' ? s.es : s.en))
                            .join(' + ')}
                    </Body>
                    {combo && (
                      <Tiny
                        muted
                        style={{
                          marginTop: 2,
                          fontSize: 10,
                          letterSpacing: 0.3,
                          textTransform: 'none',
                        }}
                      >
                        {services
                          .map((s) => (lang === 'es' ? s.es : s.en))
                          .join(' + ')}
                      </Tiny>
                    )}
                    <Tiny
                      muted
                      style={{
                        marginTop: 2,
                        fontSize: 11,
                        letterSpacing: 0.3,
                        textTransform: 'none',
                      }}
                    >
                      {ar
                        ? `${lang === 'es' ? 'con' : 'with'} ${ar.name} · ${b.duration} min`
                        : `${b.duration} min`}
                    </Tiny>
                    {b.variant && b.variant !== 'standard' && (
                      <Tiny
                        style={{
                          marginTop: 6,
                          fontSize: 9,
                          letterSpacing: 1.4,
                          color: T.gold,
                        }}
                      >
                        ·{' '}
                        {b.variant === 'premium'
                          ? t('variantPremium')
                          : t('variantCustom')}
                        {b.addonProductIds && b.addonProductIds.length > 0 && (
                          <>
                            {' · '}
                            <span style={{ textTransform: 'none', letterSpacing: 0.3 }}>
                              {b.addonProductIds
                                .map((pid) => {
                                  const p = getProduct(pid);
                                  return p ? (lang === 'es' ? p.name_es : p.name_en) : null;
                                })
                                .filter(Boolean)
                                .join(' + ')}
                            </span>
                          </>
                        )}
                      </Tiny>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => {
                          cart.closeDrawer();
                          go('book', { editingBooking: b.id });
                        }}
                        aria-label={t('editBooking')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 4,
                          margin: -4,
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                      >
                        <Ico size={12} color={T.gold}>
                          {Icons.edit}
                        </Ico>
                      </button>
                      <button
                        onClick={() => cart.removeBooking(b.id)}
                        aria-label={lang === 'es' ? 'Quitar' : 'Remove'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 4,
                          margin: -4,
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                      >
                        <Ico size={12} color={T.textFaint}>
                          {Icons.close}
                        </Ico>
                      </button>
                    </div>
                    <Tiny
                      style={{
                        color: T.gold,
                        fontFamily: T.serif,
                        fontStyle: 'italic',
                        fontSize: 16,
                      }}
                    >
                      {fmt(b.total)}
                    </Tiny>
                  </div>
                </div>
              );
            })
          )}

          {/* PRODUCTOS */}
          <div style={{ marginTop: 22 }}>
            <SectionHeader
              label={t('cartProducts')}
              count={cart.productCount}
            />
          </div>
          {cart.items.length === 0 ? (
            <EmptyRow text={t('cartEmptyProducts')} T={T} />
          ) : (
            cart.items.map((it) => {
              const p = getProduct(it.productId);
              if (!p) return null;
              return (
                <div
                  key={p.id}
                  style={{
                    padding: '14px 0',
                    borderBottom: `1px solid ${T.line}`,
                    display: 'flex',
                    gap: 12,
                  }}
                >
                  <Img
                    src={p.photo}
                    style={{ width: 56, height: 70, flexShrink: 0 }}
                  />
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <Tiny muted style={{ fontSize: 9, letterSpacing: 1.2 }}>
                        {p.line}
                      </Tiny>
                      <button
                        onClick={() => cart.remove(p.id)}
                        aria-label={t('removeFromBag')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: 4,
                          margin: -4,
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                      >
                        <Ico size={12} color={T.textFaint}>
                          {Icons.close}
                        </Ico>
                      </button>
                    </div>
                    <Body style={{ marginTop: 2, fontSize: 13, fontWeight: 500 }}>
                      {lang === 'es' ? p.name_es : p.name_en}
                    </Body>
                    <div style={{ flex: 1 }} />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginTop: 6,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          boxShadow: `inset 0 0 0 1px ${T.line}`,
                          padding: '3px 8px',
                        }}
                      >
                        <button
                          onClick={() => cart.setQty(p.id, it.qty - 1)}
                          aria-label="−"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                          }}
                        >
                          <Ico size={9} color={T.text}>
                            {Icons.minus}
                          </Ico>
                        </button>
                        <Tiny style={{ minWidth: 10, textAlign: 'center', fontSize: 11 }}>
                          {it.qty}
                        </Tiny>
                        <button
                          onClick={() => cart.setQty(p.id, it.qty + 1)}
                          aria-label="+"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                          }}
                        >
                          <Ico size={9} color={T.text}>
                            {Icons.plus}
                          </Ico>
                        </button>
                      </div>
                      <Tiny
                        style={{
                          color: T.gold,
                          fontFamily: T.serif,
                          fontStyle: 'italic',
                          fontSize: 15,
                        }}
                      >
                        {fmt(p.price * it.qty)}
                      </Tiny>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {!empty && (
          <div
            style={{
              padding: '14px 22px 22px',
              borderTop: `1px solid ${T.line}`,
              background: T.bg,
              flexShrink: 0,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <PromoInput />
            </div>
            {/* Subtotals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              {cart.serviceCount > 0 && (
                <Row
                  label={t('cartServices')}
                  value={`€${cart.serviceSubtotal}`}
                  T={T}
                />
              )}
              {cart.productCount > 0 && (
                <Row
                  label={t('cartProducts')}
                  value={`€${cart.productSubtotal}`}
                  T={T}
                />
              )}
              {cart.appliedPromo && cart.promoDiscount > 0 && (
                <Row
                  label={`${t('promoApplied')} · ${cart.appliedPromo.code}`}
                  value={`−€${cart.promoDiscount}`}
                  T={T}
                  highlight
                />
              )}
              <GoldRule width={28} style={{ marginTop: 6, marginBottom: 4 }} />
              <Row
                label="Total"
                value={`€${cart.total}`}
                T={T}
                bold
              />
            </div>

            <button
              className="dsr-press"
              onClick={handleCheckout}
              style={{
                width: '100%',
                height: 50,
                background: '#fff',
                color: '#000',
                fontFamily: T.sans,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <Ico size={15} color="#000">
                {Icons.apple}
              </Ico>
              {lang === 'es' ? 'Pagar con Apple Pay' : 'Pay with Apple Pay'}
            </button>

            {cart.productCount > 0 && (
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <GhostBtn onClick={handleViewFull}>{t('cartViewFull')}</GhostBtn>
              </div>
            )}
          </div>
        )}

        {/* Empty state CTA */}
        {empty && (
          <div
            style={{
              padding: '0 22px 32px',
              textAlign: 'center',
            }}
          >
            <Body
              style={{
                color: T.textMuted,
                fontSize: 13,
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              {t('emptyBagSub')}
            </Body>
            <Btn
              onClick={() => {
                cart.closeDrawer();
                go('shop');
              }}
              fullWidth={false}
            >
              {t('continueShopping')}
            </Btn>
          </div>
        )}
      </div>
    </>
  );
}

function SectionHeader({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
      }}
    >
      <Eyebrow>{label}</Eyebrow>
      <Tiny muted style={{ fontSize: 10, letterSpacing: 1.2 }}>
        · {count} ·
      </Tiny>
    </div>
  );
}

function EmptyRow({
  text,
  T,
}: {
  text: string;
  T: ReturnType<typeof useTheme>;
}) {
  return (
    <div
      style={{
        padding: '16px 0',
        borderBottom: `1px solid ${T.line}`,
      }}
    >
      <Tiny
        muted
        style={{ letterSpacing: 0.4, textTransform: 'none', fontSize: 12 }}
      >
        {text}
      </Tiny>
    </div>
  );
}

function Row({
  label,
  value,
  T,
  bold = false,
  highlight = false,
}: {
  label: string;
  value: string;
  T: ReturnType<typeof useTheme>;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }}
    >
      <Tiny
        muted={!bold && !highlight}
        style={{
          letterSpacing: 0.4,
          textTransform: 'none',
          fontSize: bold ? 13 : 11,
          fontWeight: bold ? 500 : 400,
          color: bold ? T.text : highlight ? T.gold : undefined,
        }}
      >
        {label}
      </Tiny>
      <Tiny
        style={{
          color: bold || highlight ? T.gold : T.text,
          fontFamily: bold ? T.serif : T.sans,
          fontStyle: bold ? 'italic' : 'normal',
          fontSize: bold ? 18 : 12,
        }}
      >
        {value}
      </Tiny>
    </div>
  );
}
