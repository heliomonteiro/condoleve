import { fileToBase64 } from './imageCompressor';

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

  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: {
      action: 'extract_document',
      condominioId,
      payload: {
        base64Data,
        mimeType,
        categorias,
      },
    },
  });

  if (error) {
    throw new Error(
      'Serviço de leitura IA indisponível no momento (verifique o deploy da Edge Function ai-assistant).'
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
  const { data, error } = await supabase.functions.invoke('ai-assistant', {
    body: {
      action: 'polish_message',
      condominioId,
      payload: { titulo, mensagem, tipo },
    },
  });

  // Se a Edge Function ainda não estiver publicada no ambiente de dev, oferece uma melhoria estruturada local cortês
  if (error) {
    const cleanBody = String(mensagem || '').trim();
    const cleanTitle = String(titulo || 'Comunicado Importante').trim();
    const prefix =
      tipo === 'Urgente'
        ? 'Prezados moradores,\n\nPedimos especial atenção para a seguinte ocorrência prioritária:\n\n'
        : 'Prezados moradores,\n\nPara mantermos a boa convivência e organização do nosso condomínio, informamos:\n\n';
    const suffix = '\n\nContamos com a colaboração e compreensão de todos.\nAtenciosamente,\nAdministração.';
    return {
      titulo: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      mensagem: `${prefix}${cleanBody}${suffix}`,
      usedFallback: true,
    };
  }

  if (data?.error) {
    const customErr = new Error(data.error);
    customErr.code = data.code;
    throw customErr;
  }

  return data?.data || null;
}
