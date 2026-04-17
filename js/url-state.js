// url-state.js — Read deep-link params (?suburb=, ?shop=) on load
// and write panel-open state into history so back button works.
(function () {
  'use strict';

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function findShop(shops, shopSlug) {
    return shops.find(function (s) { return slug(s.name) === shopSlug; });
  }

  function findSuburb(shops, suburbSlug) {
    var match = shops.filter(function (s) { return slug(s.suburb) === suburbSlug; });
    return match.length ? match[0].suburb : null;
  }

  function findCharity(shops, charitySlug) {
    var match = shops.filter(function (s) { return slug(s.charity) === charitySlug; });
    return match.length ? match[0].charity : null;
  }

  function applyEmbedMode() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('embed') === '1' || params.get('embed') === 'true') {
      document.body.classList.add('embed-mode');
    }
  }
  // Apply embed class ASAP so initial paint is stripped-down
  if (document.body) applyEmbedMode();
  else document.addEventListener('DOMContentLoaded', applyEmbedMode);

  function applyFromURL() {
    if (!window.OpShopData) return;
    var params = new URLSearchParams(window.location.search);
    var shopSlug = params.get('shop');
    var suburbSlug = params.get('suburb');
    var charitySlug = params.get('charity');
    var shops = window.OpShopData.all();

    if (suburbSlug) {
      var suburb = findSuburb(shops, suburbSlug);
      if (suburb) {
        var input = document.getElementById('search-input');
        if (input) input.value = suburb;
        if (window.OpShopFilters) window.OpShopFilters.setQuery(suburb);
      }
    }

    if (charitySlug) {
      var charityName = findCharity(shops, charitySlug);
      var key = charityName && window.OpShopData.charityKey
        ? window.OpShopData.charityKey(charityName)
        : null;
      if (key && window.OpShopFilters) {
        window.OpShopFilters.toggleCharity(key);
        var chip = document.querySelector('[data-chip-charity="' + key + '"]');
        if (chip) {
          chip.setAttribute('aria-pressed', 'true');
          chip.classList.add('chip-active');
        }
      }
    }

    if (shopSlug) {
      var shop = findShop(shops, shopSlug);
      if (shop && window.OpShopPanel) {
        if (window.appMap) window.appMap.setView([shop.lat, shop.lng], 15);
        setTimeout(function () { window.OpShopPanel.show(shop, { fromUrl: true }); }, 300);
      }
    }
  }

  // Fire once data is loaded
  window.addEventListener('opshops:loaded', applyFromURL);

  // Re-apply when user uses back/forward — covers panel state changes
  window.addEventListener('popstate', function (e) {
    var state = e.state || {};
    if (state.shop && window.OpShopData) {
      var shop = findShop(window.OpShopData.all(), state.shop);
      if (shop && window.OpShopPanel) window.OpShopPanel.show(shop, { fromHistory: true });
    } else if (window.OpShopPanel) {
      window.OpShopPanel.hide({ fromHistory: true });
    }
  });

  window.OpShopURL = { slug: slug };
})();
