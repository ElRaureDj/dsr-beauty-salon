// DSR Admin — Audit log.
// Lista las acciones recientes capturadas por triggers en tablas críticas
// (salon_settings, tier_rules). Read-only. RLS admin-only via 0019.
//
// Cada row muestra qué pasó (insert/update/delete), quién (email del
// actor), cuándo, y un diff resumido del cambio (campos que difieren).

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../theme/ThemeProvider';
import { useI18n } from '../../i18n/LangProvider';
import { Body, Eyebrow, H1, Tiny } from '../../components/atoms';
import { fetchAuditLog, type AuditLogEntry } from '../../lib/db';

function diffSummary(entry: AuditLogEntry): Array<{ key: string; before?: unknown; after?: unknown }> {
  if (entry.action === 'insert' && entry.after && typeof entry.after === 'object') {
    return Object.entries(entry.after as Record<string, unknown>)
      .filter(([k]) => !['created_at', 'updated_at'].includes(k))
      .slice(0, 5)
      .map(([key, after]) => ({ key, after }));
  }
  if (entry.action === 'delete' && entry.before && typeof entry.before === 'object') {
    return Object.entries(entry.before as Record<string, unknown>)
      .filter(([k]) => !['created_at', 'updated_at'].includes(k))
      .slice(0, 5)
      .map(([key, before]) => ({ key, before }));
  }
  if (entry.action === 'update' && entry.before && entry.after) {
    const before = entry.before as Record<string, unknown>;
    const after = entry.after as Record<string, unknown>;
    const diffs: Array<{ key: string; before?: unknown; after?: unknown }> = [];
    for (const key of Object.keys(after)) {
      if (key === 'updated_at' || key === 'created_at') continue;
      if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        diffs.push({ key, before: before[key], after: after[key] });
      }
    }
    return diffs;
  }
  return [];
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 60);
  return String(v).slice(0, 60);
}

export function AuditLogSection() {
  const T = useTheme();
  const { lang } = useI18n();
  const [filterAction, setFilterAction] = useState<'all' | 'insert' | 'update' | 'delete'>('all');

  const { data = [], isLoading, isError, error } = useQuery({
    queryKey: ['audit-log'],
    queryFn: () => fetchAuditLog(200),
    staleTime: 10_000,
  });

  const filtered =
    filterAction === 'all' ? data : data.filter((e) => e.action === filterAction);

  const actionColor = (a: AuditLogEntry['action']) =>
    a === 'insert' ? T.gold : a === 'delete' ? T.rouge : T.text;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Eyebrow>{lang === 'es' ? 'Otros' : 'Other'}</Eyebrow>
        <H1 style={{ marginTop: 8, fontSize: 32, fontStyle: 'italic' }}>
          {lang === 'es' ? 'Registro de cambios' : 'Audit log'}
        </H1>
        <Body muted style={{ marginTop: 8, fontSize: 13, maxWidth: 540 }}>
          {lang === 'es'
            ? 'Quién cambió qué y cuándo, en tablas críticas (configuración del salón, reglas de tier). Append-only — nadie puede editar el registro.'
            : 'Who changed what and when, on critical tables (salon settings, tier rules). Append-only — no one can edit the log.'}
        </Body>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {(['all', 'insert', 'update', 'delete'] as const).map((a) => (
          <button
            key={a}
            onClick={() => setFilterAction(a)}
            className="dsr-press"
            style={{
              padding: '6px 14px',
              border: 'none',
              cursor: 'pointer',
              background: filterAction === a ? T.gold : 'transparent',
              color: filterAction === a ? T.bg : T.textMuted,
              boxShadow: `inset 0 0 0 1px ${filterAction === a ? T.gold : T.line}`,
              fontFamily: T.sans,
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
            }}
          >
            {a === 'all'
              ? lang === 'es'
                ? 'Todas'
                : 'All'
              : a}
          </button>
        ))}
      </div>

      {isError ? (
        <Body style={{ color: T.rouge, fontSize: 13 }}>
          {lang === 'es' ? 'Error al cargar el log:' : 'Error loading log:'}{' '}
          {error instanceof Error ? error.message : String(error)}
        </Body>
      ) : isLoading && data.length === 0 ? (
        <Body muted style={{ fontSize: 13 }}>
          {lang === 'es' ? 'Cargando...' : 'Loading...'}
        </Body>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: 28,
            background: T.surface,
            boxShadow: `inset 0 0 0 1px ${T.line}`,
            textAlign: 'center',
          }}
        >
          <Body muted style={{ fontSize: 13 }}>
            {lang === 'es' ? 'Sin entradas para este filtro.' : 'No entries for this filter.'}
          </Body>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((entry) => {
            const diffs = diffSummary(entry);
            return (
              <div
                key={entry.id}
                style={{
                  background: T.surface,
                  boxShadow: `inset 0 0 0 1px ${T.line}`,
                  padding: '14px 18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                    <Tiny
                      style={{
                        color: actionColor(entry.action),
                        letterSpacing: 1.4,
                        fontSize: 10,
                        fontWeight: 600,
                      }}
                    >
                      {entry.action.toUpperCase()}
                    </Tiny>
                    <Tiny
                      style={{
                        fontFamily: T.mono,
                        fontSize: 11,
                        letterSpacing: 0.3,
                        color: T.text,
                        textTransform: 'none',
                      }}
                    >
                      {entry.entityType}
                      {entry.entityId ? ` · ${entry.entityId}` : ''}
                    </Tiny>
                  </div>
                  <Tiny
                    muted
                    style={{
                      fontFamily: T.mono,
                      fontSize: 10,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                    }}
                  >
                    {new Date(entry.createdAt).toLocaleString(
                      lang === 'es' ? 'es-ES' : 'en-US',
                    )}
                  </Tiny>
                </div>

                <Tiny
                  muted
                  style={{
                    fontSize: 11,
                    letterSpacing: 0.3,
                    textTransform: 'none',
                    marginBottom: 8,
                  }}
                >
                  {entry.actorEmail ?? entry.actorUserId ?? (lang === 'es' ? 'sistema' : 'system')}
                </Tiny>

                {diffs.length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 10,
                      background: T.bg,
                      boxShadow: `inset 0 0 0 1px ${T.line}`,
                    }}
                  >
                    {diffs.map((d, i) => (
                      <div
                        key={d.key}
                        style={{
                          padding: '4px 0',
                          borderTop: i === 0 ? 'none' : `1px solid ${T.line}`,
                          display: 'grid',
                          gridTemplateColumns: '120px 1fr 1fr',
                          gap: 10,
                          fontFamily: T.mono,
                          fontSize: 11,
                          color: T.text,
                        }}
                      >
                        <span style={{ color: T.textMuted }}>{d.key}</span>
                        {entry.action === 'update' ? (
                          <>
                            <span style={{ color: T.rouge, opacity: 0.8 }}>
                              {formatValue(d.before)}
                            </span>
                            <span style={{ color: T.gold }}>{formatValue(d.after)}</span>
                          </>
                        ) : (
                          <span style={{ gridColumn: 'span 2', color: T.text }}>
                            {formatValue(entry.action === 'insert' ? d.after : d.before)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
