// heatmap.js — Toggle a Leaflet.heat density overlay (uses currently-filtered shops)
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  var heatLayer = null;
  var matched = [];
  var active = false;

  function buildHeatLayer(shops) {
    if (typeof L === 'undefined' || typeof L.heatLayer !== 'function') return null;
    var points = shops.map(function (s) { return [s.lat, s.lng, 1]; });
    return L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 15,
      gradient: { 0.3: '#0066CC', 0.6: '#f5b400', 0.9: '#E60000' }
    });
  }

  function refresh() {
    if (!active || !window.appMap) return;
    if (heatLayer) window.appMap.removeLayer(heatLayer);
    heatLayer = buildHeatLayer(matched.length ? matched : []);
    if (heatLayer) heatLayer.addTo(window.appMap);
  }

  function setActive(on) {
    active = !!on;
    if (active) refresh();
    else if (heatLayer && window.appMap) {
      window.appMap.removeLayer(heatLayer);
      heatLayer = null;
    }
  }

  ready(function () {
    var btn = document.querySelector('[data-chip="heatmap"]');
    if (!btn) return;

    if (typeof L === 'undefined' || typeof L.heatLayer !== 'function') {
      btn.hidden = true;
      return;
    }

    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.classList.toggle('chip-active', on);
      setActive(on);
    });

    window.addEventListener('opshops:filtered', function (e) {
      matched = e.detail.matched || [];
      if (active) refresh();
    });
    window.addEventListener('opshops:loaded', function (e) {
      if (!matched.length) matched = e.detail || [];
    });
  });
})();
