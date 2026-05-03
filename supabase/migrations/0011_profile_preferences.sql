-- DSR Maison — preferencias de UI persistidas en profile
-- Hoy theme y lang viven sólo en localStorage; cambiar de device pierde la
-- preferencia. Estas columnas mantienen sync server-side.
--
-- Defaults coinciden con los del frontend: 'noir' theme + 'es' lang.

alter table profiles
  add column if not exists theme text not null default 'noir'
    check (theme in ('noir', 'marbre'));

alter table profiles
  add column if not exists preferred_lang text not null default 'es'
    check (preferred_lang in ('es', 'en'));

-- No hace falta nuevas RLS policies: profiles_update_own (0003 + hardening
-- en 0006) ya permite a cada user editar sus propias columnas. Las nuevas
-- columnas heredan ese mismo control.
