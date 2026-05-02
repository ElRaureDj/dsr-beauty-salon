// DSR — User context.
// Avatar (URL o null = iniciales) + estado de auth mock (signedIn + provider).
// Es 100% mock: no hay backend, sólo persistencia en localStorage del state.
// Para auth real haría falta un backend (Supabase / Firebase / propio).

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const AVATAR_KEY = 'dsr-user-avatar-v1';
const AUTH_KEY = 'dsr-user-auth-v1';
const ADMIN_UNLOCKED_KEY = 'dsr-admin-unlocked-v1';

/** PIN demo del modo administrador. En producción vendría de un rol/JWT. */
export const ADMIN_DEMO_PIN = '2486';

export type AuthProvider =
  | 'apple'
  | 'google'
  | 'whatsapp'
  | 'email'
  | 'phone'
  | 'guest';

interface AuthState {
  signedIn: boolean;
  provider: AuthProvider | null;
}

interface UserValue {
  /** URL del avatar elegido, o null si usa iniciales. */
  avatar: string | null;
  setAvatar: (next: string | null) => void;
  /** True si el usuario completó el flow de auth (mock). */
  signedIn: boolean;
  /** Provider con el que se autenticó la última vez. */
  provider: AuthProvider | null;
  /** Marca al usuario como autenticado. Mock: solo flips state + persiste. */
  signIn: (provider: AuthProvider) => void;
  /** Cierra sesión. Limpia provider; el avatar se mantiene como preferencia. */
  signOut: () => void;
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
  signedIn: true,
  provider: null,
  signIn: () => {},
  signOut: () => {},
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

// Default: signedIn=true. Esto preserva el demo experience existente.
// El usuario solo ve la pantalla de auth si hace explícitamente sign-out.
function loadAuth(): AuthState {
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return { signedIn: true, provider: null };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        signedIn: parsed.signedIn !== false,
        provider: typeof parsed.provider === 'string' ? parsed.provider : null,
      };
    }
  } catch {
    /* ignore */
  }
  return { signedIn: true, provider: null };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [avatar, setAvatarState] = useState<string | null>(loadAvatar);
  const [auth, setAuth] = useState<AuthState>(loadAuth);
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(loadAdminUnlocked);

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
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    } catch {
      /* ignore */
    }
  }, [auth]);

  useEffect(() => {
    try {
      if (adminUnlocked) window.localStorage.setItem(ADMIN_UNLOCKED_KEY, '1');
      else window.localStorage.removeItem(ADMIN_UNLOCKED_KEY);
    } catch {
      /* ignore */
    }
  }, [adminUnlocked]);

  const setAvatar = useCallback((next: string | null) => {
    setAvatarState(next);
  }, []);

  const signIn = useCallback((provider: AuthProvider) => {
    setAuth({ signedIn: true, provider });
  }, []);

  const signOut = useCallback(() => {
    setAuth({ signedIn: false, provider: null });
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

  const value = useMemo<UserValue>(
    () => ({
      avatar,
      setAvatar,
      signedIn: auth.signedIn,
      provider: auth.provider,
      signIn,
      signOut,
      adminUnlocked,
      unlockAdmin,
      lockAdmin,
    }),
    [
      avatar,
      setAvatar,
      auth.signedIn,
      auth.provider,
      signIn,
      signOut,
      adminUnlocked,
      unlockAdmin,
      lockAdmin,
    ],
  );

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
}

export const useUser = () => useContext(UserCtx);
