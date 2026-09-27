'use server';

import { z } from 'zod';

import { createAction } from '@/actions';
import type { ProjectFileKind } from '@/config/event';

/** SEMANA 1: respuestas falsas. Se vuelven reales en la semana 3. */

const fileKind = z.enum(['PITCH_DECK', 'EXTRA', 'COVER_IMAGE'] satisfies ProjectFileKind[]);

const uploadRequestSchema = z.object({
  kind: fileKind,
  fileName: z.string().trim().min(1).max(200),
  contentType: z.string().min(1).max(100),
  sizeBytes: z.number().int().positive(),
});

export const createUploadUrlAction = createAction(
  uploadRequestSchema,
  async ({ kind }) => {
    const bucket = kind === 'COVER_IMAGE' ? 'portadas' : 'entregables';
    return { bucket, storagePath: 'mock/path', token: 'mock-token' };
  },
  { access: ['PARTICIPANT'] },
);

export const confirmUploadAction = createAction(
  uploadRequestSchema.extend({ storagePath: z.string().min(1).max(500) }),
  async () => {
    return { fileId: 'mock-file-id' };
  },
  { access: ['PARTICIPANT'] },
);

export const deleteProjectFileAction = createAction(
  z.object({ fileId: z.string().min(1) }),
  async () => {
    return {};
  },
  { access: ['PARTICIPANT'] },
);
