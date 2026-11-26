// ============================================================================
// Supabase Edge Function: ai-assistant
// Deploy: npx supabase functions deploy ai-assistant
// Secrets necessários: npx supabase secrets set GEMINI_API_KEY=sua_chave
// ============================================================================

import { createClient } from 'npm:@supabase/supabase-js@2';
import { GoogleGenAI, Type } from 'npm:@google/genai';

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      return Response.json(
        { error: 'GEMINI_API_KEY não configurada na Edge Function.' },
        { status: 503, headers: corsHeaders }
      );
    }

    // 1. Valida JWT do usuário
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

    const body = await req.json();
    const { action, condominioId, payload } = body;

    if (!condominioId || !action) {
      return Response.json(
        { error: 'Parâmetros obrigatórios ausentes (condominioId, action).' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Verifica vínculo de síndico/admin e cota de créditos de IA do plano no servidor
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: vinculo } = await adminClient
      .from('vinculos')
      .select('role')
      .eq('user_id', user.id)
      .eq('condominio_id', condominioId)
      .maybeSingle();

    if (!vinculo || !['sindico', 'admin'].includes(vinculo.role)) {
      return Response.json(
        { error: 'Apenas o síndico pode utilizar o assistente de IA.' },
        { status: 403, headers: corsHeaders }
      );
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    let { data: sub } = await adminClient
      .from('assinaturas_condominio')
      .select('*')
      .eq('condominio_id', condominioId)
      .maybeSingle();

    if (!sub) {
      const { data: createdSub } = await adminClient
        .from('assinaturas_condominio')
        .insert({ condominio_id: condominioId, plano: 'trial', status: 'ativo' })
        .select('*')
        .single();
      sub = createdSub;
    }

    if (sub.ciclo_mes !== currentMonth) {
      const { data: resetSub } = await adminClient
        .from('assinaturas_condominio')
        .update({ ciclo_mes: currentMonth, creditos_ia_usados: 0, arquivos_mes_usados: 0 })
        .eq('condominio_id', condominioId)
        .select('*')
        .single();
      sub = resetSub;
    }

    const isProActive = sub.plano === 'pro' && sub.status === 'ativo';
    const isTrialActive =
      sub.plano === 'trial' && new Date(sub.trial_ate).getTime() > Date.now();
    const maxAiCredits = isProActive ? 150 : isTrialActive ? 10 : 0;

    if (sub.creditos_ia_usados >= maxAiCredits) {
      return Response.json(
        {
          error: 'Limite de créditos de IA atingido no seu plano atual.',
          code: 'PLAN_LIMIT_REACHED',
        },
        { status: 402, headers: corsHeaders }
      );
    }

    // 3. Executa ação no Gemini com Structured Output (JSON Schema)
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const modelName = Deno.env.get('GEMINI_MODEL') || 'gemini-3.8-flash';
    let resultData: unknown = null;

    if (action === 'extract_document') {
      const { base64Data, mimeType, categorias = [] } = payload || {};
      if (!base64Data || !mimeType) {
        return Response.json(
          { error: 'Envie base64Data e mimeType do documento.' },
          { status: 400, headers: corsHeaders }
        );
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Extraia os dados financeiros deste boleto, nota fiscal ou comprovante PIX de condomínio brasileiro. Categorias disponíveis: ${categorias.join(', ')}.`,
              },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: {
            type: Type.OBJECT,
            properties: {
              descricao: {
                type: Type.STRING,
                description: 'Descrição curta (ex: Conta de Água Sabesp, Comprovante PIX).',
              },
              valor: {
                type: Type.NUMBER,
                description: 'Valor total em reais (ex: 189.90).',
              },
              dataISO: {
                type: Type.STRING,
                description: 'Data de vencimento ou pagamento no formato YYYY-MM-DD.',
              },
              categoriaSugerida: {
                type: Type.STRING,
                description: 'Categoria mais adequada dentre as disponíveis.',
              },
            },
            propertyOrdering: ['descricao', 'valor', 'dataISO', 'categoriaSugerida'],
          },
        },
      });

      resultData = JSON.parse(response.text || '{}');
    } else if (action === 'polish_message') {
      const { titulo = '', mensagem = '', tipo = 'Aviso' } = payload || {};
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Você é um assistente especialista em comunicação condominial brasileira. Reescreva o rascunho abaixo para torná-lo claro, educado, impessoal, objetivo e firme na medida certa, preservando todas as informações factuais. Tipo: ${tipo}.\nTítulo atual: ${titulo}\nMensagem atual: ${mensagem}`,
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: {
            type: Type.OBJECT,
            properties: {
              titulo: { type: Type.STRING, description: 'Título claro e objetivo.' },
              mensagem: {
                type: Type.STRING,
                description: 'Texto cordial, claro e profissional para os moradores.',
              },
            },
            propertyOrdering: ['titulo', 'mensagem'],
          },
        },
      });

      resultData = JSON.parse(response.text || '{}');
    } else {
      return Response.json({ error: 'Ação desconhecida.' }, { status: 400, headers: corsHeaders });
    }

    // 4. Debita 1 crédito de IA após sucesso
    await adminClient
      .from('assinaturas_condominio')
      .update({
        creditos_ia_usados: sub.creditos_ia_usados + 1,
        atualizado_em: new Date().toISOString(),
      })
      .eq('condominio_id', condominioId);

    return Response.json(
      { data: resultData, creditsUsed: sub.creditos_ia_usados + 1 },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error('Erro ai-assistant:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Erro interno de IA.' },
      { status: 500, headers: corsHeaders }
    );
  }
});
