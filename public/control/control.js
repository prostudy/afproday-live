(() => {
  'use strict';

  const stage = document.querySelector('.assistant-stage');
  const commandForm = document.querySelector('#command-form');
  const commandInput = document.querySelector('#command-input');
  const assistantKicker = document.querySelector('#assistant-kicker');
  const assistantTitle = document.querySelector('#assistant-title');
  const assistantSummary = document.querySelector('#assistant-summary');
  const assistantAction = document.querySelector('#assistant-action');
  const connectionState = document.querySelector('#connection-state');
  const browserStatus = document.querySelector('#browser-status');
  const streamState = document.querySelector('#stream-state');
  const playerStatusValue = document.querySelector('#player-status-value');
  const serviceLiveTag = document.querySelector('#service-live-tag');
  const apiStatusValue = document.querySelector('#api-status-value');
  const lastReading = document.querySelector('#last-reading');
  const scanButton = document.querySelector('#scan-button');
  const aboutDialog = document.querySelector('#about-dialog');
  const openAbout = document.querySelector('#open-about');
  const closeAbout = document.querySelector('#close-about');
  const checklist = document.querySelector('#event-checklist');
  const readinessScore = document.querySelector('#readiness-score');
  const progressValue = document.querySelector('#progress-value');
  const clockTime = document.querySelector('#clock-time');
  const clockDate = document.querySelector('#clock-date');

  const resources = Object.freeze({
    production: {
      label: 'Abrir producción',
      url: 'https://www.afproday2027.com',
      service: 'production'
    },
    productionAdmin: {
      label: 'Abrir administración',
      url: 'https://www.afproday2027.com/templates/admin-dashboard.html',
      service: 'production-admin'
    },
    development: {
      label: 'Abrir desarrollo',
      url: 'https://dvcgnm3hdrmg3.cloudfront.net',
      service: 'development'
    },
    developmentAdmin: {
      label: 'Abrir panel de desarrollo',
      url: 'https://dvcgnm3hdrmg3.cloudfront.net/templates/admin-dashboard.html',
      service: 'development-admin'
    },
    live: {
      label: 'Abrir transmisión',
      url: 'https://live.afproday2027.com',
      service: 'live-control'
    },
    claude: {
      label: 'Abrir Claude',
      url: 'https://claude.ai',
      service: null
    },
    githubLive: {
      label: 'Abrir repositorio Live',
      url: 'https://github.com/prostudy/afproday-live',
      service: 'tool-github-live'
    },
    githubMain: {
      label: 'Abrir repositorio principal',
      url: 'https://github.com/prostudy/afproday2027',
      service: 'tool-github-main'
    },
    github: {
      label: 'Abrir GitHub',
      url: 'https://github.com/prostudy',
      service: 'tool-github'
    },
    awsProjects: {
      label: 'Abrir proyectos de AWS',
      url: 'https://settings.aws.com/projects',
      service: 'tool-aws-projects'
    },
    awsBilling: {
      label: 'Abrir facturación AWS',
      url: 'https://settings.aws.com/billing',
      service: 'tool-aws-billing'
    },
    mailtrap: {
      label: 'Abrir Mailtrap',
      url: 'https://mailtrap.io',
      service: 'tool-mailtrap'
    },
    cloudflare: {
      label: 'Abrir Cloudflare',
      url: 'https://dash.cloudflare.com',
      service: 'tool-cloudflare'
    }
  });

  const statusLabels = Object.freeze({
    live: 'En vivo',
    scheduled: 'Programada',
    offline: 'Desconectada'
  });

  function normalize(value) {
    return value
      .toLocaleLowerCase('es-MX')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  function getPlayerStatus() {
    const config = window.AFPRODAY_PLAYER || {};
    return Object.prototype.hasOwnProperty.call(statusLabels, config.status)
      ? config.status
      : 'offline';
  }

  function createAction(resource) {
    if (!resource) {
      assistantAction.replaceChildren();
      assistantAction.hidden = true;
      return;
    }

    const link = document.createElement('a');
    const label = document.createElement('span');
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

    link.href = resource.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    label.textContent = resource.label;
    use.setAttribute('href', '#icon-arrow-up-right');
    icon.setAttribute('aria-hidden', 'true');
    icon.append(use);
    link.append(label, icon);

    assistantAction.replaceChildren(link);
    assistantAction.hidden = false;
  }

  function focusService(serviceName) {
    document.querySelectorAll('[data-service]').forEach((card) => {
      card.classList.toggle('is-focused', card.dataset.service === serviceName);
    });

    if (serviceName?.startsWith('tool-')) {
      document.querySelector('#developer-tools').open = true;
    }
  }

  function updateAssistant({ kicker, title, summary, resource = null, service = null }) {
    stage.classList.remove('is-thinking');
    void stage.offsetWidth;
    stage.classList.add('is-thinking');

    assistantKicker.lastChild.textContent = ` Digicaster · ${kicker}`;
    assistantTitle.textContent = title;
    assistantSummary.textContent = summary;
    createAction(resource);
    focusService(service || resource?.service || null);
  }

  function interpretCommand(rawCommand) {
    const command = normalize(rawCommand);
    const playerStatus = getPlayerStatus();
    const playerLabel = statusLabels[playerStatus];

    if (!command) {
      updateAssistant({
        kicker: 'Listo para orientar',
        title: '¿Qué necesitas encontrar?',
        summary: 'Pregunta por producción, desarrollo, administración, transmisión, dominios o la preparación del evento.'
      });
      return;
    }

    if (command.includes('admin') && command.includes('desarrollo')) {
      updateAssistant({
        kicker: 'Ruta identificada',
        title: 'Administración de desarrollo.',
        summary: 'Este panel vive en el entorno de CloudFront y sirve para validar cambios antes de llevarlos a producción.',
        resource: resources.developmentAdmin
      });
      return;
    }

    if ((command.includes('facturacion') || command.includes('cobro') || command.includes('billing')) && command.includes('aws')) {
      updateAssistant({
        kicker: 'Herramienta técnica',
        title: 'Facturación de AWS ubicada.',
        summary: 'Este acceso abre la configuración de cobros de AWS. El panel no guarda información financiera ni credenciales.',
        resource: resources.awsBilling
      });
      return;
    }

    if (command.includes('aws') || command.includes('amazon')) {
      updateAssistant({
        kicker: 'Herramienta técnica',
        title: 'Proyectos de AWS ubicados.',
        summary: 'El acceso técnico abre el centro de proyectos de AWS en una pestaña independiente.',
        resource: resources.awsProjects
      });
      return;
    }

    if (command.includes('mailtrap') || (command.includes('correo') && command.includes('prueba'))) {
      updateAssistant({
        kicker: 'Herramienta técnica',
        title: 'Mailtrap está listo.',
        summary: 'Usa este acceso para revisar las herramientas de prueba y actividad de correo del proyecto.',
        resource: resources.mailtrap
      });
      return;
    }

    if (command.includes('cloudflare') || command.includes('worker')) {
      updateAssistant({
        kicker: 'Herramienta técnica',
        title: 'Cloudflare está ubicado.',
        summary: 'Desde aquí puedes abrir el panel de Cloudflare para consultar Workers, dominios y seguridad. Digicaster no realiza cambios automáticamente.',
        resource: resources.cloudflare
      });
      return;
    }

    if ((command.includes('github') || command.includes('repositorio') || command.includes('repo')) && command.includes('live')) {
      updateAssistant({
        kicker: 'Repositorio identificado',
        title: 'Código de AF Pro Day Live.',
        summary: 'Este es el repositorio del sitio de transmisión y del prototipo actual de Digicaster.',
        resource: resources.githubLive
      });
      return;
    }

    if ((command.includes('github') || command.includes('repositorio') || command.includes('repo')) && command.includes('2027')) {
      updateAssistant({
        kicker: 'Repositorio identificado',
        title: 'Código principal de AF Pro Day 2027.',
        summary: 'Este acceso lleva al repositorio principal del proyecto, separado del sitio de transmisión.',
        resource: resources.githubMain
      });
      return;
    }

    if (command.includes('github') || command.includes('repositorio') || command.includes('repo')) {
      updateAssistant({
        kicker: 'Herramientas de código',
        title: 'Los repositorios están agrupados.',
        summary: 'El bloque técnico contiene el repositorio principal, el repositorio Live y el perfil de la organización.',
        resource: resources.github
      });
      return;
    }

    if (command.includes('admin')) {
      updateAssistant({
        kicker: 'Ruta identificada',
        title: 'Panel operativo de producción.',
        summary: 'El acceso administrativo está separado de la experiencia pública. La autenticación real no forma parte de este prototipo.',
        resource: resources.productionAdmin
      });
      return;
    }

    if (command.includes('desarrollo') || command.includes('cloudfront') || command.includes('prueba')) {
      updateAssistant({
        kicker: 'Entorno de validación',
        title: 'Primero desarrollo, después producción.',
        summary: 'Usa CloudFront para revisar la experiencia y el panel administrativo sin tocar el dominio público principal.',
        resource: resources.development
      });
      return;
    }

    if (command.includes('produccion') || command.includes('sitio principal') || command.includes('publico')) {
      updateAssistant({
        kicker: 'Entorno principal',
        title: 'Producción está ubicada.',
        summary: 'Esta es la experiencia pública principal de AF Pro Day 2027. El centro de control solamente conserva su acceso directo.',
        resource: resources.production
      });
      return;
    }

    if (command.includes('transmision') || command.includes('player') || command.includes('video') || command.includes('vivo')) {
      updateAssistant({
        kicker: 'Lectura de configuración',
        title: `La transmisión está configurada como “${playerLabel}”.`,
        summary: 'Esta lectura proviene del archivo local del player. Todavía no confirma disponibilidad remota, latencia ni respuesta del proveedor.',
        resource: resources.live
      });
      return;
    }

    if (command.includes('dominio') || command.includes('dns') || command.includes('subdominio')) {
      updateAssistant({
        kicker: 'Regla de infraestructura',
        title: 'El dominio principal permanece intacto.',
        summary: 'El proyecto conserva www para producción y live para la transmisión. La fase de interfaz no modifica registros DNS ni rutas existentes.',
        resource: resources.live
      });
      return;
    }

    if (command.includes('claude') || command.includes('openai') || command.includes('inteligencia') || command === 'ia') {
      updateAssistant({
        kicker: 'Siguiente fase',
        title: 'La inteligencia llegará detrás de esta experiencia.',
        summary: 'Después de aprobar la interfaz, un backend privado podrá consultar conocimiento del proyecto sin exponer claves en el navegador.',
        resource: resources.claude
      });
      return;
    }

    if (command.includes('antes') || command.includes('prepar') || command.includes('checklist') || command.includes('revisar')) {
      updateAssistant({
        kicker: 'Secuencia recomendada',
        title: 'Cuatro verificaciones antes de salir en vivo.',
        summary: 'Valida desarrollo, prueba la transmisión, confirma la experiencia pública y deja preparada la contingencia. Puedes marcar el avance en el panel.',
        service: 'development'
      });
      return;
    }

    if (command.includes('recuerda') || command.includes('memoria') || command.includes('conocimiento') || command.includes('proyecto')) {
      updateAssistant({
        kicker: 'Memoria local',
        title: 'Conozco las rutas y reglas esenciales.',
        summary: 'Esta demostración reconoce entornos, paneles administrativos, transmisión, dominio, preparación y la futura integración del asistente.'
      });
      return;
    }

    if (command.includes('estado') || command.includes('status') || command.includes('salud')) {
      updateAssistant({
        kicker: 'Alcance actual',
        title: 'Configuración visible; monitoreo pendiente.',
        summary: `El navegador está ${navigator.onLine ? 'con conexión' : 'sin conexión'} y el player indica “${playerLabel}”. La disponibilidad real se conectará en la fase de backend.`
      });
      return;
    }

    if (command.includes('entorno')) {
      updateAssistant({
        kicker: 'Arquitectura resumida',
        title: 'Dos entornos, una sola referencia.',
        summary: 'Producción utiliza el dominio público; desarrollo utiliza CloudFront. Cada entorno conserva su propio acceso administrativo.',
        service: 'production'
      });
      return;
    }

    updateAssistant({
      kicker: 'Consulta fuera de la demo',
      title: 'Esa pregunta necesita la memoria completa.',
      summary: 'La interfaz ya está preparada para mostrar la respuesta, pero el conocimiento amplio se conectará después de aprobar este diseño. Prueba con producción, desarrollo, transmisión, dominio o preparación.'
    });
  }

  function updateConnection() {
    const online = navigator.onLine;
    connectionState.lastChild.textContent = online ? ' Con conexión' : ' Sin conexión';
    browserStatus.textContent = online ? 'Con conexión' : 'Sin conexión';
    connectionState.classList.toggle('is-pending', !online);
  }

  function updatePlayerReading() {
    const status = getPlayerStatus();
    const label = statusLabels[status];

    playerStatusValue.textContent = label;
    streamState.lastChild.textContent = ` ${label}`;
    serviceLiveTag.textContent = label;
    serviceLiveTag.classList.toggle('is-live', status === 'live');
    serviceLiveTag.classList.toggle('is-scheduled', status === 'scheduled');
    serviceLiveTag.classList.toggle('is-offline', status === 'offline');
  }

  function updateReadingTime() {
    lastReading.textContent = `Lectura local actualizada · ${new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date())}`;
  }

  function setApiState(label, className) {
    apiStatusValue.textContent = label;
    apiStatusValue.classList.remove('pending-text', 'connected-text', 'error-text');
    apiStatusValue.classList.add(className);
  }

  function applyRemoteStatuses(services) {
    services.forEach((service) => {
      const card = document.querySelector(`[data-service="${service.id}"]`);
      if (!card) {
        return;
      }

      card.dataset.health = service.status;
      const statusText = service.httpStatus
        ? `${service.name}: HTTP ${service.httpStatus}, ${service.latencyMs} ms`
        : `${service.name}: no disponible`;
      card.title = statusText;
    });
  }

  async function refreshRemoteStatus({ announce = false } = {}) {
    setApiState('Consultando', 'pending-text');

    try {
      const response = await fetch('/control/api/status', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Status endpoint returned ${response.status}`);
      }

      const payload = await response.json();
      const services = Array.isArray(payload.services) ? payload.services : [];
      applyRemoteStatuses(services);
      setApiState('Conectada', 'connected-text');

      const checkedAt = new Date(payload.checkedAt);
      lastReading.textContent = `Comprobación remota · ${new Intl.DateTimeFormat('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(checkedAt)}`;

      if (announce) {
        const available = Number(payload.summary?.available) || 0;
        const total = Number(payload.summary?.total) || services.length;
        updateAssistant({
          kicker: 'Estado remoto actualizado',
          title: `${available} de ${total} servicios responden.`,
          summary: 'Digicaster comprobó disponibilidad y tiempo de respuesta desde el backend protegido. Los puntos con color muestran el resultado más reciente.'
        });
      }

      return true;
    } catch {
      setApiState('No conectada', 'error-text');
      updateReadingTime();

      if (announce) {
        updateAssistant({
          kicker: 'Modo local',
          title: 'El backend todavía no está disponible.',
          summary: 'Digicaster actualizó la conexión del navegador y el player local. La comprobación remota funcionará después del despliegue protegido.'
        });
      }

      return false;
    }
  }

  function updateClock() {
    const now = new Date();
    clockTime.textContent = new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
    clockDate.textContent = new Intl.DateTimeFormat('es-MX', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    }).format(now).replace('.', '');
  }

  function updateReadiness() {
    const boxes = [...checklist.querySelectorAll('input[type="checkbox"]')];
    const completed = boxes.filter((box) => box.checked).length;
    const percentage = (completed / boxes.length) * 100;

    readinessScore.textContent = `${completed}/${boxes.length}`;
    progressValue.style.width = `${percentage}%`;

    if (completed === boxes.length) {
      updateAssistant({
        kicker: 'Preparación completa',
        title: 'La lista visual está lista.',
        summary: 'Todos los puntos de esta sesión fueron marcados. En la versión final, el backend podrá conservar responsables, evidencias y tiempos.'
      });
    }
  }

  commandForm.addEventListener('submit', (event) => {
    event.preventDefault();
    interpretCommand(commandInput.value);
  });

  document.addEventListener('click', (event) => {
    const commandButton = event.target.closest('[data-command]');
    if (commandButton) {
      const command = commandButton.dataset.command || '';
      commandInput.value = command;
      interpretCommand(command);
    }

    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) {
      const filter = filterButton.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((button) => {
        button.classList.toggle('is-active', button === filterButton);
      });
      document.querySelectorAll('[data-environment]').forEach((card) => {
        card.classList.toggle('is-filtered', filter !== 'all' && card.dataset.environment !== filter);
      });
    }
  });

  scanButton.addEventListener('click', async () => {
    scanButton.disabled = true;
    scanButton.lastChild.textContent = ' Leyendo';
    stage.classList.add('is-thinking');

    updateConnection();
    updatePlayerReading();
    await refreshRemoteStatus({ announce: true });
    scanButton.disabled = false;
    scanButton.lastChild.textContent = ' Actualizar';
  });

  checklist.addEventListener('change', updateReadiness);

  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

    if (event.key === '/' && !isTyping) {
      event.preventDefault();
      commandInput.focus();
    }

    if (event.key === 'Escape' && document.activeElement === commandInput) {
      commandInput.value = '';
      commandInput.blur();
    }
  });

  openAbout.addEventListener('click', () => {
    if (typeof aboutDialog.showModal === 'function') {
      aboutDialog.showModal();
    } else {
      aboutDialog.setAttribute('open', '');
    }
  });

  closeAbout.addEventListener('click', () => aboutDialog.close());

  aboutDialog.addEventListener('click', (event) => {
    if (event.target === aboutDialog) {
      aboutDialog.close();
    }
  });

  updateClock();
  updateConnection();
  updatePlayerReading();
  updateReadingTime();
  updateReadiness();
  refreshRemoteStatus();
  window.setInterval(updateClock, 1000);
})();
