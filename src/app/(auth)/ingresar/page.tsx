'use client';

// TODO: reemplazar signIn (de next-auth/react) por signInAction cuando BK lo
// publique en src/lib/auth/actions.ts. La firma pactada es:
//   signInAction({ provider, next? })
// Mientras tanto, esto ya cumple la verificación de S1: los botones llaman
// al proveedor correcto y respetan ?next=.
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function IngresarPage() {
  const params = useSearchParams();
  const next = params.get('next') ?? '/panel';

  return (
    <div className="mx-auto mt-24 max-w-sm text-center">
      <h1 className="text-xl font-semibold mb-6">Ingresar</h1>

      <button
        data-testid="signin-google"
        className="mb-3 w-full rounded border py-2"
        onClick={() => signIn('google', { callbackUrl: next })}
      >
        Continuar con Google
      </button>

      <button
        data-testid="signin-github"
        className="w-full rounded border py-2"
        onClick={() => signIn('github', { callbackUrl: next })}
      >
        Continuar con GitHub
      </button>
    </div>
  );
}
