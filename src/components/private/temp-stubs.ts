
/*NO USAR ESTE ARCHUVO, POR LO QUE SE VE ESTE CASO ERA UNICAMENTE COMO UN LLENADO HASTA QUE SE SUBIERA LA DATA BASE NO USAR PARA NADA*/


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
