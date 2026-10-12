import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

function run(script, overrides) {
  const result = spawnSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', script], {
    env: {
      ...process.env,
      DATABASE_URL: 'postgresql://postgres:example@localhost:5432/hackathon_test',
      NODE_ENV: 'test',
      DATABASE_ENV: 'development',
      SEED_DATABASE: '',
      ...overrides,
    },
    encoding: 'utf8',
    timeout: 15000,
  });
  assert.equal(result.error, undefined);
  assert.notEqual(result.status, 0);
  return result.stderr;
}

test('la semilla exige activar explícitamente el entorno de desarrollo', () => {
  assert.match(run('prisma/seed.ts', {}), /La semilla requiere SEED_DATABASE=development/);
});

test('la semilla rechaza el entorno de producción aunque esté activada', () => {
  assert.match(run('prisma/seed.ts', { SEED_DATABASE: 'development', DATABASE_ENV: 'production' }), /La semilla requiere/);
});

for (const url of [
  'postgresql://postgres:example@db.mktizbbkdhcjpfndaxwv.supabase.co:5432/postgres',
  'postgresql://postgres.mktizbbkdhcjpfndaxwv:example@pooler.supabase.com:5432/postgres',
]) {
  test(`la semilla bloquea producción en ${new URL(url).hostname}`, () => {
    assert.match(run('prisma/seed.ts', { SEED_DATABASE: 'development', DATABASE_URL: url }), /No se permite sembrar/);
  });
}

test('el verificador de producción rechaza una conexión local de desarrollo', () => {
  assert.match(run('prisma/verify-production.ts', { DATABASE_ENV: 'production' }), /no corresponde al proyecto hackathon-prod/);
});
