// DSR — Favoritos del cliente.
// Session-aware:
// - Sin sesión: localStorage como fallback (persisten entre reloads del guest).
// - Con sesión: tabla `favorites` en Supabase via TanStack Query.
//
// API mínima: isFavorite(kind, id) y toggle(kind, id). El UI solo
// necesita saber si está favoriteado (corazón sólido vs outline) y
// disparar el toggle.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addFavorite,
  fetchMyFavorites,
  removeFavorite,
  type Favorite,
  type FavoriteKind,
} from '../lib/db';
import { useUser } from './UserProvider';

const GUEST_KEY = 'dsr-favorites-guest-v1';

interface FavoritesValue {
  favorites: Favorite[];
  isFavorite: (kind: FavoriteKind, targetId: string) => boolean;
  toggle: (kind: FavoriteKind, targetId: string) => void;
  /** Filtra por kind para listas (ej: products favoritados). */
  byKind: (kind: FavoriteKind) => string[];
}

const FavoritesCtx = createContext<FavoritesValue>({
  favorites: [],
  isFavorite: () => false,
  toggle: () => {},
  byKind: () => [],
});

function loadGuest(): Favorite[] {
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is Favorite =>
        x &&
        typeof x === 'object' &&
        ['product', 'service', 'artisan'].includes((x as Favorite).kind) &&
        typeof (x as Favorite).targetId === 'string',
    );
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { session } = useUser();
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();

  const [guestFavs, setGuestFavs] = useState<Favorite[]>(loadGuest);

  useEffect(() => {
    if (userId) return;
    setGuestFavs(loadGuest());
  }, [userId]);

  useEffect(() => {
    if (userId) return;
    try {
      window.localStorage.setItem(GUEST_KEY, JSON.stringify(guestFavs));
    } catch {
      /* ignore */
    }
  }, [guestFavs, userId]);

  const { data: dbFavs = [] } = useQuery({
    queryKey: ['my-favorites', userId],
    queryFn: fetchMyFavorites,
    enabled: !!userId,
    staleTime: 60_000,
  });

  const favorites = userId ? dbFavs : guestFavs;

  const isFavorite = useCallback(
    (kind: FavoriteKind, targetId: string) =>
      favorites.some((f) => f.kind === kind && f.targetId === targetId),
    [favorites],
  );

  const byKind = useCallback(
    (kind: FavoriteKind) =>
      favorites.filter((f) => f.kind === kind).map((f) => f.targetId),
    [favorites],
  );

  const toggle = useCallback(
    (kind: FavoriteKind, targetId: string) => {
      const exists = favorites.some(
        (f) => f.kind === kind && f.targetId === targetId,
      );
      if (userId) {
        // Optimistic local + dispatch async.
        queryClient.setQueryData<Favorite[]>(
          ['my-favorites', userId],
          (prev) =>
            exists
              ? (prev ?? []).filter(
                  (f) => !(f.kind === kind && f.targetId === targetId),
                )
              : [...(prev ?? []), { kind, targetId }],
        );
        const op = exists
          ? removeFavorite(userId, kind, targetId)
          : addFavorite(userId, kind, targetId);
        void op
          .then(() =>
            queryClient.invalidateQueries({
              queryKey: ['my-favorites', userId],
            }),
          )
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error('[favorites] toggle failed:', err);
            void queryClient.invalidateQueries({
              queryKey: ['my-favorites', userId],
            });
          });
        return;
      }
      // Guest: solo state local.
      setGuestFavs((prev) =>
        exists
          ? prev.filter((f) => !(f.kind === kind && f.targetId === targetId))
          : [...prev, { kind, targetId }],
      );
    },
    [favorites, userId, queryClient],
  );

  const value = useMemo<FavoritesValue>(
    () => ({ favorites, isFavorite, toggle, byKind }),
    [favorites, isFavorite, toggle, byKind],
  );

  return (
    <FavoritesCtx.Provider value={value}>{children}</FavoritesCtx.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesCtx);
