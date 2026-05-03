// DSR — Appointments context.
// Session-aware:
// - Sin sesión (modo guest/demo): seed con USER.appointments mock + persist
//   local en `dsr-appointments-guest-v1`. Esto preserva la experiencia
//   demo de Camila Vargas con sus 3 citas.
// - Con sesión: lee de la tabla `appointments` (Supabase, migration 0012).
//   Las pending_bookings se vuelven appointments cuando el customer pasa
//   por CheckoutSuccess (RPC confirm_checkout). cancel() llama a la RPC
//   cancel_appointment que también hace rollback de puntos si la cita
//   era futura.

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
import { USER } from './user';
import { useUser } from './UserProvider';
import {
  cancelAppointmentRpc,
  fetchMyAppointments,
} from '../lib/db';
import type { Appointment } from '../types';

const GUEST_APPTS_KEY = 'dsr-appointments-guest-v1';

interface AppointmentsValue {
  appointments: Appointment[];
  getById: (id: string) => Appointment | undefined;
  getUpcoming: () => Appointment | undefined;
  cancel: (id: string) => void;
  /** Update parcial — usado al reagendar (date/time). En modo session el
   *  reagendar real es ir a Booking flow; este path quedó para guest. */
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

function loadGuest(): Appointment[] {
  try {
    const raw = window.localStorage.getItem(GUEST_APPTS_KEY);
    if (!raw) return USER.appointments;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Appointment[];
  } catch {
    /* ignore */
  }
  return USER.appointments;
}

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const { session } = useUser();
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();

  // Guest state: USER mock + localStorage. Sólo se usa cuando no hay sesión.
  const [guestAppts, setGuestAppts] = useState<Appointment[]>(loadGuest);

  useEffect(() => {
    if (userId) return; // Con sesión, el guest state queda dormido.
    setGuestAppts(loadGuest());
  }, [userId]);

  useEffect(() => {
    if (userId) return;
    try {
      window.localStorage.setItem(GUEST_APPTS_KEY, JSON.stringify(guestAppts));
    } catch {
      /* ignore */
    }
  }, [guestAppts, userId]);

  // Authed state: query a la tabla appointments. Solo activa con sesión.
  const { data: dbAppts = [] } = useQuery({
    queryKey: ['my-appointments', userId],
    queryFn: fetchMyAppointments,
    enabled: !!userId,
    staleTime: 30_000,
  });

  const appointments = userId ? dbAppts : guestAppts;

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

  const cancel = useCallback(
    (id: string) => {
      if (userId) {
        // Optimistic: marca past local + dispatch a la RPC.
        queryClient.setQueryData<Appointment[]>(
          ['my-appointments', userId],
          (prev) =>
            prev?.map((a) => (a.id === id ? { ...a, status: 'past' } : a)),
        );
        void cancelAppointmentRpc(id)
          .then(() =>
            queryClient.invalidateQueries({
              queryKey: ['my-appointments', userId],
            }),
          )
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error('[appointments] cancel failed:', err);
            void queryClient.invalidateQueries({
              queryKey: ['my-appointments', userId],
            });
          });
        return;
      }
      // Guest: solo state local (cancelar = marcar past).
      setGuestAppts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'past' } : a)),
      );
    },
    [userId, queryClient],
  );

  const update = useCallback(
    (id: string, fields: Partial<Omit<Appointment, 'id'>>) => {
      if (userId) {
        // En modo session el "update" del provider no se usa — los cambios
        // pasan por el flow de Booking que crea/actualiza pending_bookings.
        // Optimistic local para preservar UX si alguna pantalla aún lo llama.
        queryClient.setQueryData<Appointment[]>(
          ['my-appointments', userId],
          (prev) => prev?.map((a) => (a.id === id ? { ...a, ...fields } : a)),
        );
        return;
      }
      setGuestAppts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...fields } : a)),
      );
    },
    [userId, queryClient],
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
