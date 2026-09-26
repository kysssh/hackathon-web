'use server';

import { z } from 'zod';

import { createAction } from '@/actions';

/** SEMANA 1: respuestas falsas. Se vuelven reales en la semana 4. */

const updateProjectFlagsSchema = z.object({
  projectId: z.string().min(1),
  isVisibleInGallery: z.boolean().optional(),
  isFinalist: z.boolean().optional(),
  isWinner: z.boolean().optional(),
  winnerTitle: z.string().trim().max(80).nullable().optional(),
});

export const updateProjectFlagsAction = createAction(
  updateProjectFlagsSchema,
  async () => {
    return {};
  },
  { access: ['ORGANIZER'] },
);

const updateEventStateSchema = z.object({
  finalistsPublished: z.boolean().optional(),
  resultsPublished: z.boolean().optional(),
});

export const updateEventStateAction = createAction(
  updateEventStateSchema,
  async () => {
    return {};
  },
  { access: ['ORGANIZER'] },
);
