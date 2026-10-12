import 'server-only';

import { serverNow } from '@/clock';
import { criteria } from '@/config/criteria';
import { Prisma } from '@/generated/prisma/client';
import { getQueryUser as getCurrentUser } from '@/lib/queries/session';
import { db } from '@/lib/db';
import { computeMissingFields, getSubmissionWindow } from '@/lib/project/rules';
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

type EvaluationScores = {
  innovationScore: number;
  technologyScore: number;
  impactScore: number;
  presentationScore: number;
};

type OrganizerProjectData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  repositoryUrl: string | null;
  demoUrl: string | null;
  videoUrl: string | null;
  submittedAt: Date | null;
  isVisibleInGallery: boolean;
  isFinalist: boolean;
  isWinner: boolean;
  winnerTitle: string | null;
  team: { name: string };
  evaluations: EvaluationScores[];
};

export async function getMyProject(): Promise<ProjectDto | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser?.teamId) return null;

  const project = await db.project.findUnique({
    where: { teamId: currentUser.teamId },
    include: { files: { orderBy: { createdAt: 'asc' } } },
  });
  if (!project) return null;

  const pitchDeck = project.files.find((file) => file.kind === 'PITCH_DECK');
  const coverImage = project.files.find((file) => file.kind === 'COVER_IMAGE');
  const serverNowIso = serverNow();

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    description: project.description,
    repositoryUrl: project.repositoryUrl,
    demoUrl: project.demoUrl,
    videoUrl: project.videoUrl,
    coverUrl: coverImage
      ? getPublicStorageUrl(coverImage.bucket, coverImage.storagePath)
      : null,
    submittedAt: project.submittedAt?.toISOString() ?? null,
    submissionCount: project.submissionCount,
    files: project.files.map((file) => ({
      id: file.id,
      kind: file.kind,
      originalName: file.originalName,
      sizeBytes: file.sizeBytes,
      uploadedAt: file.createdAt.toISOString(),
    })),
    missingFields: computeMissingFields({
      ...project,
      hasPitchDeck: Boolean(pitchDeck),
    }),
    submissionWindow: getSubmissionWindow(serverNowIso),
  };
}

export async function listGalleryProjects({
  filter = 'ALL',
  search,
}: {
  filter?: GalleryFilter;
  search?: string;
}): Promise<GalleryProjectCardDto[]> {
  const publicationState = await getPublicationState();

  if (filter === 'FINALISTS' && !publicationState.finalistsArePublic) return [];
  if (filter === 'WINNERS' && !publicationState.resultsArePublic) return [];

  const normalizedSearch = search?.trim() ?? '';
  // Un JOIN evita consultas separadas para cada relación de Prisma.
  const projects = await db.$queryRaw<
    {
      slug: string;
      title: string;
      summary: string;
      teamName: string;
      isFinalist: boolean;
      isWinner: boolean;
      winnerTitle: string | null;
      bucket: string | null;
      storagePath: string | null;
    }[]
  >(Prisma.sql`
    SELECT p.slug, p.title, p.summary, t.name AS "teamName",
      p.is_finalist AS "isFinalist", p.is_winner AS "isWinner",
      p.winner_title AS "winnerTitle", cover.bucket,
      cover.storage_path AS "storagePath"
    FROM projects p
    JOIN teams t ON t.id = p.team_id
    LEFT JOIN LATERAL (
      SELECT bucket, storage_path FROM project_files
      WHERE project_id = p.id AND kind = 'COVER_IMAGE'
      ORDER BY created_at ASC, id ASC LIMIT 1
    ) cover ON TRUE
    WHERE p.submitted_at IS NOT NULL AND p.is_visible_in_gallery = TRUE
      AND (${filter} <> 'FINALISTS' OR p.is_finalist = TRUE)
      AND (${filter} <> 'WINNERS' OR p.is_winner = TRUE)
      AND (${normalizedSearch} = ''
        OR strpos(lower(p.title), lower(${normalizedSearch})) > 0
        OR strpos(lower(p.summary), lower(${normalizedSearch})) > 0
        OR strpos(lower(t.name), lower(${normalizedSearch})) > 0)
    ORDER BY p.submitted_at DESC, p.title ASC, p.id ASC
  `);

  return projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    teamName: project.teamName,
    coverUrl:
      project.bucket && project.storagePath
        ? getPublicStorageUrl(project.bucket, project.storagePath)
        : null,
    badge: getPublicBadge(project, publicationState),
    winnerTitle: publicationState.resultsArePublic ? project.winnerTitle : null,
  }));
}

