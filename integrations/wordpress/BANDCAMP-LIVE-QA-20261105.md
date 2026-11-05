# 432 Chamber Orchestra — WordPress/Bandcamp live URL QA

**Audit date:** 2026-11-05 · **Mode:** read-only GET, TLS verification, independent source/destination checks · **Production deployment:** none

## Release readiness

| Gate | Tested | Result |
|---|---:|---|
| Official Bandcamp purchase targets mapped to legacy WooCommerce | 23/23 | PASS: HTTPS 200 and visible Buy Digital Track/Album control |
| Full Bandcamp public release catalogue | 12/12 | PASS: HTTPS 200 and purchase control |
| Legacy WooCommerce EN+BG product permalinks | 46/46 | PASS: HTTPS 200; expected post ID, title, price, add-to-cart markup |
| Individual WooCommerce product SEO | 46/46 | PASS: self-canonical, correct `<html lang>`, EN/BG hreflang links |
| Real WordPress/WooCommerce/Polylang CLI integration | 46/46 | PASS: generated Bandcamp link, language mapping, single + shop buttons, hook priorities |
| PHP | 7.4.33 and 8.4.27 | PASS: syntax + isolated plugin tests |
| Full, off-server backup | 11/11 file parts + SQL | PASS: SHA-256, decompression, selective offline file restoration |
| Paid purchase transaction | — | **NOT TESTED** |
| Visual mobile/browser QA | — | **NOT TESTED**; the RA browser's approved-origin allowlist excludes the live orchestra and Bandcamp domains |
| Owner authorization for public activation | — | **PENDING** |

### Bandcamp purchase mapping

- 23 mappings to public artist pages: **21 individual track pages**, **2 album pages**.
- 12 official Bandcamp release pages, including five absent as distinct WooCommerce products.
- All pages returned 200 and contained a relevant purchase control. **The final payment processing, fulfillment and audio identity were not tested.**
- Historical slugs contain spelling variations but are the real, working artist URLs; do not silently normalize them.

### WordPress products and checkout

- 23 EN + 23 BG product posts all published; each actual permalink returned 200, with the expected body product ID and WooCommerce purchase elements.
- All 46 self-canonical and language/hreflang checks PASS.
- Actual WordPress shop page: EN ID 106, `/en/shop/`; **BG translation ID 997, `/bg/магазин/`**. The actual BG shop canonical is correct and points to `/bg/магазин/`. An alternative `/bg/shop/` URL canonicalizes to `/en/shop/` and must not be mistaken for the actual BG shop. Do **not** create a bogus SEO fix for the correct Bulgarian shop.
- Cart: EN ID 107, `/en/cart/`; BG ID 965, `/bg/кошница/`.
- Checkout: EN ID 108, `/en/checkout/`; **no BG Polylang translation** for ID 108 was found. With an empty cart, the EN checkout redirects to the cart. This does not prove that checkout fails with items, but localized checkout and real paid transaction still require verification.
- Currency EUR; WooCommerce guest checkout configured yes.
- Gateway configuration only (not payment confirmation): Stripe disabled; PayPal Express, standard PayPal and BACS enabled; cheque and cash-on-delivery disabled.
- Separate legacy product anomaly: Joplin English ID 943 has `downloadable=yes` but `virtual=no`. Do not mutate product data as part of this link bridge.
- Existing WordPress 5.9.20 / WooCommerce 7.0.2 / PHP 7.4 is legacy software; upgrades must be isolated from this change.

### Source of evidence

- Read-only direct PHP cURL GETs over HTTPS with TLS verification from host Everest to public pages, no authentication, carts, checkout posts, or orders created.
- PHP CLI full WordPress runtime loaded only in a transient private process to inspect permalink and language mappings and render plugin output; no public activation.
- Detailed local JSON at `C:\Users\User\Documents\432 Chamber Orchestra\Backups\WordPress-20261104\QA-20261105\`:
  `bandcamp-23-purchase-url-qa-20261105.json`,
  `bandcamp-catalogue-12-url-qa-20261105.json`,
  `wordpress-46-live-url-qa-20261105.json`,
  `product-seo-46-qa-20261105.json`.

### Go/no-go

Code is **staging-ready**. Do not activate it on the public WordPress without explicit owner approval, a mobile/browser inspection, and an agreed rollback verification. No production changes have been made by this audit.

Rollback for the plugin: deactivate `432 Bandcamp Purchase Links`; it makes no persistent product, price, checkout, SEO redirect or payment settings changes.
