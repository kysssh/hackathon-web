import Link from 'next/link';

import { getMyProject, getMyTeam } from '@/components/private/temp-stubs';
import { requireUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

type PendingItem = {
  id: string;
  label: string;
  done: boolean;
  href: string;
};

export default async function PanelPage() {
  const user = await requireUser();
  const [team, project] = await Promise.all([getMyTeam(), getMyProject()]);

  const pending: PendingItem[] = [
    {
      id: 'team',
      label: 'Tener un equipo',
      done: team !== null,
      href: '/panel/equipo',
    },
    {
      id: 'min-members',
      label: 'Llegar al mínimo de integrantes',
      done: team?.hasMinimumMembers ?? false,
      href: '/panel/equipo',
    },
    {
      id: 'draft',
      label: 'Guardar el borrador del proyecto',
      done: project !== null,
      href: '/panel/proyecto',
    },
    {
      id: 'pitch',
      label: 'Subir el pitch deck',
      done: project?.files.some((f) => f.kind === 'PITCH_DECK') ?? false,
      href: '/panel/proyecto',
    },
    {
      id: 'submit',
      label: 'Enviar el proyecto',
      done: project?.submittedAt != null,
      href: '/panel/proyecto',
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold">Hola, {user.name ?? user.email}</h1>

      {team === null ? (
        <div className="mt-4 rounded border p-6 text-center" data-testid="panel-no-team">
          <p>Aún no tienes equipo.</p>
          <Link href="/panel/equipo" className="underline">
            Crear o unirme a un equipo
          </Link>
        </div>
      ) : (
        <div className="mt-4 rounded border p-6" data-testid="panel-team-summary">
          <p className="font-medium">{team.name}</p>
          <p className="text-sm text-zinc-500">Código: {team.joinCode}</p>
          <ul className="mt-2">
            {team.members.map((m) => (
              <li key={m.userId}>
                {m.name}
                {m.isLeader ? ' (líder)' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mt-8 mb-3 font-medium">Pendientes</h2>
      <ul className="space-y-2" data-testid="panel-pending-list">
        {pending.map((item) => (
          <li
            key={item.id}
            data-testid={`panel-pending-${item.id}`}
            className="flex items-center justify-between rounded border px-4 py-2"
          >
            <span className={item.done ? 'line-through text-zinc-400' : ''}>{item.label}</span>
            {!item.done && (
              <Link href={item.href} className="text-sm underline">
                Ir
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
