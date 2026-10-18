'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { updateProjectFlagsAction } from '@/lib/organizer/actions';

// Límite copiado de updateProjectFlagsSchema (winnerTitle: max 80), mismo caso
// que los límites de draft-form: el schema vive en un archivo 'use server'.
const MAX_TITLE = 80;

export function WinnerTitleForm({
  projectId,
  initialTitle,
}: {
  projectId: string;
  initialTitle: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [title, setTitle] = useState(initialTitle ?? '');
  const { run, pending, error, fieldErrors } = useAction(
    updateProjectFlagsAction
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    // Vacío = quitar el título (el schema acepta null).
    run({ projectId, winnerTitle: trimmed === '' ? null : trimmed }, () => {
      showToast(
        trimmed === '' ? 'Título quitado.' : 'Título guardado.',
        'success'
      );
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="org-winner-title-form"
      aria-busy={pending}
      className="space-y-3"
    >
      <Input
        id="winner-title"
        label="Título de ganador"
        data-testid="org-winner-title-input"
        placeholder="1.er puesto, Mención especial…"
        value={title}
        maxLength={MAX_TITLE}
        onChange={(e) => setTitle(e.target.value)}
        hint={`${MAX_TITLE - title.length} caracteres restantes · se muestra en la galería cuando se publican los resultados`}
        error={fieldErrors.winnerTitle?.[0]}
      />

      <Button
        type="submit"
        data-testid="org-winner-title-save"
        loading={pending}
      >
        {pending ? 'Guardando…' : 'Guardar título'}
      </Button>

      {error && (
        <p
          role="alert"
          data-testid="org-winner-title-error"
          className="text-sm text-red-300"
        >
          {error}
        </p>
      )}
    </form>
  );
}
