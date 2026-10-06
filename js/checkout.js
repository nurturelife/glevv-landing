// Fake checkout: renders the basket, then reveals the "not available yet" waitlist step.
(function () {
  var G = window.GLEEV, Cart = window.GleevCart, K = window.GleevKlaviyo;
  var $ = function (s) { return document.querySelector(s); };

  var s = Cart.summary();
  if (!s) { location.replace('index.html#plans'); return; }

  function renderSummary() {
    s = Cart.summary();
    if (!s) { location.replace('index.html#plans'); return; }
    $('#co-lines').innerHTML = '<div class="line"><img src="assets/img/gallery-02-unboxed.webp" alt="" width="76" height="76">'
      + '<div class="info"><b>Gleev 360° Biome</b><span>' + s.plan.name + (s.qty > 1 ? ' × ' + s.qty : '') + '</span><span>' + s.plan.renew + '</span></div>'
      + '<b>' + G.gbp(s.total) + '</b></div>';
    $('#co-sum').innerHTML = '<div><span>Subtotal</span><span>' + G.gbp(s.total) + '</span></div><div><span>Delivery</span><span>Free</span></div>'
      + '<div class="total"><span>Total today</span><span>' + G.gbp(s.total) + '</span></div>';
    $('#wl-plan').textContent = 'the ' + s.plan.name.toLowerCase();
  }
  renderSummary();

  var email = $('#co-email');
  if (K.knownEmail()) email.value = K.knownEmail();

  $('#co-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('#co-msg');
    if (!K.validEmail(email.value)) { msg.textContent = 'Please enter a valid email address.'; email.focus(); return; }
    msg.textContent = '';
    K.rememberEmail(email.value.trim());
    K.track('Started Checkout', { plan: s.planId, plan_name: s.name }, s.total, email.value.trim());
    $('#co-grid').style.display = 'none';
    $('#waitlist').classList.add('is-on');
    $('#wl-email').value = email.value.trim();
    window.scrollTo(0, 0);
    $('#waitlist h1').setAttribute('tabindex', '-1');
    $('#waitlist h1').focus({ preventScroll: true });
    document.querySelector('.preview-banner').style.display = 'none';
  });

  $('#wl-form').addEventListener('gleev:subscribed', function (e) {
    var em = e.detail.email;
    K.track('Joined Waitlist', { plan: s.planId, plan_name: s.name }, s.total, em);
    $('#wl-form-view').style.display = 'none';
    $('#wl-done-email').textContent = em;
    $('#wl-done').style.display = 'flex';
    document.querySelector('#waitlist .tick').scrollIntoView({ block: 'center' });
  });
})();
