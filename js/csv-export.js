// csv-export.js — Download currently-filtered shops as CSV
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function csvCell(v) {
    if (v === null || v === undefined) return '';
    var s = String(v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function buildCSV(shops) {
    var headers = ['Name', 'Charity', 'Address', 'Suburb', 'Postcode',
                   'Phone', 'Hours', 'Website', 'Latitude', 'Longitude',
                   'Categories', 'LastVerified'];
    var rows = [headers.join(',')];
    shops.forEach(function (s) {
      rows.push([
        s.name, s.charity, s.address, s.suburb, s.postcode,
        s.phone || '', s.hours || '', s.website || '',
        s.lat, s.lng,
        (s.categories || []).join('; '),
        s.lastVerified || ''
      ].map(csvCell).join(','));
    });
    return rows.join('\n');
  }

  function download(filename, csv) {
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  ready(function () {
    var btn = document.getElementById('csv-export');
    if (!btn) return;

    var matchedCache = [];
    window.addEventListener('opshops:filtered', function (e) {
      matchedCache = e.detail.matched || [];
    });
    window.addEventListener('opshops:loaded', function (e) {
      if (!matchedCache.length) matchedCache = e.detail || [];
    });

    btn.addEventListener('click', function () {
      var shops = matchedCache.length
        ? matchedCache
        : (window.OpShopData ? window.OpShopData.all() : []);
      if (!shops.length) return;
      var stamp = new Date().toISOString().slice(0, 10);
      download('opshops-gold-coast-' + stamp + '.csv', buildCSV(shops));
    });
  });
})();
