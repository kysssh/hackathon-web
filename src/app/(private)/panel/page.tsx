import Link from 'next/link';

import { LiveRefresh } from '@/components/private/live-refresh';
import { getMyTeam } from '@/lib/team/queries';
import { getMyProject } from '@/lib/project/queries';
import { requireUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

type PendingItem = {
  id: string;
  label: string;
  done: boolean;
  href: string;
};

/** Pantalla de inicio de quienes no son participantes: un jurado o la organización no arman equipo. */
function RoleHome({
  greeting,
  text,
  href,
  cta,
  testId,
}: {
  greeting: string;
  text: string;
  href: string;
  cta: string;
  testId: string;
}) {
  return (
    <div>
      <h1 className="text-xl font-semibold">{greeting}</h1>
      <div className="info-panel mt-4 p-6" data-testid={testId}>
        <p>{text}</p>
        <Link href={href} className="button-primary mt-4 inline-flex">
          {cta}
        </Link>
      </div>
    </div>
  );
}

export default async function PanelPage() {
  const user = await requireUser();
  const greeting = `Hola, ${user.name ?? user.email}`;

  if (user.role === 'JUDGE') {
    return (
      <RoleHome
        greeting={greeting}
        text="Tu rol es Jurado: calificas los proyectos que envían los equipos."
        href="/jurado"
        cta="Ir a calificar proyectos"
        testId="panel-judge-home"
      />
    );
  }

  if (user.role === 'ORGANIZER') {
    return (
      <RoleHome
        greeting={greeting}
        text="Tu rol es Organización: gestionas equipos, proyectos y la publicación de resultados."
        href="/organizacion"
        cta="Ir al panel de organización"
        testId="panel-organizer-home"
      />
    );
  }

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
      <LiveRefresh enabled={team !== null && !team.isFull} />
      <h1 className="text-xl font-semibold">{greeting}</h1>

      {team === null ? (
        <div
          className="info-panel mt-4 p-6 text-center"
          data-testid="panel-no-team"
        >
          <p>Aún no tienes equipo.</p>
          <Link
            href="/panel/equipo"
            className="button-primary mt-4 inline-flex"
          >
            Crear o unirme a un equipo
          </Link>
        </div>
      ) : (
        <div className="info-panel mt-4 p-6" data-testid="panel-team-summary">
          <p className="font-medium">{team.name}</p>
          <p className="mt-1 text-sm text-slate-400">
            Código:{' '}
            <code className="rounded bg-white/10 px-2 py-0.5">
              {team.joinCode}
            </code>
          </p>
          <ul className="mt-3 space-y-1">
            {team.members.map((m) => (
              <li key={m.userId}>
                {m.name ?? 'Sin nombre'}
                {m.isLeader ? ' (líder)' : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mb-3 mt-8 font-medium">Pendientes</h2>
      <ul className="space-y-2" data-testid="panel-pending-list">
        {pending.map((item) => (
          <li
            key={item.id}
            data-testid={`panel-pending-${item.id}`}
            className="info-panel flex items-center justify-between gap-3 px-4 py-2"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={item.done ? 'text-emerald-300' : 'text-slate-500'}
              >
                {item.done ? '✓' : '○'}
              </span>
              <span className={item.done ? 'text-slate-500 line-through' : ''}>
                {item.label}
              </span>
              {item.done && <span className="sr-only">(hecho)</span>}
            </span>
            {!item.done && (
              <Link href={item.href} className="text-link text-sm">
                Ir
              </Link>
            )}
          </li>
        ))}
      </ul>

      {pending.every((item) => item.done) && (
        <p
          data-testid="panel-all-done"
          className="mt-4 text-sm text-emerald-300"
        >
          ¡Todo listo! Tu proyecto ya fue enviado.
        </p>
      )}
    </div>
  );
}
