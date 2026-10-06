# Diccionario de datos

Este documento describe el esquema PostgreSQL definido en `prisma/schema.prisma`.
Los nombres físicos de tablas y columnas se escriben en `snake_case`; Prisma los
expone en TypeScript con `camelCase`.

## Convenciones

- **PK**: clave primaria.
- **FK**: clave foránea.
- `TEXT`, `INTEGER`, `BOOLEAN` y `TIMESTAMP(3)` son tipos de PostgreSQL.
- Las fechas se almacenan como `TIMESTAMP(3)` y las consultas las entregan como
  texto ISO en los DTO.
- Las eliminaciones en cascada se indican explícitamente; las demás relaciones
  conservan el comportamiento restrictivo de PostgreSQL.

## Enumeraciones

### `Role`

| Valor         | Uso                                 |
| ------------- | ----------------------------------- |
| `PARTICIPANT` | Usuario que participa en un equipo. |
| `JUDGE`       | Usuario que evalúa proyectos.       |
| `ORGANIZER`   | Usuario que administra el evento.   |

### `ProjectFileKind`

| Valor         | Uso                                               |
| ------------- | ------------------------------------------------- |
| `PITCH_DECK`  | Presentación obligatoria para enviar el proyecto. |
| `EXTRA`       | Archivo adicional del proyecto.                   |
| `COVER_IMAGE` | Imagen pública de portada.                        |

## Tablas

### `users`

Usuarios autenticables y sus roles dentro del hackathon.

| Columna      | Tipo           | Nulo | Clave / valor por defecto | Descripción                 |
| ------------ | -------------- | ---- | ------------------------- | --------------------------- |
| `id`         | `TEXT`         | No   | PK; `cuid()`              | Identificador del usuario.  |
| `name`       | `TEXT`         | Sí   | —                         | Nombre mostrado.            |
| `email`      | `TEXT`         | No   | Único                     | Correo del usuario.         |
| `image`      | `TEXT`         | Sí   | —                         | URL de la imagen de perfil. |
| `role`       | `Role`         | No   | `PARTICIPANT`             | Rol de autorización.        |
| `created_at` | `TIMESTAMP(3)` | No   | `CURRENT_TIMESTAMP`       | Momento de creación.        |

Relaciones: un usuario puede tener varias `accounts`, liderar varios `teams`,
pertenecer a un único `team_members` y registrar varias `evaluations` como jurado.

### `accounts`

Cuentas de proveedores de Auth.js vinculadas a un usuario.

| Columna               | Tipo      | Nulo | Clave / valor por defecto           | Descripción                             |
| --------------------- | --------- | ---- | ----------------------------------- | --------------------------------------- |
| `id`                  | `TEXT`    | No   | PK; `cuid()`                        | Identificador de la cuenta.             |
| `user_id`             | `TEXT`    | No   | FK → `users.id`; cascade            | Usuario propietario.                    |
| `type`                | `TEXT`    | No   | —                                   | Tipo de cuenta del proveedor.           |
| `provider`            | `TEXT`    | No   | Único junto a `provider_account_id` | Proveedor, por ejemplo Google o GitHub. |
| `provider_account_id` | `TEXT`    | No   | Único junto a `provider`            | ID del usuario en el proveedor.         |
| `refresh_token`       | `TEXT`    | Sí   | —                                   | Token de actualización.                 |
| `access_token`        | `TEXT`    | Sí   | —                                   | Token de acceso.                        |
| `expires_at`          | `INTEGER` | Sí   | —                                   | Expiración del token en segundos.       |
| `token_type`          | `TEXT`    | Sí   | —                                   | Tipo de token.                          |
| `scope`               | `TEXT`    | Sí   | —                                   | Alcances concedidos.                    |
| `id_token`            | `TEXT`    | Sí   | —                                   | Token de identidad.                     |
| `session_state`       | `TEXT`    | Sí   | —                                   | Estado de sesión del proveedor.         |

### `teams`

Equipo de participantes.

| Columna      | Tipo           | Nulo | Clave / valor por defecto | Descripción                                  |
| ------------ | -------------- | ---- | ------------------------- | -------------------------------------------- |
| `id`         | `TEXT`         | No   | PK; `cuid()`              | Identificador del equipo.                    |
| `name`       | `TEXT`         | No   | Único                     | Nombre del equipo.                           |
| `join_code`  | `TEXT`         | No   | Único                     | Código para unirse, con formato `HACK-XXXX`. |
| `leader_id`  | `TEXT`         | No   | FK → `users.id`           | Usuario líder del equipo.                    |
| `created_at` | `TIMESTAMP(3)` | No   | `CURRENT_TIMESTAMP`       | Momento de creación.                         |

Un equipo tiene varios miembros y, como máximo, un proyecto. Borrar al líder está
restringido mientras el equipo exista.

### `team_members`

Relación entre usuarios y equipos.

| Columna     | Tipo           | Nulo | Clave / valor por defecto                     | Descripción                                            |
| ----------- | -------------- | ---- | --------------------------------------------- | ------------------------------------------------------ |
| `team_id`   | `TEXT`         | No   | PK compuesta; FK → `teams.id`; cascade        | Equipo del integrante.                                 |
| `user_id`   | `TEXT`         | No   | PK compuesta, único; FK → `users.id`; cascade | Integrante; la unicidad limita al usuario a un equipo. |
| `joined_at` | `TIMESTAMP(3)` | No   | `CURRENT_TIMESTAMP`                           | Momento en que se unió.                                |

### `projects`

Proyecto único de cada equipo.

