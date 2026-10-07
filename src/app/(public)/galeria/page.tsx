/* eslint-disable @next/next/no-img-element -- La portada ya se sirve desde el CDN público de Supabase. */
import type { Metadata } from 'next';
import Link from 'next/link';
import { InnerHero } from '@/components/ui/inner-hero';
import { GalleryUnavailable } from '@/components/ui/gallery-unavailable';
import { PublicShell } from '@/components/ui/public-shell';
import { getEventState } from '@/lib/event/queries';
import { listGalleryProjects } from '@/lib/project/queries';
import type { GalleryFilter } from '@/lib/queries/dtos';

export const metadata: Metadata = { title: 'Galería de proyectos' };
export const dynamic = 'force-dynamic';

export default async function GaleriaPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  if (!process.env.DATABASE_URL?.trim()) return <GalleryUnavailable />;
  const params = await searchParams;
  const requested = typeof params.ver === 'string' ? params.ver : 'todos';
  const search = typeof params.q === 'string' ? params.q.trim().slice(0, 100) : '';
  const filter: GalleryFilter = requested === 'finalistas' ? 'FINALISTS' : requested === 'ganadores' ? 'WINNERS' : 'ALL';
  const [state, projects] = await Promise.all([getEventState(), listGalleryProjects({ filter, search })]);
  const tabs = [{ label: 'Todos', value: 'todos' }, ...(state.finalistsPublishedAt || state.resultsPublishedAt ? [{ label: 'Finalistas', value: 'finalistas' }] : []), ...(state.resultsPublishedAt ? [{ label: 'Ganadores', value: 'ganadores' }] : [])];
  return <PublicShell><InnerHero eyebrow="Ideas hechas realidad" title="Galería de proyectos" description="Descubre los proyectos que los equipos han compartido con la comunidad." /><section className="section-wrap"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="flex flex-wrap gap-2" role="navigation" aria-label="Filtros de galería">{tabs.map((tab) => <Link key={tab.value} href={`/galeria?ver=${tab.value}${search ? `&q=${encodeURIComponent(search)}` : ''}`} aria-current={requested === tab.value ? 'page' : undefined} className={requested === tab.value ? 'button-primary px-5 py-2 text-xs' : 'button-secondary px-5 py-2 text-xs'}>{tab.label}</Link>)}</div><form action="/galeria" method="get" className="flex gap-2"><input type="hidden" name="ver" value={requested} /><label className="sr-only" htmlFor="gallery-search">Buscar proyectos</label><input id="gallery-search" name="q" type="search" defaultValue={search} placeholder="Buscar proyectos" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-[#241a38] px-4 py-3 text-sm text-white placeholder:text-slate-400 md:w-64" /><button className="button-primary px-5 py-2 text-xs" type="submit">Buscar</button></form></div>
  {projects.length ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <article className="project-card" key={project.slug}><div className="project-cover">{project.coverUrl ? <img src={project.coverUrl} alt="" className="h-48 w-full object-cover" /> : <span className="display-font text-6xl text-purple-200/70" aria-hidden="true">N</span>}</div><div className="p-6">{project.badge && <span className="eyebrow rounded-full bg-purple-400/20 px-3 py-1 text-purple-200">{project.badge === 'WINNER' ? project.winnerTitle || 'Ganador' : 'Finalista'}</span>}<h2 className="mt-3 text-xl font-bold">{project.title}</h2><p className="mt-1 text-sm text-purple-200">{project.teamName}</p><p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">{project.summary}</p><Link className="text-link mt-6 inline-flex" href={`/galeria/${encodeURIComponent(project.slug)}`}>Ver proyecto →</Link></div></article>)}</div> : <div className="info-panel mt-9 text-center"><span className="display-font text-5xl text-purple-200">✳</span><h2 className="mt-4 text-2xl font-bold">Aún no hay proyectos para mostrar</h2><p className="mt-3 text-slate-300">Prueba otro filtro o vuelve cuando la organización publique los proyectos.</p></div>}
  </section></PublicShell>;
}
