/**
 * STUBS TEMPORALES DE LECTURA — BORRAR ESTE ARCHIVO CUANDO BD PUBLIQUE:
 *   - src/lib/team/queries.ts     → getMyTeam
 *   - src/lib/project/queries.ts  → getMyProject
 *   - src/lib/event/queries.ts    → getEventState
 *
 * Los tipos de abajo son exactamente los DTO de la sección 3.5 del plan.
 * El día que BD publique lo real, la firma y el shape deben quedar IGUALES:
 * solo cambias el import en cada página, nunca el JSX que ya los consume.
 *
 * Import esperado el día del reemplazo:
 *   import { getMyTeam } from '@/lib/team/queries';
 *   import { getMyProject } from '@/lib/project/queries';
 *   import { getEventState } from '@/lib/event/queries';
 */

export type TeamDto = {
  id: string;
  name: string;
  joinCode: string;
  members: { userId: string; name: string; image: string | null; isLeader: boolean }[];
  memberCount: number;
  isFull: boolean;
  hasMinimumMembers: boolean;
};

export type ProjectDto = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  repositoryUrl: string;
  demoUrl: string;
  videoUrl: string;
  coverUrl: string | null;
  submittedAt: string | null;
  submissionCount: number;
  files: { id: string; kind: string; originalName: string; sizeBytes: number; uploadedAt: string }[];
  missingFields: string[];
  submissionWindow: {
    status: 'NOT_OPEN' | 'OPEN' | 'CLOSED';
    opensAt: string;
    closesAt: string;
    serverNow: string;
  };
};

export type EventStateDto = {
  finalistsPublishedAt: string | null;
  resultsPublishedAt: string | null;
};

/** Simula "aún no tienes equipo". Cambia a un objeto para probar la vista con datos. */
export async function getMyTeam(): Promise<TeamDto | null> {
  return null;
}

/** Simula "aún no tienes proyecto". Cambia a un objeto para probar el formulario precargado. */
export async function getMyProject(): Promise<ProjectDto | null> {
  return null;
}

export async function getEventState(): Promise<EventStateDto> {
  return { finalistsPublishedAt: null, resultsPublishedAt: null };
}
