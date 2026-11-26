// ============================================================================
// Supabase Edge Function: asaas-webhook
// Recebe confirmação de pagamento do Asaas e ativa o Plano Pro automaticamente.
// Secrets: ASAAS_WEBHOOK_TOKEN
// ============================================================================

import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const expectedToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN');
    const receivedToken = req.headers.get('asaas-access-token');

    if (expectedToken && receivedToken !== expectedToken) {
      return Response.json({ error: 'Token de webhook inválido.' }, { status: 401 });
    }

    const body = await req.json();
    const event = body?.event;
    const payment = body?.payment;
    const condominioId = payment?.externalReference;

    if (!condominioId) {
      return Response.json({ ignored: true, reason: 'Sem externalReference.' });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      await adminClient
        .from('assinaturas_condominio')
        .upsert(
          {
            condominio_id: condominioId,
            plano: 'pro',
            status: 'ativo',
            gateway_subscription_id: payment?.subscription || null,
            ultima_fatura_url: payment?.transactionReceiptUrl || payment?.invoiceUrl || null,
            atualizado_em: new Date().toISOString(),
          },
          { onConflict: 'condominio_id' }
        );
    } else if (event === 'PAYMENT_OVERDUE') {
      await adminClient
        .from('assinaturas_condominio')
        .update({
          status: 'atrasado',
          atualizado_em: new Date().toISOString(),
        })
        .eq('condominio_id', condominioId);
    } else if (event === 'SUBSCRIPTION_DELETED' || event === 'SUBSCRIPTION_INACTIVATED') {
      await adminClient
        .from('assinaturas_condominio')
        .update({
          plano: 'free',
          status: 'cancelado',
          atualizado_em: new Date().toISOString(),
        })
        .eq('condominio_id', condominioId);
    }

    return Response.json({ received: true, event, condominioId });
  } catch (err) {
    console.error('Erro asaas-webhook:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Erro interno.' },
      { status: 500 }
    );
  }
});
