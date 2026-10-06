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
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const user = session?.user;

  if (!user?.email) return null;

  // Un usuario pertenece como máximo a un equipo (team_members.user_id es único).
  const membership = await db.teamMember.findUnique({
    where: { userId: user.id },
    select: { teamId: true, team: { select: { leaderId: true } } },
  });

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email,
    image: user.image ?? null,
    role: user.role,
    teamId: membership?.teamId ?? null,
    isTeamLeader: membership?.team.leaderId === user.id,
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