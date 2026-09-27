# Plan de Trabajo por Roles — Plataforma Web del Hackathon

**Versión 3.0** (reemplaza a PLAN-HACK-002) · 5 integrantes · 4 semanas
**Stack:** Next.js (App Router y Server Actions), TypeScript, Tailwind, PostgreSQL en Supabase con Prisma, Supabase Storage, **Auth.js**, Zod, GitHub y Vercel.

> **Cómo usar este documento.** La sección 3 es el **contrato**: ahí están todos los nombres que se van a usar. Nadie inventa nombres nuevos. La sección 6 dice qué debe estar **terminado al final de cada semana** por persona, y debajo de cada tarea hay casillas para que tú mismo revises que está lista y que no choca con el trabajo de los demás.

---

## 1. Equipo y roles

| Rol | Integrante | De qué se encarga |
|---|---|---|
| **BD** · Base de datos | `__________` | Tablas, migraciones, datos de prueba y **todas las funciones que leen datos** |
| **BK** · Backend | `__________` | Ingreso con Auth.js, **todas las acciones que guardan datos**, reglas y archivos |
| **UX** · Diseño y páginas públicas | `__________` | Estilo del sitio, componentes reutilizables y páginas públicas (incluida la galería) |
| **FE** · Frontend | `__________` | Páginas con sesión: ingreso, panel, equipo, proyecto, jurado y organización |
| **DP** · Despliegue y pruebas | `__________` | Proyecto base, utilidades comunes, Vercel, pruebas y salida a producción |

**En una frase:** BD trae los datos, BK los guarda, UX arma las piezas visuales y el sitio público, FE conecta las pantallas privadas con los datos, DP hace que todo funcione junto en internet.

**Pareja de revisión** (te escribe si algo no le calza): BD ↔ BK · UX ↔ FE · DP revisa a todos.

---

## 2. Cómo trabajamos con Git (solo la rama `main`)

**Una sola vez, en tu computadora:**

```bash
git config --global pull.rebase false
```

**Cada vez que trabajas:**

```bash
git pull                              # traer lo que hicieron tus compañeros
git add .                             # preparar tus cambios
git commit -m "Descripción de lo que hiciste"
git pull                              # por si alguien subió algo mientras hacías el commit
git push                              # subir tu código
```

**Reglas simples:**

- Sube tu trabajo **al menos una vez al día**. Mientras más esperes, más difícil el conflicto.
- Empieza siempre con `git pull`. Nunca programes sobre código viejo.
- Si sale un conflicto y no sabes qué hacer, **avisa en el grupo antes de tocar nada**.
- Cada archivo tiene un dueño (sección 5). Si necesitas cambiar un archivo que no es tuyo, pídeselo a su dueño.
- Si algo no compila (`npm run typecheck` falla), **no lo subas**: bloqueas a los 4 restantes.

---

## 3. Contrato: los nombres que todos usamos

### 3.1 Reglas de nombres

| Qué | Cómo se escribe | Ejemplo |
|---|---|---|
| Variables, funciones y campos | Inglés, `camelCase` | `submittedAt`, `joinCode` |
| Tablas y columnas de la base | Inglés, `snake_case`, tabla en plural | `team_members.joined_at` |
| Acciones que guardan | `verbo` + `Entidad` + `Action` | `joinTeamAction` |
| Funciones que leen | `get…` (uno) o `list…` (varios) | `getMyProject`, `listGalleryProjects` |
| Tipos que recibe la pantalla | Terminan en `Dto` | `TeamDto` |
| Archivos de componentes | `kebab-case.tsx`, componente en `PascalCase` | `file-uploader.tsx` → `FileUploader` |
| Direcciones de páginas | En español | `/panel/proyecto`, `/galeria?ver=ganadores` |
| Fechas dentro de un `Dto` | Texto ISO, nunca objeto `Date` | `"2026-11-20T23:59:00.000Z"` |
| Marcas para pruebas | `data-testid="pantalla-elemento"` | `team-join-submit` |

### 3.2 Palabras oficiales (los sinónimos están prohibidos)

