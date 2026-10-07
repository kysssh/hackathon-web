import Link from 'next/link';
import { PublicShell } from '@/components/ui/public-shell';

export default function ProjectNotFound() {
  return <PublicShell><section className="section-wrap text-center"><h1 className="display-font text-6xl uppercase">Proyecto no encontrado</h1><p className="mt-5 text-slate-300">El proyecto no existe o aún no se ha publicado.</p><Link href="/galeria" className="button-primary mt-8">Volver a la galería</Link></section></PublicShell>;
}
