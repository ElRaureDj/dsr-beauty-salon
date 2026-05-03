// DSR — Addresses screen.
// Lista las direcciones del user autenticado y permite create/edit/delete.
// Sin sesión: empty state con CTA a Auth (las direcciones se atan a
// auth.users.id). Por ahora no se consumen en checkout — cuando llegue
// el flow real de pagos, se referencia desde el order.

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../theme/ThemeProvider';
import { useI18n } from '../i18n/LangProvider';
import {
  Body,
  Btn,
  Eyebrow,
  H1,
  H3,
  HeaderBar,
  Ico,
  Icons,
  Numeral,
  Screen,
  Tiny,
} from '../components/atoms';
import { useRouter } from '../router/Router';
import { useUser } from '../data/UserProvider';
import { useUserData } from '../data/useUserData';
import {
  US_STATES,
  detectLabelType,
  type AddressLabelType,
} from '../data/us-states';
import {
  createAddress,
  deleteAddress,
  fetchMyAddresses,
  updateAddress,
  type AddressInput,
} from '../lib/db';
import type { Address } from '../types';
import type { I18nKey } from '../i18n/strings';

// Country fijo a US para esta versión.
const COUNTRY = 'US';

const EMPTY_INPUT: AddressInput = {
  label: 'home',
  recipient: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: COUNTRY,
  phone: '',
  isDefault: false,
};

const LABEL_TYPES: { type: AddressLabelType; key: I18nKey }[] = [
  { type: 'home', key: 'addressLabelHome' },
  { type: 'office', key: 'addressLabelOffice' },
  { type: 'custom', key: 'addressLabelCustom' },
];

