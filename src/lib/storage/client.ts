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

export async function getStoredFile(
  bucket: string,
  path: string
): Promise<{ sizeBytes: number; contentType: string }> {
  const response = await request(
    `/object/info/${objectPath(bucket, path)}`,
    'GET'
  );
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      code?: string;
      statusCode?: string;
    };
    if (
      response.status === 404 ||
      data.code === 'NoSuchKey' ||
      data.code === 'not_found' ||
      data.statusCode === '404'
    )
      throw new ActionError('FILE_NOT_UPLOADED');
    throw new Error(
      `Storage no pudo verificar el archivo (HTTP ${response.status}).`
    );
  }
  const data = (await response.json()) as {
    metadata?: { size?: number; mimetype?: string };
    size?: number;
    content_type?: string;
  };
  const sizeBytes = data.metadata?.size ?? data.size;
  const contentType = data.metadata?.mimetype ?? data.content_type;
  if (!Number.isSafeInteger(sizeBytes) || !contentType)
    throw new ActionError('FILE_NOT_UPLOADED');
  return { sizeBytes: sizeBytes as number, contentType };
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
