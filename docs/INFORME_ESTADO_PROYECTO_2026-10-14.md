# Informe del estado del proyecto

Fecha: 14 de octubre de 2026, Lima. Referencia: `PLAN_Roles_Hackathon_v3.md`, secciones 3, 4, 6 y 8.

## Diagnóstico

El proyecto tiene implementado el recorrido principal y pantallas previstas hasta la semana 4. Está en fase de integración y validación; todavía no hay evidencia suficiente para declararlo listo para producción. El mayor pendiente observable es la verificación del flujo con servicios reales y la preparación de pruebas y despliegue.

Este informe evalúa entregables del repositorio, no el desempeño de personas: el plan no tiene los nombres de los integrantes asignados. No se asignan porcentajes porque mezclar código presente, pruebas aprobadas y servicios configurados produciría una cifra engañosa.

## Estado técnico y Git

- En esta sesión terminaron correctamente `npm run lint`, `npm run typecheck` y `npm run build`. El build validó TypeScript y generó las rutas. No demuestra que las rutas dinámicas funcionen con usuarios y servicios reales.
- En la consulta de Git para este informe el árbol estaba limpio, sin merge pendiente. Rama: `develop`; commit: `fcd4b92` (`Resuelve conflictos e integra correcciones del proyecto`). No se mostraba adelanto ni atraso frente a la referencia local `origin/develop`; no se hizo fetch para certificar el estado remoto más reciente.
- El plan establece trabajo y entrega en `main`. Debe confirmarse la integración de `develop` en la rama de entrega y cuál publica Vercel. Este informe no realizó merges ni publicación.
- La consulta de etiquetas locales no mostró `v1.0.0`; no se consultaron etiquetas remotas.
- Se corrigieron el conflicto del botón de salida, los tipos generados con la ruta antigua del jurado, validación HTTP/HTTPS, fecha de envío en Lima y reenvío dentro del plazo.
- El build necesitó una caché nueva por EPERM al limpiar `.next/static`. La caché anterior se conservó en `.next-review-backup-20261014`, excluida de Git, lint y tipos. No se certifica que el bloqueo de Windows no vuelva a ocurrir.

## Funcionalidad disponible en código

| Flujo | Evidencia local | Validación pendiente |
| --- | --- | --- |
| Ingreso y roles | Auth.js, Google/GitHub, sesión, guardas y navegación por rol. | Login real con ambos proveedores y cada rol en el dominio final. |
| Equipos | Crear/unirse, código, integrantes, restricciones y datos reales mediante Prisma. | Casos de la sección 7 y concurrencia contra BD de desarrollo. |
| Proyecto | Borrador, pendientes, campos faltantes, envío y reenvío por líder. | Recorrido con varias cuentas, cierre y consistencia tras editar. |
| Archivos | Token firmado, subida directa a Storage, progreso, cancelación, confirmación y eliminación. | Buckets, políticas y subida/descarga reales. |
| Jurado | Lista, detalle, evaluación y cálculo ponderado. | Persistencia, actualización de una misma evaluación y bloqueo al cierre. |
| Organización | Promedios, indicadores, publicación, equipos, detalle y descarga firmada. | Publicar/despublicar y comprobar el efecto público de punta a punta. |
| Sitio público | Inicio, información, cronograma, criterios, FAQ, mentores/jurado, galería y detalle. | Contenido oficial, accesibilidad y revisión visual móvil. |

## Brechas concretas

