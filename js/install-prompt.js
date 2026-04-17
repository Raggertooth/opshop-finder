// install-prompt.js — Capture beforeinstallprompt + show custom Install button
(function () {
  'use strict';

  var DISMISSED_KEY = 'opshop:install-dismissed:v1';

  function dismissed() {
    try { return localStorage.getItem(DISMISSED_KEY) === '1'; }
    catch (e) { return false; }
  }
  function dismiss() {
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch (e) { /* ignore */ }
  }

  // Don't show in standalone mode (already installed)
  if (window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true) return;

  var deferredPrompt = null;
  var btn = null;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function buildBtn() {
    if (btn) return btn;
    btn = document.createElement('button');
    btn.id = 'install-btn';
    btn.type = 'button';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Install';
    btn.setAttribute('aria-label', 'Install OpShop Finder app');
    btn.addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        if (choice.outcome === 'dismissed') dismiss();
        deferredPrompt = null;
        btn.hidden = true;
      });
    });

    var dismissX = document.createElement('button');
    dismissX.id = 'install-dismiss';
    dismissX.type = 'button';
    dismissX.setAttribute('aria-label', 'Dismiss install prompt');
    dismissX.textContent = '×';
    dismissX.addEventListener('click', function () {
      dismiss();
      btn.hidden = true;
      dismissX.hidden = true;
    });

    document.body.appendChild(btn);
    document.body.appendChild(dismissX);
    return btn;
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (dismissed()) return;
    ready(function () { buildBtn().hidden = false; });
  });

  window.addEventListener('appinstalled', function () {
    if (btn) btn.hidden = true;
    deferredPrompt = null;
  });
})();
