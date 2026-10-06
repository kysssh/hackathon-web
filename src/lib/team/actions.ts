'use server';

import { z } from 'zod';

import { createAction } from '@/actions';
import { serverNow } from '@/clock';
import { ActionError } from '@/errors';
import { db } from '@/lib/db';
import { isUniqueViolation } from '@/lib/prisma-errors';

import { generateJoinCode, isRegistrationClosed, isTeamFull, normalizeJoinCode, normalizeTeamName } from './rules';

const MAX_JOIN_CODE_ATTEMPTS = 5;

/** El nombre se compara sin distinguir mayúsculas: "byte force" choca con "Byte Force". */
async function teamNameExists(
  name: string,
  client: Pick<typeof db, 'team'> = db,
): Promise<boolean> {
  const team = await client.team.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
    select: { id: true },
  });
  return team !== null;
}

async function isTeamMember(userId: string): Promise<boolean> {
  const membership = await db.teamMember.findUnique({ where: { userId }, select: { userId: true } });
  return membership !== null;
}

const createTeamSchema = z.object({
  name: z.string().transform(normalizeTeamName).pipe(z.string().min(3).max(40)),
});

/** Crea el equipo; quien lo crea queda como líder y primer integrante. */
export const createTeamAction = createAction(
  createTeamSchema,
  async ({ name }, user) => {
    if (isRegistrationClosed(serverNow())) throw new ActionError('TEAM_REGISTRATION_CLOSED');
    if (user.teamId) throw new ActionError('TEAM_ALREADY_MEMBER');
    for (let attempt = 0; attempt < MAX_JOIN_CODE_ATTEMPTS; attempt++) {
      try {
        const team = await db.$transaction(async (tx) => {
          // Serializa las escrituras de equipos antes de comprobar el nombre.
          // Dos solicitudes no crean "Byte Force" y "byte force" a la vez.
          await tx.$executeRaw`LOCK TABLE teams IN SHARE ROW EXCLUSIVE MODE`;
          if (isRegistrationClosed(serverNow()))
            throw new ActionError('TEAM_REGISTRATION_CLOSED');
          const membership = await tx.teamMember.findUnique({
            where: { userId: user.id },
            select: { userId: true },
          });
          if (membership) throw new ActionError('TEAM_ALREADY_MEMBER');
          if (await teamNameExists(name, tx))
            throw new ActionError('TEAM_NAME_TAKEN');

          return tx.team.create({
            data: {
              name,
              joinCode: generateJoinCode(),
              leaderId: user.id,
              members: { create: { userId: user.id } },
            },
            select: { id: true, joinCode: true },
          });
        }, { isolationLevel: 'ReadCommitted' });
        return { teamId: team.id, joinCode: team.joinCode };
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        // Chocó una restricción única. Puede ser el nombre o la persona (por dos clics a la vez)
        // y, muy rara vez, el código: solo en ese último caso se vuelve a intentar con otro código.
        if (await teamNameExists(name)) throw new ActionError('TEAM_NAME_TAKEN');
        if (await isTeamMember(user.id)) throw new ActionError('TEAM_ALREADY_MEMBER');
      }
    }

    throw new Error('No se pudo generar un código de equipo único.');
  },
  { access: ['PARTICIPANT'] },
);

const joinTeamSchema = z.object({
  joinCode: z.string().trim().min(1).max(20),
});

/** Une a la persona al equipo dueño del código (acepta minúsculas y espacios). */
export const joinTeamAction = createAction(
  joinTeamSchema,
  async ({ joinCode }, user) => {
    if (isRegistrationClosed(serverNow())) throw new ActionError('TEAM_REGISTRATION_CLOSED');
    if (user.teamId) throw new ActionError('TEAM_ALREADY_MEMBER');

    const team = await db.team.findUnique({
      where: { joinCode: normalizeJoinCode(joinCode) },
      select: { id: true },
    });
    if (!team) throw new ActionError('TEAM_JOIN_CODE_INVALID');

    try {
      await db.$transaction(async (tx) => {
        // Se bloquea la fila del equipo para que dos personas que entran a la vez
        // no se pasen del máximo: la segunda espera y recién ahí cuenta a los integrantes.
        await tx.$queryRaw`SELECT id FROM teams WHERE id = ${team.id} FOR UPDATE`;

        // La espera por el bloqueo puede terminar después del cierre de inscripciones.
        if (isRegistrationClosed(serverNow()))
          throw new ActionError('TEAM_REGISTRATION_CLOSED');

        const memberCount = await tx.teamMember.count({ where: { teamId: team.id } });
        if (isTeamFull(memberCount)) throw new ActionError('TEAM_FULL');

        await tx.teamMember.create({ data: { teamId: team.id, userId: user.id } });
      });
    } catch (error) {
      // user_id es único en team_members: si ya está en un equipo, la base lo rechaza.
      if (isUniqueViolation(error)) throw new ActionError('TEAM_ALREADY_MEMBER');
      throw error;
    }

    return { teamId: team.id };
  },
  { access: ['PARTICIPANT'] },
);
