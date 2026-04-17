// favourites.js — localStorage-backed favourites: shopId = address|suburb
(function () {
  'use strict';

  var STORAGE_KEY = 'opshop:favourites:v1';
  var ids = new Set();

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) JSON.parse(raw).forEach(function (id) { ids.add(id); });
    } catch (e) { /* private mode / quota */ }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
    } catch (e) { /* ignore */ }
  }

  function shopId(shop) {
    return (shop.address + '|' + shop.suburb).toLowerCase();
  }

  function has(shop) { return ids.has(shopId(shop)); }
  function count() { return ids.size; }

  function toggle(shop) {
    var id = shopId(shop);
    if (ids.has(id)) ids.delete(id);
    else ids.add(id);
    save();
    window.dispatchEvent(new CustomEvent('opshops:favourites-changed', {
      detail: { shop: shop, isFavourite: ids.has(id), count: ids.size }
    }));
    return ids.has(id);
  }

  load();

  window.OpShopFavourites = {
    has: has,
    toggle: toggle,
    count: count,
    shopId: shopId
  };
})();
