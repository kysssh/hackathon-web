# Plataforma Web del Hackathon

Aplicación para gestionar equipos, proyectos, entregas, evaluaciones y una galería pública. Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Auth.js, Prisma 7 y PostgreSQL/Supabase.

## Revisión del 14 de octubre de 2026

Esta revisión sustituye el diagnóstico histórico del 13 de octubre que se conserva abajo.

Se corrigieron las marcas de un conflicto Git en `sign-out-button.tsx`, que provocaban TS1185 y un error de parsing de ESLint. La ruta del jurado ya está renombrada a `[projectId]`, pero la caché de desarrollo aún referenciaba `[projectld]`: `typecheck` ahora ejecuta `next typegen` antes de TypeScript y excluye `.next/dev`, usando las definiciones regeneradas en `.next/types`.

También se alineó la validación de enlaces del borrador con HTTP/HTTPS del servidor, se usa `formatEventDate` para mostrar el envío en hora de Lima y se permite reenviar desde la pantalla dentro del plazo, como ya permite el backend. Se corrigió el aviso que decía que el envío impedía editar.

| Rol | Estado comprobable en el código frente al plan v3 | Pendiente de entrega |
| --- | --- | --- |
| BD | Esquema, migraciones, semilla y consultas reales de semanas 1–3 presentes. | Comprobar idempotencia, rendimiento y base de producción sin datos de prueba. |
| BK | Acciones de equipos, borrador, archivos, envío, evaluación y organización presentes, cubriendo implementación de semanas 1–4. | Validar OAuth interactivo, Storage y concurrencia con servicios reales. |
| FE | Panel, equipos, proyecto, subida real con progreso/reintento, jurado y pantallas de organización presentes. | El bloqueo visual al vencer el plazo con la página abierta depende de datos renderizados: falta actualización automática. Validar flujo completo y estados. |
| UX | Inicio público, páginas informativas, galería, detalle e insignias presentes. | Faltan catálogo completo de componentes y `/dev/ui`, `sitemap` y `robots`; confirmar contenido y revisar accesibilidad/móvil. |
| DP | Base y herramientas de lint, tipos y build presentes. | `test`, `e2e` y `.github` solo contienen placeholders: faltan suite persistente, CI y guion manual aprobado; verificar Vercel, producción y versión final. |

El proyecto tiene implementaciones de semanas 3 y 4, pero no se puede dar por terminada ninguna semana completa solo por la presencia del código. Fechas y límites siguen siendo provisionales. No se comprobó en esta revisión el estado actual de los buckets, OAuth ni el despliegue, y no se ejecutaron migraciones o semilla sobre bases externas.

Verificación local: `npm run build` terminó correctamente, incluyendo TypeScript y generación de páginas. Inicialmente Windows devolvía EPERM al limpiar `.next/static`; se conservó la caché antigua en `.next-review-backup-20261014` y se compiló con una caché nueva. El respaldo se excluye de Git, ESLint y TypeScript. Git ya reconoce como resuelto el conflicto del botón; no se creó commit ni se hizo push.

## Estado histórico por rol (13 de octubre; sustituido por la revisión anterior)

Revisión del **13 de octubre de 2026**, basada en el código local y el [plan de roles](PLAN_Roles_Hackathon_v3.md). Implementación no implica validación en producción.

| Rol | Implementado | Pendiente |
| --- | --- | --- |
| **BD — Base de datos** | Esquema de 8 tablas, dos migraciones, cliente Prisma, semilla y las 10 consultas reales de equipo, proyecto, evento, galería, jurado y organización. | Verificar semilla idempotente, migración de producción sin fixtures y rendimiento de consultas. Coordinar buckets con DP. |
| **BK — Backend** | Auth.js con Google/GitHub, roles y sesión; acciones reales de equipos, borrador, archivos, envío y evaluación. Semana 4: acciones reales para visibilidad, finalistas, ganadores y publicación/despublicación. Revisión de acceso de las 12 acciones del contrato. | Validar OAuth, Storage, concurrencia y flujo completo con servicios reales; confirmar puntajes con FE y corregir lo que salga en la prueba final. |
| **FE — Frontend** | Ingreso, layout privado, panel, equipos y borrador; controles de archivos, confirmación de envío y lista/formulario de jurado. | Reemplazar la subida simulada por la real. Corregir carpeta del jurado: se llama [projectld] pero la página lee projectId. Implementar organización, detalle de proyectos, equipos y publicación. Revisar fechas, estados y bloqueo al cierre. |
| **UX — Diseño y páginas públicas** | Estilos globales y mensajes de error en español. | components/ui y content siguen vacíos; construir inicio público, páginas informativas, galería y detalle, insignias, metadatos, sitemap y robots; verificar accesibilidad y celular. La raíz redirige a ingresar. |
| **DP — Despliegue y pruebas** | Proyecto base, ESLint/Prettier, utilidades comunes y .env.example. | test, e2e y .github solo contienen .gitkeep. Crear guion manual y pruebas automáticas; verificar Vercel, variables, dominio, producción y etiqueta v1.0.0. Completar restricciones de lint del contrato. |

