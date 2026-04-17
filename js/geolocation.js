// geolocation.js — "Near me" button + on-load permission prompt
(function () {
  'use strict';

  var map = window.appMap;
  if (!map) return;

  var btn = document.getElementById('locate-btn');
  var promptEl = document.getElementById('geo-prompt');
  var allowBtn = document.getElementById('geo-prompt-allow');
  var denyBtn = document.getElementById('geo-prompt-deny');
  var userMarker = null;

  function haversineKm(a, b) {
    var R = 6371;
    var dLat = (b.lat - a.lat) * Math.PI / 180;
    var dLng = (b.lng - a.lng) * Math.PI / 180;
    var lat1 = a.lat * Math.PI / 180;
    var lat2 = b.lat * Math.PI / 180;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function showToast(msg, ms) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    if (ms) setTimeout(function () { toast.hidden = true; }, ms);
  }

  function hideToast() {
    var toast = document.getElementById('toast');
    if (toast) toast.hidden = true;
  }

  function placeUserMarker(latlng) {
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.circleMarker(latlng, {
      radius: 8,
      color: '#fff',
      weight: 2,
      fillColor: '#0066CC',
      fillOpacity: 0.9
    }).addTo(map);
  }

  function applyPosition(pos, opts) {
    var here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    window.OpShopUserPos = here;
    placeUserMarker(here);
    map.setView([here.lat, here.lng], 14);

    if (window.OpShopData) {
      var shops = window.OpShopData.all();
      shops.forEach(function (s) {
        s._distanceKm = haversineKm(here, { lat: s.lat, lng: s.lng });
      });
      if (opts && opts.showNearestToast) {
        var nearest = shops.slice().sort(function (a, b) {
          return a._distanceKm - b._distanceKm;
        })[0];
        if (nearest) {
          showToast('Nearest: ' + nearest.name + ' (' + nearest._distanceKm.toFixed(1) + ' km)', 4000);
        }
      }
      window.dispatchEvent(new CustomEvent('opshops:located', { detail: here }));
    }
  }

  function requestLocation(opts) {
    var verbose = !!(opts && opts.verbose);
    if (!('geolocation' in navigator)) {
      if (verbose) showToast('Geolocation not supported on this device', 3000);
      return;
    }
    if (btn) btn.disabled = true;
    if (verbose) showToast('Finding your location…');

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        if (btn) btn.disabled = false;
        applyPosition(pos, { showNearestToast: verbose });
        if (!verbose) hideToast();
      },
      function (err) {
        if (btn) btn.disabled = false;
        if (verbose) {
          var msg = err.code === err.PERMISSION_DENIED
            ? 'Location access denied. Try search instead.'
            : 'Could not get your location.';
          showToast(msg, 4000);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  if (btn) {
    btn.addEventListener('click', function () {
      requestLocation({ verbose: true });
    });
  }

  function hidePrompt() {
    if (promptEl) promptEl.hidden = true;
  }

  if (allowBtn) {
    allowBtn.addEventListener('click', function () {
      hidePrompt();
      requestLocation({ verbose: true });
    });
  }
  if (denyBtn) {
    denyBtn.addEventListener('click', function () {
      hidePrompt();
      try { sessionStorage.setItem('geoPromptDismissed', '1'); } catch (e) {}
    });
  }

  // On-load permission check — Option B flow
  function maybePromptOnLoad() {
    if (!promptEl) return;
    try {
      if (sessionStorage.getItem('geoPromptDismissed') === '1') return;
    } catch (e) {}

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
        if (result.state === 'granted') {
          requestLocation({ verbose: false });
        } else if (result.state === 'prompt') {
          promptEl.hidden = false;
        }
        // 'denied' → stay silent
      }).catch(function () {
        promptEl.hidden = false;
      });
    } else {
      promptEl.hidden = false;
    }
  }

  maybePromptOnLoad();
})();
