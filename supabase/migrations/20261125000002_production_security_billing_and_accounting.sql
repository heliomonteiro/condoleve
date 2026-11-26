-- ============================================================================
-- CondoLeve v1.0 (Produção): Zero-Trust Multi-Tenant, LGPD, Planos,
-- Histórico Contábil, Votação Auditável, Convites Seguros e Audit Log
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. FUNÇÕES AUXILIARES SECURITY DEFINER (Evitam recursão RLS 42P17 e aceleram queries)
-- ----------------------------------------------------------------------------
create or replace function public.is_condo_member(p_condo_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.vinculos v
    where v.condominio_id = p_condo_id
      and v.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.condominios c
    where c.id = p_condo_id
      and c.created_by = auth.uid()
  );
$$;

create or replace function public.is_condo_admin(p_condo_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.vinculos v
    where v.condominio_id = p_condo_id
      and v.user_id = auth.uid()
      and v.role in ('sindico', 'admin')
  )
  or exists (
    select 1
    from public.condominios c
    where c.id = p_condo_id
      and c.created_by = auth.uid()
  );
$$;

create or replace function public.can_view_condo_finances(p_condo_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.vinculos v
    where v.condominio_id = p_condo_id
      and v.user_id = auth.uid()
      and v.role in ('sindico', 'admin', 'conselheiro')
  )
  or exists (
    select 1
    from public.condominios c
    where c.id = p_condo_id
      and c.created_by = auth.uid()
  );
$$;

create or replace function public.my_condo_unit_ids(p_condo_id uuid)
returns setof bigint
language sql
security definer
stable
set search_path = public
as $$
  select v.unidade_id
  from public.vinculos v
  where v.condominio_id = p_condo_id
    and v.user_id = auth.uid()
    and v.unidade_id is not null;
$$;

-- ----------------------------------------------------------------------------
-- 2. EVOLUÇÃO DE COLUNAS E ÍNDICES DE ESCALA NAS TABELAS EXISTENTES
-- ----------------------------------------------------------------------------
alter table if exists public.unidades
  add column if not exists isento_taxa boolean not null default false,
  add column if not exists invite_token text default encode(gen_random_bytes(12), 'hex');

create unique index if not exists idx_unidades_invite_token
  on public.unidades(invite_token)
  where invite_token is not null;

create index if not exists idx_vinculos_user_condo on public.vinculos(user_id, condominio_id);
create index if not exists idx_unidades_condo on public.unidades(condominio_id);
create index if not exists idx_pagamentos_condo_periodo on public.pagamentos(condominio_id, ano, mes);
create index if not exists idx_pagamentos_unidade on public.pagamentos(unidade_id);
create index if not exists idx_despesas_condo_periodo on public.despesas(condominio_id, ano, mes);
create index if not exists idx_avisos_condo on public.avisos(condominio_id);
create index if not exists idx_zeladoria_condo on public.zeladoria(condominio_id);
create index if not exists idx_enquetes_condo on public.enquetes(condominio_id);

-- ----------------------------------------------------------------------------
-- 3. TABELA DE PLANOS E COTAS (Sustentabilidade Free vs. Trial vs. Pro)
-- ----------------------------------------------------------------------------
create table if not exists public.assinaturas_condominio (
  condominio_id uuid primary key references public.condominios(id) on delete cascade,
  plano text not null default 'trial' check (plano in ('free', 'trial', 'pro')),
  status text not null default 'ativo' check (status in ('ativo', 'atrasado', 'cancelado')),
  trial_ate timestamptz not null default (timezone('utc', now()) + interval '30 days'),
  ciclo_mes text not null default to_char(timezone('utc', now()), 'YYYY-MM'),
  creditos_ia_usados integer not null default 0 check (creditos_ia_usados >= 0),
  arquivos_mes_usados integer not null default 0 check (arquivos_mes_usados >= 0),
  gateway_customer_id text,
  gateway_subscription_id text,
  atualizado_em timestamptz not null default timezone('utc', now())
);

alter table public.assinaturas_condominio enable row level security;

drop policy if exists "Membros consultam plano do condominio" on public.assinaturas_condominio;
create policy "Membros consultam plano do condominio" on public.assinaturas_condominio
  for select to authenticated
  using (public.is_condo_member(condominio_id));

-- Nenhuma policy de INSERT/UPDATE/DELETE para clientes comuns: somente RPCs/Edge Functions/Webhooks alteram planos!
revoke all on public.assinaturas_condominio from anon;
grant select on public.assinaturas_condominio to authenticated;

