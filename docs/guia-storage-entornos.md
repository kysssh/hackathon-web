# Guía paso a paso: buckets de Supabase y entornos dev/prod

Revisada el **13 de octubre de 2026** para la rama `feat/database-week-4`,
actualizada con `develop`. Esta guía no contiene contraseñas ni claves reales.

El objetivo es configurar Storage en desarrollo, comprobar que funciona y
repetir la configuración en producción cuando el equipo lo acuerde. El estado
del trabajo y los pendientes se reúnen en la sección final
[Pendientes de la semana 4](#pendientes-de-la-semana-4).

## 1. Identifica el proyecto correcto

Abre Supabase y usa estos enlaces para evitar confundir los proyectos:

| Entorno | Proyecto | Referencia | Storage |
| --- | --- | --- | --- |
| Desarrollo | `hackathon-dev` | `wnkbvhqsyxrsipavingr` | [Abrir dev](https://supabase.com/dashboard/project/wnkbvhqsyxrsipavingr/storage/buckets) |
| Producción | `hackathon-prod` | `mktizbbkdhcjpfndaxwv` | [Abrir prod](https://supabase.com/dashboard/project/mktizbbkdhcjpfndaxwv/storage/buckets) |

Comprueba el proyecto en la cabecera y su referencia en la URL antes de crear
cualquier recurso. Necesitas una cuenta invitada con permisos para administrar
Storage y consultar la configuración del proyecto.

En la revisión de esta conversación del 13 de octubre, ambos proyectos devolvieron
una lista de buckets vacía. Si ahora aparecen buckets, revisa su configuración
antes de crear otros: los nombres deben coincidir exactamente con el código.

Los buckets pueden llamarse igual en dev y prod: cada proyecto conserva sus
propios objetos. Aquí usamos dos proyectos separados, no carpetas `dev/` y
`prod/` dentro de un único bucket.

## 2. Crea `entregables` en desarrollo

1. Abre **Storage** en `hackathon-dev`.
2. Pulsa **New bucket / Nuevo bucket**.
3. Escribe `entregables` en minúsculas, sin espacios. Si pide ID y nombre, usa
   `entregables` para ambos.
4. Deja **Public bucket** desactivado: debe ser **privado**.
5. Guarda. En la creación o en la configuración del bucket, activa las
   restricciones de tamaño y tipos MIME. El nombre de ese menú puede variar
   según la versión del Dashboard.
6. Configura el límite equivalente a **26 214 400 bytes** (25 × 1024 × 1024).
7. Permite exactamente estos tipos, como entradas separadas o una lista según
   el formulario:

   ```text
   application/pdf
   application/zip
   image/png
   image/jpeg
   ```

8. Guarda y vuelve a abrir la configuración para comprobar que quedó persistida.

Este bucket recibe los archivos `PITCH_DECK` y `EXTRA`. La aplicación restringe
el pitch a PDF aunque el bucket también admite los formatos de los archivos extra.
Los valores provienen de `src/config/event.ts` y `src/lib/files/rules.ts`.

Supabase permite crear buckets y limitar las subidas por tamaño y MIME.
[Documentación de creación](https://supabase.com/docs/guides/storage/buckets/creating-buckets).

## 3. Crea `portadas` en desarrollo

Repite el procedimiento con estos valores:

| Campo | Valor |
| --- | --- |
| ID y nombre | `portadas` |
| Public bucket | Activado |
| Tamaño máximo | **5 242 880 bytes** (5 × 1024 × 1024) |
| Tipos MIME | `image/png`, `image/jpeg`, `image/webp` |

Solo guarda aquí imágenes que puedan ser públicas. Quien conozca la URL puede
leer una portada, mientras que un entregable privado necesita acceso autorizado
o una URL temporal firmada. Un bucket público no concede por sí solo permisos de
subida o borrado. [Modelo de acceso](https://supabase.com/docs/guides/storage/buckets/fundamentals).

En **Storage → Settings**, revisa también el límite global de archivos: debe
permitir al menos los 26 214 400 bytes del bucket más grande. Un límite por bucket
no puede superar el global. [Límites de archivos](https://supabase.com/docs/guides/storage/uploads/file-limits).

## 4. Comprueba los valores exactos

En **SQL Editor** del mismo proyecto, ejecuta esta consulta de solo lectura:

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('entregables', 'portadas')
ORDER BY id;
```

Debe devolver dos filas:

| ID | `public` | `file_size_limit` |
| --- | --- | --- |
| `entregables` | `false` | `26214400` |
| `portadas` | `true` | `5242880` |

Verifica también las listas MIME del paso 2 y 3; su orden no importa. Un valor
`null` en el límite o los MIME significa que la restricción no está configurada.
Si el Dashboard muestra MB con otra conversión, usa los bytes de esta tabla
como referencia y confirma el resultado con SQL.

### Alternativa si prefieres crear ambos mediante SQL

En vez de los pasos 2 y 3, puedes ejecutar lo siguiente en **SQL Editor de dev**.
Supabase documenta la creación de buckets mediante SQL. Este bloque crea únicamente
los buckets que faltan; no cambia los ya existentes:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'entregables', 'entregables', false, 26214400,
    ARRAY['application/pdf', 'application/zip', 'image/png', 'image/jpeg']::text[]
  ),
  (
    'portadas', 'portadas', true, 5242880,
    ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
  )
ON CONFLICT (id) DO NOTHING;
```

Después ejecuta la consulta de verificación. Si un bucket ya existe con otros
valores, ajústalo desde el Dashboard; el bloque anterior no lo corrige.

## 5. Revisa permisos para el flujo de esta aplicación

La aplicación inicia sesión con **Auth.js**, no con Supabase Auth. Su cookie no
equivale a un JWT de Supabase y no se puede usar directamente con `auth.uid()`.

Nuestro backend comprueba al usuario, equipo, plazo y archivo. Después usa
`SUPABASE_SECRET_KEY` para generar un token de subida; el navegador lo usa para
subir directamente a Storage. El backend vuelve a comprobar el objeto al confirmar.
La clave secreta permanece en el servidor.

Para este flujo no agregues políticas generales de `INSERT`, `UPDATE` o `DELETE`
para `anon` o para todos los usuarios. Tampoco habilites sobrescritura. La clave
de servidor tiene acceso elevado y el token firmado autoriza la ruta concreta.
[Permisos de Storage](https://supabase.com/docs/guides/storage/security/access-control)
y [claves de Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

Puedes revisar las políticas existentes con esta consulta de solo lectura:

```sql
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

Una lista vacía puede ser correcta para nuestro flujo firmado. Si aparecen
políticas amplias, pide a BK/DP que las revise antes de modificarlas.

## 6. Configura tu aplicación local exclusivamente con dev

Abre PowerShell en la raíz del repositorio. Si no existe `.env`, créalo desde
la plantilla sin sobrescribir una configuración existente:

```powershell
if (-not (Test-Path -LiteralPath '.env')) {
  Copy-Item -LiteralPath '.env.example' -Destination '.env'
}
```

Edita `.env` y coloca **una variable por línea**, sin los prefijos ni horas de
WhatsApp. Este ejemplo tiene marcadores para completar, no credenciales válidas:

```dotenv
DATABASE_URL="CONEXION_POSTGRESQL_DE_HACKATHON_DEV"
DATABASE_ENV="development"
SEED_DATABASE="development"
SUPABASE_URL="https://wnkbvhqsyxrsipavingr.supabase.co"
SUPABASE_PUBLISHABLE_KEY="CLAVE_PUBLICABLE_DE_DEV"
SUPABASE_SECRET_KEY="CLAVE_SECRETA_DE_DEV"
SUPABASE_JWKS_URL="https://wnkbvhqsyxrsipavingr.supabase.co/auth/v1/.well-known/jwks.json"
AUTH_SECRET="SECRETO_ESTABLE_PARA_AUTH_JS_EN_DEV"
AUTH_GOOGLE_ID="CLIENT_ID_GOOGLE"
AUTH_GOOGLE_SECRET="CLIENT_SECRET_GOOGLE"
AUTH_GITHUB_ID="CLIENT_ID_GITHUB"
AUTH_GITHUB_SECRET="CLIENT_SECRET_GITHUB"
ORGANIZER_EMAILS="CORREOS_REALES_DE_ORGANIZADORES"
JUDGE_EMAILS="CORREOS_REALES_DE_JURADOS"
```

Obtén las claves desde **Settings → API Keys** del proyecto dev y la conexión
desde **Connect**. Si el host directo IPv6 no funciona en tu red, usa la conexión
del pooler en modo sesión que muestra Supabase, sin inventar su host o región.
`SUPABASE_URL`, las claves y `DATABASE_URL` deben pertenecer al mismo proyecto.

Mantén `AUTH_SECRET` estable durante las pruebas: las rutas de subida incluyen
una firma que depende de ese valor. BK/DP debe completar las credenciales OAuth
y registrar las URLs callback de localhost en Google/GitHub.

Revisa si tienes `.env.local`, `.env.development.local` o variables exportadas
en PowerShell que sobrescriban los valores. Next.js prioriza esos valores sobre
`.env`, mientras que nuestros comandos Prisma cargan `.env` con `dotenv`.
Para esta guía usa una configuración coherente en `.env` y reinicia el servidor
después de editarla. [Variables de Next.js](https://nextjs.org/docs/app/guides/environment-variables).

`DATABASE_ENV` es una etiqueta de comprobación: no selecciona automáticamente
otro proyecto. `.env.example` es una plantilla; tampoco configura la aplicación.

## 7. Comprueba Storage desde el Dashboard de dev

Esta prueba confirma los buckets, sus restricciones y el acceso a objetos;
todavía no comprueba la integración con la aplicación.

1. Prepara un PNG/JPEG pequeño y un PDF de prueba de unos 5 MB, sin datos personales.
2. Abre `portadas`, crea una carpeta `pruebas-manuales` y sube la imagen.
3. Obtén su URL pública y ábrela en una ventana de incógnito: debe mostrarse.
4. Abre `entregables`, crea la misma carpeta y sube el PDF.
5. Una URL **pública** con ese bucket no debe permitir descargar el PDF sin
   autorización. Una URL firmada temporal sí puede hacerlo; no la confundas
   con una URL pública al probar la privacidad.
6. Intenta subir un archivo que exceda el límite del bucket y otro con MIME no
   permitido: deben rechazarse. Un nombre terminado en `.pdf` no convierte
   un archivo de otro formato en PDF.
7. Borra únicamente los objetos que acabas de subir a `pruebas-manuales` en dev.

Una carga desde el Dashboard no crea una fila en `public.project_files`.
No aparecerá automáticamente en `/panel/proyecto`; eso requiere el flujo de
autorización, subida y confirmación de la aplicación.

## 8. Ejecuta la prueba integrada cuando esté conectada la subida

Antes de probar desde la pantalla, confirma con FE/BK que el uploader ya sube
archivos reales; el requisito se detalla en la sección final.

Con `.env` de dev, prepara la base y arranca la aplicación:

```powershell
npx prisma migrate status
npx prisma generate
npm run dev
```

Si faltan migraciones en **dev**, consulta [la guía de BD](../prisma/README.md).
La semilla es opcional para esta prueba: sus correos `@prueba.test` no permiten
entrar mediante Google/GitHub. Usa una cuenta OAuth real de participante.

1. Entra a `/ingresar` con Google o GitHub.
2. Crea un equipo o únete a uno que no esté lleno en `/panel/equipo`.
3. Guarda un borrador en `/panel/proyecto`.
4. Sube el PDF pequeño como pitch deck y la imagen como portada.
5. Comprueba en Storage dev que aparecieron los objetos, bajo las rutas
   autorizadas del proyecto, y que Storage prod sigue sin esos objetos.
6. Comprueba que la pantalla muestra los archivos incluso tras recargar.
7. En **Table Editor → project_files**, verifica sus referencias, tipo, tamaño
   y nombres de bucket. El binario está en Storage, no en PostgreSQL.
8. Usa **Quitar** para eliminar un archivo de prueba y comprueba que desaparecen
   tanto su referencia como el objeto. Si solo desaparece la fila, revisa con BK
   los mensajes de objeto pendiente de limpieza.

Prueba también la validación de un PDF de 26 MB y una portada demasiado grande:
la pantalla debe avisar antes de subir. Al 13 de octubre, el plazo de entrega
configurado todavía no está abierto; puedes probar borrador y archivos antes
del cierre, pero enviar el proyecto es una prueba diferente.

## 9. Separa los entornos en Vercel con DP

En el proyecto de Vercel, abre **Settings → Environment Variables** y asigna
cada valor al entorno correcto:

| Variables | Development / Preview | Production |
| --- | --- | --- |
| `DATABASE_URL`, `SUPABASE_URL`, claves y JWKS | Valores de `hackathon-dev` | Valores de `hackathon-prod` |
| `DATABASE_ENV` | `development` | `production` |
| `SEED_DATABASE` | Sin activar en despliegues | Sin definir |
| `AUTH_SECRET` | Secreto estable de pruebas | Secreto estable distinto para prod |
| OAuth | Credenciales y callbacks de pruebas | Credenciales/callbacks del dominio real |
| URL/clave publicable de navegador, si FE las incorpora | Dev | Prod |

No asignes accidentalmente un secreto de producción a los tres entornos.
En Preview, Vercel puede ejecutar una compilación con `NODE_ENV=production`:
eso no significa que deba usar la base prod; la conexión efectiva la determina
`DATABASE_URL`. No fuerces `NODE_ENV=preview` ni ejecutes la semilla durante builds.

Tras cambiar variables, genera un nuevo despliegue. En particular, las variables
`NEXT_PUBLIC_*` quedan incorporadas durante la compilación. Verifica también
que la rama de producción configurada por DP sea la prevista.
[Variables por entorno en Vercel](https://vercel.com/docs/environment-variables).

## 10. Repite la configuración de buckets en prod cuando corresponda

1. Coordina el paso con DP y abre el enlace de `hackathon-prod` del paso 1.
2. Crea los mismos dos buckets, con los mismos nombres, límites y MIME.
3. Ejecuta allí las consultas de verificación de buckets y políticas.
4. Conserva los buckets de producción sin fixtures ni copias de archivos de dev.
5. Completa la configuración de variables Production del paso 9.

Este paso configura Storage. Para migrar PostgreSQL, sigue el procedimiento
acordado con BD/DP en [el diagnóstico de producción](../prisma/PRODUCTION.md).

## 11. Si algo falla, localiza en qué paso

| Síntoma | Revisión |
| --- | --- |
| Bucket no encontrado | Nombre exacto y `SUPABASE_URL` del proyecto correcto. |
| HTTP 401/403 al autorizar | Clave secreta vigente del mismo proyecto; permisos del backend y políticas. |
| `FILE_NOT_UPLOADED` | El uploader puede seguir simulado, la subida falló o la ruta cambió antes de confirmar. |
| `FILE_TYPE_NOT_ALLOWED` / rechazo de Storage | MIME real y restricciones del bucket y del backend. |
| `FILE_TOO_LARGE` con tamaño aparentemente permitido | Límite global, límite del bucket y bytes exactos. |
| `FILE_LIMIT_REACHED` | Ya existe un pitch/portada; eliminar el anterior antes de reemplazarlo. |
| `FORBIDDEN` al confirmar | Sesión/equipo correctos, misma ruta/metadatos y `AUTH_SECRET` estable. |
| Archivos aparecen en otro entorno | Variables mezcladas o `.env.local`/Preview sobrescribiendo la configuración. |
| No aparece en la galería | Además de la portada, el proyecto debe estar enviado y visible. |

Al reportar un fallo comparte el entorno, el paso y el mensaje, sin claves ni
tokens firmados. Puedes cerrar la configuración de dev cuando: existen los dos
buckets con valores correctos, las pruebas del Dashboard pasan y, tras la
integración de FE, autorización → subida → confirmación → eliminación funciona.

## Pendientes de la semana 4

Configurar los buckets es una parte de la entrega. A continuación se distingue
lo que ya verificamos en desarrollo de lo que falta para cerrar la semana 4
de BD y la integración con el equipo. Estado basado en las revisiones del
11 al 13 de octubre de 2026; actualizarlo cuando se completen las tareas.

### Lo que ya está verificado

- Desarrollo tiene las tres migraciones aplicadas, incluido el índice de portadas.
- La semilla se ejecutó dos veces correctamente y las diez lecturas reales
  pasaron las pruebas de integración contra PostgreSQL de dev.
- La galería ejecutó dos consultas SQL; los datos de equipo/proyecto del panel,
  cinco. La medición excluye autenticación y render HTTP.
- Se comprobaron filtros, puntajes y ausencia de correos en el detalle público.
  Las pruebas de publicación y portada usaron cambios temporales revertidos.
- La revisión de producción no encontró datos de prueba: las siete tablas de
  datos estaban vacías y solo existía la configuración del evento.

### Lo que falta y quién lo completa

| Pendiente | Responsable / coordinación | ¿Está relacionado con buckets? | Cuándo se considera terminado |
| --- | --- | --- | --- |
| Crear y comprobar los buckets de dev | BD/DP | Sí | Los dos buckets tienen permisos, tamaños y MIME correctos y pasan la prueba del Dashboard. En la última revisión ambos proyectos estaban sin buckets. |
| Conectar la subida real de la pantalla | FE/BK | Sí | El navegador transfiere el objeto y BK confirma sus metadatos; deja de usarse la simulación. |
| Probar subida, confirmación y eliminación reales en dev | FE/BK con BD/DP | Sí | El paso 8 funciona con OAuth y se comprueban tanto los objetos como las referencias en `project_files`. |
| Configurar Storage y variables de prod | BD/DP | Sí | Los buckets de prod tienen la misma configuración, sin fixtures, y los valores del despliegue corresponden al proyecto prod. |
| Alinear el esquema de PostgreSQL y sus migraciones en prod | BD junto con DP | No | Se acuerda la alineación, se preserva la configuración del evento y `prisma migrate status` confirma que no faltan migraciones. |
| Validar el recorrido completo en producción | DP con BD/BK/FE | Parcialmente | OAuth, equipos, proyecto, archivos, permisos, publicación y consultas funcionan en el entorno real; se comprueba otra vez que no haya fixtures. |
| Revisar las vulnerabilidades de dependencias antes del lanzamiento | DP, coordinando cambios con el equipo | No | Se evalúan/corrigen los avisos y se repite la auditoría y las pruebas correspondientes. |

### Detalle del pendiente de FE/BK

`src/app/(private)/panel/proyecto/file-uploader.tsx` todavía simula la subida en
`uploadDirectToSupabase`. Las acciones de BK sí usan Storage real. Crear los
buckets no sustituye esa función, y probar la pantalla mientras siga simulada
puede terminar en `FILE_NOT_UPLOADED` porque no se transfirió ningún objeto.

Para completar la integración, FE/BK debe:

- Sustituir la simulación por una subida directa real con el token de
  `createUploadUrlAction`, compatible con `uploadToSignedUrl` o su API equivalente.
- Si eligen el SDK, instalar `@supabase/supabase-js` y proporcionar al navegador
  solo la URL y la clave publicable. Las variables actuales `SUPABASE_*` son
  de servidor. FE puede añadir `NEXT_PUBLIC_SUPABASE_URL` y
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` o pasar los dos valores públicos desde
  el servidor; agregar nombres a `.env` por sí solo no conecta el componente.
- Esperar a que termine la subida y luego ejecutar `confirmUploadAction`.
  Mantener la ruta y los metadatos recibidos, y propagar errores asíncronos.
- Mantener `SUPABASE_SECRET_KEY`, `DATABASE_URL` y `AUTH_SECRET` fuera del navegador.

No es necesario abrir políticas anónimas para resolver este pendiente.

### Detalle del pendiente de BD/DP en producción

El esquema existente en prod difiere del Prisma versionado: usa UUID, otros
enums y tiene diferencias de columnas y tipos. Por eso, crear buckets no deja
lista la base de producción. Tampoco corresponde ejecutar las migraciones
iniciales sobre sus tablas existentes ni marcarlas como aplicadas sin alinear
primero el esquema.

La decisión y el procedimiento se deben revisar con DP, conservando la
configuración del evento. El diagnóstico, la propuesta y la auditoría de
dependencias están en [PRODUCTION.md](../prisma/PRODUCTION.md).

La semana 4 sigue abierta hasta completar los pendientes de BD en producción
y su revisión final con DP. Las pruebas actuales certifican las lecturas de dev;
la validación integrada con OAuth y Storage reales todavía debe completarse.
