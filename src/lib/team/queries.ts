import 'server-only';

import { eventConfig } from '@/config/event';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import type { OrganizerTeamRowDto, TeamDto } from '@/lib/queries/dtos';

export async function getMyTeam(): Promise<TeamDto | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const membership = await db.teamMember.findUnique({
    where: { userId: currentUser.id },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { joinedAt: 'asc' },
          },
        },
      },
    },
  });

  if (!membership) return null;

  return toTeamDto(membership.team);
}

export async function listTeamsForOrganizer(): Promise<OrganizerTeamRowDto[]> {
  const teams = await db.team.findMany({
    include: {
      leader: { select: { email: true } },
      project: { select: { title: true, submittedAt: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return teams.map((team) => ({
    teamId: team.id,
    name: team.name,
    joinCode: team.joinCode,
    memberCount: team._count.members,
    leaderEmail: team.leader.email,
    projectTitle: team.project?.title ?? null,
    submittedAt: team.project?.submittedAt?.toISOString() ?? null,
  }));
}

function toTeamDto(team: {
  id: string;
  name: string;
  joinCode: string;
  leaderId: string;
  members: {
    userId: string;
    user: { name: string | null; image: string | null };
  }[];
}): TeamDto {
  const memberCount = team.members.length;

  return {
    id: team.id,
    name: team.name,
    joinCode: team.joinCode,
    members: team.members.map((member) => ({
      userId: member.userId,
      name: member.user.name,
      image: member.user.image,
      isLeader: member.userId === team.leaderId,
    })),
    memberCount,
    isFull: memberCount >= eventConfig.team.maxMembers,
    hasMinimumMembers: memberCount >= eventConfig.team.minMembers,
  };
}
