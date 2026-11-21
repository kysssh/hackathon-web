# Plataforma Web del Hackathon

Aplicación para gestionar equipos, proyectos, entregas, evaluaciones y una galería pública. Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Auth.js, Prisma 7 y PostgreSQL/Supabase.

## Estado actual

Actualizado el **21 de noviembre de 2026**, según el código local y las verificaciones descritas en el [informe de estado y despliegue](docs/ESTADO_PROYECTO_2026-11-21.md). El proyecto compila localmente, pero **todavía no se debe declarar listo para producción**: falta confirmar CI remoto, completar la aceptación manual y comprobar servicios reales.

El estado de Git revisado es la rama `develop`, commit `75ba309`. El árbol local contiene cambios sin confirmar; el informe identifica sus límites y el resultado del CI.

| Rol                                | Implementado                                                                                                                  | Pendiente principal                                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **BD — Base de datos**             | Ocho modelos, dos migraciones, cliente Prisma, semilla y las diez consultas del contrato.                                     | Validar semilla idempotente, rendimiento y producción sin datos de prueba.                                              |
| **BK — Backend**                   | Auth.js Google/GitHub, sesión y roles; acciones de equipos, borrador, archivos, envío, evaluación y organización.             | Verificar OAuth interactivo, Storage, permisos y concurrencia con servicios reales. Confirmar fechas, límites y escala. |
| **UX — Diseño y páginas públicas** | Inicio, información, cronograma, mentores/jurado, criterios, FAQ, galería y detalle; navegación móvil, insignias, metadatos, sitemap y robots. | Completar componentes y `/dev/ui`; verificar URLs SEO con el dominio real, contenido oficial y accesibilidad/móvil. |
| **FE — Frontend privado**          | Ingreso, panel, equipos, proyecto, subida real, jurado y organización con detalle, descargas y publicación.                   | Completar bloqueo visual al cierre, actualización del equipo entre usuarios y validación del flujo.                     |
| **DP — Despliegue y pruebas**      | Suite unitaria, workflow de CI y comandos locales de lint, tipos y build.                                                     | Reparar y volver a ejecutar CI remoto; completar la aceptación manual y verificar Vercel, dominio y producción.          |

Los informes anteriores son evidencia histórica; el estado vigente y los pendientes de cierre están en:

- [Estado, pruebas y criterios para despliegue](docs/ESTADO_PROYECTO_2026-11-21.md).
- [Guía de aceptación manual](docs/PLAN_PRUEBAS_DP.md).
- [Preparación de OAuth para producción](docs/OAUTH_PRODUCCION.md).

## Funcionalidades

- Ingreso con Google/GitHub y acceso por roles participante, jurado y organizador.
- Creación de equipos, unión por código, integrantes y lista de pendientes.
- Borrador, validación local, campos faltantes y envío/reenvío por el líder dentro del plazo.
- Subida directa a Supabase mediante token firmado, con progreso, cancelación, reintentos, confirmación y eliminación. Los archivos no viajan dentro de una Server Action.
- Evaluaciones con pesos compartidos: innovación 25 %, tecnología 30 %, impacto 25 % y presentación 20 %.
- Organización: promedios, visibilidad, finalistas, ganadores, título de ganador, equipos, evaluaciones, descargas firmadas y publicación/despublicación.
- Galería pública con filtros, búsqueda, detalle e insignias condicionadas por la publicación.

## Pendientes de integración

- **CI:** el workflow remoto del commit `75ba309` falló en `npm ci` por discrepancias del lockfile. Se está validando la actualización local; el cierre requiere subirla y obtener un CI verde.
- **Pruebas funcionales:** las pruebas unitarias no sustituyen el recorrido manual completo como participante, jurado y organizador. Ver la [guía de aceptación](docs/PLAN_PRUEBAS_DP.md).
- **Servicios reales:** confirmar callbacks OAuth, variables protegidas, base de datos, migraciones y buckets/políticas de Storage en el entorno destino. No sembrar datos de prueba en producción.
- **Despliegue:** confirmar proyecto, dominio, rama de despliegue y variables de producción en Vercel; ejecutar un smoke test publicado antes de comunicar el lanzamiento.
- **Aceptación de reglas y UX:** verificar fechas/límites configurados, bloqueo al vencer el plazo, actualización de integrantes entre usuarios, accesibilidad y vistas móviles con la organización.

