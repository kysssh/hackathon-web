'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
import { signInAction } from '@/lib/auth/actions';

function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') ?? '/panel';
  const { run, pending, error } = useAction(signInAction);

  const handleSignIn = (provider: 'google' | 'github') => run({ provider, next });

  return (
    <div className="mx-auto mt-24 max-w-sm text-center">
      <h1 className="text-xl font-semibold mb-6">Ingresar</h1>

      <button
        data-testid="signin-google"
        disabled={pending}
        className="mb-3 w-full rounded border py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        onClick={() => handleSignIn('google')}
      >
        Continuar con Google
      </button>

      <button
        data-testid="signin-github"
        disabled={pending}
        className="w-full rounded border py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        onClick={() => handleSignIn('github')}
      >
        Continuar con GitHub
      </button>

      {error && (
        <p role="alert" data-testid="signin-error" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// Suspense es obligatorio al usar useSearchParams en un componente de cliente.
export default function IngresarPage() {
  return (
    <Suspense fallback={<div className="text-center mt-24">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
