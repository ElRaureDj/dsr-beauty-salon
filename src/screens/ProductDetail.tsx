// DSR — Product detail (video/photo carousel · ritual notes · AR try-on · sticky add to bag)
import { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Eyebrow,
  GoldRule,
  H1,
  HeaderBar,
  Ico,
  Icons,
  Img,
  Numeral,
  Screen,
  Tiny,
} from '../components/atoms';
import { useCatalog } from '../data/CatalogProvider';
import { useRouter } from '../router/Router';
import { useCart } from '../cart/CartProvider';

interface Slide {
  src?: string;
  video?: string;
  poster?: string;
}

export function ProductDetail({ id }: { id: string }) {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const cart = useCart();
  const { getProduct, getStock } = useCatalog();
  const p = getProduct(id);
  const [tab, setTab] = useState(0);
  const [bag, setBag] = useState(false);
  if (!p) return null;
  const stockInfo = getStock(p.id);
  const isOutOfStock = stockInfo.stock <= 0;
  const isLowStock =
    !isOutOfStock &&
    stockInfo.lowStockAt > 0 &&
    stockInfo.stock <= stockInfo.lowStockAt;
  const slides: Slide[] = [
    ...(p.video ? [{ video: p.video, poster: p.photo }] : []),
    ...p.photos.map((src) => ({ src })),
  ];
  const cur = slides[tab];

  return (
    <Screen padTop={0} padBottom={130}>
      <HeaderBar
        onBack={() => go('shop')}
        right={
          <Ico size={18} color={T.text}>
            {Icons.heart}
          </Ico>
        }
      />

      {/* Media carousel */}
      <div style={{ position: 'relative', aspectRatio: '4/5', background: T.bgAlt }}>
        {cur.video ? (
          <video
            src={cur.video}
            poster={cur.poster}
            autoPlay
            muted
            loop
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Img src={cur.src ?? ''} style={{ width: '100%', height: '100%' }} />
        )}
        {/* Capsule badge for video */}
        {cur.video && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              padding: '6px 10px',
              background: 'rgba(10,9,8,0.6)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Ico size={10} color={T.goldHi}>
              {Icons.film}
            </Ico>
            <Tiny style={{ color: T.goldHi, fontSize: 9, letterSpacing: 1.3 }}>
              {lang === 'es' ? 'Cápsula' : 'Capsule'}
            </Tiny>
          </div>
        )}
        {/* Dots */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                width: i === tab ? 18 : 5,
                height: 5,
                borderRadius: 0,
                background: i === tab ? T.gold : 'rgba(255,255,255,0.4)',
                transition: 'all .2s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div
        className="dsr-scroll"
        style={{
          display: 'flex',
          gap: 8,
          padding: '14px 22px 0',
          overflowX: 'auto',
        }}
      >
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            style={{
              flexShrink: 0,
              width: 56,
              height: 70,
              padding: 0,
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: i === tab ? `inset 0 0 0 1.5px ${T.gold}` : `inset 0 0 0 1px ${T.line}`,
              background: T.bgAlt,
            }}
          >
            <Img src={s.src || s.poster || ''} style={{ width: '100%', height: '100%' }} />
            {s.video && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)',
                }}
              >
                <Ico size={12} color="#fff">
                  {Icons.play}
                </Ico>
              </div>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 22px 0' }}>
        <Tiny muted style={{ letterSpacing: 1.4 }}>
          {p.line}
        </Tiny>
        <H1 style={{ marginTop: 8, fontSize: 32 }}>{lang === 'es' ? p.name_es : p.name_en}</H1>
        <div style={{ marginTop: 10, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Ico size={11} color={T.gold} stroke={2}>
              {Icons.star}
            </Ico>
            <Tiny style={{ letterSpacing: 0.3, textTransform: 'none', fontSize: 11 }}>
              {p.rating} · {p.reviews}
            </Tiny>
          </div>
          <div style={{ width: 3, height: 3, borderRadius: 999, background: T.line }} />
          <Tiny muted style={{ fontSize: 11, letterSpacing: 0.3, textTransform: 'none' }}>
            {lang === 'es' ? p.cat_es : p.cat_en} · {p.size}
          </Tiny>
        </div>

        {(isLowStock || isOutOfStock) && (
          <div
            style={{
              marginTop: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: isOutOfStock ? T.surface : `${T.gold}14`,
              boxShadow: `inset 0 0 0 1px ${isOutOfStock ? T.lineStrong : T.gold}55`,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: isOutOfStock ? T.textFaint : T.gold,
              }}
            />
            <Tiny
              style={{
                color: isOutOfStock ? T.textMuted : T.gold,
                letterSpacing: 1.4,
                fontSize: 10,
              }}
            >
              {isOutOfStock
                ? t('outOfStock')
                : t('lowStock').replace('{n}', String(stockInfo.stock))}
            </Tiny>
          </div>
        )}

        <GoldRule width={36} style={{ marginTop: 22 }} />

        <Body style={{ marginTop: 18, fontSize: 14, lineHeight: 1.7 }}>
          {lang === 'es' ? p.desc_es : p.desc_en}
        </Body>

        {/* Notes */}
        <div style={{ marginTop: 26 }}>
          <Eyebrow>{lang === 'es' ? 'Cómo se usa' : 'How to use'}</Eyebrow>
          <div style={{ marginTop: 12 }}>
            {(lang === 'es' ? p.notes_es : p.notes_en).map((n, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '10px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                }}
              >
                <Numeral
                  value={['I', 'II', 'III', 'IV'][i]}
                  style={{ fontSize: 13, width: 22 }}
                />
                <Body style={{ fontSize: 13 }}>{n}</Body>
              </div>
            ))}
          </div>
        </div>

        {/* AR try-on */}
        {p.id === 'nail-set' && (
          <div
            style={{
              marginTop: 26,
              padding: 16,
              background: T.surface,
              boxShadow: `inset 0 0 0 1px ${T.gold}33`,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: `radial-gradient(circle at 30% 30%, ${T.goldHi}, ${T.gold})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Ico size={16} color="#0A0908">
                {Icons.cam}
              </Ico>
            </div>
            <div style={{ flex: 1 }}>
              <Body style={{ fontSize: 13, fontWeight: 500 }}>{t('trySomething')}</Body>
              <Tiny
                muted
                style={{
                  marginTop: 2,
                  fontSize: 10,
                  letterSpacing: 0.3,
                  textTransform: 'none',
                }}
              >
                {lang === 'es'
                  ? 'Realidad aumentada · activa la cámara'
                  : 'AR · open camera'}
              </Tiny>
            </div>
            <Ico size={14} color={T.gold}>
              {Icons.arrow}
            </Ico>
          </div>
        )}
      </div>

      {/* Sticky Add to bag */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px 22px 36px',
          background: `linear-gradient(180deg, transparent, ${T.bg} 30%)`,
          zIndex: 30,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            marginBottom: 14,
            padding: '0 4px',
          }}
        >
          <div style={{ flex: 1 }}>
            <Tiny
              muted
              style={{ fontSize: 10, letterSpacing: 0.3, textTransform: 'none' }}
            >
              Total
            </Tiny>
            <div
              style={{
                fontFamily: T.serif,
                fontStyle: 'italic',
                fontSize: 26,
                color: T.gold,
                lineHeight: 1,
                fontWeight: 300,
                marginTop: 2,
              }}
            >
              €{p.price}
            </div>
          </div>
          <Btn
            fullWidth={false}
            disabled={isOutOfStock}
            onClick={() => {
              if (bag || isOutOfStock) return;
              cart.add(p.id, 1);
              setBag(true);
              setTimeout(() => go('bag'), 380);
            }}
            style={{
              flex: 2,
              transition: 'all .3s',
              background: isOutOfStock ? T.surface : bag ? T.bg : T.gold,
              color: isOutOfStock ? T.textFaint : bag ? T.gold : T.bg,
              boxShadow:
                isOutOfStock
                  ? `inset 0 0 0 1px ${T.line}`
                  : bag
                    ? `inset 0 0 0 1px ${T.gold}`
                    : 'none',
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            }}
          >
            {isOutOfStock ? (
              t('outOfStockShort')
            ) : bag ? (
              <>
                <Ico size={14} color={T.gold} stroke={2.5}>
                  {Icons.check}
                </Ico>{' '}
                {t('addToBag')}
              </>
            ) : (
              t('addToBag')
            )}
          </Btn>
        </div>
      </div>
    </Screen>
  );
}
