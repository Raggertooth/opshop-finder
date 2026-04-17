// visited.js — Track per-shop last-visited timestamps in localStorage
(function () {
  'use strict';

  var STORAGE_KEY = 'opshop:visited:v1';
  var visits = {};   // id -> timestamp (ms)

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) visits = JSON.parse(raw) || {};
    } catch (e) { visits = {}; }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(visits)); }
    catch (e) { /* ignore */ }
  }

  function idOf(shop) {
    return (shop.address + '|' + shop.suburb).toLowerCase();
  }

  function record(shop) {
    if (!shop) return;
    visits[idOf(shop)] = Date.now();
    save();
  }

  function lastVisit(shop) {
    return visits[idOf(shop)] || null;
  }

  function relative(ts) {
    if (!ts) return null;
    var diff = Date.now() - ts;
    var s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    var m = Math.floor(s / 60);
    if (m < 60) return m + ' minute' + (m === 1 ? '' : 's') + ' ago';
    var h = Math.floor(m / 60);
    if (h < 24) return h + ' hour' + (h === 1 ? '' : 's') + ' ago';
    var d = Math.floor(h / 24);
    if (d < 7) return d + ' day' + (d === 1 ? '' : 's') + ' ago';
    var w = Math.floor(d / 7);
    if (w < 5) return w + ' week' + (w === 1 ? '' : 's') + ' ago';
    var mo = Math.floor(d / 30);
    if (mo < 12) return mo + ' month' + (mo === 1 ? '' : 's') + ' ago';
    var y = Math.floor(d / 365);
    return y + ' year' + (y === 1 ? '' : 's') + ' ago';
  }

  load();

  window.OpShopVisited = {
    record: record,
    lastVisit: lastVisit,
    relative: relative
  };
})();
