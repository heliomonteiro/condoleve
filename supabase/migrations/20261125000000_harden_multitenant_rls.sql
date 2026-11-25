-- ============================================================
-- CondoLeve: fecha isolamento multi-tenant (RLS estava ABERTA)
-- ============================================================
-- Achado: policies "Acesso Total" (roles public/authenticated, qual=true)
-- permitiam que QUALQUER pessoa lesse/escrevesse/apagasse dados de
-- TODOS os condominios (financeiro, moradores, config, PIX).
-- Esta migration remove essas policies e recria o controle de acesso
-- em cima de public.vinculos (user_id + condominio_id + role).

-- ---------- 1. Tabela convites (substitui config_geral.dados.filaAprovacao) ----------
create table if not exists public.convites (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references public.condominios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  numero_unidade text not null,
  status text not null default 'pendente' check (status in ('pendente','aprovado','rejeitado')),
  criado_em timestamptz not null default timezone('utc', now())
);

alter table public.convites enable row level security;

create policy "Usuario cria seu proprio convite" on public.convites
  for insert to authenticated
  with check (auth.uid() = user_id and status = 'pendente');

create policy "Usuario ve seus proprios convites" on public.convites
  for select to authenticated
  using (auth.uid() = user_id);

create policy "Sindico gerencia convites do condominio" on public.convites
  for all to authenticated
  using (exists (
    select 1 from public.vinculos v
    where v.user_id = auth.uid() and v.condominio_id = convites.condominio_id and v.role in ('sindico','admin')
  ))
  with check (exists (
    select 1 from public.vinculos v
    where v.user_id = auth.uid() and v.condominio_id = convites.condominio_id and v.role in ('sindico','admin')
  ));

revoke all on public.convites from anon;
grant select, insert on public.convites to authenticated;

-- migra dados existentes da fila (config_geral.dados.filaAprovacao) para convites
insert into public.convites (condominio_id, user_id, email, numero_unidade, status, criado_em)
select
  cg.condominio_id,
  (item->>'userId')::uuid,
  item->>'email',
  item->>'numero',
  'pendente',
  timezone('utc', now())
from public.config_geral cg,
     jsonb_array_elements(coalesce(cg.dados->'filaAprovacao', '[]'::jsonb)) as item
where item->>'userId' is not null
  and (item->>'userId')::uuid in (select id from auth.users)
on conflict do nothing;

-- ---------- 2. condominios ----------
drop policy if exists "Permitir leitura de condomínio" on public.condominios;
drop policy if exists "Permitir update condominios" on public.condominios;
drop policy if exists "Permitir delete condominios" on public.condominios;

create policy "Membros veem seu condominio" on public.condominios
  for select to authenticated
  using (
    auth.uid() = created_by
    or exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = condominios.id)
  );

create policy "Sindico atualiza condominio" on public.condominios
  for update to authenticated
  using (auth.uid() = created_by or exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = condominios.id and v.role in ('sindico','admin')))
  with check (auth.uid() = created_by or exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = condominios.id and v.role in ('sindico','admin')));

create policy "Sindico deleta condominio" on public.condominios
  for delete to authenticated
  using (auth.uid() = created_by or exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = condominios.id and v.role in ('sindico','admin')));

-- ---------- 3. vinculos ----------
drop policy if exists "Acesso total logados vinculos" on public.vinculos;
drop policy if exists "Permitir leitura dos proprios vinculos" on public.vinculos;
drop policy if exists "Usuários veem seus próprios vínculos" on public.vinculos;
drop policy if exists "Permitir delete vinculos" on public.vinculos;
drop policy if exists "Permitir update vinculos" on public.vinculos;
drop policy if exists "Permitir que o usuario crie seu proprio vinculo" on public.vinculos;

create policy "Ve proprio vinculo ou sindico ve do condominio" on public.vinculos
  for select to authenticated
  using (
    auth.uid() = user_id
    or exists (select 1 from public.vinculos v2 where v2.user_id = auth.uid() and v2.condominio_id = vinculos.condominio_id and v2.role in ('sindico','admin'))
  );

create policy "Cria proprio vinculo ou sindico cria para outro" on public.vinculos
  for insert to authenticated
  with check (
    auth.uid() = user_id
    or exists (select 1 from public.vinculos v2 where v2.user_id = auth.uid() and v2.condominio_id = vinculos.condominio_id and v2.role in ('sindico','admin'))
  );

create policy "Sindico atualiza vinculos do condominio" on public.vinculos
  for update to authenticated
  using (exists (select 1 from public.vinculos v2 where v2.user_id = auth.uid() and v2.condominio_id = vinculos.condominio_id and v2.role in ('sindico','admin')))
  with check (exists (select 1 from public.vinculos v2 where v2.user_id = auth.uid() and v2.condominio_id = vinculos.condominio_id and v2.role in ('sindico','admin')));

create policy "Sindico remove vinculos do condominio" on public.vinculos
  for delete to authenticated
  using (exists (select 1 from public.vinculos v2 where v2.user_id = auth.uid() and v2.condominio_id = vinculos.condominio_id and v2.role in ('sindico','admin')));

-- ---------- 4. unidades ----------
drop policy if exists "Acesso Total" on public.unidades;
drop policy if exists "Acesso total para logados em unidades" on public.unidades;
drop policy if exists "Permitir criacao unidades" on public.unidades;
drop policy if exists "Permitir delete unidades" on public.unidades;
drop policy if exists "Permitir leitura unidades" on public.unidades;
drop policy if exists "Permitir update unidades" on public.unidades;

