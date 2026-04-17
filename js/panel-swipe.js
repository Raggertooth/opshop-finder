// panel-swipe.js — Drag the detail panel down to close (mobile native feel)
(function () {
  'use strict';

  var CLOSE_THRESHOLD = 80;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var panel = document.getElementById('detail-panel');
    if (!panel || !('ontouchstart' in window)) return;

    // Only enable on phone-sized viewports (panel is bottom sheet)
    function isMobileLayout() { return window.innerWidth < 1024; }

    var startY = 0;
    var dy = 0;
    var dragging = false;

    panel.addEventListener('touchstart', function (e) {
      if (!isMobileLayout()) return;
      // Only start drag from the top region (handle area + above the title).
      // This keeps inner scrollable content (long hours, recent chips) usable.
      var box = panel.getBoundingClientRect();
      var localY = e.touches[0].clientY - box.top;
      if (localY > 80) return;
      if (panel.scrollTop > 0) return;
      startY = e.touches[0].clientY;
      dy = 0;
      dragging = true;
      panel.style.transition = 'none';
    }, { passive: true });

    panel.addEventListener('touchmove', function (e) {
      if (!dragging) return;
      dy = e.touches[0].clientY - startY;
      if (dy < 0) dy = 0;
      panel.style.transform = 'translateY(' + dy + 'px)';
    }, { passive: true });

    panel.addEventListener('touchend', function () {
      if (!dragging) return;
      dragging = false;
      panel.style.transition = '';
      if (dy >= CLOSE_THRESHOLD) {
        panel.style.transform = '';
        if (window.OpShopPanel) window.OpShopPanel.hide();
      } else {
        panel.style.transform = '';
      }
      dy = 0;
    });
  });
})();
