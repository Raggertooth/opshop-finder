// pull-refresh.js — Touch pull-to-refresh on the list view.
// On release past threshold: re-fetch shop data (bypassing SW cache) and
// dispatch opshops:loaded so other modules pick up the fresh data.
(function () {
  'use strict';

  var THRESHOLD = 70;
  var MAX_PULL = 120;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var listView = document.getElementById('list-view');
    if (!listView || !('ontouchstart' in window)) return;

    var indicator = document.createElement('div');
    indicator.id = 'pull-indicator';
    indicator.innerHTML =
      '<div class="pull-spinner"></div><span class="pull-label">Pull to refresh</span>';
    listView.insertBefore(indicator, listView.firstChild);

    var startY = 0;
    var dy = 0;
    var pulling = false;
    var refreshing = false;

    listView.addEventListener('touchstart', function (e) {
      if (refreshing) return;
      if (listView.scrollTop > 0) return;
      startY = e.touches[0].clientY;
      pulling = true;
      indicator.classList.remove('pull-snap');
    }, { passive: true });

    listView.addEventListener('touchmove', function (e) {
      if (!pulling || refreshing) return;
      dy = e.touches[0].clientY - startY;
      if (dy <= 0) { dy = 0; return; }
      if (listView.scrollTop > 0) { pulling = false; return; }
      var visible = Math.min(MAX_PULL, dy * 0.5);
      indicator.style.transform = 'translateY(' + visible + 'px)';
      indicator.querySelector('.pull-label').textContent =
        visible >= THRESHOLD ? 'Release to refresh' : 'Pull to refresh';
    }, { passive: true });

    listView.addEventListener('touchend', function () {
      if (!pulling || refreshing) return;
      pulling = false;
      indicator.classList.add('pull-snap');
      if (dy * 0.5 >= THRESHOLD) doRefresh();
      else indicator.style.transform = 'translateY(0)';
      dy = 0;
    });

    function doRefresh() {
      refreshing = true;
      indicator.style.transform = 'translateY(60px)';
      indicator.classList.add('pull-loading');
      indicator.querySelector('.pull-label').textContent = 'Refreshing…';

      fetch('data/gold-coast-opshops.json', { cache: 'no-cache' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (shops) {
          // Replace the global dataset and re-emit loaded so all consumers refresh
          if (window.OpShopData) {
            // markers.js owns its own internal allShops — re-dispatch loaded
            // event with the new payload so list-view re-renders. The map
            // markers won't change visually unless the data changed.
            window.dispatchEvent(new CustomEvent('opshops:loaded', { detail: shops }));
          }
          if (window.OpShopFilters) window.OpShopFilters.apply();
          finish('Up to date');
        })
        .catch(function () { finish('Refresh failed'); });
    }

    function finish(msg) {
      indicator.querySelector('.pull-label').textContent = msg;
      setTimeout(function () {
        indicator.style.transform = 'translateY(0)';
        indicator.classList.remove('pull-loading');
        refreshing = false;
      }, 700);
    }
  });
})();