create policy "Membros veem unidades do condominio" on public.unidades
  for select to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = unidades.condominio_id));

create policy "Sindico escreve unidades" on public.unidades
  for all to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = unidades.condominio_id and v.role in ('sindico','admin')))
  with check (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = unidades.condominio_id and v.role in ('sindico','admin')));

-- ---------- 5. pagamentos ----------
drop policy if exists "Acesso Total" on public.pagamentos;
drop policy if exists "Acesso total logados pagamentos" on public.pagamentos;
drop policy if exists "Permitir delete pagamentos" on public.pagamentos;

create policy "Membros veem pagamentos do condominio" on public.pagamentos
  for select to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = pagamentos.condominio_id));

create policy "Sindico escreve pagamentos" on public.pagamentos
  for all to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = pagamentos.condominio_id and v.role in ('sindico','admin')))
  with check (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = pagamentos.condominio_id and v.role in ('sindico','admin')));

-- ---------- 6. despesas ----------
drop policy if exists "Acesso Total" on public.despesas;
drop policy if exists "Acesso total logados despesas" on public.despesas;
drop policy if exists "Permitir delete despesas" on public.despesas;

create policy "Membros veem despesas do condominio" on public.despesas
  for select to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = despesas.condominio_id));

create policy "Sindico escreve despesas" on public.despesas
  for all to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = despesas.condominio_id and v.role in ('sindico','admin')))
  with check (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = despesas.condominio_id and v.role in ('sindico','admin')));

-- ---------- 7. avisos ----------
drop policy if exists "Acesso Total" on public.avisos;
drop policy if exists "Acesso total para logados em avisos" on public.avisos;
drop policy if exists "Permitir delete avisos" on public.avisos;

create policy "Membros veem avisos do condominio" on public.avisos
  for select to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = avisos.condominio_id));

create policy "Sindico escreve avisos" on public.avisos
  for all to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = avisos.condominio_id and v.role in ('sindico','admin')))
  with check (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = avisos.condominio_id and v.role in ('sindico','admin')));

-- ---------- 8. zeladoria (morador tambem abre chamado) ----------
drop policy if exists "Acesso Total" on public.zeladoria;
drop policy if exists "Acesso total para logados em zeladoria" on public.zeladoria;
drop policy if exists "Morador insere manutencao" on public.zeladoria;
drop policy if exists "Permitir delete zeladoria" on public.zeladoria;

create policy "Membros veem zeladoria do condominio" on public.zeladoria
  for select to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = zeladoria.condominio_id));

create policy "Membros abrem chamado de zeladoria" on public.zeladoria
  for insert to authenticated
  with check (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = zeladoria.condominio_id));

create policy "Sindico atualiza zeladoria" on public.zeladoria
  for update to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = zeladoria.condominio_id and v.role in ('sindico','admin')))
  with check (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = zeladoria.condominio_id and v.role in ('sindico','admin')));

create policy "Sindico remove zeladoria" on public.zeladoria
  for delete to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = zeladoria.condominio_id and v.role in ('sindico','admin')));

-- ---------- 9. enquetes (morador vota = update) ----------
drop policy if exists "Acesso Total" on public.enquetes;
drop policy if exists "Acesso total para logados em enquetes" on public.enquetes;
drop policy if exists "Morador vota enquete" on public.enquetes;
drop policy if exists "Permitir delete enquetes" on public.enquetes;

create policy "Membros veem enquetes do condominio" on public.enquetes
  for select to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = enquetes.condominio_id));

create policy "Sindico cria enquetes" on public.enquetes
  for insert to authenticated
  with check (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = enquetes.condominio_id and v.role in ('sindico','admin')));

create policy "Membros votam ou sindico edita enquete" on public.enquetes
  for update to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = enquetes.condominio_id))
  with check (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = enquetes.condominio_id));

create policy "Sindico remove enquetes" on public.enquetes
  for delete to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = enquetes.condominio_id and v.role in ('sindico','admin')));

-- ---------- 10. config_geral ----------
drop policy if exists "Acesso Total" on public.config_geral;
drop policy if exists "Acesso total para logados em config" on public.config_geral;
drop policy if exists "Permitir criacao config" on public.config_geral;
drop policy if exists "Permitir delete config" on public.config_geral;
drop policy if exists "Permitir leitura config" on public.config_geral;
drop policy if exists "Permitir update config" on public.config_geral;

create policy "Membros veem config do condominio" on public.config_geral
  for select to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = config_geral.condominio_id));

create policy "Sindico escreve config" on public.config_geral
  for all to authenticated
  using (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = config_geral.condominio_id and v.role in ('sindico','admin')))
  with check (exists (select 1 from public.vinculos v where v.user_id = auth.uid() and v.condominio_id = config_geral.condominio_id and v.role in ('sindico','admin')));

-- ---------- 11. storage: fecha escrita/delete anonima no bucket de comprovantes ----------
drop policy if exists "Acesso total comprovantes" on storage.objects;

create policy "Comprovantes: leitura publica" on storage.objects
  for select to public
  using (bucket_id = 'comprovantes');

create policy "Comprovantes: escrita autenticada" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'comprovantes');

create policy "Comprovantes: update autenticado" on storage.objects
  for update to authenticated
  using (bucket_id = 'comprovantes')
  with check (bucket_id = 'comprovantes');

create policy "Comprovantes: delete autenticado" on storage.objects
  for delete to authenticated
  using (bucket_id = 'comprovantes');
