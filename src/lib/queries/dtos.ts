export type TeamDto = {
  id: string;
  name: string;
  joinCode: string | null;
  isLeader: boolean;
  /** fullName: nombres y apellidos del perfil (o el nombre de OAuth si aún no los completó). */
  members: { userId: string; name: string | null; fullName: string; university: string | null; image: string | null; isLeader: boolean }[];
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
  repositoryUrl: string | null;
  demoUrl: string | null;
  videoUrl: string | null;
  coverUrl: string | null;
  submittedAt: string | null;
  submissionCount: number;
  activePhase: "PHASE_1" | "PHASE_2" | "SEMIFINAL" | "FINAL";
  files: { id: string; kind: "PITCH_DECK" | "EXTRA" | "COVER_IMAGE" | "WORD_DOCUMENT"; originalName: string; sizeBytes: number; uploadedAt: string }[];
  missingFields: string[];
  submissionWindow: { status: "NOT_OPEN" | "OPEN" | "CLOSED"; opensAt: string; closesAt: string; serverNow: string };
};

export type GalleryProjectCardDto = {
  slug: string;
  title: string;
  summary: string;
  teamName: string;
  coverUrl: string | null;
  badge: "WINNER" | "FINALIST" | null;
  winnerTitle: string | null;
};

export type GalleryProjectDetailDto = GalleryProjectCardDto & {
  description: string;
  repositoryUrl: string | null;
  demoUrl: string | null;
  videoUrl: string | null;
  members: { name: string | null; university: string | null; image: string | null }[];
};

export type JudgeProjectRowDto = {
  projectId: string;
  title: string;
  teamName: string;
  submittedAt: string;
  myWeightedScore: number | null;
};

export type JudgeProjectDetailDto = JudgeProjectRowDto & {
  description: string;
  repositoryUrl: string | null;
  demoUrl: string | null;
  videoUrl: string | null;
  myEvaluation: { innovationScore: number; technologyScore: number; impactScore: number; presentationScore: number; comment: string | null } | null;
};

export type OrganizerProjectRowDto = {
  projectId: string;
  slug: string;
  title: string;
  teamName: string;
  submittedAt: string | null;
  evaluationCount: number;
  averageScore: number | null;
  isVisibleInGallery: boolean;
  isFinalist: boolean;
  isWinner: boolean;
  winnerTitle: string | null;
};

export type OrganizerProjectDetailDto = OrganizerProjectRowDto & {
  description: string;
  repositoryUrl: string | null;
  demoUrl: string | null;
  videoUrl: string | null;
};

export type OrganizerTeamMemberDto = {
  userId: string;
  fullName: string;
  university: string | null;
  email: string;
  isLeader: boolean;
};

export type OrganizerTeamRowDto = {
  teamId: string;
  name: string;
  memberCount: number;
  leaderEmail: string;
  members: OrganizerTeamMemberDto[];
  projectTitle: string | null;
  submittedAt: string | null;
};

export type OrganizerParticipantStatsDto = {
  /** Equipos creados. */
  teamCount: number;
  /** Participantes que ya están dentro de un equipo. */
  participantsInTeams: number;
  /** Participantes que ingresaron a la plataforma (con o sin equipo). */
  registeredParticipants: number;
  /** Participantes que ingresaron pero aún no tienen equipo. */
  participantsWithoutTeam: number;
  /** Participantes que todavía no completaron nombres, apellidos y universidad. */
  incompleteProfiles: number;
  /** Equipos con el mínimo de integrantes / completos. */
  teamsWithMinimum: number;
  fullTeams: number;
};

export type GalleryFilter = "ALL" | "FINALISTS" | "WINNERS";