| Concepto | Se dice | Nunca |
|---|---|---|
| Equipo | `team` | `group`, `squad` |
| Código para unirse | `joinCode` | `code`, `inviteCode` |
| Integrante | `member` | `participant`, `teammate` |
| Proyecto | `project` | `submission`, `entry` |
| Entregar | `submit` / `submittedAt` | `send`, `deliver` |
| Archivo | `file` / `ProjectFile` | `attachment`, `document` |
| Jurado | `judge` | `jury`, `evaluator` |
| Calificación | `evaluation`, cada nota `…Score` | `grade`, `rating` |
| Organizador | `organizer` | `admin`, `staff` |
| Ganador | `isWinner` / `winnerTitle` | `award`, `prize` |

### 3.3 Tablas de la base (dueño: BD)

| Tabla | Campos principales |
|---|---|
| `users` | `id`, `name`, `email`, `image`, `role` (`PARTICIPANT` / `JUDGE` / `ORGANIZER`), `created_at` |
| `accounts` | El modelo estándar de Auth.js |
| `teams` | `id`, `name` (único), `join_code` (único), `leader_id`, `created_at` |
| `team_members` | `team_id`, `user_id` (único: un usuario = un solo equipo), `joined_at` |
| `projects` | `id`, `team_id` (único), `slug`, `title`, `summary`, `description`, `repository_url`, `demo_url`, `video_url`, `submitted_at` (vacío = borrador), `submission_count`, `is_visible_in_gallery`, `is_finalist`, `is_winner`, `winner_title` |
| `project_files` | `id`, `project_id`, `kind` (`PITCH_DECK` / `EXTRA` / `COVER_IMAGE`), `bucket`, `storage_path`, `original_name`, `content_type`, `size_bytes` |
| `evaluations` | `id`, `project_id`, `judge_id` (únicos juntos), `innovation_score`, `technology_score`, `impact_score`, `presentation_score`, `comment` |
| `event_state` | Una sola fila: `finalists_published_at`, `results_published_at` |

### 3.4 Funciones que conectan backend y frontend

> **Lo más importante del documento.** En la **semana 1**, BD y BK crean **todas** estas funciones con su nombre final, pero devolviendo datos inventados. UX y FE programan contra ellas desde el primer día. Cuando se vuelven reales, **se cambia lo de adentro, nunca el nombre ni lo que recibe o devuelve**.

**Leen datos — las hace BD, en `src/lib/<modulo>/queries.ts`**

| Función | Devuelve | Real en |
|---|---|---|
| `getEventState()` | `{ finalistsPublishedAt, resultsPublishedAt }` | S2 |
| `getMyTeam()` | `TeamDto` o `null` | S2 |
| `getMyProject()` | `ProjectDto` o `null` | S2 |
| `listTeamsForOrganizer()` | `OrganizerTeamRowDto[]` | S2 |
| `listGalleryProjects({ filter, search })` | `GalleryProjectCardDto[]` | S3 |
| `getGalleryProject(slug)` | `GalleryProjectDetailDto` o `null` | S3 |
| `listProjectsForJudge()` | `JudgeProjectRowDto[]` | S3 |
| `getProjectForJudge(projectId)` | `JudgeProjectDetailDto` o `null` | S3 |
| `listProjectsForOrganizer()` | `OrganizerProjectRowDto[]` (mejor promedio primero) | S3 |
| `getProjectForOrganizer(projectId)` | `OrganizerProjectDetailDto` o `null` | S3 |

**Guardan datos — las hace BK, en `src/lib/<modulo>/actions.ts`**

Todas reciben **un solo objeto** y devuelven siempre lo mismo:
`{ ok: true, data }` o `{ ok: false, error: { code, fieldErrors? } }`.

| Acción | Recibe | Quién puede | Real en |
|---|---|---|---|
| `signInAction`, `signOutAction` | `{ provider, next? }` / `{}` | Cualquiera | S1 |
| `createTeamAction` | `{ name }` | Participante | S2 |
| `joinTeamAction` | `{ joinCode }` | Participante | S2 |
| `saveProjectDraftAction` | `{ title, summary, description, repositoryUrl, demoUrl, videoUrl }` | Participante | S2 |
| `createUploadUrlAction` | `{ kind, fileName, contentType, sizeBytes }` | Participante | S3 |
| `confirmUploadAction` | lo anterior + `{ storagePath }` | Participante | S3 |
| `deleteProjectFileAction` | `{ fileId }` | Participante | S3 |
| `submitProjectAction` | `{}` | Líder del equipo | S3 |
| `saveEvaluationAction` | `{ projectId, innovationScore, technologyScore, impactScore, presentationScore, comment }` | Jurado | S3 |
| `updateProjectFlagsAction` | `{ projectId, isVisibleInGallery?, isFinalist?, isWinner?, winnerTitle? }` | Organizador | S4 |
| `updateEventStateAction` | `{ finalistsPublished?, resultsPublished? }` | Organizador | S4 |

