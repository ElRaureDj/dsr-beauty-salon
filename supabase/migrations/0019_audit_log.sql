-- DSR Maison — audit log para acciones admin.
-- Captura "quién cambió qué y cuándo" en tablas críticas. Triggers
-- automáticos en salon_settings y tier_rules (las más sensibles para
-- contabilidad / pricing). Para tablas con muchas rows como products
-- o services, el approach sería usar audit_log via RPC explícita en
-- el flow de admin — queda como follow-up.
--
-- El log es append-only desde el lado del cliente: nadie (ni admin)
-- puede UPDATE/DELETE rows. Solo SELECT (admin).

create table if not exists audit_log (
  id bigserial primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action text not null check (action in ('insert', 'update', 'delete')),
  entity_type text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_entity_idx on audit_log(entity_type, entity_id);
create index if not exists audit_log_created_idx on audit_log(created_at desc);

alter table audit_log enable row level security;

-- Solo admin lee. Inserts vienen via triggers SECURITY DEFINER (no RLS check).
drop policy if exists audit_log_admin_select on audit_log;
create policy audit_log_admin_select on audit_log
  for select using (is_admin());

-- ---------- Helper trigger function ----------
-- Captura el row antes/después en jsonb. Usa auth.uid() y un lookup a
-- profiles para obtener el email — útil cuando el actor ya no existe.

create or replace function audit_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_entity_id text;
  v_before jsonb;
  v_after jsonb;
  v_action text;
begin
  if v_actor is not null then
    select email into v_email from profiles where id = v_actor;
  end if;

  if tg_op = 'INSERT' then
    v_action := 'insert';
    v_after := to_jsonb(new);
    v_before := null;
  elsif tg_op = 'UPDATE' then
    v_action := 'update';
    v_after := to_jsonb(new);
    v_before := to_jsonb(old);
  else
    v_action := 'delete';
    v_after := null;
    v_before := to_jsonb(old);
  end if;

  -- Para tablas con id: text/uuid, intentamos extraer del jsonb.
  v_entity_id := coalesce(
    (v_after->>'id'),
    (v_before->>'id'),
    (v_after->>'tier_id'),
    (v_before->>'tier_id')
  );

  insert into audit_log (
    actor_user_id, actor_email, action, entity_type, entity_id, before, after
  ) values (
    v_actor, v_email, v_action, tg_table_name, v_entity_id, v_before, v_after
  );

  return coalesce(new, old);
end;
$$;

-- ---------- Triggers en tablas críticas ----------

drop trigger if exists salon_settings_audit on salon_settings;
create trigger salon_settings_audit
  after insert or update or delete on salon_settings
  for each row execute function audit_trigger();

drop trigger if exists tier_rules_audit on tier_rules;
create trigger tier_rules_audit
  after insert or update or delete on tier_rules
  for each row execute function audit_trigger();
