import type { Metadata } from 'next';

import { PublicShell } from '@/components/ui/public-shell';
import { requireUser } from '@/lib/auth/session';
import { splitOAuthName } from '@/lib/profile/rules';

import { ProfileForm } from './profile-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Completa tu perfil',
  robots: { index: false, follow: false },
};

/**
 * Se muestra después del primer ingreso con Google o GitHub (el panel redirige
 * aquí mientras falten datos) y también sirve para editar el perfil más tarde.
 */
export default async function CompletarPerfilPage() {
  const user = await requireUser();

  // Si todavía no completó el perfil, se precarga con el nombre que trajo OAuth.
  const suggested = splitOAuthName(user.name);
  const initial = {
    firstName: user.firstName ?? suggested.firstName,
    lastName: user.lastName ?? suggested.lastName,
    university: user.university ?? '',
  };

  return (
    <PublicShell>
      <section className="inner-hero flex min-h-[70vh] items-center px-5 py-16">
        <div className="info-panel mx-auto w-full max-w-lg p-8 shadow-2xl sm:p-10">
          <span className="eyebrow text-purple-300">
            {user.profileComplete ? 'Tu perfil' : 'Un último paso'}
          </span>
          <h1 className="mt-3 text-3xl font-bold">
            {user.profileComplete ? 'Editar perfil' : 'Completa tu perfil'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Tus compañeros de equipo y la organización verán tus nombres,
            apellidos y universidad.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Ingresaste como {user.email}
          </p>

          <ProfileForm
            initial={initial}
            isEditing={user.profileComplete}
          />
        </div>
      </section>
    </PublicShell>
  );
}
