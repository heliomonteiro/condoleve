// ============================================================================
// Compressor Client-Side Inteligente (WebP)
// Reduz fotos de celular (4MB-8MB) para ~80KB-120KB mantendo nitidez para
// leitura humana e OCR/IA, multiplicando em ~25x a franquia gratuita do Supabase.
// ============================================================================

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB máx de entrada
const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024;  // 5 MB máx p/ PDF
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
];

export function validateUploadFile(file) {
  if (!file) throw new Error('Nenhum arquivo selecionado.');
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Arquivo muito grande (máx. 8 MB).');
  }
  if (file.type === 'application/pdf' && file.size > MAX_PDF_SIZE_BYTES) {
    throw new Error('O PDF deve ter no máximo 5 MB.');
  }
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const validExt = ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext);
  if (!ALLOWED_MIME_TYPES.includes(file.type) && !validExt) {
    throw new Error('Formato não suportado. Envie imagem (JPG/PNG/WebP) ou PDF.');
  }
}

export async function compressFileForUpload(file, maxDimension = 1280, quality = 0.78) {
  validateUploadFile(file);

  // PDFs não passam por canvas; seguem intactos após validação de tamanho
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return { file, ext: 'pdf', contentType: 'application/pdf' };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve({ file, ext: 'jpg', contentType: file.type || 'image/jpeg' });
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => resolve({ file, ext: 'jpg', contentType: file.type || 'image/jpeg' });
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ file, ext: 'jpg', contentType: file.type || 'image/jpeg' });
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              const origExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
              resolve({ file, ext: origExt, contentType: file.type || 'image/jpeg' });
              return;
            }
            const compressedFile = new File([blob], `compressed_${Date.now()}.webp`, {
              type: 'image/webp',
            });
            resolve({ file: compressedFile, ext: 'webp', contentType: 'image/webp' });
          },
          'image/webp',
          quality
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler arquivo.'));
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}
