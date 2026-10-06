# Base de datos de desarrollo y semilla

Guía para BD y backend de la Plataforma Web del Hackathon, semanas 2 y 3.

## Entorno indicado por el plan

La semilla se carga en **PostgreSQL de Supabase, proyecto `hackathon-dev`**.
La “base mockeada” significa una base real con datos ficticios: las consultas
usan Prisma y PostgreSQL, no un mock en memoria. `hackathon-prod` debe conservarse
sin datos de prueba.

PostgreSQL local es una alternativa para trabajar aislado; no reemplaza la
verificación compartida en `hackathon-dev` prevista por el plan. La semilla no
crea proyectos Supabase ni levanta un servidor PostgreSQL.

## 1. Instalar y configurar

Usa Node.js 24 LTS y npm. Ejecuta todos los comandos desde la raíz del repositorio,
no desde la carpeta `prisma`.

```bash
npm ci
```

Copia `.env.example` a `.env` (PowerShell):

```powershell
Copy-Item .env.example .env
```

Completa `DATABASE_URL` con la conexión real de **hackathon-dev** entregada por BD.
La configuración actual usa una conexión directa de Supabase, puerto 5432.

```dotenv
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
```

Reemplaza los marcadores; codifica los caracteres especiales de la contraseña en
la URL. No subas `.env` a Git ni compartas la cadena de conexión en commits.

Prisma y la semilla cargan `.env` mediante `dotenv/config`. Un `.env.local` por sí
solo no configura estos comandos. `DATABASE_URL` es obligatoria para migrar y
sembrar; `SUPABASE_URL` permite construir las URLs de portadas. Sin esta última,
las consultas devuelven `coverUrl: null`.

Para la alternativa local, inicia tu instancia PostgreSQL y crea una base dedicada
a pruebas; luego configura, por ejemplo:

```dotenv
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/hackathon_dev"
```

## 2. Aplicar migraciones y cargar el seed

Para aplicar las migraciones ya versionadas sin generar migraciones nuevas:

```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
npx prisma migrate status
```

`prisma generate` crea `src/generated/prisma`, que no está versionado. Ejecútalo
después de clonar o cambiar el esquema. `npm run db:seed` usa la configuración de
`prisma.config.ts` para ejecutar `tsx prisma/seed.ts`.

El orden importa: primero tablas, después cliente generado y luego seed. La carga
correcta termina con `Datos de prueba creados.`. Puedes inspeccionar las tablas en
Supabase o con:

```bash
npx prisma studio
```

Para desarrollar nuevas migraciones, BD usa `npx prisma migrate dev` en su entorno
de desarrollo. No es necesario crear otra migración para cargar la semilla.

## 3. Datos que backend puede usar

En una base vacía, la semilla crea **13 usuarios, 3 equipos, 9 membresías,
3 proyectos, 3 evaluaciones y 1 fila de `event_state`**. No crea cuentas OAuth.

| Correo                        | ID en `users`      | Rol / escenario                  |
| ----------------------------- | ------------------ | -------------------------------- |
| `organizador@prueba.test`     | `seed-organizer`   | ORGANIZER                        |
| `jurado1@prueba.test`         | `seed-judge-1`     | JUDGE                            |
| `jurado2@prueba.test`         | `seed-judge-2`     | JUDGE                            |
| `sin.equipo@prueba.test`      | `seed-no-team`     | PARTICIPANT, sin equipo          |
| `lider.byteforce@prueba.test` | `seed-byte-leader` | PARTICIPANT, líder de Byte Force |
| `lider.ecoruta@prueba.test`   | `seed-eco-leader`  | PARTICIPANT, líder de Eco Ruta   |
| `lider.solodev@prueba.test`   | `seed-solo-leader` | PARTICIPANT, líder de Solo Dev   |

Los miembros adicionales usan `byteforce2@prueba.test` hasta
`byteforce5@prueba.test` (IDs `seed-byte-2` a `seed-byte-5`), y
`ecoruta2@prueba.test` y `ecoruta3@prueba.test` (IDs `seed-eco-2` y `seed-eco-3`).

| Equipo     | ID                     | Código      | Integrantes | Condición                      |
| ---------- | ---------------------- | ----------- | ----------- | ------------------------------ |
| Byte Force | `seed-team-byte-force` | `HACK-29XJ` | 5           | Lleno                          |
| Eco Ruta   | `seed-team-eco-ruta`   | `HACK-7KQM` | 3           | Cumple mínimo; admite miembros |
| Solo Dev   | `seed-team-solo-dev`   | `HACK-9PRD` | 1           | Debajo del mínimo              |

