import { fileToBase64 } from './imageCompressor';

function withTimeout(promise, ms, timeoutMessage) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

async function parseEdgeFunctionError(error, fallbackMsg) {
  try {
    if (error?.context && typeof error.context.json === 'function') {
      const body = await error.context.json();
      if (body?.error) {
        const err = new Error(body.error);
        err.code = body.code;
        return err;
      }
    }
  } catch {
    // ignore JSON parse failure
  }
  return new Error(error?.message || fallbackMsg);
}

/**
 * Cliente seguro para o Gateway de IA (Supabase Edge Function `ai-assistant`).
 * Nunca expõe chaves de API de LLM no navegador.
 */
export async function extractDocumentWithAI({
  supabase,
  condominioId,
  file,
  categorias = [],
}) {
  const base64Data = await fileToBase64(file);
  const mimeType =
    file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/webp');

  const { data, error } = await withTimeout(
    supabase.functions.invoke('ai-assistant', {
      body: {
        action: 'extract_document',
        condominioId,
        payload: {
          base64Data,
          mimeType,
          categorias,
        },
      },
    }),
    25000,
    'A leitura com IA demorou mais que o esperado. Tente novamente ou preencha os dados manualmente.'
  );

  if (error) {
    throw await parseEdgeFunctionError(
      error,
      'Não foi possível ler o documento com a IA no momento. Verifique os logs no Supabase.'
    );
  }
  if (data?.error) {
    const customErr = new Error(data.error);
    customErr.code = data.code;
    throw customErr;
  }

  return data?.data || null;
}

export async function polishNoticeWithAI({
  supabase,
  condominioId,
  titulo,
  mensagem,
  tipo = 'Aviso',
}) {
  const { data, error } = await withTimeout(
    supabase.functions.invoke('ai-assistant', {
      body: {
        action: 'polish_message',
        condominioId,
        payload: { titulo, mensagem, tipo },
      },
    }),
    25000,
    'O assistente de IA demorou para responder. Tente novamente ou escreva o aviso manualmente.'
  );

  if (error) {
    throw await parseEdgeFunctionError(
      error,
      'Não foi possível conectar ao assistente de IA agora. Verifique os logs no Supabase.'
    );
  }

  if (data?.error) {
    const customErr = new Error(data.error);
    customErr.code = data.code;
    throw customErr;
  }

  return data?.data || null;
}
