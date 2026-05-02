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
}

const UserCtx = createContext<UserValue>({
  avatar: null,
  setAvatar: () => {},
  signedIn: true,
  provider: null,
  signIn: () => {},
  signOut: () => {},
});

function loadAvatar(): string | null {
  try {
    return window.localStorage.getItem(AVATAR_KEY);
  } catch {
    return null;
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

  const setAvatar = useCallback((next: string | null) => {
    setAvatarState(next);
  }, []);

  const signIn = useCallback((provider: AuthProvider) => {
    setAuth({ signedIn: true, provider });
  }, []);

  const signOut = useCallback(() => {
    setAuth({ signedIn: false, provider: null });
  }, []);

  const value = useMemo<UserValue>(
    () => ({
      avatar,
      setAvatar,
      signedIn: auth.signedIn,
      provider: auth.provider,
      signIn,
      signOut,
    }),
    [avatar, setAvatar, auth.signedIn, auth.provider, signIn, signOut],
  );

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
}

export const useUser = () => useContext(UserCtx);