**Sesión — las hace BK, en `src/lib/auth/session.ts` (reales desde S1)**

```ts
getCurrentUser()            // usuario actual o null
requireUser()               // sin sesión → manda a /ingresar
requireRole(['JUDGE'])      // rol incorrecto → manda a /panel
// El usuario trae: { id, name, email, image, role, teamId, isTeamLeader }
```

### 3.5 Los datos que viajan a las pantallas (`Dto`)

```ts
type TeamDto = { id, name, joinCode, members: { userId, name, image, isLeader }[],
                 memberCount, isFull, hasMinimumMembers }

type ProjectDto = { id, slug, title, summary, description,
                    repositoryUrl, demoUrl, videoUrl, coverUrl,
                    submittedAt, submissionCount,
                    files: { id, kind, originalName, sizeBytes, uploadedAt }[],
                    missingFields: string[],
                    submissionWindow: { status: 'NOT_OPEN'|'OPEN'|'CLOSED', opensAt, closesAt, serverNow } }

type GalleryProjectCardDto = { slug, title, summary, teamName, coverUrl,
                               badge: 'WINNER'|'FINALIST'|null, winnerTitle }

type JudgeProjectRowDto = { projectId, title, teamName, submittedAt, myWeightedScore }

type OrganizerProjectRowDto = { projectId, slug, title, teamName, submittedAt,
                                evaluationCount, averageScore,
                                isVisibleInGallery, isFinalist, isWinner, winnerTitle }

type OrganizerTeamRowDto = { teamId, name, joinCode, memberCount, leaderEmail,
                             projectTitle, submittedAt }
```

### 3.6 Códigos de error (dueño: DP; el texto en español lo escribe UX)

```
UNAUTHENTICATED · FORBIDDEN · VALIDATION_ERROR · NOT_FOUND · INTERNAL_ERROR
TEAM_REQUIRED · TEAM_NAME_TAKEN · TEAM_ALREADY_MEMBER · TEAM_JOIN_CODE_INVALID
TEAM_FULL · TEAM_REGISTRATION_CLOSED · TEAM_TOO_SMALL · TEAM_LEADER_REQUIRED
PROJECT_INCOMPLETE · PROJECT_NOT_SUBMITTED · SUBMISSION_NOT_OPEN · SUBMISSION_CLOSED
FILE_TOO_LARGE · FILE_TYPE_NOT_ALLOWED · FILE_LIMIT_REACHED · FILE_NOT_UPLOADED
EVALUATION_CLOSED
```

### 3.7 Páginas y su dueño

| Dirección | Dueño | | Dirección | Dueño |
|---|---|---|---|---|
| `/` | UX | | `/ingresar` | FE |
| `/informacion` | UX | | `/panel` | FE |
| `/cronograma` | UX | | `/panel/equipo` | FE |
| `/mentores-y-jurado` | UX | | `/panel/proyecto` | FE |
| `/criterios` | UX | | `/jurado` y `/jurado/[projectId]` | FE |
| `/faq` | UX | | `/organizacion` | FE |
| `/galeria` y `/galeria/[projectSlug]` | UX | | `/organizacion/proyectos/[projectId]` y `/organizacion/equipos` | FE |

### 3.8 Si necesitas cambiar el contrato

1. **Agregar** un campo o función se puede en cualquier momento, avisando en el grupo.
2. **Renombrar o borrar** algo requiere permiso del dueño y de quien lo usa, y se arregla en el mismo commit.
3. Los cambios se piden así en el grupo: `CONTRATO · <módulo> · <qué necesito> · <para qué pantalla>`.
4. Quien cambie algo, **actualiza este documento el mismo día**.

---

## 4. Seis reglas técnicas que no se rompen

1. Las páginas y componentes **nunca** importan Prisma ni `lib/db.ts`: solo usan las funciones de 3.4.
2. `queries.ts` empieza con `import 'server-only'` y `actions.ts` empieza con `'use server'`.
3. Las fechas viajan como texto y se muestran con `formatEventDate(fecha)`.
4. Los errores se muestran con `getErrorMessage(codigo)`, nunca el código pelado en pantalla.
5. Los archivos suben del navegador directo a Supabase con un token; **nunca** dentro de una acción.
6. Las páginas que dependen de la sesión o de la hora llevan `export const dynamic = 'force-dynamic'`.

