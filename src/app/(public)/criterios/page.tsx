import type { Metadata } from 'next';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';
import { criteria, scoreRange } from '@/config/criteria';

export const metadata: Metadata = { title: 'Criterios de evaluación' };

export default function CriteriosPage() {
  return <PublicShell><InnerHero eyebrow="Evaluación transparente" title="Criterios de evaluación" description="El jurado califica cada eje en una escala de 1 a 10. El promedio ponderado se calcula automáticamente." /><section className="section-wrap"><div className="grid gap-5 sm:grid-cols-2">{criteria.map((criterion) => <article className="rubric-card" key={criterion.key}><div className="flex items-start justify-between gap-4"><h2 className="text-xl font-bold">{criterion.label}</h2><span className="display-font text-5xl text-purple-200">{criterion.weight}%</span></div><p className="mt-4 leading-7 text-slate-300">{criterion.description}</p></article>)}</div><div className="info-panel mt-8"><span className="eyebrow text-purple-300">Fórmula oficial</span><p className="mt-4 text-lg font-semibold">(Innovación × 25 + Tecnología × 30 + Impacto × 25 + Presentación × 20) ÷ 100</p><p className="mt-3 text-sm text-slate-300">Cada nota va de {scoreRange.min} a {scoreRange.max}. La calificación final conserva esa escala.</p></div></section></PublicShell>;
}
