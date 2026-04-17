// geolocation.js — "Near me" button: pan to user, sort by Haversine distance
(function () {
  'use strict';

  var btn = document.getElementById('locate-btn');
  var map = window.appMap;
  if (!btn || !map) return;

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

  btn.addEventListener('click', function () {
    if (!('geolocation' in navigator)) {
      showToast('Geolocation not supported on this device', 3000);
      return;
    }

    btn.disabled = true;
    showToast('Finding your location…');

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        btn.disabled = false;
        var here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        window.OpShopUserPos = here;
        placeUserMarker(here);
        map.setView([here.lat, here.lng], 14);

        if (window.OpShopData) {
          var shops = window.OpShopData.all();
          shops.forEach(function (s) {
            s._distanceKm = haversineKm(here, { lat: s.lat, lng: s.lng });
          });
          var nearest = shops.slice().sort(function (a, b) {
            return a._distanceKm - b._distanceKm;
          })[0];
          if (nearest) {
            showToast('Nearest: ' + nearest.name + ' (' + nearest._distanceKm.toFixed(1) + ' km)', 4000);
          }
          window.dispatchEvent(new CustomEvent('opshops:located', { detail: here }));
        } else {
          var toast = document.getElementById('toast');
          if (toast) toast.hidden = true;
        }
      },
      function (err) {
        btn.disabled = false;
        var msg = err.code === err.PERMISSION_DENIED
          ? 'Location access denied. Try search instead.'
          : 'Could not get your location.';
        showToast(msg, 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
})();
