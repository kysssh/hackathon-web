'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAction } from '@/components/private/hooks/use-action';
import type { ProjectDto } from '@/components/private/temp-stubs';
import { saveProjectDraftAction } from '@/lib/project/actions';

/**
 * Límites copiados a mano de src/lib/project/actions.ts (saveProjectDraftSchema),
 * porque ese archivo es 'use server' y no se puede importar un schema desde el cliente.
 * CONTRATO enviado a BK: mover los límites a src/lib/project/schemas.ts para no duplicarlos.
 * Si BK cambia un número allá y no avisa, esta validación del cliente queda desfasada.
 */
const LIMITS = {
  title: 120,
  summary: 280,
  description: 5000,
} as const;

type FormState = {
  title: string;
  summary: string;
  description: string;
  repositoryUrl: string;
  demoUrl: string;
  videoUrl: string;
};

function isValidOptionalUrl(value: string) {
  if (value.trim() === '') return true;
  try {
    new URL(value);
    return value.length <= 500;
  } catch {
    return false;
  }
}

export function DraftForm({ project }: { project: ProjectDto | null }) {
  const router = useRouter();
  const { run, pending, error, fieldErrors } = useAction(saveProjectDraftAction);

  const [form, setForm] = useState<FormState>({
    title: project?.title ?? '',
    summary: project?.summary ?? '',
    description: project?.description ?? '',
    repositoryUrl: project?.repositoryUrl ?? '',
    demoUrl: project?.demoUrl ?? '',
    videoUrl: project?.videoUrl ?? '',
  });

  // Validación local, antes de tocar al servidor. No repite los códigos de BK,
  // solo evita el viaje de red cuando el problema ya se ve en el navegador.
  const [localErrors, setLocalErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (form.title.trim().length === 0) next.title = 'El título es obligatorio.';
    else if (form.title.length > LIMITS.title) next.title = `Máximo ${LIMITS.title} caracteres.`;

    if (form.summary.length > LIMITS.summary) {
      next.summary = `El resumen supera el máximo de ${LIMITS.summary} caracteres.`;
    }

    if (form.description.length > LIMITS.description) {
      next.description = `La descripción supera el máximo de ${LIMITS.description} caracteres.`;
    }

    if (!isValidOptionalUrl(form.repositoryUrl)) next.repositoryUrl = 'Ingresa una URL válida.';
    if (!isValidOptionalUrl(form.demoUrl)) next.demoUrl = 'Ingresa una URL válida.';
    if (!isValidOptionalUrl(form.videoUrl)) next.videoUrl = 'Ingresa una URL válida.';

    setLocalErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return; // avisa antes de enviar, nunca llega al servidor
    run(form, () => router.refresh());
  }

  const summaryLeft = LIMITS.summary - form.summary.length;

  return (
    <form onSubmit={handleSubmit} data-testid="project-draft-form" className="space-y-5 max-w-2xl">
      <div>
        <label htmlFor="title" className="text-sm text-zinc-500">Título</label>
        <input
          id="title"
          data-testid="project-title"
          className="mt-1 w-full rounded border px-3 py-2"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          maxLength={LIMITS.title}
        />
        {(localErrors.title ?? fieldErrors.title?.[0]) && (
          <p className="mt-1 text-sm text-red-600">{localErrors.title ?? fieldErrors.title?.[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="summary" className="text-sm text-zinc-500">
          Resumen ({summaryLeft} caracteres restantes)
        </label>
        <textarea
          id="summary"
          data-testid="project-summary"
          className="mt-1 w-full rounded border px-3 py-2"
          rows={3}
          value={form.summary}
          onChange={(e) => update('summary', e.target.value)}
        />
        {(localErrors.summary ?? fieldErrors.summary?.[0]) && (
          <p data-testid="project-summary-error" className="mt-1 text-sm text-red-600">
            {localErrors.summary ?? fieldErrors.summary?.[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="text-sm text-zinc-500">Descripción</label>
        <textarea
          id="description"
          data-testid="project-description"
          className="mt-1 w-full rounded border px-3 py-2"
          rows={6}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
        {(localErrors.description ?? fieldErrors.description?.[0]) && (
          <p className="mt-1 text-sm text-red-600">
            {localErrors.description ?? fieldErrors.description?.[0]}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(['repositoryUrl', 'demoUrl', 'videoUrl'] as const).map((field) => (
          <div key={field}>
            <label htmlFor={field} className="text-sm text-zinc-500">
              {field === 'repositoryUrl' ? 'Repositorio' : field === 'demoUrl' ? 'Demo' : 'Video'}
            </label>
            <input
              id={field}
              data-testid={`project-${field}`}
              className="mt-1 w-full rounded border px-3 py-2"
              value={form[field]}
              onChange={(e) => update(field, e.target.value)}
              placeholder="https://…"
            />
            {(localErrors[field] ?? fieldErrors[field]?.[0]) && (
              <p className="mt-1 text-sm text-red-600">
                {localErrors[field] ?? fieldErrors[field]?.[0]}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        data-testid="project-draft-save"
        disabled={pending}
        className="rounded border px-4 py-2 disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Guardar borrador'}
      </button>

      {error && (
        <p role="alert" data-testid="project-draft-error" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
