import 'server-only';

import { eventConfig } from '@/config/event';
import { serverNow } from '@/clock';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import type {
  GalleryFilter,
  GalleryProjectCardDto,
  GalleryProjectDetailDto,
  JudgeProjectDetailDto,
  JudgeProjectRowDto,
  OrganizerProjectDetailDto,
  OrganizerProjectRowDto,
  ProjectDto,
} from '@/lib/queries/dtos';

const mockProject: ProjectDto = {
  id: 'mock-project-byte-force',
  slug: 'byte-force',
  title: 'Proyecto de prueba',
  summary: 'Una demostración temporal para integrar las pantallas.',
  description:
    'Este contenido falso se reemplazará por datos de PostgreSQL en la semana 2.',
  repositoryUrl: null,
  demoUrl: null,
  videoUrl: null,
  coverUrl: null,
  submittedAt: null,
  submissionCount: 0,
  files: [],
  missingFields: ['title', 'summary', 'description', 'pitchDeck'],
  submissionWindow: {
    status: 'NOT_OPEN',
    opensAt: '2026-01-01T00:00:00.000Z',
    closesAt: '2026-12-31T23:59:59.999Z',
    serverNow: '2026-01-01T00:00:00.000Z',
  },
};

const mockGalleryProject: GalleryProjectDetailDto = {
  slug: mockProject.slug,
  title: mockProject.title,
  summary: mockProject.summary,
  teamName: 'Byte Force',
  coverUrl: null,
  badge: null,
  winnerTitle: null,
  description: mockProject.description,
  repositoryUrl: null,
  demoUrl: null,
  videoUrl: null,
  members: [{ name: 'Líder de prueba', image: null }],
};

export async function getMyProject(): Promise<ProjectDto | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const membership = await db.teamMember.findUnique({
    where: { userId: currentUser.id },
    select: {
      team: {
        select: {
          project: {
            include: {
              files: { orderBy: { createdAt: 'asc' } },
            },
          },
        },
      },
    },
  });

  const project = membership?.team.project;
  if (!project) return null;

  const pitchDeck = project.files.find((file) => file.kind === 'PITCH_DECK');
  const coverImage = project.files.find((file) => file.kind === 'COVER_IMAGE');
  const serverNowIso = serverNow();
  const now = new Date(serverNowIso);
  const opensAt = new Date(eventConfig.dates.submissionOpensAt);
  const closesAt = new Date(eventConfig.dates.submissionClosesAt);

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    description: project.description,
    repositoryUrl: project.repositoryUrl,
    demoUrl: project.demoUrl,
    videoUrl: project.videoUrl,
    coverUrl: coverImage?.storagePath ?? null,
    submittedAt: project.submittedAt?.toISOString() ?? null,
    submissionCount: project.submissionCount,
    files: project.files.map((file) => ({
      id: file.id,
      kind: file.kind,
      originalName: file.originalName,
      sizeBytes: file.sizeBytes,
      uploadedAt: file.createdAt.toISOString(),
    })),
    missingFields: getMissingFields(project, Boolean(pitchDeck)),
    submissionWindow: {
      status: now < opensAt ? 'NOT_OPEN' : now > closesAt ? 'CLOSED' : 'OPEN',
      opensAt: opensAt.toISOString(),
      closesAt: closesAt.toISOString(),
      serverNow: serverNowIso,
    },
  };
}

function getMissingFields(
  project: { title: string; summary: string; description: string },
  hasPitchDeck: boolean
): string[] {
  return [
    ...(project.title.trim() ? [] : ['title']),
    ...(project.summary.trim() ? [] : ['summary']),
    ...(project.description.trim() ? [] : ['description']),
    ...(hasPitchDeck ? [] : ['pitchDeck']),
  ];
}

export async function listGalleryProjects(_params: {
  filter?: GalleryFilter;
  search?: string;
}): Promise<GalleryProjectCardDto[]> {
  void _params;
  return [mockGalleryProject];
}

export async function getGalleryProject(
  slug: string
): Promise<GalleryProjectDetailDto | null> {
  return slug === mockGalleryProject.slug ? mockGalleryProject : null;
}

export async function listProjectsForJudge(): Promise<JudgeProjectRowDto[]> {
  return [
    {
      projectId: mockProject.id,
      title: mockProject.title,
      teamName: mockGalleryProject.teamName,
      submittedAt: '2026-01-01T00:00:00.000Z',
      myWeightedScore: null,
    },
  ];
}

export async function getProjectForJudge(
  projectId: string
): Promise<JudgeProjectDetailDto | null> {
  if (projectId !== mockProject.id) return null;
  return {
    ...(await listProjectsForJudge())[0],
    description: mockProject.description,
    repositoryUrl: null,
    demoUrl: null,
    videoUrl: null,
    myEvaluation: null,
  };
}

export async function listProjectsForOrganizer(): Promise<
  OrganizerProjectRowDto[]
> {
  return [
    {
      projectId: mockProject.id,
      slug: mockProject.slug,
      title: mockProject.title,
      teamName: mockGalleryProject.teamName,
      submittedAt: null,
      evaluationCount: 0,
      averageScore: null,
      isVisibleInGallery: false,
      isFinalist: false,
      isWinner: false,
      winnerTitle: null,
    },
  ];
}

export async function getProjectForOrganizer(
  projectId: string
): Promise<OrganizerProjectDetailDto | null> {
  const project = (await listProjectsForOrganizer()).find(
    ({ projectId: id }) => id === projectId
  );
  return project
    ? {
        ...project,
        description: mockProject.description,
        repositoryUrl: null,
        demoUrl: null,
        videoUrl: null,
      }
    : null;
}
