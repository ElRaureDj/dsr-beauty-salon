// DSR Admin — Lista editable de artistas.

import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import {
  Body,
  Btn,
  Eyebrow,
  GhostBtn,
  H1,
  Ico,
  Icons,
  Img,
  Tiny,
} from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';
import { Field, SidePanel, TextInput } from '../SidePanel';
import type { Artisan, CategoryId } from '../../types';

const NEW_ARTISAN: Omit<Artisan, 'id'> = {
  name: '',
  role_es: '',
  role_en: '',
  cats: ['hair'],
  specialty_es: '',
  specialty_en: '',
  years: 0,
  bio_es: '',
  bio_en: '',
  rating: 5,
  reviews: 0,
  photo: '',
  avatar: '',
};

export function ArtisansSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const {
    getAllArtisans,
    updateArtisan,
    resetArtisan,
    createArtisan,
    deleteArtisan,
    artisanOverrideIds,
  } = useCatalog();
  const artisans = getAllArtisans();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const editing = editingId ? artisans.find((a) => a.id === editingId) : null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, marginBottom: 24 }}>
        <div>
          <Eyebrow>{lang === 'es' ? 'Personal' : 'People'}</Eyebrow>
          <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
            {lang === 'es' ? 'Artistas' : 'Artisans'}
          </H1>
          <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
            {lang === 'es'
              ? 'Equipo del salón. Click en una tarjeta para editar.'
              : 'Salon team. Click a card to edit.'}
          </Body>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
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
            {artisanOverrideIds.length}{' '}
            {lang === 'es' ? 'editados' : 'edited'}
          </Tiny>
          <Btn onClick={() => setCreating(true)} fullWidth={false}>
            <Ico size={12} color={T.bg} stroke={2}>
              {Icons.plus}
            </Ico>
            {lang === 'es' ? 'Nuevo artista' : 'New artisan'}
          </Btn>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}
      >
        {artisans.map((a) => {
          const overridden = artisanOverrideIds.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => setEditingId(a.id)}
              className="dsr-press"
              style={{
                background: T.surface,
                boxShadow: `inset 0 0 0 1px ${T.line}`,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Img src={a.photo} style={{ width: 88, height: 110, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, padding: '14px 14px 14px 0' }}>
                <Body style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</Body>
                <Tiny
                  style={{
                    color: T.gold,
                    marginTop: 4,
                    fontSize: 11,
                    letterSpacing: 0.4,
                    textTransform: 'none',
                    fontFamily: T.serif,
                    fontStyle: 'italic',
                  }}
                >
                  {lang === 'es' ? a.role_es : a.role_en}
                </Tiny>
                <Tiny
                  muted
                  style={{
                    marginTop: 6,
                    fontSize: 10,
                    letterSpacing: 0.3,
                    textTransform: 'none',
                  }}
                >
                  {a.years} {lang === 'es' ? 'años' : 'yrs'} · {a.rating} ★
                </Tiny>
                <Tiny
                  muted
                  style={{
                    marginTop: 6,
                    fontSize: 9,
                    letterSpacing: 1,
                    fontFamily: T.mono,
                  }}
                >
                  {a.id}
                </Tiny>
              </div>
              {overridden && (
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: T.gold,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {(editing || creating) && (
        <ArtisanEditor
          key={editing?.id ?? 'new'}
          artisan={editing ?? { id: '', ...NEW_ARTISAN }}
          isNew={creating}
          open={!!(editing || creating)}
          onClose={() => {
            setEditingId(null);
            setCreating(false);
          }}
          onSave={(fields) => {
            if (creating) {
              const { id, ...rest } = fields as Artisan;
              void id;
              const created = { ...rest, avatar: rest.avatar || rest.photo };
              createArtisan(created);
            } else if (editing) {
              updateArtisan(editing.id, fields);
            }
            setEditingId(null);
            setCreating(false);
          }}
          onReset={
            editing
              ? () => {
                  resetArtisan(editing.id);
                  setEditingId(null);
                }
              : undefined
          }
          onDelete={
            editing
              ? () => {
                  deleteArtisan(editing.id);
                  setEditingId(null);
                }
              : undefined
          }
          isOverridden={editing ? artisanOverrideIds.includes(editing.id) : false}
        />
      )}
    </div>
  );
}

function ArtisanEditor({
  artisan,
  isNew,
  open,
  onClose,
  onSave,
  onReset,
  onDelete,
  isOverridden,
}: {
  artisan: Artisan;
  isNew: boolean;
  open: boolean;
  onClose: () => void;
  onSave: (fields: Partial<Artisan>) => void;
  onReset?: () => void;
  onDelete?: () => void;
  isOverridden: boolean;
}) {
  const T = useTheme();
  const { lang } = useI18n();
  const [draft, setDraft] = useState<Artisan>(artisan);
  const canSave = !!draft.name.trim() && draft.cats.length > 0;
  const set = <K extends keyof Artisan>(k: K, v: Artisan[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const toggleCategory = (c: CategoryId) => {
    const cur = draft.cats;
    const next: CategoryId[] = cur.includes(c)
      ? cur.filter((x) => x !== c)
      : [...cur, c];
    set('cats', next);
  };

  const cats: { id: CategoryId; label: string }[] = [
    { id: 'hair', label: lang === 'es' ? 'Peluquería' : 'Hair' },
    { id: 'nails', label: lang === 'es' ? 'Manicura' : 'Nails' },
    { id: 'facial', label: lang === 'es' ? 'Faciales' : 'Facials' },
  ];

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={
        isNew
          ? lang === 'es'
            ? 'Nuevo artista'
            : 'New artisan'
          : draft.name || (lang === 'es' ? 'Artista' : 'Artisan')
      }
      subtitle={
        isNew
          ? lang === 'es'
            ? 'Nuevo'
            : 'New'
          : `${lang === 'es' ? 'Artista' : 'Artisan'} · ${artisan.id}`
      }
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {!isNew && onDelete && (
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
            )}
            {!isNew && isOverridden && onReset && (
              <GhostBtn onClick={onReset}>
                {lang === 'es' ? 'Restaurar base' : 'Reset to base'}
              </GhostBtn>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn primary={false} onClick={onClose} fullWidth={false}>
              {lang === 'es' ? 'Cancelar' : 'Cancel'}
            </Btn>
            <Btn onClick={() => onSave(draft)} fullWidth={false} disabled={!canSave}>
              {isNew
                ? lang === 'es'
                  ? 'Crear'
                  : 'Create'
                : lang === 'es'
                  ? 'Guardar'
                  : 'Save'}
            </Btn>
          </div>
        </div>
      }
    >
      <Field label={lang === 'es' ? 'Nombre' : 'Name'}>
        <TextInput value={draft.name} onChange={(v) => set('name', v)} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={lang === 'es' ? 'Rol (ES)' : 'Role (ES)'}>
          <TextInput value={draft.role_es} onChange={(v) => set('role_es', v)} />
        </Field>
        <Field label={lang === 'es' ? 'Rol (EN)' : 'Role (EN)'}>
          <TextInput value={draft.role_en} onChange={(v) => set('role_en', v)} />
        </Field>
      </div>

      <Field label={lang === 'es' ? 'Categorías habilitadas' : 'Enabled categories'}>
        <div style={{ display: 'flex', gap: 8 }}>
          {cats.map((c) => {
            const sel = draft.cats.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleCategory(c.id)}
                className="dsr-press"
                style={{
                  flex: 1,
                  padding: '10px 12px',
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
                {c.label}
              </button>
            );
          })}
        </div>
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={lang === 'es' ? 'Especialidad (ES)' : 'Specialty (ES)'}>
          <TextInput value={draft.specialty_es} onChange={(v) => set('specialty_es', v)} />
        </Field>
        <Field label={lang === 'es' ? 'Especialidad (EN)' : 'Specialty (EN)'}>
          <TextInput value={draft.specialty_en} onChange={(v) => set('specialty_en', v)} />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label={lang === 'es' ? 'Años' : 'Years'}>
          <TextInput
            type="number"
            value={String(draft.years)}
            onChange={(v) => set('years', Number(v) || 0)}
          />
        </Field>
        <Field label="Rating">
          <TextInput
            type="number"
            value={String(draft.rating)}
            onChange={(v) => set('rating', Number(v) || 0)}
          />
        </Field>
        <Field label={lang === 'es' ? 'Reseñas' : 'Reviews'}>
          <TextInput
            type="number"
            value={String(draft.reviews)}
            onChange={(v) => set('reviews', Number(v) || 0)}
          />
        </Field>
      </div>

      <Field label={lang === 'es' ? 'Bio (ES)' : 'Bio (ES)'}>
        <TextInput multiline rows={3} value={draft.bio_es} onChange={(v) => set('bio_es', v)} />
      </Field>
      <Field label={lang === 'es' ? 'Bio (EN)' : 'Bio (EN)'}>
        <TextInput multiline rows={3} value={draft.bio_en} onChange={(v) => set('bio_en', v)} />
      </Field>

      <Field
        label={lang === 'es' ? 'Foto (URL)' : 'Photo (URL)'}
        hint={lang === 'es' ? 'En producción, esto sería un upload.' : 'In production this would be an upload.'}
      >
        <TextInput type="url" value={draft.photo} onChange={(v) => set('photo', v)} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={lang === 'es' ? 'Firma (ES)' : 'Signature (ES)'}>
          <TextInput
            value={draft.signature_es ?? ''}
            onChange={(v) => set('signature_es', v || undefined)}
          />
        </Field>
        <Field label={lang === 'es' ? 'Firma (EN)' : 'Signature (EN)'}>
          <TextInput
            value={draft.signature_en ?? ''}
            onChange={(v) => set('signature_en', v || undefined)}
          />
        </Field>
      </div>
    </SidePanel>
  );
}
