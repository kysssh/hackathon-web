import Link from 'next/link';
import { notFound } from 'next/navigation';

import { formatScore } from '@/components/private/format-score';

import { criteria } from '@/config/criteria';
import type { ProjectFileKind } from '@/config/event';
import { formatEventDate } from '@/dates';
import { requireRole } from '@/lib/auth/session';
import {
  listEvaluationsForOrganizer,
  listFilesForOrganizer,
} from '@/lib/organizer/queries';
import { getProjectForOrganizer } from '@/lib/project/queries';

import { FlagSwitch } from '../../flag-switch';
import { WinnerTitleForm } from './winner-title-form';

export const dynamic = 'force-dynamic';

const KIND_LABEL: Record<ProjectFileKind, string> = {
  PITCH_DECK: 'Pitch deck',
  COVER_IMAGE: 'Portada',
  EXTRA: 'Extra',
};

function formatMB(bytes: number) {
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

export default async function OrganizacionProyectoPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  await requireRole(['ORGANIZER']);
  const { projectId } = await params;

  const project = await getProjectForOrganizer(projectId);
  if (!project) notFound();

  const [evaluations, files] = await Promise.all([
    listEvaluationsForOrganizer(projectId),
    listFilesForOrganizer(projectId),
  ]);

  const links = [
    { label: 'Repositorio', href: project.repositoryUrl },
    { label: 'Demo', href: project.demoUrl },
    { label: 'Video', href: project.videoUrl },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  return (
    <div className="space-y-6">
      <Link href="/organizacion" className="text-link text-sm">
        ← Volver a proyectos
      </Link>

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
            {project.averageScore !== null
              ? formatScore(project.averageScore)
              : 'Sin evaluar'}
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
        <WinnerTitleForm
          projectId={project.projectId}
          initialTitle={project.winnerTitle}
        />
      </div>

      <div className="info-panel p-6">
        <p className="whitespace-pre-line text-sm leading-6 text-slate-300">
          {project.description}
        </p>
        {links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {links.map((l) => (
              <a
                key={l.label}
                className="text-link"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {l.label}
              </a>
            ))}
            {project.isVisibleInGallery && (
              <Link href={`/galeria/${project.slug}`} className="text-link">
                Ver en la galería
              </Link>
            )}
          </div>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="font-medium">Evaluaciones ({evaluations.length})</h2>

        {evaluations.length === 0 ? (
          <div
            data-testid="org-evaluations-empty"
            className="info-panel p-6 text-center text-sm"
          >
            Todavía ningún jurado calificó este proyecto.
          </div>
        ) : (
          <ul data-testid="org-evaluations" className="space-y-3">
            {evaluations.map((e) => (
              <li
                key={e.id}
                data-testid={`org-evaluation-${e.id}`}
                className="info-panel p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{e.judgeName ?? e.judgeEmail}</p>
                  <p className="text-sm text-slate-300">
                    Nota ponderada:{' '}
                    <span className="font-medium">
                      {formatScore(e.weightedScore)}
                    </span>
                  </p>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  {criteria.map((c) => (
                    <div key={c.key}>
                      <dt className="text-xs text-slate-400">
                        {c.label} ({c.weight}%)
                      </dt>
                      <dd>{e[c.field]}</dd>
                    </div>
                  ))}
                </dl>
                {e.comment && (
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    “{e.comment}”
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Archivos ({files.length})</h2>

        {files.length === 0 ? (
          <div
            data-testid="org-files-empty"
            className="info-panel p-6 text-center text-sm"
          >
            El equipo todavía no subió archivos.
          </div>
        ) : (
          <ul data-testid="org-files" className="space-y-2">
            {files.map((f) => (
              <li
                key={f.id}
                data-testid={`org-file-${f.id}`}
                className="info-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="min-w-0 truncate">
                  <span className="text-xs uppercase text-slate-400">
                    {KIND_LABEL[f.kind]}
                  </span>{' '}
                  {f.originalName}{' '}
                  <span className="text-xs text-slate-400">
                    ({formatMB(f.sizeBytes)})
                  </span>
                </span>
                {/* Ruta de API (redirige a una URL firmada): no es una página, va con <a>. */}
                <a
                  href={`/api/organizacion/archivos/${f.id}`}
                  data-testid={`org-file-download-${f.id}`}
                  className="text-link"
                >
                  Descargar
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
