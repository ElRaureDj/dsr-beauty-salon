// DSR — Nail Atelier (editorial gallery, season filter, alternating mosaic layout)
import { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Chip,
  Eyebrow,
  H1,
  H2,
  HeaderBar,
  Img,
  Numeral,
  Screen,
  Tiny,
} from '../components/atoms';
import { useCatalog } from '../data/CatalogProvider';
import { I } from '../data/images';
import { NAIL_LOOKS } from '../data/nails';
import { useRouter } from '../router/Router';

export function NailAtelier() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { getArtisan } = useCatalog();
  const seasons =
    lang === 'es'
      ? ['Todas', 'Primavera', 'Verano', 'Otoño', 'Invierno']
      : ['All', 'Spring', 'Summer', 'Fall', 'Winter'];
  const [season, setSeason] = useState(0);

  const visible = NAIL_LOOKS.filter((n) => {
    if (season === 0) return true;
    return (lang === 'es' ? n.season_es : n.season_en) === seasons[season];
  });

  return (
    <Screen padTop={0} padBottom={120}>
      <HeaderBar onBack={() => go('services')} />

      {/* Editorial hero */}
      <div style={{ position: 'relative', height: 380 }}>
        <Img src={I('look-month')} style={{ width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(${T.bgRgb},0.45) 0%, rgba(${T.bgRgb},0.1) 35%, ${T.bg} 100%)`,
          }}
        />
        <div style={{ position: 'absolute', top: 80, left: 22, right: 22 }}>
          <Eyebrow style={{ color: T.goldHi }}>Atelier · Édition III</Eyebrow>
        </div>
        <div style={{ position: 'absolute', bottom: 26, left: 22, right: 22 }}>
          <Numeral value="N°" style={{ fontSize: 14 }} />
          <H1
            style={{
              fontSize: 42,
              color: T.text,
              marginTop: 4,
              fontWeight: 300,
              lineHeight: 0.95,
            }}
          >
            Atelier
          </H1>
          <H1
            style={{
              fontFamily: T.serif,
              fontStyle: 'italic',
              fontSize: 42,
              color: T.goldHi,
              lineHeight: 0.95,
              marginTop: 0,
              fontWeight: 300,
            }}
          >
            {lang === 'es' ? 'de Uñas.' : 'of Nails.'}
          </H1>
          <Body
            muted
            style={{
              marginTop: 14,
              fontSize: 13,
              lineHeight: 1.55,
              maxWidth: 280,
              color: 'rgba(245,237,220,0.85)',
            }}
          >
            {t('nailAtelierSub')}
          </Body>
        </div>
      </div>

      {/* Season chips */}
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
        {seasons.map((s, i) => (
          <Chip key={s} active={season === i} onClick={() => setSeason(i)}>
            {s}
          </Chip>
        ))}
      </div>

      {/* Editorial mosaic */}
      <div style={{ padding: '4px 22px 0' }}>
        {visible.map((n, i) => {
          const ar = getArtisan(n.artisan);
          if (!ar) return null;
          const isFeature = i % 3 === 0;
          return (
            <div
              key={n.id}
              onClick={() => go('nail-look', { id: n.id })}
              className="dsr-press"
              style={{
                cursor: 'pointer',
                marginBottom: 28,
                display: 'grid',
                gridTemplateColumns: isFeature ? '1fr' : '1.1fr 1fr',
                gap: 18,
                alignItems: 'center',
              }}
            >
              <div style={{ position: 'relative', aspectRatio: '4/5' }}>
                <Img src={n.img} style={{ width: '100%', height: '100%' }} />
                {n.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: 'rgba(10,9,8,0.7)',
                      backdropFilter: 'blur(8px)',
                      padding: '5px 10px',
                      boxShadow: `inset 0 0 0 1px ${T.gold}55`,
                    }}
                  >
                    <Tiny
                      style={{
                        color: T.goldHi,
                        fontSize: 9,
                        letterSpacing: 1.4,
                      }}
                    >
                      {lang === 'es' ? 'En boga' : 'In vogue'}
                    </Tiny>
                  </div>
                )}
              </div>
              <div>
                <Numeral
                  value={['I', 'II', 'III', 'IV', 'V', 'VI'][i % 6]}
                  style={{ fontSize: 12 }}
                />
                <H2
                  style={{
                    marginTop: 6,
                    fontSize: isFeature ? 28 : 22,
                    lineHeight: 1.05,
                  }}
                >
                  {lang === 'es' ? n.name_es : n.name_en}
                </H2>
                <Tiny
                  muted
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    letterSpacing: 0.4,
                    textTransform: 'none',
                    lineHeight: 1.5,
                  }}
                >
                  {lang === 'es' ? n.technique_es : n.technique_en}
                </Tiny>
                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <Img
                    src={ar.photo}
                    style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0 }}
                  />
                  <Tiny
                    style={{
                      fontSize: 10,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                    }}
                  >
                    {ar.name.split(' ')[0]} ·{' '}
                    {lang === 'es' ? n.season_es : n.season_en}
                  </Tiny>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
