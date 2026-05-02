// DSR Admin — Lista editable de productos y servicios.
// Click en fila abre SidePanel con form. Save persiste vía CatalogProvider.

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
  Img,
  Tiny,
} from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';
import { Field, SidePanel, TextInput } from '../SidePanel';
import type { CategoryId, Product, Service } from '../../types';

// ─── PRODUCTS ─────────────────────────────────────────────────────────────

export function ProductsSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getAllProducts, updateProduct, resetProduct, productOverrideIds } =
    useCatalog();
  const products = getAllProducts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = editingId ? products.find((p) => p.id === editingId) : null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, marginBottom: 24 }}>
        <div>
          <Eyebrow>{lang === 'es' ? 'Catálogo' : 'Catalog'}</Eyebrow>
          <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
            {lang === 'es' ? 'Productos' : 'Products'}
          </H1>
          <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
            {lang === 'es'
              ? 'Inventario del boutique. Haz click en una fila para editar.'
              : 'Boutique inventory. Click a row to edit.'}
          </Body>
        </div>
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
          {productOverrideIds.length}{' '}
          {lang === 'es' ? 'editados' : 'edited'}
        </Tiny>
      </div>

      <div
        style={{
          background: T.surface,
          boxShadow: `inset 0 0 0 1px ${T.line}`,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 140px 100px 100px 32px',
            gap: 14,
            padding: '12px 18px',
            borderBottom: `1px solid ${T.line}`,
            alignItems: 'center',
          }}
        >
          <span />
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'NOMBRE' : 'NAME'}
          </Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>ID</Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'TAMAÑO' : 'SIZE'}
          </Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2, textAlign: 'right' }}>
            {lang === 'es' ? 'PRECIO' : 'PRICE'}
          </Tiny>
          <span />
        </div>
        {products.map((p) => {
          const overridden = productOverrideIds.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => setEditingId(p.id)}
              className="dsr-press"
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '60px 1fr 140px 100px 100px 32px',
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
              <Img src={p.photo} style={{ width: 44, height: 56 }} />
              <div>
                <Body style={{ fontSize: 13, fontWeight: 500 }}>
                  {lang === 'es' ? p.name_es : p.name_en}
                </Body>
                <Tiny muted style={{ fontSize: 11, letterSpacing: 0.3, textTransform: 'none', marginTop: 2 }}>
                  {lang === 'es' ? p.cat_es : p.cat_en} · {p.line}
                </Tiny>
              </div>
              <Tiny style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 0.4, textTransform: 'none', color: T.textMuted }}>
                {p.id}
              </Tiny>
              <Tiny style={{ fontSize: 11, letterSpacing: 0.4, textTransform: 'none', color: T.textMuted }}>
                {p.size}
              </Tiny>
              <H3 style={{ fontSize: 16, color: T.gold, fontStyle: 'italic', textAlign: 'right' }}>
                €{p.price}
              </H3>
              <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {overridden && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: T.gold,
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {editing && (
        <ProductEditor
          key={editing.id}
          product={editing}
          open={!!editing}
          onClose={() => setEditingId(null)}
          onSave={(fields) => {
            updateProduct(editing.id, fields);
            setEditingId(null);
          }}
          onReset={() => {
            resetProduct(editing.id);
            setEditingId(null);
          }}
          isOverridden={productOverrideIds.includes(editing.id)}
        />
      )}
    </div>
  );
}

