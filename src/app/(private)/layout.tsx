import type { ReactNode } from 'react';
import Link from 'next/link';

import { SignOutButton } from '@/components/private/sign-out-button';
import { requireUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between border-b border-white/10 bg-[#120826] px-6 py-4">
        <nav className="flex items-center gap-5">
          <Link href="/panel" className="nav-link">Panel</Link>
          {user.role === 'JUDGE' && <Link href="/jurado" className="nav-link">Jurado</Link>}
          {user.role === 'ORGANIZER' && (
            <Link href="/organizacion" className="nav-link">Organización</Link>
          )}
        </nav>

        <div className="flex items-center gap-3 text-sm">
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
              className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs"
            >
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </span>
          )}
          <span>{user.name ?? user.email}</span>
          <span className="text-xs text-zinc-500">{user.role}</span>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