---

## 5. Dueño de cada carpeta

```text
prisma/                        BD (schema, migraciones, seed)
src/lib/db.ts                  BD
src/lib/*/queries.ts           BD
src/lib/auth/                  BK
src/lib/*/actions.ts           BK
src/lib/*/rules.ts             BK
src/lib/storage/               BK
src/config/                    BK (fechas, límites y criterios)
src/components/ui/             UX
src/content/                   UX
src/app/(public)/              UX
src/lib/error-messages.ts      UX
src/app/(auth)/ y (private)/   FE
src/components/ (privados)     FE
src/lib/errors.ts, actions.ts, clock.ts, dates.ts, env.ts    DP
.github/, e2e/, test/          DP
```

---

## 6. Plan por integrante

Cada tarea debe estar **terminada y subida a `main` al final de esa semana**. El orden dentro de la semana lo decide cada quien.

---

### 🟩 BD · Base de datos

**Semana 1 — La base existe y todas las funciones de lectura ya se pueden usar**
- Crear los proyectos `hackathon-dev` y `hackathon-prod` en Supabase y entregar las cadenas de conexión a DP.
- Escribir `prisma/schema.prisma` con las 8 tablas de 3.3 y correr la primera migración en `hackathon-dev`.
- Dejar listo `src/lib/db.ts`.
- Crear **todas** las funciones de lectura de 3.4 devolviendo datos inventados, con su nombre final.

*Verificación:*
- [ ] En Supabase veo las 8 tablas con los nombres exactos de 3.3.
- [ ] `npx prisma migrate dev` corre sin errores.
- [ ] UX y FE ya importan mis funciones y `npm run typecheck` pasa.
- [ ] BK revisó el esquema y confirmó que le sirve.

**Semana 2 — Datos de prueba y las lecturas de equipo y proyecto**
- `prisma/seed.ts` con los usuarios y equipos de la sección 7.
- `getMyTeam`, `getMyProject`, `getEventState` y `listTeamsForOrganizer` **reales**.

*Verificación:*
- [ ] `npm run db:seed` se puede correr dos veces sin romper nada.
- [ ] FE ve su equipo real en `/panel/equipo` sin cambiar una sola línea de su código.
- [ ] Los campos que devuelvo son exactamente los de 3.5 (ni uno más, ni uno menos).

**Semana 3 — Las lecturas de galería, jurado y organización**
- `listGalleryProjects`, `getGalleryProject`, `listProjectsForJudge`, `getProjectForJudge`, `listProjectsForOrganizer` y `getProjectForOrganizer` **reales**.
- Ampliar la semilla con proyectos enviados y calificaciones.

*Verificación:*
- [ ] Un proyecto en borrador o no visible **no** aparece en la galería ni para el jurado.
- [ ] La lista de organización sale ordenada por mejor promedio y los sin calificar al final.
- [ ] En el detalle público **no** viaja ningún correo electrónico.
- [ ] UX y FE confirmaron que los datos les llegan como esperaban.

**Semana 4 — Base de producción lista**
- Migrar `hackathon-prod` junto con DP, **sin datos de prueba**.
- Revisar que la galería y el panel no hagan consultas repetidas.
- Arreglar lo que salga en la prueba final.

*Verificación:*
- [ ] `npx prisma migrate status` en producción dice que no falta ninguna migración.
- [ ] En producción no existe ningún usuario ni equipo de prueba.
- [ ] Cargar `/galeria` hace 3 consultas o menos.

---

### 🟦 BK · Backend

**Semana 1 — Se puede entrar al sitio y todas las acciones ya existen**
- Auth.js con Google y GitHub funcionando, y las cuentas quedando guardadas en la base.
- Rol automático según las listas `ORGANIZER_EMAILS` y `JUDGE_EMAILS`.
- `getCurrentUser`, `requireUser` y `requireRole` reales.
- Crear **todas** las acciones de 3.4 con su nombre final devolviendo una respuesta falsa.
- `src/config/event.ts` (fechas y límites del evento) y `src/config/criteria.ts` (criterios y pesos).

*Verificación:*
- [ ] Entro con Google y con GitHub, y veo mi nombre en pantalla.
- [ ] Un correo de la lista de jurados entra con rol `JUDGE`; uno normal con `PARTICIPANT`.
- [ ] FE ya llama a mis acciones y `npm run typecheck` pasa.
- [ ] Ninguna acción tiene un nombre distinto al de la tabla 3.4.

