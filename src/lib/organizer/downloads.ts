import 'server-only';

/**
 * URL firmada de corta duración para descargar un archivo de Supabase Storage.
 * El bucket "entregables" es privado, así que el navegador nunca recibe la
 * llave secreta: solo esta URL que vence en 60 segundos.
 *
 * Usa la misma API REST y el mismo manejo de la llave que src/lib/storage/client.ts
 * (BK). Archivo nuevo para no tocar el de BK; puede moverse allí si lo prefieren.
 */
export async function createSignedDownloadUrl(
  bucket: string,
  path: string,
  fileName: string
): Promise<string> {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!base || !key)
    throw new Error(
      'SUPABASE_URL y SUPABASE_SECRET_KEY son obligatorias para las descargas.'
    );

  const objectPath = `${encodeURIComponent(bucket)}/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

  const response = await fetch(`${base}/storage/v1/object/sign/${objectPath}`, {
    method: 'POST',
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
    headers: {
      apikey: key,
      ...(key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn: 60 }),
  });

  if (!response.ok)
    throw new Error(`Storage no pudo firmar la descarga (HTTP ${response.status}).`);

  const data = (await response.json()) as { signedURL?: string };
  if (!data.signedURL) throw new Error('Storage no devolvió una URL firmada.');

  const url = new URL(`${base}/storage/v1${data.signedURL}`);
  url.searchParams.set('download', fileName); // fuerza descarga con el nombre original
  return url.toString();
}
