import type { Metadata } from 'next';
import Link from 'next/link';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';
import { tracks } from '@/content/public';
import { eventConfig } from '@/config/event';
import { formatEventDate } from '@/dates';

export const metadata: Metadata = { title: 'Información y retos' };

export default function InformacionPage() {
  return <PublicShell><InnerHero eyebrow="Conoce la convocatoria" title="Información y retos" description="Una hackathon para explorar cómo la tecnología puede abrir nuevas posibilidades para la cultura." />
    <section className="section-wrap"><div className="grid gap-5 md:grid-cols-3">{tracks.map((track, index) => <article className="feature-card" key={track.title}><span className="display-font text-5xl text-purple-200">0{index + 1}</span><h2 className="mt-10 text-xl font-bold">{track.title}</h2><p className="mt-4 leading-7 text-slate-300">{track.description}</p></article>)}</div></section>
    <section className="section-band"><div className="section-wrap grid gap-5 md:grid-cols-2"><div className="info-panel"><span className="eyebrow text-purple-300">Participación</span><h2 className="mt-4 text-2xl font-bold">Equipos de 2 a 5 personas</h2><p className="mt-3 leading-7 text-slate-300">El líder crea el equipo y comparte un código HACK-XXXX. Los integrantes se unen desde su propia cuenta.</p></div><div className="info-panel"><span className="eyebrow text-purple-300">Entregables</span><h2 className="mt-4 text-2xl font-bold">Una solución que se pueda explorar</h2><p className="mt-3 leading-7 text-slate-300">Presenta una descripción, repositorio público, demo, video pitch y pitch deck PDF de hasta 25 MB.</p></div><div className="info-panel"><span className="eyebrow text-purple-300">Fechas</span><h2 className="mt-4 text-2xl font-bold">Ventanas del evento</h2><p className="mt-3 leading-7 text-slate-300">Inscripciones hasta {formatEventDate(eventConfig.dates.registrationClosesAt)}. Entregables hasta {formatEventDate(eventConfig.dates.submissionClosesAt)} (hora de Lima).</p></div><div className="info-panel"><span className="eyebrow text-purple-300">Premios y bases</span><h2 className="mt-4 text-2xl font-bold">Información oficial pendiente</h2><p className="mt-3 leading-7 text-slate-300">La organización confirmará los premios y el documento de bases. Revisa esta página antes de enviar tu proyecto.</p></div></div></section>
    <section className="section-wrap"><div className="cta-panel"><div><span className="eyebrow text-purple-200">Participa</span><h2 className="display-font mt-3 text-4xl uppercase">Comienza con tu equipo</h2></div><Link className="button-light" href="/ingresar">Ingresar ↗</Link></div></section>
  </PublicShell>;
}