| Prioridad | Hallazgo | Responsable sugerido | Criterio de cierre |
| --- | --- | --- | --- |
| Alta | No existe suite persistente ni CI en el repositorio: `test`, `e2e` y `.github` contienen placeholders; no hay script de test. | DP, con apoyo de todos | Suite ejecutable y chequeos obligatorios para la rama de entrega. |
| Alta | OAuth, Storage, migraciones y producción no fueron certificados en esta revisión. La nota histórica de buckets vacíos no confirma su estado actual. | BK + BD + DP | Registro del flujo real con participante, jurado y organizador en el despliegue. |
| Alta | `DraftForm` no pasa a solo lectura al cierre: su botón depende de `pending`. Envío y uploader dependen del estado recibido al renderizar; no actualizan automáticamente al vencer el plazo con la página abierta. El backend sí contiene rechazo por cierre. | FE + BK | Pantalla abierta antes del cierre se bloquea al vencer y el servidor rechaza operaciones tardías. |
| Alta | Fechas y límites del evento, y escala de notas, están marcados como provisionales. | BK + organización | Configuración confirmada y registrada antes de producción. |
| Media | Falta biblioteca completa de componentes exigida en S1 y la página `/dev/ui`; FE usa elementos de formulario propios. | UX + FE | Catálogo del plan disponible y reutilizado. |
| Media | No se encontraron sitemap ni robots del plan. Hay metadatos y estados de error/404 parciales. | UX + DP | Archivos publicados, exclusión de rutas privadas y revisión de errores públicos. |
| Media | La FAQ presenta repositorio/demo/video como entregables obligatorios, pero `computeMissingFields` exige título, resumen, descripción y pitch. | UX + BK + organización | Acordar obligatoriedad y alinear texto, formulario y servidor. |
| Media | FAQ repite pesos, escala, integrantes y límite de PDF; el borrador duplica límites del servidor. | UX + FE + BK | Contenido y validaciones derivados de configuración compartida. |
| Media | La pantalla del líder no recibe nuevas membresías automáticamente por cambios hechos desde otra cuenta; refrescar después de la acción del usuario no equivale a sincronización entre usuarios. | FE + BD | Prueba de incorporación desde otra cuenta y actualización sin recarga manual. |
| Media | El lint restringe `lib/db` en `src/app`, pero no cubre componentes ni todas las importaciones directas posibles de Prisma. No se encontraron imports directos de BD/Prisma en la búsqueda sobre páginas y componentes. | DP | Reglas que impidan las infracciones en ambos lugares. |

## Cumplimiento del contrato

- Están presentes las 10 consultas y las 12 acciones de la sección 3.4, además de las funciones de sesión.
- Los módulos de consultas usan `server-only`; los de acciones usan `use server`. Los DTO convierten fechas a ISO en las consultas revisadas.
- La subida de archivos está implementada directamente desde el navegador; no es una simulación pendiente.
- Hay desviaciones de ubicación: utilidades como `actions.ts`, `errors.ts`, `dates.ts`, `clock.ts`, `env.ts` y `error-messages.ts` están en `src/`, mientras el plan las ubica en `src/lib/`. La aplicación compila, pero debe actualizarse el contrato o acordarse la ubicación antes de más cambios.
- Las consultas adicionales de organización amplían la interfaz descrita en el plan. Conviene registrar esa ampliación y su responsabilidad BD/BK.
- El texto de publicación debe explicar que despublicar finalistas mientras los resultados siguen publicados no oculta necesariamente su distintivo: la consulta considera públicos los finalistas si hay finalistas o resultados publicados.

## Orden de cierre propuesto

1. DP prepara guion y pruebas reproducibles; BK/BD verifican proveedores, BD y Storage de desarrollo.
2. FE completa bloqueo temporal y actualización del equipo; UX/BK acuerdan contenido y obligatoriedad de enlaces.
3. Ejecutar crear equipo → unirse → borrador → archivo → envío → evaluación → publicación → galería, con los tres roles.
4. UX completa catálogo y SEO, y registra revisión de teclado, 360 px, 1280 px y celular real.
5. BD/DP preparan producción sin fixtures, verifican OAuth en dominio final, rama de despliegue y etiqueta final.

La entrega final de la sección 8 continúa pendiente de evidencia. No se modificaron las casillas del plan para dar por aprobados trabajos no verificados.
