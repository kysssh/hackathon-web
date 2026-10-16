import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { eventConfig, type ProjectFileKind } from '@/config/event';
import { ActionError } from '@/errors';

export type UploadRequest = {
  kind: ProjectFileKind;
  fileName: string;
  contentType: string;
  sizeBytes: number;
};

export function validateFile(
  input: Pick<UploadRequest, 'kind' | 'contentType' | 'sizeBytes'>
): void {
  const limit = eventConfig.files.limits[input.kind];
  if (input.sizeBytes > limit.maxBytes) throw new ActionError('FILE_TOO_LARGE');
  if (!(limit.contentTypes as readonly string[]).includes(input.contentType))
    throw new ActionError('FILE_TYPE_NOT_ALLOWED');
  if (!Number.isSafeInteger(input.sizeBytes) || input.sizeBytes <= 0)
    throw new ActionError('VALIDATION_ERROR');
}

export function assertFileLimit(kind: ProjectFileKind, count: number): void {
  const maximum = kind === 'EXTRA' ? eventConfig.files.maxExtraFiles : 1;
  if (count >= maximum) throw new ActionError('FILE_LIMIT_REACHED');
}

export function bucketForKind(kind: ProjectFileKind): string {
  return kind === 'COVER_IMAGE' ? 'portadas' : 'entregables';
}

// Vincula la ruta a proyecto, tipo, nombre y tamaño autorizados, sin cambiar el contrato ni el esquema.
function signature(prefix: string, input: UploadRequest): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret)
    throw new Error('AUTH_SECRET es obligatoria para autorizar archivos.');
  return createHmac('sha256', secret)
    .update(
      JSON.stringify([
        prefix,
        input.kind,
        input.fileName,
        input.contentType,
        input.sizeBytes,
      ])
    )
    .digest('hex');
}

export function createStoragePath(
  projectId: string,
  input: UploadRequest
): string {
  const prefix = `${projectId}/${input.kind}/${randomUUID()}`;
  return `${prefix}-${signature(prefix, input)}`;
}

export function assertStoragePath(
  projectId: string,
  input: UploadRequest,
  path: string
): void {
  const expectedPrefix = `${projectId}/${input.kind}/`;
  if (!path.startsWith(expectedPrefix)) throw new ActionError('FORBIDDEN');
  const tail = path.slice(expectedPrefix.length);
  if (!/^[0-9a-f-]{36}-[0-9a-f]{64}$/.test(tail))
    throw new ActionError('FORBIDDEN');
  const prefix = path.slice(0, -65);
  const provided = Buffer.from(path.slice(-64), 'hex');
  const expected = Buffer.from(signature(prefix, input), 'hex');
  if (!timingSafeEqual(provided, expected)) throw new ActionError('FORBIDDEN');
}
