(() => {
  'use strict';

  const ALLOWED_PLAYER_HOSTS = new Set([
    'player.vimeo.com',
    'www.youtube.com',
    'www.youtube-nocookie.com'
  ]);

  const STATUS_LABELS = Object.freeze({
    scheduled: 'Próximamente',
    live: 'En vivo',
    offline: 'Sin transmisión'
  });

  const FALLBACKS = Object.freeze({
    eventTitle: 'AF Pro Day 2027',
    scheduledMessage: 'La transmisión comenzará próximamente. Vuelve a esta página a la hora indicada.',
    offlineMessage: 'La transmisión no está disponible en este momento.'
  });

  const title = document.querySelector('#event-title');
  const badge = document.querySelector('#status-badge');
  const message = document.querySelector('#event-message');
  const messageHeading = document.querySelector('#message-heading');
  const messageCopy = document.querySelector('#message-copy');
  const videoContainer = document.querySelector('#video-container');

  function safeText(value, fallback) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  function setStatus(status) {
    badge.dataset.state = status;
    badge.textContent = STATUS_LABELS[status] || STATUS_LABELS.offline;
  }

  function removePlayer() {
    videoContainer.replaceChildren();
    videoContainer.hidden = true;
  }

  function showMessage(status, heading, copy) {
    removePlayer();
    setStatus(status);
    messageHeading.textContent = heading;
    messageCopy.textContent = copy;
    message.hidden = false;
  }

  function validateEmbedUrl(value) {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    try {
      const url = new URL(value.trim());
      const usesStandardHttpsPort = !url.port || url.port === '443';
      const isAllowed = url.protocol === 'https:'
        && !url.username
        && !url.password
        && usesStandardHttpsPort
        && ALLOWED_PLAYER_HOSTS.has(url.hostname);

      return isAllowed ? url.toString() : null;
    } catch {
      return null;
    }
  }

  function showPlayer(embedUrl, eventTitle) {
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.title = `Transmisión en vivo de ${eventTitle}`;
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

    videoContainer.replaceChildren(iframe);
    message.hidden = true;
    videoContainer.hidden = false;
    setStatus('live');
  }

  function initialize() {
    const config = window.AFPRODAY_PLAYER || {};
    const eventTitle = safeText(config.eventTitle, FALLBACKS.eventTitle);
    const status = Object.prototype.hasOwnProperty.call(STATUS_LABELS, config.status)
      ? config.status
      : 'offline';

    title.textContent = eventTitle;
    document.title = `${eventTitle} | Transmisión en vivo`;

    if (status === 'scheduled') {
      showMessage(
        'scheduled',
        'La transmisión comenzará próximamente',
        safeText(config.scheduledMessage, FALLBACKS.scheduledMessage)
      );
      return;
    }

    if (status === 'offline') {
      showMessage(
        'offline',
        'Transmisión desconectada',
        safeText(config.offlineMessage, FALLBACKS.offlineMessage)
      );
      return;
    }

    const embedUrl = validateEmbedUrl(config.embedUrl);
    if (!embedUrl) {
      showMessage(
        'offline',
        'Transmisión no disponible',
        'El reproductor no está configurado correctamente. Intenta de nuevo más tarde.'
      );
      return;
    }

    showPlayer(embedUrl, eventTitle);
  }

  initialize();
})();
