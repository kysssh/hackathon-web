/* eslint-disable @next/next/no-img-element -- La portada ya se sirve desde el CDN público de Supabase. */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GalleryUnavailable } from '@/components/ui/gallery-unavailable';
import { PublicShell } from '@/components/ui/public-shell';
import { getGalleryProject } from '@/lib/project/queries';

export const dynamic = 'force-dynamic';

function safeUrl(value: string | null) {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null; } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ projectSlug: string }> }): Promise<Metadata> {
  if (!process.env.DATABASE_URL?.trim()) return { title: 'Galería temporalmente no disponible' };
  const { projectSlug } = await params;
  const project = await getGalleryProject(projectSlug);
  return { title: project?.title ?? 'Proyecto no encontrado', description: project?.summary };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectSlug: string }> }) {
  if (!process.env.DATABASE_URL?.trim()) return <GalleryUnavailable />;
  const { projectSlug } = await params;
  const project = await getGalleryProject(projectSlug);
  if (!project) notFound();
  const links = [['Repositorio', project.repositoryUrl], ['Demo', project.demoUrl], ['Video pitch', project.videoUrl]] as const;
  return <PublicShell><section className="inner-hero px-5 py-18 sm:py-24"><div className="mx-auto max-w-6xl"><Link href="/galeria" className="text-link">← Volver a la galería</Link><div className="mt-10">{project.badge && <span className="eyebrow rounded-full bg-purple-400/20 px-4 py-2 text-purple-200">{project.badge === 'WINNER' ? project.winnerTitle || 'Ganador' : 'Finalista'}</span>}</div><h1 className="display-font mt-5 text-5xl uppercase sm:text-7xl">{project.title}</h1><p className="mt-4 text-lg text-purple-200">Equipo {project.teamName}</p><p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{project.summary}</p></div></section><section className="section-wrap grid gap-8 lg:grid-cols-[1.5fr_.8fr]"><div><div className="project-cover overflow-hidden rounded-2xl">{project.coverUrl ? <img src={project.coverUrl} alt={`Portada del proyecto ${project.title}`} className="max-h-[420px] w-full object-cover" /> : <span className="display-font py-24 text-8xl text-purple-200/70" aria-hidden="true">N</span>}</div><h2 className="mt-9 text-2xl font-bold">Sobre el proyecto</h2><p className="mt-4 whitespace-pre-wrap leading-8 text-slate-300">{project.description}</p></div><aside className="space-y-5"><div className="info-panel"><h2 className="text-xl font-bold">Explora la solución</h2><div className="mt-5 grid gap-3">{links.map(([label, value]) => { const href = safeUrl(value); return href ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="button-secondary text-xs">{label} ↗</a> : null; })}</div></div><div className="info-panel"><h2 className="text-xl font-bold">Integrantes</h2><ul className="mt-4 space-y-3">{project.members.map((member, index) => <li className="flex items-center gap-3 text-slate-300" key={`${member.name}-${index}`}><span className="brand-mark h-9 w-9 text-base" aria-hidden="true">{(member.name || 'I').charAt(0).toUpperCase()}</span>{member.name || 'Integrante'}</li>)}</ul></div></aside></section></PublicShell>;
}
