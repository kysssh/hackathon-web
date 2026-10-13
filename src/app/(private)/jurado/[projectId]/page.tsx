import { notFound } from 'next/navigation';

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
      <div>
        <h1 className="text-xl font-semibold">{project.title}</h1>
        <p className="text-sm text-slate-400">{project.teamName}</p>
      </div>

      <div className="info-panel p-6">
        <p className="text-sm leading-6 text-slate-300">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {project.repositoryUrl && (
            <a className="text-link" href={project.repositoryUrl} target="_blank" rel="noreferrer">
              Repositorio
            </a>
          )}
          {project.demoUrl && (
            <a className="text-link" href={project.demoUrl} target="_blank" rel="noreferrer">
              Demo
            </a>
          )}
          {project.videoUrl && (
            <a className="text-link" href={project.videoUrl} target="_blank" rel="noreferrer">
              Video
            </a>
          )}
        </div>
      </div>

      <EvaluationForm project={project} />
    </div>
  );
}
