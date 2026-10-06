# Plataforma Web del Hackathon

Aplicación para gestionar equipos, proyectos, entregas, evaluaciones y una galería pública. Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Auth.js, Prisma 7 y PostgreSQL/Supabase.

## Estado por rol

Revisión del **6 de octubre de 2026**, basada en el código local y el [plan de roles](PLAN_Roles_Hackathon_v3.md). Incluye cambios locales aún sin commit; implementación no implica validación en producción.

| Rol | Implementado | Pendiente |
| --- | --- | --- |
| **BD — Base de datos** | Esquema de 8 tablas, dos migraciones, cliente Prisma, semilla y todas las consultas reales de equipo, proyecto, evento, galería, jurado y organización. | Verificar migración de producción sin fixtures y rendimiento de consultas. |
| **DP — Despliegue y pruebas** | Proyecto base, ESLint/Prettier, utilidades de acciones, errores, fechas, reloj y entorno; `.env.example`. | Pruebas automatizadas y guion manual: `test/`, `e2e/` y `.github/` solo contienen `.gitkeep`. Confirmar Vercel, dominio, variables de producción y entrega final. |
| **BK — Backend** | Auth.js con Google/GitHub, adaptador Prisma, roles y membresía real; acciones de crear/unirse a equipo, guardar borrador, autorizar/confirmar/eliminar archivos, enviar proyecto y guardar evaluación, con validaciones y permisos. | Acciones de organización aún devuelven respuestas ficticias. Configurar buckets y validar el flujo completo con OAuth y Storage reales. |
| **FE — Frontend** | `/ingresar`, layout privado con sesión y roles, `/panel`, creación/unión de equipos y formulario de borrador con validación; estados generales de carga/error. | Subida de archivos y envío desde las pantallas, lista/detalle y evaluación del jurado, panel completo de organización. `/jurado` y `/organizacion` son pantallas iniciales. |
| **UX — Diseño y páginas públicas** | Estilos globales y mensajes de error en español. | Componentes reutilizables (`components/ui/`) y contenido (`content/`) aún vacíos; páginas informativas, galería, insignias, metadatos, sitemap, robots y revisión de accesibilidad. `/` redirige a `/ingresar`. |

Las fechas y límites del evento siguen siendo provisionales en `src/config/event.ts`. Los pesos de evaluación son 25 % innovación, 30 % tecnología, 25 % impacto y 20 % presentación.

**Integración pendiente:** según la [revisión de Storage](src/lib/storage/README.md), faltan los buckets `entregables` (privado) y `portadas` (público). Las comprobaciones controladas de backend no certifican todavía el recorrido completo desde las pantallas. La guía de BD conserva notas antiguas sobre autenticación: el código actual ya persiste usuarios/cuentas y consulta la membresía real.

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

Estos son los comandos disponibles; no se ejecutaron durante esta actualización documental. No hay un script `npm test` configurado.

- [Plan y tareas de los cinco roles](PLAN_Roles_Hackathon_v3.md).
- [Configuración de BD y semilla](prisma/README.md).
- [Diccionario de datos](docs/data-dictionary.md).
- [Contrato de archivos, configuración y verificaciones de backend](src/lib/storage/README.md).
