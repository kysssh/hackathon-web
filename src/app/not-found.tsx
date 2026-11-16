import Link from 'next/link';

import { PublicShell } from '@/components/ui/public-shell';

export default function RootNotFound() {
  return (
    <PublicShell>
      <section className="section-wrap text-center py-24">
        <span className="brand-mark brand-mark-large mx-auto mb-6" aria-hidden="true">
          404
        </span>
        <h1 className="display-font text-5xl uppercase tracking-wide sm:text-7xl">
          Página no encontrada
        </h1>
        <p className="mt-5 max-w-md mx-auto text-slate-300">
          La dirección que buscas no existe o fue movida.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/" className="button-primary">
            Ir al inicio
          </Link>
          <Link href="/galeria" className="button-secondary">
            Ver proyectos
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
