// surprise.js — Pick a random shop from the currently-filtered set, fly to it,
// open the detail panel. Respects active filters so "surprise" stays useful.
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  var lastVisited = null;   // avoid showing same shop twice in a row
  var matched = [];

  function pick() {
    var pool = (matched && matched.length)
      ? matched
      : (window.OpShopData ? window.OpShopData.all() : []);
    if (!pool.length) return;
    var candidates = pool.length > 1
      ? pool.filter(function (s) { return s !== lastVisited; })
      : pool;
    var shop = candidates[Math.floor(Math.random() * candidates.length)];
    lastVisited = shop;
    if (window.appMap) window.appMap.setView([shop.lat, shop.lng], 15);
    if (window.OpShopPanel) window.OpShopPanel.show(shop);
  }

  ready(function () {
    var btn = document.querySelector('[data-chip="surprise"]');
    if (!btn) return;

    btn.addEventListener('click', pick);

    window.addEventListener('opshops:filtered', function (e) {
      matched = e.detail.matched || [];
    });
    window.addEventListener('opshops:loaded', function (e) {
      if (!matched.length) matched = e.detail || [];
    });
  });
})();
