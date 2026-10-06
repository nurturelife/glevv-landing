// Plan catalogue shared by the landing page, basket and checkout.
(function () {
  var ONCE = 59.99, MONTHLY = 49.99, THREE = 112.47;
  var gbp = function (n) { return '£' + n.toFixed(2); };
  var pct = function (eq, sub) { return Math.round((eq - sub) / eq * 100); };
  var save3 = pct(ONCE * 3, THREE), save1 = pct(ONCE, MONTHLY);

  var PLANS = [
    { id: 'three', name: '3-Month Subscription', total: THREE, price: gbp(THREE / 3), perShort: '/ month', was: gbp(ONCE),
      sub: gbp(THREE) + ' billed every 12 weeks', per: 'Billed ' + gbp(THREE) + ' every 12 weeks',
      day: gbp(THREE / 84) + ' a day', tag: 'RECOMMENDED · BEST VALUE', save: 'Save ' + save3 + '%', rec: true,
      lines: ['Three packs, one delivery every 12 weeks', 'Pause or cancel any time', 'vs ' + gbp(ONCE * 3) + ' buying three packs once'],
      renew: 'Renews every 12 weeks at ' + gbp(THREE), flex: 'Pause or cancel in one click.',
      cta: 'Start the 3-month plan', ctaLong: 'Start 3-Month Subscription — ' + gbp(THREE) },
    { id: 'monthly', name: 'Monthly Subscription', total: MONTHLY, price: gbp(MONTHLY), perShort: '/ month', was: gbp(ONCE),
      sub: 'Delivered every 4 weeks', per: 'One pack, every 4 weeks',
      day: gbp(MONTHLY / 28) + ' a day', tag: 'FLEXIBLE', save: 'Save ' + save1 + '%',
      lines: ['Pause or cancel any time', 'vs ' + gbp(ONCE) + ' buying once'],
      renew: 'Renews every 4 weeks at ' + gbp(MONTHLY), flex: 'Pause or cancel in one click.',
      cta: 'Start the monthly plan', ctaLong: 'Start Monthly Subscription — ' + gbp(MONTHLY) },
    { id: 'once', name: 'One-Time Purchase', total: ONCE, price: gbp(ONCE), perShort: '', was: '',
      sub: '4-week supply · nothing renews', per: 'One pack, 28 days. Nothing renews',
      day: gbp(ONCE / 28) + ' a day', tag: 'TRY IT ONCE', save: '',
      lines: ['No subscription', 'Free delivery'],
      renew: 'One-time purchase. Nothing renews', flex: 'Free delivery.',
      cta: 'Buy one pack', ctaLong: 'Add to Basket — ' + gbp(ONCE) }
  ];

  window.GLEEV = {
    PLANS: PLANS,
    gbp: gbp,
    plan: function (id) { return PLANS.filter(function (p) { return p.id === id; })[0] || PLANS[0]; }
  };
})();