**Semana 2 — Equipos y borrador del proyecto**
- `createTeamAction`, `joinTeamAction` y `saveProjectDraftAction` reales.
- Reglas: generar el código `HACK-XXXX`, aceptar el código en minúsculas y con espacios, nombre de equipo único, mínimo y máximo de integrantes, cierre de inscripciones.
- Calcular `missingFields` (qué le falta al proyecto para poder enviarse).

*Verificación:*
- [ ] Probé a mano los casos de la sección 7 y cada uno devuelve el código de error correcto.
- [ ] Ningún error nuevo que inventé: todos salen de la lista 3.6 (si falta uno, se lo pedí a DP y avisé a UX).
- [ ] FE mostró mis errores en pantalla sin cambiar mis nombres.

**Semana 3 — Archivos, envío del proyecto y calificaciones**
- `createUploadUrlAction`, `confirmUploadAction` y `deleteProjectFileAction` reales, con los buckets `entregables` (privado) y `portadas` (público).
- `submitProjectAction` real: solo el líder, solo con el equipo completo, solo dentro del plazo.
- `saveEvaluationAction` real y el cálculo del puntaje ponderado (`I×25 + T×30 + M×25 + P×20 / 100`).

*Verificación:*
- [ ] Un PDF de 26 MB como pitch deck se rechaza; uno de 5 MB se acepta.
- [ ] Un minuto después del cierre, enviar devuelve `SUBMISSION_CLOSED`.
- [ ] Guardar dos veces la misma calificación deja **una** sola fila actualizada.
- [ ] El puntaje que muestra FE en pantalla es igual al que queda guardado.

**Semana 4 — Panel de la organización y revisión de permisos**
- `updateProjectFlagsAction` y `updateEventStateAction` reales.
- Revisar **una por una** que cada acción solo la pueda usar el rol correcto.
- Arreglar lo que salga en la prueba final.

*Verificación:*
- [ ] Un participante que intenta usar una acción de organizador recibe `FORBIDDEN`.
- [ ] Publicar y despublicar resultados funciona en los dos sentidos.
- [ ] Marcar como ganador un proyecto en borrador devuelve `PROJECT_NOT_SUBMITTED`.

---

### 🟨 UX · Diseño y páginas públicas

**Semana 1 — El sitio tiene cara y FE tiene con qué construir**
- Colores, tipografía y espaciados en Tailwind.
- Componentes reutilizables en `components/ui`: Button, Input, Textarea, Card, Badge, Dialog, Toast, Table, EmptyState, Skeleton, Accordion y Countdown, todos visibles en `/dev/ui`.
- Boceto simple (papel o Figma) de las 6 pantallas principales, entregado a FE.
- `src/lib/error-messages.ts`: un texto en español para **cada** código de 3.6.

*Verificación:*
- [ ] FE armó `/ingresar` usando solo mis componentes, sin crear los suyos.
- [ ] Todos los códigos de 3.6 tienen texto; ninguno quedó en inglés.
- [ ] El sitio se ve bien a 360 px (celular) y a 1280 px (laptop).

**Semana 2 — El sitio informativo completo**
- Header con menú (y menú móvil), Footer y la página de inicio con cuenta regresiva.
- `/informacion`, `/cronograma`, `/mentores-y-jurado`, `/criterios` y `/faq` con contenido real en `src/content`.

*Verificación:*
- [ ] Las fechas salen de `config/event.ts` (las pedí a BK); no copié ninguna a mano.
- [ ] Los criterios y pesos salen de `config/criteria.ts` y suman 100 %.
- [ ] Puedo recorrer todo el sitio solo con el teclado.

**Semana 3 — La galería pública**
- `/galeria` con pestañas Todos, Finalistas y Ganadores (`?ver=`) y buscador (`?q=`).
- `/galeria/[projectSlug]`: descripción, enlaces, video e integrantes.
- Estados vacíos claros cuando todavía no hay nada publicado.

*Verificación:*
- [ ] Copiar la dirección con filtros y abrirla en otra pestaña muestra lo mismo.
- [ ] Un proyecto que no existe muestra la página 404 y no rompe el sitio.
- [ ] Uso `listGalleryProjects` y `getGalleryProject` tal cual; no pedí campos nuevos sin avisar a BD.

