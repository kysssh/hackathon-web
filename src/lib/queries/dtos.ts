export type TeamDto = {
  id: string;
  name: string;
  joinCode: string;
  members: { userId: string; name: string | null; image: string | null; isLeader: boolean }[];
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
  files: { id: string; kind: "PITCH_DECK" | "EXTRA" | "COVER_IMAGE"; originalName: string; sizeBytes: number; uploadedAt: string }[];
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
  members: { name: string | null; image: string | null }[];
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

export type OrganizerTeamRowDto = {
  teamId: string;
  name: string;
  joinCode: string;
  memberCount: number;
  leaderEmail: string;
  projectTitle: string | null;
  submittedAt: string | null;
};

export type GalleryFilter = "ALL" | "FINALISTS" | "WINNERS";
