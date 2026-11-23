/**
 *   getCurrentUser()        → usuario actual o null
 *   requireUser()           → sin sesión → manda a /ingresar
 *   requireRole(['JUDGE'])  → rol incorrecto → manda a /panel
 *
 * Las PÁGINAS usan requireUser / requireRole (redirigen).
 * Las ACCIONES usan getCurrentUser y devuelven un código de error (UNAUTHENTICATED / FORBIDDEN).
 */
import 'server-only';

import { redirect } from 'next/navigation';

import { db } from '@/lib/db';
import { isProfileComplete } from '@/lib/profile/rules';

import { auth } from './config';
import type { UserRole } from './roles';

export type CurrentUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  teamId: string | null;
  isTeamLeader: boolean;
  firstName: string | null;
  lastName: string | null;
  university: string | null;
  /** true cuando ya completó nombres, apellidos y universidad. */
  profileComplete: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const user = session?.user;

  if (!user?.email) return null;

  // Perfil y equipo en una sola lectura. Un usuario pertenece como máximo a un
  // equipo (team_members.user_id es único).
  const row = await db.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      firstName: true,
      lastName: true,
      university: true,
      teamMembership: {
        select: { teamId: true, team: { select: { leaderId: true } } },
      },
    },
  });
  // La cookie puede sobrevivir a un usuario borrado de la base.
  if (!row) return null;

  const membership = row.teamMembership;
  const profile = {
    firstName: row.firstName,
    lastName: row.lastName,
    university: row.university,
  };

  return {
    id: user.id,
    // El nombre de la base refleja lo que la persona completó en su perfil.
    name: row.name ?? user.name ?? null,
    email: user.email,
    image: user.image ?? null,
    role: user.role,
    teamId: membership?.teamId ?? null,
    isTeamLeader: membership?.team.leaderId === user.id,
    ...profile,
    profileComplete: isProfileComplete(profile),
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/ingresar');
  return user;
}

export async function requireRole(roles: UserRole[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect('/panel');
  return user;
}

/**
 * Los participantes deben completar nombres, apellidos y universidad antes de usar
 * el panel: así sus compañeros y la organización ven quién es cada integrante.
 * Jurado y organización no arman equipos, así que no se les exige.
 */
export function needsProfile(user: CurrentUser): boolean {
  return user.role === 'PARTICIPANT' && !user.profileComplete;
}

/**
 * Como requireUser, pero además manda a /completar-perfil a quien todavía no
 * completó sus datos. Se usa en cada página del panel porque el layout no se
 * vuelve a ejecutar al navegar entre páginas hijas.
 */
export async function requireUserWithProfile(): Promise<CurrentUser> {
  const user = await requireUser();
  if (needsProfile(user)) redirect('/completar-perfil');
  return user;
}
