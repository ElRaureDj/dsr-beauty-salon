// DSR Maison — App entry: theme + i18n + router + screens + iOS frame on desktop.
import { useEffect, useState } from 'react';
import { LangProvider } from './i18n/LangProvider';
import { RouterProvider, useRouter } from './router/Router';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';
import { TabBar } from './components/atoms';
import type { TabId } from './types';

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
import { Profile } from './screens/Profile';
import { NailAtelier } from './screens/NailAtelier';
import { NailLookDetail } from './screens/NailLookDetail';
import { GiftCards } from './screens/GiftCards';
import { GiftBuy } from './screens/GiftBuy';
import { GiftMine } from './screens/GiftMine';

// Routes that should hide the bottom tab bar
const HIDE_TAB_ROUTES: ReadonlyArray<string> = [
  'onboarding',
  'service',
  'artisan',
  'product',
  'bag',
  'nail-look',
  'gift-buy',
  'gift-mine',
  'profile',
];

function ScreenSwitch({ onOnboardingDone }: { onOnboardingDone: () => void }) {
  const { route, go } = useRouter();
  const { name, params } = route;

  switch (name) {
    case 'onboarding':
      return <Onboarding onDone={onOnboardingDone} />;
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
          }}
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
  return (
    <>
      <ScreenSwitch onOnboardingDone={onOnboardingDone} />
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
      return window.sessionStorage.getItem('dsr-onboarding-seen') === '1';
    } catch {
      return false;
    }
  });

  // Persist once the user finishes onboarding
  useEffect(() => {
    if (!seen) return;
    try {
      window.sessionStorage.setItem('dsr-onboarding-seen', '1');
    } catch {
      /* ignore */
    }
  }, [seen]);

  return (
    <ThemeProvider>
      <LangProvider initialLang="es">
        <RouterProvider initial={{ name: seen ? 'home' : 'onboarding', params: {} }}>
          <DesktopFrame>
            <FrameInner onOnboardingDone={() => setSeen(true)} />
          </DesktopFrame>
        </RouterProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

/**
 * On wide viewports, present the app inside an iOS-style mobile frame.
 * On narrow viewports (real mobile), fill the screen.
 */
function DesktopFrame({ children }: { children: React.ReactNode }) {
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
          background: '#0A0908',
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
