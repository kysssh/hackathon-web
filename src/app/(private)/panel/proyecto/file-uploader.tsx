'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
import { eventConfig, type ProjectFileKind } from '@/config/event';
import {
  confirmUploadAction,
  createUploadUrlAction,
  deleteProjectFileAction,
} from '@/lib/files/actions';
import type { ProjectDto } from '@/lib/queries/dtos';

const KIND_LABEL: Record<ProjectFileKind, string> = {
  PITCH_DECK: 'Pitch deck',
  COVER_IMAGE: 'Portada',
  EXTRA: 'Archivo extra',
};

function formatMB(bytes: number) {
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

/**
 * Sube un archivo directo a Supabase desde el navegador (regla 3.3 del plan:
 * nunca se sube dentro de una server action).
 *
 * BLOQUEADO: @supabase/supabase-js todavía no está instalado en el proyecto
 * (confirmado en package.json) y createUploadUrlAction sigue devolviendo
 * { bucket, storagePath, token } falsos. La función de abajo asume el patrón
 * estándar de "signed upload URL" de Supabase Storage. En cuanto BD/BK
 * confirmen el contrato real, solo se reemplaza el cuerpo de esta función.
 *
 * CONTRATO enviado: instalar @supabase/supabase-js y confirmar si `token`
 * es compatible con `uploadToSignedUrl(path, token, file)`.
 */
async function uploadDirectToSupabase(params: {
  bucket: string;
  storagePath: string;
  token: string;
  file: File;
}): Promise<void> {
  // TODO: reemplazar por la subida real cuando el paquete esté instalado.
  // Ejemplo esperado (patrón estándar de Supabase Storage):
  //
  // const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY);
  // const { error } = await supabase.storage
  //   .from(params.bucket)
  //   .uploadToSignedUrl(params.storagePath, params.token, params.file);
  // if (error) throw error;

  console.warn(
    '[uploadDirectToSupabase] pendiente: @supabase/supabase-js no instalado. ' +
      'Simulando subida de',
    params.file.name,
  );
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export function FileUploader({
  kind,
  project,
}: {
  kind: ProjectFileKind;
  project: ProjectDto | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const createUrl = useAction(createUploadUrlAction);
  const confirm = useAction(confirmUploadAction);
  const remove = useAction(deleteProjectFileAction);

  const limits = eventConfig.files.limits[kind];
  const existing = project?.files.find((f) => f.kind === kind) ?? null;
  const locked = project?.submissionWindow.status === 'CLOSED';

  const allowedTypes: readonly string[] = limits.contentTypes;

  function validate(file: File): string | null {
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido. Se acepta: ${limits.contentTypes.join(', ')}.`;
    }
    if (file.size > limits.maxBytes) {
      return `El archivo pesa ${formatMB(file.size)}, el máximo es ${formatMB(limits.maxBytes)}.`;
    }
    return null;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo si falla
    if (!file) return;

    setLocalError(null);

    // Validación ANTES de cualquier llamada de red: un archivo rechazado
    // aquí nunca aparece en la pestaña Red del navegador.
    const problem = validate(file);
    if (problem) {
      setLocalError(problem);
      return;
    }

    setUploading(true);
    try {
      createUrl.run(
        {
          kind,
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        },
        async (urlData) => {
          await uploadDirectToSupabase({
            bucket: urlData.bucket,
            storagePath: urlData.storagePath,
            token: urlData.token,
            file,
          });

          confirm.run(
            {
              kind,
              fileName: file.name,
              contentType: file.type,
              sizeBytes: file.size,
              storagePath: urlData.storagePath,
            },
            () => router.refresh(),
          );
        },
      );
    } finally {
      setUploading(false);
    }
  }

  const busy = uploading || createUrl.pending || confirm.pending || remove.pending;

  return (
    <div data-testid={`uploader-${kind.toLowerCase()}`} className="info-panel p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{KIND_LABEL[kind]}</span>
        <span className="text-xs text-slate-400">
          Máx. {formatMB(limits.maxBytes)} · {limits.contentTypes.join(', ')}
        </span>
      </div>

      {existing ? (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span data-testid={`uploader-${kind.toLowerCase()}-filename`}>
            📎 {existing.originalName}
          </span>
          <button
            type="button"
            data-testid={`uploader-${kind.toLowerCase()}-remove`}
            disabled={busy || locked}
            onClick={() => remove.run({ fileId: existing.id }, () => router.refresh())}
            className="text-link text-xs disabled:opacity-50"
          >
            Quitar
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <input
            ref={inputRef}
            type="file"
            data-testid={`uploader-${kind.toLowerCase()}-input`}
            accept={limits.contentTypes.join(',')}
            disabled={busy || locked}
            onChange={handleFileChange}
            className="text-sm disabled:opacity-50"
          />
        </div>
      )}

      {busy && <p className="mt-2 text-xs text-slate-400">Subiendo…</p>}
      {locked && <p className="mt-2 text-xs text-slate-400">Las entregas ya cerraron.</p>}

      {(localError || createUrl.error || confirm.error || remove.error) && (
        <p
          role="alert"
          data-testid={`uploader-${kind.toLowerCase()}-error`}
          className="mt-2 text-sm text-red-300"
        >
          {localError || createUrl.error || confirm.error || remove.error}
        </p>
      )}
    </div>
  );
}
