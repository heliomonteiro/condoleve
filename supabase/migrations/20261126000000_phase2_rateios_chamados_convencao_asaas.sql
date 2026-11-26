-- ============================================================================
-- CondoLeve Fase 2: Rateios/Cotas Extras, Status/Resposta em Chamados e
-- Preparação de Suporte a Webhooks Asaas
-- ============================================================================

-- 1. Evolução da tabela zeladoria (Chamados com status intermediário e resposta)
alter table if exists public.zeladoria
  add column if not exists status text not null default 'aberto'
    check (status in ('aberto', 'em_andamento', 'concluido')),
  add column if not exists resposta_sindico text,
  add column if not exists atualizado_em timestamptz default timezone('utc', now());

-- Sincroniza registros existentes já concluídos
update public.zeladoria
set status = case when concluido = true then 'concluido' else 'aberto' end
where status = 'aberto' and concluido = true;

-- 2. Tabela de Rateios / Cotas Extras (Ordinária vs Extraordinária)
create table if not exists public.rateios_extras (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references public.condominios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text not null,
  valor_total numeric(12,2) not null check (valor_total > 0),
  valor_por_unidade numeric(12,2) not null check (valor_por_unidade > 0),
  mes text not null,
  ano integer not null,
  tipo_cobranca text not null default 'extraordinaria'
    check (tipo_cobranca in ('ordinaria', 'extraordinaria')),
  incluir_isentos boolean not null default false,
  criado_em timestamptz not null default timezone('utc', now())
);

create index if not exists idx_rateios_condo_periodo
  on public.rateios_extras(condominio_id, ano, mes);

alter table public.rateios_extras enable row level security;

drop policy if exists "Membros veem rateios do condominio" on public.rateios_extras;
create policy "Membros veem rateios do condominio" on public.rateios_extras
  for select to authenticated
  using (public.is_condo_member(condominio_id));

drop policy if exists "Sindico gerencia rateios" on public.rateios_extras;
create policy "Sindico gerencia rateios" on public.rateios_extras
  for all to authenticated
  using (public.is_condo_admin(condominio_id))
  with check (public.is_condo_admin(condominio_id));
