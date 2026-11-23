import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { NavLinks, type NavItem } from '@/components/private/nav-links';
import { ROLE_LABEL } from '@/components/private/role-label';
import { SignOutButton } from '@/components/private/sign-out-button';
import { Badge } from '@/components/ui/badge';
import { ToastProvider } from '@/components/ui/toast';
import { needsProfile, requireUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  // Recién registrado con Google/GitHub: primero nombres, apellidos y universidad.
  if (needsProfile(user)) redirect('/completar-perfil');

  // Los enlaces dependen del rol: Jurado solo para jurados, Organización solo para organizadores.
  const items: NavItem[] = [
    { href: '/panel', label: 'Panel', match: ['/panel'] },
    { href: '/informacion', label: 'Información' },
    { href: '/cronograma', label: 'Cronograma' },
    { href: '/galeria', label: 'Galería', match: ['/galeria'] },
  ];
  if (user.role === 'PARTICIPANT')
    items.splice(1, 0, {
      href: '/panel/equipo',
      label: 'Mi equipo',
      match: ['/panel/equipo'],
    });
  if (user.role === 'JUDGE')
    items.push({ href: '/jurado', label: 'Jurado', match: ['/jurado'] });
  if (user.role === 'ORGANIZER') {
    items.push({
      href: '/organizacion',
      label: 'Organización',
      match: ['/organizacion'],
    });
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#7413a8] focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>

        <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-white/10 bg-[#120826]/95 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
          <NavLinks label="Navegación privada" items={items} />

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar de OAuth, dominio externo variable
              <img
                src={user.image}
                alt=""
                width={28}
                height={28}
                className="rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span
                aria-hidden
                className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-400/20 text-xs text-purple-100"
              >
                {(user.name ?? user.email).charAt(0).toUpperCase()}
              </span>
            )}
            <Link
              href="/completar-perfil"
              title="Editar mi perfil"
              data-testid="header-profile-link"
              className="max-w-[10rem] truncate hover:underline sm:max-w-xs"
            >
              {user.name ?? user.email}
            </Link>
            <Badge tone="brand" data-testid="user-role">
              {ROLE_LABEL[user.role]}
            </Badge>
            <SignOutButton />
          </div>
        </header>

        <main
          id="contenido"
          tabIndex={-1}
          className="flex-1 p-4 focus:outline-none sm:p-6"
        >
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
