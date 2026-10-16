import Link from 'next/link';

import { requireRole } from '@/lib/auth/session';
import { listProjectsForJudge } from '@/lib/project/queries';

export const dynamic = 'force-dynamic';

export default async function JuradoPage() {
  await requireRole(['JUDGE']);
  const projects = await listProjectsForJudge();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Proyectos para calificar</h1>

      {projects.length === 0 ? (
        <div className="info-panel p-6 text-center" data-testid="jurado-empty">
          Todavía no hay proyectos enviados para calificar.
        </div>
      ) : (
        <ul className="space-y-2" data-testid="jurado-list">
          {projects.map((p) => (
            <li
              key={p.projectId}
              data-testid={`jurado-row-${p.projectId}`}
              className="info-panel flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-slate-400">{p.teamName}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-300">
                  {p.myWeightedScore != null ? `Tu nota: ${p.myWeightedScore}` : 'Sin calificar'}
                </span>
                <Link href={`/jurado/${p.projectId}`} className="text-link text-sm">
                  {p.myWeightedScore != null ? 'Editar' : 'Calificar'}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
