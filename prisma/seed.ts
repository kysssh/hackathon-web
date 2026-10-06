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

const projects = [
  {
    id: 'seed-project-byte-force',
    teamId: 'seed-team-byte-force',
    slug: 'byte-force-access',
    title: 'Byte Force Access',
    summary: 'Accesibilidad digital para servicios públicos esenciales.',
    description:
      'Una plataforma que detecta barreras de accesibilidad y propone mejoras priorizadas para trámites digitales.',
    repositoryUrl: 'https://github.com/prueba/byte-force-access',
    demoUrl: 'https://byte-force.prueba.test',
    videoUrl: 'https://video.prueba.test/byte-force',
    submittedAt: new Date('2026-11-15T18:00:00.000Z'),
    submissionCount: 1,
    isVisibleInGallery: true,
    isFinalist: false,
    isWinner: false,
    winnerTitle: null,
  },
  {
    id: 'seed-project-eco-ruta',
    teamId: 'seed-team-eco-ruta',
    slug: 'eco-ruta',
    title: 'Eco Ruta',
    summary: 'Rutas urbanas que reducen tiempo, costo y emisiones.',
    description:
      'Una herramienta de movilidad que compara trayectos y recomienda la alternativa con menor impacto ambiental.',
    repositoryUrl: 'https://github.com/prueba/eco-ruta',
    demoUrl: 'https://eco-ruta.prueba.test',
    videoUrl: null,
    submittedAt: new Date('2026-11-16T20:30:00.000Z'),
    submissionCount: 1,
    isVisibleInGallery: false,
    isFinalist: false,
    isWinner: false,
    winnerTitle: null,
  },
  {
    id: 'seed-project-solo-dev',
    teamId: 'seed-team-solo-dev',
    slug: 'solo-dev-lab',
    title: 'Solo Dev Lab',
    summary: 'Un borrador para comprobar las reglas de publicación.',
    description:
      'Este proyecto permanece como borrador y no debe aparecer en la galería ni en el panel del jurado.',
    repositoryUrl: null,
    demoUrl: null,
    videoUrl: null,
    submittedAt: null,
    submissionCount: 0,
    isVisibleInGallery: true,
    isFinalist: false,
    isWinner: false,
    winnerTitle: null,
  },
] as const;

const evaluations = [
  {
    id: 'seed-evaluation-byte-judge-1',
    projectId: 'seed-project-byte-force',
    judgeId: 'seed-judge-1',
    innovationScore: 9,
    technologyScore: 9,
    impactScore: 8,
    presentationScore: 9,
    comment: 'Propuesta sólida, accesible y bien demostrada.',
  },
  {
    id: 'seed-evaluation-byte-judge-2',
    projectId: 'seed-project-byte-force',
    judgeId: 'seed-judge-2',
    innovationScore: 8,
    technologyScore: 9,
    impactScore: 9,
    presentationScore: 8,
    comment: 'Buen equilibrio entre impacto y viabilidad técnica.',
  },
  {
    id: 'seed-evaluation-eco-judge-1',
    projectId: 'seed-project-eco-ruta',
    judgeId: 'seed-judge-1',
    innovationScore: 7,
    technologyScore: 8,
    impactScore: 9,
    presentationScore: 8,
    comment: 'El impacto está claro; falta fortalecer la diferenciación.',
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

  for (const project of projects) {
    await db.project.upsert({
      where: { teamId: project.teamId },
      update: {
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        description: project.description,
        repositoryUrl: project.repositoryUrl,
        demoUrl: project.demoUrl,
        videoUrl: project.videoUrl,
        submittedAt: project.submittedAt,
        submissionCount: project.submissionCount,
        isVisibleInGallery: project.isVisibleInGallery,
        isFinalist: project.isFinalist,
        isWinner: project.isWinner,
        winnerTitle: project.winnerTitle,
      },
      create: project,
    });
  }

  for (const evaluation of evaluations) {
    await db.evaluation.upsert({
      where: {
        projectId_judgeId: {
          projectId: evaluation.projectId,
          judgeId: evaluation.judgeId,
        },
      },
      update: {
        innovationScore: evaluation.innovationScore,
        technologyScore: evaluation.technologyScore,
        impactScore: evaluation.impactScore,
        presentationScore: evaluation.presentationScore,
        comment: evaluation.comment,
      },
      create: evaluation,
    });
  }

  await db.eventState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

main()
  .then(() => console.info('Datos de prueba creados.'))
  .finally(async () => db.$disconnect());
