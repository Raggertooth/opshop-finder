// newsletter.js — "Get updates" email signup modal
// Replace NEWSLETTER_ENDPOINT with your Buttondown / Formspree / Mailchimp URL
// when you have one set up. Until then it falls back to opening a mailto:.
(function () {
  'use strict';

  var NEWSLETTER_ENDPOINT = '';   // e.g. 'https://buttondown.email/api/emails/embed-subscribe/opshopfinder'
  var ENDPOINT_FIELD = 'email';   // form field name expected by the endpoint
  var FALLBACK_TO = 'hello@opshopfinder.com.au';
  var DISMISSED_KEY = 'opshop:newsletter-dismissed:v1';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function buildModal() {
    var modal = document.createElement('div');
    modal.id = 'news-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="news-backdrop"></div>' +
      '<div class="news-card" role="dialog" aria-labelledby="news-title" aria-modal="true">' +
        '<button class="news-close" type="button" aria-label="Close">&times;</button>' +
        '<h3 id="news-title">Get updates</h3>' +
        '<p class="news-sub">A short email when we add new shops or expand to new regions. No spam, no third-party tracking. Unsubscribe any time.</p>' +
        '<form id="news-form">' +
          '<input type="email" id="news-email" name="' + ENDPOINT_FIELD + '" placeholder="you@example.com" required autocomplete="email">' +
          '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="display:none">' +
          '<button class="btn-directions" type="submit" id="news-submit">Subscribe</button>' +
        '</form>' +
        '<p class="news-success" hidden>Thanks! We\'ll be in touch.</p>' +
        '<p class="news-error" hidden>Sorry, something went wrong. Please try again.</p>' +
      '</div>';
    document.body.appendChild(modal);
    return modal;
  }

  ready(function () {
    var modal = buildModal();
    var form = modal.querySelector('#news-form');
    var emailInput = modal.querySelector('#news-email');
    var submitBtn = modal.querySelector('#news-submit');
    var successEl = modal.querySelector('.news-success');
    var errorEl = modal.querySelector('.news-error');

    function open() {
      successEl.hidden = true;
      errorEl.hidden = true;
      emailInput.value = '';
      modal.hidden = false;
      setTimeout(function () { emailInput.focus(); }, 50);
    }
    function close() { modal.hidden = true; }

    modal.querySelector('.news-close').addEventListener('click', close);
    modal.querySelector('.news-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      if (!email) return;

      // Mailto fallback when no endpoint configured
      if (!NEWSLETTER_ENDPOINT) {
        var subject = encodeURIComponent('OpShop Finder — newsletter signup');
        var body = encodeURIComponent('Please add me to the OpShop Finder updates list.\n\nEmail: ' + email);
        window.location.href = 'mailto:' + FALLBACK_TO + '?subject=' + subject + '&body=' + body;
        successEl.textContent = 'Opening your email app to confirm…';
        successEl.hidden = false;
        return;
      }

      successEl.hidden = true;
      errorEl.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing…';

      fetch(NEWSLETTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        successEl.textContent = 'Thanks! Check your email to confirm.';
        successEl.hidden = false;
        form.reset();
      }).catch(function () {
        errorEl.hidden = false;
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
      });
    });

    // Wire up trigger links — header menu + any [data-news-open]
    var triggers = document.querySelectorAll('[data-news-open], #header-menu nav a[href="/get-updates/"]');
    triggers.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        // Close the header dropdown if open
        var details = a.closest('details[open]');
        if (details) details.removeAttribute('open');
        open();
      });
    });

    window.OpShopNewsletter = { open: open, close: close };
  });
})();
