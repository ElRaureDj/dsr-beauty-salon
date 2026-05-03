// DSR Maison — App entry: theme + i18n + router + screens + iOS frame on desktop.
import * as React from 'react';
import { useEffect, useState } from 'react';
import { LangProvider, useI18n } from './i18n/LangProvider';
import { RouterProvider, useRouter } from './router/Router';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';
import { CartProvider } from './cart/CartProvider';
import { UserProvider, useUser } from './data/UserProvider';
import { CatalogProvider } from './data/CatalogProvider';
import { AppointmentsProvider } from './data/AppointmentsProvider';
import { FavoritesProvider } from './data/FavoritesProvider';
import { CartDrawer, Skeleton, TabBar, ToastProvider, TopChrome } from './components/atoms';
import type { RouteName, TabId } from './types';

// Síncronos: pantallas con probabilidad alta de hit en first paint —
// home (landing), services / shop / rewards (tabs default), profile (menú),
// detalles populares directos.
import { Home } from './screens/Home';
import { Services } from './screens/Services';
import { Shop } from './screens/Shop';
import { Rewards } from './screens/Rewards';
import { Profile } from './screens/Profile';
import { Bag } from './screens/Bag';
import { ServiceDetail } from './screens/ServiceDetail';
import { ProductDetail } from './screens/ProductDetail';
import { ArtisanProfile } from './screens/ArtisanProfile';

// Lazy: pantallas de flow secundario o admin. Cada una se carga al
// navegar por primera vez. Reduce el bundle inicial significativamente
// (admin sólo + 1MB; los flows largos como Booking/GiftBuy también pesan).
import { lazy, Suspense } from 'react';
const AdminApp = lazy(() => import('./admin/AdminApp').then((m) => ({ default: m.AdminApp })));
const Onboarding = lazy(() =>
  import('./screens/Onboarding').then((m) => ({ default: m.Onboarding })),
);
const Auth = lazy(() => import('./screens/Auth').then((m) => ({ default: m.Auth })));
const Booking = lazy(() => import('./screens/Booking').then((m) => ({ default: m.Booking })));
const CheckoutSuccess = lazy(() =>
  import('./screens/CheckoutSuccess').then((m) => ({ default: m.CheckoutSuccess })),
);
const NailAtelier = lazy(() =>
  import('./screens/NailAtelier').then((m) => ({ default: m.NailAtelier })),
);
const NailLookDetail = lazy(() =>
  import('./screens/NailLookDetail').then((m) => ({ default: m.NailLookDetail })),
);
const GiftCards = lazy(() => import('./screens/GiftCards').then((m) => ({ default: m.GiftCards })));
const GiftBuy = lazy(() => import('./screens/GiftBuy').then((m) => ({ default: m.GiftBuy })));
const GiftMine = lazy(() => import('./screens/GiftMine').then((m) => ({ default: m.GiftMine })));
const AppointmentDetail = lazy(() =>
  import('./screens/AppointmentDetail').then((m) => ({ default: m.AppointmentDetail })),
);
const PersonalInfo = lazy(() =>
  import('./screens/PersonalInfo').then((m) => ({ default: m.PersonalInfo })),
);
const Addresses = lazy(() =>
  import('./screens/Addresses').then((m) => ({ default: m.Addresses })),
);
const Legal = lazy(() => import('./screens/Legal').then((m) => ({ default: m.Legal })));
const Favorites = lazy(() =>
  import('./screens/Favorites').then((m) => ({ default: m.Favorites })),
);

import type { LegalDocId } from './data/legal';

// Configuración de chrome por route. Una sola tabla para evitar el footgun
// de tener que mantener dos listas separadas (HIDE_TAB_ROUTES + HIDE_CHROME_
// ROUTES). Para cada route inmersiva, declara qué piezas del chrome global
// debe ocultar. Las routes que no aparecen aquí muestran tabs + chrome (default).
//
// hideTabs: oculta el TabBar inferior (5 tabs).
// hideChrome: oculta el TopChrome (avatar + cart chip flotante).
//
// Las routes "tab root" (home, services, book, rewards, shop) NO aparecen
// porque usan el chrome completo. Si agregas una pantalla nueva inmersiva,
// agrégala aquí — si solo tocas una lista, la otra queda fuera de sync.
type RouteChrome = { hideTabs?: true; hideChrome?: true };
const ROUTE_CHROME: Partial<Record<RouteName, RouteChrome>> = {
  onboarding: { hideTabs: true, hideChrome: true },
  auth: { hideTabs: true, hideChrome: true },
  admin: { hideTabs: true, hideChrome: true },
  bag: { hideTabs: true, hideChrome: true },
  'checkout-success': { hideTabs: true, hideChrome: true },
  // Avatar+cart visibles pero sin tabs (immersive deep view).
  service: { hideTabs: true },
  artisan: { hideTabs: true },
  product: { hideTabs: true },
  'nail-look': { hideTabs: true },
  'gift-buy': { hideTabs: true },
  'gift-mine': { hideTabs: true },
  appointment: { hideTabs: true },
  'personal-info': { hideTabs: true },
  addresses: { hideTabs: true },
  legal: { hideTabs: true },
  favorites: { hideTabs: true },
  // profile: avatar duplicado si chrome activo. Tabs ocultas también.
  profile: { hideTabs: true, hideChrome: true },
};

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
            combo: params.combo,
            replacesAppointment: params.replacesAppointment,
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
    case 'appointment':
      return <AppointmentDetail id={params.id ?? ''} />;
    case 'personal-info':
      return <PersonalInfo />;
    case 'addresses':
      return <Addresses />;
    case 'legal':
      return <Legal doc={(params.doc as LegalDocId) ?? 'cancellation'} />;
    case 'favorites':
      return <Favorites />;
    default:
      // unreachable but keeps the compiler happy
      go('home');
      return null;
  }
}

