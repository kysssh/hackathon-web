# Revisión manual para DP

Con la aplicación en ejecución y datos de prueba, realizar las siguientes acciones. Marcar cada punto como funciona, falla o no se pudo probar. No usar datos reales de producción para estas pruebas.

## 1. Ingreso y permisos

- [ ] Entrar con Google y con GitHub; comprobar nombre, foto y rol. Cerrar sesión y volver a entrar.
- [ ] Abrir `/panel` sin sesión: debe enviar a `/ingresar`.
- [ ] Entrar como participante, jurado y organizador; comprobar que cada uno ve sus opciones.
- [ ] Como participante, intentar abrir `/jurado` y `/organizacion` escribiendo la URL: debe impedir el acceso.

## 2. Equipo

- [ ] Con participante sin equipo, crear uno: comprobar nombre, código y que el creador figure como líder.
- [ ] Intentar crear equipo con nombre vacío, demasiado corto y nombre de otro equipo: debe mostrar error.
- [ ] Copiar el código y, desde otra cuenta, unirse al equipo. Repetir con minúsculas y espacios usando un equipo con cupo.
- [ ] Revisar que aparezca el nuevo integrante en ambas cuentas y se actualice el número de miembros, sin recarga manual.
- [ ] Probar código inexistente, equipo lleno y usuario que ya tiene equipo: debe rechazar cada intento.
- [ ] Comprobar que la lista muestre al líder y a todos los integrantes. No hay función prevista para expulsar integrantes ni eliminar equipos; no exigir esos botones.

## 3. Panel y borrador del proyecto

- [ ] Revisar el panel sin equipo y después de crear/unirse: los pendientes deben cambiar según lo completado.
- [ ] Agregar título, resumen y descripción; guardar, recargar y comprobar que se conservaron.
- [ ] Editar esos campos desde otro integrante del mismo equipo; comprobar que se modifica el mismo proyecto.
- [ ] Agregar, cambiar y quitar los enlaces de repositorio, demo y video; guardar cada vez y comprobar persistencia.
- [ ] Probar resumen de más de 280 caracteres y enlaces inválidos: debe avisar y rechazar los datos inválidos.
- [ ] Quitar temporalmente título, resumen o descripción y guardar como borrador: debe indicar lo que falta para entregar. Restaurar los campos al terminar.

## 4. Archivos y entrega

- [ ] Agregar un pitch PDF, una portada y archivos extra; comprobar nombre, listado y portada mostrada.
- [ ] Intentar pitch que no sea PDF, archivo demasiado grande, segundo pitch, segunda portada y sexto extra: debe rechazarlos con mensaje claro.
- [ ] Cancelar una subida y volver a intentarla; comprobar que no quede un archivo confirmado incompleto ni duplicado.
- [ ] Eliminar un extra, la portada y el pitch; comprobar que desaparezcan y que el pitch vuelva a figurar como pendiente. Volver a subirlos para continuar.
- [ ] Intentar entregar sin pitch, con equipo bajo el mínimo y como integrante no líder: debe impedirlo en cada caso.
- [ ] Como líder, abrir la confirmación de entrega y cancelarla: no debe entregar. Después confirmar con todo completo y dentro del plazo: debe mostrar fecha y estado de entrega.
- [ ] Editar y reenviar dentro del plazo: debe conservar el mismo proyecto y actualizar la entrega.
- [ ] En entorno de pruebas con plazos preparados, intentar entregar antes de apertura y después del cierre: debe rechazarlo. Dejar la pantalla abierta al vencer: borrador, archivos y entrega deben bloquearse automáticamente.

## 5. Organización: visibilidad y equipos

- [ ] Entrar como organizador; revisar lista de equipos, integrantes, líder, proyecto y estado de entrega.
- [ ] Abrir la tabla y el detalle de proyectos; comprobar datos y descargar los archivos subidos.
- [ ] Activar visible en un proyecto entregado: debe aparecer en galería y para el jurado. Desactivar: debe desaparecer. Volver a activarlo para continuar.
- [ ] Intentar hacer visible, finalista o ganador un borrador: debe impedirlo.

## 6. Jurado

- [ ] Entrar como jurado; comprobar que ve proyectos entregados y visibles, y que no ve borradores ni ocultos.
- [ ] Abrir un proyecto, agregar las cuatro notas y un comentario; comprobar el puntaje en vivo y guardar.
- [ ] Usar notas 8, 7, 9 y 6: el puntaje ponderado debe ser 7,55.
- [ ] Cambiar notas y comentario y guardar de nuevo: debe actualizar la misma evaluación, sin duplicarla. Quitar el comentario y comprobar que también se guarda.
- [ ] Calificar el mismo proyecto desde un segundo jurado; comprobar en organización dos evaluaciones y promedio correcto.
- [ ] Intentar notas fuera de 1–10 y guardar después del cierre de evaluación: debe rechazarlo.

## 7. Organización: finalistas y ganadores

- [ ] Marcar y desmarcar finalista; marcar y desmarcar ganador en un proyecto entregado. Comprobar que cada cambio se conserve al recargar.
- [ ] Agregar, editar y quitar el título de ganador; comprobar que se guarde cada cambio.
- [ ] Abrir confirmación para publicar finalistas/resultados y cancelar: no debe cambiar la publicación. Después confirmar.
- [ ] Publicar finalistas y revisar galería; publicar resultados y comprobar ganador y título en tarjeta y detalle.
- [ ] Despublicar resultados: deben ocultarse los ganadores. Despublicar también finalistas: deben ocultarse sus distintivos.
- [ ] Probar finalistas despublicados con resultados aún publicados: actualmente los finalistas pueden seguir mostrándose; comprobar que el aviso de la pantalla explique ese comportamiento.
- [ ] Comprobar promedio y cantidad de evaluaciones; proyectos mejor calificados primero y sin calificar al final.

## 8. Páginas públicas y uso general

- [ ] Recorrer inicio, información, cronograma, mentores/jurado, criterios y FAQ; probar enlaces, cuenta regresiva y menú móvil. Anotar textos provisionales o reglas contradictorias.
- [ ] En galería, probar Todos, Finalistas y Ganadores; agregar una búsqueda, cambiarla y quitarla. Comprobar resultados y estados vacíos.
- [ ] Copiar la URL con búsqueda/filtro a otra pestaña: debe mostrar lo mismo.
- [ ] Abrir detalle de proyecto; comprobar descripción, portada, integrantes y enlaces. No debe mostrar correos ni archivos privados.
- [ ] Abrir un proyecto inexistente u oculto por URL directa: debe mostrar 404 o impedir acceso, sin revelar su contenido.
- [ ] Revisar pantallas en celular y computadora, navegar con teclado y comprobar mensajes de carga/error. Anotar botones que no respondan, contenido cortado y errores de consola.

## Qué debe anotar DP

Por cada fallo: **pantalla, cuenta/rol usado, pasos para repetirlo, qué esperaba, qué ocurrió y captura si ayuda**. Asignar al responsable según el plan v3:

- **BK:** ingreso, permisos, reglas, guardado, archivos y publicación.
- **BD:** consultas, relaciones, datos mostrados y promedios consultados.
- **FE:** pantallas privadas, formularios, actualización de integrantes y bloqueo visual al cierre.
- **UX:** páginas públicas, galería, estilos, textos y navegación pública.
- **DP:** entorno y despliegue; coordinar la corrección y volver a probar los fallos.

Si no está claro el origen, DP lo registra y lo revisa con los dueños implicados. No hace falta agregar ni quitar funciones de la app durante esta revisión: las acciones anteriores se refieren a los datos y controles que debe probar.
