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

  // TODO (cuando BD entregue el schema): buscar aquí el equipo real del usuario
  // (tabla team_members) para llenar `teamId` e `isTeamLeader`.
  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email,
    image: user.image ?? null,
    role: user.role,
    teamId: null,
    isTeamLeader: false,
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