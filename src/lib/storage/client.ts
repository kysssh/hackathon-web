import 'server-only';
import { ActionError } from '@/errors';

function storageConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key)
    throw new Error(
      'SUPABASE_URL y SUPABASE_SECRET_KEY son obligatorias para Storage.'
    );
  return { url: `${url}/storage/v1`, key };
}

async function request(
  path: string,
  method: string,
  body?: unknown
): Promise<Response> {
  const { url, key } = storageConfig();
  const response = await fetch(`${url}${path}`, {
    method,
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
    headers: {
      apikey: key,
      ...(key.startsWith('sb_secret_')
        ? {}
        : { Authorization: `Bearer ${key}` }),
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return response;
}

function objectPath(bucket: string, path: string): string {
  return `${encodeURIComponent(bucket)}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

export async function createSignedUpload(
  bucket: string,
  path: string
): Promise<{ token: string }> {
  const response = await request(
    `/object/upload/sign/${objectPath(bucket, path)}`,
    'POST',
    {}
  );
  if (!response.ok)
    throw new Error(
      `Storage no pudo autorizar la subida (HTTP ${response.status}).`
    );
  const data = (await response.json()) as { url?: string };
  const { url } = storageConfig();
  const token = data.url
    ? new URL(data.url, url + '/').searchParams.get('token')
    : null;
  if (!token) throw new Error('Storage no devolvió un token de subida.');
  return { token };
}

type StoredFile = { sizeBytes: number; contentType: string };

type ObjectMetadata = {
  metadata?: { size?: number | string; mimetype?: string; contentLength?: number };
  size?: number | string;
  content_type?: string;
  contentType?: string;
};

function toStoredFile(data: ObjectMetadata): StoredFile | null {
  const rawSize = data.metadata?.size ?? data.metadata?.contentLength ?? data.size;
  const sizeBytes = typeof rawSize === 'string' ? Number(rawSize) : rawSize;
  const contentType =
    data.metadata?.mimetype ?? data.content_type ?? data.contentType;
  if (!Number.isSafeInteger(sizeBytes) || !contentType) return null;
  return { sizeBytes: sizeBytes as number, contentType };
}

/**
 * Respaldo: lista la carpeta del objeto y busca el nombre exacto. La API de
 * listado existe en todas las versiones de Storage; /object/info no siempre
 * (en versiones antiguas responde 404/400 aunque el archivo sí exista, y eso
 * hacía fallar la confirmación con "No pudimos confirmar la subida").
 */
async function findStoredFileByListing(
  bucket: string,
  path: string
): Promise<StoredFile | null> {
  const slash = path.lastIndexOf('/');
  const prefix = slash >= 0 ? path.slice(0, slash) : '';
  const name = path.slice(slash + 1);
  const response = await request(
    `/object/list/${encodeURIComponent(bucket)}`,
    'POST',
    { prefix, search: name, limit: 10, offset: 0 }
  );
  if (!response.ok)
    throw new Error(
      `Storage no pudo verificar el archivo (HTTP ${response.status}).`
    );
  const rows = (await response.json()) as (ObjectMetadata & { name?: string })[];
  const row = Array.isArray(rows) ? rows.find((r) => r.name === name) : undefined;
  return row ? toStoredFile(row) : null;
}

export async function getStoredFile(
  bucket: string,
  path: string
): Promise<StoredFile> {
  const response = await request(
    `/object/info/${objectPath(bucket, path)}`,
    'GET'
  );
  if (response.ok) {
    const info = toStoredFile((await response.json()) as ObjectMetadata);
    if (info) return info;
  } else if (response.status >= 500 && response.status !== 501) {
    throw new Error(
      `Storage no pudo verificar el archivo (HTTP ${response.status}).`
    );
  }
  // 4xx (objeto ausente o ruta no soportada) o respuesta sin metadatos.
  const listed = await findStoredFileByListing(bucket, path);
  if (!listed) throw new ActionError('FILE_NOT_UPLOADED');
  return listed;
}

/** DELETE idempotente con reintentos ante fallos temporales. */
export async function removeStoredFile(
  bucket: string,
  path: string
): Promise<void> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let response: Response;
    try {
      response = await request(
        `/object/${encodeURIComponent(bucket)}`,
        'DELETE',
        { prefixes: [path] }
      );
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
      continue;
    }
    if (response.ok) return;
    const data = (await response.json().catch(() => ({}))) as { code?: string };
    if (data.code === 'NoSuchKey' || data.code === 'not_found') return;
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === maxAttempts)
      throw new Error(`Storage no pudo borrar el archivo (HTTP ${response.status}).`);
    await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
  }
}
