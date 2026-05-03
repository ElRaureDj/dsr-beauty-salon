// DSR — Appointments context.
// Session-aware:
// - Sin sesión (modo guest/demo): seed con USER.appointments mock + persist
//   local en `dsr-appointments-guest-v1`. Esto preserva la experiencia
//   demo de Camila Vargas con sus 3 citas.
// - Con sesión: arranca vacío. El user real empieza sin citas y agrega
//   las suyas. Persistencia local namespaceada por user id hasta que
//   migremos a tabla `appointments` en Supabase.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { USER } from './user';
import { useUser } from './UserProvider';
import type { Appointment } from '../types';

const GUEST_APPTS_KEY = 'dsr-appointments-guest-v1';
const userApptsKey = (uid: string) => `dsr-appointments-user-${uid}-v1`;

interface AppointmentsValue {
  appointments: Appointment[];
  getById: (id: string) => Appointment | undefined;
  getUpcoming: () => Appointment | undefined;
  cancel: (id: string) => void;
  /** Update parcial — usado al reagendar (date/time). */
  update: (id: string, fields: Partial<Omit<Appointment, 'id'>>) => void;
}

const noop = () => {};
const AppointmentsCtx = createContext<AppointmentsValue>({
  appointments: USER.appointments,
  getById: () => undefined,
  getUpcoming: () => undefined,
  cancel: noop,
  update: noop,
});

function loadFromKey(key: string, fallback: Appointment[]): Appointment[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Appointment[];
  } catch {
    /* ignore */
  }
  return fallback;
}

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const { session } = useUser();
  const userId = session?.user?.id ?? null;

  // Estado inicial: si arrancamos con sesión, vacío + restaurar lo que
  // este user haya guardado antes. Si no, modo guest con USER mock.
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (userId) return loadFromKey(userApptsKey(userId), []);
    return loadFromKey(GUEST_APPTS_KEY, USER.appointments);
  });

  // Cuando cambia el contexto de auth, resetear desde el storage correcto.
  // Sign-in: aplicar appointments del user (vacío si es nuevo).
  // Sign-out: volver al modo demo con USER mock (o lo que el guest tenga).
  useEffect(() => {
    if (userId) {
      setAppointments(loadFromKey(userApptsKey(userId), []));
    } else {
      setAppointments(loadFromKey(GUEST_APPTS_KEY, USER.appointments));
    }
  }, [userId]);

  // Persist al storage que corresponde al contexto actual.
  useEffect(() => {
    const key = userId ? userApptsKey(userId) : GUEST_APPTS_KEY;
    try {
      window.localStorage.setItem(key, JSON.stringify(appointments));
    } catch {
      /* ignore */
    }
  }, [appointments, userId]);

  const getById = useCallback(
    (id: string) => appointments.find((a) => a.id === id),
    [appointments],
  );

  // "Próxima cita" = primera confirmed ordenada por fecha asc.
  const getUpcoming = useCallback(
    () =>
      appointments
        .filter((a) => a.status === 'confirmed')
        .sort((a, b) => (a.date < b.date ? -1 : 1))[0],
    [appointments],
  );

  const cancel = useCallback((id: string) => {
    // Cancelar = marcar como past. Mantenemos el registro para historial.
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'past' } : a)),
    );
  }, []);

  const update = useCallback(
    (id: string, fields: Partial<Omit<Appointment, 'id'>>) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...fields } : a)),
      );
    },
    [],
  );

  const value = useMemo<AppointmentsValue>(
    () => ({ appointments, getById, getUpcoming, cancel, update }),
    [appointments, getById, getUpcoming, cancel, update],
  );

  return (
    <AppointmentsCtx.Provider value={value}>{children}</AppointmentsCtx.Provider>
  );
}

export const useAppointments = () => useContext(AppointmentsCtx);
