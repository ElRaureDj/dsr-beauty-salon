// DSR Admin — Configuración del salón.
// Form con datos del salón. Edits persisten al instante en localStorage.

import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Eyebrow, H1 } from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';
import { Field, TextInput } from '../SidePanel';
import type { SalonSettings } from '../../types';

const CURRENCIES: SalonSettings['currency'][] = ['EUR', 'USD', 'MXN', 'COP'];

export function SettingsSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getSettings, updateSettings } = useCatalog();
  const s = getSettings();
  const set = (fields: Partial<SalonSettings>) => updateSettings(fields);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>{lang === 'es' ? 'Otros' : 'Other'}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
          {lang === 'es' ? 'Configuración' : 'Settings'}
        </H1>
        <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
          {lang === 'es'
            ? 'Información del salón, horario general, redes sociales y moneda. Edits guardan al instante.'
            : 'Salon info, general hours, social media and currency. Edits save instantly.'}
        </Body>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 22,
        }}
      >
        {/* Identidad */}
        <Card title={lang === 'es' ? 'Identidad' : 'Identity'} T={T}>
          <Field label={lang === 'es' ? 'Nombre' : 'Name'}>
            <TextInput value={s.name} onChange={(v) => set({ name: v })} />
          </Field>
          <Field label={lang === 'es' ? 'Tagline (ES)' : 'Tagline (ES)'}>
            <TextInput value={s.tagline_es} onChange={(v) => set({ tagline_es: v })} />
          </Field>
          <Field label={lang === 'es' ? 'Tagline (EN)' : 'Tagline (EN)'}>
            <TextInput value={s.tagline_en} onChange={(v) => set({ tagline_en: v })} />
          </Field>
        </Card>

        {/* Contacto */}
        <Card title={lang === 'es' ? 'Contacto y ubicación' : 'Contact & location'} T={T}>
          <Field label={lang === 'es' ? 'Dirección' : 'Address'}>
            <TextInput value={s.address} onChange={(v) => set({ address: v })} />
          </Field>
          <Field label={lang === 'es' ? 'Ciudad' : 'City'}>
            <TextInput value={s.city} onChange={(v) => set({ city: v })} />
          </Field>
          <Field label={lang === 'es' ? 'Teléfono' : 'Phone'}>
            <TextInput value={s.phone} onChange={(v) => set({ phone: v })} />
          </Field>
          <Field label="Email">
            <TextInput value={s.email} onChange={(v) => set({ email: v })} />
          </Field>
          <Field label="Instagram">
            <TextInput
              value={s.instagram ?? ''}
              onChange={(v) => set({ instagram: v || undefined })}
            />
          </Field>
          <Field label="WhatsApp">
            <TextInput
              value={s.whatsapp ?? ''}
              onChange={(v) => set({ whatsapp: v || undefined })}
            />
          </Field>
        </Card>

        {/* Operación */}
        <Card title={lang === 'es' ? 'Operación' : 'Operations'} T={T}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label={lang === 'es' ? 'Apertura' : 'Open'}>
              <input
                type="time"
                value={s.hoursOpen}
                onChange={(e) => set({ hoursOpen: e.target.value })}
                style={timeStyle(T)}
              />
            </Field>
            <Field label={lang === 'es' ? 'Cierre' : 'Close'}>
              <input
                type="time"
                value={s.hoursClose}
                onChange={(e) => set({ hoursClose: e.target.value })}
                style={timeStyle(T)}
              />
            </Field>
          </div>
          <Field label={lang === 'es' ? 'Moneda' : 'Currency'}>
            <div style={{ display: 'flex', gap: 8 }}>
              {CURRENCIES.map((c) => {
                const sel = s.currency === c;
                return (
                  <button
                    key={c}
                    onClick={() => set({ currency: c })}
                    className="dsr-press"
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: sel ? T.gold : T.bgAlt,
                      color: sel ? T.bg : T.text,
                      border: 'none',
                      boxShadow: sel ? 'none' : `inset 0 0 0 1px ${T.line}`,
                      cursor: 'pointer',
                      fontFamily: T.mono,
                      fontSize: 12,
                      letterSpacing: 0.4,
                      fontWeight: 500,
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label={lang === 'es' ? 'Zona horaria' : 'Timezone'}>
            <TextInput value={s.timezone} onChange={(v) => set({ timezone: v })} />
          </Field>
        </Card>

        {/* Roles (placeholder informativo) */}
        <Card title={lang === 'es' ? 'Roles del equipo' : 'Team roles'} T={T}>
          <Body
            muted
            style={{
              fontSize: 12,
              lineHeight: 1.55,
              marginBottom: 12,
            }}
          >
            {lang === 'es'
              ? 'En producción cada miembro del equipo tendría un rol (owner / manager / receptionist / artist) con permisos diferenciados sobre el admin.'
              : "In production each team member would have a role (owner / manager / receptionist / artist) with differentiated admin permissions."}
          </Body>
          <RoleRow T={T} role="Owner" desc={lang === 'es' ? 'Acceso total · finanzas, reportes, config' : 'Full access · finance, reports, config'} />
          <RoleRow T={T} role="Manager" desc={lang === 'es' ? 'Catálogo, citas, inventario, marketing' : 'Catalog, appointments, inventory, marketing'} />
          <RoleRow T={T} role="Receptionist" desc={lang === 'es' ? 'Citas y clientas, sin precios ni reportes' : 'Appointments and customers, no prices or reports'} />
          <RoleRow T={T} role="Artist" desc={lang === 'es' ? 'Solo su propia agenda y reseñas' : 'Their own schedule and reviews only'} />
        </Card>
      </div>
    </div>
  );
}

function Card({
  T,
  title,
  children,
}: {
  T: ReturnType<typeof useTheme>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: T.surface,
        boxShadow: `inset 0 0 0 1px ${T.line}`,
        padding: 22,
      }}
    >
      <div
        style={{
          fontFamily: T.serif,
          fontStyle: 'italic',
          fontSize: 18,
          color: T.text,
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: `1px solid ${T.line}`,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function RoleRow({
  T,
  role,
  desc,
}: {
  T: ReturnType<typeof useTheme>;
  role: string;
  desc: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 14,
        padding: '10px 0',
        borderTop: `1px solid ${T.line}`,
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 11,
          letterSpacing: 1,
          color: T.gold,
          minWidth: 120,
        }}
      >
        {role}
      </span>
      <span
        style={{
          fontFamily: T.sans,
          fontSize: 11,
          color: T.textMuted,
          flex: 1,
          letterSpacing: 0.3,
          lineHeight: 1.5,
        }}
      >
        {desc}
      </span>
    </div>
  );
}

function timeStyle(T: ReturnType<typeof useTheme>): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    background: T.bgAlt,
    border: 'none',
    boxShadow: `inset 0 0 0 1px ${T.line}`,
    color: T.text,
    fontFamily: T.mono,
    fontSize: 13,
    outline: 'none',
  };
}
