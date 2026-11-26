-- ============================================================================
-- CondoLeve v1.2: Suporte a Proprietário Não-Morador + Inquilino na Mesma
-- Unidade e Sucessão Segura de Síndico (Passagem de Bastão)
-- ============================================================================

-- 1. Diferencia quem é Proprietário vs Inquilino dentro da mesma unidade
alter table if exists public.vinculos
  add column if not exists tipo_ocupante text not null default 'proprietario'
  check (tipo_ocupante in ('proprietario', 'inquilino'));

-- 2. RPC para o síndico atual transferir a administração para outro membro
create or replace function public.transferir_sindico_condominio(
  p_condominio_id uuid,
  p_novo_sindico_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_target_vinculo record;
begin
  if not public.is_condo_admin(p_condominio_id) then
    raise exception 'Apenas o síndico atual pode transferir a administração.';
  end if;

  if p_novo_sindico_user_id = v_uid then
    raise exception 'Você já é o síndico deste condomínio.';
  end if;

  select * into v_target_vinculo
  from public.vinculos
  where condominio_id = p_condominio_id
    and user_id = p_novo_sindico_user_id
  limit 1;

  if not found then
    raise exception 'O novo síndico precisa estar vinculado ao condomínio antes da transferência.';
  end if;

  -- Promove o novo síndico e rebaixa o antigo para morador (ou conselheiro se não tiver unidade)
  update public.vinculos
  set role = 'sindico'
  where id = v_target_vinculo.id;

  update public.vinculos
  set role = case when unidade_id is not null then 'morador' else 'conselheiro' end
  where condominio_id = p_condominio_id
    and user_id = v_uid
    and role in ('sindico', 'admin');

  update public.condominios
  set created_by = p_novo_sindico_user_id
  where id = p_condominio_id;

  insert into public.audit_logs (condominio_id, user_id, tabela, operacao, registro_id, dados_novos)
  values (
    p_condominio_id,
    v_uid,
    'vinculos',
    'TRANSFERENCIA_SINDICO',
    p_condominio_id::text,
    jsonb_build_object('de', v_uid, 'para', p_novo_sindico_user_id)
  );

  return true;
end;
$$;
