'use client';

import { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

// Componente interno que consume useSearchParams
function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') ?? '/panel';

  // TODO: Reemplazar por signInAction({ provider, next }) cuando esté disponible
  const handleSignIn = (provider: string) => {
    signIn(provider, { callbackUrl: next });
  };

  return (
    <div className="mx-auto mt-24 max-w-sm text-center">
      <h1 className="text-xl font-semibold mb-6">Ingresar</h1>

      <button
        data-testid="signin-google"
        className="mb-3 w-full rounded border py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        onClick={() => handleSignIn('google')}
      >
        Continuar con Google
      </button>

      <button
        data-testid="signin-github"
        className="w-full rounded border py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        onClick={() => handleSignIn('github')}
      >
        Continuar con GitHub
      </button>
    </div>
  );
}

// Componente principal envuelto en Suspense (Obligatorio con useSearchParams)
export default function IngresarPage() {
  return (
    <Suspense fallback={<div className="text-center mt-24">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}