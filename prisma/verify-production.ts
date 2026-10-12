import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString || process.env.DATABASE_ENV !== 'production') {
  throw new Error(
    'Configura DATABASE_URL y DATABASE_ENV=production para verificar producción.'
  );
}

const target = new URL(connectionString);
const productionProject = 'mktizbbkdhcjpfndaxwv';
if (
  target.hostname !== `db.${productionProject}.supabase.co` &&
  decodeURIComponent(target.username) !== `postgres.${productionProject}`
) {
  throw new Error(
    'La conexión no corresponde al proyecto hackathon-prod esperado.'
  );
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  // Solo cuenta marcadores de fixtures; nunca muestra correos ni datos personales.
  const [users, teams, projects, evaluations] = await Promise.all([
    db.user.count({
      where: {
        OR: [
          { id: { startsWith: 'seed-' } },
          { email: { endsWith: '@prueba.test', mode: 'insensitive' } },
        ],
      },
    }),
    db.team.count({
      where: {
        OR: [
          { id: { startsWith: 'seed-' } },
          { joinCode: { in: ['HACK-29XJ', 'HACK-7KQM', 'HACK-9PRD'] } },
        ],
      },
    }),
    db.project.count({
      where: {
        OR: [
          { id: { startsWith: 'seed-' } },
          { slug: { in: ['byte-force-access', 'eco-ruta', 'solo-dev-lab'] } },
        ],
      },
    }),
    db.evaluation.count({ where: { id: { startsWith: 'seed-' } } }),
  ]);

  console.info(JSON.stringify({ users, teams, projects, evaluations }));
  if (users + teams + projects + evaluations > 0) {
    throw new Error(
      'Hay marcadores de datos de prueba en producción. Revisar con DP antes de eliminar nada.'
    );
  }
  console.info(
    'No se encontraron marcadores conocidos de la semilla en producción.'
  );
}

main()
  .catch(() => {
    console.error(
      'Verificación fallida: revisa la conexión y los conteos de datos de prueba.'
    );
    process.exitCode = 1;
  })
  .finally(async () => db.$disconnect());
