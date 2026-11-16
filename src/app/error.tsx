'use client';

import { PublicShell } from '@/components/ui/public-shell';

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicShell>
      <section className="section-wrap py-24">
        <div className="info-panel max-w-xl mx-auto text-center">
          <span className="eyebrow text-red-300">Error en el sistema</span>
          <h1 className="display-font mt-3 text-4xl uppercase sm:text-5xl">
            Algo no salió como esperábamos
          </h1>
          <p className="mt-4 leading-7 text-slate-300">
            Tuvimos un inconveniente al cargar esta página. Puedes intentar recargarla.
          </p>
          <button type="button" onClick={reset} className="button-primary mt-7">
            Intentar de nuevo
          </button>
        </div>
      </section>
    </PublicShell>
  );
}