| Columna                 | Tipo           | Nulo | Clave / valor por defecto       | Descripción                           |
| ----------------------- | -------------- | ---- | ------------------------------- | ------------------------------------- |
| `id`                    | `TEXT`         | No   | PK; `cuid()`                    | Identificador del proyecto.           |
| `team_id`               | `TEXT`         | No   | Único; FK → `teams.id`; cascade | Equipo propietario.                   |
| `slug`                  | `TEXT`         | No   | Único                           | Identificador para URLs públicas.     |
| `title`                 | `TEXT`         | No   | —                               | Título del proyecto.                  |
| `summary`               | `TEXT`         | No   | —                               | Resumen breve.                        |
| `description`           | `TEXT`         | No   | —                               | Descripción completa.                 |
| `repository_url`        | `TEXT`         | Sí   | —                               | Enlace al repositorio.                |
| `demo_url`              | `TEXT`         | Sí   | —                               | Enlace a la demostración.             |
| `video_url`             | `TEXT`         | Sí   | —                               | Enlace al video.                      |
| `submitted_at`          | `TIMESTAMP(3)` | Sí   | —                               | Fecha de envío; nulo indica borrador. |
| `submission_count`      | `INTEGER`      | No   | `0`                             | Cantidad de envíos realizados.        |
| `is_visible_in_gallery` | `BOOLEAN`      | No   | `false`                         | Visible en la galería pública.        |
| `is_finalist`           | `BOOLEAN`      | No   | `false`                         | Marcado como finalista.               |
| `is_winner`             | `BOOLEAN`      | No   | `false`                         | Marcado como ganador.                 |
| `winner_title`          | `TEXT`         | Sí   | —                               | Título o categoría del premio.        |

Un proyecto tiene varios `project_files` y varias `evaluations`; se eliminan en
cascada al eliminar el proyecto.

### `project_files`

Metadatos de archivos almacenados en Supabase Storage. El contenido del archivo no
se guarda en PostgreSQL.

| Columna         | Tipo              | Nulo | Clave / valor por defecto   | Descripción                                           |
| --------------- | ----------------- | ---- | --------------------------- | ----------------------------------------------------- |
| `id`            | `TEXT`            | No   | PK; `cuid()`                | Identificador del archivo.                            |
| `project_id`    | `TEXT`            | No   | FK → `projects.id`; cascade | Proyecto propietario.                                 |
| `kind`          | `ProjectFileKind` | No   | —                           | Clase de archivo.                                     |
| `bucket`        | `TEXT`            | No   | —                           | Bucket de Supabase Storage.                           |
| `storage_path`  | `TEXT`            | No   | —                           | Ruta del objeto dentro del bucket.                    |
| `original_name` | `TEXT`            | No   | —                           | Nombre original proporcionado por la persona usuaria. |
| `content_type`  | `TEXT`            | No   | —                           | MIME type del archivo.                                |
| `size_bytes`    | `INTEGER`         | No   | —                           | Tamaño en bytes.                                      |
| `created_at`    | `TIMESTAMP(3)`    | No   | `CURRENT_TIMESTAMP`         | Momento de registro.                                  |

### `evaluations`

Evaluación de un jurado sobre un proyecto. Cada jurado puede evaluar cada proyecto
una sola vez.

| Columna              | Tipo      | Nulo | Clave / valor por defecto                             | Descripción                     |
| -------------------- | --------- | ---- | ----------------------------------------------------- | ------------------------------- |
| `id`                 | `TEXT`    | No   | PK; `cuid()`                                          | Identificador de la evaluación. |
| `project_id`         | `TEXT`    | No   | Único junto a `judge_id`; FK → `projects.id`; cascade | Proyecto evaluado.              |
| `judge_id`           | `TEXT`    | No   | Único junto a `project_id`; FK → `users.id`; cascade  | Jurado que evalúa.              |
| `innovation_score`   | `INTEGER` | No   | —                                                     | Puntaje de innovación.          |
| `technology_score`   | `INTEGER` | No   | —                                                     | Puntaje de tecnología.          |
| `impact_score`       | `INTEGER` | No   | —                                                     | Puntaje de impacto.             |
| `presentation_score` | `INTEGER` | No   | —                                                     | Puntaje de presentación.        |
| `comment`            | `TEXT`    | Sí   | —                                                     | Comentario del jurado.          |

### `event_state`

Estado global de publicación del evento.

| Columna                  | Tipo           | Nulo | Clave / valor por defecto | Descripción                                                                   |
| ------------------------ | -------------- | ---- | ------------------------- | ----------------------------------------------------------------------------- |
| `id`                     | `INTEGER`      | No   | PK; siempre `1`           | Identificador de la única fila; una restricción `CHECK` impide otros valores. |
| `finalists_published_at` | `TIMESTAMP(3)` | Sí   | —                         | Momento en que se publicaron finalistas.                                      |
| `results_published_at`   | `TIMESTAMP(3)` | Sí   | —                         | Momento en que se publicaron resultados.                                      |

## Datos de prueba

`npm run db:seed` ejecuta `prisma/seed.ts`. Requiere `DATABASE_URL` y puede
ejecutarse repetidas veces en una base de desarrollo: actualiza los usuarios y
equipos de prueba, recrea sus membresías y garantiza la fila de `event_state`.

La semilla crea los roles y escenarios acordados: un organizador, dos jurados, un
participante sin equipo, **Byte Force** (`HACK-29XJ`, 5 integrantes), **Eco Ruta**
(`HACK-7KQM`, 3 integrantes) y **Solo Dev** (`HACK-9PRD`, 1 integrante).

También crea tres proyectos para verificar las consultas: Byte Force está enviado y
visible; Eco Ruta está enviado pero oculto; Solo Dev permanece como borrador aunque
esté marcado como visible. Las evaluaciones de los dos primeros permiten comprobar
el puntaje ponderado, el promedio y el orden del panel de organización.
