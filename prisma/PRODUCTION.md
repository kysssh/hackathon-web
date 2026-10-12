# Base de datos: semana 4

Esta rama parte de `develop`. Las semanas 2 y 3 ya estaban integradas.

## Revisión real del 11 de octubre de 2026

- `hackathon-dev`: las tres migraciones fueron aplicadas; `migrate status`
  confirmó que el esquema está actualizado. El índice de portadas se aplicó
  correctamente con `migrate deploy`.
- `hackathon-prod`: conexión directa accesible, ocho tablas existentes, sin
  historial de las migraciones de esta rama. Las siete tablas de datos están
  vacías. `event_state` tiene una fila y ninguna fecha de publicación activa.
  El verificador no encontró marcadores conocidos de fixtures.
- El esquema de producción fue creado de otra forma: usa UUID, enums
  `user_role`/`project_file_kind`, otros nombres de claves e índices y no tiene
  `project_files.created_at`. También difiere en nulabilidad, precisión de
  fechas y tipos de puntuación. `prisma migrate diff` confirmó las diferencias.

**No ejecutar `migrate deploy` en el estado actual de producción:** la migración
inicial intentaría crear tablas que ya existen. Tampoco marcar la migración
inicial como aplicada: el esquema no es equivalente. Antes de seguir se debe
acordar con el equipo si se alinea producción al esquema Prisma de `develop`
o se adapta Prisma al esquema SQL existente. No se aplicaron cambios en producción.

## Migración y revisión con DP

En el entorno de producción configura `DATABASE_URL` con la conexión de
`hackathon-prod` y `DATABASE_ENV=production`. No configures `SEED_DATABASE`.
Mantén las credenciales en variables del entorno o en un `.env` ignorado por Git.

Antes de aplicar cambios, revisa una copia de seguridad con DP y el estado actual:

```bash
npx prisma migrate status
```

Las migraciones versionadas crean las ocho tablas, restringen `event_state`
a la fila con ID 1 y añaden un índice para buscar portadas por proyecto y tipo.
Revisa el SQL pendiente antes de aplicar:

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma migrate status
npm run db:verify-production
```

`migrate deploy` no ejecuta la semilla. El verificador solo lee conteos de
marcadores conocidos: IDs `seed-*`, correos `@prueba.test`, códigos y slugs
de los fixtures. Sale con error si encuentra alguno; no elimina registros.
Los conteos cero no descartan datos ficticios creados con otros nombres.

La semilla exige `SEED_DATABASE=development`, rechaza `DATABASE_ENV=production`
y `NODE_ENV=production`, y bloquea el proyecto Supabase de producción conocido
tanto en su conexión directa como en el usuario del pooler.

## Consultas e integración

`listGalleryProjects` ejecuta una lectura de `event_state` y una consulta
parametrizada que une proyectos, equipos y la primera portada: dos consultas,
independientemente del número de tarjetas. La búsqueda trata el texto como
contenido literal y no como patrones SQL. Las insignias siguen dependiendo
de las fechas de publicación y se excluyen borradores y proyectos ocultos.

Las consultas de equipo y proyecto reutilizan la identidad de sesión con
`React.cache`, limitada al render actual. Consultan directamente por `teamId`
para evitar volver a cargar la membresía. No se cachean datos entre usuarios
ni se cambia el contrato de los DTO. `getMyProject` utiliza las reglas de BK
para campos faltantes y ventana de envío.

Para la revisión final compartida con DP, carga galería, panel y proyecto;
comprueba permisos, estados de publicación, plazos y errores de conexión.
Las firmas públicas permanecen iguales, de modo que FE no necesita cambiar
sus imports. La prueba real requiere una sesión OAuth y una base accesible.

## Estado de entrega

La migración de producción, la ausencia de fixtures y el conteo de consultas
en ejecución deben verificarse contra la base real antes de marcar la semana
4 como terminada. No basta con la validación de tipos o del esquema local.

## Hallazgo para DP: dependencias

La instalación desde el lockfile de `develop` del 11 de octubre de 2026
reportó 12 vulnerabilidades (11 altas y una crítica); `npm audit --omit=dev`
reportó siete (seis altas y una crítica). Next.js 16.3.5 tiene avisos de seguridad,
incluido uno crítico en `next/og ImageResponse`. No se encontró uso de esa API
en `src`, pero eso no descarta los otros avisos de Next.js.
DP debe revisar la actualización y repetir el audit antes de publicar.
La sugerencia de `npm audit` de bajar Prisma a 6.x requiere una migración
incompatible con la configuración actual de Prisma 7; no aplicar `--force`.
