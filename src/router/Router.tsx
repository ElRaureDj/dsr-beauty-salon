// DSR — In-app router (state-based, no URL routing).
// Routes live in component state; the back stack is managed centrally.
//
// Tabs share a "tab root" so toggling tabs preserves their last sub-route.
// Non-tab routes (onboarding, service detail, etc.) are pushed on top.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Route, RouteName, RouteParams, TabId } from '../types';

const TAB_IDS: TabId[] = ['home', 'services', 'book', 'rewards', 'shop'];
const isTab = (n: RouteName): n is TabId =>
  (TAB_IDS as RouteName[]).includes(n);

interface RouterValue {
  route: Route;
  tab: TabId;
  go: (name: RouteName, params?: RouteParams) => void;
}

const RouterCtx = createContext<RouterValue>({
  route: { name: 'onboarding', params: {} },
  tab: 'home',
  go: () => {},
});

export function RouterProvider({
  initial = { name: 'onboarding', params: {} },
  children,
}: {
  initial?: Route;
  children: ReactNode;
}) {
  const [route, setRoute] = useState<Route>(initial);
  const [tab, setTab] = useState<TabId>('home');

  const go = useCallback((name: RouteName, params: RouteParams = {}) => {
    if (isTab(name)) setTab(name);
    setRoute({ name, params });
    // Best-effort scroll-to-top after the new screen mounts
    queueMicrotask(() => {
      const sc = document.querySelector<HTMLDivElement>('.dsr-scroll');
      if (sc) sc.scrollTop = 0;
    });
  }, []);

  const value = useMemo<RouterValue>(() => ({ route, tab, go }), [route, tab, go]);
  return <RouterCtx.Provider value={value}>{children}</RouterCtx.Provider>;
}

export const useRouter = () => useContext(RouterCtx);
