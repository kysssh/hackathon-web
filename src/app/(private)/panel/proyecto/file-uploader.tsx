'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
import { eventConfig, type ProjectFileKind } from '@/config/event';
import { getErrorMessage } from '@/error-messages';
import {
  confirmUploadAction,
  createUploadUrlAction,
  deleteProjectFileAction,
} from '@/lib/files/actions';
import type { ProjectDto } from '@/lib/queries/dtos';

import {
  UploadError,
  uploadToSignedUrl,
  type SignedUpload,
  type StorageConfig,
} from './storage-upload';

const KIND_LABEL: Record<ProjectFileKind, string> = {
  PITCH_DECK: 'Pitch deck',
  COVER_IMAGE: 'Portada',
  EXTRA: 'Archivos extra',
};

const KIND_HINT: Record<ProjectFileKind, string> = {
  PITCH_DECK: 'Obligatorio para enviar el proyecto.',
  COVER_IMAGE: 'Se muestra en la galería pública.',
  EXTRA: 'Material de apoyo opcional.',
};

type Phase = 'idle' | 'authorizing' | 'uploading' | 'confirming';
type FailedPhase = Exclude<Phase, 'idle'>;
type Failure = { phase: FailedPhase; message: string };

const FAILURE_TITLE: Record<FailedPhase, string> = {
  authorizing: 'No se pudo autorizar la subida',
  uploading: 'Falló la subida del archivo',
  confirming: 'Falló la confirmación del archivo',
};

const PHASE_LABEL = {
  authorizing: 'Autorizando la subida…',
  confirming: 'Confirmando el archivo…',
} as const;

const NETWORK_MESSAGE =
  'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';

