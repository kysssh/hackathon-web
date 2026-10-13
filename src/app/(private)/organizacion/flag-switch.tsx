'use client';

import { useRouter } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
import { updateProjectFlagsAction } from '@/lib/organizer/actions';

type FlagField = 'isVisibleInGallery' | 'isFinalist' | 'isWinner';
type FlagsInput = Parameters<typeof updateProjectFlagsAction>[0];

// Se arma el objeto campo por campo (en vez de { [field]: value }) para que
// TypeScript compruebe que cada clave existe en el schema de BK.
function buildInput(projectId: string, field: FlagField, value: boolean): FlagsInput {
  if (field === 'isVisibleInGallery') return { projectId, isVisibleInGallery: value };
  if (field === 'isFinalist') return { projectId, isFinalist: value };
  return { projectId, isWinner: value };
}

export function FlagSwitch({
  projectId,
  field,
  checked,
  label,
}: {
  projectId: string;
  field: FlagField;
  checked: boolean;
  label: string;
}) {
  const router = useRouter();
  const { run, pending, error } = useAction(updateProjectFlagsAction);

  return (
    <div>
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        data-testid={`org-${field}-${projectId}`}
        checked={checked}
        disabled={pending}
        onChange={(e) => run(buildInput(projectId, field, e.target.checked), () => router.refresh())}
        className="h-4 w-4 cursor-pointer disabled:opacity-50"
      />
      {error && (
        <p role="alert" data-testid={`org-${field}-error-${projectId}`} className="mt-1 max-w-40 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
