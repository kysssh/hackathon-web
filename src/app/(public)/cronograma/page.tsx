import type { Metadata } from 'next';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';
import { eventConfig } from '@/config/event';
import { milestones } from '@/content/public';
import { formatEventDate } from '@/dates';

export const metadata: Metadata = { title: 'Cronograma' };

export default function CronogramaPage() {
  const dates = [
    ['Anuncio oficial e inscripciones', eventConfig.dates.registrationOpensAt],
    ['Kickoff e inauguración (cierre de registro)', eventConfig.dates.registrationClosesAt],
    ['Apertura de entregables', eventConfig.dates.submissionOpensAt],
    ['Cierre del segundo entregable', eventConfig.dates.submissionClosesAt],
    ['Demo Day y evaluación final', eventConfig.dates.evaluationClosesAt],
  ] as const;

  return (
    <PublicShell>
      <InnerHero
        eyebrow="El camino del evento"
        title="Cronograma oficial"
        description="Conoce las etapas del evento y las fechas clave para organizar el trabajo de tu equipo. Sede presencial: Universidad Nacional de Ingeniería (UNI)."
      />
      <section className="section-wrap">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {milestones.map((item, index) => (
            <article className="timeline-card" key={item.title}>
              <div className="flex items-center justify-between gap-2">
                <span className="eyebrow text-purple-300">Etapa 0{index + 1}</span>
                <span className="eyebrow rounded bg-purple-400/20 px-2 py-0.5 text-[10px] text-purple-200">
                  {item.date}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-bold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>

        <h2 className="display-font mt-16 text-4xl uppercase">Fechas clave del sistema</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {dates.map(([label, date]) => (
            <li className="info-panel" key={label}>
              <span className="eyebrow text-purple-300">{label}</span>
              <p className="mt-3 text-lg font-semibold">{formatEventDate(date)} · Lima</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-emerald-300/90 font-medium">
          ✓ Cronograma y ventanas del sistema confirmados oficialmente por la organización.
        </p>
      </section>
    </PublicShell>
  );
}
