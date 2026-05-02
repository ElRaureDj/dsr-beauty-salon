// DSR Maison — App entry: theme + i18n + router + screens + iOS frame on desktop.
import { useEffect, useState } from 'react';
import { LangProvider } from './i18n/LangProvider';
import { RouterProvider, useRouter } from './router/Router';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';
import { CartProvider } from './cart/CartProvider';
import { UserProvider } from './data/UserProvider';
import { CatalogProvider } from './data/CatalogProvider';
import { CartDrawer, TabBar, TopChrome } from './components/atoms';
import type { TabId } from './types';

import { AdminApp } from './admin/AdminApp';
import { Auth } from './screens/Auth';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Services } from './screens/Services';
import { ServiceDetail } from './screens/ServiceDetail';
import { ArtisanProfile } from './screens/ArtisanProfile';
import { Booking } from './screens/Booking';
import { Rewards } from './screens/Rewards';
import { Shop } from './screens/Shop';
import { ProductDetail } from './screens/ProductDetail';
import { Bag } from './screens/Bag';
import { CheckoutSuccess } from './screens/CheckoutSuccess';
import { Profile } from './screens/Profile';
import { NailAtelier } from './screens/NailAtelier';
import { NailLookDetail } from './screens/NailLookDetail';
import { GiftCards } from './screens/GiftCards';
import { GiftBuy } from './screens/GiftBuy';
import { GiftMine } from './screens/GiftMine';

// Routes that should hide the bottom tab bar
const HIDE_TAB_ROUTES: ReadonlyArray<string> = [
  'onboarding',
  'auth',
  'admin',
  'service',
  'artisan',
  'product',
  'bag',
  'checkout-success',
  'nail-look',
  'gift-buy',
  'gift-mine',
  'profile',
];

// Pantallas donde no tiene sentido el chrome top (avatar/cart):
// onboarding y auth (no logueado), checkout-success (terminal con CTA propio),
// profile (ya estás ahí — evita doble avatar), bag (ya estás en el carrito).
const HIDE_CHROME_ROUTES: ReadonlyArray<string> = [
  'onboarding',
  'auth',
  'admin',
  'checkout-success',
  'profile',
  'bag',
];

function ScreenSwitch({ onOnboardingDone }: { onOnboardingDone: () => void }) {
  const { route, go } = useRouter();
  const { name, params } = route;

  switch (name) {
    case 'onboarding':
      return <Onboarding onDone={onOnboardingDone} />;
    case 'auth':
      return <Auth />;
    case 'home':
      return <Home />;
    case 'services':
      return <Services />;
    case 'service':
      return <ServiceDetail id={params.id ?? ''} />;
    case 'artisan':
      return <ArtisanProfile id={params.id ?? ''} />;
    case 'book':
      return (
        <Booking
          initial={{
            service: params.service,
            artisan: params.artisan,
            look: params.look,
            variant: params.variant,
            addonProductIds: params.addonProductIds,
          }}
          editingBookingId={params.editingBooking}
        />
      );
    case 'rewards':
      return <Rewards />;
    case 'shop':
      return <Shop />;
    case 'product':
      return <ProductDetail id={params.id ?? ''} />;
    case 'bag':
      return <Bag />;
    case 'checkout-success':
      return <CheckoutSuccess />;
    case 'profile':
      return <Profile />;
    case 'nail-atelier':
      return <NailAtelier />;
    case 'nail-look':
      return <NailLookDetail id={params.id ?? ''} />;
    case 'gift-cards':
      return <GiftCards />;
    case 'gift-buy':
      return <GiftBuy initial={{ design: params.design }} />;
    case 'gift-mine':
      return <GiftMine />;
    default:
      // unreachable but keeps the compiler happy
      go('home');
      return null;
  }
}

