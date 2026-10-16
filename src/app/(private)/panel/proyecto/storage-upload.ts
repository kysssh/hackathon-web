/**
 * Subida directa del navegador a Supabase Storage usando el token firmado que
 * devuelve createUploadUrlAction (contrato de BK en src/lib/storage/README.md:
 * "subir directamente desde el navegador, sin sobrescritura; los archivos no
 * viajan dentro de una Server Action").
 *
 * Es la misma petición que hace supabase-js en uploadToSignedUrl (PUT a
 * /storage/v1/object/upload/sign/<bucket>/<ruta>?token=...), pero con XHR para
 * poder mostrar el progreso y cancelar, y sin añadir una dependencia nueva
 * (BK también usa la API REST de Storage con fetch en el servidor).
 */

export type StorageConfig = { url: string; publishableKey: string };
export type SignedUpload = { bucket: string; storagePath: string; token: string };

export type UploadFailureReason = 'aborted' | 'network' | 'timeout' | 'rejected';

export class UploadError extends Error {
  constructor(
    public reason: UploadFailureReason,
    message: string,
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/');
}

export function buildSignedUploadUrl(storage: StorageConfig, signed: SignedUpload): string {
  const base = storage.url.replace(/\/$/, '');
  return (
    `${base}/storage/v1/object/upload/sign/` +
    `${encodeURIComponent(signed.bucket)}/${encodePath(signed.storagePath)}` +
    `?token=${encodeURIComponent(signed.token)}`
  );
}

/** Supabase responde { statusCode, error, message }; el statusCode suele ser más fiable que el HTTP. */
function statusFromResponse(xhr: XMLHttpRequest): number {
  try {
    const body = JSON.parse(xhr.responseText) as { statusCode?: string | number };
    const code = Number(body.statusCode);
    if (Number.isInteger(code) && code >= 400) return code;
  } catch {
    // cuerpo vacío o no JSON: se usa el estado HTTP
  }
  return xhr.status;
}

function messageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'El almacenamiento rechazó el archivo. Revisa que el tipo y el tamaño sean los permitidos.';
    case 401:
    case 403:
      return 'La autorización de subida venció o no es válida. Vuelve a intentarlo.';
    case 404:
      return 'El espacio de almacenamiento todavía no está disponible. Avisa al equipo de BD/DP.';
    case 409:
      return 'Ese archivo ya existe en el almacenamiento. Vuelve a intentarlo.';
    case 413:
      return 'El archivo supera el tamaño que acepta el almacenamiento.';
    case 429:
      return 'Hay demasiadas subidas a la vez. Espera un momento y vuelve a intentarlo.';
    default:
      return status >= 500
        ? 'El almacenamiento no está disponible por ahora. Inténtalo de nuevo en unos minutos.'
        : `No se pudo subir el archivo (código ${status}).`;
  }
}

export function uploadToSignedUrl(params: {
  storage: StorageConfig;
  signed: SignedUpload;
  file: File;
  signal: AbortSignal;
  onProgress: (percent: number) => void;
}): Promise<void> {
  const { storage, signed, file, signal, onProgress } = params;

  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new UploadError('aborted', 'Subida cancelada.'));
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('PUT', buildSignedUploadUrl(storage, signed));
    xhr.timeout = UPLOAD_TIMEOUT_MS;

    xhr.setRequestHeader('apikey', storage.publishableKey);
    // Las llaves nuevas (sb_publishable_…) no son JWT: solo van en apikey.
    if (!storage.publishableKey.startsWith('sb_')) {
      xhr.setRequestHeader('Authorization', `Bearer ${storage.publishableKey}`);
    }
    xhr.setRequestHeader('x-upsert', 'false'); // sin sobrescritura (contrato de BK)
    xhr.setRequestHeader('cache-control', 'max-age=3600');
    xhr.setRequestHeader('content-type', file.type);

    const onAbort = () => xhr.abort();
    signal.addEventListener('abort', onAbort, { once: true });
    const cleanup = () => signal.removeEventListener('abort', onAbort);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      // El detalle técnico va a la consola; al usuario se le muestra un mensaje claro.
      console.error('[uploadToSignedUrl] Storage respondió', xhr.status, xhr.responseText);
      reject(new UploadError('rejected', messageForStatus(statusFromResponse(xhr))));
    };

    xhr.onerror = () => {
      cleanup();
      reject(
        new UploadError(
          'network',
          'Se interrumpió la conexión durante la subida. Revisa tu internet y vuelve a intentarlo.',
        ),
      );
    };

    xhr.ontimeout = () => {
      cleanup();
      reject(
        new UploadError(
          'timeout',
          'La subida tardó demasiado. Prueba con una conexión más estable.',
        ),
      );
    };

    xhr.onabort = () => {
      cleanup();
      reject(new UploadError('aborted', 'Subida cancelada.'));
    };

    xhr.send(file);
  });
}
