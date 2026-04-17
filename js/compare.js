// compare.js — Pick 2-4 shops, view side-by-side. Distinct from favourites.
(function () {
  'use strict';

  var STORAGE_KEY = 'opshop:compare:v1';
  var MAX = 4;
  var ids = [];   // ordered list of shop ids
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function load() {
    try { ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (e) { ids = []; }
    if (!Array.isArray(ids)) ids = [];
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); }
    catch (e) { /* ignore */ }
  }

  function idOf(shop) { return (shop.address + '|' + shop.suburb).toLowerCase(); }

  function has(shop) { return ids.indexOf(idOf(shop)) !== -1; }
  function count() { return ids.length; }
  function full() { return ids.length >= MAX; }

  function shops() {
    if (!window.OpShopData) return [];
    var all = window.OpShopData.all();
    return ids.map(function (id) {
      return all.find(function (s) { return idOf(s) === id; });
    }).filter(Boolean);
  }

  function add(shop) {
    if (has(shop)) return false;
    if (full()) return false;
    ids.push(idOf(shop));
    save();
    emit();
    return true;
  }

  function remove(shop) {
    var id = typeof shop === 'string' ? shop : idOf(shop);
    var idx = ids.indexOf(id);
    if (idx === -1) return;
    ids.splice(idx, 1);
    save();
    emit();
  }

  function clear() { ids = []; save(); emit(); }

  function emit() {
    window.dispatchEvent(new CustomEvent('opshops:compare-changed', {
      detail: { count: ids.length, full: full() }
    }));
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function dailyHours(shop) {
    if (!window.OpShopHours || !shop.hours) return [];
    var slots = window.OpShopHours.parseHours(shop.hours);
    return DAYS.map(function (_, i) {
      var slot = slots.find(function (s) { return s.days.indexOf(i) !== -1; });
      if (!slot) return 'Closed';
      return formatMinutes(slot.open) + '–' + formatMinutes(slot.close);
    });
  }

  function formatMinutes(min) {
    var h = Math.floor(min / 60);
    var m = min % 60;
    var suffix = h >= 12 ? 'pm' : 'am';
    var hh = h % 12 || 12;
    return m === 0 ? hh + suffix : hh + ':' + ('0' + m).slice(-2) + suffix;
  }

  // -------------------- UI --------------------
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var tray = document.createElement('button');
    tray.id = 'compare-tray';
    tray.type = 'button';
    tray.hidden = true;
    tray.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg> <span class="compare-count">0</span> compare';
    document.body.appendChild(tray);

    var modal = document.createElement('div');
    modal.id = 'compare-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="compare-backdrop"></div>' +
      '<div class="compare-card" role="dialog" aria-labelledby="compare-title" aria-modal="true">' +
        '<button class="compare-close" type="button" aria-label="Close">&times;</button>' +
        '<h3 id="compare-title">Compare shops</h3>' +
        '<p class="compare-sub">Side-by-side view of the shops you\'ve added to compare.</p>' +
        '<div class="compare-grid-wrap"><div class="compare-grid" id="compare-grid"></div></div>' +
        '<div class="compare-actions">' +
          '<button class="btn-secondary" id="compare-clear" type="button">Clear all</button>' +
          '<button class="btn-secondary" id="compare-done" type="button">Done</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    var trayCount = tray.querySelector('.compare-count');
    var grid = modal.querySelector('#compare-grid');

    function renderGrid() {
      var sh = shops();
      if (!sh.length) {
        grid.innerHTML = '<p style="text-align:center;padding:24px;color:var(--text-secondary);">No shops to compare yet. Tap "Compare" on any shop.</p>';
        return;
      }
      var html = '<table class="compare-table"><thead><tr><th></th>';
      sh.forEach(function (s) {
        var colour = (window.OpShopData && window.OpShopData.colourFor)
          ? window.OpShopData.colourFor(s.charity) : '#666';
        html += '<th><span class="charity-badge" style="background:' + colour + '">' +
                escapeHtml(s.charity) + '</span><br><strong>' + escapeHtml(s.name) +
                '</strong><button class="compare-remove" data-id="' + escapeHtml(idOf(s)) +
                '" aria-label="Remove">&times;</button></th>';
      });
      html += '</tr></thead><tbody>';

      function row(label, fn) {
        html += '<tr><th scope="row">' + label + '</th>';
        sh.forEach(function (s) { html += '<td>' + fn(s) + '</td>'; });
        html += '</tr>';
      }

      row('Suburb', function (s) { return escapeHtml(s.suburb); });
      row('Postcode', function (s) { return escapeHtml(s.postcode); });
      row('Phone', function (s) { return escapeHtml(s.phone || '—'); });
      row('Distance', function (s) {
        return typeof s._distanceKm === 'number' ? s._distanceKm.toFixed(1) + ' km' : '—';
      });
      row('Open now', function (s) {
        if (!window.OpShopHours) return '—';
        return window.OpShopHours.isOpenNow(s.hours) ? '✓ Open' : '✗ Closed';
      });

      // Daily hours (collapsed into one block per day)
      DAYS.forEach(function (d, i) {
        html += '<tr><th scope="row">' + d + '</th>';
        sh.forEach(function (s) {
          var hrs = dailyHours(s);
          html += '<td>' + escapeHtml(hrs[i] || 'Closed') + '</td>';
        });
        html += '</tr>';
      });

      row('Last visited', function (s) {
        if (!window.OpShopVisited) return '—';
        var ts = window.OpShopVisited.lastVisit(s);
        return ts ? window.OpShopVisited.relative(ts) : 'Never';
      });

      html += '</tbody></table>';
      grid.innerHTML = html;
    }

    function refreshTray() {
      trayCount.textContent = ids.length;
      tray.hidden = ids.length < 1;
    }

    tray.addEventListener('click', function () {
      renderGrid();
      modal.hidden = false;
    });

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('.compare-remove');
      if (!btn) return;
      remove(btn.getAttribute('data-id'));
      renderGrid();
    });

    function close() { modal.hidden = true; }
    modal.querySelector('.compare-close').addEventListener('click', close);
    modal.querySelector('.compare-backdrop').addEventListener('click', close);
    modal.querySelector('#compare-done').addEventListener('click', close);
    modal.querySelector('#compare-clear').addEventListener('click', function () {
      clear();
      renderGrid();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });

    window.addEventListener('opshops:compare-changed', refreshTray);

    load();
    refreshTray();

    window.OpShopCompare = {
      add: add, remove: remove, has: has, count: count, full: full, clear: clear,
      open: function () { renderGrid(); modal.hidden = false; }
    };
  });
})();
