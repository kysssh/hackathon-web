import type { Metadata } from 'next';
import Link from 'next/link';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';
import { tracks } from '@/content/public';
import { eventConfig } from '@/config/event';
import { formatEventDate } from '@/dates';

export const metadata: Metadata = {
  title: 'Información y retos · Hackathon 2026',
  description: 'Conocé los tres retos culturales del hackathon y elegí el que va a resolver tu equipo.',
  openGraph: {
    title: 'Información y retos · Hackathon 2026',
    description: 'Conocé los tres retos culturales del hackathon y elegí el que va a resolver tu equipo.',
    type: 'website',
    locale: 'es_PE',
  },
};

export default function InformacionPage() {
  return <PublicShell><InnerHero eyebrow="Conoce la convocatoria" title="Información y retos" description="Una hackathon para explorar cómo la tecnología puede abrir nuevas posibilidades para la cultura." />
    <section className="section-wrap"><div className="grid gap-5 md:grid-cols-3">{tracks.map((track, index) => <article className="feature-card" key={track.title}><span className="display-font text-5xl text-purple-200">0{index + 1}</span><h2 className="mt-10 text-xl font-bold">{track.title}</h2><p className="mt-4 leading-7 text-slate-300">{track.description}</p></article>)}</div></section>
    <section className="section-band"><div className="section-wrap grid gap-5 md:grid-cols-2"><div className="info-panel"><span className="eyebrow text-purple-300">Participación</span><h2 className="mt-4 text-2xl font-bold">Equipos de 4 integrantes</h2><p className="mt-3 leading-7 text-slate-300">Convocatoria para estudiantes universitarios de distintas instituciones. El líder crea el equipo y comparte el código HACK-XXXX para registrar a los 4 miembros.</p></div><div className="info-panel"><span className="eyebrow text-purple-300">Entregas por fases</span><h2 className="mt-4 text-2xl font-bold">Material actualizado en cada etapa</h2><p className="mt-3 leading-7 text-slate-300">Fase 1: documento Word y portada. Fase 2: presentación (PDF, PPT o PPTX), portada actualizada y enlace del video en Drive. Semifinal: presentación y portada actualizadas, dominio desplegado y repositorio de GitHub. Los archivos extra son opcionales; en la final presencial no se solicitan archivos.</p></div><div className="info-panel"><span className="eyebrow text-purple-300">Sede oficial</span><h2 className="mt-4 text-2xl font-bold">Universidad Nacional de Ingeniería</h2><p className="mt-3 leading-7 text-slate-300">Sede presencial para el Kickoff y el Demo Day final (UNI, Lima), con entregas técnicas y semifinal virtual.</p></div><div className="info-panel"><span className="eyebrow text-purple-300">Fechas oficiales</span><h2 className="mt-4 text-2xl font-bold">Ventanas del evento</h2><p className="mt-3 leading-7 text-slate-300">Inscripciones hasta el {formatEventDate(eventConfig.dates.registrationClosesAt)}. Entregas abiertas hasta el {formatEventDate(eventConfig.dates.submissionClosesAt)}.</p></div></div></section>
    <section className="section-wrap"><div className="cta-panel"><div><span className="eyebrow text-purple-200">Participa</span><h2 className="display-font mt-3 text-4xl uppercase">Comienza con tu equipo</h2></div><Link className="button-light" href="/ingresar">Ingresar ↗</Link></div></section>
  </PublicShell>;
}
