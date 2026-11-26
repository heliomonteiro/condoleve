-- ============================================================================
-- CondoLeve v1.1: Blindagem Final de Constraints, Limite Server-Side de Plano,
-- Storage UUID-Safe e RPCs Atômicas de Aprovação e Reset
-- ============================================================================

-- 1. Validação segura de UUID no path do Storage (evita erro 22P02 de cast inválido)
create or replace function public.try_parse_uuid(p_text text)
returns uuid
language plpgsql
immutable
as $$
begin
  if p_text is null or p_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return null;
  end if;
  return p_text::uuid;
exception when others then
  return null;
end;
$$;

drop policy if exists "Comprovantes: upload isolado por condominio" on storage.objects;
create policy "Comprovantes: upload isolado por condominio" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'comprovantes'
    and public.try_parse_uuid((storage.foldername(name))[1]) is not null
    and public.is_condo_member(public.try_parse_uuid((storage.foldername(name))[1]))
  );

drop policy if exists "Comprovantes: delete apenas sindico do condominio" on storage.objects;
create policy "Comprovantes: delete apenas sindico do condominio" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'comprovantes'
    and public.try_parse_uuid((storage.foldername(name))[1]) is not null
    and public.is_condo_admin(public.try_parse_uuid((storage.foldername(name))[1]))
  );

-- 2. Constraints de Sanidade Financeira e Tamanho de Texto (Impede dados corrompidos ou abuso)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_pagamentos_valor_positivo') then
    alter table public.pagamentos
      add constraint chk_pagamentos_valor_positivo check (valor > 0 and valor <= 1000000) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_despesas_valor_positivo') then
    alter table public.despesas
      add constraint chk_despesas_valor_positivo check (valor > 0 and valor <= 10000000) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_vinculos_role_valido') then
    alter table public.vinculos
      add constraint chk_vinculos_role_valido check (role in ('sindico', 'admin', 'conselheiro', 'morador')) not valid;
  end if;
end $$;

-- 3. Trava Server-Side de Limite de Unidades por Plano (Impede burlar limite Free via DevTools)
create or replace function public.fn_check_unit_limit_by_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub record;
  v_count int;
  v_max int := 8;
begin
  select * into v_sub
  from public.assinaturas_condominio
  where condominio_id = NEW.condominio_id;

  if not found then
    v_max := 60; -- Durante criação inicial (Trial)
  elsif v_sub.plano = 'pro' and v_sub.status = 'ativo' then
    v_max := 120;
  elsif v_sub.plano = 'trial' and v_sub.trial_ate > timezone('utc', now()) then
    v_max := 60;
  else
    v_max := 8;
  end if;

  select count(*) into v_count
  from public.unidades
  where condominio_id = NEW.condominio_id;

  if v_count >= v_max then
    raise exception 'Limite de % unidades atingido para o plano atual deste condomínio.', v_max;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_check_unit_limit on public.unidades;
create trigger trg_check_unit_limit
  before insert on public.unidades
  for each row execute function public.fn_check_unit_limit_by_plan();

-- 4. RPC Atômica para Aprovação/Rejeição de Convite pelo Síndico
create or replace function public.processar_convite_condominio(
  p_convite_id uuid,
  p_aprovado boolean,
  p_role text default 'morador'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_convite record;
  v_unidade record;
begin
  if p_role not in ('morador', 'conselheiro') then
    raise exception 'Papel inválido para aprovação de convite.';
  end if;

  select * into v_convite
  from public.convites
  where id = p_convite_id
  for update;

  if not found then
    raise exception 'Convite não encontrado.';
  end if;

  if not public.is_condo_admin(v_convite.condominio_id) then
    raise exception 'Apenas o síndico pode aprovar ou rejeitar solicitações.';
  end if;

  if not p_aprovado then
    update public.convites set status = 'rejeitado' where id = p_convite_id;
    return jsonb_build_object('status', 'rejeitado');
  end if;

  select * into v_unidade
  from public.unidades
  where condominio_id = v_convite.condominio_id
    and numero = v_convite.numero_unidade
  limit 1;

  if v_unidade.id is null and p_role = 'morador' then
    raise exception 'Apartamento % não encontrado neste condomínio.', v_convite.numero_unidade;
  end if;

  if v_unidade.id is not null and p_role = 'morador' then
    update public.unidades
    set linked_user_id = v_convite.user_id
    where id = v_unidade.id;
  end if;

  insert into public.vinculos (user_id, condominio_id, role, unidade_id)
  values (v_convite.user_id, v_convite.condominio_id, p_role, v_unidade.id);

  update public.convites set status = 'aprovado' where id = p_convite_id;

  return jsonb_build_object(
    'status', 'aprovado',
    'unidade_id', v_unidade.id,
    'role', p_role
  );
end;
$$;

-- 5. RPC Atômica para Exclusão/Reset Completo do Condomínio (Evita órfãos no banco)
create or replace function public.excluir_condominio_completo(p_condominio_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_condo_admin(p_condominio_id) then
    raise exception 'Apenas o síndico titular pode excluir o condomínio.';
  end if;

  delete from public.pagamentos where condominio_id = p_condominio_id;
  delete from public.despesas where condominio_id = p_condominio_id;
  delete from public.enquete_votos where condominio_id = p_condominio_id;
  delete from public.enquetes where condominio_id = p_condominio_id;
  delete from public.avisos where condominio_id = p_condominio_id;
  delete from public.zeladoria where condominio_id = p_condominio_id;
  delete from public.convites where condominio_id = p_condominio_id;
  delete from public.historico_taxas where condominio_id = p_condominio_id;
  delete from public.unidades where condominio_id = p_condominio_id;
  delete from public.config_geral where condominio_id = p_condominio_id;
  delete from public.assinaturas_condominio where condominio_id = p_condominio_id;
  delete from public.vinculos where condominio_id = p_condominio_id;
  delete from public.condominios where id = p_condominio_id;

  return true;
end;
$$;
