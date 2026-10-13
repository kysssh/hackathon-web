'use client';

import { signOutAction } from '@/lib/auth/actions';

import { useAction } from './hooks/use-action';

export function SignOutButton() {
  const { run, pending } = useAction(signOutAction);

  return (
    <button
      type="button"
      data-testid="signout"
      disabled={pending}
      onClick={() => run({})}
      className="underline disabled:opacity-50"
    >
      {pending ? 'Saliendo…' : 'Cerrar sesión'}
    </button>
  );
}