**Semana 4 — Ganadores y detalles finales**
- Insignias de finalista y ganador, con el `winnerTitle` en la tarjeta y en el detalle.
- Páginas de error y de "no encontrado", metadatos para compartir, `sitemap` y `robots`.
- Revisión final de accesibilidad y celular en todas las páginas públicas.

*Verificación:*
- [ ] Antes de publicar resultados, en ninguna parte del sitio aparece la palabra "Ganador".
- [ ] `robots.txt` deja fuera `/panel`, `/jurado` y `/organizacion`.
- [ ] Revisé las páginas públicas en un celular real.

---

### 🟧 FE · Frontend

**Semana 1 — Ingreso y esqueleto del área privada**
- `/ingresar` con los botones de Google y GitHub llamando a `signInAction`.
- Layout privado: nombre, foto, rol, cerrar sesión y enlaces según el rol (Jurado solo para jurados, Organización solo para organizadores).
- `/panel` mostrando "Aún no tienes equipo" o la tarjeta del equipo, usando las funciones falsas de BD.

*Verificación:*
- [ ] Un participante no ve los enlaces de Jurado ni Organización.
- [ ] Si entro a `/panel` sin sesión, me manda a `/ingresar`.
- [ ] Usé los componentes de UX; no creé botones ni tarjetas propias.
- [ ] No importé Prisma ni `lib/db.ts` en ninguna parte.

**Semana 2 — Equipo y borrador del proyecto**
- `/panel/equipo`: crear equipo, unirse con el código, ver integrantes y copiar el código.
- `/panel/proyecto`: formulario del borrador con validación antes de enviar y lista de lo que falta.
- `/panel`: lista de pendientes (tener equipo, llegar al mínimo, guardar borrador, subir pitch, enviar).

*Verificación:*
- [ ] Cada error de BK se ve con su texto en español (`getErrorMessage`), nunca el código.
- [ ] Un resumen de más de 280 caracteres avisa **antes** de enviar al servidor.
- [ ] Al unirse alguien, la tarjeta se actualiza sin recargar a mano.

**Semana 3 — Archivos, envío y pantalla del jurado**
- Subida de archivos: valida tamaño y tipo en el navegador, sube a Supabase y confirma con BK.
- Aviso del plazo, ventana de confirmación para enviar y bloqueo total después del cierre.
- `/jurado` (lista con mi nota) y `/jurado/[projectId]` con el formulario de calificación y el puntaje en vivo.

*Verificación:*
- [ ] Un archivo muy grande se rechaza **sin** llegar al servidor.
- [ ] Después del cierre, los botones de enviar quedan apagados.
- [ ] Un integrante que no es líder no ve el botón de enviar.
- [ ] El puntaje que muestro coincide con el que calcula BK.

**Semana 4 — Panel de la organización**
- `/organizacion`: tabla con promedio, número de calificaciones e interruptores de visible, finalista y ganador.
- `/organizacion/proyectos/[projectId]` (calificaciones y descargas) y `/organizacion/equipos`.
- Tarjeta para publicar y despublicar finalistas y resultados, con confirmación.

*Verificación:*
- [ ] Marcar un proyecto como visible lo hace aparecer en la galería de UX al recargar.
- [ ] Publicar resultados muestra los ganadores; despublicar los esconde.
- [ ] Todas mis pantallas tienen estado de carga, estado vacío y estado de error.

---

### 🟪 DP · Despliegue y pruebas

**Semana 1 — El proyecto existe, está en internet y tiene las piezas comunes**
- Crear el proyecto Next.js con la estructura de la sección 5, ESLint y Prettier.
- `errors.ts` (lista de 3.6), `actions.ts` (la función `createAction` que valida datos, sesión y rol), `clock.ts` (la hora del servidor), `dates.ts` (`formatEventDate`) y `env.ts`.
- Conectar GitHub con Vercel para que `main` se publique solo, y dejar `.env.example` con todas las variables.

*Verificación:*
- [ ] Los otros 4 clonaron el repo y les corre `npm run dev` a la primera.
- [ ] Hay una dirección de internet donde ya se ve el proyecto.
- [ ] Si alguien importa `lib/db.ts` desde una página, el lint se lo impide.

**Semana 2 — Pruebas y apoyo**
- Escribir el guion de prueba manual (10 pasos que recorren el flujo del participante).
- Primeras pruebas automáticas simples: el inicio carga, `/panel` sin sesión redirige.
- Revisar cada día que `main` compile y avisar al grupo apenas algo se rompa.

