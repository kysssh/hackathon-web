import 'dotenv/config';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import type { CurrentUser } from '../src/lib/auth/session';

const connectionString = process.env.DATABASE_URL;
if (!connectionString || process.env.DATABASE_ENV !== 'development') {
  throw new Error(
    'Esta prueba requiere DATABASE_URL y DATABASE_ENV=development.'
  );
}
const target = new URL(connectionString);
if (
  target.hostname !== 'db.wnkbvhqsyxrsipavingr.supabase.co' &&
  decodeURIComponent(target.username) !== 'postgres.wnkbvhqsyxrsipavingr'
) {
  throw new Error('Esta prueba solo permite el proyecto hackathon-dev.');
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
  log: [{ level: 'query', emit: 'event' }],
});
let queries = 0;
db.$on('query', () => queries++);
const context = globalThis as typeof globalThis & {
  integrationDb?: typeof db;
  integrationUser?: CurrentUser | null;
};
context.integrationDb = db;

async function main() {
  // Ejecuta las funciones originales contra PostgreSQL. Solo se inyectan
  // la identidad de prueba y el cliente instrumentado, sin login OAuth ni HTTP.
  const output = path.resolve('.next/database-integration/readings.cjs');
  await mkdir(path.dirname(output), { recursive: true });
  await build({
    stdin: {
      contents: `export * from './src/lib/project/queries';
        export * from './src/lib/team/queries';
        export * from './src/lib/event/queries';`,
      resolveDir: process.cwd(),
      loader: 'ts',
    },
    outfile: output,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    plugins: [
      {
        name: 'integration-context',
        setup(builder) {
          builder.onResolve({ filter: /^server-only$/ }, () => ({
            path: 'empty',
            namespace: 'integration',
          }));
          builder.onResolve(
            { filter: /^@\/generated\/prisma\/client$/ },
            () => ({
              path: path.resolve('src/generated/prisma/client.ts'),
              external: true,
            })
          );
          builder.onResolve({ filter: /^@\/lib\/db$/ }, () => ({
            path: 'db',
            namespace: 'integration',
          }));
          builder.onResolve({ filter: /^@\/lib\/queries\/session$/ }, () => ({
            path: 'session',
            namespace: 'integration',
          }));
          builder.onLoad(
            { filter: /.*/, namespace: 'integration' },
            (args) => ({
              contents:
                args.path === 'db'
                  ? `export const db = new Proxy({}, { get(_, key) {
                      const client = globalThis.integrationDb;
                      const value = client[key];
                      return typeof value === 'function' ? value.bind(client) : value;
                    } });`
                  : args.path === 'session'
                    ? 'export async function getQueryUser() { return globalThis.integrationUser; }'
                    : '',
              loader: 'js',
            })
          );
        },
      },
    ],
  });
  const readings = createRequire(path.resolve('package.json'))(
    output
  ) as typeof import('../src/lib/project/queries') &
    typeof import('../src/lib/team/queries') &
    typeof import('../src/lib/event/queries');

  async function asUser(email: string) {
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    const membership = await db.teamMember.findUnique({
      where: { userId: user.id },
    });
    context.integrationUser = {
      ...user,
      teamId: membership?.teamId ?? null,
      isTeamLeader: false,
    };
  }

  const counts = {
    users: await db.user.count({
      where: { email: { endsWith: '@prueba.test' } },
    }),
    teams: await db.team.count({
      where: { joinCode: { in: ['HACK-29XJ', 'HACK-7KQM', 'HACK-9PRD'] } },
    }),
  };
  assert.equal(counts.users, 13);
  assert.equal(counts.teams, 3);

  context.integrationUser = null;
  assert.equal(await readings.getMyTeam(), null);
  assert.equal(await readings.getMyProject(), null);
  await asUser('sin.equipo@prueba.test');
  assert.equal(await readings.getMyTeam(), null);
  assert.equal(await readings.getMyProject(), null);

  for (const [email, count, full, minimum] of [
    ['lider.byteforce@prueba.test', 5, true, true],
    ['lider.ecoruta@prueba.test', 3, false, true],
    ['lider.solodev@prueba.test', 1, false, false],
  ] as const) {
    await asUser(email);
    const team = await readings.getMyTeam();
    assert.ok(team);
    assert.equal(team.memberCount, count);
    assert.equal(team.isFull, full);
    assert.equal(team.hasMinimumMembers, minimum);
    assert.equal(team.members.filter((member) => member.isLeader).length, 1);
    const project = await readings.getMyProject();
    assert.ok(project);
    assert.ok(project.missingFields.includes('pitchDeck'));
    assert.ok(!Number.isNaN(Date.parse(project.submissionWindow.serverNow)));
  }

  await asUser('lider.byteforce@prueba.test');
  queries = 0;
  await Promise.all([readings.getMyTeam(), readings.getMyProject()]);
  const panelDataQueries = queries;

  queries = 0;
  const gallery = await readings.listGalleryProjects({});
  const galleryQueries = queries;
  assert.ok(galleryQueries <= 3, `Galería ejecutó ${galleryQueries} consultas`);
  assert.ok(gallery.some((project) => project.slug === 'byte-force-access'));
  assert.ok(
    !gallery.some((project) =>
      ['eco-ruta', 'solo-dev-lab'].includes(project.slug)
    )
  );
  assert.deepEqual(
    await readings.listGalleryProjects({ search: "' OR TRUE --" }),
    []
  );
  assert.ok(
    (await readings.listGalleryProjects({ search: ' BYTE FORCE ' })).some(
      (project) => project.slug === 'byte-force-access'
    )
  );
  assert.equal(await readings.getGalleryProject('eco-ruta'), null);
  assert.equal(await readings.getGalleryProject('solo-dev-lab'), null);
  assert.equal(await readings.getGalleryProject('no-existe'), null);
  const detail = await readings.getGalleryProject('byte-force-access');
  assert.ok(detail);
  assert.ok(!JSON.stringify(detail).includes('@prueba.test'));
  assert.ok(
    detail.members.every(
      (member) => Object.keys(member).sort().join(',') === 'image,name'
    )
  );

  const state = await readings.getEventState();
  if (!state.resultsPublishedAt) {
    assert.ok(
      gallery.every(
        (project) => project.badge !== 'WINNER' && project.winnerTitle === null
      )
    );
    assert.deepEqual(
      await readings.listGalleryProjects({ filter: 'WINNERS' }),
      []
    );
  }

  for (const [email, expected] of [
    ['jurado1@prueba.test', 8.75],
    ['jurado2@prueba.test', 8.55],
  ] as const) {
    await asUser(email);
    const projects = await readings.listProjectsForJudge();
    const byte = projects.find(
      (project) => project.title === 'Byte Force Access'
    );
    assert.ok(byte);
    assert.equal(byte.myWeightedScore, expected);
    const project = await readings.getProjectForJudge(byte.projectId);
    assert.equal(project?.myWeightedScore, expected);
    const hidden = await db.project.findUniqueOrThrow({
      where: { slug: 'eco-ruta' },
    });
    const draft = await db.project.findUniqueOrThrow({
      where: { slug: 'solo-dev-lab' },
    });
    assert.ok(
      !projects.some((project) =>
        [hidden.id, draft.id].includes(project.projectId)
      )
    );
    assert.equal(await readings.getProjectForJudge(hidden.id), null);
    assert.equal(await readings.getProjectForJudge(draft.id), null);
  }

  const projects = await readings.listProjectsForOrganizer();
  let lastScore = Infinity;
  for (const project of projects) {
    const score = project.averageScore ?? -Infinity;
    assert.ok(score <= lastScore);
    lastScore = score;
  }
  const byte = projects.find((project) => project.slug === 'byte-force-access');
  assert.ok(byte);
  assert.equal(byte.averageScore, 8.65);
  assert.equal(byte.evaluationCount, 2);
  assert.equal(
    (await readings.getProjectForOrganizer(byte.projectId))?.averageScore,
    8.65
  );
  const teams = await readings.listTeamsForOrganizer();
  assert.equal(
    teams.find((team) => team.joinCode === 'HACK-29XJ')?.memberCount,
    5
  );

  const rollback = new Error('ROLLBACK_INTEGRATION_FIXTURES');
  try {
    await db.$transaction(
      async (transaction) => {
        context.integrationDb = transaction as unknown as typeof db;
        await transaction.project.update({
          where: { id: byte.projectId },
          data: {
            isFinalist: true,
            isWinner: true,
            winnerTitle: 'Título de prueba temporal',
          },
        });
        await transaction.eventState.upsert({
          where: { id: 1 },
          create: { id: 1 },
          update: { finalistsPublishedAt: null, resultsPublishedAt: null },
        });
        let cards = await readings.listGalleryProjects({});
        assert.equal(
          cards.find((card) => card.slug === byte.slug)?.badge,
          null
        );
        assert.equal(
          cards.find((card) => card.slug === byte.slug)?.winnerTitle,
          null
        );
        assert.deepEqual(
          await readings.listGalleryProjects({ filter: 'FINALISTS' }),
          []
        );
        assert.deepEqual(
          await readings.listGalleryProjects({ filter: 'WINNERS' }),
          []
        );
        await transaction.eventState.update({
          where: { id: 1 },
          data: { finalistsPublishedAt: new Date() },
        });
        cards = await readings.listGalleryProjects({ filter: 'FINALISTS' });
        assert.equal(
          cards.find((card) => card.slug === byte.slug)?.badge,
          'FINALIST'
        );
        assert.equal(
          cards.find((card) => card.slug === byte.slug)?.winnerTitle,
          null
        );
        await transaction.eventState.update({
          where: { id: 1 },
          data: { resultsPublishedAt: new Date() },
        });
        cards = await readings.listGalleryProjects({ filter: 'WINNERS' });
        assert.equal(
          cards.find((card) => card.slug === byte.slug)?.badge,
          'WINNER'
        );
        assert.equal(
          cards.find((card) => card.slug === byte.slug)?.winnerTitle,
          'Título de prueba temporal'
        );
        await transaction.projectFile.create({
          data: {
            projectId: byte.projectId,
            kind: 'COVER_IMAGE',
            bucket: 'portadas',
            storagePath: 'test/imagen con espacios.png',
            originalName: 'imagen.png',
            contentType: 'image/png',
            sizeBytes: 100,
            createdAt: new Date('2000-01-01T00:00:00Z'),
          },
        });
        await transaction.project.update({
          where: { slug: 'eco-ruta' },
          data: { isVisibleInGallery: true },
        });
        queries = 0;
        cards = await readings.listGalleryProjects({});
        assert.equal(queries, 2);
        assert.ok(
          cards
            .find((card) => card.slug === byte.slug)
            ?.coverUrl?.endsWith('/portadas/test/imagen%20con%20espacios.png')
        );
        assert.ok(cards.some((card) => card.slug === 'eco-ruta'));
        throw rollback;
      },
      { timeout: 60000 }
    );
  } catch (error) {
    if (error !== rollback) throw error;
  } finally {
    context.integrationDb = db;
  }
  assert.deepEqual(await readings.getEventState(), state);
  assert.equal(
    (await readings.getGalleryProject('byte-force-access'))?.badge,
    detail.badge
  );

  console.info(
    JSON.stringify({
      status: 'PASS',
      seedFixtures: counts,
      galleryQueries,
      panelDataQueries,
      scope: 'Lecturas reales; identidad inyectada, sin render HTTP/OAuth',
    })
  );
}

main()
  .catch((error) => {
    console.error(
      error instanceof assert.AssertionError
        ? error.message
        : 'Prueba fallida; revisar conexión o compatibilidad SQL.'
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    delete context.integrationDb;
    delete context.integrationUser;
    await db.$disconnect();
  });
