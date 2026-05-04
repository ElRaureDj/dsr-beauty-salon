// DSR — Service detail (hero · ritual acts · variants · eligible artisans · sticky CTA)
import { useMemo, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Chip,
  Eyebrow,
  GoldRule,
  H1,
  H3,
  HeaderBar,
  Ico,
  Icons,
  Img,
  Numeral,
  Screen,
  Tiny,
} from '../components/atoms';
import { CATEGORIES } from '../data/catalog';
import { IMG_SERVICE, IMG_SERVICE_DETAIL } from '../data/images';
import { useRouter } from '../router/Router';
import { useCatalog, useServiceVariants } from '../data/CatalogProvider';
import { useFavorites } from '../data/FavoritesProvider';
import { ReviewsSection } from '../components/ReviewsSection';
import type { VariantId } from '../data/service-variants';

import { useCurrency } from '../lib/format';
export function ServiceDetail({ id }: { id: string }) {
  const T = useTheme();
  const { format: fmt } = useCurrency();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { getProduct, getService, getAllArtisans, getReviews } = useCatalog();
  const { isFavorite, toggle: toggleFav } = useFavorites();
  const s = getService(id);
  const variantsConfig = useServiceVariants(id);
  const reviews = getReviews().filter((r) => r.serviceId === id);

  const [variantId, setVariantId] = useState<VariantId>('standard');
  const [customAddons, setCustomAddons] = useState<string[]>([]);

  // Productos add-on resueltos por variant.
  const activeAddonIds = useMemo<string[]>(() => {
    if (variantId === 'premium') return variantsConfig?.premium?.addonProductIds ?? [];
    if (variantId === 'custom') return customAddons;
    return [];
  }, [variantId, variantsConfig, customAddons]);

  const addonProducts = activeAddonIds
    .map(getProduct)
    .filter((p): p is NonNullable<ReturnType<typeof getProduct>> => !!p);
  const addonTotal = addonProducts.reduce((a, p) => a + p.price, 0);
  const total = (s?.price ?? 0) + addonTotal;

  if (!s) return null;
  const eligible = getAllArtisans().filter((a) => a.cats.includes(s.cat));
  const heroSrc = IMG_SERVICE_DETAIL(s.id) || IMG_SERVICE(s.cat);
  const cat = CATEGORIES.find((c) => c.id === s.cat)!;

  const customCompatible = (variantsConfig?.customCompatibleProductIds ?? [])
    .map((pid) => getProduct(pid))
    .filter((p): p is NonNullable<ReturnType<typeof getProduct>> => !!p);

  const handleBook = () => {
    go('book', {
      service: s.id,
      variant: variantsConfig ? variantId : undefined,
      addonProductIds: activeAddonIds.length > 0 ? activeAddonIds : undefined,
    });
  };

  const toggleCustomAddon = (pid: string) =>
    setCustomAddons((arr) =>
      arr.includes(pid) ? arr.filter((x) => x !== pid) : [...arr, pid],
    );

  return (
    <Screen padTop={0} padBottom={120}>
      <HeaderBar
        onBack={() => go('services')}
        right={
          <button
            onClick={() => toggleFav('service', s.id)}
            aria-label={
              isFavorite('service', s.id)
                ? lang === 'es'
                  ? 'Quitar de favoritos'
                  : 'Remove from favorites'
                : lang === 'es'
                  ? 'Añadir a favoritos'
                  : 'Add to favorites'
            }
            className="dsr-press"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 4,
              margin: -4,
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <Ico
              size={18}
              color={isFavorite('service', s.id) ? T.gold : T.text}
              stroke={isFavorite('service', s.id) ? 0 : 1.6}
            >
              {Icons.heart}
            </Ico>
          </button>
        }
      />
      <div style={{ position: 'relative', height: 420 }}>
        <Img src={heroSrc} style={{ width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(${T.bgRgb},0.4) 0%, transparent 30%, transparent 70%, ${T.bg} 100%)`,
          }}
        />
      </div>

      <div style={{ padding: '24px 22px 0' }}>
        <Eyebrow>{lang === 'es' ? cat.es : cat.en}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 36 }}>{lang === 'es' ? s.es : s.en}</H1>
        <div style={{ marginTop: 14, display: 'flex', gap: 18, alignItems: 'center' }}>
          <Tiny
            muted
            style={{
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              textTransform: 'none',
              letterSpacing: 0.4,
            }}
          >
            <Ico size={12} color={T.textMuted} stroke={1.5}>
              {Icons.clock}
            </Ico>{' '}
            {s.duration} min
          </Tiny>
          <div style={{ width: 3, height: 3, borderRadius: 999, background: T.line }} />
          <Tiny
            style={{
              color: T.gold,
              fontFamily: T.serif,
              fontStyle: 'italic',
              fontSize: 18,
              letterSpacing: 0,
              textTransform: 'none',
            }}
          >
            {fmt(total)}
          </Tiny>
        </div>
        <GoldRule width={40} style={{ marginTop: 24 }} />
        <Body style={{ marginTop: 20, fontSize: 14, lineHeight: 1.65 }}>
          {lang === 'es' ? s.desc_es : s.desc_en}
        </Body>

        {/* Variant selector — solo si el servicio tiene config de variantes */}
        {variantsConfig && (
          <div style={{ marginTop: 30 }}>
            <Eyebrow>{lang === 'es' ? 'Tu ritual' : 'Your ritual'}</Eyebrow>
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 14,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                active={variantId === 'standard'}
                onClick={() => setVariantId('standard')}
              >
                {t('variantStandard')}
              </Chip>
              {variantsConfig.premium && (
                <Chip
                  active={variantId === 'premium'}
                  onClick={() => setVariantId('premium')}
                >
                  {t('variantPremium')}
                </Chip>
              )}
              {variantsConfig.customCompatibleProductIds &&
                variantsConfig.customCompatibleProductIds.length > 0 && (
                  <Chip
                    active={variantId === 'custom'}
                    onClick={() => setVariantId('custom')}
                  >
                    {t('variantCustom')}
                  </Chip>
                )}
            </div>

            {/* Variant body */}
            {variantId === 'standard' && (
              <Body
                muted
                style={{ marginTop: 14, fontSize: 13, lineHeight: 1.55 }}
              >
                {t('variantStandardDesc')}
              </Body>
            )}
            {variantId === 'premium' && variantsConfig.premium && (
              <div style={{ marginTop: 14 }}>
                <Body style={{ fontSize: 13, lineHeight: 1.55, color: T.gold }}>
                  {lang === 'es'
                    ? variantsConfig.premium.label_es
                    : variantsConfig.premium.label_en}
                </Body>
                <div
                  style={{
                    marginTop: 10,
                    padding: 14,
                    background: T.surface,
                    boxShadow: `inset 0 0 0 1px ${T.gold}33`,
                  }}
                >
                  <Tiny
                    muted
                    style={{
                      letterSpacing: 1.2,
                      fontSize: 9,
                      marginBottom: 8,
                      display: 'block',
                    }}
                  >
                    {t('variantAddons')}
                  </Tiny>
                  {addonProducts.map((p, i) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 0',
                        borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                      }}
                    >
                      <Body style={{ fontSize: 13 }}>
                        {lang === 'es' ? p.name_es : p.name_en}
                      </Body>
                      <Tiny style={{ color: T.gold }}>+ {fmt(p.price)}</Tiny>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {variantId === 'custom' && (
              <div style={{ marginTop: 14 }}>
                <Body
                  muted
                  style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}
                >
                  {t('variantCustomDesc')}
                </Body>
                <Tiny
                  muted
                  style={{
                    letterSpacing: 1.2,
                    fontSize: 9,
                    marginBottom: 10,
                    display: 'block',
                  }}
                >
                  {t('variantPickProducts')}
                </Tiny>
                {customCompatible.map((p, i) => {
                  const sel = customAddons.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleCustomAddon(p.id)}
                      className="dsr-press"
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '14px 0',
                        cursor: 'pointer',
                        borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          background: sel ? T.gold : 'transparent',
                          boxShadow: `inset 0 0 0 1px ${sel ? T.gold : T.lineStrong}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {sel && (
                          <Ico size={12} color={T.bg} stroke={2.5}>
                            {Icons.check}
                          </Ico>
                        )}
                      </div>
                      <Img
                        src={p.photo}
                        style={{ width: 44, height: 56, flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Tiny muted style={{ fontSize: 9, letterSpacing: 1.2 }}>
                          {p.line}
                        </Tiny>
                        <Body
                          style={{
                            marginTop: 2,
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {lang === 'es' ? p.name_es : p.name_en}
                        </Body>
                        <Tiny
                          muted
                          style={{
                            marginTop: 2,
                            fontSize: 11,
                            letterSpacing: 0.3,
                            textTransform: 'none',
                          }}
                        >
                          {p.size}
                        </Tiny>
                      </div>
                      <Tiny
                        style={{
                          color: T.gold,
                          fontFamily: T.serif,
                          fontStyle: 'italic',
                          fontSize: 15,
                          flexShrink: 0,
                        }}
                      >
                        + {fmt(p.price)}
                      </Tiny>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live total breakdown */}
            {addonTotal > 0 && (
              <div
                style={{
                  marginTop: 16,
                  padding: '14px 0',
                  borderTop: `1px solid ${T.line}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <Tiny
                  muted
                  style={{ letterSpacing: 0.4, textTransform: 'none' }}
                >
                  {lang === 'es' ? 'Total con extras' : 'Total with extras'}
                </Tiny>
                <H3 style={{ color: T.gold, fontStyle: 'italic' }}>
                  {fmt(total)}
                </H3>
              </div>
            )}
          </div>
        )}

        {/* Process */}
        <div style={{ marginTop: 30 }}>
          <Eyebrow>{lang === 'es' ? 'El ritual' : 'The ritual'}</Eyebrow>
          <div style={{ marginTop: 14 }}>
            {(lang === 'es'
              ? [
                  'Diagnóstico personalizado',
                  'Lavado y preparación',
                  'Aplicación a medida',
                  'Acabado y consejos en casa',
                ]
              : [
                  'Personalized diagnosis',
                  'Wash and prep',
                  'Bespoke application',
                  'Finish and home care',
                ]
            ).map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '14px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                }}
              >
                <Numeral value={['I', 'II', 'III', 'IV'][i]} style={{ fontSize: 16, width: 24 }} />
                <Body style={{ fontSize: 14 }}>{step}</Body>
              </div>
            ))}
          </div>
        </div>

        {/* Eligible artisans */}
        <div style={{ marginTop: 30 }}>
          <Eyebrow>
            {lang === 'es' ? 'Artistas para este servicio' : 'Artisans for this service'}
          </Eyebrow>
          <div
            className="dsr-scroll"
            style={{ display: 'flex', gap: 10, marginTop: 14, overflowX: 'auto' }}
          >
            {eligible.map((ar) => (
              <div
                key={ar.id}
                onClick={() => go('artisan', { id: ar.id })}
                style={{ flexShrink: 0, width: 130, cursor: 'pointer' }}
              >
                <Img src={ar.photo} style={{ width: '100%', height: 160 }} />
                <Tiny
                  style={{
                    marginTop: 10,
                    letterSpacing: 0.3,
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  {ar.name}
                </Tiny>
                <Tiny
                  muted
                  style={{
                    marginTop: 2,
                    fontSize: 10,
                    textTransform: 'none',
                    letterSpacing: 0.3,
                  }}
                >
                  {ar.years} {lang === 'es' ? 'años' : 'yrs'}
                </Tiny>
              </div>
            ))}
          </div>
        </div>

        <ReviewsSection reviews={reviews} />
      </div>

      {/* Sticky CTA */}
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
        <Btn onClick={handleBook}>
          {lang === 'es' ? 'Reservar este ritual' : 'Book this ritual'}
          <Ico size={14} color={T.bg}>
            {Icons.arrow}
          </Ico>
        </Btn>
      </div>
    </Screen>
  );
}
