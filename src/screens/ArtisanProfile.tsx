// DSR — Artisan profile (hero portrait · italic bio · specialties · service list · sticky CTA)
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Eyebrow,
  H1,
  HeaderBar,
  Ico,
  Icons,
  Img,
  Screen,
  Tiny,
} from '../components/atoms';
import { SERVICES } from '../data/catalog';
import { findArtisan } from '../data/helpers';
import { useRouter } from '../router/Router';

export function ArtisanProfile({ id }: { id: string }) {
  const T = useTheme();
  const { lang } = useI18n();
  const { go } = useRouter();
  const ar = findArtisan(id);
  if (!ar) return null;
  const services = SERVICES.filter((s) => ar.cats.includes(s.cat));

  return (
    <Screen padTop={0} padBottom={120}>
      <HeaderBar
        onBack={() => go('home')}
        right={
          <Ico size={18} color="#fff">
            {Icons.share}
          </Ico>
        }
      />
      <div style={{ position: 'relative', height: 480 }}>
        <Img src={ar.photo} style={{ width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(10,9,8,0.3) 0%, transparent 30%, transparent 50%, ${T.bg} 100%)`,
          }}
        />
        <div style={{ position: 'absolute', bottom: 20, left: 22, right: 22 }}>
          <Eyebrow style={{ color: T.goldHi }}>
            {lang === 'es' ? ar.role_es : ar.role_en}
          </Eyebrow>
          <H1 style={{ fontSize: 38, color: '#fff', marginTop: 8, fontWeight: 300 }}>
            {ar.name}
          </H1>
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Ico size={13} color={T.goldHi} stroke={2}>
                {Icons.star}
              </Ico>
              <Tiny
                style={{
                  color: '#fff',
                  letterSpacing: 0.4,
                  textTransform: 'none',
                }}
              >
                {ar.rating} · {ar.reviews}
              </Tiny>
            </div>
            <div
              style={{
                width: 3,
                height: 3,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.4)',
              }}
            />
            <Tiny style={{ color: '#fff', letterSpacing: 0.4, textTransform: 'none' }}>
              {ar.years} {lang === 'es' ? 'años' : 'years'}
            </Tiny>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 22px 0' }}>
        <Body
          style={{
            lineHeight: 1.7,
            fontStyle: 'italic',
            fontFamily: T.serif,
            fontSize: 18,
            fontWeight: 300,
          }}
        >
          "{lang === 'es' ? ar.bio_es : ar.bio_en}"
        </Body>

        <div style={{ marginTop: 28 }}>
          <Eyebrow>{lang === 'es' ? 'Especialidades' : 'Specialties'}</Eyebrow>
          <Body style={{ marginTop: 8, fontSize: 14 }}>
            {lang === 'es' ? ar.specialty_es : ar.specialty_en}
          </Body>
        </div>

        <div style={{ marginTop: 30 }}>
          <Eyebrow>{lang === 'es' ? 'Servicios' : 'Services'}</Eyebrow>
          <div style={{ marginTop: 14 }}>
            {services.map((s, i) => (
              <div
                key={s.id}
                onClick={() => go('service', { id: s.id })}
                className="dsr-press"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                  cursor: 'pointer',
                }}
              >
                <div>
                  <Body style={{ fontSize: 14, fontWeight: 500 }}>
                    {lang === 'es' ? s.es : s.en}
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
                    {s.duration} min · €{s.price}
                  </Tiny>
                </div>
                <Ico size={14} color={T.textMuted} stroke={1.5}>
                  {Icons.chev}
                </Ico>
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
        <Btn onClick={() => go('book', { artisan: ar.id })}>
          {lang === 'es' ? 'Reservar con ' : 'Book with '}
          {ar.name.split(' ')[0]}
        </Btn>
      </div>
    </Screen>
  );
}