export function Addresses() {
  const T = useTheme();
  const { t, lang } = useI18n();
  const { go } = useRouter();
  const { signedIn, session } = useUser();
  const user = useUserData();
  const userId = session?.user?.id ?? null;
  const queryClient = useQueryClient();

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AddressInput>(EMPTY_INPUT);
  // Tipo lógico del label (home/office/custom). El draft.label guarda
  // el valor real que va a DB (string literal "home"/"office" o el texto custom).
  const [labelType, setLabelType] = useState<AddressLabelType>('home');
  const [customLabel, setCustomLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses', userId],
    queryFn: fetchMyAddresses,
    enabled: !!userId,
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ['addresses', userId] });

  if (!signedIn) {
    return (
      <Screen padTop={0} padBottom={40}>
        <HeaderBar onBack={() => go('profile')} title={t('addressesTitle')} />
        <div
          style={{
            padding: '160px 32px 0',
            textAlign: 'center',
          }}
        >
          <Numeral value="·" style={{ fontSize: 18 }} />
          <Body
            muted
            style={{ marginTop: 18, fontSize: 14, lineHeight: 1.6 }}
          >
            {t('personalInfoLoginRequired')}
          </Body>
          <Btn
            onClick={() => go('auth')}
            fullWidth={false}
            style={{ marginTop: 26 }}
          >
            {t('personalInfoLoginCta')}
          </Btn>
        </div>
      </Screen>
    );
  }

  const startCreate = () => {
    // Recipient default: nombre completo del profile (o display_name).
    setDraft({ ...EMPTY_INPUT, recipient: user.fullName });
    setLabelType('home');
    setCustomLabel('');
    setEditingId(null);
    setErrorMsg(null);
    setView('form');
  };

  const startEdit = (a: Address) => {
    const type = detectLabelType(a.label);
    setLabelType(type);
    setCustomLabel(type === 'custom' ? a.label : '');
    setDraft({
      label: a.label,
      recipient: a.recipient,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      region: a.region,
      postalCode: a.postalCode,
      country: COUNTRY,
      phone: a.phone,
      isDefault: a.isDefault,
    });
    setEditingId(a.id);
    setErrorMsg(null);
    setView('form');
  };

  const cancel = () => {
    setView('list');
    setEditingId(null);
    setErrorMsg(null);
  };

  const handleLabelType = (type: AddressLabelType) => {
    setLabelType(type);
    if (type === 'home') setDraft((d) => ({ ...d, label: 'home' }));
    else if (type === 'office') setDraft((d) => ({ ...d, label: 'office' }));
    else setDraft((d) => ({ ...d, label: customLabel }));
  };

  const handleCustomLabel = (v: string) => {
    setCustomLabel(v);
    setDraft((d) => ({ ...d, label: v }));
  };

  const handleSave = async () => {
    if (!userId || saving) return;
    if (
      !draft.line1.trim() ||
      !draft.city.trim() ||
      !draft.postalCode.trim() ||
      !draft.region
    ) {
      setErrorMsg(
        lang === 'es'
          ? 'Completa calle, ciudad, estado y ZIP.'
          : 'Fill in street, city, state and ZIP.',
      );
      return;
    }
    if (labelType === 'custom' && !customLabel.trim()) {
      setErrorMsg(
        lang === 'es'
          ? 'Ingresa una etiqueta para esta dirección.'
          : 'Enter a label for this address.',
      );
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      if (editingId) {
        await updateAddress(userId, editingId, draft);
      } else {
        await createAddress(userId, draft);
      }
      await refetch();
      setView('list');
      setEditingId(null);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      await refetch();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error desconocido');
    }
  };

  if (view === 'form') {
    return (
      <Screen padTop={0} padBottom={140}>
        <HeaderBar
          onBack={cancel}
          title={editingId ? t('addressesEdit') : t('addressesNew')}
        />
        <div style={{ padding: '108px 22px 0' }}>
          <Numeral value="·" style={{ fontSize: 14 }} />
          <H1 style={{ fontSize: 28, marginTop: 6 }}>
            {editingId ? t('addressesEdit') : t('addressesNew')}
          </H1>

          <Field label={t('addressFormLabel')} T={T}>
            <div style={{ display: 'flex', gap: 6 }}>
              {LABEL_TYPES.map(({ type, key }) => {
                const sel = labelType === type;
                return (
                  <button
                    key={type}
                    onClick={() => handleLabelType(type)}
                    type="button"
                    className="dsr-press"
                    style={{
                      flex: 1,
                      padding: '11px 10px',
                      background: sel ? T.gold : T.surface,
                      color: sel ? T.bg : T.text,
                      border: 'none',
                      boxShadow: sel ? 'none' : `inset 0 0 0 1px ${T.line}`,
                      cursor: 'pointer',
                      fontFamily: T.sans,
                      fontSize: 12,
                      letterSpacing: 0.4,
                      fontWeight: 500,
                      transition: 'background .15s, color .15s',
                    }}
                  >
                    {t(key) as string}
                  </button>
                );
              })}
            </div>
          </Field>
          {labelType === 'custom' && (
            <Field label={t('addressFormCustomLabel')} T={T}>
              <Input value={customLabel} onChange={handleCustomLabel} T={T} />
            </Field>
          )}

          <Field label={t('addressFormRecipient')} T={T}>
            <Input
              value={draft.recipient}
              onChange={(v) => setDraft((d) => ({ ...d, recipient: v }))}
              T={T}
            />
          </Field>
          <Field label={t('addressFormLine1')} T={T}>
            <Input
              value={draft.line1}
              onChange={(v) => setDraft((d) => ({ ...d, line1: v }))}
              T={T}
            />
          </Field>
          <Field label={t('addressFormLine2')} T={T}>
            <Input
              value={draft.line2}
              onChange={(v) => setDraft((d) => ({ ...d, line2: v }))}
              T={T}
            />
          </Field>
          <Field label={t('addressFormCity')} T={T}>
            <Input
              value={draft.city}
              onChange={(v) => setDraft((d) => ({ ...d, city: v }))}
              T={T}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label={t('addressFormState')} T={T}>
              <select
                value={draft.region}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, region: e.target.value }))
                }
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: T.surface,
                  border: 'none',
                  boxShadow: `inset 0 0 0 1px ${T.line}`,
                  color: draft.region ? T.text : T.textMuted,
                  fontFamily: T.sans,
                  fontSize: 13,
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="" disabled>
                  {t('addressFormStatePlaceholder')}
                </option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('addressFormZip')} T={T}>
              <Input
                value={draft.postalCode}
                onChange={(v) =>
                  setDraft((d) => ({ ...d, postalCode: v.replace(/\D/g, '').slice(0, 5) }))
                }
                T={T}
              />
            </Field>
          </div>
          <Field label={t('addressFormPhone')} T={T}>
            <Input
              value={draft.phone}
              onChange={(v) =>
                setDraft((d) => ({ ...d, phone: formatUsPhone(v) }))
              }
              T={T}
              type="tel"
            />
          </Field>

          <button
            onClick={() =>
              setDraft((d) => ({ ...d, isDefault: !d.isDefault }))
            }
            className="dsr-press"
            style={{
              marginTop: 24,
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Body style={{ fontSize: 13 }}>{t('addressesSetDefault')}</Body>
            <div
              style={{
                width: 38,
                height: 22,
                borderRadius: 999,
                background: draft.isDefault ? T.gold : T.surface,
                boxShadow: `inset 0 0 0 1px ${draft.isDefault ? T.gold : T.lineStrong}`,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: draft.isDefault ? 18 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  background: draft.isDefault ? T.bg : T.textMuted,
                  transition: 'left .2s, background .2s',
                }}
              />
            </div>
          </button>

          {errorMsg && (
            <Tiny
              style={{
                marginTop: 14,
                color: T.gold,
                letterSpacing: 0.4,
                textTransform: 'none',
                fontSize: 11,
              }}
            >
              {errorMsg}
            </Tiny>
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '14px 22px 36px',
            background: `linear-gradient(180deg, transparent, ${T.bg} 30%)`,
            zIndex: 30,
          }}
        >
          <Btn onClick={handleSave} disabled={saving}>
            {saving
              ? t('personalInfoSaving')
              : t('addressFormSave')}
          </Btn>
          {editingId && (
            <button
              onClick={() => {
                if (window.confirm(t('addressesDelete') + ' ?')) {
                  void handleDelete(editingId).then(cancel);
                }
              }}
              className="dsr-press"
              style={{
                width: '100%',
                marginTop: 14,
                background: 'transparent',
                border: 'none',
                padding: '12px 0',
                cursor: 'pointer',
                color: T.rouge ?? T.gold,
                fontFamily: T.sans,
                fontSize: 11,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              {t('addressesDelete')}
            </button>
          )}
        </div>
      </Screen>
    );
  }

  return (
    <Screen padTop={0} padBottom={140}>
      <HeaderBar onBack={() => go('profile')} title={t('addressesTitle')} />
      <div style={{ padding: '108px 22px 0' }}>
        <Numeral value="·" style={{ fontSize: 14 }} />
        <H1 style={{ fontSize: 32, marginTop: 6 }}>{t('addressesTitle')}</H1>
        <Body
          muted
          style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5, maxWidth: 320 }}
        >
          {t('addressesSub')}
        </Body>

        {addresses.length === 0 ? (
          <div
            style={{
              marginTop: 40,
              padding: 28,
              background: T.surface,
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              textAlign: 'center',
            }}
          >
            <Body muted style={{ fontSize: 13 }}>
              {t('addressesEmpty')}
            </Body>
          </div>
        ) : (
          <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {addresses.map((a) => {
              const labelDisplay = displayLabel(a.label, t);
              return (
                <button
                  key={a.id}
                  onClick={() => startEdit(a)}
                  className="dsr-press"
                  style={{
                    background: T.surface,
                    boxShadow: `inset 0 0 0 1px ${a.isDefault ? T.gold : T.line}`,
                    padding: 18,
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                  }}
                >
                  {a.isDefault && (
                    <Tiny
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        color: T.gold,
                        letterSpacing: 1.4,
                        fontSize: 9,
                      }}
                    >
                      ★ {t('addressesDefault')}
                    </Tiny>
                  )}
                  <H3 style={{ fontSize: 15 }}>{labelDisplay}</H3>
                  {a.recipient && (
                    <Tiny
                      muted
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        letterSpacing: 0.3,
                        textTransform: 'none',
                      }}
                    >
                      {a.recipient}
                    </Tiny>
                  )}
                  <Body
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: T.textMuted,
                    }}
                  >
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ''}
                    <br />
                    {a.city}, {a.region} {a.postalCode}
                  </Body>
                  <div
                    style={{
                      marginTop: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: T.gold,
                    }}
                  >
                    <Ico size={11} color={T.gold}>
                      {Icons.edit}
                    </Ico>
                    <Tiny
                      style={{
                        color: T.gold,
                        letterSpacing: 1.2,
                        fontSize: 10,
                      }}
                    >
                      {t('addressesEdit')}
                    </Tiny>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px 22px 36px',
          background: `linear-gradient(180deg, transparent, ${T.bg} 30%)`,
          zIndex: 30,
        }}
      >
        <Btn onClick={startCreate}>
          <Ico size={14} color={T.bg}>
            {Icons.plus}
          </Ico>
          {t('addressesAdd')}
        </Btn>
      </div>
    </Screen>
  );
}

