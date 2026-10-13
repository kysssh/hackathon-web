import { notFound } from 'next/navigation';

import { formatEventDate } from '@/dates';
import { requireRole } from '@/lib/auth/session';
import { getProjectForOrganizer } from '@/lib/project/queries';

import { FlagSwitch } from '../../flag-switch';
import { WinnerTitleForm } from './winner-title-form';

export const dynamic = 'force-dynamic';

/**
 * CONTRATO pendiente con BD: el plan pide "calificaciones y descargas" en esta
 * pantalla, pero OrganizerProjectDetailDto solo trae evaluationCount y
 * averageScore (sin cada calificación ni sus comentarios) y no trae los
 * archivos del proyecto con un enlace de descarga. Falta:
 *   - evaluations: { judgeName, scores, weightedScore, comment }[]
 *   - files: { id, kind, originalName, downloadUrl }[]
 */
export default async function OrganizacionProyectoPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  await requireRole(['ORGANIZER']);
  const { projectId } = await params;
  const project = await getProjectForOrganizer(projectId);

  if (!project) notFound();

  const links = [
    { label: 'Repositorio', href: project.repositoryUrl },
    { label: 'Demo', href: project.demoUrl },
    { label: 'Video', href: project.videoUrl },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{project.title}</h1>
        <p className="text-sm text-slate-400">
          {project.teamName} ·{' '}
          {project.submittedAt
            ? `Enviado el ${formatEventDate(project.submittedAt)}`
            : 'Borrador sin enviar'}
        </p>
      </div>

      <div className="info-panel grid gap-6 p-6 sm:grid-cols-2">
        <div data-testid="org-detail-score">
          <span className="eyebrow text-purple-300">Calificaciones</span>
          <p className="display-font text-4xl">
            {project.averageScore !== null ? project.averageScore : '—'}
          </p>
          <p className="text-sm text-slate-400">
            {project.evaluationCount === 0
              ? 'Todavía sin calificaciones'
              : `Promedio de ${project.evaluationCount} calificaci${project.evaluationCount === 1 ? 'ón' : 'ones'}`}
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <label className="flex items-center justify-between gap-4">
            <span>Visible en la galería</span>
            <FlagSwitch
              projectId={project.projectId}
              field="isVisibleInGallery"
              checked={project.isVisibleInGallery}
              label="Visible en la galería"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>Finalista</span>
            <FlagSwitch
              projectId={project.projectId}
              field="isFinalist"
              checked={project.isFinalist}
              label="Finalista"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>Ganador</span>
            <FlagSwitch
              projectId={project.projectId}
              field="isWinner"
              checked={project.isWinner}
              label="Ganador"
            />
          </label>
        </div>
      </div>

      <div className="info-panel p-6">
        <WinnerTitleForm projectId={project.projectId} initialTitle={project.winnerTitle} />
      </div>

      <div className="info-panel p-6">
        <p className="text-sm leading-6 text-slate-300">{project.description}</p>
        {links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {links.map((l) => (
              <a key={l.label} className="text-link" href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
