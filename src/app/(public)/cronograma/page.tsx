import type { Metadata } from 'next';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';
import { eventConfig } from '@/config/event';
import { milestones } from '@/content/public';
import { formatEventDate } from '@/dates';

export const metadata: Metadata = { title: 'Cronograma' };

export default function CronogramaPage() {
  const dates = [
    ['Apertura de inscripciones', eventConfig.dates.registrationOpensAt],
    ['Apertura de entregables', eventConfig.dates.submissionOpensAt],
    ['Cierre de inscripciones', eventConfig.dates.registrationClosesAt],
    ['Cierre de entregables', eventConfig.dates.submissionClosesAt],
    ['Cierre de evaluación', eventConfig.dates.evaluationClosesAt],
  ] as const;
  return <PublicShell><InnerHero eyebrow="El camino del evento" title="Cronograma" description="Conoce las etapas del evento y las fechas configuradas para organizar el trabajo de tu equipo." /><section className="section-wrap"><div className="grid gap-5 md:grid-cols-4">{milestones.map((item, index) => <article className="timeline-card" key={item.title}><span className="eyebrow text-purple-300">Etapa {index + 1}</span><h2 className="mt-4 text-xl font-bold">{item.title}</h2><p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p></article>)}</div><h2 className="display-font mt-16 text-4xl uppercase">Fechas clave</h2><ol className="mt-6 grid gap-3 sm:grid-cols-2">{dates.map(([label, date]) => <li className="info-panel" key={label}><span className="eyebrow text-purple-300">{label}</span><p className="mt-3 text-lg font-semibold">{formatEventDate(date)} · Lima</p></li>)}</ol><p className="mt-6 text-sm text-slate-400">Las fechas son provisionales hasta su confirmación por la organización.</p></section></PublicShell>;
}