Despublicar finalistas puede conservar sus distintivos si los resultados siguen publicados: las consultas consideran públicos los finalistas cuando hay finalistas o resultados publicados.

## Desarrollo local

Entorno de referencia: Node.js 24 LTS y npm. Instala dependencias y crea `.env` si aún no existe:

```powershell
npm ci
Copy-Item .env.example .env
```

Completa la conexión PostgreSQL de desarrollo, las variables Supabase, las credenciales Google/GitHub, `AUTH_SECRET` y las listas de correos para roles. Configura `NEXTAUTH_URL` con la URL pública del entorno para que sitemap y robots generen enlaces correctos. Reemplaza los marcadores de `.env.example` por valores del entorno de desarrollo; no uses las credenciales de ejemplo en producción.

Sobre la base de desarrollo configurada:

```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
npm run dev
```

Abre [localhost:3000](http://localhost:3000). La semilla crea usuarios, equipos, proyectos y evaluaciones ficticios: úsala solo en desarrollo. No crea cuentas OAuth ni archivos en Storage; los correos `@prueba.test` no son credenciales de ingreso.

## Verificación local

Con la aplicación en ejecución y datos de prueba, revisar todas las páginas y funcionalidades implementadas usando los roles participante, jurado y organizador. Anotar qué funciona, qué falla, cómo reproducir cada fallo y quién debe corregirlo según el plan v3. Ver [guía de aceptación manual](docs/PLAN_PRUEBAS_DP.md).

```bash
npm run lint
npm run typecheck
npm run build
```

La suite se ejecuta con `npm test`; `typecheck` regenera tipos de rutas con `next typegen` antes de TypeScript. Los resultados locales vigentes, la instalación limpia y el estado del CI remoto están en el [informe de estado](docs/ESTADO_PROYECTO_2026-11-21.md). Estas verificaciones no sustituyen la aceptación manual ni certifican OAuth, Storage o producción.

Se resolvió el conflicto del botón de salida y las referencias generadas a la antigua ruta del jurado; la ruta vigente es `/jurado/[projectId]`. También se alinearon validación HTTP/HTTPS, fecha de envío en Lima y reenvío dentro del plazo.

El build encontró inicialmente `EPERM` de Windows al limpiar `.next/static`; terminó con una caché nueva. La anterior se conservó en `.next-review-backup-20261014`, excluida de Git, ESLint y TypeScript.

La [guía de Storage](src/lib/storage/README.md) conserva comprobaciones controladas de backend. Son evidencia histórica; no constituyen una suite persistente ni validan OAuth interactivo, Storage real o concurrencia entre transacciones independientes.

## Documentación

- [Revisión manual para DP](docs/PLAN_PRUEBAS_DP.md).
- [Estado del proyecto y criterio de despliegue](docs/ESTADO_PROYECTO_2026-11-21.md).
- [Plan de trabajo y contrato v3](PLAN_Roles_Hackathon_v3.md).
- [Informe del estado general](docs/INFORME_ESTADO_PROYECTO_2026-10-14.md).
- [Informe por roles y semanas](docs/INFORME_ROLES_HACKATHON_V3_2026-10-14.md).
- [Configuración de BD y semilla](prisma/README.md).
- [Diccionario de datos](docs/data-dictionary.md).
- [Contrato de archivos y configuración de Storage](src/lib/storage/README.md).
- [Consultas adicionales de organización](src/lib/organizer/README.md).

El README resume el estado actual; los informes fechados conservan el diagnóstico de su revisión. Las casillas del plan deben cerrarse con evidencia de sus verificaciones.
