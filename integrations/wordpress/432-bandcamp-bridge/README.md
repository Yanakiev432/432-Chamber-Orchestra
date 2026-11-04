# 432 Bandcamp Purchase Bridge — staging-only WordPress plugin

## Purpose

Offer direct Bandcamp purchases on all 23 works in the old WooCommerce shop (46 Polylang source product posts), **without redirecting/deleting any existing URLs, changing prices, or disabling the existing WooCommerce checkout**. Also surfaces the five Bandcamp-only releases through a full-catalogue banner on the shop archive.

## Scope

- `woocommerce_single_product_summary` priority 29: above the built-in WooCommerce add-to-basket form (priority 30).
- `woocommerce_after_shop_loop_item` priority 11: add a Bandcamp purchase link after the built-in add-to-basket.
- `woocommerce_before_shop_loop` priority 5: discovery of all 12 releases, including those not independently listed on WooCommerce.
- CSS scoped under `c432-bandcamp-*`, with no global theme changes.
- Links only to `https://432orchestra.bandcamp.com/` with `noopener noreferrer`.
- Polylang BG/EN labels with fallback to known translation product IDs.
- No JS, cookies, tracking, database writes, network calls, new paid API, redirects or admin pages.

## How to test

```bash
php -l wordpress/432-bandcamp-bridge/432-bandcamp-bridge.php
php wordpress/tests/test-bridge.php
```

## Deployment gate — DO NOT SKIP

1. Confirm current production WordPress shop and original 46 product posts and URLs.
2. Confirm verified full restore point **including database and wp-content/uploads**. The Nov 4 Softaculous archive of 829 KiB is NOT sufficient evidence: live uploads is ~5.5 GiB.
3. Confirm the 23 target Bandcamp URLs (this package uses canonical track/album hrefs from the public artist pages); check 200/redirect live and purchase availability.
4. **Explicit approval required before production plugin activation.** Never run WordPress core/theme/WooCommerce updates as part of this change.
5. Install package via WordPress admin as new plugin, or owner-approved guarded deployment. Record plugin SHA256, production screenshot, and rollback instructions.
6. QA an EN and BG product, shop archive, first/home page, mobile and desktop, focus order, duplicate link output.
7. Validate no checkout or payment behaviour changed and no errors in production PHP logs.
8. Rollback: deactivate plugin; product posts and checkout are left unchanged. Remove the directory only after confirming site behaviour.

### Important

Observed production: WordPress 5.9.20 / WooCommerce 7.0.2 / PHP CLI 8.4.27. One WooCommerce product (943, Joplin EN) is **downloadable=yes virtual=no**; this package intentionally does not repair that separate data anomaly.

## Source mapping

Read-only WordPress SQL by product ID and the public Bandcamp catalogue/album/track links, checked 2026-11-04. This is separate from the Astro staging site. Product ID mappings must be refreshed if posts are deleted and recreated.
