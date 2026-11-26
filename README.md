# CondoLeve — Gestão Inteligente para Pequenos Condomínios

Plataforma SaaS web/PWA construída em **React 19 + Vite + Tailwind CSS + Supabase (PostgreSQL Zero-Trust + Edge Functions Gemini IA)**, desenhada para substituir planilhas e caderninhos em condomínios de autogestão com altíssima eficiência operacional e custo marginal próximo de zero.

---

## Matriz Comercial & Unit Economics (`src/config/plans.js`)

| Recurso | Plano Grátis (`free`) | Degustação 30 Dias (`trial`) | CondoLeve Pro (`pro` - R$ 49,90/mês) |
| :--- | :---: | :---: | :---: |
| **Unidades por condomínio** | Até **8 aptos** | Até 30 aptos | Até **30 aptos** (31+: *CondoLeve Mais* em breve) |
| **Livro-caixa (Receitas/Despesas texto)** | Ilimitado | Ilimitado | Ilimitado |
| **Recibo Digital c/ Chave Verificável** | Sim | Sim | Sim |
| **Portal do Morador + Mural + Cartaz** | Sim | Sim | Sim |
| **Upload de Comprovantes/Notas (WebP ~90KB)** | Bloqueado (protege Storage) | 30 arquivos/mês | **300 arquivos/mês** |
| **Leitura de Contas & Redator IA (Gemini)** | Bloqueado (protege API) | 10 créditos | **150 créditos/mês** |
| **Inadimplência Acumulada + Cobrança 1-Clique** | Bloqueado | Liberado | **Liberado** |
| **Prestação de Contas Oficial (PNG/Excel) + LGPD** | Visualização na tela | Exportação liberada | **Exportação liberada** |
| **Enquetes Auditáveis & Perfil Conselheiro** | Bloqueado | Liberado | **Liberado** |

---

## Como Rodar e Publicar em Produção

### 1. Variáveis de Ambiente
Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```
Preencha `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY` e opcionalmente `VITE_CHECKOUT_URL` / `VITE_COMERCIAL_WHATSAPP`.

### 2. Banco de Dados (Migrations Zero-Trust)
Execute os arquivos SQL da pasta `supabase/migrations/` em ordem no **SQL Editor** do painel do Supabase (ou via `npx supabase db push`):
1. `20261125000000_harden_multitenant_rls.sql`
2. `20261125000001_drop_dead_exposed_tables.sql`
3. `20261125000002_production_security_billing_and_accounting.sql`

### 3. Deploy da Edge Function de IA (Opcional p/ Leitura de Boletos)
```bash
npx supabase secrets set GEMINI_API_KEY=sua_chave_gemini
npx supabase functions deploy ai-assistant
```

### 4. Hospedagem Comercial Gratuita (Cloudflare Pages)
1. Conecte o repositório no **Cloudflare Pages**.
2. Comando de build: `npm run build` | Diretório de saída: `dist`.
3. Os arquivos `public/_headers` e `public/_redirects` já configuram automaticamente proteção CSP/Clickjacking e roteamento SPA.
