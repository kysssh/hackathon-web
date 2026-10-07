'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicShell } from '@/components/ui/public-shell';
import { useAction } from '@/components/private/hooks/use-action';
import { signInAction } from '@/lib/auth/actions';

function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') ?? '/panel';
  const { run, pending, error } = useAction(signInAction);
  const handleSignIn = (provider: 'google' | 'github') => run({ provider, next });
  return <section className="inner-hero flex min-h-[70vh] items-center px-5 py-16"><div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2 lg:items-center"><div><span className="eyebrow text-purple-300">Tu punto de partida</span><h1 className="display-font mt-4 text-6xl uppercase leading-none sm:text-7xl">Entra y crea algo que trascienda</h1><p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">Accede a tu equipo y prepara tu proyecto con una cuenta de Google o GitHub. No necesitas crear otra contraseña.</p><div className="mt-9 flex flex-wrap gap-4 text-sm text-purple-200"><span>✳ Equipos de 2 a 5</span><span>✳ Código HACK-XXXX</span><span>✳ Cuatro criterios públicos</span></div></div><div className="info-panel mx-auto w-full max-w-md p-8 shadow-2xl sm:p-10"><span className="eyebrow text-purple-300">Plataforma de equipos</span><h2 className="mt-3 text-3xl font-bold">Ingresar</h2><p className="mt-3 text-sm leading-6 text-slate-300">Elige una cuenta para continuar. Si es tu primera vez, tu perfil se creará al ingresar.</p><div className="mt-8 grid gap-3"><button data-testid="signin-google" disabled={pending} className="button-light w-full disabled:opacity-50" onClick={() => handleSignIn('google')}>Continuar con Google</button><button data-testid="signin-github" disabled={pending} className="button-secondary w-full disabled:opacity-50" onClick={() => handleSignIn('github')}>Continuar con GitHub</button></div>{error && <p role="alert" data-testid="signin-error" className="mt-4 text-sm text-red-300">{error}</p>}<p className="mt-7 text-xs leading-5 text-slate-400">Al ingresar podrás crear un equipo o unirte mediante el código que te compartieron.</p></div></div></section>;
}

export default function IngresarPage() {
  return <PublicShell><Suspense fallback={<div className="section-wrap text-center">Cargando...</div>}><LoginForm /></Suspense></PublicShell>;
}
