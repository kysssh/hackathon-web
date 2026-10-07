'use client';

import { useAction } from '@/components/private/hooks/use-action';
import { signOutAction } from '@/lib/auth/actions';

export function SignOutButton() {
  const { run, pending, error } = useAction(signOutAction);
  return <div><button type="button" className="text-purple-200 underline underline-offset-4 disabled:opacity-50" disabled={pending} onClick={() => run({})}>Salir</button>{error && <span role="alert" className="ml-2 text-xs text-red-300">{error}</span>}</div>;
}