function FrameInner({ onOnboardingDone }: { onOnboardingDone: () => void }) {
  const T = useTheme();
  const { route, tab, go } = useRouter();
  const chrome = ROUTE_CHROME[route.name] ?? {};
  const showTabs = !chrome.hideTabs;
  const showChrome = !chrome.hideChrome;
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
        <Suspense fallback={<ScreenLoading />}>
          <ScreenSwitch onOnboardingDone={handleOnboardingDone} />
        </Suspense>
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
      <ToastProvider>
        <LangProvider initialLang="es">
          <UserProvider>
            <CatalogProvider>
              <AppointmentsProvider>
                <FavoritesProvider>
                  <CartProvider>
                    <RouterProvider initial={{ name: seen ? 'home' : 'onboarding', params: {} }}>
                      <PrefsSync />
                      <RootLayout onOnboardingDone={() => setSeen(true)} />
                    </RouterProvider>
                  </CartProvider>
                </FavoritesProvider>
              </AppointmentsProvider>
            </CatalogProvider>
          </UserProvider>
        </LangProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

/**
 * Sincroniza theme y lang entre la preferencia del profile (DB) y los
 * providers locales. Lifecycle:
 * - Primera vez que llega `profile` con sesión: si profile.theme/lang
 *   difiere del estado local, aplicamos el del profile (la DB gana).
 * - Después del initial sync: si el user cambia theme/lang localmente,
 *   persistimos al profile.
 * - Sin sesión: no hace nada — los providers usan su localStorage como
 *   siempre.
 *
 * El ref `synced` distingue el primer fetch (DB → local) de los cambios
 * subsecuentes (local → DB), evitando un loop al hidratar.
 */
function PrefsSync() {
  const { profile, signedIn, updateProfile } = useUser();
  const { name: theme, setTheme } = useTheme();
  const { lang, setLang } = useI18n();
  const syncedRef = React.useRef(false);

  // Reset el flag cuando cambia la sesión (sign out → in con otro user).
  React.useEffect(() => {
    if (!signedIn) syncedRef.current = false;
  }, [signedIn]);

  // Initial sync: DB → local. Aplica una sola vez por sesión.
  React.useEffect(() => {
    if (!profile || syncedRef.current) return;
    if (profile.theme && profile.theme !== theme) setTheme(profile.theme);
    if (profile.preferred_lang && profile.preferred_lang !== lang) {
      setLang(profile.preferred_lang);
    }
    syncedRef.current = true;
    // Deliberadamente sin theme/lang en deps — sólo queremos correr
    // cuando profile cambia (al fetch inicial).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Cambios locales post-sync: local → DB.
  React.useEffect(() => {
    if (!syncedRef.current || !profile) return;
    const updates: { theme?: 'noir' | 'marbre'; preferred_lang?: 'es' | 'en' } = {};
    if (profile.theme !== theme) updates.theme = theme;
    if (profile.preferred_lang !== lang) updates.preferred_lang = lang;
    if (Object.keys(updates).length === 0) return;
    void updateProfile(updates).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[prefs-sync] persisting prefs failed:', err);
    });
  }, [theme, lang, profile, updateProfile]);

  return null;
}

/**
 * Decide entre layout customer (iPhone frame) y layout admin (desktop full-viewport)
 * según la ruta. Vive dentro de RouterProvider para poder leer la ruta.
 */
function RootLayout({ onOnboardingDone }: { onOnboardingDone: () => void }) {
  const { route } = useRouter();
  if (route.name === 'admin') {
    return (
      <Suspense fallback={<AdminLoading />}>
        <AdminApp />
      </Suspense>
    );
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


/** Fallback genérico mientras una screen lazy carga su chunk. Minimal:
 *  un Skeleton block que respeta la geometría iPhone-frame del wrapper. */
function ScreenLoading() {
  const T = useTheme();
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: T.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Skeleton variant="circle" size={40} />
    </div>
  );
}

/** Fallback para el AdminApp lazy. El admin es desktop full-viewport. */
function AdminLoading() {
  const T = useTheme();
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: T.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Skeleton variant="circle" size={48} />
    </div>
  );
}
