# Instrucciones para agentes

## Alcance

- Trabaja exclusivamente dentro de `/Applications/MAMP/htdocs/afproday-live`.
- El repositorio `/Applications/MAMP/htdocs/afproday2027` es solo una referencia de lectura. Nunca lo modifiques.
- No publiques, no hagas push, no conectes Cloudflare, no ejecutes AWS CLI y no cambies DNS sin autorización humana explícita.
- La zona `afproday2027.com` ya está administrada en Cloudflare. Nunca cambies nameservers, el dominio raíz ni registros existentes fuera de `live.afproday2027.com`.
- Incluso para `live.afproday2027.com`, prepara y verifica el cambio primero; aplícalo solo con autorización humana explícita.

## Arquitectura obligatoria

- Conserva el sitio como HTML, CSS y JavaScript puro dentro de `public/`.
- El alojamiento oficial es Cloudflare Workers Static Assets en el proyecto `afproday-live`.
- La página pública (`/`, `/evento.html` y assets del player) debe seguir sirviéndose directamente como Static Assets, sin invocar código Worker.
- `public/worker.js` puede ejecutarse únicamente para `/control` y `/control/*`, conforme a `public/wrangler.jsonc`.
- `/control/*` debe permanecer protegido mediante Cloudflare Access y solo puede publicarse después de comprobar que el dominio técnico `workers.dev` no permite eludir Access.
- El endpoint `/control/api/status` solo puede consultar la lista fija de URLs públicas declarada en `public/worker.js`; no acepta destinos proporcionados por el usuario.
- No agregues Node, npm, frameworks, herramientas de compilación, PHP ni Pages Functions a la aplicación. El comando administrado `npx wrangler deploy` de Cloudflare es únicamente el mecanismo de despliegue.
- No implementes autenticación propia, contraseñas, sesiones, cookies, GTM, analítica o seguimiento de actividad. La autenticación pertenece a Cloudflare Access.
- No llames `/api/v1/*` ni APIs autenticadas de AWS. El chequeo HTTP de las dos URLs públicas de CloudFront solo está permitido desde `/control/api/status`.
- Nunca guardes correos autorizados, tokens, claves API o contraseñas en el repositorio. La lista de acceso se administra en Cloudflare Access y los secretos futuros mediante bindings Secret.
- Limita las dependencias externas al iframe del proveedor de video.

## Seguridad y accesibilidad

- Configura el player solo en `public/config/player.js`.
- Mantén la validación HTTPS, sin credenciales, y la lista explícita de hosts permitidos.
- No insertes HTML procedente de la configuración; usa texto seguro.
- Mantén la CSP y los encabezados de `public/_headers` sincronizados con los proveedores permitidos.
- Verifica teclado, foco visible, lector de pantalla y diseño móvil en cada cambio visual.

## Verificación mínima

- Sirve `public/` mediante HTTP; no pruebes abriendo archivos con `file://`.
- Revisa `/` y `/evento.html`.
- Prueba `scheduled`, `live`, `offline` y una URL inválida.
- Confirma que no haya errores de consola, llamadas a `/api/v1/*` ni referencias públicas a AWS.
- Para `/control/`, confirma que Access bloquee visitantes no autorizados, que los correos permitidos puedan entrar y que el endpoint de estado no sea accesible mediante el hostname técnico.
- Deja la configuración final en el estado solicitado para producción y resume las pruebas realizadas.
