// Fake basket: state lives in localStorage, UI is a slide-in drawer shared by every page.
(function () {
  var KEY = 'gleev.cart.v1';
  var BASE = (document.currentScript && document.currentScript.src || '').replace(/js\/cart\.js.*$/, '');
  var G = window.GLEEV;
  var listeners = [];
  var drawer, scrim, lastFocus;

  function load() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (c && c.planId && c.qty > 0) { G.plan(c.planId); return { planId: c.planId, qty: Math.min(10, c.qty) }; }
    } catch (e) {}
    return null;
  }
  var state = load();
  function save() { try { state ? localStorage.setItem(KEY, JSON.stringify(state)) : localStorage.removeItem(KEY); } catch (e) {} }
  function emit() { save(); render(); listeners.forEach(function (f) { f(summary()); }); }

  function summary() {
    if (!state) return null;
    var p = G.plan(state.planId);
    return { planId: p.id, name: p.name, qty: state.qty, unit: p.total, total: p.total * state.qty, plan: p };
  }

  var Cart = {
    summary: summary,
    count: function () { return state ? state.qty : 0; },
    add: function (planId) {
      var p = G.plan(planId);
      if (state && state.planId === p.id) state.qty = p.id === 'once' ? Math.min(10, state.qty + 1) : 1;
      else state = { planId: p.id, qty: 1 };
      emit();
      var s = summary();
      if (window.GleevKlaviyo) window.GleevKlaviyo.track('Added to Cart', { plan: s.planId, plan_name: s.name }, s.total);
    },
    setQty: function (q) { if (!state) return; if (q <= 0) state = null; else state.qty = Math.min(10, q); emit(); },
    clear: function () { state = null; emit(); },
    onChange: function (f) { listeners.push(f); },
    open: open, close: close
  };
  window.GleevCart = Cart;

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function build() {
    scrim = el('div', 'scrim');
    drawer = el('aside', 'drawer');
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Your basket');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(scrim);
    document.body.appendChild(drawer);
    scrim.addEventListener('click', close);
    drawer.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act]'); if (!t) return;
      var a = t.dataset.act;
      if (a === 'close') close();
      else if (a === 'inc') Cart.setQty(state.qty + 1);
      else if (a === 'dec') Cart.setQty(state.qty - 1);
      else if (a === 'remove') Cart.clear();
      else if (a === 'shop') { close(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('is-on')) close(); });
    document.querySelectorAll('[data-open-basket]').forEach(function (b) { b.addEventListener('click', open); });
    // Any element with data-add adds the currently selected plan (set by app.js) and opens the basket.
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-add]'); if (!b) return;
      Cart.add(b.dataset.add || (window.GleevSelectedPlan && window.GleevSelectedPlan()) || 'three');
      open();
    });
  }

  function render() {
    var s = summary();
    document.querySelectorAll('[data-basket-count]').forEach(function (n) {
      n.textContent = s ? s.qty : 0;
      n.dataset.empty = s ? 'false' : 'true';
    });
    if (!drawer) return;
    var body = '';
    if (!s) {
      body = '<div class="drawer-body"><div class="empty"><span>Your basket is empty.</span><a class="btn btn-inline" href="' + BASE + 'index.html#plans" data-act="shop">Choose your plan</a></div></div>';
    } else {
      var p = s.plan;
      var qty = p.id === 'once'
        ? '<div class="qty"><button type="button" data-act="dec" aria-label="Decrease quantity">−</button><span aria-live="polite">' + s.qty + '</span><button type="button" data-act="inc" aria-label="Increase quantity">+</button></div>'
        : '<span></span>';
      body = '<div class="drawer-body">'
        + '<div class="line"><img src="' + BASE + 'assets/img/gallery-02-unboxed.webp" alt="" width="76" height="76">'
        + '<div class="info"><b>Gleev 360° Biome</b><span>' + p.name + '</span><span>' + p.renew + '</span>'
        + '<div class="ctl">' + qty + '<b>' + G.gbp(s.total) + '</b></div>'
        + '<button class="link-btn" type="button" data-act="remove" style="align-self:flex-start">Remove</button></div></div>'
        + '<p class="fineprint">Pre-launch preview: nothing is charged and no order is placed.</p></div>'
        + '<div class="drawer-foot"><div class="sum"><div><span>Subtotal</span><span>' + G.gbp(s.total) + '</span></div><div><span>Delivery</span><span>Free</span></div><div class="total"><span>Total</span><span>' + G.gbp(s.total) + '</span></div></div>'
        + '<a class="btn" href="' + BASE + 'checkout.html">Checkout</a></div>';
    }
    drawer.innerHTML = '<div class="drawer-head"><b>Your basket</b><button class="icon-btn" type="button" data-act="close" aria-label="Close basket">×</button></div>' + body;
  }

  function open() {
    lastFocus = document.activeElement;
    render();
    scrim.classList.add('is-on');
    drawer.classList.add('is-on');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var f = drawer.querySelector('.btn, .icon-btn'); if (f) f.focus();
  }
  function close() {
    scrim.classList.remove('is-on');
    drawer.classList.remove('is-on');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init() { build(); render(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
