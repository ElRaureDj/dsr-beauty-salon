// DSR — Avatar picker (bottom sheet).
// Selector de avatar para el perfil. Trae la galería editorial generada
// + opción de iniciales + placeholder de upload (sin backend real).
// Controlado externamente via prop (open/onClose) — vive en Profile, no en context.

import { useEffect } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { useUser } from '../../data/UserProvider';
import { AVATAR_OPTIONS } from '../../data/avatars';
import { USER } from '../../data/user';
import { Body, Eyebrow, H2, Tiny } from './Typography';
import { Ico, Icons } from './Icon';
import { Img } from './Layout';

const ANIMATION_MS = 320;

interface AvatarPickerProps {
  open: boolean;
  onClose: () => void;
}

export function AvatarPicker({ open, onClose }: AvatarPickerProps) {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { avatar, setAvatar } = useUser();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const choose = (src: string | null) => {
    setAvatar(src);
    // Pequeño delay antes de cerrar para feedback visual.
    setTimeout(onClose, 180);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 90,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: `opacity ${ANIMATION_MS}ms ease`,
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-label={t('chooseAvatar')}
        aria-modal="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '88%',
          background: T.bg,
          boxShadow: `0 -20px 60px rgba(0,0,0,0.5), inset 0 1px 0 ${T.line}`,
          zIndex: 91,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: `transform ${ANIMATION_MS}ms cubic-bezier(0.2, 0.7, 0.3, 1)`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingTop: 10,
            paddingBottom: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 38,
              height: 4,
              borderRadius: 2,
              background: T.lineStrong,
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '6px 22px 14px',
            flexShrink: 0,
          }}
        >
          <div>
            <Eyebrow>{t('chooseAvatar')}</Eyebrow>
            <H2 style={{ fontSize: 22, fontStyle: 'italic', marginTop: 2 }}>
              {lang === 'es' ? 'Tu retrato' : 'Your portrait'}
            </H2>
            <Tiny
              muted
              style={{
                marginTop: 4,
                letterSpacing: 0.4,
                textTransform: 'none',
                fontSize: 11,
              }}
            >
              {t('chooseAvatarSub')}
            </Tiny>
          </div>
          <button
            onClick={onClose}
            aria-label={lang === 'es' ? 'Cerrar' : 'Close'}
            className="dsr-press"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              border: 'none',
              background: T.surface,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              flexShrink: 0,
            }}
          >
            <Ico size={14} color={T.text}>
              {Icons.close}
            </Ico>
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="dsr-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 22px 24px',
            minHeight: 0,
          }}
        >
          {/* Special options row: Iniciales + Upload */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 18,
            }}
          >
            <SpecialTile
              selected={avatar === null}
              onClick={() => choose(null)}
              T={T}
              ariaLabel={t('avatarInitials')}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: T.serif,
                  fontSize: 26,
                  fontStyle: 'italic',
                  color: T.bg,
                  fontWeight: 400,
                }}
              >
                {USER.name[0]}
              </div>
              <Tiny
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  letterSpacing: 1.2,
                }}
              >
                {t('avatarInitials')}
              </Tiny>
            </SpecialTile>

            <SpecialTile
              selected={false}
              disabled
              onClick={() => {}}
              T={T}
              ariaLabel={t('avatarUpload')}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  background: T.surface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `inset 0 0 0 1px ${T.line}`,
                }}
              >
                <Ico size={20} color={T.textFaint} stroke={1.4}>
                  {Icons.cam}
                </Ico>
              </div>
              <Tiny
                muted
                style={{
                  marginTop: 8,
                  fontSize: 10,
                  letterSpacing: 1.2,
                }}
              >
                {t('avatarUpload')}
              </Tiny>
              <Tiny
                style={{
                  marginTop: 2,
                  color: T.textFaint,
                  fontSize: 9,
                  letterSpacing: 0.4,
                  textTransform: 'none',
                }}
              >
                {t('avatarUploadSoon')}
              </Tiny>
            </SpecialTile>
          </div>

          <Eyebrow style={{ marginBottom: 12 }}>
            {lang === 'es' ? 'Galería editorial' : 'Editorial gallery'}
          </Eyebrow>

          {/* Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 10,
            }}
          >
            {AVATAR_OPTIONS.map((opt) => {
              const selected = avatar === opt.src;
              return (
                <button
                  key={opt.id}
                  onClick={() => choose(opt.src)}
                  className="dsr-press"
                  aria-label={opt.label[lang]}
                  aria-pressed={selected}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 999,
                      overflow: 'hidden',
                      boxShadow: selected
                        ? `0 0 0 2px ${T.gold}, 0 0 0 4px ${T.bg}`
                        : `inset 0 0 0 1px ${T.line}`,
                      transition: 'box-shadow .15s',
                    }}
                  >
                    <Img src={opt.src} style={{ width: '100%', height: '100%' }} />
                  </div>
                  <Tiny
                    style={{
                      marginTop: 6,
                      fontSize: 9,
                      letterSpacing: 0.6,
                      textTransform: 'none',
                      color: selected ? T.gold : T.textMuted,
                      fontStyle: 'italic',
                      fontFamily: T.serif,
                    }}
                  >
                    {opt.label[lang]}
                  </Tiny>
                </button>
              );
            })}
          </div>

          <Body
            muted
            style={{
              marginTop: 22,
              fontSize: 11,
              lineHeight: 1.5,
              textAlign: 'center',
            }}
          >
            {lang === 'es'
              ? 'Avatares generados con IA · Édition Printemps 2026'
              : 'AI-generated avatars · Édition Printemps 2026'}
          </Body>
        </div>
      </div>
    </>
  );
}

function SpecialTile({
  children,
  selected,
  onClick,
  disabled,
  T,
  ariaLabel,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  T: ReturnType<typeof useTheme>;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-label={ariaLabel}
      aria-pressed={selected}
      disabled={disabled}
      className={disabled ? '' : 'dsr-press'}
      style={{
        background: T.surface,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '14px 10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: selected
          ? `inset 0 0 0 1.5px ${T.gold}`
          : `inset 0 0 0 1px ${T.line}`,
        opacity: disabled ? 0.55 : 1,
        transition: 'box-shadow .15s',
      }}
    >
      {children}
    </button>
  );
}