function FrameInner({ onOnboardingDone }: { onOnboardingDone: () => void }) {
  const T = useTheme();
  const { route, tab, go } = useRouter();
  const showTabs = !HIDE_TAB_ROUTES.includes(route.name);
  const showChrome = !HIDE_CHROME_ROUTES.includes(route.name);
  // El onboarding se considera terminado cuando además navegamos a 'home':
  // sin esto el estado `seen` cambia pero el router sigue en 'onboarding'.
  // Escribimos a localStorage directamente acá: si el usuario hizo "Ver bienvenida
  // de nuevo" desde Profile, el estado React `seen` sigue en true y el useEffect
  // de App no vuelve a correr — la escritura directa garantiza consistencia.
  const handleOnboardingDone = () => {
    try {
      window.localStorage.setItem('dsr-onboarding-seen', '1');
    } catch {
      /* ignore */
    }
    onOnboardingDone();
    go('home');
  };
  // El key fuerza remount en cada cambio de ruta para disparar la animación
  // de entrada. La TabBar queda fuera del wrapper para no reanimar al navegar
  // entre tabs (el TabBar es persistente).
  const transitionKey = `${route.name}:${JSON.stringify(route.params)}`;
  return (
    <>
      <div
        key={transitionKey}
        className="dsr-route-in"
        style={{ position: 'absolute', inset: 0 }}
      >
        <ScreenSwitch onOnboardingDone={handleOnboardingDone} />
      </div>
      {showChrome && <TopChrome />}
      <CartDrawer />
      {showTabs && (
        <TabBar
          tab={tab}
          setTab={(t: TabId) => {
            go(t);
          }}
        />
      )}
      {/* gold inset frame */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          boxShadow: `inset 0 0 0 0.5px ${T.lineStrong}`,
        }}
      />
    </>
  );
}

export default function App() {
  const [seen, setSeen] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('dsr-onboarding-seen') === '1';
    } catch {
      return false;
    }
  });

  // Persiste cuando el usuario termina el onboarding.
  // localStorage (no session) para que la decisión sobreviva al cierre de pestaña,
  // como en una app real. El reset se puede hacer desde Profile.
  useEffect(() => {
    if (!seen) return;
    try {
      window.localStorage.setItem('dsr-onboarding-seen', '1');
    } catch {
      /* ignore */
    }
  }, [seen]);

  return (
    <ThemeProvider>
      <LangProvider initialLang="es">
        <UserProvider>
          <CatalogProvider>
            <CartProvider>
              <RouterProvider initial={{ name: seen ? 'home' : 'onboarding', params: {} }}>
                <RootLayout onOnboardingDone={() => setSeen(true)} />
              </RouterProvider>
            </CartProvider>
          </CatalogProvider>
        </UserProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

/**
 * Decide entre layout customer (iPhone frame) y layout admin (desktop full-viewport)
 * según la ruta. Vive dentro de RouterProvider para poder leer la ruta.
 */
function RootLayout({ onOnboardingDone }: { onOnboardingDone: () => void }) {
  const { route } = useRouter();
  if (route.name === 'admin') {
    return <AdminApp />;
  }
  return (
    <DesktopFrame>
      <FrameInner onOnboardingDone={onOnboardingDone} />
    </DesktopFrame>
  );
}

/**
 * On wide viewports, present the app inside an iOS-style mobile frame.
 * On narrow viewports (real mobile), fill the screen.
 */
function DesktopFrame({ children }: { children: React.ReactNode }) {
  const T = useTheme();
  // The breakpoint matches the global.css media query.
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        @media (max-width: 479px) {
          .dsr-frame {
            width: 100% !important;
            height: 100vh !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
      <div
        className="dsr-frame"
        style={{
          width: 390,
          height: 844,
          maxHeight: '100vh',
          maxWidth: '100vw',
          background: T.bg,
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 44,
          boxShadow:
            '0 50px 100px rgba(0,0,0,0.6), 0 0 0 12px #1a1814, 0 0 0 14px #2a2520, 0 0 0 16px #0a0a0a',
        }}
      >
        {children}
      </div>
    </div>
  );
}