function formatMB(bytes: number) {
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

/** Intento en curso: recuerda hasta dónde llegó para reanudar solo lo que falló. */
type Attempt = {
  file: File;
  signed: SignedUpload | null; // se llena tras autorizar
  uploaded: boolean; // true tras subir a Storage
};

function FileRow({
  file,
  disabled,
}: {
  file: ProjectDto['files'][number];
  disabled: boolean;
}) {
  const router = useRouter();
  const { run, pending, error } = useAction(deleteProjectFileAction);

  return (
    <li
      data-testid={`uploader-file-${file.id}`}
      className="flex flex-wrap items-center justify-between gap-2 text-sm"
    >
      <span className="min-w-0 truncate">
        📎 {file.originalName}{' '}
        <span className="text-xs text-slate-400">({formatMB(file.sizeBytes)})</span>
      </span>
      <button
        type="button"
        data-testid={`uploader-file-remove-${file.id}`}
        disabled={disabled || pending}
        onClick={() => run({ fileId: file.id }, () => router.refresh())}
        className="text-link text-xs disabled:opacity-50"
      >
        {pending ? 'Quitando…' : 'Quitar'}
      </button>
      {error && (
        <p role="alert" className="w-full text-xs text-red-300">
          {error}
        </p>
      )}
    </li>
  );
}

export function FileUploader({
  kind,
  project,
  storage,
}: {
  kind: ProjectFileKind;
  project: ProjectDto | null;
  /** URL y llave publicable de Supabase (públicas por diseño). null = sin configurar. */
  storage: StorageConfig | null;
}) {
  const router = useRouter();
  const slug = kind.toLowerCase();
  const limits = eventConfig.files.limits[kind];
  const allowedTypes: readonly string[] = limits.contentTypes;
  const maxFiles = kind === 'EXTRA' ? eventConfig.files.maxExtraFiles : 1;

  const files = project?.files.filter((f) => f.kind === kind) ?? [];
  const closed = project?.submissionWindow.status === 'CLOSED';
  const canAdd = project !== null && !closed && files.length < maxFiles;

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const attemptRef = useRef<Attempt | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Si el usuario sale de la pantalla en medio de una subida, se cancela la petición.
  useEffect(() => () => abortRef.current?.abort(), []);

  const busy = phase !== 'idle';

  function validate(file: File): string | null {
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido. Se acepta: ${allowedTypes.join(', ')}.`;
    }
    if (file.size > limits.maxBytes) {
      return `El archivo pesa ${formatMB(file.size)}, el máximo es ${formatMB(limits.maxBytes)}.`;
    }
    if (file.size === 0) {
      return 'El archivo está vacío.';
    }
    return null;
  }

  function fail(failedPhase: FailedPhase, message: string) {
    setFailure({ phase: failedPhase, message });
    setPhase('idle');
  }

  function reset() {
    attemptRef.current = null;
    setFailure(null);
    setLocalError(null);
    setProgress(0);
    setPhase('idle');
  }

  /** Ejecuta autorización → subida → confirmación, retomando donde se quedó. */
  async function execute() {
    const attempt = attemptRef.current;
    if (!attempt) return;
    const { file } = attempt;

    const meta = {
      kind,
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    };

    setFailure(null);

    // 1. Autorización (server action)
    if (!attempt.signed) {
      setPhase('authorizing');
      try {
        const res = await createUploadUrlAction(meta);
        if (!res.ok) return fail('authorizing', getErrorMessage(res.error.code));
        attempt.signed = res.data;
      } catch {
        return fail('authorizing', NETWORK_MESSAGE);
      }
    }

    // 2. Subida directa del navegador a Supabase Storage
    //    (el archivo nunca viaja dentro de una server action).
    if (!attempt.uploaded) {
      if (!storage) {
        return fail(
          'uploading',
          'El almacenamiento no está configurado (faltan SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY).',
        );
      }
      setPhase('uploading');
      setProgress(0);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        await uploadToSignedUrl({
          storage,
          signed: attempt.signed,
          file,
          signal: controller.signal,
          onProgress: setProgress,
        });
        attempt.uploaded = true;
      } catch (error) {
        abortRef.current = null;
        if (error instanceof UploadError && error.reason === 'aborted') {
          return reset(); // cancelado por el usuario: no es un error
        }
        // El token pudo vencer o consumirse: el próximo intento vuelve a autorizar.
        attempt.signed = null;
        return fail(
          'uploading',
          error instanceof UploadError ? error.message : NETWORK_MESSAGE,
        );
      }
      abortRef.current = null;
    }

    // 3. Confirmación (server action): registra el archivo ya subido.
    setPhase('confirming');
    try {
      const res = await confirmUploadAction({
        ...meta,
        storagePath: attempt.signed.storagePath,
      });
      if (!res.ok) return fail('confirming', getErrorMessage(res.error.code));
    } catch {
      return fail('confirming', NETWORK_MESSAGE);
    }

    reset();
    router.refresh();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo tras un fallo
    if (!file) return;

    setLocalError(null);

    // Validación ANTES de cualquier llamada de red: un archivo rechazado aquí
    // nunca aparece en la pestaña Red del navegador.
    const problem = validate(file);
    if (problem) {
      setLocalError(problem);
      return;
    }

    attemptRef.current = { file, signed: null, uploaded: false };
    void execute();
  }

  return (
    <div data-testid={`uploader-${slug}`} className="info-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">{KIND_LABEL[kind]}</span>
        <span className="text-xs text-slate-400">
          Máx. {formatMB(limits.maxBytes)} · {allowedTypes.join(', ')}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {KIND_HINT[kind]}
        {kind === 'EXTRA' && ` Hasta ${maxFiles} archivos (${files.length}/${maxFiles}).`}
      </p>

      {files.length > 0 && (
        <ul data-testid={`uploader-${slug}-list`} className="mt-3 space-y-2">
          {files.map((f) => (
            <FileRow key={f.id} file={f} disabled={busy || closed} />
          ))}
        </ul>
      )}

      {canAdd && !failure && (
        <div className="mt-3">
          <input
            type="file"
            data-testid={`uploader-${slug}-input`}
            aria-label={`Elegir ${KIND_LABEL[kind].toLowerCase()}`}
            accept={allowedTypes.join(',')}
            disabled={busy}
            onChange={handleFileChange}
            className="text-sm disabled:opacity-50"
          />
        </div>
      )}

      {project === null && (
        <p data-testid={`uploader-${slug}-needs-draft`} className="mt-3 text-xs text-slate-400">
          Guarda el borrador del proyecto para poder subir archivos.
        </p>
      )}
      {closed && <p className="mt-3 text-xs text-slate-400">Las entregas ya cerraron.</p>}
      {project !== null && !closed && files.length >= maxFiles && (
        <p className="mt-3 text-xs text-slate-400">
          {kind === 'EXTRA'
            ? 'Alcanzaste el máximo de archivos. Quita uno para subir otro.'
            : 'Para reemplazarlo, quita primero el archivo actual.'}
        </p>
      )}

      {/* Estado de la subida */}
      {(phase === 'authorizing' || phase === 'confirming') && (
        <p
          role="status"
          data-testid={`uploader-${slug}-phase`}
          className="mt-3 text-sm text-slate-300"
        >
          {PHASE_LABEL[phase]}
        </p>
      )}

      {phase === 'uploading' && (
        <div className="mt-3 space-y-2" data-testid={`uploader-${slug}-phase`}>
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span role="status">Subiendo… {progress}%</span>
            <button
              type="button"
              data-testid={`uploader-${slug}-cancel`}
              onClick={() => abortRef.current?.abort()}
              className="text-link text-xs"
            >
              Cancelar
            </button>
          </div>
          <progress
            data-testid={`uploader-${slug}-progress`}
            aria-label={`Progreso de subida de ${KIND_LABEL[kind].toLowerCase()}`}
            value={progress}
            max={100}
            className="h-2 w-full"
          />
        </div>
      )}

      {/* Errores: local (antes de red) o por fase */}
      {localError && (
        <p
          role="alert"
          data-testid={`uploader-${slug}-error`}
          className="mt-3 text-sm text-red-300"
        >
          {localError}
        </p>
      )}

      {failure && (
        <div role="alert" data-testid={`uploader-${slug}-error`} className="mt-3 space-y-2">
          <p className="text-sm font-medium text-red-300">{FAILURE_TITLE[failure.phase]}</p>
          <p className="text-sm text-red-300">{failure.message}</p>
          <div className="flex gap-3">
            <button
              type="button"
              data-testid={`uploader-${slug}-retry`}
              onClick={() => void execute()}
              className="button-primary"
            >
              {failure.phase === 'confirming' ? 'Reintentar confirmación' : 'Reintentar'}
            </button>
            <button
              type="button"
              data-testid={`uploader-${slug}-discard`}
              onClick={reset}
              className="button-secondary"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

