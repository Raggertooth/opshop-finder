// recent.js — Track last N viewed shops in localStorage
(function () {
  'use strict';

  var STORAGE_KEY = 'opshop:recent:v1';
  var MAX = 5;
  var recent = [];

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) recent = JSON.parse(raw);
      if (!Array.isArray(recent)) recent = [];
    } catch (e) { recent = []; }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recent)); }
    catch (e) { /* ignore */ }
  }

  function idOf(shop) {
    return (shop.address + '|' + shop.suburb).toLowerCase();
  }

  function push(shop) {
    if (!shop) return;
    var id = idOf(shop);
    recent = recent.filter(function (r) { return r.id !== id; });
    recent.unshift({ id: id, name: shop.name, charity: shop.charity });
    if (recent.length > MAX) recent.length = MAX;
    save();
    window.dispatchEvent(new CustomEvent('opshops:recent-changed', {
      detail: { recent: recent.slice() }
    }));
  }

  function list() { return recent.slice(); }

  function findShopById(id) {
    if (!window.OpShopData) return null;
    return window.OpShopData.all().find(function (s) { return idOf(s) === id; }) || null;
  }

  load();

  window.OpShopRecent = {
    push: push,
    list: list,
    findShopById: findShopById
  };
})();
