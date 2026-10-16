'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
import { updateEventStateAction } from '@/lib/organizer/actions';

type StateField = 'finalistsPublished' | 'resultsPublished';
type StateInput = Parameters<typeof updateEventStateAction>[0];

type PublicationItem = {
  isPublished: boolean;
  /** Fecha ya formateada en el servidor con formatEventDate (evita desfases de zona horaria). */
  publishedLabel: string | null;
};

function buildInput(field: StateField, value: boolean): StateInput {
  return field === 'finalistsPublished'
    ? { finalistsPublished: value }
    : { resultsPublished: value };
}

function PublicationRow({
  field,
  slug,
  title,
  effect,
  item,
}: {
  field: StateField;
  slug: 'finalists' | 'results';
  title: string;
  effect: string;
  item: PublicationItem;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const { run, pending, error } = useAction(updateEventStateAction);

  const nextValue = !item.isPublished;

  return (
    <div data-testid={`org-publication-${slug}`} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">{title}</p>
          <p data-testid={`org-publication-${slug}-status`} className="text-sm text-slate-400">
            {item.isPublished && item.publishedLabel
              ? `Publicado el ${item.publishedLabel}`
              : 'No publicado'}
          </p>
        </div>

        {!confirming && (
          <button
            type="button"
            data-testid={`org-publication-${slug}-open`}
            onClick={() => setConfirming(true)}
            className={item.isPublished ? 'button-secondary' : 'button-primary'}
          >
            {item.isPublished ? 'Despublicar' : 'Publicar'}
          </button>
        )}
      </div>

      {confirming && (
        <div className="space-y-3 rounded border border-white/10 p-4">
          <p className="text-sm">
            {nextValue
              ? `Publicar ${title.toLowerCase()} ${effect}. ¿Confirmas?`
              : `Despublicar ${title.toLowerCase()} los esconde de la galería pública. ¿Confirmas?`}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              data-testid={`org-publication-${slug}-confirm`}
              disabled={pending}
              onClick={() =>
                run(buildInput(field, nextValue), () => {
                  setConfirming(false);
                  router.refresh();
                })
              }
              className="button-primary disabled:opacity-50"
            >
              {pending ? 'Guardando…' : nextValue ? 'Sí, publicar' : 'Sí, despublicar'}
            </button>
            <button
              type="button"
              data-testid={`org-publication-${slug}-cancel`}
              disabled={pending}
              onClick={() => setConfirming(false)}
              className="button-secondary disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" data-testid={`org-publication-${slug}-error`} className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

export function PublicationCard({
  finalists,
  results,
}: {
  finalists: PublicationItem;
  results: PublicationItem;
}) {
  return (
    <div data-testid="org-publication-card" className="info-panel space-y-6 p-6">
      <h2 className="font-medium">Publicación en la galería</h2>
      <PublicationRow
        field="finalistsPublished"
        slug="finalists"
        title="Finalistas"
        effect="los muestra en la galería pública"
        item={finalists}
      />
      <hr className="border-white/10" />
      <PublicationRow
        field="resultsPublished"
        slug="results"
        title="Resultados"
        effect="muestra a los ganadores en la galería pública"
        item={results}
      />
    </div>
  );
}
