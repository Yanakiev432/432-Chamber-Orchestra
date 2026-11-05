# 432 Bandcamp Bridge v1.0.4 — Bandcamp-only digital music

## Production state — 2026-11-05

**Owner-approved Bandcamp-only model is LIVE on the existing WordPress Multisite main site (blog 1), not network-wide.**

- All 46 existing WooCommerce digital music posts remain published, paired in 23 BG/EN translations, and retain their historical URLs and downloadable files.
- All new digital-music purchases go to the official Bandcamp artist shop. Each mapped product links directly to one of the 23 verified track/album purchase destinations. Future unmapped downloadable products link to the Bandcamp discography, without inventing a track.
- WooCommerce **remains installed as an archive of posts, downloads and past orders**. It is no longer a digital-music sales channel.
- Filters disable `is_purchasable`, Woo add-to-cart and AJAX add-to-cart validation, local product prices, and Woo product price offers in schema data for downloaded music. Future non-downloadable merchandise is not changed by the product-level filters.
- The existing 12-release Bandcamp catalogue banner remains on both real shop pages (BG page ID 997, EN page ID 106); language is derived from current page, not the product's language where the old shortcode mixes EN/BG IDs.
- EN/BG navigation omits legacy Cart/Basket/Checkout links, including the Woo menu-cart link. The old cart and checkout pages (IDs 107, 965, 108, 461) send an HTTP 302 to `https://432orchestra.bandcamp.com/music`. No query strings or private session tokens are forwarded.
- New checkout payment methods are suppressed by runtime filter. **Historical `order-pay` and `order-received` endpoints remain available for existing orders.** Do not delete payment plugins or WooCommerce/order data.
- Original PHP and database data are not edited by the new filters. Turning the bridge off returns the previous Woo purchase behavior; legacy downloads/orders remain intact.

## Production QA

- PHP **7.4.33** and **8.4.27** isolated integration tests PASS.
- PHP 7.4 real WordPress runtime: 46/46 published products remain downloadable, non-purchasable in Woo, without old Woo price HTML, with a mapped Bandcamp URL (23 Bulgarian + 23 English).
- Public HTTPS, read-only GET checks: 6/6 shop/product/home pages HTTP 200; no local add-to-cart links or cart navigation, all Bandcamp CTAs displayed; old two carts and two checkout URLs all return HTTP 302 to Bandcamp: **10/10 PASS**.
- No payments, orders, account data migration or API service calls were made in the deployment.
- Site-only network plugin activation, prior to this update, preserved 40 network-wide plugins. PHP file SHA-256 of v1.0.4: `96a853c5306315182bc0d4b9851eff6d151af780d2851d143dc060b33b02f8b6`.
- Site received a **separate** branding change requested by owner: exact approved `432-Hertz-Foundation/public/brand/logo-foundation-dark.svg` rasterized to transparent PNG for the Twenty Seventeen WordPress custom logo. WordPress media attachment ID 3616 (previous logo ID 856), with minimal header contrast CSS. This branding change is independent of the Bandcamp bridge and has a separate protected rollback receipt.

## Rollback

The exact v1.0.3 PHP file was preserved in non-public server staging:
`/home/hzorche/ra-core-deploy-staging/432-bandcamp-v104-20261105/rollback-live-v103.php`
(SHA-256 `3cbdc4e5f2c2fa6b6f98c9443a25f963025ae5e22222cb1bf4a4bef1169a7544`).

To roll back only v1.0.4, replace the public bridge PHP file atomically with this verified v1.0.3 original and verify the resulting version and 10 public surfaces. Do not roll back WordPress core, payment plugins, historical records or media files. Site logo rollback is independent: `custom_logo` was ID 856 before the new approved asset.

A separate Nov 4/5 full private WordPress files+database backup is stored on Lenovo and the original validated server staging. Files were backed up sequentially on a live site, not as an atomic database+filesystem snapshot. Never publish archive contents (including `wp-config.php` and order/customer records).

## Long-term policy

Bandcamp collects payments through its own checkout. That **does not remove Bulgarian tax obligations for revenue**. Preserve the Bandcamp sales statements and any existing WooCommerce historical financial records for accounting. New digital releases should be published first to Bandcamp and then linked through the WordPress catalogue; they must not become locally purchasable through WooCommerce.

No paid purchase transaction was attempted during technical QA.
