import "server-only";

import type { OrganizerTeamRowDto, TeamDto } from "@/lib/queries/dtos";

const mockTeam: TeamDto = {
  id: "mock-team-byte-force",
  name: "Byte Force",
  joinCode: "HACK-29XJ",
  members: [{ userId: "mock-user-leader", name: "Líder de prueba", image: null, isLeader: true }],
  memberCount: 1,
  isFull: false,
  hasMinimumMembers: false,
};

export async function getMyTeam(): Promise<TeamDto | null> {
  return mockTeam;
}

export async function listTeamsForOrganizer(): Promise<OrganizerTeamRowDto[]> {
  return [{ teamId: mockTeam.id, name: mockTeam.name, joinCode: mockTeam.joinCode, memberCount: mockTeam.memberCount, leaderEmail: "lider@prueba.test", projectTitle: null, submittedAt: null }];
}
