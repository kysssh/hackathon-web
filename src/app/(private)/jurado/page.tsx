import Link from 'next/link';

import { formatScore } from '@/components/private/format-score';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { serverNow } from '@/clock';
import { eventConfig } from '@/config/event';
import { formatEventDate } from '@/dates';
import { requireRole } from '@/lib/auth/session';
import { listProjectsForJudge } from '@/lib/project/queries';

export const dynamic = 'force-dynamic';

export default async function JuradoPage() {
  await requireRole(['JUDGE']);
  const projects = await listProjectsForJudge();

  const { evaluationClosesAt } = eventConfig.dates;
  const closed = Date.parse(serverNow()) > Date.parse(evaluationClosesAt);
  const graded = projects.filter((p) => p.myWeightedScore != null).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Proyectos para calificar</h1>
        {closed ? (
          <Badge tone="danger">Calificación cerrada</Badge>
        ) : (
          <Badge tone="brand">
            Cierra el {formatEventDate(evaluationClosesAt)}
          </Badge>
        )}
      </div>

      {projects.length === 0 ? (
        <div data-testid="jurado-empty">
          <EmptyState
            title="Aún no hay proyectos"
            description="Cuando los equipos envíen sus proyectos, aparecerán aquí para que los califiques."
          />
        </div>
      ) : (
        <>
          <p data-testid="jurado-progress" className="text-sm text-slate-400">
            Calificaste {graded} de {projects.length} proyectos.
          </p>
          <ul className="space-y-2" data-testid="jurado-list">
            {projects.map((p) => (
              <li
                key={p.projectId}
                data-testid={`jurado-row-${p.projectId}`}
                className="info-panel flex flex-wrap items-center justify-between gap-3 !px-4 !py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="text-xs text-slate-400">
                    {p.teamName} · enviado {formatEventDate(p.submittedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {p.myWeightedScore != null ? (
                    <Badge tone="success">
                      Tu nota: {formatScore(p.myWeightedScore)}
                    </Badge>
                  ) : (
                    <Badge tone="warning">Sin calificar</Badge>
                  )}
                  <Link
                    href={`/jurado/${p.projectId}`}
                    className="text-link text-sm"
                  >
                    {closed
                      ? 'Ver'
                      : p.myWeightedScore != null
                        ? 'Editar'
                        : 'Calificar'}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
