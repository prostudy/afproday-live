const CONTROL_HOST = 'live.afproday2027.com';
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);
const CONTROL_PREFIX = '/control';
const STATUS_PATH = '/control/api/status';
const CHECK_TIMEOUT_MS = 5000;

const STATUS_TARGETS = Object.freeze([
  {
    id: 'production',
    name: 'Producción',
    url: 'https://www.afproday2027.com/'
  },
  {
    id: 'production-admin',
    name: 'Administración',
    url: 'https://www.afproday2027.com/templates/admin-dashboard.html'
  },
  {
    id: 'development',
    name: 'Desarrollo',
    url: 'https://dvcgnm3hdrmg3.cloudfront.net/'
  },
  {
    id: 'development-admin',
    name: 'Administración de desarrollo',
    url: 'https://dvcgnm3hdrmg3.cloudfront.net/templates/admin-dashboard.html'
  },
  {
    id: 'live-control',
    name: 'Transmisión',
    url: 'https://live.afproday2027.com/'
  }
]);

function isControlPath(pathname) {
  return pathname === CONTROL_PREFIX || pathname.startsWith(`${CONTROL_PREFIX}/`);
}

function isAllowedHost(hostname) {
  return hostname === CONTROL_HOST || LOCAL_HOSTS.has(hostname);
}

function isLocalHost(hostname) {
  return LOCAL_HOSTS.has(hostname);
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  });
}

function classifyStatus(httpStatus) {
  if (httpStatus >= 200 && httpStatus < 400) {
    return 'operational';
  }

  if (httpStatus === 401 || httpStatus === 403) {
    return 'protected';
  }

  if (httpStatus >= 400 && httpStatus < 500 && httpStatus !== 404) {
    return 'degraded';
  }

  return 'unavailable';
}

async function checkTarget(target) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const response = await fetch(target.url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'AF-Pro-Day-Control/1.0'
      }
    });

    const latencyMs = Date.now() - startedAt;
    response.body?.cancel();

    return {
      id: target.id,
      name: target.name,
      status: classifyStatus(response.status),
      httpStatus: response.status,
      latencyMs
    };
  } catch (error) {
    return {
      id: target.id,
      name: target.name,
      status: 'unavailable',
      httpStatus: null,
      latencyMs: Date.now() - startedAt,
      reason: error instanceof DOMException && error.name === 'AbortError'
        ? 'timeout'
        : 'network-error'
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function getSystemStatus() {
  const services = await Promise.all(STATUS_TARGETS.map(checkTarget));
  const available = services.filter((service) => (
    service.status === 'operational' || service.status === 'protected'
  )).length;

  return {
    checkedAt: new Date().toISOString(),
    summary: {
      available,
      total: services.length,
      allOperational: available === services.length
    },
    services
  };
}

function notFound() {
  return new Response('Not found', {
    status: 404,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!isControlPath(url.pathname)) {
      return env.ASSETS.fetch(request);
    }

    if (!isAllowedHost(url.hostname)) {
      return notFound();
    }

    if (url.pathname === CONTROL_PREFIX) {
      return Response.redirect(`${url.origin}${CONTROL_PREFIX}/`, 308);
    }

    if (url.pathname === STATUS_PATH) {
      if (request.method !== 'GET') {
        return jsonResponse({ error: 'method-not-allowed' }, 405);
      }

      // Cloudflare Access protects this path in production. Localhost remains
      // available for development without weakening the deployed hostname.
      if (!isLocalHost(url.hostname) && !request.headers.get('cf-access-jwt-assertion')) {
        return jsonResponse({ error: 'access-required' }, 403);
      }

      return jsonResponse(await getSystemStatus());
    }

    return env.ASSETS.fetch(request);
  }
};
