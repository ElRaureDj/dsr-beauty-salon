// DSR Admin — Inventario.
// Stock por producto + umbral de bajo stock. Edición inline.

import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Eyebrow, H1, Img, Tiny } from '../../components/atoms';
import { useCatalog } from '../../data/CatalogProvider';

export function InventorySection() {
  const T = useTheme();
  const { lang } = useI18n();
  const { getAllProducts, getStock, updateStock } = useCatalog();
  const products = getAllProducts();
  const lowCount = products.filter((p) => {
    const s = getStock(p.id);
    return s.stock <= s.lowStockAt;
  }).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 18, marginBottom: 24 }}>
        <div>
          <Eyebrow>{lang === 'es' ? 'Operación' : 'Operations'}</Eyebrow>
          <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
            {lang === 'es' ? 'Inventario' : 'Inventory'}
          </H1>
          <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
            {lang === 'es'
              ? 'Stock actual y umbral de alerta por producto. Edita en línea.'
              : 'Current stock and alert threshold per product. Inline edit.'}
          </Body>
        </div>
        <Tiny
          style={{
            padding: '8px 12px',
            background: lowCount > 0 ? `${T.rouge}22` : T.surface,
            boxShadow: `inset 0 0 0 1px ${lowCount > 0 ? T.rouge : T.line}`,
            color: lowCount > 0 ? T.rouge : T.text,
            fontFamily: T.mono,
            fontSize: 11,
            letterSpacing: 0.4,
            textTransform: 'none',
          }}
        >
          {lowCount} {lang === 'es' ? 'bajo stock' : 'low stock'}
        </Tiny>
      </div>

      <div style={{ background: T.surface, boxShadow: `inset 0 0 0 1px ${T.line}` }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '60px 1fr 100px 120px 120px',
            gap: 14,
            padding: '12px 18px',
            borderBottom: `1px solid ${T.line}`,
            alignItems: 'center',
          }}
        >
          <span />
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'PRODUCTO' : 'PRODUCT'}
          </Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>ID</Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>STOCK</Tiny>
          <Tiny muted style={{ fontFamily: T.mono, fontSize: 9, letterSpacing: 1.2 }}>
            {lang === 'es' ? 'ALERTA AT' : 'ALERT AT'}
          </Tiny>
        </div>
        {products.map((p) => {
          const stock = getStock(p.id);
          const isLow = stock.stock <= stock.lowStockAt;
          return (
            <div
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 100px 120px 120px',
                gap: 14,
                padding: '12px 18px',
                borderBottom: `1px solid ${T.line}`,
                alignItems: 'center',
                background: isLow ? `${T.rouge}10` : 'transparent',
              }}
            >
              <Img src={p.photo} style={{ width: 44, height: 56 }} />
              <div>
                <Body style={{ fontSize: 13, fontWeight: 500 }}>
                  {lang === 'es' ? p.name_es : p.name_en}
                </Body>
                <Tiny muted style={{ fontSize: 11, letterSpacing: 0.3, textTransform: 'none', marginTop: 2 }}>
                  {p.size}
                </Tiny>
              </div>
              <Tiny style={{ fontFamily: T.mono, fontSize: 11, color: T.textMuted }}>
                {p.id}
              </Tiny>
              <NumberInput
                value={stock.stock}
                onChange={(v) => updateStock(p.id, { stock: v })}
                T={T}
                highlight={isLow}
              />
              <NumberInput
                value={stock.lowStockAt}
                onChange={(v) => updateStock(p.id, { lowStockAt: v })}
                T={T}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  T,
  highlight,
}: {
  value: number;
  onChange: (v: number) => void;
  T: ReturnType<typeof useTheme>;
  highlight?: boolean;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n)) onChange(Math.max(0, n));
      }}
      style={{
        width: '100%',
        padding: '8px 10px',
        background: T.bgAlt,
        border: 'none',
        boxShadow: `inset 0 0 0 1px ${highlight ? T.rouge : T.line}`,
        color: highlight ? T.rouge : T.text,
        fontFamily: T.mono,
        fontSize: 13,
        outline: 'none',
        textAlign: 'right',
        fontWeight: highlight ? 600 : 400,
      }}
    />
  );
}
