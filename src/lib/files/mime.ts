/**
 * Normalización de tipos de archivo, compartida por navegador y servidor.
 *
 * Los navegadores no reportan el tipo de forma uniforme:
 *   - Chrome/Edge en Windows marcan los .zip como "application/x-zip-compressed".
 *   - Algunos sistemas usan "image/jpg" o "image/pjpeg" para JPEG.
 *   - Si el sistema no conoce la extensión, File.type llega vacío ("").
 * Antes, todos esos casos se rechazaban con "Tipo de archivo no permitido"
 * aunque el archivo fuera válido. Aquí se llevan al tipo canónico que aceptan
 * eventConfig y los buckets de Supabase.
 */

const ALIASES: Record<string, string> = {
  'application/x-zip-compressed': 'application/zip',
  'application/x-zip': 'application/zip',
  'application/zip-compressed': 'application/zip',
  'multipart/x-zip': 'application/zip',
  'image/jpg': 'image/jpeg',
  'image/pjpeg': 'image/jpeg',
  'image/x-png': 'image/png',
  'application/x-pdf': 'application/pdf',
  'application/acrobat': 'application/pdf',
};

const BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  zip: 'application/zip',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jfif: 'image/jpeg',
  webp: 'image/webp',
};

/** "Image/JPG; charset=x" → "image/jpeg". Devuelve "" si no hay tipo. */
export function normalizeContentType(raw: string | null | undefined): string {
  const base = (raw ?? '').split(';')[0].trim().toLowerCase();
  return ALIASES[base] ?? base;
}

export function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
}

/**
 * Tipo con el que se valida y se sube el archivo: el que reporta el navegador
 * (normalizado) y, si está vacío o es genérico, el que indica la extensión.
 */
export function resolveContentType(fileName: string, reportedType: string): string {
  const normalized = normalizeContentType(reportedType);
  if (normalized && normalized !== 'application/octet-stream') return normalized;
  return BY_EXTENSION[extensionOf(fileName)] ?? normalized;
}

/** Recorta nombres larguísimos conservando la extensión (el servidor acepta hasta `max`). */
export function safeFileName(fileName: string, max = 200): string {
  const clean = fileName.normalize('NFC').replace(/[\u0000-\u001f\u007f]/g, '').trim() || 'archivo';
  if (clean.length <= max) return clean;
  const ext = extensionOf(clean);
  const suffix = ext && ext.length < 10 ? `.${ext}` : '';
  return clean.slice(0, max - suffix.length) + suffix;
}

/**
 * Valor del atributo `accept` del <input type="file">: tipos y extensiones.
 * Con solo tipos MIME, el selector de Windows a veces oculta .zip o .jpg.
 */
export function acceptAttribute(contentTypes: readonly string[]): string {
  const extensions = Object.entries(BY_EXTENSION)
    .filter(([, type]) => contentTypes.includes(type))
    .map(([ext]) => `.${ext}`);
  return [...contentTypes, ...extensions].join(',');
}