| Proyecto / slug                         | ID                        | Estado                   | Evaluaciones | Promedio ponderado |
| --------------------------------------- | ------------------------- | ------------------------ | ------------ | ------------------ |
| Byte Force Access / `byte-force-access` | `seed-project-byte-force` | Enviado y visible        | 2            | 8.65               |
| Eco Ruta / `eco-ruta`                   | `seed-project-eco-ruta`   | Enviado y oculto         | 1            | 8.00               |
| Solo Dev Lab / `solo-dev-lab`           | `seed-project-solo-dev`   | Borrador marcado visible | 0            | `null`             |

La galería y el jurado muestran únicamente Byte Force. Organización muestra
Byte Force, Eco Ruta y Solo Dev, ordenados por promedio, con el no evaluado al final.
Para Byte Force, jurado 1 tiene 8.75 y jurado 2 tiene 8.55. Los pesos salen de
`src/config/criteria.ts`: innovación 25 %, tecnología 30 %, impacto 25 % y
presentación 20 %.

Las fechas de envío son fixtures fijos de noviembre de 2026. No alteran el reloj ni
abren la ventana de envío; las acciones deben consultar `src/config/event.ts`.

No se crean `project_files` ni objetos en Storage: no hay pitch decks ni portadas.
Los enlaces de repositorio, demo y video son ficticios y no garantizan contenido
accesible. Para probar subida y descarga, BK debe configurar `entregables`
(privado) y `portadas` (público) y subir archivos mediante su flujo real.

La semilla no publica finalistas ni resultados. En una base vacía las fechas de
publicación quedan en `null`, y los filtros FINALISTS/WINNERS devuelven listas vacías.

## 4. Levantar la aplicación e integrar las lecturas

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Las páginas consumen las
funciones de `src/lib/*/queries.ts`; no deben importar Prisma directamente.

Las consultas personales usan el ID devuelto por `getCurrentUser()` para buscar
`team_members.user_id`; las del jurado filtran `evaluations.judge_id` por ese ID.
Backend debe hacer coincidir la identidad de sesión con `users.id`.

En esta rama, Auth.js usa JWT sin un adaptador Prisma configurado y
`getCurrentUser()` todavía devuelve `teamId: null` e `isTeamLeader: false`.
Los usuarios sembrados no habilitan un ingreso de prueba, no tienen contraseña y
no incluyen cuentas Google/GitHub. Los correos `@prueba.test` son fixtures, no
credenciales OAuth utilizables. Para completar las pruebas desde las pantallas
privadas, BK debe integrar la persistencia de identidad y la membresía real.

## 5. Repetir la carga

Comprueba la repetición en la misma base dedicada a pruebas:

```bash
npm run db:seed
npm run db:seed
```

Los `upsert` actualizan los registros de prueba. La semilla borra y recrea las
membresías de sus equipos, y restaura los valores definidos de sus proyectos y
evaluaciones. Las fechas de unión pueden cambiar. La fila `event_state` existente
conserva su estado de publicación. Esto no vacía toda la base ni borra archivos.

La primera carga debe hacerse en una base vacía o preparada con los IDs de esta
semilla. Si ya hay correos o nombres de equipos iguales con otros IDs, los `upsert`
conservan esos IDs y las referencias fijas pueden fallar. Ejecuta la semilla antes
de generar escenarios adicionales con las acciones de backend. Coordina una
recarga de `hackathon-dev` con el equipo, porque restaura sus fixtures compartidos.

## Problemas frecuentes

- **Falta `DATABASE_URL`**: completa `.env` en la raíz con la conexión de desarrollo.
- **No conecta a PostgreSQL**: comprueba acceso al host, puerto y credenciales de
  la conexión entregada para `hackathon-dev`.
- **Falta el cliente generado**: ejecuta `npx prisma generate`.
- **Faltan tablas**: ejecuta `npx prisma migrate deploy` antes del seed.
- **Error de clave foránea en la semilla**: revisa si existen fixtures con los
  mismos correos o nombres y otros IDs; no borres registros compartidos sin coordinar.
- **El seed carga, pero mi equipo no aparece al ingresar**: revisa que el ID de
  sesión corresponda a `users.id` y que exista su fila en `team_members`.

Para comprobar tipos y estilo:

```bash
npx next typegen
npm run typecheck
npm run lint
```

Consulta el [diccionario de datos](../docs/data-dictionary.md) para ver columnas,
claves y relaciones, y [seed.ts](seed.ts) para los valores exactos de los fixtures.
