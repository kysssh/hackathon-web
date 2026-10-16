'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { eventConfig } from '@/config/event';

import { createAction } from '@/actions';
import { serverNow } from '@/clock';
import { ActionError } from '@/errors';
import { db } from '@/lib/db';
import { isUniqueViolation } from '@/lib/prisma-errors';

import { computeMissingFields, getSubmissionWindow, slugify } from './rules';

const MAX_SAVE_ATTEMPTS = 3;

/** Un enlace opcional: puede venir vacío mientras el proyecto es borrador. */
const optionalUrl = z.union([
  z.literal(''),
  z
    .url()
    .max(500)
    .refine((value) => {
      const protocol = new URL(value).protocol;
      return protocol === 'https:' || protocol === 'http:';
    }, 'Usa un enlace HTTP o HTTPS.'),
]);

const saveProjectDraftSchema = z.object({
  title: z.string().trim().max(120),
  summary: z.string().trim().max(280),
  description: z.string().trim().max(5000),
  repositoryUrl: optionalUrl,
  demoUrl: optionalUrl,
  videoUrl: optionalUrl,
});

/** Busca una dirección libre: "byte-force", "byte-force-2", "byte-force-3"... */
async function findFreeSlug(
  base: string,
  client: Pick<typeof db, 'project'>
): Promise<string> {
  for (let n = 1; n <= 20; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const taken = await client.project.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Guarda el borrador del proyecto del equipo (lo crea la primera vez). Cualquier integrante puede guardar.
 * Devuelve `missingFields`: lo que le falta al proyecto para poder enviarse.
 */
export const saveProjectDraftAction = createAction(
  saveProjectDraftSchema,
  async (input, user) => {
    if (!user.teamId) throw new ActionError('TEAM_REQUIRED');
    // Antes de que abran las entregas sí se puede guardar; después del cierre, no.
    if (getSubmissionWindow(serverNow()).status === 'CLOSED')
      throw new ActionError('SUBMISSION_CLOSED');

    const teamId = user.teamId;
    const fields = {
      title: input.title,
      summary: input.summary,
      description: input.description,
      repositoryUrl: input.repositoryUrl || null,
      demoUrl: input.demoUrl || null,
      videoUrl: input.videoUrl || null,
    };

    for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS; attempt++) {
      try {
        const result = await db.$transaction(async (tx) => {
          // El mismo orden de bloqueos que envío: equipo y después proyecto.
          // Serializa la primera creación y las ediciones del mismo equipo.
          await tx.$queryRaw`SELECT id FROM teams WHERE id = ${teamId} FOR UPDATE`;
          const existing = await tx.project.findUnique({
            where: { teamId },
            select: { id: true },
          });
          if (existing) {
            await tx.$queryRaw`SELECT id FROM projects WHERE id = ${existing.id} FOR UPDATE`;
          }
          // La espera por un bloqueo puede terminar después del cierre.
          if (getSubmissionWindow(serverNow()).status === 'CLOSED')
            throw new ActionError('SUBMISSION_CLOSED');

          let projectId: string;
          if (existing) {
            const updated = await tx.project.update({
              where: { id: existing.id },
              data: fields,
              select: { id: true },
            });
            projectId = updated.id;
          } else {
            const team = await tx.team.findUnique({
              where: { id: teamId },
              select: { name: true },
            });
            if (!team) throw new ActionError('TEAM_REQUIRED');
            const slug = await findFreeSlug(slugify(team.name), tx);
            const created = await tx.project.create({
              data: { teamId, slug, ...fields },
              select: { id: true },
            });
            projectId = created.id;
          }
          const pitchDecks = await tx.projectFile.count({
            where: { projectId, kind: 'PITCH_DECK' },
          });
          return {
            projectId,
            missingFields: computeMissingFields({
              ...fields,
              hasPitchDeck: pitchDecks > 0,
            }),
          };
        });
        revalidatePath('/panel');
        revalidatePath('/panel/proyecto');
        revalidatePath('/galeria', 'layout');
        revalidatePath('/jurado', 'layout');
        revalidatePath('/organizacion', 'layout');
        return result;
      } catch (error) {
        // Dos integrantes guardando por primera vez a la vez, o dos equipos con la misma dirección: se reintenta.
        if (!isUniqueViolation(error)) throw error;
      }
    }

    throw new Error('No se pudo guardar el borrador del proyecto.');
  },
  { access: ['PARTICIPANT'] }
);

/** Entrega o reenvía el proyecto dentro del plazo, solo por su líder. */
export const submitProjectAction = createAction(
  z.object({}),
  async (_input, user) => {
    if (!user.teamId) throw new ActionError('TEAM_REQUIRED');
    const result = await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM teams WHERE id = ${user.teamId} FOR UPDATE`;
      const team = await tx.team.findUnique({
        where: { id: user.teamId! },
        select: { leaderId: true, _count: { select: { members: true } } },
      });
      if (!team) throw new ActionError('TEAM_REQUIRED');
      if (team.leaderId !== user.id)
        throw new ActionError('TEAM_LEADER_REQUIRED');
      if (team._count.members < eventConfig.team.minMembers)
        throw new ActionError('TEAM_TOO_SMALL');
      const project = await tx.project.findUnique({
        where: { teamId: user.teamId! },
        select: { id: true },
      });
      if (!project) throw new ActionError('PROJECT_INCOMPLETE');
      await tx.$queryRaw`SELECT id FROM projects WHERE id = ${project.id} FOR UPDATE`;
      const window = getSubmissionWindow(serverNow());
      if (window.status === 'NOT_OPEN')
        throw new ActionError('SUBMISSION_NOT_OPEN');
      if (window.status === 'CLOSED')
        throw new ActionError('SUBMISSION_CLOSED');
      const current = await tx.project.findUniqueOrThrow({
        where: { id: project.id },
        include: { files: { where: { kind: 'PITCH_DECK' } } },
      });
      if (
        computeMissingFields({
          ...current,
          hasPitchDeck: current.files.length > 0,
        }).length
      )
        throw new ActionError('PROJECT_INCOMPLETE');
      const updated = await tx.project.update({
        where: { id: project.id },
        data: {
          submittedAt: new Date(window.serverNow),
          submissionCount: { increment: 1 },
        },
        select: { submittedAt: true },
      });
      return { submittedAt: updated.submittedAt!.toISOString() };
    });
    revalidatePath('/panel');
    revalidatePath('/panel/proyecto');
    revalidatePath('/jurado');
    revalidatePath('/organizacion');
    return result;
  },
  { access: ['PARTICIPANT'] }
);
