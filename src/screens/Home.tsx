// DSR — Home (hero · upcoming · AI pick · stories · look-of-month · artisans · member card)
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Divider,
  Eyebrow,
  GhostBtn,
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
import { useCatalog } from '../data/CatalogProvider';
import { useAppointments } from '../data/AppointmentsProvider';
import { STORIES } from '../data/user';
import { useUserData } from '../data/useUserData';
import { greeting, nextTier, tierFor } from '../data/helpers';
import { I, IMG_HERO_SPRING, IMG_LOOK_OF_MONTH } from '../data/images';
import { useRouter } from '../router/Router';

export function Home() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { getArtisan, getService, getAllArtisans, getCombos, getAllServices, getTiers } =
    useCatalog();
  const { getUpcoming } = useAppointments();
  const user = useUserData();
  const featuredCombos = getCombos().filter((c) => c.popular);
  const allServicesForCombos = getAllServices();
  const tiers = getTiers();
  const tier = tierFor(user.points, tiers);
  const next = nextTier(user.points, tiers);

  const heroImg = IMG_HERO_SPRING();
  const upcoming = getUpcoming();
  const upcomingArt = upcoming ? getArtisan(upcoming.artisan) : null;

  return (
    <Screen padTop={0} padBottom={110}>
      {/* Top brand bar */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 22px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Tiny muted style={{ letterSpacing: 1.6 }}>
            {greeting(lang, t)}
          </Tiny>
          <div
            style={{
              fontFamily: T.serif,
              fontSize: 22,
              color: T.text,
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1,
            }}
          >
            {user.name}.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="dsr-press"
            style={{
              width: 38,
              height: 38,
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
            <Ico size={16} color={T.text}>
              {Icons.search}
            </Ico>
          </button>
        </div>
      </div>

      {/* HERO */}
      <div style={{ position: 'relative', height: 460, marginTop: 0 }}>
        <Img src={heroImg} style={{ width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(${T.bgRgb},0.55) 0%, rgba(${T.bgRgb},0.05) 30%, rgba(${T.bgRgb},0.05) 60%, ${T.bg} 100%)`,
          }}
        />
        <div style={{ position: 'absolute', bottom: 30, left: 22, right: 22 }}>
          <Eyebrow style={{ color: T.goldHi, marginBottom: 12 }}>Édition Printemps · 2026</Eyebrow>
          <H1 style={{ fontSize: 42, color: T.text, lineHeight: 1, fontWeight: 300 }}>
            {lang === 'es' ? 'La nueva luz' : 'The new light'}
          </H1>
          <H1
            style={{
              fontFamily: T.serif,
              fontStyle: 'italic',
              fontSize: 42,
              color: T.goldHi,
              lineHeight: 1,
              marginTop: -2,
              fontWeight: 300,
            }}
          >
            {lang === 'es' ? 'de la temporada.' : 'of the season.'}
          </H1>
          <div style={{ marginTop: 16 }}>
            <GhostBtn style={{ color: T.goldHi }}>
              {lang === 'es' ? 'Descubrir el ritual' : 'Discover the ritual'}
              <Ico size={11} color={T.goldHi} stroke={1.6}>
                {Icons.arrow}
              </Ico>
            </GhostBtn>
          </div>
        </div>
      </div>

      {/* UPCOMING APPOINTMENT */}
      {upcoming && upcomingArt && (
        <div style={{ padding: '32px 22px 0' }}>
          <div
            style={{
              background: T.surface,
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              padding: 22,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 22,
                right: 22,
                fontFamily: T.serif,
                fontStyle: 'italic',
                fontSize: 12,
                color: T.gold,
              }}
            >
              {t('upcomingApt')}
            </div>
            <Eyebrow style={{ marginBottom: 14 }}>
              {new Date(upcoming.date).toLocaleDateString(
                lang === 'es' ? 'es-ES' : 'en-US',
                { weekday: 'long', day: 'numeric', month: 'long' },
              )}{' '}
              · {upcoming.time}
            </Eyebrow>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <Img
                src={upcomingArt.photo}
                style={{ width: 52, height: 52, borderRadius: 999, flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <H3 style={{ fontSize: 19 }}>
                  {upcoming.services
                    .map((s) => {
                      const svc = getService(s);
                      if (!svc) return s;
                      return lang === 'es' ? svc.es : svc.en;
                    })
                    .join(' + ')}
                </H3>
                <Tiny
                  muted
                  style={{ marginTop: 4, letterSpacing: 0.4, textTransform: 'none' }}
                >
                  {lang === 'es' ? 'con' : 'with'} {upcomingArt.name} · {upcoming.duration} min
                </Tiny>
              </div>
            </div>
            <Divider style={{ margin: '0 -22px' }} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 14,
                alignItems: 'center',
              }}
            >
              <button
                onClick={() =>
                  go('book', {
                    service: upcoming.services[0],
                    artisan: upcoming.artisan,
                  })
                }
                className="dsr-press"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: T.sans,
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  color: T.textMuted,
                }}
              >
                {lang === 'es' ? 'Reagendar' : 'Reschedule'}
              </button>
              <GhostBtn
                onClick={() => go('appointment', { id: upcoming.id })}
                style={{ color: T.gold }}
              >
                {lang === 'es' ? 'Ver cita' : 'View'}
                <Ico size={11} color={T.gold} stroke={1.6}>
                  {Icons.arrow}
                </Ico>
              </GhostBtn>
            </div>
          </div>
        </div>
      )}

      {/* AI PICK */}
      <div style={{ padding: '36px 22px 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
          }}
        >
          <div>
            <Eyebrow>{t('aiPick')}</Eyebrow>
            <H3 style={{ marginTop: 6, fontSize: 20 }}>
              {lang === 'es' ? 'Para tu próxima visita' : 'For your next visit'}
            </H3>
          </div>
          <Numeral value="II" style={{ fontSize: 28 }} />
        </div>
        <Body muted style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
          {t('aiPickDesc')}
        </Body>
        <div
          style={{
            background: T.surface,
            padding: 18,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <Img src={I('service-balayage')} style={{ width: 78, height: 96, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Tiny style={{ color: T.gold, letterSpacing: 1.4 }}>
              {lang === 'es' ? 'Recomendado · 96% match' : 'Recommended · 96% match'}
            </Tiny>
            <H3 style={{ fontSize: 18, marginTop: 6 }}>
              {lang === 'es' ? 'Gloss & Brillo' : 'Gloss & Shine'}
            </H3>
            <Body muted style={{ fontSize: 12, marginTop: 4, lineHeight: 1.45 }}>
              {lang === 'es'
                ? 'Tu tono actual pediría revivir el brillo.'
                : 'Your current tone is calling for shine.'}
            </Body>
          </div>
          <button
            onClick={() => go('book')}
            className="dsr-press"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: 'none',
              flexShrink: 0,
              background: T.gold,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ico size={14} color="#0A0908" stroke={1.8}>
              {Icons.arrow}
            </Ico>
          </button>
        </div>
      </div>

      {/* COMBOS / PAQUETES */}
      {featuredCombos.length > 0 && (
        <div style={{ marginTop: 44 }}>
          <div
            style={{
              padding: '0 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 14,
            }}
          >
            <div>
              <Eyebrow>{t('combosCustomerTitle')}</Eyebrow>
              <Tiny
                muted
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  letterSpacing: 0.3,
                  textTransform: 'none',
                  display: 'block',
                  fontStyle: 'italic',
                  fontFamily: T.serif,
                }}
              >
                {t('combosCustomerSub')}
              </Tiny>
            </div>
          </div>
          <div
            className="dsr-scroll"
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto',
              padding: '0 22px',
            }}
          >
            {featuredCombos.map((c) => {
              const services = c.serviceIds.map((sid) =>
                allServicesForCombos.find((s) => s.id === sid),
              );
              const base = services.reduce((a, s) => a + (s?.price ?? 0), 0);
              const final = Math.round(base * (1 - c.discountPct / 100));
              const totalMin = services.reduce((a, s) => a + (s?.duration ?? 0), 0);
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    if (c.serviceIds.length > 0) {
                      go('book', { combo: c.id });
                    }
                  }}
                  className="dsr-press"
                  style={{
                    flexShrink: 0,
                    width: 280,
                    background: T.surface,
                    boxShadow: `inset 0 0 0 1px ${T.gold}33`,
                    padding: 18,
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <Eyebrow style={{ color: T.gold, fontSize: 9 }}>
                      −{c.discountPct}% · {t('combosSavePct')}
                    </Eyebrow>
                    <Ico size={11} color={T.gold}>
                      {Icons.diamond}
                    </Ico>
                  </div>
                  <div
                    style={{
                      fontFamily: T.serif,
                      fontStyle: 'italic',
                      fontSize: 22,
                      marginTop: 8,
                      lineHeight: 1.15,
                      color: T.text,
                      fontWeight: 300,
                    }}
                  >
                    {lang === 'es' ? c.name_es : c.name_en}
                  </div>
                  <Tiny
                    muted
                    style={{
                      marginTop: 6,
                      fontSize: 11,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                      lineHeight: 1.4,
                    }}
                  >
                    {services
                      .filter(Boolean)
                      .map((s) => (lang === 'es' ? s!.es : s!.en))
                      .join(' + ')}
                  </Tiny>
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: `1px solid ${T.line}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <Tiny
                      muted
                      style={{ fontSize: 10, letterSpacing: 0.3, textTransform: 'none' }}
                    >
                      {totalMin} min
                    </Tiny>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                      <Tiny
                        style={{
                          color: T.textFaint,
                          fontSize: 11,
                          textDecoration: 'line-through',
                          textTransform: 'none',
                        }}
                      >
                        €{base}
                      </Tiny>
                      <span
                        style={{
                          fontFamily: T.serif,
                          fontStyle: 'italic',
                          fontSize: 22,
                          color: T.gold,
                          fontWeight: 300,
                          lineHeight: 1,
                        }}
                      >
                        €{final}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STORIES */}
      <div style={{ marginTop: 36 }}>
        <div
          style={{
            padding: '0 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
          }}
        >
          <Eyebrow>{t('stories')}</Eyebrow>
          <GhostBtn>{t('seeAll')}</GhostBtn>
        </div>
        <div
          className="dsr-scroll"
          style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 22px' }}
        >
          {STORIES.map((s) => {
            const ar = getArtisan(s.artisan);
            if (!ar) return null;
            return (
              <div
                key={s.id}
                style={{ flexShrink: 0, width: 110, position: 'relative', cursor: 'pointer' }}
              >
                <div style={{ position: 'relative', height: 150, overflow: 'hidden' }}>
                  <Img src={s.cover} style={{ width: '100%', height: '100%' }} />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      width: 26,
                      height: 26,
                      borderRadius: 999,
                      overflow: 'hidden',
                      border: `1.5px solid ${T.gold}`,
                    }}
                  >
                    <Img src={ar.photo} style={{ width: '100%', height: '100%' }} />
                  </div>
                </div>
                <Tiny
                  style={{
                    marginTop: 8,
                    letterSpacing: 0.3,
                    textTransform: 'none',
                    fontWeight: 500,
                    color: T.text,
                    lineHeight: 1.3,
                  }}
                >
                  {lang === 'es' ? s.title_es : s.title_en}
                </Tiny>
                <Tiny muted style={{ marginTop: 2, fontSize: 10 }}>
                  {ar.name.split(' ')[0]}
                </Tiny>
              </div>
            );
          })}
        </div>
      </div>

      {/* LOOK OF THE MONTH */}
      <div style={{ marginTop: 44, padding: '0 22px' }}>
        <div
          onClick={() => go('nail-atelier')}
          className="dsr-press"
          style={{
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
            aspectRatio: '4/5',
          }}
        >
          <Img src={IMG_LOOK_OF_MONTH()} style={{ width: '100%', height: '100%' }} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(10,9,8,0.35) 0%, transparent 30%, transparent 55%, rgba(10,9,8,0.85) 100%)',
            }}
          />
          <div style={{ position: 'absolute', top: 22, left: 22, right: 22 }}>
            <Eyebrow style={{ color: T.goldHi }}>{t('lookOfMonth')}</Eyebrow>
          </div>
          <div style={{ position: 'absolute', bottom: 24, left: 22, right: 22 }}>
            <Numeral value="N°" style={{ fontSize: 12, color: '#fff' }} />
            <H1
              style={{
                marginTop: 2,
                fontSize: 30,
                color: '#fff',
                lineHeight: 0.95,
                fontWeight: 300,
              }}
            >
              Atelier
            </H1>
            <H1
              style={{
                fontFamily: T.serif,
                fontStyle: 'italic',
                fontSize: 30,
                color: T.goldHi,
                lineHeight: 0.95,
                fontWeight: 300,
              }}
            >
              {lang === 'es' ? 'de Uñas.' : 'of Nails.'}
            </H1>
            <div
              style={{
                marginTop: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <Tiny
                style={{
                  color: 'rgba(245,237,220,0.85)',
                  letterSpacing: 0.4,
                  textTransform: 'none',
                  maxWidth: 200,
                  lineHeight: 1.4,
                }}
              >
                {t('nailAtelierSub')}
              </Tiny>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  background: T.gold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Ico size={14} color={T.bg}>
                  {Icons.arrow}
                </Ico>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ARTISANS */}
      <div style={{ marginTop: 40, padding: '0 22px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 18,
          }}
        >
          <div>
            <Numeral value="III" style={{ fontSize: 12 }} />
            <H2 style={{ marginTop: 4 }}>{t('yourArtisans')}</H2>
          </div>
          <GhostBtn>{t('seeAll')}</GhostBtn>
        </div>
        <div className="dsr-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
          {getAllArtisans().slice(0, 4).map((ar) => (
            <div
              key={ar.id}
              onClick={() => go('artisan', { id: ar.id })}
              style={{ flexShrink: 0, width: 168, cursor: 'pointer' }}
            >
              <Img src={ar.photo} style={{ width: '100%', height: 220 }} />
              <div style={{ marginTop: 12 }}>
                <H3 style={{ fontSize: 16 }}>{ar.name}</H3>
                <Tiny
                  muted
                  style={{ marginTop: 4, letterSpacing: 0.5, textTransform: 'none', fontWeight: 400 }}
                >
                  {lang === 'es' ? ar.role_es : ar.role_en}
                </Tiny>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Ico size={11} color={T.gold} stroke={2}>
                    {Icons.star}
                  </Ico>
                  <Tiny style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'none' }}>
                    {ar.rating} · {ar.reviews}
                  </Tiny>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MEMBER quick view */}
      <div style={{ marginTop: 40, padding: '0 22px' }}>
        <div
          onClick={() => go('rewards')}
          style={{
            background: `linear-gradient(135deg, ${T.surface} 0%, ${T.surfaceHi} 100%)`,
            padding: 22,
            cursor: 'pointer',
            boxShadow: `inset 0 0 0 1px ${T.gold}33`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 140,
              height: 140,
              borderRadius: 999,
              background: `radial-gradient(circle, ${T.gold}22, transparent 70%)`,
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <Eyebrow>
              {t('member')} · {t('tier')[tier.id]}
            </Eyebrow>
            <Tiny style={{ color: T.gold, fontFamily: T.mono, letterSpacing: 1 }}>
              0294 · DSR
            </Tiny>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: T.serif,
                  fontSize: 36,
                  color: T.gold,
                  lineHeight: 1,
                  fontWeight: 300,
                }}
              >
                {user.points.toLocaleString()}
              </div>
              <Tiny
                muted
                style={{ marginTop: 4, letterSpacing: 0.5, textTransform: 'none' }}
              >
                {t('points')}
              </Tiny>
            </div>
            {next && (
              <div style={{ textAlign: 'right' }}>
                <Tiny muted style={{ letterSpacing: 0.5, textTransform: 'none' }}>
                  {(next.min - user.points).toLocaleString()} {t('points')}
                </Tiny>
                <Tiny
                  style={{
                    color: T.gold,
                    marginTop: 4,
                    letterSpacing: 0.5,
                    textTransform: 'none',
                  }}
                >
                  {lang === 'es' ? 'a' : 'to'} {next.name[lang]}
                </Tiny>
              </div>
            )}
          </div>
          {next && (
            <div style={{ marginTop: 14, height: 2, background: T.line }}>
              <div
                style={{
                  width: `${((user.points - tier.min) / (next.min - tier.min)) * 100}%`,
                  height: '100%',
                  background: T.gold,
                  transition: 'width .6s',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}
