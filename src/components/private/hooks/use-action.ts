'use client';

import { useState, useTransition } from 'react';

import { getErrorMessage } from '@/error-messages';
import type { ActionResult } from '@/actions';

/**
 * Envuelve el resultado estándar de una server action ({ ok, data } / { ok, error }).
 * Se encarga de: traducir el código de error a español (error), repartir los
 * fieldErrors y deshabilitar el botón mientras la acción corre (pending).
 *
 * Uso:
 *   const { run, pending, error, fieldErrors } = useAction(joinTeamAction)
 *   <Button disabled={pending} onClick={() => run({ joinCode })}>Unirme</Button>
 *   {error && <p role="alert">{error}</p>}
 */
export function useAction<Input, Output>(
  action: (input: Input) => Promise<ActionResult<Output>>,
) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(input: Input, onSuccess?: (data: Output) => void) {
    startTransition(async () => {
      const res = await action(input);

      if (!res.ok) {
        setFieldErrors(res.error.fieldErrors ?? {});
        // TODO: cuando UX publique el Toast en components/ui, mostrarlo aquí también.
        setError(getErrorMessage(res.error.code));
        return;
      }

      setFieldErrors({});
      setError(null);
      onSuccess?.(res.data);
    });
  }

  return { run, pending, error, fieldErrors };
}

