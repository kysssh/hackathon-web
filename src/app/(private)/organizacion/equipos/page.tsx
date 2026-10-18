import { LiveRefresh } from '@/components/private/live-refresh';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { eventConfig } from '@/config/event';
import { formatEventDate } from '@/dates';
import { requireRole } from '@/lib/auth/session';
import { listTeamsForOrganizer } from '@/lib/team/queries';

export const dynamic = 'force-dynamic';

const { minMembers, maxMembers } = eventConfig.team;

function MembersBadge({ count }: { count: number }) {
  if (count >= maxMembers)
    return <Badge tone="success">{count} · Completo</Badge>;
  if (count >= minMembers)
    return <Badge tone="brand">{count} · Mínimo alcanzado</Badge>;
  return <Badge tone="warning">{count} · Bajo el mínimo</Badge>;
}

export default async function OrganizacionEquiposPage() {
  await requireRole(['ORGANIZER']);
  const teams = await listTeamsForOrganizer();
  const submitted = teams.filter((t) => t.submittedAt !== null).length;

  return (
    <div className="space-y-6">
      {/* Se inscriben equipos todo el día: la lista se actualiza sola. */}
      <LiveRefresh intervalMs={30_000} />

      <div>
        <h1 className="text-xl font-semibold">Equipos</h1>
        {teams.length > 0 && (
          <p
            data-testid="org-teams-summary"
            className="mt-1 text-sm text-slate-400"
          >
            {teams.length} {teams.length === 1 ? 'equipo' : 'equipos'} ·{' '}
            {submitted} con proyecto enviado
          </p>
        )}
      </div>

      {teams.length === 0 ? (
        <div data-testid="org-teams-empty">
          <EmptyState
            title="Aún no hay equipos"
            description="Cuando los participantes creen equipos, aparecerán aquí."
          />
        </div>
      ) : (
        <Table data-testid="org-teams-table" className="min-w-[44rem]">
          <TableHeader>
            <tr>
              <TableHead>Equipo</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Integrantes</TableHead>
              <TableHead>Líder</TableHead>
              <TableHead>Proyecto</TableHead>
              <TableHead>Envío</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {teams.map((t) => (
              <TableRow key={t.teamId} data-testid={`org-team-row-${t.teamId}`}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-white/10 px-2 py-0.5">
                    {t.joinCode}
                  </code>
                </TableCell>
                <TableCell>
                  <MembersBadge count={t.memberCount} />
                </TableCell>
                <TableCell className="text-slate-300">
                  {t.leaderEmail}
                </TableCell>
                <TableCell className="text-slate-300">
                  {t.projectTitle ?? 'Sin proyecto'}
                </TableCell>
                <TableCell className="text-slate-300">
                  {t.submittedAt
                    ? formatEventDate(t.submittedAt)
                    : 'Sin enviar'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
