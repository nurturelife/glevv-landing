// Klaviyo client-side helpers (public API key only, no server needed).
// Docs: https://developers.klaviyo.com/en/reference/create_client_subscription
(function () {
  var C = window.GLEEV_CONFIG || {};
  var REVISION = '2024-10-15';
  var EMAIL_KEY = 'gleev.email';

  function isLive() { return !C.DRY_RUN && !!C.KLAVIYO_COMPANY_ID && !!C.KLAVIYO_LIST_ID; }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim()); }

  function knownEmail() { try { return localStorage.getItem(EMAIL_KEY) || ''; } catch (e) { return ''; } }
  function rememberEmail(email) { try { localStorage.setItem(EMAIL_KEY, email); } catch (e) {} }

  function post(path, body) {
    if (!isLive()) {
      console.info('[Klaviyo dry run] ' + path, JSON.stringify(body, null, 2));
      return Promise.resolve({ dryRun: true });
    }
    return fetch('https://a.klaviyo.com/client/' + path + '/?company_id=' + encodeURIComponent(C.KLAVIYO_COMPANY_ID), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'revision': REVISION },
      body: JSON.stringify(body)
    }).then(function (res) {
      if (!res.ok) throw new Error('Klaviyo responded ' + res.status);
      return { ok: true };
    });
  }

  function subscribe(email, opts) {
    opts = opts || {};
    var properties = Object.assign({ source: opts.source || 'website', page: location.pathname }, opts.properties || {});
    rememberEmail(email);
    return post('subscriptions', {
      data: {
        type: 'subscription',
        attributes: {
          custom_source: properties.source,
          profile: { data: { type: 'profile', attributes: { email: email, properties: properties } } }
        },
        relationships: { list: { data: { type: 'list', id: C.KLAVIYO_LIST_ID || 'LIST_ID' } } }
      }
    });
  }

  // Events need a known profile, so they only fire once we have an email.
  function track(name, props, value, email) {
    email = email || knownEmail();
    if (!C.TRACK_EVENTS || !email) return Promise.resolve();
    return post('events', {
      data: {
        type: 'event',
        attributes: {
          properties: props || {},
          value: value || 0,
          metric: { data: { type: 'metric', attributes: { name: name } } },
          profile: { data: { type: 'profile', attributes: { email: email } } }
        }
      }
    }).catch(function (e) { console.warn('Klaviyo event failed', e); });
  }

  // Wire every <form data-klaviyo-form data-source="...">
  function bindForms() {
    var boundAt = Date.now();
    document.querySelectorAll('form[data-klaviyo-form]').forEach(function (form) {
      var msg = form.querySelector('.form-msg');
      var btn = form.querySelector('button[type=submit]');
      function say(text, kind) { if (msg) { msg.textContent = text; msg.className = 'form-msg ' + (kind || ''); } }
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var email = (form.elements.email.value || '').trim();
        var consent = form.elements.consent;
        // Spam traps: a filled honeypot, or a submit faster than a human could manage. Bots get a fake success.
        var botLike = (form.elements.company && form.elements.company.value) || (Date.now() - boundAt < 2000);
        if (botLike) { say(form.dataset.success || "Thanks! You're on the list.", 'ok'); return; }
        if (!validEmail(email)) { say('Please enter a valid email address.', 'err'); form.elements.email.focus(); return; }
        if (consent && !consent.checked) { say('Please tick the box to agree to receive emails.', 'err'); return; }
        var label = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        say('');
        var plan = window.GleevCart && window.GleevCart.summary();
        subscribe(email, { source: form.dataset.source, properties: plan ? { plan: plan.planId, plan_name: plan.name, quantity: plan.qty, plan_total: plan.total } : {} })
          .then(function () {
            say(form.dataset.success || "Thanks! You're on the list.", 'ok');
            form.dispatchEvent(new CustomEvent('gleev:subscribed', { bubbles: true, detail: { email: email } }));
            if (form.dataset.source === 'footer') form.reset();
          })
          .catch(function () { say('Something went wrong. Please try again in a moment.', 'err'); })
          .then(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
      });
    });
  }

  window.GleevKlaviyo = { subscribe: subscribe, track: track, validEmail: validEmail, knownEmail: knownEmail, rememberEmail: rememberEmail, isLive: isLive };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindForms); else bindForms();
})();
