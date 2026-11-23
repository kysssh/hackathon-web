'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { SessionProvider, useSession } from 'next-auth/react';

import { PublicNav } from '@/components/ui/public-nav';

function ParticipateLinks() {
  const { status } = useSession();

  return (
    <div className="mt-5 grid gap-3 text-sm text-slate-300">
      {status === 'authenticated' ? (
        <Link href="/panel">Mi panel</Link>
      ) : status === 'unauthenticated' ? (
        <Link href="/ingresar">Ingresar</Link>
      ) : null}
      <Link href="/faq">Preguntas frecuentes</Link>
      <Link href="/mentores-y-jurado">Mentores y jurado</Link>
    </div>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className="public-site min-h-screen">
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <PublicNav />
        <main id="contenido">{children}</main>
        <footer className="border-t border-white/10 bg-[#120826] px-5 py-14">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <span className="brand-mark" aria-hidden="true">
                  N
                </span>
                <span className="font-bold uppercase tracking-wide">
                  Núcleo
                  <br />
                  <small className="text-xs font-medium text-purple-200">
                    Centro Cultural
                  </small>
                </span>
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
                Un espacio para experimentar con cultura y tecnología en
                comunidad.
              </p>
            </div>
            <div>
              <h2 className="eyebrow text-white">Explora</h2>
              <div className="mt-5 grid gap-3 text-sm text-slate-300">
                <Link href="/informacion">Información y retos</Link>
                <Link href="/cronograma">Cronograma</Link>
                <Link href="/criterios">Criterios</Link>
                <Link href="/galeria">Galería</Link>
              </div>
            </div>
            <div>
              <h2 className="eyebrow text-white">Participa</h2>
              <ParticipateLinks />
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-xs text-slate-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span>© 2026 Núcleo Centro Cultural · Hackathon 2026</span>
              <nav
                aria-label="Políticas y condiciones"
                className="flex flex-wrap gap-x-5 gap-y-2 text-slate-300"
              >
                <Link href="/privacidad" className="hover:text-white">
                  Política de privacidad
                </Link>
                <Link href="/terminos" className="hover:text-white">
                  Términos y condiciones
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </SessionProvider>
  );
}
