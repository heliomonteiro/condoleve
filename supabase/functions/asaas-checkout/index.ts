// ============================================================================
// Supabase Edge Function: asaas-checkout
// Cria cliente e assinatura recorrente no Asaas (Sandbox ou Produção)
// Secrets: ASAAS_API_KEY, ASAAS_ENV ('sandbox' | 'production')
// ============================================================================

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Não autenticado.' }, { status: 401, headers: corsHeaders });
    }

    const asaasApiKey =
      Deno.env.get('ASAAS_API_KEY') || Deno.env.get('ASAAS_API_KEY_SANDBOX');
    if (!asaasApiKey) {
      return Response.json(
        { error: 'Asaas ainda não configurado no servidor (ASAAS_API_KEY).' },
        { status: 503, headers: corsHeaders }
      );
    }

    const asaasEnv = Deno.env.get('ASAAS_ENV') || 'sandbox';
    const baseUrl =
      asaasEnv === 'production'
        ? 'https://api.asaas.com/v3'
        : 'https://sandbox.asaas.com/api/v3';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser();
    if (authErr || !user) {
      return Response.json({ error: 'Sessão inválida.' }, { status: 401, headers: corsHeaders });
    }

    const { condominioId, condominioNome, ciclo = 'mensal', nome, cpfCnpj } = await req.json();
    if (!condominioId) {
      return Response.json({ error: 'condominioId obrigatório.' }, { status: 400, headers: corsHeaders });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: vinculo } = await adminClient
      .from('vinculos')
      .select('role')
      .eq('user_id', user.id)
      .eq('condominio_id', condominioId)
      .maybeSingle();

    if (!vinculo || !['sindico', 'admin'].includes(vinculo.role)) {
      return Response.json(
        { error: 'Apenas o síndico pode contratar a assinatura do condomínio.' },
        { status: 403, headers: corsHeaders }
      );
    }

    const headersAsaas = {
      'Content-Type': 'application/json',
      access_token: asaasApiKey,
    };

    // 1. Cria cliente no Asaas
    const customerRes = await fetch(`${baseUrl}/customers`, {
      method: 'POST',
      headers: headersAsaas,
      body: JSON.stringify({
        name: nome || condominioNome || 'Síndico CondoLeve',
        email: user.email,
        cpfCnpj: cpfCnpj ? String(cpfCnpj).replace(/\D/g, '') : undefined,
        externalReference: condominioId,
      }),
    });
    const customerData = await customerRes.json();
    if (!customerRes.ok || !customerData.id) {
      return Response.json(
        { error: customerData?.errors?.[0]?.description || 'Falha ao registrar cliente no Asaas.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Cria assinatura recorrente (R$ 49,90 mensal ou R$ 478,80 anual = R$ 39,90/mês)
    const isAnual = ciclo === 'anual';
    const nextDueDate = new Date().toISOString().split('T')[0];

    const subRes = await fetch(`${baseUrl}/subscriptions`, {
      method: 'POST',
      headers: headersAsaas,
      body: JSON.stringify({
        customer: customerData.id,
        billingType: 'UNDEFINED', // Permite ao síndico escolher PIX, Boleto ou Cartão na tela do Asaas
        value: isAnual ? 478.8 : 49.9,
        nextDueDate,
        cycle: isAnual ? 'YEARLY' : 'MONTHLY',
        description: `CondoLeve Pro (${isAnual ? 'Anual' : 'Mensal'}) - ${condominioNome || 'Condomínio'}`,
        externalReference: condominioId,
      }),
    });
    const subData = await subRes.json();
    if (!subRes.ok || !subData.id) {
      return Response.json(
        { error: subData?.errors?.[0]?.description || 'Falha ao gerar assinatura no Asaas.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Salva IDs no banco
    await adminClient
      .from('assinaturas_condominio')
      .upsert(
        {
          condominio_id: condominioId,
          gateway_customer_id: customerData.id,
          gateway_subscription_id: subData.id,
          atualizado_em: new Date().toISOString(),
        },
        { onConflict: 'condominio_id' }
      );

    // 4. Busca o link da primeira cobrança gerada para abrir imediatamente
    const paymentsRes = await fetch(`${baseUrl}/subscriptions/${subData.id}/payments`, {
      headers: headersAsaas,
    });
    const paymentsData = await paymentsRes.json();
    const invoiceUrl = paymentsData?.data?.[0]?.invoiceUrl || null;

    return Response.json(
      {
        subscriptionId: subData.id,
        invoiceUrl,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error('Erro asaas-checkout:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Erro interno.' },
      { status: 500, headers: corsHeaders }
    );
  }
});
