'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { useAction } from '@/components/private/hooks/use-action';
import { Button } from '@/components/ui/button';
import { PublicShell } from '@/components/ui/public-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { signInAction } from '@/lib/auth/actions';

/**
 * Auth.js devuelve a /ingresar con ?error=<código> cuando el ingreso falla
 * (por ejemplo, la persona cancela en Google o el correo ya se usó con otro proveedor).
 */
const AUTH_ERRORS: Record<string, string> = {
  AccessDenied: 'No tienes permiso para ingresar con esa cuenta.',
  OAuthAccountNotLinked:
    'Ese correo ya se registró con otro proveedor. Ingresa con el que usaste la primera vez.',
  Configuration:
    'El ingreso no está disponible por ahora. Avisa a la organización.',
};
const DEFAULT_AUTH_ERROR =
  'No pudimos completar el ingreso. Inténtalo de nuevo.';

function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') ?? '/panel';
  const authErrorCode = params.get('error');
  const { run, pending, error } = useAction(signInAction);

  const handleSignIn = (provider: 'google' | 'github') =>
    run({ provider, next });

  return (
    <section className="inner-hero flex min-h-[70vh] items-center px-5 py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="eyebrow text-purple-300">Tu punto de partida</span>
          <h1 className="display-font mt-4 text-6xl uppercase leading-none sm:text-7xl">
            Entra y crea algo que trascienda
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Accede a tu equipo y prepara tu proyecto con una cuenta de Google o
            GitHub. No necesitas crear otra contraseña.
          </p>
          <div className="mt-9 flex flex-wrap gap-4 text-sm text-purple-200">
            <span>✳ Equipos de 2 a 5</span>
            <span>✳ Código HACK-XXXX</span>
            <span>✳ Cuatro criterios públicos</span>
          </div>
        </div>

        <div className="info-panel mx-auto w-full max-w-md p-8 shadow-2xl sm:p-10">
          <span className="eyebrow text-purple-300">Plataforma de equipos</span>
          <h2 className="mt-3 text-3xl font-bold">Ingresar</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Elige una cuenta para continuar. Si es tu primera vez, tu perfil se
            creará al ingresar.
          </p>

          {authErrorCode && (
            <p
              role="alert"
              data-testid="signin-callback-error"
              className="mt-6 rounded-[10px] border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100"
            >
              {AUTH_ERRORS[authErrorCode] ?? DEFAULT_AUTH_ERROR}
            </p>
          )}

          <div className="mt-8 grid gap-3">
            <Button
              variant="light"
              data-testid="signin-google"
              disabled={pending}
              className="w-full"
              onClick={() => handleSignIn('google')}
            >
              Continuar con Google
            </Button>
            <Button
              variant="secondary"
              data-testid="signin-github"
              disabled={pending}
              className="w-full"
              onClick={() => handleSignIn('github')}
            >
              Continuar con GitHub
            </Button>
          </div>

          {error && (
            <p
              role="alert"
              data-testid="signin-error"
              className="mt-4 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <p className="mt-7 text-xs leading-5 text-slate-400">
            Al ingresar podrás crear un equipo o unirte mediante el código que
            te compartieron.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function IngresarPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <div role="status" className="section-wrap">
            <span className="sr-only">Cargando…</span>
            <Skeleton className="mx-auto h-64 w-full max-w-md" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </PublicShell>
  );
}
