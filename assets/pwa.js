'use strict';
(() => {
  if (location.protocol !== 'https:' && location.protocol !== 'http:') return;
  if (!('serviceWorker' in navigator)) return;
  const status = document.getElementById('offline-status');
  const installButton = document.getElementById('install-app');
  const updateButton = document.getElementById('update-app');
  let installPrompt = null;
  let registration = null;
  let applyingUpdate = false;
  const setStatus = message => { if (status) status.textContent = message; };
  const updateAvailable = () => {
    if (!registration?.waiting) return;
    updateButton.hidden = false;
    setStatus('Update ready');
  };
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    if (!matchMedia('(display-mode: standalone)').matches) installButton.hidden = false;
  });
  installButton.addEventListener('click', async () => {
    if (!installPrompt) return;
    const prompt = installPrompt;
    installPrompt = null;
    installButton.hidden = true;
    try { await prompt.prompt(); await prompt.userChoice; }
    catch (error) { console.warn('Installation prompt could not be shown.', error); }
  });
  window.addEventListener('appinstalled', () => { installPrompt = null; installButton.hidden = true; });
  updateButton.addEventListener('click', () => {
    if (!registration?.waiting) return;
    applyingUpdate = true;
    updateButton.disabled = true;
    registration.waiting.postMessage({type:'SKIP_WAITING'});
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (applyingUpdate) location.reload();
  });
  window.addEventListener('offline', () => setStatus('Offline · saved atlas'));
  window.addEventListener('online', () => {
    setStatus(registration?.waiting ? 'Update ready' : 'Offline ready');
    registration?.update().catch(() => {});
  });
  window.addEventListener('load', async () => {
    setStatus('Saving offline…');
    try {
      // Derive both script URL and scope from this project's directory, not the host root.
      const base = new URL('./', document.baseURI);
      registration = await navigator.serviceWorker.register(new URL('sw.js', base), {scope:base.pathname,updateViaCache:'none'});
      updateAvailable();
      const watchInstall = worker => {
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) updateAvailable();
          if (worker.state === 'redundant') setStatus('Offline save unavailable · retry online');
        });
      };
      watchInstall(registration.installing);
      registration.addEventListener('updatefound', () => watchInstall(registration.installing));
      await navigator.serviceWorker.ready;
      if (!registration.waiting) setStatus(navigator.onLine ? 'Offline ready' : 'Offline · saved atlas');
    } catch (error) {
      setStatus('Offline save unavailable');
      console.warn('The atlas is usable online, but offline setup failed.', error);
    }
  });
})();
