# Backend - semana 3

Implementadas las acciones createUploadUrlAction, confirmUploadAction, deleteProjectFileAction, submitProjectAction y saveEvaluationAction.

## Integracion con FE

1. Guardar el borrador: debe existir el proyecto del equipo.
2. Pedir createUploadUrlAction({ kind, fileName, contentType, sizeBytes }).
3. Subir directamente desde el navegador con el bucket, storagePath y token devueltos, usando uploadToSignedUrl y sin sobrescritura. Los archivos no viajan dentro de una Server Action.
4. Confirmar con los mismos metadatos y storagePath. La ruta es opaca y firmada; no se debe modificar.
5. Mostrar los errores del contrato. Se admite un PITCH_DECK, una COVER_IMAGE y cinco EXTRA. Para reemplazar un archivo unico, eliminar primero el anterior.

El envio requiere lider, minimo de dos integrantes, titulo, resumen, descripcion, pitch confirmado y plazo abierto. Cada reenvio incrementa submissionCount.

La evaluacion requiere rol JUDGE y proyecto enviado y visible. Se comprueba el cierre despues del bloqueo. El upsert guarda una sola fila por proyecto y jurado. El resultado ponderado se calcula con las notas guardadas y pesos 25/30/25/20; el esquema no tiene una columna de promedio.

## Eliminacion y recuperacion

La accion verifica permisos y plazo bajo el bloqueo del proyecto, elimina la fila de ProjectFile y espera el commit. Solo entonces elimina el objeto en Storage. Si falla PostgreSQL, el objeto queda intacto.

El DELETE de Storage se reintenta hasta tres veces ante errores de red, HTTP 429 o HTTP 5xx. Una respuesta que identifica un objeto ausente tambien cuenta como exito. Los errores permanentes no se reintentan.

Si falla Storage despues del commit, la accion conserva el borrado de la referencia y devuelve exito. Registra fileId, bucket y storagePath con el mensaje 'Objeto pendiente de limpieza', sin registrar el error remoto ni credenciales. Un fallo despues del commit o la interrupcion del proceso puede dejar un objeto huerfano. No hay atomicidad entre PostgreSQL y Storage.

Una cola duradera de limpieza requiere un mecanismo persistente adicional coordinado con BD/DP; no se agregaron tablas, migraciones ni tareas de despliegue. Tambien se necesita limpieza de subidas abandonadas o rechazadas al confirmar. El listado del proyecto ya no referencia los objetos cuya fila fue eliminada.

## Configuracion requerida de Storage (BD/DP)

Variables de servidor: SUPABASE_URL, SUPABASE_SECRET_KEY y AUTH_SECRET. La llave de Storage no se devuelve al navegador. AUTH_SECRET debe ser estable durante autorizacion y confirmacion.

En la revision del 6 de octubre de 2026, la consulta real de buckets respondio HTTP 200 pero no contenia:

- entregables: privado; limite 26214400 bytes; application/pdf, application/zip, image/png, image/jpeg.
- portadas: publico; limite 5242880 bytes; image/png, image/jpeg, image/webp.

BD/DP deben crear estos buckets con sus limites. No habilitar escrituras anonimas ni sobrescritura. Los limites del bucket protegen la subida directa antes de confirmar; backend comprueba tambien los metadatos almacenados.

## Verificacion actual

- Lecturas reales de project_files y evaluations con Prisma correctas. Se verificaron created_at, IDs text, size_bytes integer y notas integer. El bloqueo de esquema descrito anteriormente ya no aparece.
- 24 casos de semana 3 contra PostgreSQL real, con Storage, sesion y reloj controlados: permisos, 26 MB rechazados, solicitud de 5 MB aceptada, firma de ruta, archivo no subido, metadatos incorrectos, confirmacion repetida, limites, envio y reenvio, cierres, eliminacion, upsert y puntaje. Todos los datos creados se revirtieron.
- 17 comprobaciones adicionales de regresion con fallos simulados: borrado y commit fallidos sin tocar Storage, orden de operaciones, fallo remoto, registro seguro, permisos y reintentos de red/429/5xx/objeto ausente/error permanente.
- ESLint del backend correcto.
- TypeScript global bloqueado por un archivo de FE faltante: src/app/(private)/layout.tsx importa @/components/private/sign-out-button. No se modifico ese archivo.

Pendiente de validacion integrada: subida y eliminacion con los buckets reales; flujo con sesion OAuth; confirmar con FE que el puntaje guardado coincide con el mostrado. Las pruebas controladas no certifican ese flujo.

No se modificaron pantallas, schema, migraciones, queries, seed, variables ni buckets.
