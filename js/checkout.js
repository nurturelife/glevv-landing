// Waitlist page: shows the selected plan, collects an email and sends it to Klaviyo.
(function () {
  var G = window.GLEEV, Cart = window.GleevCart, K = window.GleevKlaviyo;
  var $ = function (s) { return document.querySelector(s); };

  var s = Cart.summary();
  if (!s) { location.replace('index.html#plans'); return; }

  $('#wl-plan-name').textContent = 'Gleev 360° Biome · ' + s.plan.name + (s.qty > 1 ? ' × ' + s.qty : '');
  $('#wl-plan-price').textContent = s.plan.id === 'once' ? G.gbp(s.total) : s.plan.sub;

  if (K.knownEmail()) $('#wl-email').value = K.knownEmail();

  $('#wl-form').addEventListener('gleev:subscribed', function (e) {
    var em = e.detail.email;
    K.track('Joined Waitlist', { plan: s.planId, plan_name: s.name, quantity: s.qty }, s.total, em);
    $('#wl-form-view').style.display = 'none';
    $('#wl-done-email').textContent = em;
    $('#wl-done').style.display = 'flex';
    $('#wl-done h1').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  });
})();