/** Devuelve el label para mostrar — traducido si es home/office, literal si es custom. */
function displayLabel(
  stored: string,
  t: ReturnType<typeof useI18n>['t'],
): string {
  if (stored === 'home') return t('addressLabelHome') as string;
  if (stored === 'office') return t('addressLabelOffice') as string;
  return stored || (t('addressLabelCustom') as string);
}

/**
 * Formatea un teléfono al estándar US: (XXX) XXX-XXXX. Acepta cualquier
 * input (con/sin formato) y lo normaliza a sus dígitos antes de re-aplicar
 * el formato. Limita a 10 dígitos (sin código de país).
 */
function formatUsPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function Field({
  label,
  hint,
  children,
  T,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  T: ReturnType<typeof useTheme>;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <Eyebrow>{label}</Eyebrow>
      <div style={{ marginTop: 8 }}>{children}</div>
      {hint && (
        <Tiny
          muted
          style={{
            marginTop: 6,
            fontSize: 10,
            letterSpacing: 0.3,
            textTransform: 'none',
          }}
        >
          {hint}
        </Tiny>
      )}
      <span style={{ display: 'none' }}>{T.bg}</span>
    </div>
  );
}

function Input({
  value,
  onChange,
  T,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  T: ReturnType<typeof useTheme>;
  type?: 'text' | 'tel';
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      style={{
        width: '100%',
        padding: '12px 14px',
        background: T.surface,
        border: 'none',
        boxShadow: `inset 0 0 0 1px ${T.line}`,
        color: T.text,
        fontFamily: T.sans,
        fontSize: 13,
        outline: 'none',
      }}
    />
  );
}
