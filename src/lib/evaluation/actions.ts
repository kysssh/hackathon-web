'use server';

import { z } from 'zod';

import { createAction } from '@/actions';
import { scoreRange } from '@/config/criteria';

/** SEMANA 1: respuesta falsa. Se vuelve real en la semana 3. */

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
  async () => {
    return { weightedScore: 0 };
  },
  { access: ['JUDGE'] },
);
