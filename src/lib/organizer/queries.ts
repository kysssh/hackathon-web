import 'server-only';

import { criteria } from '@/config/criteria';
import type { ProjectFileKind } from '@/config/event';
import { ActionError } from '@/errors';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db';

/**
 * Lecturas extra del organizador para /organizacion/proyectos/[projectId]:
 * cada evaluación con su comentario y los archivos del proyecto.
 *
 * Archivo NUEVO (no se editó ninguna query de BD): el DTO de detalle del
 * organizador solo traía promedio y conteo. Si BD prefiere integrarlo en
 * src/lib/project/queries.ts / dtos.ts, basta con mover estas funciones.
 */

export type OrganizerEvaluationDto = {
  id: string;
  judgeName: string | null;
  judgeEmail: string;
  innovationScore: number;
  technologyScore: number;
  impactScore: number;
  presentationScore: number;
  /** Misma fórmula y pesos que el promedio de la tabla: Σ(nota × peso) / 100. */
  weightedScore: number;
  comment: string | null;
};

export type OrganizerFileDto = {
  id: string;
  kind: ProjectFileKind;
  originalName: string;
  contentType: string;
  sizeBytes: number;
};

type EvaluationRow = {
  id: string;
  innovationScore: number;
  technologyScore: number;
  impactScore: number;
  presentationScore: number;
  comment: string | null;
  judge: { name: string | null; email: string };
};

type FileRow = {
  id: string;
  kind: ProjectFileKind;
  originalName: string;
  contentType: string;
  sizeBytes: number;
};

// Defensa en profundidad: las páginas ya llaman a requireRole, pero estas
// lecturas exponen comentarios de jurados y archivos de un bucket privado.
async function assertOrganizer(): Promise<void> {
  const user = await getCurrentUser();
  if (user?.role !== 'ORGANIZER') throw new ActionError('FORBIDDEN');
}

function weightedScore(row: EvaluationRow): number {
  const total = criteria.reduce((sum, c) => sum + row[c.field] * c.weight, 0);
  return Math.round((total / 100) * 100) / 100;
}

export async function listEvaluationsForOrganizer(
  projectId: string
): Promise<OrganizerEvaluationDto[]> {
  await assertOrganizer();

  const rows: EvaluationRow[] = await db.evaluation.findMany({
    where: { projectId },
    select: {
      id: true,
      innovationScore: true,
      technologyScore: true,
      impactScore: true,
      presentationScore: true,
      comment: true,
      judge: { select: { name: true, email: true } },
    },
    orderBy: { judge: { email: 'asc' } },
  });

  return rows.map(
    (row: EvaluationRow): OrganizerEvaluationDto => ({
      id: row.id,
      judgeName: row.judge.name,
      judgeEmail: row.judge.email,
      innovationScore: row.innovationScore,
      technologyScore: row.technologyScore,
      impactScore: row.impactScore,
      presentationScore: row.presentationScore,
      weightedScore: weightedScore(row),
      comment: row.comment,
    })
  );
}

export async function listFilesForOrganizer(
  projectId: string
): Promise<OrganizerFileDto[]> {
  await assertOrganizer();

  const rows: FileRow[] = await db.projectFile.findMany({
    where: { projectId },
    select: {
      id: true,
      kind: true,
      originalName: true,
      contentType: true,
      sizeBytes: true,
    },
    orderBy: [{ kind: 'asc' }, { createdAt: 'asc' }],
  });

  return rows.map(
    (row: FileRow): OrganizerFileDto => ({
      id: row.id,
      kind: row.kind,
      originalName: row.originalName,
      contentType: row.contentType,
      sizeBytes: row.sizeBytes,
    })
  );
}

/** Datos mínimos para firmar la descarga de un archivo. */
export async function getFileForDownload(
  fileId: string
): Promise<{ bucket: string; storagePath: string; originalName: string } | null> {
  await assertOrganizer();

  const row: { bucket: string; storagePath: string; originalName: string } | null =
    await db.projectFile.findUnique({
      where: { id: fileId },
      select: { bucket: true, storagePath: true, originalName: true },
    });

  return row;
}
