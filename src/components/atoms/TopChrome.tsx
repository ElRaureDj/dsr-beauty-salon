// DSR — Top chrome persistente: avatar chip + cart chip + mini-menú.
// Vive a nivel de iPhone frame (sibling de ScreenSwitch en App.tsx).
// Visible en todas las pantallas excepto onboarding y checkout-success.

import { useEffect, useState, type ReactNode } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { useCart } from '../../cart/CartProvider';
import { useRouter } from '../../router/Router';
import { USER } from '../../data/user';
import { useUser } from '../../data/UserProvider';
import { Ico, Icons } from './Icon';
import { Img } from './Layout';

const CHIP_SIZE = 38;

interface MenuItem {
  label: { es: string; en: string };
  icon?: ReactNode;
  onClick: () => void;
  divider?: boolean;
}

export function TopChrome() {
  const T = useTheme();
  const { lang } = useI18n();
  const cart = useCart();
  const { go } = useRouter();
  const { avatar } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  // Si la imagen del avatar falla (pollinations rate-limited, offline, etc.),
  // caemos a las iniciales en lugar de dejar el placeholder gris.
  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => {
    setAvatarFailed(false);
  }, [avatar]);
  const showAvatarImg = !!avatar && !avatarFailed;

  // Cerrar menú con Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeAndGo = (route: Parameters<typeof go>[0], params?: Parameters<typeof go>[1]) => {
    setMenuOpen(false);
    go(route, params);
  };

  const items: MenuItem[] = [
    {
      label: { es: 'Mi próxima cita', en: 'Next appointment' },
      icon: Icons.cal,
      onClick: () => closeAndGo('profile'),
    },
    {
      label: { es: 'Mi bolsa', en: 'My bag' },
      icon: Icons.bag,
      onClick: () => closeAndGo('bag'),
    },
    {
      label: { es: 'Mis recompensas', en: 'My rewards' },
      icon: Icons.diamond,
      onClick: () => closeAndGo('rewards'),
    },
    {
      label: { es: 'Mis gift cards', en: 'My gift cards' },
      icon: Icons.mail,
      onClick: () => closeAndGo('gift-mine'),
    },
    {
      label: { es: 'Configuración', en: 'Settings' },
      icon: Icons.user,
      onClick: () => closeAndGo('profile'),
      divider: true,
    },
  ];

  const showCartChip = cart.count > 0;
  const cartLabel = cart.count > 9 ? '9+' : String(cart.count);

  return (
    <>
      {/* Backdrop para cerrar menú al click afuera */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 70,
            background: `rgba(${T.bgRgb}, 0.4)`,
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            cursor: 'pointer',
          }}
        />
      )}

      {/* Chrome chips: top-right, encima del HeaderBar */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 80,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        {showCartChip && (
          <button
            onClick={cart.toggleDrawer}
            aria-label={lang === 'es' ? 'Ver bolsa' : 'View bag'}
            className="dsr-press"
            style={{
              width: CHIP_SIZE,
              height: CHIP_SIZE,
              borderRadius: 999,
              border: 'none',
              background: T.surface,
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `inset 0 0 0 1px ${T.line}, 0 4px 12px rgba(0,0,0,0.2)`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <Ico size={16} color={T.text}>
              {Icons.bag}
            </Ico>
            <span
              className="dsr-fadein"
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                borderRadius: 999,
                background: T.gold,
                color: T.bg,
                fontFamily: T.sans,
                fontSize: 9,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 0 1.5px ${T.bg}`,
              }}
            >
              {cartLabel}
            </span>
          </button>
        )}

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={lang === 'es' ? 'Menú de perfil' : 'Profile menu'}
          aria-expanded={menuOpen}
          className="dsr-press"
          style={{
            width: CHIP_SIZE,
            height: CHIP_SIZE,
            borderRadius: 999,
            border: 'none',
            padding: 0,
            background: showAvatarImg
              ? T.surface
              : `linear-gradient(135deg, ${T.gold}, ${T.goldDeep})`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: T.serif,
            fontSize: 18,
            fontStyle: 'italic',
            color: T.bg,
            fontWeight: 400,
            overflow: 'hidden',
            boxShadow: menuOpen
              ? `inset 0 0 0 2px ${T.goldHi}, 0 4px 12px rgba(0,0,0,0.2)`
              : `inset 0 0 0 1px ${T.line}, 0 4px 12px rgba(0,0,0,0.2)`,
            transition: 'box-shadow .2s',
          }}
        >
          {showAvatarImg ? (
            <Img
              src={avatar!}
              style={{ width: '100%', height: '100%' }}
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            USER.name[0]
          )}
        </button>
      </div>

      {/* Mini-menú */}
      {menuOpen && (
        <div
          className="dsr-fadein"
          role="menu"
          style={{
            position: 'absolute',
            top: 14 + CHIP_SIZE + 8,
            right: 14,
            width: 240,
            zIndex: 81,
            background: T.surface,
            boxShadow: `0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 1px ${T.line}`,
            padding: '6px 0',
          }}
        >
          {/* Greeting header */}
          <div
            style={{
              padding: '12px 16px 10px',
              borderBottom: `1px solid ${T.line}`,
            }}
          >
            <div
              style={{
                fontFamily: T.sans,
                fontSize: 9,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                color: T.textMuted,
              }}
            >
              {lang === 'es' ? 'Hola' : 'Hello'}
            </div>
            <div
              style={{
                fontFamily: T.serif,
                fontStyle: 'italic',
                fontSize: 18,
                marginTop: 2,
                color: T.text,
              }}
            >
              {USER.fullName}
            </div>
          </div>
          {items.map((it, i) => (
            <button
              key={i}
              onClick={it.onClick}
              role="menuitem"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                color: T.text,
                fontFamily: T.sans,
                fontSize: 13,
                textAlign: 'left',
                borderTop: it.divider ? `1px solid ${T.line}` : 'none',
              }}
              className="dsr-press"
            >
              {it.icon && (
                <Ico size={14} color={T.gold}>
                  {it.icon}
                </Ico>
              )}
              <span style={{ flex: 1 }}>{it.label[lang]}</span>
              <Ico size={11} color={T.textFaint}>
                {Icons.chev}
              </Ico>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
