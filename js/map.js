// map.js — Initialize Leaflet map centered on Gold Coast
(function () {
  'use strict';

  var map;
  try {
    map = L.map('map', {
      center: [-27.9833, 153.4000],
      zoom: 12,
      minZoom: 10,
      maxZoom: 19,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      detectRetina: true,
      crossOrigin: true
    }).addTo(map);

    // Recompute size once the layout has settled (fixes blurry tiles on first paint)
    setTimeout(function () { map.invalidateSize(); }, 0);
    window.addEventListener('load', function () { map.invalidateSize(); });

    // Expose globally for other modules
    window.appMap = map;
  } catch (e) {
    console.error('Map failed to load:', e);
    document.getElementById('map').style.display = 'none';
    document.getElementById('map-error').hidden = false;
  }
})();
