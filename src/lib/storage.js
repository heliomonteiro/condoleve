import { compressFileForUpload } from './imageCompressor';
import { generateId } from '../utils/helpers';

/**
 * Faz upload seguro e isolado por condomínio (<condominioId>/<categoria>/<uuid>.<ext>),
 * comprimindo imagens automaticamente em WebP e respeitando a cota do plano.
 */
export async function uploadCondoDocument({
  supabase,
  condominioId,
  category = 'geral',
  rawFile,
}) {
  if (!condominioId || condominioId === 'default') {
    throw new Error('Condomínio inválido para armazenamento.');
  }

  // Tenta validar/incrementar cota no servidor caso a migration v1.0 esteja ativa
  const { data: quotaAllowed, error: quotaErr } = await supabase.rpc(
    'consumir_cota_upload',
    { p_condominio_id: condominioId }
  );

  // Se a função existir no banco e retornar false, bloqueia por limite do plano
  if (!quotaErr && quotaAllowed === false) {
    const limitError = new Error(
      'Limite de armazenamento de anexos atingido no seu plano atual.'
    );
    limitError.code = 'PLAN_LIMIT_REACHED';
    throw limitError;
  }

  const { file, ext, contentType } = await compressFileForUpload(rawFile);
  const safePath = `${condominioId}/${category}/${generateId()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('comprovantes')
    .upload(safePath, file, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Falha no upload: ${uploadError.message}`);
  }

  const { data: pubData } = supabase.storage.from('comprovantes').getPublicUrl(safePath);
  return {
    publicUrl: pubData.publicUrl,
    storagePath: safePath,
    compressedFile: file,
    contentType,
  };
}

/**
 * Remove arquivo do storage com compatibilidade tanto para paths antigos (raiz)
 * quanto novos (<condominioId>/<categoria>/<arquivo>).
 */
export async function deleteCondoDocument(supabase, publicUrl) {
  if (!publicUrl) return;
  try {
    const marker = '/object/public/comprovantes/';
    const idx = publicUrl.indexOf(marker);
    const relativePath =
      idx !== -1
        ? decodeURIComponent(publicUrl.slice(idx + marker.length))
        : publicUrl.split('/').pop();
    if (relativePath) {
      await supabase.storage.from('comprovantes').remove([relativePath]);
    }
  } catch (err) {
    console.error('Erro ao limpar arquivo do storage:', err);
  }
}
