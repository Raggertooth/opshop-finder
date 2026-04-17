// search.js — Suburb/postcode/name input. Populates autocomplete + dispatches to filters.
(function () {
  'use strict';

  var input = document.getElementById('search-input');
  var clearBtn = document.getElementById('search-clear');
  if (!input) return;

  var debounceTimer = null;

  function dispatch(value) {
    if (window.OpShopFilters) window.OpShopFilters.setQuery(value);
    if (clearBtn) clearBtn.hidden = !value;
  }

  input.addEventListener('input', function (e) {
    clearTimeout(debounceTimer);
    var value = e.target.value;
    debounceTimer = setTimeout(function () { dispatch(value); }, 300);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      input.value = '';
      dispatch('');
      input.focus();
    });
  }

  // Build suburb autocomplete once data is loaded
  window.addEventListener('opshops:loaded', function (e) {
    var datalist = document.getElementById('suburb-list');
    if (!datalist) return;
    var seen = new Set();
    e.detail.forEach(function (shop) { seen.add(shop.suburb); });
    var sorted = Array.from(seen).sort();
    datalist.innerHTML = sorted.map(function (s) {
      return '<option value="' + s + '"></option>';
    }).join('');
  });
})();
