'use client';

import { PublicShell } from '@/components/ui/public-shell';

export default function GalleryError({ reset }: { error: Error; reset: () => void }) {
  return <PublicShell><section className="section-wrap"><div className="info-panel max-w-2xl"><h1 className="display-font text-4xl uppercase">No pudimos cargar la galería</h1><p className="mt-4 leading-7 text-slate-300">Ocurrió un problema al consultar los proyectos. Inténtalo de nuevo en unos momentos.</p><button type="button" className="button-primary mt-7" onClick={reset}>Volver a intentar</button></div></section></PublicShell>;
}
