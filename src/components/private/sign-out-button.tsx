'use client';

import { useAction } from '@/components/private/hooks/use-action';
import { Button } from '@/components/ui/button';
import { signOutAction } from '@/lib/auth/actions';

export function SignOutButton() {
  const { run, pending, error } = useAction(signOutAction);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        data-testid="signout"
        loading={pending}
        onClick={() => run({})}
      >
        {pending ? 'Saliendo…' : 'Cerrar sesión'}
      </Button>
      {error && (
        <span role="alert" className="text-xs text-red-300">
          {error}
        </span>
      )}
    </div>
  );
}
