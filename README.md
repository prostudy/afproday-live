# AF Pro Day Live

Sitio público y estático para la transmisión de AF Pro Day 2027. Funciona sin AWS, sesiones, cookies, APIs ni proceso de compilación.

## Ejecución local

Desde la raíz del repositorio:

```bash
python3 -m http.server 8080 --directory public
```

Abre `http://localhost:8080/`. La ruta `http://localhost:8080/evento.html` redirige a la página principal en Cloudflare Pages y también contiene una redirección HTML como respaldo local.

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
4. Prueba la URL en el dominio de Pages.
5. Cambia a `status: 'live'` al iniciar. Usa `offline` al finalizar o durante una interrupción.

## Despliegue en Cloudflare Pages con Git

Conecta el repositorio desde el panel de Cloudflare Pages y configura:

- Framework preset: **None**
- Build command: vacío
- Build output directory: `public`
- Production branch: `main`

Este repositorio no ejecuta despliegues automáticamente desde una máquina local. Haz commit y push solo después de revisar los cambios; Cloudflare publicará el commit de `main` conforme a la integración Git configurada.

## Dominio `live.afproday2027.com`

El dominio `afproday2027.com` ya está administrado en Cloudflare. No se deben cambiar sus nameservers, el dominio raíz (`afproday2027.com`) ni ningún registro existente.

En el proyecto `afproday-live` de Cloudflare Pages, abre **Custom domains** y agrega únicamente `live.afproday2027.com`. Cloudflare puede proponer crear o ajustar el registro DNS de ese subdominio; antes de aceptar, confirma que el único registro afectado sea `live`. Revisa el destino, TLS y el estado `Active` antes del evento.

Crear o modificar el registro de `live`, conectar el proyecto, publicar o activar una ruta de emergencia requiere autorización humana explícita. No elimines ni reemplaces otros registros DNS.

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

En Cloudflare Pages, abre **Deployments**, localiza un despliegue de producción conocido y usa **Rollback to this deployment**. Verifica después `/`, la configuración del player y los encabezados. Si la integración Git debe permanecer alineada, revierte también el commit correspondiente mediante un nuevo commit revisado; no reescribas el historial de `main` durante el evento.

## Si el proveedor rechaza el dominio

Confirma que la URL sea una URL de inserción permitida y que el evento autorice reproducción en `afproday-live.pages.dev` y `live.afproday2027.com`. Añade ambos dominios a la lista permitida del proveedor o desactiva temporalmente su restricción de dominio según la política del evento. No relajes la CSP para dominios distintos sin una revisión explícita.

Mantén `status: 'scheduled'` u `offline` hasta que la prueba funcione. Cambiar de proveedor o activar una ruta de emergencia requiere autorización humana.
