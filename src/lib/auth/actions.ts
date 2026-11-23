'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createAction } from '@/actions';
import { ActionError } from '@/errors';
import { db } from '@/lib/db';
import { removeStoredFiles } from '@/lib/storage/client';

import { signIn, signOut } from './config';

/** Solo se aceptan rutas internas ("/panel"), para que nadie use el ingreso como redirección a otro sitio. */
const internalPath = z
  .string()
  .refine((path) => path.startsWith('/') && !path.startsWith('//') && !path.includes('\\'));

const signInSchema = z.object({
  provider: z.enum(['google', 'github']),
  next: internalPath.optional(),
});

/**
 * Inicia sesión con Google o GitHub. Si sale bien, Auth.js redirige (lanza un redirect que
 * createAction deja pasar), así que esta acción normalmente no llega a devolver nada.
 */
export const signInAction = createAction(
  signInSchema,
  async ({ provider, next }) => {
    await signIn(provider, { redirectTo: next ?? '/panel' });
  },
  { access: 'public' },
);

export const signOutAction = createAction(
  z.object({}),
  async () => {
    await signOut({ redirectTo: '/ingresar' });
  },
  { access: 'public' },
);

/**
 * Deletes only the account identified by the current server session.
 * A leader's team and project are removed before the account because the
 * team leader foreign key is restrictive.
 */
export const deleteMyAccountAction = createAction(
  z.object({}),
  async (_input, user) => {
    const ledTeams = await db.team.findMany({
      where: { leaderId: user.id },
      select: {
        project: {
          select: {
            files: { select: { bucket: true, storagePath: true } },
          },
        },
      },
    });
    const files = ledTeams.flatMap((team) => team.project?.files ?? []);

    if (files.length > 0) {
      try {
        await removeStoredFiles(files);
      } catch (error) {
        console.error(
          '[deleteMyAccountAction] Storage cleanup failed.',
          error
        );
        throw new ActionError('ACCOUNT_DELETE_STORAGE_FAILED');
      }
    }

    await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`;
      const currentTeams = await tx.team.findMany({
        where: { leaderId: user.id },
        select: { id: true },
      });
      if (currentTeams.length > 0) {
        await tx.team.deleteMany({
          where: { id: { in: currentTeams.map((team) => team.id) } },
        });
      }
      await tx.user.delete({ where: { id: user.id } });
    });

    revalidatePath('/panel');
    revalidatePath('/panel/equipo');
    revalidatePath('/panel/proyecto');
    revalidatePath('/galeria', 'layout');
    revalidatePath('/jurado', 'layout');
    revalidatePath('/organizacion', 'layout');
    revalidatePath('/completar-perfil');

    await signOut({ redirectTo: '/' });
    return {};
  },
);
