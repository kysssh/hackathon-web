import type { ReactNode } from 'react';
import Link from 'next/link';

import { requireUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <nav className="flex items-center gap-4 text-sm">
          <a href="/panel">Panel</a>
          {user.role === 'JUDGE' && <a href="/jurado">Jurado</a>}
          {user.role === 'ORGANIZER' && <a href="/organizacion">Organización</a>}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          <span>{user.name ?? user.email}</span>
          <span className="text-xs text-zinc-500">{user.role}</span>
          {/* TODO: cambiar por signOutAction cuando BK lo publique en src/lib/auth/actions.ts */}
          <Link href="/api/auth/signout">Cerrar sesión</Link>
        </div>
      </header>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

