import { getMyTeam } from '@/lib/team/queries';
import { requireUserWithProfile } from '@/lib/auth/session';

import { NoTeamForms, TeamCard } from './team-forms';

export const dynamic = 'force-dynamic';

export default async function EquipoPage() {
  await requireUserWithProfile();
  const team = await getMyTeam();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Tu equipo</h1>
      {team ? <TeamCard team={team} /> : <NoTeamForms />}
    </div>
  );
}
