// filters.js — Central filter state. All UI controls dispatch into here.
(function () {
  'use strict';

  var state = {
    query: '',
    openNow: false,
    openDay: null,        // 0=Sun .. 6=Sat
    charities: new Set(),
    categories: new Set(),
    favouritesOnly: false
  };

  function matchQuery(shop, q) {
    if (!q) return true;
    var t = q.trim().toLowerCase();
    if (!t) return true;
    return shop.suburb.toLowerCase().indexOf(t) !== -1 ||
           shop.postcode.indexOf(t) !== -1 ||
           shop.name.toLowerCase().indexOf(t) !== -1;
  }

  function matchOpen(shop) {
    if (!state.openNow) return true;
    return window.OpShopHours && window.OpShopHours.isOpenNow(shop.hours);
  }

  function matchOpenDay(shop) {
    if (state.openDay === null) return true;
    if (!window.OpShopHours) return true;
    var slots = window.OpShopHours.parseHours(shop.hours);
    return slots.some(function (s) { return s.days.indexOf(state.openDay) !== -1; });
  }

  function matchCharity(shop) {
    if (!state.charities.size) return true;
    if (!window.OpShopData) return true;
    return state.charities.has(window.OpShopData.charityKey(shop.charity));
  }

  function matchFavourites(shop) {
    if (!state.favouritesOnly) return true;
    return window.OpShopFavourites && window.OpShopFavourites.has(shop);
  }

  function matchCategory(shop) {
    if (!state.categories.size) return true;
    var cats = shop.categories || [];
    for (var i = 0; i < cats.length; i++) {
      if (state.categories.has(cats[i])) return true;
    }
    return false;
  }

  function compute() {
    if (!window.OpShopData) return [];
    return window.OpShopData.all().filter(function (shop) {
      return matchQuery(shop, state.query) &&
             matchOpen(shop) &&
             matchOpenDay(shop) &&
             matchCharity(shop) &&
             matchCategory(shop) &&
             matchFavourites(shop);
    });
  }

  function apply(opts) {
    var matched = compute();
    if (window.OpShopData) window.OpShopData.setVisible(matched);
    window.dispatchEvent(new CustomEvent('opshops:filtered', {
      detail: { matched: matched, state: snapshot() }
    }));
    if (opts && opts.fitBounds && matched.length && window.appMap) {
      var bounds = L.latLngBounds(matched.map(function (s) { return [s.lat, s.lng]; }));
      window.appMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (opts && opts.fitBounds && !matched.length) {
      var toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = 'No shops match these filters';
        toast.hidden = false;
        setTimeout(function () { toast.hidden = true; }, 2400);
      }
    }
  }

  function snapshot() {
    return {
      query: state.query,
      openNow: state.openNow,
      openDay: state.openDay,
      charities: Array.from(state.charities),
      categories: Array.from(state.categories),
      favouritesOnly: state.favouritesOnly
    };
  }

  function setQuery(q) {
    state.query = q || '';
    apply({ fitBounds: !!state.query });
  }

  function setOpenNow(on) {
    state.openNow = !!on;
    apply();
  }

  function toggleCharity(key) {
    if (state.charities.has(key)) state.charities.delete(key);
    else state.charities.add(key);
    apply();
  }

  function setFavouritesOnly(on) {
    state.favouritesOnly = !!on;
    apply();
  }

  function setOpenDay(day) {
    state.openDay = (day === null || day === undefined) ? null : day;
    apply();
  }

  function toggleCategory(key) {
    if (state.categories.has(key)) state.categories.delete(key);
    else state.categories.add(key);
    apply();
  }

  function reset() {
    state.query = '';
    state.openNow = false;
    state.openDay = null;
    state.charities.clear();
    state.categories.clear();
    state.favouritesOnly = false;
    apply();
  }

  window.OpShopFilters = {
    state: snapshot,
    setQuery: setQuery,
    setOpenNow: setOpenNow,
    setOpenDay: setOpenDay,
    toggleCharity: toggleCharity,
    toggleCategory: toggleCategory,
    setFavouritesOnly: setFavouritesOnly,
    reset: reset,
    apply: apply
  };

  // Recompute when data first loads
  window.addEventListener('opshops:loaded', function () { apply(); });
  // Recompute when favourites change while filtered
  window.addEventListener('opshops:favourites-changed', function () {
    if (state.favouritesOnly) apply();
  });
})();
