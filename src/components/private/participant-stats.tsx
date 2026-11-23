import Link from 'next/link';

import type { OrganizerParticipantStatsDto } from '@/lib/queries/dtos';

function Stat({
  label,
  value,
  detail,
  testId,
}: {
  label: string;
  value: number;
  detail?: string;
  testId: string;
}) {
  return (
    <div className="info-panel p-5" data-testid={testId}>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold" data-testid={`${testId}-value`}>
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-slate-400">{detail}</p>}
    </div>
  );
}

/** Resumen de inscripción para la organización: equipos creados y personas en equipos. */
export function ParticipantStats({
  stats,
  showTeamsLink = false,
}: {
  stats: OrganizerParticipantStatsDto;
  showTeamsLink?: boolean;
}) {
  return (
    <section aria-labelledby="participant-stats-title">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="participant-stats-title" className="font-medium">
          Inscripción
        </h2>
        {showTeamsLink && (
          <Link href="/organizacion/equipos" className="text-link text-sm">
            Ver equipos e integrantes →
          </Link>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          testId="stat-teams"
          label="Equipos creados"
          value={stats.teamCount}
          detail={`${stats.teamsWithMinimum} con el mínimo · ${stats.fullTeams} completos`}
        />
        <Stat
          testId="stat-in-teams"
          label="Inscritos en un equipo"
          value={stats.participantsInTeams}
        />
        <Stat
          testId="stat-registered"
          label="Participantes registrados"
          value={stats.registeredParticipants}
          detail={`${stats.participantsWithoutTeam} sin equipo`}
        />
        <Stat
          testId="stat-incomplete"
          label="Perfiles incompletos"
          value={stats.incompleteProfiles}
          detail="Sin nombres, apellidos o universidad"
        />
      </div>
    </section>
  );
}
