// DSR — Services list (category-driven, with Nail Atelier hook)
import { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Chip,
  Eyebrow,
  H1,
  H2,
  H3,
  Ico,
  Icons,
  Img,
  Numeral,
  Screen,
  Tiny,
} from '../components/atoms';
import { CATEGORIES } from '../data/catalog';
import { useCatalog } from '../data/CatalogProvider';
import { IMG_LOOK_OF_MONTH, IMG_SERVICE } from '../data/images';
import { useRouter } from '../router/Router';
import type { CategoryId } from '../types';

import { useCurrency } from '../lib/format';
export function Services() {
  const T = useTheme();
  const { format: fmt } = useCurrency();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const [cat, setCat] = useState<CategoryId>('hair');
  const services = useCatalog().getAllServices();
  const filtered = services.filter((s) => s.cat === cat);
  const catObj = CATEGORIES.find((c) => c.id === cat)!;

  return (
    <Screen padTop={0}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 320 }}>
        <Img src={IMG_SERVICE(cat)} style={{ width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(${T.bgRgb},0.5) 0%, rgba(${T.bgRgb},0.2) 50%, ${T.bg} 100%)`,
          }}
        />
        <div style={{ position: 'absolute', top: 64, left: 22, right: 22 }}>
          <Eyebrow style={{ color: T.goldHi }}>{lang === 'es' ? 'Servicios' : 'Services'}</Eyebrow>
        </div>
        <div style={{ position: 'absolute', bottom: 30, left: 22, right: 22 }}>
          <Numeral value={catObj.tag} style={{ fontSize: 14 }} />
          <H1 style={{ fontSize: 38, color: T.text, marginTop: 4, fontWeight: 300 }}>
            {lang === 'es' ? catObj.es : catObj.en}
          </H1>
        </div>
      </div>

      {/* Category chips */}
      <div
        className="dsr-scroll"
        style={{
          display: 'flex',
          gap: 8,
          padding: '20px 22px',
          overflowX: 'auto',
          position: 'sticky',
          top: 0,
          zIndex: 5,
          background: `linear-gradient(180deg, ${T.bg} 70%, transparent)`,
        }}
      >
        {CATEGORIES.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {lang === 'es' ? c.es : c.en}
          </Chip>
        ))}
      </div>

      {/* Nail Atelier hook */}
      {cat === 'nails' && (
        <div style={{ padding: '0 22px 8px' }}>
          <div
            onClick={() => go('nail-atelier')}
            className="dsr-press"
            style={{
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
              aspectRatio: '16/9',
              marginBottom: 18,
            }}
          >
            <Img src={IMG_LOOK_OF_MONTH()} style={{ width: '100%', height: '100%' }} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, rgba(10,9,8,0.85) 0%, rgba(10,9,8,0.3) 70%, transparent 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Eyebrow style={{ color: T.goldHi }}>{t('nailAtelier')}</Eyebrow>
              <div>
                <H2
                  style={{
                    fontSize: 24,
                    color: '#fff',
                    lineHeight: 1,
                    fontWeight: 300,
                    fontFamily: T.serif,
                    fontStyle: 'italic',
                  }}
                >
                  {lang === 'es' ? 'Galería editorial' : 'Editorial gallery'}
                </H2>
                <div
                  style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}
                >
                  <Tiny
                    style={{
                      color: 'rgba(245,237,220,0.8)',
                      letterSpacing: 0.4,
                      textTransform: 'none',
                      fontSize: 11,
                    }}
                  >
                    {lang === 'es' ? 'Explorar looks' : 'Explore looks'}
                  </Tiny>
                  <Ico size={10} color={T.goldHi} stroke={1.5}>
                    {Icons.arrow}
                  </Ico>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ padding: '0 22px' }}>
        {filtered.map((s, i) => (
          <div
            key={s.id}
            onClick={() => go('service', { id: s.id })}
            className="dsr-press"
            style={{
              padding: '24px 0',
              cursor: 'pointer',
              borderBottom: i === filtered.length - 1 ? 'none' : `1px solid ${T.line}`,
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <H3 style={{ fontSize: 22 }}>{lang === 'es' ? s.es : s.en}</H3>
                {s.popular && (
                  <Tiny
                    style={{
                      color: T.gold,
                      fontStyle: 'italic',
                      fontFamily: T.serif,
                      fontSize: 11,
                      letterSpacing: 0.5,
                      textTransform: 'none',
                    }}
                  >
                    · en boga
                  </Tiny>
                )}
              </div>
              <Body muted style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>
                {lang === 'es' ? s.desc_es : s.desc_en}
              </Body>
              <div style={{ marginTop: 12, display: 'flex', gap: 14, alignItems: 'center' }}>
                <Tiny
                  muted
                  style={{
                    display: 'flex',
                    gap: 4,
                    alignItems: 'center',
                    textTransform: 'none',
                    letterSpacing: 0.4,
                  }}
                >
                  <Ico size={11} color={T.textFaint} stroke={1.5}>
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
                    fontSize: 16,
                    letterSpacing: 0,
                    textTransform: 'none',
                  }}
                >
                  {fmt(s.price)}
                </Tiny>
              </div>
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                background: T.surface,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `inset 0 0 0 1px ${T.line}`,
              }}
            >
              <Ico size={12} color={T.text} stroke={1.6}>
                {Icons.chev}
              </Ico>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
