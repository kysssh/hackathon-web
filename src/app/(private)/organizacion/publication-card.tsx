'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { updateEventStateAction } from '@/lib/organizer/actions';

type StateField = 'finalistsPublished' | 'resultsPublished';
type StateInput = Parameters<typeof updateEventStateAction>[0];

type PublicationItem = {
  isPublished: boolean;
  /** Fecha ya formateada en el servidor con formatEventDate (evita desfases de zona horaria). */
  publishedLabel: string | null;
  /** Qué pasará al publicar / despublicar (calculado en la página con los datos reales). */
  publishNotes: string[];
  unpublishNotes: string[];
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
  publishedWord,
  item,
}: {
  field: StateField;
  slug: 'finalists' | 'results';
  title: string;
  /** "publicados" / "despublicados" concordando con el título, para el aviso. */
  publishedWord: string;
  item: PublicationItem;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const { run, pending, error } = useAction(updateEventStateAction);

  const nextValue = !item.isPublished;
  const notes = nextValue ? item.publishNotes : item.unpublishNotes;

  function handleConfirm() {
    run(buildInput(field, nextValue), () => {
      setOpen(false);
      showToast(
        `${title} ${nextValue ? publishedWord : `des${publishedWord}`}.`,
        'success'
      );
      router.refresh();
    });
  }

  return (
    <div data-testid={`org-publication-${slug}`} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium">{title}</p>
          <p data-testid={`org-publication-${slug}-status`}>
            {item.isPublished && item.publishedLabel ? (
              <Badge tone="success">Publicado el {item.publishedLabel}</Badge>
            ) : (
              <Badge tone="neutral">No publicado</Badge>
            )}
          </p>
        </div>

        <Button
          type="button"
          variant={item.isPublished ? 'secondary' : 'primary'}
          data-testid={`org-publication-${slug}-open`}
          onClick={() => setOpen(true)}
        >
          {item.isPublished ? 'Despublicar' : 'Publicar'}
        </Button>
      </div>

      <Dialog
        open={open}
        onClose={() => {
          if (!pending) setOpen(false);
        }}
        title={`${nextValue ? 'Publicar' : 'Despublicar'} ${title.toLowerCase()}`}
        description="Esto cambia lo que ve el público en la galería."
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              data-testid={`org-publication-${slug}-cancel`}
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              data-testid={`org-publication-${slug}-confirm`}
              loading={pending}
              onClick={handleConfirm}
            >
              {pending
                ? 'Guardando…'
                : nextValue
                  ? 'Sí, publicar'
                  : 'Sí, despublicar'}
            </Button>
          </>
        }
      >
        <ul
          data-testid={`org-publication-${slug}-notes`}
          className="list-disc space-y-1 pl-5"
        >
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        {error && (
          <p
            role="alert"
            data-testid={`org-publication-${slug}-error`}
            className="mt-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}
      </Dialog>
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
    <div data-testid="org-publication-card" className="info-panel space-y-6">
      <h2 className="font-medium">Publicación en la galería</h2>
      <PublicationRow
        field="finalistsPublished"
        slug="finalists"
        title="Finalistas"
        publishedWord="publicados"
        item={finalists}
      />
      <hr className="border-white/10" />
      <PublicationRow
        field="resultsPublished"
        slug="results"
        title="Resultados"
        publishedWord="publicados"
        item={results}
      />
    </div>
  );
}
