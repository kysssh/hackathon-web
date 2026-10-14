# Plataforma Web del Hackathon

Aplicación para gestionar equipos, proyectos, entregas, evaluaciones y una galería pública. Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Auth.js, Prisma 7 y PostgreSQL/Supabase.

## Estado actual

Actualizado el **14 de octubre de 2026**, según el código local y el [plan de roles v3](PLAN_Roles_Hackathon_v3.md).

El proyecto tiene implementaciones previstas hasta la semana 4 y está en fase de integración y validación. La presencia del código no acredita las verificaciones del plan ni una entrega lista para producción.

| Rol | Implementado | Pendiente principal |
| --- | --- | --- |
| **BD — Base de datos** | Ocho modelos, dos migraciones, cliente Prisma, semilla y las diez consultas del contrato. | Validar semilla idempotente, rendimiento y producción sin datos de prueba. |
| **BK — Backend** | Auth.js Google/GitHub, sesión y roles; acciones de equipos, borrador, archivos, envío, evaluación y organización. | Verificar OAuth interactivo, Storage, permisos y concurrencia con servicios reales. Confirmar fechas, límites y escala. |
| **UX — Diseño y páginas públicas** | Inicio, información, cronograma, mentores/jurado, criterios, FAQ, galería y detalle; navegación móvil, insignias y metadatos. | Completar componentes y `/dev/ui`, sitemap, robots, contenido oficial y accesibilidad/móvil. |
| **FE — Frontend privado** | Ingreso, panel, equipos, proyecto, subida real, jurado y organización con detalle, descargas y publicación. | Completar bloqueo visual al cierre, actualización del equipo entre usuarios y validación del flujo. |
| **DP — Despliegue y pruebas** | Proyecto base, ESLint/Prettier, utilidades, variables de ejemplo y comandos de verificación local. | Crear suite persistente, CI y guion manual; verificar Vercel, dominio, producción y etiqueta final. |

Los informes detallan evidencia, avance por semana, dependencias y criterios de cierre:

- [Informe del estado general](docs/INFORME_ESTADO_PROYECTO_2026-10-14.md).
- [Informe de roles frente al plan v3](docs/INFORME_ROLES_HACKATHON_V3_2026-10-14.md).

## Funcionalidades

- Ingreso con Google/GitHub y acceso por roles participante, jurado y organizador.
- Creación de equipos, unión por código, integrantes y lista de pendientes.
- Borrador, validación local, campos faltantes y envío/reenvío por el líder dentro del plazo.
- Subida directa a Supabase mediante token firmado, con progreso, cancelación, reintentos, confirmación y eliminación. Los archivos no viajan dentro de una Server Action.
- Evaluaciones con pesos compartidos: innovación 25 %, tecnología 30 %, impacto 25 % y presentación 20 %.
- Organización: promedios, visibilidad, finalistas, ganadores, título de ganador, equipos, evaluaciones, descargas firmadas y publicación/despublicación.
- Galería pública con filtros, búsqueda, detalle e insignias condicionadas por la publicación.

## Pendientes de integración

- **Plazos:** el servidor rechaza cambios fuera del plazo, pero el borrador aún no pasa a solo lectura al cierre. Envío y uploader necesitan actualizar automáticamente su estado cuando vence el plazo con la página abierta.
- **Contenido y reglas:** fechas y límites en `src/config/event.ts` y escala en `src/config/criteria.ts` siguen siendo provisionales. La FAQ declara repositorio/demo/video obligatorios, mientras el servidor permite enviar sin esos enlaces; debe acordarse y alinearse la regla.
- **Configuración compartida:** algunos textos repiten pesos y límites; el formulario duplica límites del servidor. Falta completar los componentes reutilizables del plan.
- **Servicios reales:** no se certificaron en esta revisión OAuth interactivo, buckets/políticas de Storage ni producción. Los buckets esperados son `entregables` (privado) y `portadas` (público); comprobar su estado actual.
- **Pruebas:** `test`, `e2e` y `.github` solo contienen placeholders. Falta una suite reproducible y un recorrido aprobado con participante, jurado y organizador.
- **Entrega:** la revisión se hizo en `develop`; el plan exige entregar en `main`. Confirmar integración y rama de despliegue de Vercel.

Despublicar finalistas puede conservar sus distintivos si los resultados siguen publicados: las consultas consideran públicos los finalistas cuando hay finalistas o resultados publicados.

## Desarrollo local

Entorno de referencia: Node.js 24 LTS y npm. Instala dependencias y crea `.env` si aún no existe:

```powershell
npm ci
Copy-Item .env.example .env
```

Completa conexión PostgreSQL de desarrollo, variables Supabase, credenciales Google/GitHub, `AUTH_SECRET` y listas de correos para roles. `.env.example` contiene bloques duplicados: conserva una sola definición por variable en tu `.env`, especialmente las listas de roles.

Sobre la base de desarrollo configurada:

```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
npm run dev
```

Abre [localhost:3000](http://localhost:3000). La semilla crea usuarios, equipos, proyectos y evaluaciones ficticios: úsala solo en desarrollo. No crea cuentas OAuth ni archivos en Storage; los correos `@prueba.test` no son credenciales de ingreso.

## Verificación local

```bash
npm run lint
npm run typecheck
npm run build
```

Los tres comandos terminaron correctamente en la revisión del **14 de octubre de 2026**. `typecheck` regenera tipos de rutas con `next typegen` antes de TypeScript. Estas verificaciones no sustituyen las pruebas de servicios reales ni certifican producción. No hay script `npm test` configurado.

Se resolvió el conflicto del botón de salida y las referencias generadas a la antigua ruta del jurado; la ruta vigente es `/jurado/[projectId]`. También se alinearon validación HTTP/HTTPS, fecha de envío en Lima y reenvío dentro del plazo.

El build encontró inicialmente `EPERM` de Windows al limpiar `.next/static`; terminó con una caché nueva. La anterior se conservó en `.next-review-backup-20261014`, excluida de Git, ESLint y TypeScript.

La [guía de Storage](src/lib/storage/README.md) conserva comprobaciones controladas de backend. Son evidencia histórica; no constituyen una suite persistente ni validan OAuth interactivo, Storage real o concurrencia entre transacciones independientes.

## Documentación

- [Plan de trabajo y contrato v3](PLAN_Roles_Hackathon_v3.md).
- [Informe del estado general](docs/INFORME_ESTADO_PROYECTO_2026-10-14.md).
- [Informe por roles y semanas](docs/INFORME_ROLES_HACKATHON_V3_2026-10-14.md).
- [Configuración de BD y semilla](prisma/README.md).
- [Diccionario de datos](docs/data-dictionary.md).
- [Contrato de archivos y configuración de Storage](src/lib/storage/README.md).
- [Consultas adicionales de organización](src/lib/organizer/README.md).

El README resume el estado actual; los informes fechados conservan el diagnóstico de su revisión. Las casillas del plan deben cerrarse con evidencia de sus verificaciones.
