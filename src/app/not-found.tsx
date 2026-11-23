import Link from 'next/link';
import { PublicShell } from '@/components/ui/public-shell';

export default function NotFound() {
  return (
    <PublicShell>
      <section className="section-wrap mx-auto max-w-2xl text-center">
        <span className="display-font text-8xl text-purple-200/70">404</span>
        <h1 className="display-font mt-6 text-4xl uppercase sm:text-5xl">No encontramos esta página</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          Puede que el enlace esté roto, que el proyecto ya no esté publicado o que hayas escrito mal la dirección.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="button-primary">Volver al inicio</Link>
          <Link href="/galeria" className="button-secondary">Explorar la galería</Link>
        </div>
      </section>
    </PublicShell>
  );
}