// Site configuration. Edit the Klaviyo values below, then commit and push.
window.GLEEV_CONFIG = {
  // Klaviyo PUBLIC API key (a.k.a. Company ID, 6 characters). Safe to expose in the browser.
  // Find it in Klaviyo: Settings > Account > API keys.
  KLAVIYO_COMPANY_ID: '',

  // ID of the Klaviyo list that receives sign-ups (Lists & Segments > your list > Settings).
  KLAVIYO_LIST_ID: '',

  // While true (or while the IDs above are empty) nothing is sent to Klaviyo:
  // payloads are only logged to the browser console. Set to false to go live.
  DRY_RUN: true,

  // Also send Added to Cart / Started Checkout / Joined Waitlist events to Klaviyo.
  TRACK_EVENTS: true
};
