# Gleev landing

Static pre-launch landing page for Gleev 360° Biome. Plain HTML, CSS and JS: no build step, no dependencies.

```
index.html        landing page
checkout.html     fake checkout, then "not available yet" waitlist
legal/            DRAFT terms and privacy pages (placeholders: search for "tbc" to find items to confirm)
css/styles.css    all styling and responsive rules
js/config.js      Klaviyo settings (edit this)
js/data.js        plans and prices
js/cart.js        fake basket (localStorage) and drawer
js/klaviyo.js     email sign-up + events
js/app.js         page behaviour
assets/           images and fonts
```

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Klaviyo

Edit `js/config.js`:

- `KLAVIYO_COMPANY_ID`: your public API key (Klaviyo > Settings > Account > API keys).
- `KLAVIYO_LIST_ID`: the list that receives sign-ups.
- `DRY_RUN`: set to `false` to go live. While `true` (or while the IDs are empty), nothing is sent and the payloads are logged to the browser console.

Forms: footer newsletter (`source: footer`) and checkout waitlist (`source: checkout_waitlist`, with the chosen plan as a profile property). Events `Added to Cart`, `Started Checkout` and `Joined Waitlist` are sent once the visitor's email is known (turn off with `TRACK_EVENTS: false`).

The checkout is fake: card and address fields are never read, stored or sent.

## Changing content

- Prices and plan copy: `js/data.js`.
- Page copy: `index.html`.
- Colours and layout: `css/styles.css` (design tokens at the top, `:root`).

Commit and push to `main`; the site redeploys automatically.

## Deploy (GitHub Pages)

Pages is set to deploy from the `main` branch (root). Every push to `main` redeploys in about a minute.

Preview URL: https://nurturelife.github.io/glevv-landing/

### Pointing gleevhealth.com at it

1. Add a file named `CNAME` at the repo root containing `gleevhealth.com`, commit and push. (Do this only when DNS is ready: once set, the github.io preview URL redirects to the custom domain.)
2. DNS at your registrar:
   - apex `gleevhealth.com` → four `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www` → `CNAME` → `nurturelife.github.io`
3. Repo Settings > Pages: confirm the custom domain, then tick **Enforce HTTPS** once the certificate is issued (up to an hour). `www.gleevhealth.com` then redirects to `gleevhealth.com` automatically.

`/how-to` redirects to the home page (`how-to/index.html`).
