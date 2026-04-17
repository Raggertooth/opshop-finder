// op-shop-run.js — "Op-Shop Run" route planner
// Builds a Google Maps directions URL with waypoints from saved favourites
// (or current map-visible shops if no favourites yet). Opens a modal with
// reorderable list, "start from current location" toggle, and "Open in Maps".
(function () {
  'use strict';

  var GOOGLE_MAPS_DIR = 'https://www.google.com/maps/dir/?api=1';
  var APPLE_MAPS = 'https://maps.apple.com/';
  var MAX_WAYPOINTS = 8;  // Google Maps limit (origin + 8 waypoints + destination)
  var IS_APPLE = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function favouriteShops() {
    if (!window.OpShopFavourites || !window.OpShopData) return [];
    return window.OpShopData.all().filter(function (s) {
      return window.OpShopFavourites.has(s);
    });
  }

  function colourFor(charity) {
    return (window.OpShopData && window.OpShopData.colourFor)
      ? window.OpShopData.colourFor(charity) : '#666';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildGoogleUrl(stops, startFromHere) {
    if (!stops.length) return null;
    var params = ['travelmode=driving'];
    var origin;
    var rest = stops.slice();

    if (startFromHere && window.OpShopUserPos) {
      origin = window.OpShopUserPos.lat + ',' + window.OpShopUserPos.lng;
    } else {
      var first = rest.shift();
      origin = first.lat + ',' + first.lng;
    }
    params.push('origin=' + encodeURIComponent(origin));

    if (!rest.length) {
      params.push('destination=' + encodeURIComponent(origin));
      return GOOGLE_MAPS_DIR + '&' + params.join('&');
    }

    var dest = rest.pop();
    params.push('destination=' + encodeURIComponent(dest.lat + ',' + dest.lng));

    if (rest.length) {
      var wp = rest.map(function (s) { return s.lat + ',' + s.lng; }).join('|');
      params.push('waypoints=' + encodeURIComponent(wp));
    }
    return GOOGLE_MAPS_DIR + '&' + params.join('&');
  }

  function buildAppleUrl(stops, startFromHere) {
    if (!stops.length) return null;
    var rest = stops.slice();
    var params = ['dirflg=d'];

    if (startFromHere && window.OpShopUserPos) {
      params.push('saddr=' + encodeURIComponent(
        window.OpShopUserPos.lat + ',' + window.OpShopUserPos.lng));
    } else {
      var first = rest.shift();
      params.push('saddr=' + encodeURIComponent(first.lat + ',' + first.lng));
    }

    if (!rest.length) return APPLE_MAPS + '?' + params.join('&');

    // daddr supports +to: separator for multi-stop in Apple Maps native app
    var daddr = rest.map(function (s) { return s.lat + ',' + s.lng; }).join('+to:');
    params.push('daddr=' + encodeURIComponent(daddr).replace(/%2Bto%3A/g, '+to:'));
    return APPLE_MAPS + '?' + params.join('&');
  }

  ready(function () {
    var btn = document.createElement('button');
    btn.id = 'run-btn';
    btn.type = 'button';
    btn.hidden = true;
    btn.setAttribute('aria-label', 'Plan an Op-Shop Run');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4H8a4 4 0 0 1-4-4V3"/></svg> <span>Op-Shop Run</span>';
    document.body.appendChild(btn);

    var modal = document.createElement('div');
    modal.id = 'run-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="run-backdrop"></div>' +
      '<div class="run-card" role="dialog" aria-labelledby="run-title" aria-modal="true">' +
        '<button class="run-close" type="button" aria-label="Close">&times;</button>' +
        '<h3 id="run-title">Plan your Op-Shop Run</h3>' +
        '<p class="run-sub">We\'ll route you through your favourite shops in the order shown. Drag to reorder.</p>' +
        '<label class="run-here">' +
          '<input type="checkbox" id="run-from-here"> Start from my current location' +
        '</label>' +
        '<ol class="run-stops" id="run-stops"></ol>' +
        '<p class="run-empty" id="run-empty" hidden>Save 2 or more shops to your favourites first, then plan your run.</p>' +
        '<p class="run-warn" id="run-warn" hidden></p>' +
        '<div class="run-actions" id="run-actions"></div>' +
      '</div>';
    document.body.appendChild(modal);

    var stopsEl = modal.querySelector('#run-stops');
    var emptyEl = modal.querySelector('#run-empty');
    var warnEl = modal.querySelector('#run-warn');
    var fromHereEl = modal.querySelector('#run-from-here');
    var actionsEl = modal.querySelector('#run-actions');
    var stops = [];

    // Build action buttons in platform-preferred order (Apple Maps first on Apple devices)
    var cancelBtn = '<button class="btn-secondary" id="run-cancel" type="button">Cancel</button>';
    var appleBtn = '<a class="btn-directions run-cta-apple" id="run-apple" target="_blank" rel="noopener">Apple Maps</a>';
    var googleBtn = '<a class="btn-directions run-cta-google" id="run-google" target="_blank" rel="noopener">Google Maps</a>';
    actionsEl.innerHTML = IS_APPLE
      ? cancelBtn + appleBtn + googleBtn
      : cancelBtn + googleBtn + appleBtn;
    var googleLink = actionsEl.querySelector('#run-google');
    var appleLink = actionsEl.querySelector('#run-apple');

    function renderStops() {
      stopsEl.innerHTML = '';
      if (!stops.length) {
        emptyEl.hidden = false;
        if (googleLink) googleLink.hidden = true;
        if (appleLink) appleLink.hidden = true;
        warnEl.hidden = true;
        return;
      }
      emptyEl.hidden = true;
      if (googleLink) googleLink.hidden = false;
      if (appleLink) appleLink.hidden = false;

      var capped = stops.slice(0, MAX_WAYPOINTS + 2);
      var truncated = stops.length > capped.length;
      warnEl.hidden = !truncated;
      if (truncated) {
        warnEl.textContent = 'Google Maps supports a max of ' +
          (MAX_WAYPOINTS + 2) + ' stops per route. Showing the first ' +
          capped.length + '.';
      }

      capped.forEach(function (shop, idx) {
        var li = document.createElement('li');
        li.draggable = true;
        li.dataset.idx = idx;
        li.innerHTML =
          '<span class="run-num">' + (idx + 1) + '</span>' +
          '<span class="run-dot" style="background:' + colourFor(shop.charity) + '"></span>' +
          '<span class="run-name">' + escapeHtml(shop.name) + '<br>' +
            '<small>' + escapeHtml(shop.suburb) + '</small></span>' +
          '<button class="run-remove" type="button" aria-label="Remove stop">&times;</button>';
        stopsEl.appendChild(li);
      });

      if (googleLink) googleLink.href = buildGoogleUrl(capped, fromHereEl.checked) || '#';
      if (appleLink) appleLink.href = buildAppleUrl(capped, fromHereEl.checked) || '#';
    }

    function open() {
      stops = favouriteShops();
      fromHereEl.checked = !!window.OpShopUserPos && stops.length > 0;
      renderStops();
      modal.hidden = false;
    }

    function close() { modal.hidden = true; }

    btn.addEventListener('click', open);
    modal.querySelector('.run-close').addEventListener('click', close);
    actionsEl.querySelector('#run-cancel').addEventListener('click', close);
    modal.querySelector('.run-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });

    fromHereEl.addEventListener('change', renderStops);

    stopsEl.addEventListener('click', function (e) {
      var rm = e.target.closest('.run-remove');
      if (!rm) return;
      var idx = parseInt(rm.parentNode.dataset.idx, 10);
      stops.splice(idx, 1);
      renderStops();
    });

    // Drag-to-reorder
    var dragIdx = null;
    stopsEl.addEventListener('dragstart', function (e) {
      var li = e.target.closest('li');
      if (!li) return;
      dragIdx = parseInt(li.dataset.idx, 10);
      li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    stopsEl.addEventListener('dragover', function (e) {
      e.preventDefault();
      var li = e.target.closest('li');
      if (li) li.classList.add('drag-over');
    });
    stopsEl.addEventListener('dragleave', function (e) {
      var li = e.target.closest('li');
      if (li) li.classList.remove('drag-over');
    });
    stopsEl.addEventListener('drop', function (e) {
      e.preventDefault();
      var li = e.target.closest('li');
      if (!li || dragIdx === null) return;
      var dropIdx = parseInt(li.dataset.idx, 10);
      if (dropIdx !== dragIdx) {
        var [moved] = stops.splice(dragIdx, 1);
        stops.splice(dropIdx, 0, moved);
        renderStops();
      }
      dragIdx = null;
    });
    stopsEl.addEventListener('dragend', function () {
      stopsEl.querySelectorAll('.dragging,.drag-over').forEach(function (el) {
        el.classList.remove('dragging'); el.classList.remove('drag-over');
      });
      dragIdx = null;
    });

    function refreshButton() {
      btn.hidden = favouriteShops().length < 2;
    }

    window.addEventListener('opshops:loaded', refreshButton);
    window.addEventListener('opshops:favourites-changed', refreshButton);

    window.OpShopRun = { open: open, close: close };
  });
})();
