# Instrucciones para agentes

## Alcance

- Trabaja exclusivamente dentro de `/Applications/MAMP/htdocs/afproday-live`.
- El repositorio `/Applications/MAMP/htdocs/afproday2027` es solo una referencia de lectura. Nunca lo modifiques.
- No publiques, no hagas push, no conectes Cloudflare, no ejecutes AWS CLI y no cambies DNS sin autorización humana explícita.
- La zona `afproday2027.com` ya está administrada en Cloudflare. Nunca cambies nameservers, el dominio raíz ni registros existentes fuera de `live.afproday2027.com`.
- Incluso para `live.afproday2027.com`, prepara y verifica el cambio primero; aplícalo solo con autorización humana explícita.

## Arquitectura obligatoria

- Conserva el sitio como HTML, CSS y JavaScript puro dentro de `public/`.
- No agregues Node, npm, frameworks, herramientas de compilación, PHP, Pages Functions ni Workers.
- No agregues autenticación, sesiones, cookies, GTM, analítica o seguimiento de actividad.
- No llames `/api/v1/*` ni servicios de AWS.
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
- Deja la configuración final en el estado solicitado para producción y resume las pruebas realizadas.
