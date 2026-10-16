import Link from 'next/link';

import { formatEventDate } from '@/dates';
import { requireRole } from '@/lib/auth/session';
import { getEventState } from '@/lib/event/queries';
import { listProjectsForOrganizer } from '@/lib/project/queries';

import { FlagSwitch } from './flag-switch';
import { PublicationCard } from './publication-card';

export const dynamic = 'force-dynamic';

export default async function OrganizacionPage() {
  await requireRole(['ORGANIZER']);
  const [projects, eventState] = await Promise.all([
    listProjectsForOrganizer(),
    getEventState(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Panel de organización</h1>

      <PublicationCard
        finalists={{
          isPublished: eventState.finalistsPublishedAt !== null,
          publishedLabel: eventState.finalistsPublishedAt
            ? formatEventDate(eventState.finalistsPublishedAt)
            : null,
        }}
        results={{
          isPublished: eventState.resultsPublishedAt !== null,
          publishedLabel: eventState.resultsPublishedAt
            ? formatEventDate(eventState.resultsPublishedAt)
            : null,
        }}
      />

      <section>
        <h2 className="mb-3 font-medium">Proyectos</h2>

        {projects.length === 0 ? (
          <div data-testid="org-empty" className="info-panel p-6 text-center">
            Todavía no hay proyectos creados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table data-testid="org-projects-table" className="w-full min-w-[56rem] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Proyecto</th>
                  <th className="px-3 py-2 font-medium">Equipo</th>
                  <th className="px-3 py-2 font-medium">Envío</th>
                  <th className="px-3 py-2 font-medium">Calificaciones</th>
                  <th className="px-3 py-2 font-medium">Promedio</th>
                  <th className="px-3 py-2 font-medium">Visible</th>
                  <th className="px-3 py-2 font-medium">Finalista</th>
                  <th className="px-3 py-2 font-medium">Ganador</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr
                    key={p.projectId}
                    data-testid={`org-project-row-${p.projectId}`}
                    className="border-t border-white/10 align-top"
                  >
                    <td className="px-3 py-3">
                      <Link
                        href={`/organizacion/proyectos/${p.projectId}`}
                        className="text-link"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-slate-300">{p.teamName}</td>
                    <td className="px-3 py-3 text-slate-300">
                      {p.submittedAt ? formatEventDate(p.submittedAt) : 'Borrador'}
                    </td>
                    <td className="px-3 py-3 text-slate-300">{p.evaluationCount}</td>
                    <td className="px-3 py-3 text-slate-300">
                      {p.averageScore !== null ? p.averageScore : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <FlagSwitch
                        projectId={p.projectId}
                        field="isVisibleInGallery"
                        checked={p.isVisibleInGallery}
                        label={`Visible en la galería: ${p.title}`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <FlagSwitch
                        projectId={p.projectId}
                        field="isFinalist"
                        checked={p.isFinalist}
                        label={`Finalista: ${p.title}`}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <FlagSwitch
                        projectId={p.projectId}
                        field="isWinner"
                        checked={p.isWinner}
                        label={`Ganador: ${p.title}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
