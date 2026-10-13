'use client';

import { signOutAction } from '@/lib/auth/actions';

import { useAction } from './hooks/use-action';

export function SignOutButton() {
  const { run, pending, error } = useAction(signOutAction);

  return (
    <div>
      <button
        type="button"
        data-testid="signout"
        disabled={pending}
        onClick={() => run({})}
        className="text-purple-200 underline underline-offset-4 disabled:opacity-50"
      >
        {pending ? 'Saliendo…' : 'Cerrar sesión'}
      </button>
      {error && <span role="alert" className="ml-2 text-xs text-red-300">{error}</span>}
    </div>
  );
}
