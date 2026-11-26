-- ============================================================================
-- CondoLeve: Ajusta limite realista do plano Trial/Pro para 30 unidades
-- (Condomínios maiores contratam plano Sob Encomenda)
-- ============================================================================

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
    v_max := 30; -- Durante criação inicial (Trial)
  elsif v_sub.plano = 'pro' and v_sub.status = 'ativo' then
    v_max := 30; -- Acima de 30 unidades: plano personalizado sob encomenda
  elsif v_sub.plano = 'trial' and v_sub.trial_ate > timezone('utc', now()) then
    v_max := 30;
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