function ProductEditor({
  product,
  open,
  onClose,
  onSave,
  onReset,
  isOverridden,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
  onSave: (fields: Partial<Product>) => void;
  onReset: () => void;
  isOverridden: boolean;
}) {
  const { lang } = useI18n();
  const [draft, setDraft] = useState<Product>(product);
  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={lang === 'es' ? draft.name_es : draft.name_en}
      subtitle={`${lang === 'es' ? 'Producto' : 'Product'} · ${product.id}`}
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
          {isOverridden ? (
            <GhostBtn onClick={onReset}>
              {lang === 'es' ? 'Restaurar base' : 'Reset to base'}
            </GhostBtn>
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn primary={false} onClick={onClose} fullWidth={false}>
              {lang === 'es' ? 'Cancelar' : 'Cancel'}
            </Btn>
            <Btn onClick={() => onSave(draft)} fullWidth={false}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={lang === 'es' ? 'Línea' : 'Line'}>
          <TextInput value={draft.line} onChange={(v) => set('line', v)} />
        </Field>
        <Field label={lang === 'es' ? 'Tamaño' : 'Size'}>
          <TextInput value={draft.size} onChange={(v) => set('size', v)} />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={lang === 'es' ? 'Categoría (ES)' : 'Category (ES)'}>
          <TextInput value={draft.cat_es} onChange={(v) => set('cat_es', v)} />
        </Field>
        <Field label={lang === 'es' ? 'Categoría (EN)' : 'Category (EN)'}>
          <TextInput value={draft.cat_en} onChange={(v) => set('cat_en', v)} />
        </Field>
      </div>

      <Field label={lang === 'es' ? 'Precio (€)' : 'Price (€)'}>
        <TextInput
          type="number"
          value={String(draft.price)}
          onChange={(v) => set('price', Number(v) || 0)}
        />
      </Field>

      <Field label={lang === 'es' ? 'Descripción (ES)' : 'Description (ES)'}>
        <TextInput
          multiline
          rows={3}
          value={draft.desc_es}
          onChange={(v) => set('desc_es', v)}
        />
      </Field>
      <Field label={lang === 'es' ? 'Descripción (EN)' : 'Description (EN)'}>
        <TextInput
          multiline
          rows={3}
          value={draft.desc_en}
          onChange={(v) => set('desc_en', v)}
        />
      </Field>

      <Field
        label={lang === 'es' ? 'Foto (URL)' : 'Photo (URL)'}
        hint={lang === 'es' ? 'En producción, esto sería un upload.' : 'In production this would be an upload.'}
      >
        <TextInput type="url" value={draft.photo} onChange={(v) => set('photo', v)} />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={lang === 'es' ? 'Badge (ES)' : 'Badge (ES)'}>
          <TextInput
            value={draft.badge_es ?? ''}
            onChange={(v) => set('badge_es', v || undefined)}
            placeholder={lang === 'es' ? 'Ej: Más vendido' : 'e.g. Bestseller'}
          />
        </Field>
        <Field label={lang === 'es' ? 'Badge (EN)' : 'Badge (EN)'}>
          <TextInput
            value={draft.badge_en ?? ''}
            onChange={(v) => set('badge_en', v || undefined)}
            placeholder={lang === 'es' ? 'Ej: Bestseller' : 'e.g. Bestseller'}
          />
        </Field>
      </div>
    </SidePanel>
  );
}

// ─── SERVICES ─────────────────────────────────────────────────────────────

export function ServicesSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getAllServices, updateService, resetService, serviceOverrideIds } =
    useCatalog();
  const services = getAllServices();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = editingId ? services.find((s) => s.id === editingId) : null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, marginBottom: 24 }}>
        <div>
          <Eyebrow>{lang === 'es' ? 'Catálogo' : 'Catalog'}</Eyebrow>
          <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
            {lang === 'es' ? 'Servicios' : 'Services'}
          </H1>
          <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
            {lang === 'es'
              ? 'Servicios del salón con duración y precio base. Click para editar.'
              : 'Salon services with duration and base price. Click to edit.'}
          </Body>
        </div>
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
          {serviceOverrideIds.length}{' '}
          {lang === 'es' ? 'editados' : 'edited'}
        </Tiny>
      </div>

      <div style={{ background: T.surface, boxShadow: `inset 0 0 0 1px ${T.line}` }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px 100px 100px 100px 32px',
            gap: 14,
            padding: '12px 18px',
            borderBottom: `1px solid ${T.line}`,
            alignItems: 'center',
          }}
        >
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'NOMBRE' : 'NAME'}
          </Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>ID</Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'CATEGORÍA' : 'CATEGORY'}
          </Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'DURACIÓN' : 'DURATION'}
          </Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2, textAlign: 'right' }}>
            {lang === 'es' ? 'PRECIO' : 'PRICE'}
          </Tiny>
          <span />
        </div>
        {services.map((s) => {
          const overridden = serviceOverrideIds.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => setEditingId(s.id)}
              className="dsr-press"
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 140px 100px 100px 100px 32px',
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
                  {lang === 'es' ? s.es : s.en}
                </Body>
                {s.popular && (
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
                    · en boga
                  </Tiny>
                )}
              </div>
              <Tiny style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: 0.4, textTransform: 'none', color: T.textMuted }}>
                {s.id}
              </Tiny>
              <Tiny style={{ fontSize: 11, letterSpacing: 0.4, textTransform: 'none', color: T.textMuted }}>
                {s.cat}
              </Tiny>
              <Tiny style={{ fontSize: 11, letterSpacing: 0.4, textTransform: 'none', color: T.textMuted }}>
                {s.duration} min
              </Tiny>
              <H3 style={{ fontSize: 16, color: T.gold, fontStyle: 'italic', textAlign: 'right' }}>
                €{s.price}
              </H3>
              <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {overridden && (
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: T.gold }} />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {editing && (
        <ServiceEditor
          key={editing.id}
          service={editing}
          open={!!editing}
          onClose={() => setEditingId(null)}
          onSave={(fields) => {
            updateService(editing.id, fields);
            setEditingId(null);
          }}
          onReset={() => {
            resetService(editing.id);
            setEditingId(null);
          }}
          isOverridden={serviceOverrideIds.includes(editing.id)}
        />
      )}
    </div>
  );
}