-- Backfill para condomínios já existentes
insert into public.assinaturas_condominio (condominio_id, plano, status)
select id, 'trial', 'ativo'
from public.condominios
on conflict (condominio_id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. HISTÓRICO DE VIGÊNCIA DE TAXA CONDOMINIAL (Impede corromper meses passados)
-- ----------------------------------------------------------------------------
create table if not exists public.historico_taxas (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references public.condominios(id) on delete cascade,
  competencia_inicio text not null, -- Formato YYYY-MM (ex: '2026-11')
  valor numeric(12, 2) not null check (valor >= 0),
  criado_em timestamptz not null default timezone('utc', now()),
  unique (condominio_id, competencia_inicio)
);

alter table public.historico_taxas enable row level security;

drop policy if exists "Membros veem historico de taxas" on public.historico_taxas;
create policy "Membros veem historico de taxas" on public.historico_taxas
  for select to authenticated
  using (public.is_condo_member(condominio_id));

drop policy if exists "Sindico gerencia historico de taxas" on public.historico_taxas;
create policy "Sindico gerencia historico de taxas" on public.historico_taxas
  for all to authenticated
  using (public.is_condo_admin(condominio_id))
  with check (public.is_condo_admin(condominio_id));

-- ----------------------------------------------------------------------------
-- 5. VOTAÇÃO AUDITÁVEL (1 Voto por Unidade, Zero Race Condition)
-- ----------------------------------------------------------------------------
create table if not exists public.enquete_votos (
  enquete_id bigint not null references public.enquetes(id) on delete cascade,
  unidade_id bigint not null references public.unidades(id) on delete cascade,
  condominio_id uuid not null references public.condominios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  opcao text not null check (opcao in ('sim', 'nao')),
  votado_em timestamptz not null default timezone('utc', now()),
  primary key (enquete_id, unidade_id)
);

alter table public.enquete_votos enable row level security;

drop policy if exists "Membros veem votos do condominio" on public.enquete_votos;
create policy "Membros veem votos do condominio" on public.enquete_votos
  for select to authenticated
  using (public.is_condo_member(condominio_id));

-- ----------------------------------------------------------------------------
-- 6. REFORÇO ZERO-TRUST DAS POLICIES EXISTENTES (Fecha Escalação e Vazamento LGPD)
-- ----------------------------------------------------------------------------

-- 6.1 vinculos (Fecha brecha onde qualquer usuário se inseria como síndico!)
drop policy if exists "Ve proprio vinculo ou sindico ve do condominio" on public.vinculos;
drop policy if exists "Cria proprio vinculo ou sindico cria para outro" on public.vinculos;
drop policy if exists "Sindico atualiza vinculos do condominio" on public.vinculos;
drop policy if exists "Sindico remove vinculos do condominio" on public.vinculos;

create policy "Leitura segura de vinculos" on public.vinculos
  for select to authenticated
  using (auth.uid() = user_id or public.can_view_condo_finances(condominio_id));

create policy "Apenas sindico cria vinculos" on public.vinculos
  for insert to authenticated
  with check (public.is_condo_admin(condominio_id));

create policy "Apenas sindico atualiza vinculos" on public.vinculos
  for update to authenticated
  using (public.is_condo_admin(condominio_id))
  with check (public.is_condo_admin(condominio_id));

create policy "Apenas sindico remove vinculos" on public.vinculos
  for delete to authenticated
  using (public.is_condo_admin(condominio_id));

-- 6.2 unidades (LGPD: morador vê APENAS sua própria unidade; síndico/conselheiro vê todas)
drop policy if exists "Membros veem unidades do condominio" on public.unidades;
drop policy if exists "Sindico escreve unidades" on public.unidades;

create policy "Leitura LGPD de unidades" on public.unidades
  for select to authenticated
  using (
    public.can_view_condo_finances(condominio_id)
    or linked_user_id = auth.uid()
    or id in (select public.my_condo_unit_ids(condominio_id))
  );

create policy "Sindico escreve unidades" on public.unidades
  for all to authenticated
  using (public.is_condo_admin(condominio_id))
  with check (public.is_condo_admin(condominio_id));

-- 6.3 pagamentos (LGPD: morador vê APENAS seus próprios pagamentos/recibos)
drop policy if exists "Membros veem pagamentos do condominio" on public.pagamentos;
drop policy if exists "Sindico escreve pagamentos" on public.pagamentos;

create policy "Leitura LGPD de pagamentos" on public.pagamentos
  for select to authenticated
  using (
    public.can_view_condo_finances(condominio_id)
    or unidade_id in (select public.my_condo_unit_ids(condominio_id))
  );

create policy "Sindico escreve pagamentos" on public.pagamentos
  for all to authenticated
  using (public.is_condo_admin(condominio_id))
  with check (public.is_condo_admin(condominio_id));

-- 6.4 enquetes (Remove UPDATE direto por moradores; votação ocorre via RPC votar_enquete)
drop policy if exists "Membros votam ou sindico edita enquete" on public.enquetes;
create policy "Sindico atualiza enquetes" on public.enquetes
  for update to authenticated
  using (public.is_condo_admin(condominio_id))
  with check (public.is_condo_admin(condominio_id));

-- 6.5 Storage isolado por pasta <condominio_id>/... para escrita e deleção
drop policy if exists "Comprovantes: escrita autenticada" on storage.objects;
drop policy if exists "Comprovantes: update autenticado" on storage.objects;
drop policy if exists "Comprovantes: delete autenticado" on storage.objects;

create policy "Comprovantes: upload isolado por condominio" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'comprovantes'
    and (storage.foldername(name))[1] is not null
    and public.is_condo_member(((storage.foldername(name))[1])::uuid)
  );

