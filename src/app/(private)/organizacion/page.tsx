import Link from 'next/link';

import { formatScore } from '@/components/private/format-score';
import { LiveRefresh } from '@/components/private/live-refresh';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatEventDate } from '@/dates';
import { requireRole } from '@/lib/auth/session';
import { getEventState } from '@/lib/event/queries';
import { listProjectsForOrganizer } from '@/lib/project/queries';

import { FlagSwitch } from './flag-switch';
import { PublicationCard } from './publication-card';

export const dynamic = 'force-dynamic';

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export default async function OrganizacionPage() {
  await requireRole(['ORGANIZER']);
  const [projects, eventState] = await Promise.all([
    listProjectsForOrganizer(),
    getEventState(),
  ]);

  // Lo que el público verá al publicar: solo cuentan los proyectos visibles en la galería.
  const finalistsShown = projects.filter(
    (p) => p.isFinalist && p.isVisibleInGallery
  ).length;
  const finalistsHidden = projects.filter(
    (p) => p.isFinalist && !p.isVisibleInGallery
  ).length;
  const winners = projects.filter((p) => p.isWinner);
  const winnersShown = winners.filter((p) => p.isVisibleInGallery).length;
  const winnersHidden = winners.length - winnersShown;
  const winnersWithoutTitle = winners.filter((p) => !p.winnerTitle).length;

  const finalistsPublishNotes = [
    `Se mostrarán ${plural(finalistsShown, 'finalista', 'finalistas')} en la galería pública.`,
    ...(finalistsShown === 0
      ? [
          'Todavía no hay finalistas visibles: la galería no mostrará nada nuevo.',
        ]
      : []),
    ...(finalistsHidden > 0
      ? [
          `${plural(finalistsHidden, 'proyecto marcado como finalista no es visible', 'proyectos marcados como finalistas no son visibles')} en la galería y no aparecerá${finalistsHidden === 1 ? '' : 'n'}.`,
        ]
      : []),
  ];

  const resultsPublishNotes = [
    `Se mostrarán ${plural(winnersShown, 'ganador', 'ganadores')} en la galería pública.`,
    ...(winnersShown === 0
      ? [
          'Todavía no hay ganadores visibles: la galería no mostrará nada nuevo.',
        ]
      : []),
    ...(winnersHidden > 0
      ? [
          `${plural(winnersHidden, 'ganador no es visible', 'ganadores no son visibles')} en la galería y no aparecerá${winnersHidden === 1 ? '' : 'n'}.`,
        ]
      : []),
    ...(winnersWithoutTitle > 0
      ? [
          `${plural(winnersWithoutTitle, 'ganador no tiene', 'ganadores no tienen')} título de ganador: se mostrará${winnersWithoutTitle === 1 ? '' : 'n'} sin él.`,
        ]
      : []),
  ];

  const resultsPublished = eventState.resultsPublishedAt !== null;

  return (
    <div className="space-y-8">
      {/* Los promedios cambian mientras el jurado califica: se actualizan solos. */}
      <LiveRefresh intervalMs={30_000} />

      <h1 className="text-xl font-semibold">Panel de organización</h1>

      <PublicationCard
        finalists={{
          isPublished: eventState.finalistsPublishedAt !== null,
          publishedLabel: eventState.finalistsPublishedAt
            ? formatEventDate(eventState.finalistsPublishedAt)
            : null,
          publishNotes: finalistsPublishNotes,
          unpublishNotes: [
            'Se esconden los finalistas de la galería pública.',
            ...(resultsPublished
              ? [
                  'Los resultados siguen publicados, y mientras lo estén los finalistas conservan su insignia. Despublica también los resultados si quieres ocultarlos.',
                ]
              : []),
          ],
        }}
        results={{
          isPublished: resultsPublished,
          publishedLabel: eventState.resultsPublishedAt
            ? formatEventDate(eventState.resultsPublishedAt)
            : null,
          publishNotes: resultsPublishNotes,
          unpublishNotes: ['Se esconden los ganadores de la galería pública.'],
        }}
      />

      <section>
        <h2 className="mb-3 font-medium">Proyectos</h2>

        {projects.length === 0 ? (
          <div data-testid="org-empty">
            <EmptyState
              title="Aún no hay proyectos"
              description="Cuando los equipos guarden sus borradores, aparecerán aquí."
            />
          </div>
        ) : (
          <Table data-testid="org-projects-table" className="min-w-[56rem]">
            <TableHeader>
              <tr>
                <TableHead>Proyecto</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Envío</TableHead>
                <TableHead>Calificaciones</TableHead>
                <TableHead>Promedio</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead>Finalista</TableHead>
                <TableHead>Ganador</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow
                  key={p.projectId}
                  data-testid={`org-project-row-${p.projectId}`}
                >
                  <TableCell className="align-top">
                    <Link
                      href={`/organizacion/proyectos/${p.projectId}`}
                      className="text-link"
                    >
                      {p.title}
                    </Link>
                    {p.isVisibleInGallery && (
                      <Link
                        href={`/galeria/${p.slug}`}
                        data-testid={`org-gallery-link-${p.projectId}`}
                        className="block text-xs text-slate-400 hover:underline"
                      >
                        Ver en la galería
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="align-top text-slate-300">
                    {p.teamName}
                  </TableCell>
                  <TableCell className="align-top text-slate-300">
                    {p.submittedAt
                      ? formatEventDate(p.submittedAt)
                      : 'Borrador'}
                  </TableCell>
                  <TableCell className="align-top text-slate-300">
                    {p.evaluationCount}
                  </TableCell>
                  <TableCell
                    data-testid={`org-average-${p.projectId}`}
                    className="align-top text-slate-300"
                  >
                    {p.averageScore !== null
                      ? formatScore(p.averageScore)
                      : 'Sin evaluar'}
                  </TableCell>
                  <TableCell className="align-top">
                    <FlagSwitch
                      projectId={p.projectId}
                      field="isVisibleInGallery"
                      checked={p.isVisibleInGallery}
                      label={`Visible en la galería: ${p.title}`}
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <FlagSwitch
                      projectId={p.projectId}
                      field="isFinalist"
                      checked={p.isFinalist}
                      label={`Finalista: ${p.title}`}
                    />
                  </TableCell>
                  <TableCell className="align-top">
                    <FlagSwitch
                      projectId={p.projectId}
                      field="isWinner"
                      checked={p.isWinner}
                      label={`Ganador: ${p.title}`}
                    />
                    {p.isWinner && (
                      <Link
                        href={`/organizacion/proyectos/${p.projectId}`}
                        data-testid={`org-winner-title-${p.projectId}`}
                        className={`mt-1 block max-w-40 text-xs ${p.winnerTitle ? 'text-slate-300' : 'text-amber-300 hover:underline'}`}
                      >
                        {p.winnerTitle ?? 'Falta el título de ganador'}
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}

