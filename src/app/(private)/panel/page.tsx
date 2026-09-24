import Link from 'next/link';

import { requireUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

// TODO: BORRAR este stub y este import cuando BD publique getMyTeam en
// src/lib/team/queries.ts. La firma y el TeamDto deben quedar IGUALES (sección 3.5).
type TeamDto = {
  id: string;
  name: string;
  joinCode: string;
  members: { userId: string; name: string; image: string | null; isLeader: boolean }[];
  memberCount: number;
  isFull: boolean;
  hasMinimumMembers: boolean;
};
async function getMyTeam(): Promise<TeamDto | null> {
  return null; // simula "aún no tienes equipo"
}

export default async function PanelPage() {
  const user = await requireUser();
  const team = await getMyTeam();

  return (
    <div>
      <h1 className="text-xl font-semibold">Hola, {user.name ?? user.email}</h1>

      {team === null ? (
        <div className="mt-4 rounded border p-6 text-center">
          <p>Aún no tienes equipo.</p>
          <Link href="/panel/equipo" className="underline">Crear o unirme a un equipo</Link>
        </div>
      ) : (
        <div className="mt-4 rounded border p-6">
          <p className="font-medium">{team.name}</p>
          <p className="text-sm text-zinc-500">Código: {team.joinCode}</p>
          <ul className="mt-2">
            {team.members.map((m) => (
              <li key={m.userId}>{m.name}{m.isLeader ? ' (líder)' : ''}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