create policy "Comprovantes: delete apenas sindico do condominio" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'comprovantes'
    and (storage.foldername(name))[1] is not null
    and public.is_condo_admin(((storage.foldername(name))[1])::uuid)
  );

-- ----------------------------------------------------------------------------
-- 7. TRILHA DE AUDITORIA IMUTÁVEL (Transparência p/ Assembleia e Sucessão)
-- ----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid,
  user_id uuid,
  tabela text not null,
  operacao text not null,
  registro_id text,
  dados_antigos jsonb,
  dados_novos jsonb,
  criado_em timestamptz not null default timezone('utc', now())
);

alter table public.audit_logs enable row level security;

create policy "Sindico e conselho consultam auditoria" on public.audit_logs
  for select to authenticated
  using (condominio_id is not null and public.can_view_condo_finances(condominio_id));

create or replace function public.fn_registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_condo_id uuid;
  v_reg_id text;
begin
  if (TG_OP = 'DELETE') then
    v_condo_id := OLD.condominio_id;
    v_reg_id := OLD.id::text;
    insert into public.audit_logs (condominio_id, user_id, tabela, operacao, registro_id, dados_antigos)
    values (v_condo_id, auth.uid(), TG_TABLE_NAME, TG_OP, v_reg_id, to_jsonb(OLD));
    return OLD;
  else
    v_condo_id := NEW.condominio_id;
    v_reg_id := NEW.id::text;
    insert into public.audit_logs (condominio_id, user_id, tabela, operacao, registro_id, dados_antigos, dados_novos)
    values (v_condo_id, auth.uid(), TG_TABLE_NAME, TG_OP, v_reg_id, case when TG_OP = 'UPDATE' then to_jsonb(OLD) else null end, to_jsonb(NEW));
    return NEW;
  end if;
end;
$$;

drop trigger if exists trg_audit_pagamentos on public.pagamentos;
create trigger trg_audit_pagamentos
  after insert or update or delete on public.pagamentos
  for each row execute function public.fn_registrar_auditoria();

drop trigger if exists trg_audit_despesas on public.despesas;
create trigger trg_audit_despesas
  after insert or update or delete on public.despesas
  for each row execute function public.fn_registrar_auditoria();

-- ----------------------------------------------------------------------------
-- 8. RPCs ATÔMICAS DE NEGÓCIO (Onboarding, Votação, Cota de Upload e Resumo Morador)
-- ----------------------------------------------------------------------------

