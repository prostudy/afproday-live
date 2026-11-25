# AF Pro Day Live

Sitio público y estático para la transmisión de AF Pro Day 2027. Funciona sin AWS, sesiones, cookies, APIs ni proceso de compilación de la aplicación.

Está alojado como **Cloudflare Workers Static Assets**, la opción recomendada actualmente por Cloudflare para sitios estáticos nuevos. No contiene ni ejecuta un script Worker: Cloudflare entrega directamente los archivos de `public/`.

## Ejecución local

Desde la raíz del repositorio:

```bash
python3 -m http.server 8080 --directory public
```

Abre `http://localhost:8080/`. La ruta `http://localhost:8080/evento.html` contiene una redirección HTML como respaldo local; en Cloudflare también se aplica la regla 301 de `public/_redirects`.

## Configuración del player

Edita únicamente [`public/config/player.js`](public/config/player.js):

- `status`: `scheduled`, `live` u `offline`.
- `embedUrl`: URL HTTPS de Vimeo, YouTube o YouTube No-Cookie.
- `eventTitle`: título visible del evento.
- `scheduledMessage`: mensaje previo al evento.
- `offlineMessage`: mensaje para una transmisión desconectada.

El sitio solo acepta `player.vimeo.com`, `www.youtube.com` y `www.youtube-nocookie.com`. Una URL vacía o inválida nunca crea un iframe.

## Crear una transmisión programada

1. Crea o programa el evento en el proveedor de video.
2. Copia su URL de inserción (`embed`), no la URL pública de reproducción.
3. Configura `embedUrl` y conserva `status: 'scheduled'` mientras no deba mostrarse.
4. Prueba la URL en el dominio técnico de Workers.
5. Cambia a `status: 'live'` al iniciar. Usa `offline` al finalizar o durante una interrupción.

## Despliegue en Workers Static Assets con Git

Configuración del proyecto existente:

- Proyecto: `afproday-live`
- Tipo: **Worker con Static Assets, sin script Worker**
- Repositorio: `prostudy/afproday-live`
- Production branch: `main`
- Build command: vacío
- Deploy command: `npx wrangler deploy` (mecanismo administrado por Cloudflare)
- Root directory: `/public`
- URL técnica: `https://afproday-live.proyectosdigicaster.workers.dev`

El uso de Wrangler por la plataforma solo realiza el despliegue. El sitio no usa Node, npm ni código Worker durante su funcionamiento público.

## Centro de control privado

La ruta `/control/` contiene el centro de control Digicaster. Comparte este repositorio y el mismo proyecto de Cloudflare, pero permanece separada de la transmisión pública:

- Cloudflare Access protege `https://live.afproday2027.com/control/*` mediante OTP para correos autorizados.
- `public/worker.js` solo se ejecuta para `/control` y `/control/*`; las páginas públicas continúan sirviéndose directamente como Static Assets.
- El Worker bloquea `/control/*` en el hostname técnico y expone `/control/api/status` únicamente detrás de Access.
- El estado consulta una lista fija de URLs públicas con timeout. No usa credenciales ni APIs de AWS, GitHub, Cloudflare o Mailtrap.
- La comprobación de la propia transmisión lee el asset desplegado mediante el binding estático para evitar subrequests recursivos al mismo hostname.
- La interfaz no contiene contraseñas ni claves API. Cualquier integración futura debe usar Secrets de Cloudflare.
- El enlace **Cerrar sesión** termina la sesión de Cloudflare Access mediante `/cdn-cgi/access/logout`.

No publiques el centro de control antes de crear y probar la aplicación de Access. La aplicación debe cubrir `/control/*` y permitir solamente los correos aprobados; usa One-time PIN como método de acceso.

En **Workers & Pages → afproday-live → Settings → Builds**, la integración con GitHub debe mostrar el repositorio anterior sin advertencias de desconexión. Si aparece **This project is disconnected from your Git account**, usa **Manage** para volver a autorizar la aplicación de Cloudflare en GitHub antes del siguiente despliegue.

Este repositorio no ejecuta despliegues automáticamente desde una máquina local. Haz commit y push solo después de revisar los cambios; Cloudflare publicará el commit de `main` conforme a la integración Git configurada.

Referencias oficiales: [Static Assets](https://developers.cloudflare.com/workers/static-assets/), [encabezados](https://developers.cloudflare.com/workers/static-assets/headers/) y [redirecciones](https://developers.cloudflare.com/workers/static-assets/redirects/).

## Dominio `live.afproday2027.com`

El dominio `afproday2027.com` ya está administrado en Cloudflare. No se deben cambiar sus nameservers, el dominio raíz (`afproday2027.com`) ni ningún registro existente.

En **Workers & Pages → afproday-live → Domains → Add Domain**, agrega únicamente `live.afproday2027.com` como **Custom Domain**. Cloudflare creará el registro y certificado de ese hostname; antes de confirmar, verifica que el único nombre afectado sea `live`. Revisa el estado del dominio y TLS antes del evento.

Crear o modificar el registro de `live`, conectar el proyecto, publicar o activar una ruta de emergencia requiere autorización humana explícita. No elimines ni reemplaces otros registros DNS.

Si ya existe un registro CNAME llamado `live`, detente y revisa su uso antes de continuar. No uses una Route para este sitio: el Worker de archivos estáticos es el origen y debe conectarse como Custom Domain. Consulta la [documentación de Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## Pruebas antes del evento

1. Comprueba `/` y `/evento.html` en escritorio y móvil.
2. Prueba por separado `scheduled`, `live` y `offline`.
3. Para `live`, usa primero un evento de prueba del proveedor.
4. Prueba también URL vacía, `http://`, credenciales en la URL y un dominio no permitido; no debe existir ningún iframe.
5. Revisa la consola y la pestaña Network del navegador.
6. Navega con `Tab` y activa el enlace “Saltar al contenido”.
7. Confirma que el título del iframe describe el evento y que el video conserva proporción 16:9.
8. Verifica los encabezados publicados, especialmente CSP, `X-Frame-Options` y `X-Robots-Tag`.

## Verificar independencia de AWS

Desde la raíz:

```bash
rg -n -i 'aws|amazonaws|cloudfront|/api/v1|fetch\(|XMLHttpRequest|WebSocket' public
```

El resultado esperado es vacío salvo que se haya introducido una referencia accidental. El sitio no debe efectuar solicitudes de red propias; la única comunicación externa permitida es la que realiza el iframe del proveedor de video cuando el estado es `live`.

## Volver a una versión anterior

En **Workers & Pages → afproday-live → Deployments**, localiza una versión conocida y usa la acción de rollback para devolverle el tráfico. Verifica después `/`, la configuración del player, `/evento.html` y los encabezados. Para mantener Git alineado, revierte también el cambio mediante un nuevo commit revisado; no reescribas el historial de `main` durante el evento.

## Si el proveedor rechaza el dominio

Confirma que la URL sea una URL de inserción permitida y que el evento autorice reproducción en `afproday-live.proyectosdigicaster.workers.dev` y `live.afproday2027.com`. Añade ambos dominios a la lista permitida del proveedor o desactiva temporalmente su restricción de dominio según la política del evento. No relajes la CSP para dominios distintos sin una revisión explícita.

Mantén `status: 'scheduled'` u `offline` hasta que la prueba funcione. Cambiar de proveedor o activar una ruta de emergencia requiere autorización humana.
