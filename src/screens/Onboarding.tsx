// DSR — Onboarding (3-slide editorial intro)
import { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import { Body, Btn, Eyebrow, H1, Ico, Icons, Img } from '../components/atoms';
import { useCatalog } from '../data/CatalogProvider';
import { IMG_ONBOARDING } from '../data/images';

interface Slide {
  title: string;
  sub: string;
  img: string;
  eyebrow: string;
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const T = useTheme();
  const { t, lang, setLang } = useI18n();
  const { getSettings } = useCatalog();
  const settings = getSettings();
  const [step, setStep] = useState(0);

  const slides: Slide[] = [
    {
      title: lang === 'es' ? `${settings.tagline_es}.` : `${settings.tagline_en}.`,
      sub:
        lang === 'es'
          ? 'Una maison de belleza concebida para mujeres con criterio. Cada gesto, una firma.'
          : 'A beauty maison for women of taste. Each gesture, a signature.',
      img: IMG_ONBOARDING(0),
      eyebrow: 'I — Maison',
    },
    {
      title:
        lang === 'es'
          ? 'Las manos que confías,\nelegidas por ti.'
          : 'The hands you trust,\nchosen by you.',
      sub:
        lang === 'es'
          ? 'Reserva con tu artista preferida, lee sus historias, sigue su agenda.'
          : 'Book with your preferred artisan, read their stories, follow their calendar.',
      img: IMG_ONBOARDING(1),
      eyebrow: 'II — Artisans',
    },
    {
      title: lang === 'es' ? 'Una tarjeta\nque te conoce.' : 'A card\nthat knows you.',
      sub:
        lang === 'es'
          ? 'Acumula puntos, sube de nivel y disfruta perks reservados a las nuestras.'
          : 'Earn points, climb tiers, and enjoy perks reserved for our own.',
      img: IMG_ONBOARDING(2),
      eyebrow: 'III — Membership',
    },
  ];
  const s = slides[step];
  const last = step === slides.length - 1;

  return (
    <div
      className="dsr"
      style={{
        width: '100%',
        height: '100%',
        background: T.bg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {T.grain && (
        <div
          className="dsr-grain"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.5,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Img src={s.img} style={{ width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(${T.bgRgb},0.4) 0%, rgba(${T.bgRgb},0.55) 40%, ${T.bg} 78%)`,
          }}
        />
      </div>

      {/* Lang toggle */}
      <div style={{ position: 'absolute', top: 64, right: 20, zIndex: 10 }}>
        <div
          style={{
            display: 'flex',
            gap: 1,
            background: 'rgba(10,9,8,0.4)',
            backdropFilter: 'blur(10px)',
            padding: 3,
            borderRadius: 999,
            boxShadow: `inset 0 0 0 1px ${T.lineStrong}`,
          }}
        >
          {(['es', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="dsr-press"
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: 999,
                fontFamily: T.sans,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                background: lang === l ? T.gold : 'transparent',
                color: lang === l ? T.bg : T.text,
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Skip */}
      <div style={{ position: 'absolute', top: 64, left: 20, zIndex: 10 }}>
        <button
          onClick={onDone}
          className="dsr-press"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 0',
            fontFamily: T.sans,
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: T.textMuted,
          }}
        >
          {t('skipFor')}
        </button>
      </div>

      {/* Content */}
      <div
        key={step}
        className="dsr-fadein"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 28px 50px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <Eyebrow style={{ color: T.gold }}>{s.eyebrow}</Eyebrow>
        <H1 style={{ fontSize: 40, whiteSpace: 'pre-line' }}>{s.title}</H1>
        <Body muted style={{ fontSize: 14, lineHeight: 1.55, maxWidth: 320 }}>
          {s.sub}
        </Body>

        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                flex: i === step ? 2 : 1,
                height: 1.5,
                background: i <= step ? T.gold : T.line,
                transition: 'all .3s',
              }}
            />
          ))}
        </div>

        <div style={{ marginTop: 16 }}>
          <Btn onClick={() => (last ? onDone() : setStep(step + 1))}>
            {last ? t('enterMaison') : t('continue')}
            <Ico size={14} color={T.bg}>
              {Icons.arrow}
            </Ico>
          </Btn>
        </div>
      </div>
    </div>
  );
}
