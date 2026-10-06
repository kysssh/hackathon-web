'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAction } from '@/actions';
import { serverNow } from '@/clock';
import { ActionError } from '@/errors';
import { db } from '@/lib/db';
import { getSubmissionWindow } from '@/lib/project/rules';
import {
  createSignedUpload,
  getStoredFile,
  removeStoredFile,
} from '@/lib/storage/client';
import {
  assertFileLimit,
  assertStoragePath,
  bucketForKind,
  createStoragePath,
  validateFile,
} from './rules';

const uploadRequestSchema = z.object({
  kind: z.enum(['PITCH_DECK', 'EXTRA', 'COVER_IMAGE']),
  fileName: z.string().trim().min(1).max(200),
  contentType: z.string().min(1).max(100),
  sizeBytes: z.number().int().positive(),
});

function assertEditable() {
  if (getSubmissionWindow(serverNow()).status === 'CLOSED')
    throw new ActionError('SUBMISSION_CLOSED');
}

async function myProject(teamId: string | null) {
  if (!teamId) throw new ActionError('TEAM_REQUIRED');
  const project = await db.project.findUnique({
    where: { teamId },
    select: { id: true },
  });
  if (!project) throw new ActionError('NOT_FOUND');
  return project;
}

function refreshProject() {
  revalidatePath('/panel');
  revalidatePath('/panel/proyecto');
}

export const createUploadUrlAction = createAction(
  uploadRequestSchema,
  async (input, user) => {
    assertEditable();
    validateFile(input);
    const project = await myProject(user.teamId);
    const count = await db.projectFile.count({
      where: { projectId: project.id, kind: input.kind },
    });
    assertFileLimit(input.kind, count);
    const bucket = bucketForKind(input.kind);
    const storagePath = createStoragePath(project.id, input);
    const { token } = await createSignedUpload(bucket, storagePath);
    return { bucket, storagePath, token };
  },
  { access: ['PARTICIPANT'] }
);

export const confirmUploadAction = createAction(
  uploadRequestSchema.extend({ storagePath: z.string().min(1).max(500) }),
  async (input, user) => {
    assertEditable();
    validateFile(input);
    const project = await myProject(user.teamId);
    assertStoragePath(project.id, input, input.storagePath);
    const bucket = bucketForKind(input.kind);
    const stored = await getStoredFile(bucket, input.storagePath);
    validateFile({ kind: input.kind, ...stored });
    if (
      stored.sizeBytes !== input.sizeBytes ||
      stored.contentType !== input.contentType
    )
      throw new ActionError('VALIDATION_ERROR');

    const result = await db.$transaction(async (tx) => {
      // El mismo bloqueo se usa al enviar: confirmar y enviar no pueden intercalarse.
      await tx.$queryRaw`SELECT id FROM projects WHERE id = ${project.id} FOR UPDATE`;
      assertEditable();
      const existing = await tx.projectFile.findFirst({
        where: { projectId: project.id, storagePath: input.storagePath },
      });
      if (existing) return { fileId: existing.id };
      const count = await tx.projectFile.count({
        where: { projectId: project.id, kind: input.kind },
      });
      assertFileLimit(input.kind, count);
      const file = await tx.projectFile.create({
        data: {
          projectId: project.id,
          kind: input.kind,
          bucket,
          storagePath: input.storagePath,
          originalName: input.fileName,
          contentType: stored.contentType,
          sizeBytes: stored.sizeBytes,
        },
        select: { id: true },
      });
      return { fileId: file.id };
    });
    refreshProject();
    return result;
  },
  { access: ['PARTICIPANT'] }
);

export const deleteProjectFileAction = createAction(
  z.object({ fileId: z.string().min(1) }),
  async ({ fileId }, user) => {
    assertEditable();
    const project = await myProject(user.teamId);
    const deletedFile = await db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM projects WHERE id = ${project.id} FOR UPDATE`;
        assertEditable();
        const file = await tx.projectFile.findUnique({ where: { id: fileId } });
        if (!file) throw new ActionError('NOT_FOUND');
        if (
          file.projectId !== project.id ||
          file.bucket !== bucketForKind(file.kind)
        )
          throw new ActionError('FORBIDDEN');
        await tx.projectFile.delete({ where: { id: file.id } });
        return { fileId: file.id, bucket: file.bucket, storagePath: file.storagePath };
      },
      { timeout: 20000 }
    );
    // Storage no participa en la transaccion: se elimina despues del commit.
    try {
      await removeStoredFile(deletedFile.bucket, deletedFile.storagePath);
    } catch {
      // La referencia ya fue eliminada; el objeto requiere limpieza posterior.
      // No se registra el error remoto porque puede contener credenciales.
      console.error('[deleteProjectFileAction] Objeto pendiente de limpieza:', deletedFile);
    }
    refreshProject();
    return {};
  },
  { access: ['PARTICIPANT'] }
);