Las fechas y límites del evento siguen siendo provisionales en src/config/event.ts. Los pesos de evaluación son 25 % innovación, 30 % tecnología, 25 % impacto y 20 % presentación.

**Organización (BK, semana 4):** ambas acciones conservan el contrato de entrada y devuelven { ok: true, data: {} } mediante createAction. Solo aceptan ORGANIZER; participantes y jurados reciben FORBIDDEN. No se puede activar visibilidad, finalista o ganador en un borrador (PROJECT_NOT_SUBMITTED). Los cambios parciales conservan campos omitidos. Publicar de nuevo conserva la fecha, despublicar la borra y volver a publicar asigna una nueva. Se usan transacciones y bloqueos de fila, y se invalidan las rutas afectadas. La galería existente considera públicos los finalistas cuando hay finalistas o resultados publicados; despublicar solo finalistas mientras los resultados sigan publicados conserva esa regla de BD.

**Borradores y autenticación (BK):** el guardado del borrador usa una transacción con bloqueos en orden equipo/proyecto, vuelve a comprobar el cierre después de esperar e invalida las pantallas dependientes. Los enlaces solo aceptan HTTP/HTTPS. El adaptador de Auth.js adapta `updateUser` al esquema sin `emailVerified` y devuelve `getAccount` con los campos OAuth en snake_case; el ingreso usa `/ingresar`.

**Verificaciones registradas:** la [guía de Storage](src/lib/storage/README.md) documenta 62 casos de acciones contra PostgreSQL real en una única transacción revertida, con sesión, reloj, caché y Storage controlados, además de una regresión del cierre durante la espera de un bloqueo y comprobaciones controladas del adaptador OAuth. La revisión inicial de organización registró 20 casos con Prisma simulado. Estas comprobaciones no constituyen una suite automatizada persistente ni certifican OAuth interactivo, archivos reales en Storage, concurrencia entre transacciones independientes o producción.

**Comprobación actual del repositorio:** `npm run lint` terminó sin errores ni advertencias y `git diff --check` no detectó errores de espacios. `npm run typecheck` falló por errores de sintaxis en los archivos generados `.next/dev/types/routes.d.ts` y `.next/dev/types/validator.ts`. Aunque la revisión previa mediante la API de TypeScript no registró diagnósticos, el comando actual no pasa; queda pendiente regenerar los tipos de Next.js y repetirlo. No se ejecutó build en esta revisión.

**Integración pendiente:** la revisión de Storage del 13 de octubre registra HTTP 200 con una lista de buckets vacía; BD/DP deben crear `entregables` (privado) y `portadas` (público). El uploader de FE todavía simula la subida y la ruta del jurado conserva el nombre `[projectld]` mientras la página lee `projectId`. Faltan las pantallas completas de organización y las páginas públicas. La guía de BD conserva notas antiguas sobre autenticación: el código actual ya persiste usuarios/cuentas y consulta membresía real.

## Desarrollo local

Con Node.js 24 LTS y npm:

```powershell
npm ci
Copy-Item .env.example .env
```

Completa `.env` con la conexión PostgreSQL de desarrollo, las variables Supabase, las credenciales OAuth, `AUTH_SECRET` y las listas de correos para roles. Luego:

```bash
npx prisma migrate deploy
npx prisma generate
npm run db:seed
npm run dev
```

Abre [localhost:3000](http://localhost:3000). La semilla es solo para desarrollo: crea usuarios, equipos, proyectos y evaluaciones ficticios; no crea cuentas OAuth ni archivos en Storage. Los correos `@prueba.test` no son credenciales de ingreso.

## Comprobaciones y documentación

```bash
npm run lint
npm run typecheck
npm run build
```

Estos son los comandos disponibles. En esta revisión se ejecutaron lint completo y typecheck, con los resultados indicados arriba. No se ejecutó build. No hay un script `npm test` configurado.

- [Plan y tareas de los cinco roles](PLAN_Roles_Hackathon_v3.md).
- [Configuración de BD y semilla](prisma/README.md).
- [Diccionario de datos](docs/data-dictionary.md).
- [Contrato de archivos, configuración y verificaciones de backend](src/lib/storage/README.md).
