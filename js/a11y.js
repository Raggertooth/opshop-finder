// a11y.js — focus trap, keyboard shortcuts, ARIA-live filter announcements
(function () {
  'use strict';

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // -------------------- Filter results ARIA-live --------------------
  var status = document.getElementById('filter-status');
  if (!status) {
    status = document.createElement('div');
    status.id = 'filter-status';
    status.className = 'sr-only';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    document.body.appendChild(status);
  }

  window.addEventListener('opshops:filtered', function (e) {
    var n = (e.detail.matched || []).length;
    var total = window.OpShopData ? window.OpShopData.all().length : n;
    var s = e.detail.state || {};
    var anyFilter = s.query || s.openNow || s.favouritesOnly ||
                    (s.charities && s.charities.length) ||
                    (s.categories && s.categories.length);
    if (!anyFilter) {
      status.textContent = 'Showing all ' + total + ' shops.';
    } else if (n === 0) {
      status.textContent = 'No shops match these filters.';
    } else {
      status.textContent = 'Showing ' + n + ' of ' + total + ' shops.';
    }
  });

  // -------------------- Focus trap (detail panel) --------------------
  var panel = document.getElementById('detail-panel');
  var lastFocus = null;

  function trap(e) {
    if (!panel || panel.classList.contains('panel-hidden')) return;
    if (e.key !== 'Tab') return;
    var focusables = Array.prototype.slice.call(panel.querySelectorAll(FOCUSABLE));
    focusables = focusables.filter(function (el) {
      return !el.hasAttribute('hidden') && el.offsetParent !== null;
    });
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus(); e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus(); e.preventDefault();
    }
  }

  document.addEventListener('keydown', trap);

  // When the panel opens, remember prior focus and move focus inside.
  // We piggyback on the aria-hidden attribute changes that OpShopPanel manages.
  if (panel) {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName !== 'aria-hidden') return;
        var hidden = panel.getAttribute('aria-hidden') !== 'false';
        if (!hidden) {
          lastFocus = document.activeElement;
          var close = document.getElementById('panel-close');
          if (close) close.focus();
        } else if (lastFocus && typeof lastFocus.focus === 'function') {
          lastFocus.focus();
          lastFocus = null;
        }
      });
    });
    observer.observe(panel, { attributes: true });
  }

  // -------------------- Global keyboard shortcuts --------------------
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (e.key === '/') {
      var input = document.getElementById('search-input');
      if (input && !input.disabled) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    }
  });
})();
