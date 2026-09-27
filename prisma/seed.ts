import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL es obligatoria para ejecutar la semilla.');
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const users = [
  {
    id: 'seed-organizer',
    name: 'Organizador de prueba',
    email: 'organizador@prueba.test',
    role: Role.ORGANIZER,
  },
  {
    id: 'seed-judge-1',
    name: 'Jurado Uno',
    email: 'jurado1@prueba.test',
    role: Role.JUDGE,
  },
  {
    id: 'seed-judge-2',
    name: 'Jurado Dos',
    email: 'jurado2@prueba.test',
    role: Role.JUDGE,
  },
  {
    id: 'seed-no-team',
    name: 'Sin Equipo',
    email: 'sin.equipo@prueba.test',
    role: Role.PARTICIPANT,
  },
  {
    id: 'seed-byte-leader',
    name: 'Líder Byte Force',
    email: 'lider.byteforce@prueba.test',
    role: Role.PARTICIPANT,
  },
  {
    id: 'seed-byte-2',
    name: 'Byte Force 2',
    email: 'byteforce2@prueba.test',
    role: Role.PARTICIPANT,
  },
  {
    id: 'seed-byte-3',
    name: 'Byte Force 3',
    email: 'byteforce3@prueba.test',
    role: Role.PARTICIPANT,
  },
  {
    id: 'seed-byte-4',
    name: 'Byte Force 4',
    email: 'byteforce4@prueba.test',
    role: Role.PARTICIPANT,
  },
  {
    id: 'seed-byte-5',
    name: 'Byte Force 5',
    email: 'byteforce5@prueba.test',
    role: Role.PARTICIPANT,
  },
  {
    id: 'seed-eco-leader',
    name: 'Líder Eco Ruta',
    email: 'lider.ecoruta@prueba.test',
    role: Role.PARTICIPANT,
  },
  {
    id: 'seed-eco-2',
    name: 'Eco Ruta 2',
    email: 'ecoruta2@prueba.test',
    role: Role.PARTICIPANT,
  },
  {
    id: 'seed-eco-3',
    name: 'Eco Ruta 3',
    email: 'ecoruta3@prueba.test',
    role: Role.PARTICIPANT,
  },
  {
    id: 'seed-solo-leader',
    name: 'Líder Solo Dev',
    email: 'lider.solodev@prueba.test',
    role: Role.PARTICIPANT,
  },
] as const;

const teams = [
  {
    id: 'seed-team-byte-force',
    name: 'Byte Force',
    joinCode: 'HACK-29XJ',
    leaderId: 'seed-byte-leader',
    memberIds: [
      'seed-byte-leader',
      'seed-byte-2',
      'seed-byte-3',
      'seed-byte-4',
      'seed-byte-5',
    ],
  },
  {
    id: 'seed-team-eco-ruta',
    name: 'Eco Ruta',
    joinCode: 'HACK-7KQM',
    leaderId: 'seed-eco-leader',
    memberIds: ['seed-eco-leader', 'seed-eco-2', 'seed-eco-3'],
  },
  {
    id: 'seed-team-solo-dev',
    name: 'Solo Dev',
    joinCode: 'HACK-9PRD',
    leaderId: 'seed-solo-leader',
    memberIds: ['seed-solo-leader'],
  },
] as const;

async function main() {
  for (const user of users) {
    await db.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: user,
    });
  }

  for (const team of teams) {
    await db.team.upsert({
      where: { name: team.name },
      update: { joinCode: team.joinCode, leaderId: team.leaderId },
      create: {
        id: team.id,
        name: team.name,
        joinCode: team.joinCode,
        leaderId: team.leaderId,
      },
    });
  }

  await db.teamMember.deleteMany({
    where: { teamId: { in: teams.map((team) => team.id) } },
  });
  await db.teamMember.createMany({
    data: teams.flatMap((team) =>
      team.memberIds.map((userId) => ({ teamId: team.id, userId }))
    ),
  });

  await db.eventState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

main()
  .then(() => console.info('Datos de prueba creados.'))
  .finally(async () => db.$disconnect());
