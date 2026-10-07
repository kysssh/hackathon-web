import type { Metadata } from 'next';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';
import { faqs } from '@/content/public';

export const metadata: Metadata = { title: 'Preguntas frecuentes' };

export default function FaqPage() {
  return <PublicShell><InnerHero eyebrow="Resolvemos tus dudas" title="Preguntas frecuentes" description="Lo esencial sobre equipos, entregables, evaluación y publicación de proyectos." /><section className="section-wrap max-w-4xl"><div className="space-y-3">{faqs.map((faq) => <details className="faq-item" key={faq.question}><summary>{faq.question}<span aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section></PublicShell>;
}
