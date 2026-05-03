// DSR — useUserData hook.
// Devuelve el "effective user" para customer screens: profile real desde
// Supabase cuando hay sesión, USER mock como fallback cuando no.
//
// El mock mantiene la experiencia demo intacta para visitantes no
// autenticados (Camila Vargas con sus 2840 points). Cuando un user real
// se autentica, sus campos del profile reemplazan al mock.

import { useUser } from './UserProvider';
import { USER } from './user';

export interface EffectiveUser {
  /** Nombre corto para el header ("Camila"). */
  name: string;
  /** Nombre completo para tarjetas/firmas ("Camila Vargas"). */
  fullName: string;
  email: string;
  /** YYYY-MM-DD. */
  joined: string;
  points: number;
  visits: number;
  spent: number;
  preferredArtisans: string[];
}

export function useUserData(): EffectiveUser {
  const { profile } = useUser();
  if (!profile) {
    return {
      name: USER.name,
      fullName: USER.fullName,
      email: USER.email,
      joined: USER.joined,
      points: USER.points,
      visits: USER.visits,
      spent: USER.spent,
      preferredArtisans: USER.preferredArtisans,
    };
  }
  const displayName =
    profile.display_name ?? profile.email?.split('@')[0] ?? USER.name;
  return {
    name: displayName,
    fullName: profile.full_name ?? displayName,
    email: profile.email ?? USER.email,
    joined: profile.joined,
    points: profile.points,
    visits: profile.visits,
    spent: Number(profile.spent),
    preferredArtisans: profile.preferred_artisans,
  };
}
