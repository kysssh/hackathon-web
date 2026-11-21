# Estado del proyecto y criterio de despliegue

Actualizado el 21 de noviembre de 2026. Revisión local en `develop`, commit base
`75ba309`. El árbol contiene cambios locales sin confirmar. La aplicación compila
localmente, pero todavía no se debe declarar lista para producción: faltan la
aceptación manual y la comprobación de los servicios y del despliegue reales.

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
| `npm test` | Correcto; 18 pruebas, 18 aprobadas. |
| `npm run lint` | Correcto. |
| `npm run build` | Correcto; compilación de producción y generación de rutas. |

El `npm ci` del workflow remoto del commit `75ba309` está registrado en informes
anteriores como fallido por discrepancias del lockfile. No se consultó GitHub CI
durante esta revisión; se debe subir el lockfile local y confirmar un workflow
verde.

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

- La configuración actual declara fechas y reglas del evento oficiales, pero no
  se verificaron con la organización en esta revisión.
- `PLAN_Roles_Hackathon_v3.md` conserva la regla histórica de equipos de 2 a 5;
  la configuración y las páginas actuales indican exactamente 4. Se requiere
  confirmar la regla y actualizar el documento maestro si corresponde.
- No se ejecutó la semilla ni se probaron migraciones contra una base; tampoco se
  comprobó OAuth interactivo, buckets/políticas de Supabase Storage, concurrencia
  ni configuración de Vercel/dominio.
- Las 18 pruebas son unitarias de reglas. `e2e/` sigue sin pruebas automatizadas;
  completar el recorrido manual con participante, jurado y organizador según
  [la guía de aceptación](PLAN_PRUEBAS_DP.md).
- Revisar `NEXTAUTH_URL`, callbacks OAuth, variables protegidas y smoke test en el
  dominio definitivo antes de publicar.

Las verificaciones locales no sustituyen el CI remoto ni la aceptación funcional
con servicios reales. Consultar también la [guía de OAuth](OAUTH_PRODUCCION.md)
y la [guía de aceptación manual](PLAN_PRUEBAS_DP.md).
