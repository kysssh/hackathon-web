'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAction } from '@/components/private/hooks/use-action';
import { useSubmissionWindow } from '@/components/private/submission-window';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import type { ProjectDto } from '@/lib/queries/dtos';
import { saveProjectDraftAction } from '@/lib/project/actions';

import { describeMissingFields } from './field-labels';

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

const URL_FIELDS = [
  { field: 'repositoryUrl', label: 'Repositorio' },
  { field: 'demoUrl', label: 'Demo' },
  { field: 'videoUrl', label: 'Video' },
] as const;

function isValidOptionalUrl(value: string) {
  if (value.trim() === '') return true;
  try {
    const url = new URL(value);
    return (
      value.length <= 500 &&
      (url.protocol === 'http:' || url.protocol === 'https:')
    );
  } catch {
    return false;
  }
}

export function DraftForm({ project }: { project: ProjectDto | null }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { run, pending, error, fieldErrors } = useAction(
    saveProjectDraftAction
  );

  // Con el plazo cerrado (también cuando vence con la pantalla abierta) el borrador queda
  // en solo lectura. El servidor igual lo rechaza con SUBMISSION_CLOSED.
  const windowState = useSubmissionWindow(project?.submissionWindow ?? null);
  const locked = windowState?.status === 'CLOSED';

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
  const [localErrors, setLocalErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (form.title.trim().length === 0)
      next.title = 'El título es obligatorio.';
    else if (form.title.length > LIMITS.title)
      next.title = `Máximo ${LIMITS.title} caracteres.`;

    if (form.summary.length > LIMITS.summary) {
      next.summary = `El resumen supera el máximo de ${LIMITS.summary} caracteres.`;
    }

    if (form.description.length > LIMITS.description) {
      next.description = `La descripción supera el máximo de ${LIMITS.description} caracteres.`;
    }

    for (const { field } of URL_FIELDS) {
      if (!isValidOptionalUrl(form[field]))
        next[field] = 'Ingresa una URL válida.';
    }

    setLocalErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;
    if (!validate()) return; // avisa antes de enviar, nunca llega al servidor
    run(form, () => {
      showToast('Borrador guardado.', 'success');
      router.refresh();
    });
  }

  const errorFor = (key: keyof FormState) =>
    localErrors[key] ?? fieldErrors[key]?.[0];
  const summaryLeft = LIMITS.summary - form.summary.length;
  const summaryError = errorFor('summary');

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="project-draft-form"
      aria-busy={pending}
      className="max-w-2xl space-y-5"
    >
      {locked && (
        <div
          role="status"
          data-testid="project-draft-locked"
          className="rounded-[10px] border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100"
        >
          Las entregas cerraron: el borrador quedó en solo lectura.
        </div>
      )}

      {!locked && project && project.missingFields.length > 0 && (
        <div
          data-testid="project-missing-fields"
          className="rounded-[10px] border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-100"
        >
          Todavía falta: {describeMissingFields(project.missingFields)}.
        </div>
      )}

      <Input
        id="title"
        label="Título"
        data-testid="project-title"
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        maxLength={LIMITS.title}
        readOnly={locked}
        error={errorFor('title')}
      />

      {/* El contenedor lleva el testid del error del resumen (el texto lo pinta Textarea). */}
      <div data-testid={summaryError ? 'project-summary-error' : undefined}>
        <Textarea
          id="summary"
          label="Resumen"
          data-testid="project-summary"
          rows={3}
          value={form.summary}
          onChange={(e) => update('summary', e.target.value)}
          readOnly={locked}
          hint={`${summaryLeft} caracteres restantes`}
          error={summaryError}
        />
      </div>

      <Textarea
        id="description"
        label="Descripción"
        data-testid="project-description"
        rows={6}
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        readOnly={locked}
        error={errorFor('description')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {URL_FIELDS.map(({ field, label }) => (
          <Input
            key={field}
            id={field}
            label={label}
            data-testid={`project-${field}`}
            value={form[field]}
            onChange={(e) => update(field, e.target.value)}
            placeholder="https://…"
            readOnly={locked}
            error={errorFor(field)}
          />
        ))}
      </div>

      {!locked && (
        <Button
          type="submit"
          data-testid="project-draft-save"
          loading={pending}
        >
          {pending ? 'Guardando…' : 'Guardar borrador'}
        </Button>
      )}

      {error && (
        <p
          role="alert"
          data-testid="project-draft-error"
          className="text-sm text-red-300"
        >
          {error}
        </p>
      )}
    </form>
  );
}
