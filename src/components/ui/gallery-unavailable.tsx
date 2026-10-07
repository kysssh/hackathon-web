import Link from 'next/link';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';

export function GalleryUnavailable() {
  return <PublicShell><InnerHero eyebrow="Galería de proyectos" title="Galería temporalmente no disponible" description="Todavía no es posible consultar los proyectos desde este entorno." /><section className="section-wrap"><div className="info-panel max-w-2xl"><h2 className="text-2xl font-bold">Vuelve pronto</h2><p className="mt-3 leading-7 text-slate-300">La galería estará disponible cuando se conecte la base de datos del evento. Mientras tanto, puedes conocer los retos y criterios de evaluación.</p><Link className="button-primary mt-7" href="/informacion">Explorar los retos →</Link></div></section></PublicShell>;
}
