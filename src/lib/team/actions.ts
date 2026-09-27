'use server';

import { z } from 'zod';

import { createAction } from '@/actions';

/**
 * SEMANA 1: respuestas falsas. Se vuelven reales en la semana 2 (cambia solo lo de adentro,
 * nunca el nombre ni lo que recibe o devuelve).
 */

const createTeamSchema = z.object({
  name: z.string().trim().min(3).max(40),
});

export const createTeamAction = createAction(
  createTeamSchema,
  async () => {
    return { teamId: 'mock-team-id', joinCode: 'HACK-0000' };
  },
  { access: ['PARTICIPANT'] },
);

const joinTeamSchema = z.object({
  joinCode: z.string().trim().min(1).max(20),
});

export const joinTeamAction = createAction(
  joinTeamSchema,
  async () => {
    return { teamId: 'mock-team-id' };
  },
  { access: ['PARTICIPANT'] },
);
