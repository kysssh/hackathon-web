'use client'; // Los límites de error son Client Components.

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

// Ojo: en esta versión de Next el prop se llama "retry" no "reset"
// (confirmado en node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md).
export default function PrivateError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      data-testid="private-error"
      role="alert"
      className="space-y-4 p-6 text-center"
    >
      <p>Algo salió mal de nuestro lado. Inténtalo de nuevo.</p>
      <Button
        type="button"
        data-testid="private-error-retry"
        onClick={() => retry()}
      >
        Reintentar
      </Button>
    </div>
  );
}
