import { formatEventDate } from '@/dates';
import { requireRole } from '@/lib/auth/session';
import { listTeamsForOrganizer } from '@/lib/team/queries';

export const dynamic = 'force-dynamic';

export default async function OrganizacionEquiposPage() {
  await requireRole(['ORGANIZER']);
  const teams = await listTeamsForOrganizer();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Equipos</h1>

      {teams.length === 0 ? (
        <div data-testid="org-teams-empty" className="info-panel p-6 text-center">
          Todavía no hay equipos registrados.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table data-testid="org-teams-table" className="w-full min-w-[44rem] text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Equipo</th>
                <th className="px-3 py-2 font-medium">Código</th>
                <th className="px-3 py-2 font-medium">Integrantes</th>
                <th className="px-3 py-2 font-medium">Líder</th>
                <th className="px-3 py-2 font-medium">Proyecto</th>
                <th className="px-3 py-2 font-medium">Envío</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr
                  key={t.teamId}
                  data-testid={`org-team-row-${t.teamId}`}
                  className="border-t border-white/10"
                >
                  <td className="px-3 py-3 font-medium">{t.name}</td>
                  <td className="px-3 py-3">
                    <code className="rounded bg-white/10 px-2 py-0.5">{t.joinCode}</code>
                  </td>
                  <td className="px-3 py-3 text-slate-300">{t.memberCount}</td>
                  <td className="px-3 py-3 text-slate-300">{t.leaderEmail}</td>
                  <td className="px-3 py-3 text-slate-300">{t.projectTitle ?? 'Sin proyecto'}</td>
                  <td className="px-3 py-3 text-slate-300">
                    {t.submittedAt ? formatEventDate(t.submittedAt) : 'Sin enviar'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
