// haptics.js — Tiny vibration on filter chip taps + favourite toggle.
// Android Chrome supports navigator.vibrate. iOS Safari ignores it gracefully.
(function () {
  'use strict';

  var supported = typeof navigator !== 'undefined' &&
                  typeof navigator.vibrate === 'function';

  function buzz(ms) {
    if (!supported) return;
    try { navigator.vibrate(ms); } catch (e) { /* ignore */ }
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    if (!supported) return;

    // Chip taps — light tick
    document.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (chip) buzz(8);
    });

    // Favourite save / unsave — a slightly stronger pulse
    var favBtn = document.getElementById('panel-fav');
    if (favBtn) favBtn.addEventListener('click', function () { buzz(15); });

    // Locate button — confirmation pulse on success
    window.addEventListener('opshops:located', function () { buzz([10, 60, 10]); });

    // Surprise — fun double-tick
    var surprise = document.querySelector('[data-chip="surprise"]');
    if (surprise) surprise.addEventListener('click', function () { buzz([8, 50, 8]); });
  });

  window.OpShopHaptics = { buzz: buzz, supported: supported };
})();