export async function getGalleryProject(
  slug: string
): Promise<GalleryProjectDetailDto | null> {
  const [project, publicationState] = await Promise.all([
    db.project.findFirst({
      where: {
        slug,
        submittedAt: { not: null },
        isVisibleInGallery: true,
      },
      select: {
        slug: true,
        title: true,
        summary: true,
        description: true,
        repositoryUrl: true,
        demoUrl: true,
        videoUrl: true,
        isFinalist: true,
        isWinner: true,
        winnerTitle: true,
        team: {
          select: {
            name: true,
            members: {
              orderBy: { joinedAt: 'asc' },
              select: {
                user: { select: { name: true, image: true } },
              },
            },
          },
        },
        files: {
          where: { kind: 'COVER_IMAGE' },
          select: { bucket: true, storagePath: true },
          take: 1,
        },
      },
    }),
    getPublicationState(),
  ]);

  if (!project) return null;

  return {
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    teamName: project.team.name,
    coverUrl: getCoverUrl(project.files[0]),
    badge: getPublicBadge(project, publicationState),
    winnerTitle: publicationState.resultsArePublic ? project.winnerTitle : null,
    description: project.description,
    repositoryUrl: project.repositoryUrl,
    demoUrl: project.demoUrl,
    videoUrl: project.videoUrl,
    members: project.team.members.map(({ user }) => ({
      name: user.name,
      image: user.image,
    })),
  };
}

export async function listProjectsForJudge(): Promise<JudgeProjectRowDto[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const projects = await db.project.findMany({
    where: {
      submittedAt: { not: null },
      isVisibleInGallery: true,
    },
    select: {
      id: true,
      title: true,
      submittedAt: true,
      team: { select: { name: true } },
      evaluations: {
        where: { judgeId: currentUser.id },
        select: evaluationScoreSelect,
        take: 1,
      },
    },
    orderBy: [{ submittedAt: 'asc' }, { title: 'asc' }],
  });

  return projects.map((project) => ({
    projectId: project.id,
    title: project.title,
    teamName: project.team.name,
    submittedAt: project.submittedAt!.toISOString(),
    myWeightedScore: project.evaluations[0]
      ? calculateWeightedScore(project.evaluations[0])
      : null,
  }));
}

export async function getProjectForJudge(
  projectId: string
): Promise<JudgeProjectDetailDto | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      submittedAt: { not: null },
      isVisibleInGallery: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      repositoryUrl: true,
      demoUrl: true,
      videoUrl: true,
      submittedAt: true,
      team: { select: { name: true } },
      evaluations: {
        where: { judgeId: currentUser.id },
        select: {
          ...evaluationScoreSelect,
          comment: true,
        },
        take: 1,
      },
    },
  });

  if (!project) return null;

  const myEvaluation = project.evaluations[0] ?? null;

  return {
    projectId: project.id,
    title: project.title,
    teamName: project.team.name,
    submittedAt: project.submittedAt!.toISOString(),
    myWeightedScore: myEvaluation ? calculateWeightedScore(myEvaluation) : null,
    description: project.description,
    repositoryUrl: project.repositoryUrl,
    demoUrl: project.demoUrl,
    videoUrl: project.videoUrl,
    myEvaluation,
  };
}

