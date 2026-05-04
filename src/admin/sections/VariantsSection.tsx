// DSR Admin — Editor de variantes producto↔servicio.
// Migrado del Admin.tsx (mobile) original. Adapta el layout a desktop:
// dos columnas (lista de servicios | editor del seleccionado) en pantallas anchas,
// stack vertical en pantallas estrechas (responsive simple sin librería).

import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import {
  Body,
  Divider,
  Eyebrow,
  GhostBtn,
  H1,
  Ico,
  Icons,
  Tiny,
} from '../../components/atoms';
import { PRODUCTS, SERVICES } from '../../data/catalog';
import { useCurrency } from '../../lib/format';
import {
  useCatalog,
  type MergedVariantConfig,
} from '../../data/CatalogProvider';

export function VariantsSection() {
  const T = useTheme();
  const { format: fmt } = useCurrency();
  const { lang } = useI18n();
  const { getServiceVariants, setServiceVariants, overriddenServiceIds, resetVariants } =
    useCatalog();
  const [selectedId, setSelectedId] = useState<string | null>(SERVICES[0]?.id ?? null);

  const selectedService = SERVICES.find((s) => s.id === selectedId);
  const selectedConfig = selectedId ? getServiceVariants(selectedId) : null;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 18,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <div>
          <Eyebrow>{lang === 'es' ? 'Catálogo' : 'Catalog'}</Eyebrow>
          <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
            {lang === 'es' ? 'Variantes' : 'Variants'}
          </H1>
          <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
            {lang === 'es'
              ? 'Configura productos Premium y selectores Custom por servicio. Las ediciones aquí se reflejan inmediatamente en la app de cliente.'
              : 'Configure Premium products and Custom selectors per service. Edits here propagate instantly to the customer app.'}
          </Body>
        </div>
        <div
          style={{
            padding: '10px 14px',
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <Tiny
            style={{
              fontFamily: T.mono,
              fontSize: 11,
              letterSpacing: 0.4,
              textTransform: 'none',
            }}
          >
            {overriddenServiceIds.length}{' '}
            {lang === 'es' ? 'overrides' : 'overrides'}
          </Tiny>
          {overriddenServiceIds.length > 0 && (
            <GhostBtn onClick={resetVariants}>
              {lang === 'es' ? 'Restaurar' : 'Reset'}
            </GhostBtn>
          )}
        </div>
      </div>

      {/* Two-column responsive */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 320px) 1fr',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        {/* Left: service list */}
        <div
          style={{
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            maxHeight: 'calc(100vh - 260px)',
            overflowY: 'auto',
          }}
        >
          {SERVICES.map((s, i) => {
            const config = getServiceVariants(s.id);
            const hasPremium = !!config?.premium;
            const hasCustom = !!(
              config?.customCompatibleProductIds &&
              config.customCompatibleProductIds.length > 0
            );
            const overridden = overriddenServiceIds.includes(s.id);
            const active = selectedId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className="dsr-press"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: active ? T.bgAlt : 'transparent',
                  cursor: 'pointer',
                  borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 4,
                  textAlign: 'left',
                  position: 'relative',
                }}
              >
                <Body style={{ fontSize: 13, fontWeight: active ? 500 : 400 }}>
                  {lang === 'es' ? s.es : s.en}
                </Body>
                <Tiny
                  muted
                  style={{
                    fontFamily: T.mono,
                    fontSize: 10,
                    letterSpacing: 0.4,
                    textTransform: 'none',
                  }}
                >
                  {s.id} · {fmt(s.price)} · {hasPremium ? 'P' : '—'}{' '}
                  {hasCustom ? 'C' : '—'}
                </Tiny>
                {overridden && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
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

        {/* Right: editor */}
        <div>
          {selectedService && (
            <ServiceVariantEditor
              key={selectedService.id}
              serviceId={selectedService.id}
              serviceLabel={lang === 'es' ? selectedService.es : selectedService.en}
              servicePrice={selectedService.price}
              config={selectedConfig}
              onChange={(next) => setServiceVariants(selectedService.id, next)}
              T={T}
              lang={lang}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceVariantEditor({
  serviceId,
  serviceLabel,
  servicePrice,
  config,
  onChange,
  T,
  lang,
}: {
  serviceId: string;
  serviceLabel: string;
  servicePrice: number;
  config: MergedVariantConfig | null;
  onChange: (next: MergedVariantConfig | null) => void;
  T: ReturnType<typeof useTheme>;
  lang: 'es' | 'en';
}) {
  const { format: fmt } = useCurrency();
  const cfg: MergedVariantConfig = config ?? {};
  const hasPremium = !!cfg.premium;
  const hasCustom = !!(
    cfg.customCompatibleProductIds && cfg.customCompatibleProductIds.length > 0
  );

  const togglePremium = () => {
    if (hasPremium) {
      onChange({ ...cfg, premium: undefined });
    } else {
      onChange({
        ...cfg,
        premium: {
          addonProductIds: [],
          label_es: '',
          label_en: '',
        },
      });
    }
  };

  const togglePremiumAddon = (pid: string) => {
    if (!cfg.premium) return;
    const arr = cfg.premium.addonProductIds.includes(pid)
      ? cfg.premium.addonProductIds.filter((x) => x !== pid)
      : [...cfg.premium.addonProductIds, pid];
    onChange({ ...cfg, premium: { ...cfg.premium, addonProductIds: arr } });
  };

  const toggleCustomCompatible = (pid: string) => {
    const cur = cfg.customCompatibleProductIds ?? [];
    const arr = cur.includes(pid)
      ? cur.filter((x) => x !== pid)
      : [...cur, pid];
    onChange({ ...cfg, customCompatibleProductIds: arr });
  };

  const updatePremiumLabel = (key: 'label_es' | 'label_en', value: string) => {
    if (!cfg.premium) return;
    onChange({ ...cfg, premium: { ...cfg.premium, [key]: value } });
  };

  return (
    <div
      style={{
        background: T.surface,
        boxShadow: `inset 0 0 0 1px ${T.line}`,
        padding: 24,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <Tiny
            muted
            style={{
              fontFamily: T.mono,
              fontSize: 10,
              letterSpacing: 0.4,
              textTransform: 'none',
            }}
          >
            {serviceId}
          </Tiny>
          <H1 style={{ marginTop: 4, fontSize: 22 }}>{serviceLabel}</H1>
          <Tiny
            style={{
              color: T.gold,
              fontFamily: T.serif,
              fontStyle: 'italic',
              fontSize: 16,
              marginTop: 4,
              display: 'block',
            }}
          >
            {fmt(servicePrice)}
          </Tiny>
        </div>
        <button
          onClick={() => onChange(null)}
          className="dsr-press"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '6px 0',
            color: T.textFaint,
            fontFamily: T.mono,
            fontSize: 10,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {lang === 'es' ? 'reset servicio' : 'reset service'}
        </button>
      </div>

      <Divider />

      {/* Premium toggle */}
      <div style={{ marginTop: 20 }}>
        <ToggleRow
          label={lang === 'es' ? 'Activar Premium' : 'Enable Premium'}
          checked={hasPremium}
          onToggle={togglePremium}
          T={T}
        />
      </div>

      {hasPremium && cfg.premium && (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}
        >
          <LabeledInput
            label={lang === 'es' ? 'Caption Premium (ES)' : 'Premium caption (ES)'}
            value={cfg.premium.label_es}
            onChange={(v) => updatePremiumLabel('label_es', v)}
            T={T}
          />
          <LabeledInput
            label={lang === 'es' ? 'Caption Premium (EN)' : 'Premium caption (EN)'}
            value={cfg.premium.label_en}
            onChange={(v) => updatePremiumLabel('label_en', v)}
            T={T}
          />
          <Tiny
            muted
            style={{ fontSize: 9, letterSpacing: 1.2, marginTop: 4, display: 'block' }}
          >
            {lang === 'es' ? 'ADDONS PREMIUM' : 'PREMIUM ADDONS'}
          </Tiny>
          <ProductGrid
            selectedIds={cfg.premium.addonProductIds}
            onToggle={togglePremiumAddon}
            T={T}
            lang={lang}
          />
        </div>
      )}

      <Divider style={{ margin: '24px 0' }} />

      {/* Custom toggle — la activación visual del chip Custom requiere ≥1 compatible. */}
      <div>
        <ToggleRow
          label={
            lang === 'es' ? 'Activar Personalizado' : 'Enable Custom'
          }
          checked={hasCustom}
          onToggle={() => {
            if (hasCustom) onChange({ ...cfg, customCompatibleProductIds: [] });
            else
              onChange({
                ...cfg,
                customCompatibleProductIds: cfg.customCompatibleProductIds ?? [],
              });
          }}
          T={T}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        <Tiny
          muted
          style={{
            fontSize: 9,
            letterSpacing: 1.2,
            marginBottom: 10,
            display: 'block',
          }}
        >
          {lang === 'es' ? 'PRODUCTOS COMPATIBLES' : 'COMPATIBLE PRODUCTS'}
        </Tiny>
        <ProductGrid
          selectedIds={cfg.customCompatibleProductIds ?? []}
          onToggle={toggleCustomCompatible}
          T={T}
          lang={lang}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onToggle,
  T,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  T: ReturnType<typeof useTheme>;
}) {
  return (
    <button
      onClick={onToggle}
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
      <Body style={{ fontSize: 14 }}>{label}</Body>
      <div
        aria-pressed={checked}
        style={{
          width: 38,
          height: 22,
          borderRadius: 999,
          background: checked ? T.gold : T.bgAlt,
          boxShadow: `inset 0 0 0 1px ${checked ? T.gold : T.lineStrong}`,
          position: 'relative',
          transition: 'background .2s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: checked ? T.bg : T.textMuted,
            transition: 'left .2s, background .2s',
          }}
        />
      </div>
    </button>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  T,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  T: ReturnType<typeof useTheme>;
}) {
  return (
    <div>
      <Tiny
        muted
        style={{
          fontSize: 9,
          letterSpacing: 1.2,
          marginBottom: 4,
          display: 'block',
        }}
      >
        {label.toUpperCase()}
      </Tiny>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: T.bgAlt,
          border: 'none',
          boxShadow: `inset 0 0 0 1px ${T.line}`,
          color: T.text,
          fontFamily: T.sans,
          fontSize: 13,
          outline: 'none',
        }}
      />
    </div>
  );
}

function ProductGrid({
  selectedIds,
  onToggle,
  T,
  lang,
}: {
  selectedIds: string[];
  onToggle: (pid: string) => void;
  T: ReturnType<typeof useTheme>;
  lang: 'es' | 'en';
}) {
  const { format: fmt } = useCurrency();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 8,
      }}
    >
      {PRODUCTS.map((p) => {
        const sel = selectedIds.includes(p.id);
        return (
          <button
            key={p.id}
            onClick={() => onToggle(p.id)}
            className="dsr-press"
            style={{
              background: sel ? `${T.gold}1A` : T.bgAlt,
              border: 'none',
              padding: '10px 12px',
              cursor: 'pointer',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              textAlign: 'left',
              boxShadow: `inset 0 0 0 1px ${sel ? T.gold : T.line}`,
              transition: 'box-shadow .15s, background .15s',
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
              <Body
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {lang === 'es' ? p.name_es : p.name_en}
              </Body>
              <Tiny
                muted
                style={{
                  fontFamily: T.mono,
                  fontSize: 10,
                  letterSpacing: 0.4,
                  textTransform: 'none',
                }}
              >
                {p.id} · {fmt(p.price)}
              </Tiny>
            </div>
          </button>
        );
      })}
    </div>
  );
}
