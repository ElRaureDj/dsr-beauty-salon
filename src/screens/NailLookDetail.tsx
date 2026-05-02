// DSR — Nail look detail (4/5 hero, spec grid, artisan card, sticky CTA)
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
  Screen,
  Tiny,
} from '../components/atoms';
import { findArtisan, findNailLook, findService } from '../data/helpers';
import { useRouter } from '../router/Router';

export function NailLookDetail({ id }: { id: string }) {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const n = findNailLook(id);
  if (!n) return null;
  const ar = findArtisan(n.artisan);
  const svc = findService(n.service);

  return (
    <Screen padTop={0} padBottom={130}>
      <HeaderBar
        onBack={() => go('nail-atelier')}
        right={
          <Ico size={18} color={T.text}>
            {Icons.heart}
          </Ico>
        }
      />
      <div style={{ position: 'relative', aspectRatio: '4/5' }}>
        <Img src={n.img} style={{ width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(10,9,8,0.3) 0%, transparent 30%, transparent 70%, ${T.bg} 100%)`,
          }}
        />
      </div>

      <div style={{ padding: '20px 22px 0' }}>
        <Eyebrow>
          {t('nailAtelier')} · {lang === 'es' ? n.season_es : n.season_en}
        </Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 36, lineHeight: 1 }}>
          {lang === 'es' ? n.name_es : n.name_en}
        </H1>
        <Body style={{ marginTop: 14, fontSize: 14, lineHeight: 1.65 }}>
          {lang === 'es'
            ? `Una expresión sutil del savoir-faire de la maison: ${n.technique_es.toLowerCase()}, sobre un tono ${n.shade.toLowerCase()}.`
            : `A subtle expression of the maison's savoir-faire: ${n.technique_en.toLowerCase()}, on a ${n.shade.toLowerCase()} tone.`}
        </Body>

        <GoldRule width={36} style={{ marginTop: 26 }} />

        {/* Spec grid */}
        <div
          style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
          }}
        >
          <div style={{ padding: '14px 0', borderBottom: `1px solid ${T.line}` }}>
            <Tiny muted style={{ fontSize: 9, letterSpacing: 1.4 }}>
              {t('technique')}
            </Tiny>
            <Body style={{ marginTop: 6, fontSize: 13, lineHeight: 1.4 }}>
              {lang === 'es' ? n.technique_es : n.technique_en}
            </Body>
          </div>
          <div
            style={{
              padding: '14px 0',
              borderBottom: `1px solid ${T.line}`,
              paddingLeft: 16,
            }}
          >
            <Tiny muted style={{ fontSize: 9, letterSpacing: 1.4 }}>
              {lang === 'es' ? 'Tono' : 'Shade'}
            </Tiny>
            <Body style={{ marginTop: 6, fontSize: 13, lineHeight: 1.4 }}>
              {n.shade}
            </Body>
          </div>
          <div style={{ padding: '14px 0' }}>
            <Tiny muted style={{ fontSize: 9, letterSpacing: 1.4 }}>
              {t('season')}
            </Tiny>
            <Body style={{ marginTop: 6, fontSize: 13 }}>
              {lang === 'es' ? n.season_es : n.season_en}
            </Body>
          </div>
          <div style={{ padding: '14px 0', paddingLeft: 16 }}>
            <Tiny muted style={{ fontSize: 9, letterSpacing: 1.4 }}>
              {lang === 'es' ? 'Duración' : 'Duration'}
            </Tiny>
            <Body style={{ marginTop: 6, fontSize: 13 }}>
              {svc?.duration ?? 90} min · €{svc?.price ?? 95}
            </Body>
          </div>
        </div>

        {/* Artisan card */}
        {ar && (
          <div
            onClick={() => go('artisan', { id: ar.id })}
            className="dsr-press"
            style={{
              marginTop: 26,
              padding: 18,
              background: T.surface,
              cursor: 'pointer',
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              display: 'flex',
              gap: 14,
              alignItems: 'center',
            }}
          >
            <Img
              src={ar.photo}
              style={{ width: 56, height: 56, borderRadius: 999, flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <Tiny muted style={{ fontSize: 9, letterSpacing: 1.4 }}>
                {t('artist')}
              </Tiny>
              <Body style={{ marginTop: 4, fontSize: 14, fontWeight: 500 }}>
                {ar.name}
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
                {lang === 'es' ? ar.role_es : ar.role_en}
              </Tiny>
            </div>
            <Ico size={14} color={T.gold}>
              {Icons.arrow}
            </Ico>
          </div>
        )}
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
        <Btn
          onClick={() =>
            go('book', {
              service: n.service,
              artisan: ar?.id,
              look: n.id,
            })
          }
        >
          {t('book_this')}
          <Ico size={14} color={T.bg}>
            {Icons.arrow}
          </Ico>
        </Btn>
      </div>
    </Screen>
  );
}