function ServiceEditor({
  service,
  open,
  onClose,
  onSave,
  onReset,
  isOverridden,
}: {
  service: Service;
  open: boolean;
  onClose: () => void;
  onSave: (fields: Partial<Service>) => void;
  onReset: () => void;
  isOverridden: boolean;
}) {
  const T = useTheme();
  const { lang } = useI18n();
  const [draft, setDraft] = useState<Service>(service);
  const set = <K extends keyof Service>(k: K, v: Service[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const cats: { id: CategoryId; label: string }[] = [
    { id: 'hair', label: lang === 'es' ? 'Peluquería' : 'Hair' },
    { id: 'nails', label: lang === 'es' ? 'Manicura' : 'Nails' },
    { id: 'facial', label: lang === 'es' ? 'Faciales' : 'Facials' },
  ];

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={lang === 'es' ? draft.es : draft.en}
      subtitle={`${lang === 'es' ? 'Servicio' : 'Service'} · ${service.id}`}
      footer={
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
          {isOverridden ? (
            <GhostBtn onClick={onReset}>
              {lang === 'es' ? 'Restaurar base' : 'Reset to base'}
            </GhostBtn>
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn primary={false} onClick={onClose} fullWidth={false}>
              {lang === 'es' ? 'Cancelar' : 'Cancel'}
            </Btn>
            <Btn onClick={() => onSave(draft)} fullWidth={false}>
              {lang === 'es' ? 'Guardar' : 'Save'}
            </Btn>
          </div>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={lang === 'es' ? 'Nombre (ES)' : 'Name (ES)'}>
          <TextInput value={draft.es} onChange={(v) => set('es', v)} />
        </Field>
        <Field label={lang === 'es' ? 'Nombre (EN)' : 'Name (EN)'}>
          <TextInput value={draft.en} onChange={(v) => set('en', v)} />
        </Field>
      </div>

      <Field label={lang === 'es' ? 'Categoría' : 'Category'}>
        <div style={{ display: 'flex', gap: 8 }}>
          {cats.map((c) => {
            const sel = draft.cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => set('cat', c.id)}
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
        <Field label={lang === 'es' ? 'Duración (min)' : 'Duration (min)'}>
          <TextInput
            type="number"
            value={String(draft.duration)}
            onChange={(v) => set('duration', Number(v) || 0)}
          />
        </Field>
        <Field label={lang === 'es' ? 'Precio (€)' : 'Price (€)'}>
          <TextInput
            type="number"
            value={String(draft.price)}
            onChange={(v) => set('price', Number(v) || 0)}
          />
        </Field>
      </div>

      <Field label={lang === 'es' ? 'Descripción (ES)' : 'Description (ES)'}>
        <TextInput
          multiline
          rows={3}
          value={draft.desc_es}
          onChange={(v) => set('desc_es', v)}
        />
      </Field>
      <Field label={lang === 'es' ? 'Descripción (EN)' : 'Description (EN)'}>
        <TextInput
          multiline
          rows={3}
          value={draft.desc_en}
          onChange={(v) => set('desc_en', v)}
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
          <Body style={{ fontSize: 13 }}>
            {lang === 'es' ? 'Servicio popular ("en boga")' : 'Popular service'}
          </Body>
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
