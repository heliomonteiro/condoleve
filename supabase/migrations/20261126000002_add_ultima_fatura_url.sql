-- ============================================================================
-- CondoLeve: Salva URL da última fatura/comprovante do Asaas para o síndico
-- ============================================================================

alter table public.assinaturas_condominio
  add column if not exists ultima_fatura_url text;
