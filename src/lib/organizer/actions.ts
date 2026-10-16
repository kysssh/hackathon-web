'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createAction } from '@/actions';
import { serverNow } from '@/clock';
import { ActionError } from '@/errors';
import { db } from '@/lib/db';

const updateProjectFlagsSchema = z.object({
  projectId: z.string().min(1),
  isVisibleInGallery: z.boolean().optional(),
  isFinalist: z.boolean().optional(),
  isWinner: z.boolean().optional(),
  winnerTitle: z.string().trim().max(80).nullable().optional(),
});

export const updateProjectFlagsAction = createAction(
  updateProjectFlagsSchema,
  async ({ projectId, ...flags }) => {
    const project = await db.$transaction(async (tx) => {
      // Comparte el bloqueo con envío y evaluación para validar el estado actual.
      await tx.$queryRaw`SELECT id FROM projects WHERE id = ${projectId} FOR UPDATE`;
      const current = await tx.project.findUnique({
        where: { id: projectId },
        select: { submittedAt: true, slug: true },
      });
      if (!current) throw new ActionError('NOT_FOUND');
      if (
        !current.submittedAt &&
        (flags.isVisibleInGallery === true ||
          flags.isFinalist === true ||
          flags.isWinner === true)
      ) {
        throw new ActionError('PROJECT_NOT_SUBMITTED');
      }
      await tx.project.update({ where: { id: projectId }, data: flags });
      return current;
    });

    revalidatePath('/galeria');
    revalidatePath(`/galeria/${project.slug}`);
    revalidatePath('/jurado');
    revalidatePath(`/jurado/${projectId}`);
    revalidatePath('/organizacion');
    revalidatePath(`/organizacion/proyectos/${projectId}`);
    return {};
  },
  { access: ['ORGANIZER'] }
);

const updateEventStateSchema = z.object({
  finalistsPublished: z.boolean().optional(),
  resultsPublished: z.boolean().optional(),
});

export const updateEventStateAction = createAction(
  updateEventStateSchema,
  async ({ finalistsPublished, resultsPublished }) => {
    await db.$transaction(async (tx) => {
      // Crea la fila si falta y serializa cambios parciales de publicación.
      await tx.eventState.upsert({
        where: { id: 1 },
        create: { id: 1 },
        update: {},
      });
      await tx.$queryRaw`SELECT id FROM event_state WHERE id = 1 FOR UPDATE`;
      const current = await tx.eventState.findUniqueOrThrow({
        where: { id: 1 },
      });
      const now = new Date(serverNow());
      await tx.eventState.update({
        where: { id: 1 },
        data: {
          ...(finalistsPublished !== undefined
            ? {
                finalistsPublishedAt: finalistsPublished
                  ? (current.finalistsPublishedAt ?? now)
                  : null,
              }
            : {}),
          ...(resultsPublished !== undefined
            ? {
                resultsPublishedAt: resultsPublished
                  ? (current.resultsPublishedAt ?? now)
                  : null,
              }
            : {}),
        },
      });
    });

    revalidatePath('/galeria', 'layout');
    revalidatePath('/organizacion');
    return {};
  },
  { access: ['ORGANIZER'] }
);
