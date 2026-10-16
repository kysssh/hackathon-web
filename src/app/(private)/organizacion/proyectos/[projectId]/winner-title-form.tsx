'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
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
  const [title, setTitle] = useState(initialTitle ?? '');
  const { run, pending, error, fieldErrors } = useAction(updateProjectFlagsAction);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    // Vacío = quitar el título (el schema acepta null).
    run({ projectId, winnerTitle: trimmed === '' ? null : trimmed }, () => router.refresh());
  }

  return (
    <form onSubmit={handleSubmit} data-testid="org-winner-title-form" className="space-y-3">
      <label htmlFor="winner-title" className="text-sm text-slate-300">
        Título de ganador ({MAX_TITLE - title.length} caracteres restantes)
      </label>
      <input
        id="winner-title"
        data-testid="org-winner-title-input"
        className="w-full rounded border border-white/15 bg-transparent px-3 py-2"
        value={title}
        maxLength={MAX_TITLE}
        onChange={(e) => setTitle(e.target.value)}
      />
      {fieldErrors.winnerTitle && (
        <p className="text-sm text-red-300">{fieldErrors.winnerTitle[0]}</p>
      )}

      <button
        type="submit"
        data-testid="org-winner-title-save"
        disabled={pending}
        className="button-primary disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Guardar título'}
      </button>

      {error && (
        <p role="alert" data-testid="org-winner-title-error" className="text-sm text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
