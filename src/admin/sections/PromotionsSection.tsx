// DSR Admin — Promociones (cupones de descuento).

import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Btn, Eyebrow, H1, Ico, Icons, Tiny } from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';
import { Field, SidePanel, TextInput } from '../SidePanel';
import type { Promo } from '../../types';

const NEW_PROMO: Omit<Promo, 'id'> = {
  code: '',
  type: 'pct',
  value: 10,
  description_es: '',
  description_en: '',
  validUntil: '',
  maxUses: undefined,
  usedCount: 0,
  active: true,
};

export function PromotionsSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getPromos, createPromo, updatePromo, deletePromo } = useCatalog();
  const promos = getPromos();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const editing = editingId ? promos.find((p) => p.id === editingId) : null;
  const activeCount = promos.filter((p) => p.active).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, marginBottom: 24 }}>
        <div>
          <Eyebrow>{lang === 'es' ? 'Otros' : 'Other'}</Eyebrow>
          <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
            {lang === 'es' ? 'Promociones' : 'Promotions'}
          </H1>
          <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
            {lang === 'es'
              ? 'Cupones de descuento — porcentaje o monto fijo, con vigencia opcional.'
              : 'Discount coupons — percentage or fixed amount, optional validity.'}
          </Body>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Tiny
            style={{
              padding: '8px 12px',
              background: T.surface,
              boxShadow: `inset 0 0 0 1px ${T.line}`,
              fontFamily: T.mono,
              fontSize: 11,
              letterSpacing: 0.4,
              textTransform: 'none',
            }}
          >
            {activeCount} {lang === 'es' ? 'activas' : 'active'}
          </Tiny>
          <Btn onClick={() => setCreating(true)} fullWidth={false}>
            <Ico size={12} color={T.bg} stroke={2}>
              {Icons.plus}
            </Ico>
            {lang === 'es' ? 'Nueva' : 'New'}
          </Btn>
        </div>
      </div>

      <div style={{ background: T.surface, boxShadow: `inset 0 0 0 1px ${T.line}` }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 100px 100px 100px 80px',
            gap: 14,
            padding: '12px 18px',
            borderBottom: `1px solid ${T.line}`,
            alignItems: 'center',
          }}
        >
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'CÓDIGO' : 'CODE'}
          </Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'DESCRIPCIÓN' : 'DESCRIPTION'}
          </Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'VALOR' : 'VALUE'}
          </Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>USOS</Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'VENCE' : 'EXPIRES'}
          </Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'ESTADO' : 'STATE'}
          </Tiny>
        </div>
        {promos.map((p) => (
          <button
            key={p.id}
            onClick={() => setEditingId(p.id)}
            className="dsr-press"
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '140px 1fr 100px 100px 100px 80px',
              gap: 14,
              padding: '12px 18px',
              borderBottom: `1px solid ${T.line}`,
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <Tiny
              style={{
                fontFamily: T.mono,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.2,
                color: T.gold,
                textTransform: 'none',
              }}
            >
              {p.code}
            </Tiny>
            <Tiny
              muted
              style={{ fontSize: 11, letterSpacing: 0.3, textTransform: 'none', lineHeight: 1.4 }}
            >
              {lang === 'es' ? p.description_es : p.description_en}
            </Tiny>
            <Tiny
              style={{
                fontFamily: T.mono,
                fontSize: 12,
                color: T.gold,
                textTransform: 'none',
              }}
            >
              {p.type === 'pct' ? `-${p.value}%` : `-€${p.value}`}
            </Tiny>
            <Tiny
              style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, textTransform: 'none' }}
            >
              {p.usedCount}
              {p.maxUses ? ` / ${p.maxUses}` : ''}
            </Tiny>
            <Tiny
              style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted, textTransform: 'none' }}
            >
              {p.validUntil || '—'}
            </Tiny>
            <Tiny
              style={{
                fontSize: 10,
                letterSpacing: 1.2,
                color: p.active ? T.gold : T.textFaint,
              }}
            >
              {p.active ? (lang === 'es' ? 'ACTIVA' : 'ACTIVE') : (lang === 'es' ? 'INACTIVA' : 'INACTIVE')}
            </Tiny>
          </button>
        ))}
      </div>

      {(editing || creating) && (
        <PromoEditor
          key={editing?.id ?? 'new'}
          initial={editing ?? { id: '', ...NEW_PROMO }}
          isNew={creating}
          open={!!(editing || creating)}
          onClose={() => {
            setEditingId(null);
            setCreating(false);
          }}
          onSave={(p) => {
            if (creating) {
              const { id, ...rest } = p;
              void id;
              createPromo(rest);
            } else if (editing) {
              const { id, ...rest } = p;
              void id;
              updatePromo(editing.id, rest);
            }
            setEditingId(null);
            setCreating(false);
          }}
          onDelete={
            editing
              ? () => {
                  deletePromo(editing.id);
                  setEditingId(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function PromoEditor({
  initial,
  isNew,
  open,
  onClose,
  onSave,
  onDelete,
}: {
  initial: Promo;
  isNew: boolean;
  open: boolean;
  onClose: () => void;
  onSave: (p: Promo) => void;
  onDelete?: () => void;
}) {
  const T = useTheme();
  const { lang } = useI18n();
  const [draft, setDraft] = useState<Promo>(initial);
  const set = <K extends keyof Promo>(k: K, v: Promo[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={isNew ? (lang === 'es' ? 'Nueva promoción' : 'New promotion') : draft.code || 'Promo'}
      subtitle={isNew ? (lang === 'es' ? 'Nuevo' : 'New') : (lang === 'es' ? 'Promoción' : 'Promotion')}
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
          {onDelete ? (
            <button
              onClick={onDelete}
              className="dsr-press"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 0',
                cursor: 'pointer',
                color: T.rouge,
                fontFamily: T.sans,
                fontSize: 11,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              {lang === 'es' ? 'Eliminar' : 'Delete'}
            </button>
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn primary={false} onClick={onClose} fullWidth={false}>
              {lang === 'es' ? 'Cancelar' : 'Cancel'}
            </Btn>
            <Btn onClick={() => onSave(draft)} fullWidth={false} disabled={!draft.code.trim()}>
              {lang === 'es' ? 'Guardar' : 'Save'}
            </Btn>
          </div>
        </div>
      }
    >
      <Field label={lang === 'es' ? 'Código' : 'Code'}>
        <TextInput
          value={draft.code}
          onChange={(v) => set('code', v.toUpperCase())}
          placeholder="BIENVENIDA"
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={lang === 'es' ? 'Tipo' : 'Type'}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['pct', 'fixed'] as const).map((tp) => {
              const sel = draft.type === tp;
              return (
                <button
                  key={tp}
                  onClick={() => set('type', tp)}
                  className="dsr-press"
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: sel ? T.gold : T.surface,
                    color: sel ? T.bg : T.text,
                    border: 'none',
                    boxShadow: sel ? 'none' : `inset 0 0 0 1px ${T.line}`,
                    cursor: 'pointer',
                    fontFamily: T.sans,
                    fontSize: 12,
                    letterSpacing: 0.4,
                    fontWeight: 500,
                  }}
                >
                  {tp === 'pct' ? '%' : '€'}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label={lang === 'es' ? 'Valor' : 'Value'}>
          <TextInput
            type="number"
            value={String(draft.value)}
            onChange={(v) => set('value', Number(v) || 0)}
          />
        </Field>
      </div>

      <Field label={lang === 'es' ? 'Descripción (ES)' : 'Description (ES)'}>
        <TextInput
          value={draft.description_es ?? ''}
          onChange={(v) => set('description_es', v)}
          multiline
          rows={2}
        />
      </Field>
      <Field label={lang === 'es' ? 'Descripción (EN)' : 'Description (EN)'}>
        <TextInput
          value={draft.description_en ?? ''}
          onChange={(v) => set('description_en', v)}
          multiline
          rows={2}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={lang === 'es' ? 'Vence (YYYY-MM-DD)' : 'Expires (YYYY-MM-DD)'}>
          <TextInput
            value={draft.validUntil ?? ''}
            onChange={(v) => set('validUntil', v || undefined)}
            placeholder="2026-12-31"
          />
        </Field>
        <Field label={lang === 'es' ? 'Máx. usos' : 'Max uses'}>
          <TextInput
            type="number"
            value={draft.maxUses ? String(draft.maxUses) : ''}
            onChange={(v) => {
              const n = Number(v);
              set('maxUses', Number.isFinite(n) && n > 0 ? n : undefined);
            }}
          />
        </Field>
      </div>

      <Field label="">
        <button
          onClick={() => set('active', !draft.active)}
          className="dsr-press"
          style={{
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
          <Body style={{ fontSize: 13 }}>{lang === 'es' ? 'Activa' : 'Active'}</Body>
          <div
            aria-pressed={draft.active}
            style={{
              width: 38,
              height: 22,
              borderRadius: 999,
              background: draft.active ? T.gold : T.surface,
              boxShadow: `inset 0 0 0 1px ${draft.active ? T.gold : T.lineStrong}`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: draft.active ? 18 : 2,
                width: 18,
                height: 18,
                borderRadius: 999,
                background: draft.active ? T.bg : T.textMuted,
                transition: 'left .2s',
              }}
            />
          </div>
        </button>
      </Field>
    </SidePanel>
  );
}
