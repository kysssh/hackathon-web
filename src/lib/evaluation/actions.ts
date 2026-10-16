'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAction } from '@/actions';
import { serverNow } from '@/clock';
import { criteria, scoreRange } from '@/config/criteria';
import { eventConfig } from '@/config/event';
import { ActionError } from '@/errors';
import { db } from '@/lib/db';
import { computeWeightedScore } from './rules';

const score = z.number().int().min(scoreRange.min).max(scoreRange.max);
const saveEvaluationSchema = z.object({
  projectId: z.string().min(1),
  innovationScore: score,
  technologyScore: score,
  impactScore: score,
  presentationScore: score,
  comment: z.string().trim().max(2000),
});

export const saveEvaluationAction = createAction(
  saveEvaluationSchema,
  async (input, user) => {
    const { projectId, ...scores } = input;
    const result = await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM projects WHERE id = ${projectId} FOR UPDATE`;
      if (
        Date.parse(serverNow()) >
        Date.parse(eventConfig.dates.evaluationClosesAt)
      )
        throw new ActionError('EVALUATION_CLOSED');
      const project = await tx.project.findUnique({
        where: { id: projectId },
        select: { submittedAt: true, isVisibleInGallery: true },
      });
      if (!project) throw new ActionError('NOT_FOUND');
      if (!project.submittedAt) throw new ActionError('PROJECT_NOT_SUBMITTED');
      if (!project.isVisibleInGallery) throw new ActionError('FORBIDDEN');
      const evaluation = await tx.evaluation.upsert({
        where: { projectId_judgeId: { projectId, judgeId: user.id } },
        create: { projectId, judgeId: user.id, ...scores },
        update: scores,
      });
      // El esquema guarda las cuatro notas; el promedio se deriva de ellas, no de una columna adicional.
      const weightedScore = computeWeightedScore(
        Object.fromEntries(
          criteria.map(({ field }) => [field, evaluation[field]])
        ) as Parameters<typeof computeWeightedScore>[0]
      );
      return { weightedScore };
    });
    revalidatePath('/jurado');
    revalidatePath(`/jurado/${projectId}`);
    revalidatePath('/organizacion');
    revalidatePath(`/organizacion/proyectos/${projectId}`);
    return result;
  },
  { access: ['JUDGE'] }
);
