// voice-search.js — Web Speech API mic button next to the search input.
// Hides itself if the browser doesn't support SpeechRecognition.
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  // Trigger words that get stripped before applying the search query.
  // "find vinnies near me" → "vinnies"
  var STOPWORDS = ['find', 'show', 'me', 'op', 'shops?', 'shop', 'near', 'in',
                   'on', 'the', 'gold', 'coast', 'a', 'an', 'please', 'around'];
  var STOPRE = new RegExp('\\b(' + STOPWORDS.join('|') + ')\\b', 'gi');

  function clean(transcript) {
    return transcript.replace(STOPRE, ' ').replace(/\s+/g, ' ').trim();
  }

  ready(function () {
    var btn = document.getElementById('voice-btn');
    var input = document.getElementById('search-input');
    if (!btn || !input) return;
    if (!Recognition) { btn.hidden = true; return; }
    btn.hidden = false;

    var rec = new Recognition();
    rec.lang = 'en-AU';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    var listening = false;

    function start() {
      if (input.disabled) return;
      try {
        rec.start();
        listening = true;
        btn.classList.add('voice-listening');
        btn.setAttribute('aria-label', 'Stop listening');
        input.placeholder = 'Listening…';
      } catch (e) { /* already started */ }
    }

    function stop() {
      try { rec.stop(); } catch (e) { /* ignore */ }
      listening = false;
      btn.classList.remove('voice-listening');
      btn.setAttribute('aria-label', 'Search by voice');
      input.placeholder = 'Search suburb or postcode…';
    }

    btn.addEventListener('click', function () {
      if (listening) stop(); else start();
    });

    rec.addEventListener('result', function (e) {
      var raw = e.results[0][0].transcript || '';
      var query = clean(raw);
      input.value = query;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      // Force-trigger filter immediately (skip 300ms debounce)
      if (window.OpShopFilters) window.OpShopFilters.setQuery(query);
    });

    rec.addEventListener('end', stop);
    rec.addEventListener('error', function (e) {
      stop();
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        var toast = document.getElementById('toast');
        if (toast) {
          toast.textContent = 'Voice search unavailable: ' + e.error;
          toast.hidden = false;
          setTimeout(function () { toast.hidden = true; }, 3000);
        }
      }
    });
  });
})();
