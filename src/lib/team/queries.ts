import 'server-only';

import { eventConfig } from '@/config/event';
import { getCurrentUser } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { displayName } from '@/lib/profile/rules';
import type {
  OrganizerParticipantStatsDto,
  OrganizerTeamRowDto,
  TeamDto,
} from '@/lib/queries/dtos';

const memberUserSelect = {
  id: true,
  name: true,
  firstName: true,
  lastName: true,
  university: true,
  image: true,
} as const;

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
              user: { select: memberUserSelect },
            },
            orderBy: { joinedAt: 'asc' },
          },
        },
      },
    },
  });

  if (!membership) return null;

  return toTeamDto(membership.team, currentUser.id);
}

export async function listTeamsForOrganizer(): Promise<OrganizerTeamRowDto[]> {
  const teams = await db.team.findMany({
    select: {
      id: true,
      name: true,
      leaderId: true,
      leader: { select: { email: true } },
      project: { select: { title: true, submittedAt: true } },
      members: {
        include: { user: { select: { ...memberUserSelect, email: true } } },
        orderBy: { joinedAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return teams.map((team) => ({
    teamId: team.id,
    name: team.name,
    memberCount: team.members.length,
    leaderEmail: team.leader.email,
    members: team.members.map((member) => ({
      userId: member.userId,
      fullName: displayName(member.user),
      university: member.user.university,
      email: member.user.email,
      isLeader: member.userId === team.leaderId,
    })),
    projectTitle: team.project?.title ?? null,
    submittedAt: team.project?.submittedAt?.toISOString() ?? null,
  }));
}

/** Conteos para la organización: equipos creados y personas inscritas en equipos. */
export async function getParticipantStatsForOrganizer(): Promise<OrganizerParticipantStatsDto> {
  const { minMembers, maxMembers } = eventConfig.team;
  const [teamCount, participantsInTeams, registeredParticipants, incompleteProfiles, teamSizes] =
    await Promise.all([
      db.team.count(),
      db.teamMember.count(),
      db.user.count({ where: { role: 'PARTICIPANT' } }),
      db.user.count({
        where: {
          role: 'PARTICIPANT',
          OR: [{ firstName: null }, { lastName: null }, { university: null }],
        },
      }),
      db.teamMember.groupBy({ by: ['teamId'], _count: { _all: true } }),
    ]);

  return {
    teamCount,
    participantsInTeams,
    registeredParticipants,
    participantsWithoutTeam: Math.max(0, registeredParticipants - participantsInTeams),
    incompleteProfiles,
    teamsWithMinimum: teamSizes.filter((t) => t._count._all >= minMembers).length,
    fullTeams: teamSizes.filter((t) => t._count._all >= maxMembers).length,
  };
}

function toTeamDto(team: {
  id: string;
  name: string;
  joinCode: string;
  leaderId: string;
  members: {
    userId: string;
    user: {
      name: string | null;
      firstName: string | null;
      lastName: string | null;
      university: string | null;
      image: string | null;
    };
  }[];
}, currentUserId: string): TeamDto {
  const memberCount = team.members.length;

  return {
    id: team.id,
    name: team.name,
    joinCode: team.leaderId === currentUserId ? team.joinCode : null,
    members: team.members.map((member) => ({
      userId: member.userId,
      name: member.user.name,
      fullName: displayName(member.user),
      university: member.user.university,
      image: member.user.image,
      isLeader: member.userId === team.leaderId,
    })),
    memberCount,
    isFull: memberCount >= eventConfig.team.maxMembers,
    hasMinimumMembers: memberCount >= eventConfig.team.minMembers,
  };
}
