// DSR — User context.
// Estado de auth conectado a Supabase + preferencias del cliente
// (avatar, admin unlock) que viven en localStorage.
//
// El sign-in real se hace con magic link de email. Los providers
// Apple/Google/WhatsApp todavía no están conectados (UI los muestra
// como "próximamente" hasta que llegue OAuth real en una fase futura).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  fetchMyProfile,
  updateMyProfile,
  type DbProfile,
  type ProfileUpdate,
} from '../lib/db';

const AVATAR_KEY = 'dsr-user-avatar-v1';
const ADMIN_UNLOCKED_KEY = 'dsr-admin-unlocked-v1';

/** PIN demo del modo administrador. En producción vendría de un rol/JWT. */
export const ADMIN_DEMO_PIN = '2486';

/** Provider que efectivamente autenticó al usuario (lo que reporta Supabase). */
export type AuthProvider =
  | 'apple'
  | 'google'
  | 'whatsapp'
  | 'email'
  | 'phone'
  | 'guest';

export type SignInResult = { ok: true } | { ok: false; error: string };

interface UserValue {
  /** URL del avatar elegido, o null si usa iniciales. Cuando hay sesión,
   * se mantiene en sync con profile.avatar_url. */
  avatar: string | null;
  setAvatar: (next: string | null) => void;
  /** True si hay sesión de Supabase activa. */
  signedIn: boolean;
  /** Sesión cruda de Supabase (null mientras carga / sin sesión). */
  session: Session | null;
  /** True solo durante el primer fetch de getSession al montar. */
  authLoading: boolean;
  /** Provider activo (de session.user.app_metadata.provider). */
  provider: AuthProvider | null;
  /** Profile del user autenticado (null si no hay sesión o aún no carga). */
  profile: DbProfile | null;
  /** Update parcial del profile del owner. Persiste en DB y refresca state. */
  updateProfile: (updates: ProfileUpdate) => Promise<DbProfile | null>;
  /**
   * Dispara un magic link al email indicado. La sesión se establece
   * cuando el usuario clickea el link y vuelve a la app.
   */
  signInWithEmail: (email: string) => Promise<SignInResult>;
  /** Cierra sesión en Supabase + limpia el unlock de admin. */
  signOut: () => Promise<void>;
  /** True cuando se desbloqueó el modo administrador con el PIN demo. */
  adminUnlocked: boolean;
  /** Intenta desbloquear el admin con un PIN. */
  unlockAdmin: (pin: string) => boolean;
  /** Cierra el modo admin (lo vuelve a pedir). */
  lockAdmin: () => void;
}

const UserCtx = createContext<UserValue>({
  avatar: null,
  setAvatar: () => {},
  signedIn: false,
  session: null,
  authLoading: true,
  provider: null,
  profile: null,
  updateProfile: async () => null,
  signInWithEmail: async () => ({ ok: false, error: 'No provider' }),
  signOut: async () => {},
  adminUnlocked: false,
  unlockAdmin: () => false,
  lockAdmin: () => {},
});

function loadAvatar(): string | null {
  try {
    return window.localStorage.getItem(AVATAR_KEY);
  } catch {
    return null;
  }
}

function loadAdminUnlocked(): boolean {
  try {
    return window.localStorage.getItem(ADMIN_UNLOCKED_KEY) === '1';
  } catch {
    return false;
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [avatar, setAvatarState] = useState<string | null>(loadAvatar);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(loadAdminUnlocked);

  // Carga inicial + listener de cambios de sesión.
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Cuando cambia la sesión: refetch del profile (o limpiar si signed out).
  // El trigger on_auth_user_created creó la row en signup; aquí solo leemos.
  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    fetchMyProfile()
      .then((p) => {
        if (cancelled) return;
        setProfile(p);
        // Si el profile trae avatar_url y no tenemos uno local, hidratarlo.
        if (p?.avatar_url && !avatar) setAvatarState(p.avatar_url);
      })
      .catch(() => {
        // Silent fail — el customer sigue como invitado.
      });
    return () => {
      cancelled = true;
    };
    // avatar deliberadamente omitido del deps — solo hidratamos al primer fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  useEffect(() => {
    try {
      if (avatar) window.localStorage.setItem(AVATAR_KEY, avatar);
      else window.localStorage.removeItem(AVATAR_KEY);
    } catch {
      /* ignore */
    }
  }, [avatar]);

  useEffect(() => {
    try {
      if (adminUnlocked) window.localStorage.setItem(ADMIN_UNLOCKED_KEY, '1');
      else window.localStorage.removeItem(ADMIN_UNLOCKED_KEY);
    } catch {
      /* ignore */
    }
  }, [adminUnlocked]);

  const setAvatar = useCallback(
    (next: string | null) => {
      setAvatarState(next);
      // Si hay sesión, persistir el cambio en el profile (fire-and-forget).
      if (session?.user) {
        void updateMyProfile(session.user.id, { avatar_url: next })
          .then((p) => {
            if (p) setProfile(p);
          })
          .catch(() => {
            // Persistencia local ya ocurrió — DB se sincronizará en el próximo fetch.
          });
      }
    },
    [session],
  );

  const updateProfile = useCallback(
    async (updates: ProfileUpdate): Promise<DbProfile | null> => {
      if (!session?.user) return null;
      const updated = await updateMyProfile(session.user.id, updates);
      if (updated) setProfile(updated);
      return updated;
    },
    [session],
  );

  const signInWithEmail = useCallback(
    async (email: string): Promise<SignInResult> => {
      const trimmed = email.trim();
      if (!trimmed) return { ok: false, error: 'Email vacío' };
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          // Vuelve a la URL de la app actual tras click en el magic link.
          // En dev: http://localhost:<port>/. En prod: el dominio de Vercel.
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // Sign out también cierra el modo admin: la siguiente sesión vuelve a pedirlo.
    setAdminUnlocked(false);
  }, []);

  const unlockAdmin = useCallback((pin: string): boolean => {
    if (pin.trim() === ADMIN_DEMO_PIN) {
      setAdminUnlocked(true);
      return true;
    }
    return false;
  }, []);

  const lockAdmin = useCallback(() => setAdminUnlocked(false), []);

  const provider = useMemo<AuthProvider | null>(() => {
    const p = session?.user?.app_metadata?.provider;
    return typeof p === 'string' ? (p as AuthProvider) : null;
  }, [session]);

  const value = useMemo<UserValue>(
    () => ({
      avatar,
      setAvatar,
      signedIn: session !== null,
      session,
      authLoading,
      provider,
      profile,
      updateProfile,
      signInWithEmail,
      signOut,
      adminUnlocked,
      unlockAdmin,
      lockAdmin,
    }),
    [
      avatar,
      setAvatar,
      session,
      authLoading,
      provider,
      profile,
      updateProfile,
      signInWithEmail,
      signOut,
      adminUnlocked,
      unlockAdmin,
      lockAdmin,
    ],
  );

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
}

export const useUser = () => useContext(UserCtx);
