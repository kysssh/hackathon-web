'use client';

import { useState, useTransition } from 'react';

import { getErrorMessage } from '@/error-messages';
import type { ActionResult } from '@/actions';

/**
 * Envuelve el resultado estándar de una server action ({ ok, data } / { ok, error }).
 * Se encarga de: mostrar el toast con el texto en español, repartir los fieldErrors
 * y deshabilitar el botón mientras la acción corre (pending).
 *
 * Uso:
 *   const { run, pending, fieldErrors } = useAction(joinTeamAction)
 *   <Button disabled={pending} onClick={() => run({ joinCode })}>Unirme</Button>
 */
export function useAction<Input, Output>(
  action: (input: Input) => Promise<ActionResult<Output>>,
) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  function run(input: Input, onSuccess?: (data: Output) => void) {
    startTransition(async () => {
      const res = await action(input);

      if (!res.ok) {
        setFieldErrors(res.error.fieldErrors ?? {});
        // TODO: reemplazar por el Toast real de UX cuando exista en components/ui.
        console.error(getErrorMessage(res.error.code));
        return;
      }

      setFieldErrors({});
      onSuccess?.(res.data);
    });
  }

  return { run, pending, fieldErrors };
}
