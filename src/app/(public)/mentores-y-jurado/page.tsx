import type { Metadata } from 'next';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';

export const metadata: Metadata = { title: 'Mentores y jurado' };

export default function MentoresYJuradoPage() {
  return <PublicShell><InnerHero eyebrow="Conocimiento compartido" title="Mentores y jurado" description="Especialistas acompañarán el desarrollo de los equipos y evaluarán sus soluciones con la rúbrica oficial." /><section className="section-wrap grid gap-5 md:grid-cols-2"><div className="info-panel"><span className="eyebrow text-purple-300">Mentorías</span><h2 className="mt-4 text-2xl font-bold">Acompañamiento para construir</h2><p className="mt-3 leading-7 text-slate-300">Las áreas previstas incluyen tecnología, diseño de experiencia e impacto cultural. Los perfiles se publicarán cuando la organización los confirme.</p></div><div className="info-panel"><span className="eyebrow text-purple-300">Jurado</span><h2 className="mt-4 text-2xl font-bold">Evaluación con criterios públicos</h2><p className="mt-3 leading-7 text-slate-300">Cada proyecto finalista recibirá evaluaciones independientes sobre innovación, tecnología, impacto y presentación. El directorio se publicará al confirmarse.</p></div></section></PublicShell>;
}
