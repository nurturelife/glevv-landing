// Landing page behaviour: plans, gallery, accordions, sticky bars, delivery scrolly, mobile menu.
(function () {
  var G = window.GLEEV;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var selected = 'three';
  window.GleevSelectedPlan = function () { return selected; };

  /* ---------- Plans ---------- */
  function planOption(p) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'plan-opt'; b.setAttribute('role', 'radio'); b.dataset.plan = p.id;
    b.innerHTML = (p.rec ? '<span class="badge">BEST VALUE</span>' : '')
      + '<span class="radio"><i></i></span>'
      + '<span class="mid"><b>' + p.name + '</b><span>' + p.sub + '</span></span>'
      + '<span class="end"><span class="pr">' + (p.save ? '<s>' + p.was + '</s>' : '') + '<b>' + p.price + '</b><span>' + p.perShort + '</span></span>'
      + (p.save ? '<span class="chip">' + p.save.toUpperCase() + '</span>' : '<span class="ref">REFERENCE PRICE</span>') + '</span>';
    return b;
  }
  function planCard(p) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'pcard' + (p.rec ? ' rec' : ''); b.setAttribute('role', 'radio'); b.dataset.plan = p.id;
    b.innerHTML = '<span class="row"><span class="tag">' + p.tag + '</span><span class="rd"><i></i></span></span>'
      + '<span class="nm">' + p.name + '</span>'
      + '<span class="big"><b>' + p.price + '</b><span>' + p.perShort + '</span></span>'
      + '<span class="per">' + p.per + '</span>'
      + '<span class="pills2"><span>' + p.day + '</span>' + (p.save ? '<span>' + p.save + '</span>' : '') + '</span>'
      + '<span class="ls">' + p.lines.map(function (l) { return '<span>' + l + '</span>'; }).join('') + '</span>';
    return b;
  }
  function mountPlans() {
    var list = $('#plan-list'), cards = $('#plan-cards');
    G.PLANS.forEach(function (p) { list.appendChild(planOption(p)); cards.appendChild(planCard(p)); });
    [list, cards].forEach(function (c) {
      c.addEventListener('click', function (e) { var b = e.target.closest('[data-plan]'); if (b) setPlan(b.dataset.plan); });
      c.addEventListener('keydown', function (e) {
        if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].indexOf(e.key) < 0) return;
        e.preventDefault();
        var ids = G.PLANS.map(function (p) { return p.id; });
        var i = ids.indexOf(selected) + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1);
        setPlan(ids[(i + ids.length) % ids.length]);
        var t = $('[data-plan="' + selected + '"]', c); if (t) t.focus();
      });
    });
    setPlan(selected);
  }
  function setPlan(id) {
    selected = id;
    var p = G.plan(id);
    $$('[data-plan]').forEach(function (b) {
      var on = b.dataset.plan === id;
      b.setAttribute('aria-checked', on);
      b.tabIndex = on ? 0 : -1;
    });
    $$('[data-bind]').forEach(function (n) { n.textContent = p[n.dataset.bind] || ''; });
  }

  /* ---------- Gallery ---------- */
  function mountGallery() {
    var tabs = $$('#thumbs .thumb'), figs = $$('#gallery-main figure');
    function show(i) {
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
      figs.forEach(function (f, k) { f.classList.toggle('is-on', k === i); });
      var t = tabs[i], box = $('#thumbs');
      if (t.offsetLeft < box.scrollLeft) box.scrollTo({ left: t.offsetLeft - box.offsetLeft, behavior: 'smooth' });
      else if (t.offsetLeft + t.offsetWidth > box.scrollLeft + box.clientWidth) box.scrollTo({ left: t.offsetLeft + t.offsetWidth - box.clientWidth, behavior: 'smooth' });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
        e.preventDefault(); var n = (i + d + tabs.length) % tabs.length; show(n); tabs[n].focus();
      });
    });
    // Swipe on the main image
    var main = $('#gallery-main'), x0 = null;
    main.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) < 40) return;
      var cur = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
      show((cur + (dx < 0 ? 1 : -1) + tabs.length) % tabs.length);
    }, { passive: true });
    show(0);
  }

  /* ---------- Accordions / science ---------- */
  function mountAccordions() {
    $$('.acc-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        $$('.acc-btn').forEach(function (b) {
          var on = b === btn && open;
          b.setAttribute('aria-expanded', on);
          $('.sign', b).textContent = on ? '−' : '+';
          document.getElementById(b.getAttribute('aria-controls')).classList.toggle('is-open', on);
        });
      });
    });
    var sb = $('.science-btn');
    sb.addEventListener('click', function () {
      var on = sb.getAttribute('aria-expanded') !== 'true';
      sb.setAttribute('aria-expanded', on);
      $('.sign', sb).textContent = on ? '−' : '+';
      $('#science-more').classList.toggle('is-open', on);
    });
  }

  /* ---------- Mobile menu ---------- */
  function mountMenu() {
    var btn = $('.menu-btn'), menu = $('#mobile-menu');
    function set(on) { btn.setAttribute('aria-expanded', on); menu.classList.toggle('is-on', on); }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    window.matchMedia('(min-width:861px)').addEventListener('change', function () { set(false); });
  }

  /* ---------- Scroll effects ---------- */
  function mountScroll() {
    var hero = $('[data-hero]'), plans = $('[data-plans]'), sc = $('[data-scrolly]'), journey = $('#journey');
    var top = $('#topbar'), bottom = $('#bottombar'), ben = $('[data-benefits]');
    var stages = $$('.stage', journey);
    var wide = window.matchMedia('(min-width:1040px)');
    var ticking = false, last = {}, autoT = 0, autoStarted = false;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function applyT(t) {
      if (Math.abs((last.t === undefined ? -1 : last.t) - t) <= 0.002) return;
      journey.style.setProperty('--p', (12 + t * 76) + '%');
      var idx = t < 0.33 ? 0 : t < 0.66 ? 1 : 2;
      stages.forEach(function (st, i) { st.classList.toggle('is-on', i <= idx); });
      last.t = t;
    }

    function update() {
      ticking = false;
      var vh = window.innerHeight;
      var h = hero.getBoundingClientRect(), pl = plans.getBoundingClientRect(), s = sc.getBoundingClientRect();
      var showSticky = h.bottom < 0;
      var plansInView = pl.top < vh * 0.8 && pl.bottom > vh * 0.2;
      if (last.sticky !== showSticky) { top.classList.toggle('is-on', showSticky); top.setAttribute('aria-hidden', !showSticky); $('.btn', top).tabIndex = showSticky ? 0 : -1; }
      var showBottom = showSticky && !plansInView;
      if (last.bottom !== showBottom) { bottom.classList.toggle('is-on', showBottom); }
      // Wide screens: capsule follows the scroll. Stacked screens: it animates by itself (see below).
      applyT(wide.matches ? Math.min(1, Math.max(0, -s.top / Math.max(1, s.height - vh))) : autoT);
      last.sticky = showSticky; last.bottom = showBottom;
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }

    // Stacked layout: when the journey scrolls into view the capsule travels down on its own, once.
    function runAuto() {
      if (autoStarted) return;
      autoStarted = true;
      if (reduce) { autoT = 1; applyT(1); return; }
      journey.classList.add('is-auto');
      var t0 = null, dur = 2600;
      (function step(now) {
        if (t0 === null) t0 = now;
        var k = Math.min(1, (now - t0) / dur);
        autoT = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // ease in-out
        applyT(autoT);
        if (k < 1) requestAnimationFrame(step); else journey.classList.remove('is-auto');
      })(performance.now());
    }
    if ('IntersectionObserver' in window) {
      var jo = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !wide.matches) { runAuto(); jo.disconnect(); }
      }, { threshold: 0.6 });
      jo.observe(journey);
    } else { autoT = 1; }

    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    wide.addEventListener('change', function () { last.t = undefined; req(); });
    update();

    // Benefits reveal once
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { ben.classList.add('is-seen'); io.disconnect(); }
      }, { rootMargin: '0px 0px -30% 0px' });
      io.observe(ben);
    } else ben.classList.add('is-seen');
  }

  function init() { mountPlans(); mountGallery(); mountAccordions(); mountMenu(); mountScroll(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