*Verificación:*
- [ ] Corrí el guion completo en la dirección de Vercel y anoté lo que falló.
- [ ] Cada falla quedó escrita en el grupo con quién la arregla.
- [ ] `main` terminó la semana compilando.

**Semana 3 — Prueba del flujo completo**
- Probar de punta a punta: crear equipo → unirse → borrador → subir archivos → enviar → calificar.
- Probar los plazos: antes del cierre funciona, después del cierre bloquea.
- Revisar que el sitio cargue rápido y se vea bien en celular.

*Verificación:*
- [ ] Hice el recorrido completo con 3 cuentas distintas (participante, jurado, organizador).
- [ ] Probé el cierre de entregas y el bloqueo funciona.
- [ ] Todo lo que encontré quedó anotado y asignado.

**Semana 4 — Producción**
- Configurar el entorno de producción en Vercel: variables reales, dominio y las llaves de producción.
- Publicar con BD la base de producción y hacer la prueba final guiada con la organización.
- Dejar la versión final etiquetada como `v1.0.0`.

*Verificación:*
- [ ] Entrar con Google y GitHub funciona en el dominio real.
- [ ] En producción no existe el ingreso de prueba ni el reloj de prueba.
- [ ] La lista de la sección 8 está completa.

---

## 7. Datos de prueba que todos usamos

Para que backend y frontend prueben **contra lo mismo**. Estos correos solo funcionan en desarrollo.

| Correo | Rol | Situación |
|---|---|---|
| `organizador@prueba.test` | ORGANIZER | — |
| `jurado1@prueba.test`, `jurado2@prueba.test` | JUDGE | — |
| `sin.equipo@prueba.test` | PARTICIPANT | Sin equipo |
| `lider.byteforce@prueba.test` | PARTICIPANT | Líder de "Byte Force" (`HACK-29XJ`), 5 integrantes: **lleno** |
| `lider.ecoruta@prueba.test` | PARTICIPANT | Líder de "Eco Ruta" (`HACK-7KQM`), 3 integrantes |
| `lider.solodev@prueba.test` | PARTICIPANT | Líder de "Solo Dev" (`HACK-9PRD`), 1 integrante: **debajo del mínimo** |

**Casos que deben dar error (BK los prueba, FE los muestra):**

| Situación | Error esperado |
|---|---|
| Crear "byte force" cuando ya existe "Byte Force" | `TEAM_NAME_TAKEN` |
| Alguien con equipo crea otro | `TEAM_ALREADY_MEMBER` |
| Unirse con `HACK-0000` | `TEAM_JOIN_CODE_INVALID` |
| Sexto integrante | `TEAM_FULL` |
| Guardar borrador sin equipo | `TEAM_REQUIRED` |
| Enviar con 1 integrante | `TEAM_TOO_SMALL` |
| Enviar sin ser líder | `TEAM_LEADER_REQUIRED` |
| Enviar sin pitch deck | `PROJECT_INCOMPLETE` |
| Enviar después del cierre | `SUBMISSION_CLOSED` |

Unirse con `" hack-29xj "` (minúsculas y espacios) **sí debe funcionar**.

---

## 8. Ritmo de la semana y entrega final

**Cada semana:**
- **Lunes:** 20 minutos. Cada uno dice qué tarea de la semana le toca y qué necesita de los demás.
- **Todos los días:** un mensaje en el grupo: `Ayer · Hoy · ¿Estoy trabado?`
- **Viernes:** 30 minutos. Cada uno muestra su tarea **funcionando en la dirección de Vercel** y marca sus casillas. Lo que no esté listo se termina, como máximo, el martes siguiente y antes de empezar lo nuevo.

**Si alguien se traba:** lo dice el mismo día, no el viernes. Si te bloquea otra persona, sigue trabajando con la versión falsa de su función (por eso existen desde la semana 1).

**Checklist de entrega final:**

- [ ] Todas las casillas de la sección 6 marcadas.
- [ ] `main` compila y la dirección de producción funciona.
- [ ] Entrar con Google y GitHub funciona en producción.
- [ ] La base de producción está migrada y sin datos de prueba.
- [ ] Fechas, criterios y contenidos confirmados con la organización.
- [ ] Guion de prueba manual aprobado de punta a punta.
- [ ] Versión etiquetada como `v1.0.0`.
