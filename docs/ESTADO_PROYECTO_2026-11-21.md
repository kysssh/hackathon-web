# Estado del proyecto y criterio de despliegue

Actualizado el 23 de noviembre de 2026. La rama activa es
`release/deploy-2026-11-21`; contiene la integración `c4bd6df` de la feature
`origin/feature/perfil-equipos-y-subida-archivos`. La aplicación compila y sus
migraciones están aplicadas en la base Supabase configurada.

Todavía queda publicar la rama, obtener CI verde y completar la aceptación manual
desde el dominio definitivo. No constituye un lanzamiento terminado hasta
comprobar OAuth interactivo y las subidas reales en producción.

## Diagnóstico de `actions.ts`, Zod y Next.js

Los imports de `zod` y `next/navigation` en `src/actions.ts` son válidos para las
versiones declaradas. El problema observado era la instalación local incompleta:
las carpetas de `next`, `zod` y `typescript` no contenían sus manifiestos ni los
ejecutables. Por eso VS Code no resolvía esos módulos y `npm run typecheck` decía
que `next` no era un comando.

`npm ci` terminó correctamente con el lockfile local, e instaló Next.js 16.4.6,
Zod 4.6.7 y TypeScript 5.9.3. Después de la instalación, la generación de rutas,
TypeScript y el build reconocieron las APIs importadas; no hizo falta cambiar
`src/actions.ts`. El primer intento de instalación terminó por falta de memoria
del proceso de Node; el siguiente completó con heap limitado y tardó unos siete
minutos.

## Verificaciones locales

| Comando | Resultado |
| --- | --- |
| `npm ci --no-audit --fund=false` | Correcto; instaló 514 paquetes. |
| `npx prisma generate` | Correcto; generó Prisma Client 7.10.1. |
| `npm run typecheck` | Correcto; `next typegen` y `tsc --noEmit` sin errores. |
| `npm test` | Correcto; 30 pruebas, 30 aprobadas. |
| `npm run lint` | Correcto. |
| `npm run build` | Correcto; compilación de producción y generación de rutas. |

La integración pasa las verificaciones locales de lint, tipos y build. Falta
publicar el merge y confirmar un workflow remoto verde en GitHub Actions.

## Pruebas y despliegue — 23 de noviembre

- `prisma migrate status` confirmó que las cuatro migraciones están aplicadas en
  la base Supabase configurada. `prisma migrate deploy` no encontró migraciones
  pendientes y no se ejecutó el seed.
- La rama `release/deploy-2026-11-21` contiene el merge `c4bd6df` con la feature
  de perfil y subida de archivos.
- Se verificaron los dos buckets reales de Supabase: `entregables` es privado,
  admite PDF/ZIP/PNG/JPEG y tiene límite de 25 MB; `portadas` es público, admite
  PNG/JPEG/WebP y tiene límite de 5 MB.
- El preflight CORS de Supabase respondió HTTP 200 desde `localhost:3000`, con
  autorización de los métodos y cabeceras usados por Storage.
- RLS está activo en las tablas de Storage. No se encontraron políticas RLS
  visibles mediante la consulta directa ejecutada.
- En el navegador local, `/`, `/ingresar`, `/informacion`, `/cronograma`,
  `/criterios`, `/faq` y `/mentores-y-jurado` respondieron HTTP 200. Sin sesión,
  `/panel`, `/jurado` y `/organizacion` redirigieron a `/ingresar`.
- `/api/auth/providers` anuncia `google` y `github`; esto solo comprueba que
  están configurados en la app, no que sus callbacks o el ingreso interactivo
  funcionen.
- `/galeria` devuelve HTTP 500 mientras falla la conexión a la base. No se pudo
  comprobar Storage ni ejecutar flujos de participante/jurado/organizador.
- `robots.txt` y `sitemap.xml` responden, pero generan `https://hackathon.local`
  porque `NEXTAUTH_URL` no está configurada en `.env`. Definirla en el entorno de
  Vercel antes de construir/desplegar y comprobar ambas rutas en el dominio final.
- No existe suite E2E dentro de `e2e/`; no se declaró completa la aceptación
  manual. No hay CLI ni proyecto Vercel enlazado localmente; el despliegue queda a
  cargo del propietario.

No se modificaron `.env`, bases, Supabase Storage, proveedores OAuth ni Vercel.

## Cambios de consistencia realizados en esta revisión

- Se eliminaron variables duplicadas de `.env.example` y se añadió `NEXTAUTH_URL`.
  `sitemap.ts` y `robots.ts` usan esa variable para producir URLs absolutas; sin
  ella, ambas rutas usan `https://hackathon.local`.
- Se alinearon el texto de ingreso, la página de información y los datos de
  prueba con la configuración local actual de equipos de exactamente cuatro
  integrantes. Eco Ruta queda como borrador con tres miembros; no se debe usar la
  semilla en producción.
- Se corrigió el informe de estado faltante que README, OAuth y la guía de pruebas
  ya enlazaban.

## Pendientes para aceptar producción

- Confirmar las fechas oficiales con la organización y mantener sincronizados
  `src/config/event.ts`, el cronograma público y `PLAN_Roles_Hackathon_v3.md`.
- Confirmar si la regla vigente es exactamente cuatro integrantes o un rango:
  `PLAN_Roles_Hackathon_v3.md` conserva equipo de 2 a 5, mientras la
  configuración actual usa exactamente 4.
- Completar OAuth interactivo con Google y GitHub desde el dominio definitivo.
- Probar perfiles, creación/unión de equipos, subidas, descarga y eliminación
  contra la base y Storage reales.
- Confirmar las políticas de acceso necesarias para las operaciones de Storage;
  los buckets y CORS están configurados, pero no sustituyen la aceptación funcional.
- Configurar el proyecto y variables de producción en Vercel, incluyendo
  `NEXTAUTH_URL`, credenciales OAuth, base y secretos Supabase.
- Publicar la rama, ejecutar CI y realizar el recorrido manual con participante,
  jurado y organizador según [la guía de aceptación](PLAN_PRUEBAS_DP.md).

Las verificaciones locales no sustituyen el CI remoto ni la aceptación funcional
con servicios reales. Consultar también la [guía de OAuth](OAUTH_PRODUCCION.md)
y la [guía de aceptación manual](PLAN_PRUEBAS_DP.md).
