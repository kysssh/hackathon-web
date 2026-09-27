'use server';

import { z } from 'zod';

import { createAction } from '@/actions';

/**
 * SEMANA 1: respuestas falsas. saveProjectDraftAction se vuelve real en la semana 2
 * y submitProjectAction en la semana 3.
 */

/** Un enlace opcional: puede venir vacío mientras el proyecto es borrador. */
const optionalUrl = z.union([z.literal(''), z.url().max(500)]);

const saveProjectDraftSchema = z.object({
  title: z.string().trim().max(120),
  summary: z.string().trim().max(280),
  description: z.string().trim().max(5000),
  repositoryUrl: optionalUrl,
  demoUrl: optionalUrl,
  videoUrl: optionalUrl,
});

export const saveProjectDraftAction = createAction(
  saveProjectDraftSchema,
  async () => {
    return { projectId: 'mock-project-id', missingFields: [] as string[] };
  },
  { access: ['PARTICIPANT'] },
);

// El líder se comprueba dentro de la acción (semana 3), porque depende del equipo y no solo del rol.
export const submitProjectAction = createAction(
  z.object({}),
  async () => {
    return { submittedAt: new Date().toISOString() };
  },
  { access: ['PARTICIPANT'] },
);
