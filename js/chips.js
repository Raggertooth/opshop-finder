// chips.js — Wire up filter chips (now inside a bottom sheet) and manage the sheet itself
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

    // Dynamic category chips — populate inside the sheet's Categories section
    window.addEventListener('opshops:loaded', function (e) {
      var row = document.getElementById('filter-categories-row');
      var section = document.getElementById('filter-section-categories');
      if (!row || !section) return;
      var seen = new Set();
      e.detail.forEach(function (shop) {
        (shop.categories || []).forEach(function (c) { seen.add(c); });
      });
      if (!seen.size) return;

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
        row.appendChild(chip);
      });
      section.hidden = false;
    });

    // Update filter count badge + reset visibility + empty-state when filters change
    var countBadge = document.getElementById('filter-count-badge');
    function countActive(s) {
      var n = 0;
      if (s.openNow) n++;
      if (s.openDay !== null && s.openDay !== undefined) n++;
      if (s.favouritesOnly) n++;
      if (s.charities && s.charities.length) n += s.charities.length;
      if (s.categories && s.categories.length) n += s.categories.length;
      return n;
    }
    window.addEventListener('opshops:filtered', function (e) {
      var s = e.detail.state;
      var matched = e.detail.matched || [];
      var active = s.query || countActive(s) > 0;
      if (resetChip) resetChip.hidden = !active;

      if (countBadge) {
        var n = countActive(s);
        if (n > 0) {
          countBadge.textContent = String(n);
          countBadge.hidden = false;
        } else {
          countBadge.hidden = true;
        }
      }

      var emptyEl = document.getElementById('map-empty');
      if (emptyEl) emptyEl.hidden = !(active && matched.length === 0);
    });

    var emptyReset = document.getElementById('empty-reset');
    if (emptyReset) {
      emptyReset.addEventListener('click', function () {
        if (resetChip) resetChip.click();
      });
    }

    // ── Bottom sheet open/close ─────────────────────────────────────────
    var openBtn = document.getElementById('filter-open-btn');
    var sheet = document.getElementById('filter-sheet');
    var overlay = document.getElementById('filter-sheet-overlay');
    var closeBtn = document.getElementById('filter-sheet-close');
    var doneBtn = document.getElementById('filter-sheet-done');

    function openSheet() {
      if (!sheet || !overlay) return;
      sheet.hidden = false;
      overlay.hidden = false;
      // next frame so transition runs
      requestAnimationFrame(function () {
        sheet.classList.add('filter-sheet-open');
        overlay.classList.add('filter-sheet-overlay-visible');
      });
      sheet.setAttribute('aria-hidden', 'false');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('filter-sheet-lock');
    }

    function closeSheet() {
      if (!sheet || !overlay) return;
      sheet.classList.remove('filter-sheet-open');
      overlay.classList.remove('filter-sheet-overlay-visible');
      sheet.setAttribute('aria-hidden', 'true');
      if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('filter-sheet-lock');
      // hide after transition ends
      setTimeout(function () {
        sheet.hidden = true;
        overlay.hidden = true;
      }, 250);
    }

    if (openBtn) openBtn.addEventListener('click', openSheet);
    if (overlay) overlay.addEventListener('click', closeSheet);
    if (closeBtn) closeBtn.addEventListener('click', closeSheet);
    if (doneBtn) doneBtn.addEventListener('click', closeSheet);

    // ESC key closes sheet
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet && !sheet.hidden) closeSheet();
    });

    // Swipe-down on sheet handle closes it
    if (sheet) {
      var dragStart = null;
      var handleEl = sheet.querySelector('.filter-sheet-handle');
      var startDrag = function (y) { dragStart = y; };
      var moveDrag = function (y) {
        if (dragStart === null) return;
        var dy = y - dragStart;
        if (dy > 0) sheet.style.transform = 'translateY(' + dy + 'px)';
      };
      var endDrag = function (y) {
        if (dragStart === null) return;
        var dy = y - dragStart;
        sheet.style.transform = '';
        if (dy > 80) closeSheet();
        dragStart = null;
      };
      if (handleEl) {
        handleEl.addEventListener('touchstart', function (e) { startDrag(e.touches[0].clientY); }, { passive: true });
        handleEl.addEventListener('touchmove',  function (e) { moveDrag(e.touches[0].clientY); }, { passive: true });
        handleEl.addEventListener('touchend',   function (e) { endDrag(e.changedTouches[0].clientY); }, { passive: true });
      }
    }
  });
})();
