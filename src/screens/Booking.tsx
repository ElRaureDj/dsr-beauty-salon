// DSR — Booking flow (5 steps): services → artisan → date/time → review → confirmed
import { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Chip,
  Divider,
  Eyebrow,
  GhostBtn,
  H1,
  H3,
  HeaderBar,
  Ico,
  Icons,
  Img,
  Numeral,
  Screen,
  TAB_BAR_HEIGHT,
  Tiny,
} from '../components/atoms';
import { CATEGORIES } from '../data/catalog';
import { buildSchedule } from '../data/helpers';
import { useCatalog } from '../data/CatalogProvider';
import { useRouter } from '../router/Router';
import { useCart } from '../cart/CartProvider';
import type { CategoryId } from '../types';

interface BookingProps {
  initial?: {
    service?: string;
    artisan?: string;
    look?: string;
    variant?: 'standard' | 'premium' | 'custom';
    addonProductIds?: string[];
    combo?: string;
  };
  editingBookingId?: string;
}

export function Booking({ initial = {}, editingBookingId }: BookingProps) {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const cart = useCart();
  const { getProduct, getService, getArtisan, getCombo, getAllServices, getAllArtisans } =
    useCatalog();

  // Si venimos del drawer con un booking guardado, pre-cargamos el state.
  // Buscamos UNA sola vez (al mount) para no perder edits si la lista cambia.
  const [editingSnapshot] = useState(() =>
    editingBookingId
      ? cart.pendingBookings.find((b) => b.id === editingBookingId) ?? null
      : null,
  );
  const isEditing = editingSnapshot !== null;

  // Combo: persiste id + discount en estado. Se resuelve una sola vez
  // (al mount) y luego se conserva incluso si el admin edita el combo.
  const [comboId] = useState<string | null>(() => {
    if (editingSnapshot?.comboId) return editingSnapshot.comboId;
    return initial.combo ?? null;
  });
  const [discountPct] = useState<number>(() => {
    if (editingSnapshot?.discountPct !== undefined) return editingSnapshot.discountPct;
    if (initial.combo) {
      const c = getCombo(initial.combo);
      return c?.discountPct ?? 0;
    }
    return 0;
  });

  const [step, setStep] = useState<number>(() => {
    if (editingSnapshot) return 3;
    return initial.service || initial.combo ? 1 : 0;
  });
  const [services, setServices] = useState<string[]>(() => {
    if (editingSnapshot) return [...editingSnapshot.serviceIds];
    if (initial.combo) {
      const c = getCombo(initial.combo);
      if (c) return [...c.serviceIds];
    }
    return initial.service ? [initial.service] : [];
  });
  const [artisan, setArtisan] = useState<string | null>(() => {
    if (editingSnapshot) return editingSnapshot.artisanId;
    return initial.artisan || null;
  });
  const [cat, setCat] = useState<CategoryId>('hair');
  const [day, setDay] = useState<number>(() => {
    if (!editingSnapshot) return 0;
    // Match the saved date contra el schedule actual del artista.
    // Si el día ya pasó (no está en la ventana de 7 días), default a 0.
    const sch = buildSchedule(editingSnapshot.artisanId);
    const idx = sch.findIndex(
      (d) => d.date.toISOString().slice(0, 10) === editingSnapshot.date,
    );
    return idx >= 0 ? idx : 0;
  });
  const [time, setTime] = useState<string | null>(
    editingSnapshot ? editingSnapshot.time : null,
  );
  const [notes, setNotes] = useState<string>(
    editingSnapshot?.notes ?? '',
  );
  const [waitlist, setWaitlist] = useState(false);
  const [withFriend, setWithFriend] = useState(false);

  // Variant + add-ons del servicio (vienen de ServiceDetail). Si estamos
  // editando un booking guardado, se preservan.
  const [variant] = useState<'standard' | 'premium' | 'custom' | undefined>(() => {
    if (editingSnapshot?.variant) return editingSnapshot.variant;
    return initial.variant;
  });
  const [addonProductIds] = useState<string[]>(() => {
    if (editingSnapshot?.addonProductIds) return [...editingSnapshot.addonProductIds];
    return initial.addonProductIds ?? [];
  });

  const toggleService = (id: string) =>
    setServices((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  const chosenSvcs = services
    .map(getService)
    .filter((s): s is NonNullable<ReturnType<typeof getService>> => !!s);
  const allCats = [...new Set(chosenSvcs.map((s) => s.cat))];
  const eligibleArtisans = getAllArtisans().filter((a) =>
    allCats.every((c) => a.cats.includes(c)),
  );
  const baseServicePrice = chosenSvcs.reduce((a, s) => a + s.price, 0);
  const addonsTotal = addonProductIds.reduce((a, pid) => {
    const p = getProduct(pid);
    return a + (p?.price ?? 0);
  }, 0);
  // El combo solo aplica si todos sus servicios siguen seleccionados.
  // Si el usuario quita uno en step 0, el descuento se cancela visualmente
  // y al persistir.
  const comboObj = comboId ? getCombo(comboId) : null;
  const comboStillValid = !!(
    comboObj && comboObj.serviceIds.every((id) => services.includes(id))
  );
  const effectiveDiscountPct = comboStillValid ? discountPct : 0;
  const discountAmount = Math.round(
    (baseServicePrice * effectiveDiscountPct) / 100,
  );
  const totalPrice = baseServicePrice - discountAmount + addonsTotal;
  const totalMin = chosenSvcs.reduce((a, s) => a + s.duration, 0);

  const arObj = artisan && artisan !== 'any' ? getArtisan(artisan) : null;
  // For "any", just pick the first eligible artisan deterministically
  const effectiveArtisan = arObj ?? (artisan === 'any' ? eligibleArtisans[0] : null);
  const schedule = effectiveArtisan ? buildSchedule(effectiveArtisan.id) : [];

  const stepsLabels = [
    t('selectService'),
    t('selectArtisan'),
    t('selectDateTime'),
    t('review'),
    t('confirmed'),
  ];

  const canNext = (() => {
    if (step === 0) return services.length > 0;
    if (step === 1) return !!artisan;
    if (step === 2) return time !== null;
    return true;
  })();

  return (
    <>
      <Screen
        padTop={0}
        padBottom={step === 4 ? 40 : TAB_BAR_HEIGHT + 100}
      >
      {step !== 4 && (
        <HeaderBar
          onBack={() => (step === 0 ? go('home') : setStep(step - 1))}
          title={`${stepsLabels[step]} · ${step + 1}/4`}
        />
      )}

      {/* Progress bar */}
      {step !== 4 && (
        <div style={{ display: 'flex', gap: 4, padding: '108px 22px 0' }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 1.5,
                background: i <= step ? T.gold : T.line,
                transition: 'all .3s',
              }}
            />
          ))}
        </div>
      )}

      <div style={{ padding: '28px 22px 0' }} key={step} className="dsr-fadein">
        {/* STEP 0: Services */}
        {step === 0 && (
          <>
            <Numeral value="I" style={{ fontSize: 14 }} />
            <H1 style={{ fontSize: 32, marginTop: 6 }}>
              {lang === 'es' ? 'Elige tu ritual' : 'Choose your ritual'}
            </H1>
            <Body muted style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
              {lang === 'es'
                ? 'Puedes combinar varios servicios consecutivos.'
                : 'You can combine multiple consecutive services.'}
            </Body>

            <div
              className="dsr-scroll"
              style={{
                display: 'flex',
                gap: 8,
                margin: '22px 0 14px',
                overflowX: 'auto',
              }}
            >
              {CATEGORIES.map((c) => (
                <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
                  {lang === 'es' ? c.es : c.en}
                </Chip>
              ))}
            </div>

            <div>
              {getAllServices().filter((s) => s.cat === cat).map((s, i, arr) => {
                const sel = services.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    className="dsr-press"
                    style={{
                      padding: '18px 0',
                      cursor: 'pointer',
                      borderBottom:
                        i === arr.length - 1 ? 'none' : `1px solid ${T.line}`,
                      display: 'flex',
                      gap: 14,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                        background: sel ? T.gold : 'transparent',
                        boxShadow: `inset 0 0 0 1px ${sel ? T.gold : T.lineStrong}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {sel && (
                        <Ico size={12} color="#0A0908" stroke={2.5}>
                          {Icons.check}
                        </Ico>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <H3 style={{ fontSize: 17 }}>{lang === 'es' ? s.es : s.en}</H3>
                      <Tiny
                        muted
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          letterSpacing: 0.3,
                          textTransform: 'none',
                        }}
                      >
                        {s.duration} min · €{s.price}
                      </Tiny>
                    </div>
                  </div>
                );
              })}
            </div>

            {services.length > 0 && (
              <div
                style={{
                  marginTop: 24,
                  padding: 16,
                  background: T.surface,
                  boxShadow: `inset 0 0 0 1px ${T.line}`,
                }}
              >
                <Tiny muted style={{ letterSpacing: 0.4, textTransform: 'none' }}>
                  {services.length} {lang === 'es' ? 'servicios · ' : 'services · '}
                  {totalMin} min
                </Tiny>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginTop: 6,
                  }}
                >
                  <Body style={{ fontWeight: 500 }}>
                    {lang === 'es' ? 'Total estimado' : 'Estimated total'}
                  </Body>
                  <H3 style={{ color: T.gold, fontStyle: 'italic' }}>€{totalPrice}</H3>
                </div>
              </div>
            )}
          </>
        )}

        {/* STEP 1: Artisan */}
        {step === 1 && (
          <>
            <Numeral value="II" style={{ fontSize: 14 }} />
            <H1 style={{ fontSize: 32, marginTop: 6 }}>
              {lang === 'es' ? '¿Quién te atiende?' : 'Who will see you?'}
            </H1>
            <Body muted style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
              {lang === 'es'
                ? 'Cada artista trae su propia firma.'
                : 'Each artisan brings her own signature.'}
            </Body>

            <div style={{ marginTop: 26 }}>
              {/* "any" option */}
              <div
                onClick={() => setArtisan('any')}
                className="dsr-press"
                style={{
                  padding: '16px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: artisan === 'any' ? T.surfaceHi : T.surface,
                  boxShadow: `inset 0 0 0 1px ${artisan === 'any' ? T.gold : T.line}`,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 999,
                    background: T.bgAlt,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `inset 0 0 0 1px ${T.line}`,
                  }}
                >
                  <Ico size={20} color={T.gold} stroke={1.4}>
                    {Icons.sparkle}
                  </Ico>
                </div>
                <div style={{ flex: 1 }}>
                  <H3 style={{ fontSize: 16 }}>
                    {lang === 'es' ? 'Cualquier artista' : 'Any artisan'}
                  </H3>
                  <Tiny
                    muted
                    style={{
                      marginTop: 2,
                      fontSize: 11,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                    }}
                  >
                    {lang === 'es'
                      ? 'Te asignamos según disponibilidad'
                      : 'Best match based on availability'}
                  </Tiny>
                </div>
              </div>

              {eligibleArtisans.map((ar) => {
                const sel = artisan === ar.id;
                return (
                  <div
                    key={ar.id}
                    onClick={() => setArtisan(ar.id)}
                    className="dsr-press"
                    style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      background: sel ? T.surfaceHi : 'transparent',
                      boxShadow: sel
                        ? `inset 0 0 0 1px ${T.gold}`
                        : `inset 0 0 0 1px ${T.line}`,
                      marginBottom: 8,
                    }}
                  >
                    <Img
                      src={ar.photo}
                      style={{ width: 52, height: 52, borderRadius: 999, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <H3 style={{ fontSize: 16 }}>{ar.name}</H3>
                      <Tiny
                        muted
                        style={{
                          marginTop: 2,
                          fontSize: 11,
                          letterSpacing: 0.3,
                          textTransform: 'none',
                        }}
                      >
                        {lang === 'es' ? ar.specialty_es : ar.specialty_en}
                      </Tiny>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Tiny
                        style={{
                          color: T.gold,
                          letterSpacing: 0.4,
                          textTransform: 'none',
                          fontSize: 11,
                        }}
                      >
                        ★ {ar.rating}
                      </Tiny>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* STEP 2: Date & time */}
        {step === 2 && effectiveArtisan && (
          <>
            <Numeral value="III" style={{ fontSize: 14 }} />
            <H1 style={{ fontSize: 32, marginTop: 6 }}>
              {lang === 'es' ? 'Fecha y hora' : 'Date & time'}
            </H1>
            <Body muted style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
              {lang === 'es' ? 'Disponibilidad real de ' : 'Live availability of '}
              {effectiveArtisan.name.split(' ')[0]}
            </Body>

            {/* days */}
            <div
              className="dsr-scroll"
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 22,
                overflowX: 'auto',
                paddingBottom: 4,
              }}
            >
              {schedule.map((d, i) => {
                const sel = day === i;
                const free = d.slots.filter((s) => s.free).length;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setDay(i);
                      setTime(null);
                    }}
                    className="dsr-press"
                    style={{
                      flexShrink: 0,
                      width: 64,
                      padding: '12px 0',
                      borderRadius: 0,
                      border: 'none',
                      cursor: 'pointer',
                      background: sel ? T.gold : 'transparent',
                      color: sel ? T.bg : T.text,
                      boxShadow: sel ? 'none' : `inset 0 0 0 1px ${T.line}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Tiny
                      style={{
                        fontSize: 9,
                        letterSpacing: 1.4,
                        color: sel ? T.bg : T.textMuted,
                      }}
                    >
                      {i === 0
                        ? t('today')
                        : i === 1
                          ? t('tomorrow')
                          : d.day.toUpperCase()}
                    </Tiny>
                    <div
                      style={{
                        fontFamily: T.serif,
                        fontSize: 22,
                        fontStyle: 'italic',
                        fontWeight: 400,
                      }}
                    >
                      {d.dayNum}
                    </div>
                    <Tiny
                      style={{
                        fontSize: 9,
                        letterSpacing: 0.4,
                        textTransform: 'none',
                        color: sel
                          ? T.bg
                          : d.dayOff
                            ? T.textFaint
                            : T.gold,
                      }}
                    >
                      {d.dayOff ? '—' : `${free} ${lang === 'es' ? 'libres' : 'free'}`}
                    </Tiny>
                  </button>
                );
              })}
            </div>

            {/* slot grid */}
            <div style={{ marginTop: 28 }}>
              <Eyebrow>{lang === 'es' ? 'Horarios' : 'Time slots'}</Eyebrow>
              {schedule[day].dayOff ? (
                <div
                  style={{
                    marginTop: 20,
                    padding: 24,
                    textAlign: 'center',
                    background: T.surface,
                  }}
                >
                  <Body muted>{t('fullyBooked')}</Body>
                  <GhostBtn onClick={() => setWaitlist(true)} style={{ marginTop: 10, color: T.gold }}>
                    {t('waitlist')}
                  </GhostBtn>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 8,
                    marginTop: 14,
                  }}
                >
                  {schedule[day].slots.map((slot) => {
                    const sel = time === slot.time;
                    return (
                      <button
                        key={slot.time}
                        disabled={!slot.free}
                        onClick={() => setTime(slot.time)}
                        className="dsr-press"
                        style={{
                          height: 40,
                          border: 'none',
                          cursor: slot.free ? 'pointer' : 'not-allowed',
                          background: sel
                            ? T.gold
                            : slot.free
                              ? T.surface
                              : 'transparent',
                          color: sel
                            ? T.bg
                            : slot.free
                              ? T.text
                              : T.textFaint,
                          boxShadow: sel ? 'none' : `inset 0 0 0 1px ${T.line}`,
                          textDecoration: slot.free ? 'none' : 'line-through',
                          fontFamily: T.sans,
                          fontSize: 12,
                          fontWeight: 500,
                          letterSpacing: 0.4,
                        }}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Extras */}
            <div style={{ marginTop: 28 }}>
              <div
                onClick={() => setWithFriend(!withFriend)}
                className="dsr-press"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: `inset 0 0 0 1px ${T.line}`,
                  marginBottom: 8,
                }}
              >
                <Ico size={16} color={T.gold}>
                  {Icons.plus}
                </Ico>
                <Body style={{ flex: 1, fontSize: 13 }}>{t('inviteFriend')}</Body>
                <Tiny muted style={{ fontSize: 10 }}>
                  {withFriend ? '✓' : ''}
                </Tiny>
              </div>
              <div
                onClick={() => setWaitlist(!waitlist)}
                className="dsr-press"
                style={{
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: `inset 0 0 0 1px ${T.line}`,
                }}
              >
                <Ico size={16} color={T.gold}>
                  {Icons.bell}
                </Ico>
                <div style={{ flex: 1 }}>
                  <Body style={{ fontSize: 13 }}>{t('waitlist')}</Body>
                  <Tiny
                    muted
                    style={{
                      marginTop: 2,
                      fontSize: 10,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                    }}
                  >
                    {t('waitlistDesc')}
                  </Tiny>
                </div>
                <Tiny muted style={{ fontSize: 10 }}>
                  {waitlist ? '✓' : ''}
                </Tiny>
              </div>
            </div>
          </>
        )}

        {/* STEP 3: Review */}
        {step === 3 && effectiveArtisan && (
          <>
            <Numeral value="IV" style={{ fontSize: 14 }} />
            <H1 style={{ fontSize: 32, marginTop: 6 }}>
              {lang === 'es' ? 'Revisa tu cita' : 'Review your booking'}
            </H1>
            {isEditing && (
              <div
                style={{
                  marginTop: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  background: `${T.gold}1A`,
                  boxShadow: `inset 0 0 0 1px ${T.gold}55`,
                }}
              >
                <Ico size={10} color={T.gold}>
                  {Icons.edit}
                </Ico>
                <Tiny
                  style={{
                    color: T.gold,
                    letterSpacing: 0.4,
                    textTransform: 'none',
                    fontSize: 10,
                  }}
                >
                  {t('editingBooking')}
                </Tiny>
              </div>
            )}

            <div
              style={{
                marginTop: 28,
                padding: 22,
                background: T.surface,
                boxShadow: `inset 0 0 0 1px ${T.line}`,
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <Img
                  src={effectiveArtisan.photo}
                  style={{ width: 56, height: 56, borderRadius: 999 }}
                />
                <div>
                  <Tiny
                    style={{ color: T.gold, letterSpacing: 0.4, textTransform: 'none' }}
                  >
                    {lang === 'es' ? 'con' : 'with'}
                  </Tiny>
                  <H3 style={{ fontSize: 19, marginTop: 2 }}>{effectiveArtisan.name}</H3>
                </div>
              </div>
              <Divider style={{ margin: '20px 0' }} />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <Tiny muted style={{ letterSpacing: 0.4, textTransform: 'none' }}>
                  {lang === 'es' ? 'Cuándo' : 'When'}
                </Tiny>
                <Tiny
                  style={{
                    letterSpacing: 0.4,
                    textTransform: 'none',
                    textAlign: 'right',
                  }}
                >
                  {schedule[day].date.toLocaleDateString(
                    lang === 'es' ? 'es-ES' : 'en-US',
                    { weekday: 'long', day: 'numeric', month: 'long' },
                  )}
                  <br />
                  <span style={{ color: T.gold }}>{time}</span>
                </Tiny>
              </div>
              <Divider />
              <div style={{ marginTop: 14 }}>
                <Tiny
                  muted
                  style={{
                    letterSpacing: 0.4,
                    textTransform: 'none',
                    marginBottom: 10,
                  }}
                >
                  {lang === 'es' ? 'Servicios' : 'Services'}
                </Tiny>
                {chosenSvcs.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                    }}
                  >
                    <Body style={{ fontSize: 13 }}>{lang === 'es' ? s.es : s.en}</Body>
                    <Body style={{ fontSize: 13 }}>€{s.price}</Body>
                  </div>
                ))}
                {comboObj && comboStillValid && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      padding: '10px 0 4px',
                      marginTop: 6,
                      borderTop: `1px dashed ${T.line}`,
                    }}
                  >
                    <div>
                      <Tiny
                        style={{
                          color: T.gold,
                          letterSpacing: 1.4,
                          fontSize: 10,
                        }}
                      >
                        {t('comboApplied')}
                      </Tiny>
                      <Body style={{ fontSize: 12, marginTop: 2, color: T.text }}>
                        {lang === 'es' ? comboObj.name_es : comboObj.name_en} · −{discountPct}%
                      </Body>
                    </div>
                    <Body style={{ fontSize: 13, color: T.gold, fontStyle: 'italic' }}>
                      −€{discountAmount}
                    </Body>
                  </div>
                )}
              </div>
              <Divider style={{ margin: '14px 0' }} />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <Body style={{ fontWeight: 500 }}>Total</Body>
                <H3 style={{ color: T.gold, fontStyle: 'italic' }}>€{totalPrice}</H3>
              </div>
              <Tiny
                style={{
                  color: T.gold,
                  marginTop: 6,
                  letterSpacing: 0.4,
                  textTransform: 'none',
                  textAlign: 'right',
                }}
              >
                +{Math.round(totalPrice * 10)} {t('points')}
              </Tiny>
            </div>

            <div style={{ marginTop: 22 }}>
              <Eyebrow>{t('notes')}</Eyebrow>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                style={{
                  marginTop: 10,
                  width: '100%',
                  minHeight: 80,
                  padding: 14,
                  background: T.surface,
                  border: 'none',
                  boxShadow: `inset 0 0 0 1px ${T.line}`,
                  color: T.text,
                  fontFamily: T.sans,
                  fontSize: 13,
                  lineHeight: 1.5,
                  resize: 'none',
                  outline: 'none',
                }}
              />
            </div>

            <div
              style={{
                marginTop: 18,
                padding: 14,
                background: T.surface,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                boxShadow: `inset 0 0 0 1px ${T.line}`,
              }}
            >
              <Ico size={18} color={T.gold}>
                {Icons.cam}
              </Ico>
              <div style={{ flex: 1 }}>
                <Body style={{ fontSize: 13 }}>
                  {lang === 'es' ? 'Añadir foto del antes' : 'Add a "before" photo'}
                </Body>
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
                    ? 'Tu artista la verá antes de tu llegada'
                    : 'Your artisan will see it before you arrive'}
                </Tiny>
              </div>
            </div>
          </>
        )}

        {/* STEP 4: Confirmed */}
        {step === 4 && effectiveArtisan && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 999,
                margin: '0 auto',
                background: `radial-gradient(circle at 30% 30%, ${T.goldHi}, ${T.gold} 40%, ${T.goldDeep})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 60px ${T.gold}55`,
              }}
              className="dsr-fadein"
            >
              <Ico size={32} color="#0A0908" stroke={2}>
                {Icons.check}
              </Ico>
            </div>
            <H1 style={{ fontSize: 34, marginTop: 26 }}>
              {lang === 'es' ? 'Confirmado' : 'Confirmed'}
            </H1>
            <Body
              muted
              style={{ marginTop: 12, fontSize: 14, padding: '0 20px', lineHeight: 1.6 }}
            >
              {lang === 'es'
                ? `Te esperamos el ${schedule[day].date.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })} a las ${time}.`
                : `See you on ${schedule[day].date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })} at ${time}.`}
            </Body>

            <div style={{ marginTop: 32, padding: '0 12px' }}>
              <div
                style={{
                  background: T.surface,
                  padding: '20px 22px',
                  boxShadow: `inset 0 0 0 1px ${T.gold}33, 0 0 40px ${T.gold}15`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                    marginBottom: 18,
                  }}
                >
                  <Img
                    src={effectiveArtisan.photo}
                    style={{ width: 48, height: 48, borderRadius: 999 }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <Tiny style={{ color: T.gold, letterSpacing: 1.5 }}>
                      DSR ·{' '}
                      {schedule[day].date
                        .toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                        .toUpperCase()}
                    </Tiny>
                    <H3 style={{ fontSize: 17, marginTop: 2, fontFamily: T.serif }}>
                      {effectiveArtisan.name}
                    </H3>
                  </div>
                </div>
                {chosenSvcs.map((s) => (
                  <Tiny
                    key={s.id}
                    style={{
                      textAlign: 'left',
                      letterSpacing: 0.4,
                      textTransform: 'none',
                      fontSize: 12,
                      padding: '4px 0',
                      color: T.textMuted,
                    }}
                  >
                    · {lang === 'es' ? s.es : s.en}
                  </Tiny>
                ))}
                <div
                  style={{
                    marginTop: 14,
                    padding: '10px 0 0',
                    borderTop: `1px solid ${T.line}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <Tiny muted style={{ letterSpacing: 0.4, textTransform: 'none' }}>
                    {time} · {totalMin}min
                  </Tiny>
                  <Tiny
                    style={{
                      color: T.gold,
                      fontFamily: T.serif,
                      fontStyle: 'italic',
                      fontSize: 16,
                    }}
                  >
                    €{totalPrice}
                  </Tiny>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 30, padding: '0 22px' }}>
              <Btn onClick={() => go('home')}>
                {lang === 'es' ? 'Volver al inicio' : 'Back to home'}
              </Btn>
              <GhostBtn onClick={() => go('home')} style={{ marginTop: 18 }}>
                {lang === 'es' ? 'Añadir al calendario' : 'Add to calendar'}
              </GhostBtn>
            </div>
          </div>
        )}
      </div>

      </Screen>
      {/* Sticky next CTA — sibling del Screen, anclado al iPhone frame.
          Vivir fuera del scroll container es la única forma de que se quede
          fijo al viewport y no al final del contenido scrollable. */}
      {step !== 4 && (
        <div
          style={{
            position: 'absolute',
            bottom: TAB_BAR_HEIGHT,
            left: 0,
            right: 0,
            padding: '14px 22px 18px',
            background: `linear-gradient(180deg, transparent, ${T.bg} 30%)`,
            zIndex: 60,
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <Btn
              disabled={!canNext}
              onClick={() => {
                // Steps 0-2: avanzar sin tocar nada.
                if (step !== 3) {
                  setStep(step + 1);
                  return;
                }
                // Step 3 + edit mode: el primary actualiza el booking y vuelve al drawer.
                // (Sin destruir nada — finalizar es cosa del Apple Pay del drawer.)
                if (isEditing && editingSnapshot && effectiveArtisan && time !== null) {
                  cart.updateBooking(editingSnapshot.id, {
                    serviceIds: services,
                    artisanId: effectiveArtisan.id,
                    date: schedule[day].date.toISOString().slice(0, 10),
                    time,
                    total: totalPrice,
                    duration: totalMin,
                    notes: notes || undefined,
                    variant,
                    addonProductIds: addonProductIds.length > 0 ? addonProductIds : undefined,
                    comboId: comboStillValid ? comboId ?? undefined : undefined,
                    discountPct: comboStillValid && discountPct > 0 ? discountPct : undefined,
                  });
                  cart.openDrawer();
                  go('home');
                  return;
                }
                // Step 3 + non-edit: confirmar visual (step 4).
                setStep(step + 1);
              }}
            >
              {step === 3
                ? isEditing
                  ? t('updateInBag')
                  : t('confirm')
                : t('continue')}
              <Ico size={14} color={T.bg}>
                {Icons.arrow}
              </Ico>
            </Btn>
            {/* Ghost "Guardar en bolsa" sólo cuando NO estás editando.
                En edit mode el primary ya hace update — el ghost sería redundante. */}
            {step === 3 && !isEditing && effectiveArtisan && time !== null && (
              <GhostBtn
                onClick={() => {
                  cart.addBooking({
                    serviceIds: services,
                    artisanId: effectiveArtisan.id,
                    date: schedule[day].date.toISOString().slice(0, 10),
                    time,
                    total: totalPrice,
                    duration: totalMin,
                    notes: notes || undefined,
                    variant,
                    addonProductIds: addonProductIds.length > 0 ? addonProductIds : undefined,
                    comboId: comboStillValid ? comboId ?? undefined : undefined,
                    discountPct: comboStillValid && discountPct > 0 ? discountPct : undefined,
                  });
                  cart.openDrawer();
                  go('home');
                }}
                style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
              >
                {t('saveToBag')}
              </GhostBtn>
            )}
          </div>
        </div>
      )}
    </>
  );
}
