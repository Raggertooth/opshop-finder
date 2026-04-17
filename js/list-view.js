// list-view.js — Map/List toggle + scrollable distance-sorted shop list
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function statusPill(shop) {
    if (!window.OpShopHours) return '';
    var open = window.OpShopHours.isOpenNow(shop.hours);
    return '<span class="status-pill status-' + (open ? 'open' : 'closed') + '">' +
           (open ? 'Open now' : 'Closed') + '</span>';
  }

  function colourFor(charity) {
    return (window.OpShopData && window.OpShopData.colourFor)
      ? window.OpShopData.colourFor(charity) : '#666';
  }

  function distanceText(shop) {
    if (typeof shop._distanceKm !== 'number') return '';
    return '<span class="list-card-distance">' + shop._distanceKm.toFixed(1) + ' km</span>';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildCard(shop) {
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'list-card';
    card.innerHTML =
      '<span class="list-card-dot" style="background:' + colourFor(shop.charity) + '"></span>' +
      '<div class="list-card-body">' +
        '<div class="list-card-title">' + escapeHtml(shop.name) + statusPill(shop) + '</div>' +
        '<div class="list-card-meta">' +
          escapeHtml(shop.suburb) + ' · ' + escapeHtml(shop.charity) +
          distanceText(shop) +
        '</div>' +
      '</div>';
    card.addEventListener('click', function () {
      if (window.OpShopPanel) window.OpShopPanel.show(shop);
    });
    return card;
  }

  function sortShops(shops) {
    var hasDistance = shops.some(function (s) { return typeof s._distanceKm === 'number'; });
    return shops.slice().sort(function (a, b) {
      if (hasDistance) {
        var da = typeof a._distanceKm === 'number' ? a._distanceKm : Infinity;
        var db = typeof b._distanceKm === 'number' ? b._distanceKm : Infinity;
        if (da !== db) return da - db;
      }
      return a.name.localeCompare(b.name);
    });
  }

  ready(function () {
    var listView = document.getElementById('list-view');
    var listEl = document.getElementById('list-items');
    var emptyMsg = document.getElementById('list-empty');
    var mapContainer = document.getElementById('map-container');
    var toggleMap = document.querySelector('[data-view="map"]');
    var toggleList = document.querySelector('[data-view="list"]');
    if (!listView || !listEl || !toggleMap || !toggleList) return;

    var currentMatched = [];

    function render() {
      listEl.innerHTML = '';
      var sorted = sortShops(currentMatched);
      if (!sorted.length) {
        emptyMsg.hidden = false;
        return;
      }
      emptyMsg.hidden = true;
      var frag = document.createDocumentFragment();
      sorted.forEach(function (s) { frag.appendChild(buildCard(s)); });
      listEl.appendChild(frag);
    }

    function setView(mode) {
      var isList = mode === 'list';
      listView.hidden = !isList;
      mapContainer.hidden = isList;
      toggleMap.setAttribute('aria-pressed', isList ? 'false' : 'true');
      toggleList.setAttribute('aria-pressed', isList ? 'true' : 'false');
      toggleMap.classList.toggle('view-active', !isList);
      toggleList.classList.toggle('view-active', isList);
      if (isList) render();
      else if (window.appMap) setTimeout(function () { window.appMap.invalidateSize(); }, 0);
      try { localStorage.setItem('opshop:view:v1', mode); } catch (e) { /* ignore */ }
    }

    toggleMap.addEventListener('click', function () { setView('map'); });
    toggleList.addEventListener('click', function () { setView('list'); });

    window.addEventListener('opshops:filtered', function (e) {
      currentMatched = e.detail.matched || [];
      if (!listView.hidden) render();
    });

    window.addEventListener('opshops:located', function () {
      if (!listView.hidden) render();
    });

    var saved = null;
    try { saved = localStorage.getItem('opshop:view:v1'); } catch (e) { /* ignore */ }
    if (saved === 'list') setView('list');
  });
})();
