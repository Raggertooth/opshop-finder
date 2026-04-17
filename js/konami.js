// konami.js — Easter egg: ↑↑↓↓←→←→BA unlocks the Thrift Scoreboard.
// Once unlocked, a 🏆 button persists in the corner.
(function () {
  'use strict';

  var SEQUENCE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  var UNLOCK_KEY = 'opshop:scoreboard-unlocked:v1';

  var RANKS = [
    { min: 0,  title: 'Window Shopper',     emoji: '👀' },
    { min: 1,  title: 'Curious',            emoji: '🔍' },
    { min: 5,  title: 'Bargain Spotter',    emoji: '💰' },
    { min: 10, title: 'Op Shop Regular',    emoji: '🛍️' },
    { min: 20, title: 'Thrift Detective',   emoji: '🕵️' },
    { min: 30, title: 'Op Shop Connoisseur',emoji: '🎩' },
    { min: 40, title: 'Master Op Shopper',  emoji: '👑' }
  ];

  function rank(count) {
    for (var i = RANKS.length - 1; i >= 0; i--) {
      if (count >= RANKS[i].min) return RANKS[i];
    }
    return RANKS[0];
  }

  function nextRank(count) {
    for (var i = 0; i < RANKS.length; i++) {
      if (RANKS[i].min > count) return RANKS[i];
    }
    return null;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function isUnlocked() {
    try { return localStorage.getItem(UNLOCK_KEY) === '1'; }
    catch (e) { return false; }
  }
  function unlock() {
    try { localStorage.setItem(UNLOCK_KEY, '1'); }
    catch (e) { /* ignore */ }
  }

  function gatherStats() {
    if (!window.OpShopData) return null;
    var shops = window.OpShopData.all();
    var byId = {};
    shops.forEach(function (s) {
      var id = (s.address + '|' + s.suburb).toLowerCase();
      byId[id] = s;
    });

    var visits = {};
    try { visits = JSON.parse(localStorage.getItem('opshop:visited:v1') || '{}'); }
    catch (e) { visits = {}; }

    var visited = Object.keys(visits)
      .map(function (id) { return { id: id, ts: visits[id], shop: byId[id] }; })
      .filter(function (v) { return v.shop; });

    var total = visited.length;
    var totalShops = shops.length;

    var byCharity = {};
    visited.forEach(function (v) {
      var c = v.shop.charity || 'Other';
      byCharity[c] = (byCharity[c] || 0) + 1;
    });

    var bySuburb = {};
    visited.forEach(function (v) {
      var s = v.shop.suburb || 'Unknown';
      bySuburb[s] = (bySuburb[s] || 0) + 1;
    });

    var firstVisit = visited.reduce(function (m, v) {
      return (m == null || v.ts < m) ? v.ts : m;
    }, null);

    var mostRecent = visited.slice().sort(function (a, b) { return b.ts - a.ts; })[0];

    return {
      total: total,
      totalShops: totalShops,
      coverage: totalShops ? Math.round(100 * total / totalShops) : 0,
      byCharity: byCharity,
      bySuburb: bySuburb,
      topSuburb: Object.keys(bySuburb).sort(function (a, b) {
        return bySuburb[b] - bySuburb[a];
      })[0],
      topCharity: Object.keys(byCharity).sort(function (a, b) {
        return byCharity[b] - byCharity[a];
      })[0],
      firstVisit: firstVisit,
      mostRecent: mostRecent ? mostRecent.shop : null,
      favouritesCount: window.OpShopFavourites ? window.OpShopFavourites.count() : 0
    };
  }

  function buildModal() {
    var modal = document.createElement('div');
    modal.id = 'score-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="score-backdrop"></div>' +
      '<div class="score-card" role="dialog" aria-labelledby="score-title" aria-modal="true">' +
        '<button class="score-close" type="button" aria-label="Close">&times;</button>' +
        '<div class="score-header">' +
          '<div class="score-rank-emoji" id="score-emoji">🏆</div>' +
          '<h2 id="score-title">Thrift Scoreboard</h2>' +
          '<p class="score-rank-title" id="score-rank">—</p>' +
          '<p class="score-progress" id="score-progress"></p>' +
        '</div>' +
        '<div class="score-grid" id="score-grid"></div>' +
        '<div class="score-section" id="score-by-charity"></div>' +
        '<div class="score-section" id="score-by-suburb"></div>' +
        '<button class="btn-secondary" id="score-done" type="button" style="margin-top:16px;width:100%;">Close</button>' +
      '</div>';
    document.body.appendChild(modal);
    return modal;
  }

  function buildButton() {
    var btn = document.createElement('button');
    btn.id = 'scoreboard-btn';
    btn.type = 'button';
    btn.title = 'Thrift Scoreboard';
    btn.setAttribute('aria-label', 'Open Thrift Scoreboard');
    btn.textContent = '🏆';
    btn.hidden = !isUnlocked();
    document.body.appendChild(btn);
    return btn;
  }

  function fmtDate(ts) {
    if (!ts) return '—';
    var d = new Date(ts);
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderModal(modal) {
    var stats = gatherStats();
    if (!stats) return;
    var r = rank(stats.total);
    var nx = nextRank(stats.total);
    modal.querySelector('#score-emoji').textContent = r.emoji;
    modal.querySelector('#score-rank').textContent = r.title;
    modal.querySelector('#score-progress').textContent = nx
      ? (nx.min - stats.total) + ' more shop' + (nx.min - stats.total === 1 ? '' : 's') +
        ' to reach ' + nx.title + ' ' + nx.emoji
      : 'You have unlocked the highest rank. Legend.';

    modal.querySelector('#score-grid').innerHTML =
      tile('Shops viewed', stats.total + ' / ' + stats.totalShops) +
      tile('Coverage', stats.coverage + '%') +
      tile('Favourites saved', stats.favouritesCount) +
      tile('First visit', fmtDate(stats.firstVisit)) +
      tile('Top suburb', stats.topSuburb || '—') +
      tile('Top charity', stats.topCharity || '—');

    var charityKeys = Object.keys(stats.byCharity).sort(function (a, b) {
      return stats.byCharity[b] - stats.byCharity[a];
    });
    var charityHtml = charityKeys.length
      ? '<h4>Visits by charity</h4>' +
        charityKeys.map(function (c) {
          var n = stats.byCharity[c];
          var pct = Math.round(100 * n / stats.total);
          var colour = (window.OpShopData && window.OpShopData.colourFor)
            ? window.OpShopData.colourFor(c) : '#666';
          return '<div class="score-bar">' +
                   '<span class="score-bar-label">' + escapeHtml(c) + '</span>' +
                   '<div class="score-bar-track"><div class="score-bar-fill" style="width:' + pct +
                     '%;background:' + colour + '"></div></div>' +
                   '<span class="score-bar-count">' + n + '</span>' +
                 '</div>';
        }).join('')
      : '<h4>Visits by charity</h4><p style="color:var(--text-muted);font-size:0.85rem;">No visits yet.</p>';
    modal.querySelector('#score-by-charity').innerHTML = charityHtml;

    var suburbKeys = Object.keys(stats.bySuburb).sort(function (a, b) {
      return stats.bySuburb[b] - stats.bySuburb[a];
    }).slice(0, 5);
    var suburbHtml = suburbKeys.length
      ? '<h4>Top suburbs</h4>' +
        suburbKeys.map(function (s) {
          return '<div class="score-row"><span>' + escapeHtml(s) + '</span><strong>' +
                 stats.bySuburb[s] + '</strong></div>';
        }).join('')
      : '';
    modal.querySelector('#score-by-suburb').innerHTML = suburbHtml;
  }

  function tile(label, value) {
    return '<div class="score-tile"><span class="score-tile-label">' + escapeHtml(label) +
           '</span><strong class="score-tile-value">' + escapeHtml(value) + '</strong></div>';
  }

  ready(function () {
    var modal = buildModal();
    var btn = buildButton();

    function open() { renderModal(modal); modal.hidden = false; }
    function close() { modal.hidden = true; }

    btn.addEventListener('click', open);
    modal.querySelector('.score-close').addEventListener('click', close);
    modal.querySelector('#score-done').addEventListener('click', close);
    modal.querySelector('.score-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });

    // Konami listener
    var idx = 0;
    document.addEventListener('keydown', function (e) {
      var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      var expected = SEQUENCE[idx];
      if (key === expected) {
        idx++;
        if (idx === SEQUENCE.length) {
          idx = 0;
          unlock();
          btn.hidden = false;
          // Confetti-ish celebration: pulse the button
          btn.classList.add('score-unlocked');
          setTimeout(function () { btn.classList.remove('score-unlocked'); }, 2000);
          if (window.OpShopHaptics) window.OpShopHaptics.buzz([20, 80, 20, 80, 40]);
          var toast = document.getElementById('toast');
          if (toast) {
            toast.textContent = '🏆 Thrift Scoreboard unlocked!';
            toast.hidden = false;
            setTimeout(function () { toast.hidden = true; }, 3000);
          }
          setTimeout(open, 600);
        }
      } else {
        idx = key === SEQUENCE[0] ? 1 : 0;
      }
    });

    window.OpShopScoreboard = { open: open, close: close, unlock: function () { unlock(); btn.hidden = false; } };
  });
})();