export async function listProjectsForOrganizer(): Promise<
  OrganizerProjectRowDto[]
> {
  const projects = await db.project.findMany({
    select: organizerProjectSelect,
  });

  return projects.map(toOrganizerProjectRow).sort((left, right) => {
    if (left.averageScore === null) return right.averageScore === null ? 0 : 1;
    if (right.averageScore === null) return -1;

    return (
      right.averageScore - left.averageScore ||
      left.title.localeCompare(right.title)
    );
  });
}

export async function getProjectForOrganizer(
  projectId: string
): Promise<OrganizerProjectDetailDto | null> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: organizerProjectSelect,
  });

  if (!project) return null;

  return {
    ...toOrganizerProjectRow(project),
    description: project.description,
    repositoryUrl: project.repositoryUrl,
    demoUrl: project.demoUrl,
    videoUrl: project.videoUrl,
  };
}

const evaluationScoreSelect = {
  innovationScore: true,
  technologyScore: true,
  impactScore: true,
  presentationScore: true,
} as const;

const organizerProjectSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  repositoryUrl: true,
  demoUrl: true,
  videoUrl: true,
  submittedAt: true,
  isVisibleInGallery: true,
  isFinalist: true,
  isWinner: true,
  winnerTitle: true,
  team: { select: { name: true } },
  evaluations: { select: evaluationScoreSelect },
} as const;

function getPublicStorageUrl(
  bucket: string,
  storagePath: string
): string | null {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return null;

  const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/');
  return `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
}

function getCoverUrl(
  coverImage: { bucket: string; storagePath: string } | undefined
): string | null {
  return coverImage
    ? getPublicStorageUrl(coverImage.bucket, coverImage.storagePath)
    : null;
}

async function getPublicationState(): Promise<{
  finalistsArePublic: boolean;
  resultsArePublic: boolean;
}> {
  const eventState = await db.eventState.findUnique({
    where: { id: 1 },
    select: {
      finalistsPublishedAt: true,
      resultsPublishedAt: true,
    },
  });

  return {
    finalistsArePublic: Boolean(
      eventState?.finalistsPublishedAt || eventState?.resultsPublishedAt
    ),
    resultsArePublic: Boolean(eventState?.resultsPublishedAt),
  };
}

function getPublicBadge(
  project: { isFinalist: boolean; isWinner: boolean },
  publicationState: {
    finalistsArePublic: boolean;
    resultsArePublic: boolean;
  }
): GalleryProjectCardDto['badge'] {
  if (publicationState.resultsArePublic && project.isWinner) return 'WINNER';
  if (publicationState.finalistsArePublic && project.isFinalist)
    return 'FINALIST';
  return null;
}

function calculateWeightedScore(evaluation: EvaluationScores): number {
  const weightedScore = criteria.reduce(
    (total, criterion) =>
      total + evaluation[criterion.field] * criterion.weight,
    0
  );

  return roundScore(weightedScore / 100);
}

function calculateAverageScore(evaluations: EvaluationScores[]): number | null {
  if (evaluations.length === 0) return null;

  const total = evaluations.reduce(
    (sum, evaluation) => sum + calculateWeightedScore(evaluation),
    0
  );
  return roundScore(total / evaluations.length);
}

function roundScore(score: number): number {
  return Math.round(score * 100) / 100;
}

function toOrganizerProjectRow(
  project: OrganizerProjectData
): OrganizerProjectRowDto {
  return {
    projectId: project.id,
    slug: project.slug,
    title: project.title,
    teamName: project.team.name,
    submittedAt: project.submittedAt?.toISOString() ?? null,
    evaluationCount: project.evaluations.length,
    averageScore: calculateAverageScore(project.evaluations),
    isVisibleInGallery: project.isVisibleInGallery,
    isFinalist: project.isFinalist,
    isWinner: project.isWinner,
    winnerTitle: project.winnerTitle,
  };
}
