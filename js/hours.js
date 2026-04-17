// hours.js — Parse "Mon-Fri 9am-5pm, Sat 9am-2pm" style strings
(function () {
  'use strict';

  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function parseTime(str) {
    var m = str.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/);
    if (!m) return null;
    var h = parseInt(m[1], 10);
    var min = m[2] ? parseInt(m[2], 10) : 0;
    if (m[3] === 'pm' && h !== 12) h += 12;
    if (m[3] === 'am' && h === 12) h = 0;
    return h * 60 + min;
  }

  function parseDays(str) {
    var parts = str.trim().split('-');
    var start = DAY_INDEX[parts[0]];
    if (start === undefined) return [];
    if (parts.length === 1) return [start];
    var end = DAY_INDEX[parts[1]];
    if (end === undefined) return [];
    var out = [];
    for (var i = start; i <= end; i++) out.push(i);
    return out;
  }

  function parseHours(hoursStr) {
    if (!hoursStr) return [];
    return hoursStr.split(',').map(function (segment) {
      var m = segment.trim().match(/^(\S+)\s+(\S+)-(\S+)$/);
      if (!m) return null;
      var days = parseDays(m[1]);
      var open = parseTime(m[2]);
      var close = parseTime(m[3]);
      if (!days.length || open == null || close == null) return null;
      return { days: days, open: open, close: close };
    }).filter(Boolean);
  }

  function isOpenNow(hoursStr, now) {
    now = now || new Date();
    var day = now.getDay();
    var minutes = now.getHours() * 60 + now.getMinutes();
    return parseHours(hoursStr).some(function (slot) {
      return slot.days.indexOf(day) !== -1 && minutes >= slot.open && minutes < slot.close;
    });
  }

  window.OpShopHours = { parseHours: parseHours, isOpenNow: isOpenNow, DAYS: DAYS };
})();
