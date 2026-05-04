// DSR Admin — CRUD de combos.
// Lista en tabla con cómputo en vivo (precio base, descuento, precio final).
// Click en fila → drawer con form. "Nuevo combo" → drawer en modo create.

import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import {
  Body,
  Btn,
  Eyebrow,
  GhostBtn,
  H1,
  H3,
  Ico,
  Icons,
  Tiny,
} from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';
import { Field, SidePanel, TextInput } from '../SidePanel';
import type { Combo } from '../../types';

import { useCurrency } from '../../lib/format';
const NEW_COMBO: Omit<Combo, 'id'> = {
  name_es: '',
  name_en: '',
  serviceIds: [],
  discountPct: 10,
  description_es: '',
  description_en: '',
  popular: false,
};

export function CombosSection() {
  const T = useTheme();
  const { format: fmt } = useCurrency();
  const { t, lang } = useI18n();
  const { getCombos, getAllServices, createCombo, updateCombo, deleteCombo, resetCombos } =
    useCatalog();
  const combos = getCombos();
  const allServices = getAllServices();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const editing = editingId ? combos.find((c) => c.id === editingId) : null;

  const computePrices = (combo: Combo) => {
    const base = combo.serviceIds.reduce((sum, sid) => {
      const s = allServices.find((x) => x.id === sid);
      return sum + (s?.price ?? 0);
    }, 0);
    const final = Math.round(base * (1 - combo.discountPct / 100));
    return { base, final, savings: base - final };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, marginBottom: 24 }}>
        <div>
          <Eyebrow>{lang === 'es' ? 'Catálogo' : 'Catalog'}</Eyebrow>
          <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
            {t('combosTitle')}
          </H1>
          <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
            {t('combosSub')}
          </Body>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <GhostBtn onClick={resetCombos}>{t('combosResetSeed')}</GhostBtn>
          <Btn onClick={() => setCreating(true)} fullWidth={false}>
            <Ico size={12} color={T.bg} stroke={2}>
              {Icons.plus}
            </Ico>
            {t('combosNew')}
          </Btn>
        </div>
      </div>

      {combos.length === 0 ? (
        <div
          style={{
            padding: 28,
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            textAlign: 'center',
          }}
        >
          <Body muted style={{ fontSize: 13 }}>
            {lang === 'es'
              ? 'Aún no hay combos. Crea el primero.'
              : 'No bundles yet. Create the first one.'}
          </Body>
        </div>
      ) : (
        <div style={{ background: T.surface, boxShadow: `inset 0 0 0 1px ${T.line}` }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 80px 100px 100px 32px',
              gap: 14,
              padding: '12px 18px',
              borderBottom: `1px solid ${T.line}`,
              alignItems: 'center',
            }}
          >
            <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
              {t('combosName').toUpperCase()}
            </Tiny>
            <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
              {t('combosServices').toUpperCase()}
            </Tiny>
            <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
              {t('combosDiscount').toUpperCase()}
            </Tiny>
            <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
              {t('combosBasePrice').toUpperCase()}
            </Tiny>
            <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2, textAlign: 'right' }}>
              {t('combosFinalPrice').toUpperCase()}
            </Tiny>
            <span />
          </div>
          {combos.map((c) => {
            const { base, final } = computePrices(c);
            return (
              <button
                key={c.id}
                onClick={() => setEditingId(c.id)}
                className="dsr-press"
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 80px 100px 100px 32px',
                  gap: 14,
                  padding: '14px 18px',
                  borderBottom: `1px solid ${T.line}`,
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div>
                  <Body style={{ fontSize: 13, fontWeight: 500 }}>
                    {lang === 'es' ? c.name_es : c.name_en}
                  </Body>
                  {c.popular && (
                    <Tiny
                      style={{
                        color: T.gold,
                        fontFamily: T.serif,
                        fontStyle: 'italic',
                        fontSize: 11,
                        letterSpacing: 0.4,
                        textTransform: 'none',
                        marginTop: 2,
                      }}
                    >
                      · destacado
                    </Tiny>
                  )}
                </div>
                <Tiny
                  style={{
                    fontSize: 11,
                    letterSpacing: 0.4,
                    textTransform: 'none',
                    color: T.textMuted,
                    lineHeight: 1.4,
                  }}
                >
                  {c.serviceIds
                    .map((sid) => {
                      const s = allServices.find((x) => x.id === sid);
                      return s ? (lang === 'es' ? s.es : s.en) : sid;
                    })
                    .join(' + ')}
                </Tiny>
                <Tiny
                  style={{
                    fontFamily: T.mono,
                    fontSize: 12,
                    color: T.gold,
                    textTransform: 'none',
                  }}
                >
                  -{c.discountPct}%
                </Tiny>
                <Tiny
                  style={{
                    fontSize: 12,
                    color: T.textFaint,
                    textTransform: 'none',
                    textDecoration: 'line-through',
                  }}
                >
                  {fmt(base)}
                </Tiny>
                <H3 style={{ fontSize: 16, color: T.gold, fontStyle: 'italic', textAlign: 'right' }}>
                  {fmt(final)}
                </H3>
                <Ico size={12} color={T.textMuted}>
                  {Icons.chev}
                </Ico>
              </button>
            );
          })}
        </div>
      )}

      {(editing || creating) && (
        <ComboEditor
          key={editing?.id ?? 'new'}
          initial={editing ?? { id: '', ...NEW_COMBO }}
          isNew={creating}
          allServices={allServices}
          open={!!(editing || creating)}
          onClose={() => {
            setEditingId(null);
            setCreating(false);
          }}
          onSave={(combo) => {
            if (creating) {
              const { id, ...rest } = combo;
              void id;
              createCombo(rest);
            } else if (editing) {
              const { id, ...rest } = combo;
              void id;
              updateCombo(editing.id, rest);
            }
            setEditingId(null);
            setCreating(false);
          }}
          onDelete={
            editing
              ? () => {
                  deleteCombo(editing.id);
                  setEditingId(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function ComboEditor({
  initial,
  isNew,
  allServices,
  open,
  onClose,
  onSave,
  onDelete,
}: {
  initial: Combo;
  isNew: boolean;
  allServices: ReturnType<ReturnType<typeof useCatalog>['getAllServices']>;
  open: boolean;
  onClose: () => void;
  onSave: (combo: Combo) => void;
  onDelete?: () => void;
}) {
  const T = useTheme();
  const { format: fmt } = useCurrency();
  const { t, lang } = useI18n();
  const [draft, setDraft] = useState<Combo>(initial);
  const set = <K extends keyof Combo>(k: K, v: Combo[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const toggleService = (sid: string) => {
    const arr = draft.serviceIds.includes(sid)
      ? draft.serviceIds.filter((x) => x !== sid)
      : [...draft.serviceIds, sid];
    set('serviceIds', arr);
  };

  const base = draft.serviceIds.reduce((sum, sid) => {
    const s = allServices.find((x) => x.id === sid);
    return sum + (s?.price ?? 0);
  }, 0);
  const final = Math.round(base * (1 - draft.discountPct / 100));

  const canSave =
    draft.name_es.trim() && draft.name_en.trim() && draft.serviceIds.length > 0;

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={
        isNew
          ? t('combosNew')
          : lang === 'es'
            ? draft.name_es || 'Combo'
            : draft.name_en || 'Bundle'
      }
      subtitle={isNew ? (lang === 'es' ? 'Nuevo' : 'New') : 'Combo'}
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
              {t('combosDelete')}
            </button>
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn primary={false} onClick={onClose} fullWidth={false}>
              {lang === 'es' ? 'Cancelar' : 'Cancel'}
            </Btn>
            <Btn
              onClick={() => onSave(draft)}
              fullWidth={false}
              disabled={!canSave}
            >
              {lang === 'es' ? 'Guardar' : 'Save'}
            </Btn>
          </div>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={lang === 'es' ? 'Nombre (ES)' : 'Name (ES)'}>
          <TextInput value={draft.name_es} onChange={(v) => set('name_es', v)} />
        </Field>
        <Field label={lang === 'es' ? 'Nombre (EN)' : 'Name (EN)'}>
          <TextInput value={draft.name_en} onChange={(v) => set('name_en', v)} />
        </Field>
      </div>

      <Field label={t('combosServices')}>
        <div
          style={{
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            maxHeight: 280,
            overflowY: 'auto',
          }}
          className="dsr-scroll"
        >
          {allServices.map((s, i) => {
            const sel = draft.serviceIds.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleService(s.id)}
                className="dsr-press"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: sel ? T.gold : 'transparent',
                    boxShadow: `inset 0 0 0 1px ${sel ? T.gold : T.lineStrong}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {sel && (
                    <Ico size={11} color={T.bg} stroke={2.5}>
                      {Icons.check}
                    </Ico>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Body style={{ fontSize: 12, fontWeight: 500 }}>
                    {lang === 'es' ? s.es : s.en}
                  </Body>
                  <Tiny
                    muted
                    style={{
                      fontSize: 10,
                      letterSpacing: 0.4,
                      textTransform: 'none',
                      fontFamily: T.mono,
                    }}
                  >
                    {s.id} · {s.duration} min · {fmt(s.price)}
                  </Tiny>
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label={`${t('combosDiscount')} (%)`}
        hint={`${t('combosBasePrice')}: ${fmt(base)} · ${t('combosFinalPrice')}: ${fmt(final)}`}
      >
        <TextInput
          type="number"
          value={String(draft.discountPct)}
          onChange={(v) => {
            const n = Number(v);
            if (Number.isFinite(n)) set('discountPct', Math.max(0, Math.min(100, n)));
          }}
        />
      </Field>

      <Field label={`${t('combosDescription')} (ES)`}>
        <TextInput
          multiline
          rows={2}
          value={draft.description_es ?? ''}
          onChange={(v) => set('description_es', v)}
        />
      </Field>
      <Field label={`${t('combosDescription')} (EN)`}>
        <TextInput
          multiline
          rows={2}
          value={draft.description_en ?? ''}
          onChange={(v) => set('description_en', v)}
        />
      </Field>

      <Field label="">
        <button
          onClick={() => set('popular', !draft.popular)}
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
          <Body style={{ fontSize: 13 }}>{t('combosFeatured')}</Body>
          <div
            aria-pressed={!!draft.popular}
            style={{
              width: 38,
              height: 22,
              borderRadius: 999,
              background: draft.popular ? T.gold : T.surface,
              boxShadow: `inset 0 0 0 1px ${draft.popular ? T.gold : T.lineStrong}`,
              position: 'relative',
              transition: 'background .2s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: draft.popular ? 18 : 2,
                width: 18,
                height: 18,
                borderRadius: 999,
                background: draft.popular ? T.bg : T.textMuted,
                transition: 'left .2s, background .2s',
              }}
            />
          </div>
        </button>
      </Field>
    </SidePanel>
  );
}
