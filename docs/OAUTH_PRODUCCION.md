# Google y GitHub: preparación de OAuth para producción

Actualizado el 21 de noviembre de 2026. La aplicación tiene proveedores Google/GitHub, adaptador Prisma y sesión JWT. **No se ha acreditado el inicio de sesión desde el dominio final ni la configuración de producción**; esta guía es una lista de preparación, no una certificación.

El cierre del proyecto debe incluir las pruebas interactivas de ambos proveedores con participante, jurado y organizador, además del smoke test publicado. El estado vigente y las demás dependencias de despliegue están en [el informe de estado](ESTADO_PROYECTO_2026-11-21.md).

## Qué son los códigos creados en los proveedores

Habitualmente son el Client ID y Client Secret de una aplicación OAuth. Permanecen registrados en Google/GitHub. Al desplegar, se configuran las credenciales en el hosting y se autorizan las direcciones de retorno del sitio publicado. No se sube esa aplicación OAuth como un archivo.

Esta revisión no accedió a las consolas ni comprobó las credenciales existentes. El usuario recuerda haber configurado ambos proveedores; eso debe conservarse como antecedente, no como prueba nueva de producción.

## Pasos

1. Elegir el dominio estable de producción, por ejemplo `https://hackathon.example.com`.
2. En Google Cloud / Google Auth Platform, revisar el cliente OAuth de tipo aplicación web y registrar exactamente la URI de redirección `https://hackathon.example.com/api/auth/callback/google`. Revisar audiencia, pantalla de consentimiento y estado de publicación para el público previsto. La necesidad de verificación depende de la configuración y los permisos solicitados; no se da por obligatoria para todo inicio de sesión.
3. En GitHub, revisar Settings → Developer settings → OAuth Apps. Para separar desarrollo y producción, crear una aplicación de producción con Homepage URL igual al dominio y Authorization callback URL `https://hackathon.example.com/api/auth/callback/github`. Conservar la configuración local de desarrollo en su aplicación correspondiente.
4. En el hosting, por ejemplo Vercel → proyecto → Settings → Environment Variables → Production, configurar `NEXTAUTH_URL` con el dominio estable, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` y un `AUTH_SECRET` estable de producción. Usar los valores del cliente correspondiente a ese entorno.
5. Configurar también la conexión de producción `DATABASE_URL`, las variables Supabase requeridas y las listas `ORGANIZER_EMAILS`/`JUDGE_EMAILS` con correos reales. `.env.example` enumera cada variable una sola vez; reemplazar los marcadores con los valores del entorno correspondiente.
6. Aplicar las migraciones de producción sin ejecutar la semilla. Desplegar nuevamente después de configurar variables y comprobar que el callback utiliza el dominio final. La aplicación también usa `NEXTAUTH_URL` para formar las URLs absolutas de sitemap y robots. Auth.js puede inferir la URL del callback en Vercel; revisar su guía antes de añadir ajustes de URL/proxy para otros hosts.
7. Probar Google y GitHub desde el sitio publicado: ingreso, cuenta persistida, rol, membresía, navegación privada y salida. Repetir la prueba para participante, jurado y organizador y registrar resultados.

Los ejemplos usan un dominio ficticio: reemplazarlo por el real. Los secretos se configuran como variables de servidor; no se agregan al repositorio ni a variables `NEXT_PUBLIC_*`.

## Referencias oficiales

- [Auth.js: configuración GitHub y producción](https://authjs.dev/guides/configuring-github).
- [Auth.js: despliegue](https://authjs.dev/getting-started/deployment).
- [GitHub: crear una OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).
- [Google: OAuth para aplicaciones web y redirect URI](https://developers.google.com/identity/protocols/oauth2/web-server).
- [Google: políticas OAuth](https://developers.google.com/identity/protocols/oauth2/policies).
