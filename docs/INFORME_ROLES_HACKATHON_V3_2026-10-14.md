# Informe de avance por roles frente al plan v3

Fecha: 14 de octubre de 2026. Base: inspección local del código y `PLAN_Roles_Hackathon_v3.md`.

“Implementado” significa que existe una implementación conectada en el repositorio. “Por validar” significa que falta evidencia de aceptación con datos, usuarios o despliegue reales. No significa necesariamente que el equipo no haya hecho ese trabajo fuera del repositorio. Una semana solo se cierra al demostrar sus verificaciones, no al existir sus archivos.

## Resumen por semana

| Rol | Semana 1 | Semana 2 | Semana 3 | Semana 4 |
| --- | --- | --- | --- | --- |
| BD | Esquema y consultas presentes; Supabase por comprobar. | Semilla y consultas reales presentes; idempotencia por validar. | Consultas reales presentes; aceptación y rendimiento por validar. | Producción y optimización no acreditadas. |
| BK | Auth, sesión, roles y acciones presentes; OAuth por validar. | Equipos y borrador implementados. | Archivos, envío y evaluación implementados; integración real por validar. | Acciones de organización implementadas; revisión final por validar. |
| UX | Estilos y errores presentes; catálogo incompleto. | Páginas y navegación presentes; contenido oficial y accesibilidad pendientes. | Galería y detalle implementados; recorrido real por validar. | Insignias/metadatos y algunos errores presentes; SEO y QA pendientes. |
| FE | Ingreso, layout y panel implementados; componentes compartidos incompletos. | Equipos y borrador implementados; actualización entre usuarios pendiente. | Subida real y jurado presentes; bloqueo visual al cierre incompleto. | Organización implementada; flujo real y estados por validar. |
| DP | Herramientas y utilidades presentes; despliegue no acreditado. | No se encontró guion ni suite persistente. | Flujo completo con tres roles no acreditado. | Producción y etiqueta final no acreditadas. |

## BD — Base de datos

**Avance:** implementación principal de semanas 1–3 presente; semana 4 pendiente de acreditar.

| Semana | Evidencia | Falta para cerrar |
| --- | --- | --- |
| 1 | `prisma/schema.prisma` contiene los ocho modelos del contrato; hay dos migraciones, `src/lib/db.ts` y las diez consultas. | Comprobar proyectos dev/prod, migración aplicada y revisión del esquema con BK. |
| 2 | `prisma/seed.ts` contiene usuarios, equipos y códigos del plan. Consultas reales de equipo, proyecto, evento y equipos del organizador. | Ejecutar seed dos veces sobre desarrollo y comprobar DTO y pantalla con cuentas reales. El uso de upsert sugiere intención de idempotencia, no la certifica. |
| 3 | Galería filtra enviados y visibles; jurado también. Organización ordena por promedio y deja sin notas al final. Detalle público selecciona nombre/imagen de integrantes sin correos. Semilla incluye proyectos y evaluaciones. | Confirmación UX/FE y casos reales de filtros, insignias y notas. |
| 4 | Migraciones disponibles para despliegue. | Migración prod sin fixtures, medición de consultas y prueba final con DP. |

**Siguiente entrega:** acta de seed repetido, estado de migraciones, datos de prueba verificados y medición de `/galeria` con el límite de tres consultas del plan. Revisar consultas repetidas de sesión/membresía sin asumir su coste real antes de medir.

**Dependencias:** DP para entornos y producción; BK para contrato y reglas; UX/FE para aceptación de DTO.

## BK — Backend

**Avance:** las funciones principales de las cuatro semanas están implementadas; falta certificar integración y permisos de punta a punta.

| Semana | Evidencia | Falta para cerrar |
| --- | --- | --- |
| 1 | Configuración Auth.js Google/GitHub, roles por correo, sesión, guardas, acciones y configuración compartida. | Login interactivo de ambos proveedores, persistencia de cuentas y roles en dominio real. |
| 2 | Crear/unirse a equipo, reglas de códigos y límites, borrador y campos faltantes. | Ejecutar y registrar todos los casos de la sección 7, incluyendo concurrencia. |
| 3 | Autorización y confirmación de subida, eliminación, validación de archivos, envío por líder y evaluación mediante upsert. Pesos compartidos 25/30/25/20. | Subida real a los dos buckets, archivo aceptado/rechazado, cierre temporal, misma evaluación guardada dos veces y comparación con FE. |
| 4 | Acciones de indicadores y publicación/despublicación con acceso ORGANIZER, validación de proyecto entregado y transacciones. | Matriz de permisos con tres roles y aceptación de publicar/despublicar observando la galería. |

La guía histórica de Storage registra comprobaciones controladas; no reemplaza una suite persistente ni prueba OAuth interactivo o Storage real. La existencia del código de permisos tampoco acredita que todos los casos hayan pasado en producción.

**Siguiente entrega:** evidencia reproducible del flujo real, matriz de permisos, acuerdo sobre obligatoriedad de repositorio/demo/video y fechas/escala confirmadas con organización.

**Dependencias:** BD para migraciones y datos; FE para integración; DP para configuración OAuth/Storage y pruebas.

## UX — Diseño y páginas públicas

**Avance:** sitio público y galería presentes; queda deuda de componentes de semana 1 y acabado de semana 4.

