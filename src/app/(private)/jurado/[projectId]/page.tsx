import Link from 'next/link';
import { notFound } from 'next/navigation';

import { serverNow } from '@/clock';
import { requireRole } from '@/lib/auth/session';
import { getProjectForJudge } from '@/lib/project/queries';

import { EvaluationForm } from './evaluation-form';

export const dynamic = 'force-dynamic';

export default async function JuradoDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  await requireRole(['JUDGE']);
  const { projectId } = await params;
  const project = await getProjectForJudge(projectId);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <Link href="/jurado" className="text-link text-sm">
        ← Volver a la lista
      </Link>

      <div>
        <h1 className="text-xl font-semibold">{project.title}</h1>
        <p className="text-sm text-slate-400">{project.teamName}</p>
      </div>

      <div className="info-panel">
        <p className="whitespace-pre-line text-sm leading-6 text-slate-300">
          {project.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {project.repositoryUrl && (
            <a
              className="text-link"
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Repositorio
            </a>
          )}
          {project.demoUrl && (
            <a
              className="text-link"
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Demo
            </a>
          )}
          {project.videoUrl && (
            <a
              className="text-link"
              href={project.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Video
            </a>
          )}
        </div>
      </div>

      {/* La hora del servidor viaja al formulario para bloquearlo al vencer el plazo. */}
      <EvaluationForm project={project} serverNow={serverNow()} />
    </div>
  );
}
