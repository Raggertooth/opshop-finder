// chips.js — Wire up Open-now and charity filter chips
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var openChip = document.querySelector('[data-chip="open-now"]');
    var charityChips = document.querySelectorAll('[data-chip-charity]');
    var resetChip = document.querySelector('[data-chip="reset"]');

    if (openChip) {
      openChip.addEventListener('click', function () {
        var on = openChip.getAttribute('aria-pressed') !== 'true';
        openChip.setAttribute('aria-pressed', on ? 'true' : 'false');
        openChip.classList.toggle('chip-active', on);
        if (window.OpShopFilters) window.OpShopFilters.setOpenNow(on);
      });
    }

    var dayChips = document.querySelectorAll('[data-chip="open-day"]');
    dayChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var on = chip.getAttribute('aria-pressed') !== 'true';
        // Mutually exclusive — un-toggle the others
        dayChips.forEach(function (c) {
          if (c !== chip) {
            c.setAttribute('aria-pressed', 'false');
            c.classList.remove('chip-active');
          }
        });
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
        chip.classList.toggle('chip-active', on);
        var day = on ? parseInt(chip.getAttribute('data-day'), 10) : null;
        if (window.OpShopFilters) window.OpShopFilters.setOpenDay(day);
      });
    });

    var favChip = document.querySelector('[data-chip="favourites"]');
    if (favChip) {
      favChip.addEventListener('click', function () {
        var on = favChip.getAttribute('aria-pressed') !== 'true';
        favChip.setAttribute('aria-pressed', on ? 'true' : 'false');
        favChip.classList.toggle('chip-active', on);
        if (window.OpShopFilters) window.OpShopFilters.setFavouritesOnly(on);
      });
    }

    charityChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var key = chip.getAttribute('data-chip-charity');
        var on = chip.getAttribute('aria-pressed') !== 'true';
        chip.setAttribute('aria-pressed', on ? 'true' : 'false');
        chip.classList.toggle('chip-active', on);
        if (window.OpShopFilters) window.OpShopFilters.toggleCharity(key);
      });
    });

    if (resetChip) {
      resetChip.addEventListener('click', function () {
        var input = document.getElementById('search-input');
        if (input) input.value = '';
        document.querySelectorAll('.chip[aria-pressed="true"]').forEach(function (c) {
          c.setAttribute('aria-pressed', 'false');
          c.classList.remove('chip-active');
        });
        if (window.OpShopFilters) window.OpShopFilters.reset();
      });
    }

    // Show / hide reset chip based on filter activity
    // Build category chips dynamically from data so chips only appear for
    // categories that actually exist in the dataset.
    window.addEventListener('opshops:loaded', function (e) {
      var strip = document.getElementById('filter-strip');
      if (!strip) return;
      var seen = new Set();
      e.detail.forEach(function (shop) {
        (shop.categories || []).forEach(function (c) { seen.add(c); });
      });
      if (!seen.size) return;

      var divider = document.createElement('span');
      divider.className = 'chip-divider';
      strip.insertBefore(divider, resetChip || null);

      Array.from(seen).sort().forEach(function (cat) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip chip-category';
        chip.setAttribute('data-chip-category', cat);
        chip.setAttribute('aria-pressed', 'false');
        chip.textContent = cat;
        chip.addEventListener('click', function () {
          var on = chip.getAttribute('aria-pressed') !== 'true';
          chip.setAttribute('aria-pressed', on ? 'true' : 'false');
          chip.classList.toggle('chip-active', on);
          if (window.OpShopFilters) window.OpShopFilters.toggleCategory(cat);
        });
        strip.insertBefore(chip, resetChip || null);
      });
    });

    window.addEventListener('opshops:filtered', function (e) {
      var s = e.detail.state;
      var matched = e.detail.matched || [];
      var active = s.query || s.openNow || s.favouritesOnly ||
                   (s.openDay !== null && s.openDay !== undefined) ||
                   (s.charities && s.charities.length) ||
                   (s.categories && s.categories.length);
      if (resetChip) resetChip.hidden = !active;

      var emptyEl = document.getElementById('map-empty');
      if (emptyEl) emptyEl.hidden = !(active && matched.length === 0);
    });

    var emptyReset = document.getElementById('empty-reset');
    if (emptyReset) {
      emptyReset.addEventListener('click', function () {
        if (resetChip) resetChip.click();
      });
    }
  });
})();
