// DSR — Appointments context.
// Hoy las citas vienen del seed estático (USER.appointments) pero ahora
// son state reactivo + persisten en localStorage para soportar acciones
// del cliente como cancelar. Cuando llegue Fase 5 (cart/bookings al
// backend), este provider pasa a leer de Supabase.

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
import type { Appointment } from '../types';

const APPTS_KEY = 'dsr-appointments-v1';

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

function load(): Appointment[] {
  try {
    const raw = window.localStorage.getItem(APPTS_KEY);
    if (!raw) return USER.appointments;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Appointment[];
  } catch {
    /* ignore */
  }
  return USER.appointments;
}

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(APPTS_KEY, JSON.stringify(appointments));
    } catch {
      /* ignore */
    }
  }, [appointments]);

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
