// DSR — Service detail (hero · ritual acts · eligible artisans · sticky CTA)
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
import { ARTISANS, CATEGORIES } from '../data/catalog';
import { findService } from '../data/helpers';
import { IMG_SERVICE, IMG_SERVICE_DETAIL } from '../data/images';
import { useRouter } from '../router/Router';

export function ServiceDetail({ id }: { id: string }) {
  const T = useTheme();
  const { lang } = useI18n();
  const { go } = useRouter();
  const s = findService(id);
  if (!s) return null;
  const eligible = ARTISANS.filter((a) => a.cats.includes(s.cat));
  const heroSrc = IMG_SERVICE_DETAIL(s.id) || IMG_SERVICE(s.cat);
  const cat = CATEGORIES.find((c) => c.id === s.cat)!;

  return (
    <Screen padTop={0} padBottom={120}>
      <HeaderBar
        onBack={() => go('services')}
        right={
          <Ico size={18} color={T.text}>
            {Icons.heart}
          </Ico>
        }
      />
      <div style={{ position: 'relative', height: 420 }}>
        <Img src={heroSrc} style={{ width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(10,9,8,0.4) 0%, transparent 30%, transparent 70%, ${T.bg} 100%)`,
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
            €{s.price}
          </Tiny>
        </div>
        <GoldRule width={40} style={{ marginTop: 24 }} />
        <Body style={{ marginTop: 20, fontSize: 14, lineHeight: 1.65 }}>
          {lang === 'es' ? s.desc_es : s.desc_en}
        </Body>

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
        <Btn onClick={() => go('book', { service: s.id })}>
          {lang === 'es' ? 'Reservar este ritual' : 'Book this ritual'}
          <Ico size={14} color={T.bg}>
            {Icons.arrow}
          </Ico>
        </Btn>
      </div>
    </Screen>
  );
}