-- 8.1 Criação Transacional Completa do Condomínio no SetupWizard
create or replace function public.criar_condominio_completo(
  p_nome text,
  p_config jsonb,
  p_unidades text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_condo_id uuid;
  v_vinculo record;
  v_valor_taxa numeric(12,2);
  v_inicio_op text;
begin
  if v_uid is null then
    raise exception 'Usuário não autenticado';
  end if;

  if coalesce(trim(p_nome), '') = '' then
    raise exception 'Informe o nome do condomínio';
  end if;

  if array_length(p_unidades, 1) is null or array_length(p_unidades, 1) = 0 then
    raise exception 'Informe ao menos uma unidade';
  end if;

  insert into public.condominios (nome, created_by)
  values (trim(p_nome), v_uid)
  returning id into v_condo_id;

  insert into public.vinculos (user_id, condominio_id, role)
  values (v_uid, v_condo_id, 'sindico')
  returning id, role, condominio_id into v_vinculo;

  insert into public.config_geral (condominio_id, user_id, dados)
  values (v_condo_id, v_uid, p_config);

  insert into public.assinaturas_condominio (condominio_id, plano, status)
  values (v_condo_id, 'trial', 'ativo');

  v_valor_taxa := coalesce((p_config->>'valorCondominio')::numeric, 0);
  v_inicio_op := coalesce(p_config->>'inicioOperacao', to_char(timezone('utc', now()), 'YYYY-MM'));

  insert into public.historico_taxas (condominio_id, competencia_inicio, valor)
  values (v_condo_id, v_inicio_op, v_valor_taxa)
  on conflict do nothing;

  insert into public.unidades (user_id, condominio_id, numero, proprietario, inquilino, mora_proprietario, isento_taxa)
  select v_uid, v_condo_id, trim(u), '{}'::jsonb, '{}'::jsonb, true, false
  from unnest(p_unidades) as u
  where trim(u) <> '';

  return jsonb_build_object(
    'id', v_vinculo.id,
    'role', v_vinculo.role,
    'condominio_id', v_condo_id,
    'condominios', jsonb_build_object('nome', trim(p_nome))
  );
end;
$$;

-- 8.2 Votação Atômica e Auditável (Impede voto duplo ou adulteração de placar)
create or replace function public.votar_enquete(
  p_enquete_id bigint,
  p_unidade_id bigint,
  p_opcao text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_enquete record;
  v_sim int;
  v_nao int;
  v_detalhes jsonb;
  v_votaram jsonb;
  v_novo_opcoes jsonb;
begin
  if p_opcao not in ('sim', 'nao') then
    raise exception 'Opção de voto inválida';
  end if;

  select * into v_enquete from public.enquetes where id = p_enquete_id for update;
  if not found or not v_enquete.ativa then
    raise exception 'Enquete não encontrada ou já encerrada';
  end if;

  -- Verifica se o usuário é morador vinculado à unidade ou síndico do condomínio
  if not (
    public.is_condo_admin(v_enquete.condominio_id)
    or p_unidade_id in (select public.my_condo_unit_ids(v_enquete.condominio_id))
  ) then
    raise exception 'Sem permissão para votar por esta unidade';
  end if;

  insert into public.enquete_votos (enquete_id, unidade_id, condominio_id, user_id, opcao, votado_em)
  values (p_enquete_id, p_unidade_id, v_enquete.condominio_id, v_uid, p_opcao, timezone('utc', now()))
  on conflict (enquete_id, unidade_id)
  do update set opcao = excluded.opcao, user_id = excluded.user_id, votado_em = excluded.votado_em;

  select
    count(*) filter (where opcao = 'sim'),
    count(*) filter (where opcao = 'nao'),
    coalesce(jsonb_object_agg(unidade_id::text, opcao), '{}'::jsonb),
    coalesce(jsonb_agg(unidade_id::text), '[]'::jsonb)
  into v_sim, v_nao, v_detalhes, v_votaram
  from public.enquete_votos
  where enquete_id = p_enquete_id;

  v_novo_opcoes := coalesce(v_enquete.opcoes, '{}'::jsonb) || jsonb_build_object(
    'sim', v_sim,
    'nao', v_nao,
    'votosDetalhados', v_detalhes,
    'votaram', v_votaram
  );

  update public.enquetes set opcoes = v_novo_opcoes where id = p_enquete_id;
  return v_novo_opcoes;
end;
$$;

-- 8.3 Controle e Contabilização de Cota de Upload por Plano (Protege Storage Free)
create or replace function public.consumir_cota_upload(p_condominio_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub record;
  v_mes_atual text := to_char(timezone('utc', now()), 'YYYY-MM');
  v_limite int := 0;
begin
  if not public.is_condo_member(p_condominio_id) then
    raise exception 'Acesso negado ao condomínio';
  end if;

  insert into public.assinaturas_condominio (condominio_id)
  values (p_condominio_id)
  on conflict (condominio_id) do nothing;

  select * into v_sub
  from public.assinaturas_condominio
  where condominio_id = p_condominio_id
  for update;

  -- Reseta contador automaticamente quando vira o mês
  if v_sub.ciclo_mes <> v_mes_atual then
    update public.assinaturas_condominio
    set ciclo_mes = v_mes_atual,
        arquivos_mes_usados = 0,
        creditos_ia_usados = 0
    where condominio_id = p_condominio_id
    returning * into v_sub;
  end if;

  if v_sub.plano = 'pro' and v_sub.status = 'ativo' then
    v_limite := 500;
  elsif v_sub.plano = 'trial' and v_sub.trial_ate > timezone('utc', now()) then
    v_limite := 30;
  else
    v_limite := 0; -- Plano Free não consome Storage de arquivos
  end if;

  if v_sub.arquivos_mes_usados >= v_limite then
    return false;
  end if;

  update public.assinaturas_condominio
  set arquivos_mes_usados = arquivos_mes_usados + 1,
      atualizado_em = timezone('utc', now())
  where condominio_id = p_condominio_id;

  return true;
end;
$$;