| Semana | Evidencia | Falta para cerrar |
| --- | --- | --- |
| 1 | Estilos globales, componentes de navegación/estructura, countdown y mensajes para todos los códigos actuales. | Biblioteca completa Button, Input, Textarea, Card, Badge, Dialog, Toast, Table, EmptyState, Skeleton y Accordion; `/dev/ui`; evidencia de bocetos y revisión 360/1280. |
| 2 | Inicio, header con menú móvil, footer, páginas informativas, cronograma, criterios, FAQ y contenido en `src/content/public.ts`. | Confirmar contenido real: mentores/jurado anuncian perfiles por confirmar. Evitar repetir configuración en textos y probar teclado. |
| 3 | Galería con `ver`/`q`, consultas del contrato, detalle, enlaces/video como enlace externo, integrantes, vacíos y 404 de detalle. | Recorrido con proyectos reales, URL compartida y confirmación de cómo se espera presentar el video. |
| 4 | Insignias y título de ganador condicionados por publicación; metadatos, error de galería y 404 de detalle. | Sitemap, robots, cobertura de errores públicos y revisión móvil/accesibilidad completa. |

**Siguiente entrega:** catálogo para FE, SEO mínimo y contenido coherente con las reglas del servidor. La FAQ declara repositorio/demo/video obligatorios, aunque el servidor no los considera campos faltantes para enviar; resolverlo con BK/organización.

**Dependencias:** BK para configuración oficial; BD para contenido de galería; FE para reutilizar componentes; DP para QA.

## FE — Frontend privado

**Avance:** todas las rutas privadas del plan están presentes, incluida organización de semana 4; faltan ajustes de comportamiento y validación.

| Semana | Evidencia | Falta para cerrar |
| --- | --- | --- |
| 1 | Ingreso por proveedores, layout con sesión, navegación por rol, salida y panel con equipo/pendientes. | Probar redirecciones y menú con cada rol; completar reutilización de componentes UX. |
| 2 | Crear/unirse, tarjeta de integrantes/código, formulario con validación local, contador y campos faltantes; panel con los cinco pendientes. | Actualizar tarjeta del líder cuando alguien se une desde otra cuenta sin recarga manual. Alinear límites duplicados y detalles de validación con BK. |
| 3 | Uploader real con validación previa, progreso, cancelación/reintento y confirmación; envío por líder y reenvío; jurado con lista y evaluación. Ruta `[projectId]` corregida. | `DraftForm` no bloquea al cerrar. Uploader/envío no actualizan automáticamente el estado temporal de una página ya abierta. Validar notas, permisos y fallos reales de red/Storage. |
| 4 | Tabla de organización con notas e indicadores; detalle con evaluaciones/descargas/título; equipos; publicar/despublicar con confirmación. Loading/error privado compartidos y varios estados vacíos. | Demostrar cambios visibles en galería y comprobar carga, vacío y error en todas las pantallas. Aclarar aviso de despublicar finalistas cuando resultados siguen públicos. |

**Siguiente entrega:** modo de lectura completo al cierre, actualización temporal y del equipo, y recorrido de aceptación con participante, jurado y organizador.

**Dependencias:** UX para componentes; BK para errores y reglas; BD para refresco de datos; DP para pruebas.

## DP — Despliegue y pruebas

**Avance:** infraestructura local de semana 1 presente; es el área con más entregables no acreditados en el repositorio.

| Semana | Evidencia | Falta para cerrar |
| --- | --- | --- |
| 1 | Next.js, TypeScript, ESLint/Prettier, utilidades comunes y `.env.example`. Lint restringe importación de BD desde `src/app`. | Vercel y acceso del equipo verificados; ampliar restricción a componentes/Prisma y acordar ubicaciones distintas de las del plan. |
| 2 | Lint, tipos y build pasaron durante esta sesión. | Guion manual de diez pasos, pruebas de inicio/redirección y ejecución reproducible en CI. `test`, `e2e`, `.github` solo tienen placeholders. |
| 3 | Hay notas históricas de comprobaciones controladas de backend. | Recorrido completo con tres cuentas, límite temporal, móvil y registro de defectos con responsables. |
| 4 | `/api/dev/whoami` devuelve 404 si NODE_ENV es production; `clock.ts` usa hora real sin override de prueba. | Verificar comportamiento desplegado, variables/dominio/OAuth, migración sin seed, aceptación de organización y `v1.0.0`. No hay etiquetas locales en la consulta realizada. |

**Siguiente entrega:** guion, suite mínima y CI; coordinar la prueba completa y documentar rama de despliegue (`develop` actual frente a `main` exigido por el plan).

**Dependencias:** todos los roles para aceptación; BD para producción; BK para secretos y proveedores. No publicar valores de secretos en informes.

## Cierre del plan

No se acreditan aún las siete condiciones finales de la sección 8. Compilar localmente está comprobado, pero falta certificar `main` y producción, proveedores, base sin fixtures, configuración oficial, guion aprobado y versión final. Las casillas vacías del plan deben actualizarse con evidencia, sin confundirlas con ausencia automática de implementación.

Consultar también [informe general](INFORME_ESTADO_PROYECTO_2026-10-14.md), que concentra brechas y orden propuesto de cierre.
