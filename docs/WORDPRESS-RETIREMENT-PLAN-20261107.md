# 432 Chamber Orchestra — WordPress/WooCommerce retirement plan

**Decision context, 7 November 2026:** the owner intends to remove the public WordPress installation and WooCommerce in favor of the already verified independent Astro site. This does **not** authorize immediate deletion or domain cutover.

## Target operating model

Astro serves the BG/EN orchestra site, concerts, photo galleries, publications, and **46 historical product descriptions as non-transactional archive pages**. The publicly approved short audio samples remain available; 26 historical full downloadable source files **must not** be copied to Astro. External verified Bandcamp destinations may be linked when they are already source-backed. Astro does not take credit-card payments, create WooCommerce sessions, or store the previous customers' order/download credentials.

The nine original dynamic WordPress paths for carts, checkouts, account, purchase history, failed/completed transactions, and download pages are preserved as static **former-store assistance notices**, not simulated checkouts. They direct historical customers to the foundation’s published official contact, `info@432hz-foundation.com`, and the recordings archive. Do not promise automatic access to historical downloads until a fulfillment policy is established. Their URL and content must be tested. Internal archival pages must not direct customers to a WordPress installation that will no longer exist.

## What must remain in custody

Read-only catalog and permissions findings: **46 originally published paid products**, **80 download references**, **26 unique media files**, **188 historical file-download permission rows**, **12 orders with permissions**, **14 completed and 14 unfinished historical order records**. Removing WordPress/WooCommerce without a replacement workflow makes its old purchase-history, authentication and download URLs invalid. Preserve these historical records securely and decide the service and retention policy. The old products currently do not expose an ordinary cart button in the public HTML, but that alone does not establish that all selling channels are disabled.

## Verified private recovery materials

- **4 November:** a verified full WordPress file archive, split into 11 private chunks, plus a SQL backup, stored under `/home/hzorche/ra-core-deploy-staging/432-wordpress-backup-20261104/`. These archives contain private configuration and may contain customer data; do not publish.
- **7 November:** new table-prefix-scoped, transactional logical WordPress database archive covering **116 tables**. File: `/home/hzorche/ra-core-deploy-staging/432-retirement-readiness-20261107/wordpress-db-before-retirement-20261107.sql.gz`; SHA-256: `cf8a047c4312328906a1553206ca4e97457a53358248687491e14723b38f3c91`; gzip integrity check passed; file mode 0600; directory mode 0700. The original database is unchanged. An off-host encrypted copy and a restore drill are **not** complete.
- The old checkout/order data and full WAV recordings must stay private, not in public Astro assets, GitHub or the preview site.

A WXR/XML WordPress export is **not** a substitute for database and file backups: WordPress documents that WXR does not include the configuration or actual attachment files. See <https://developer.wordpress.org/cli/commands/export/>. Full database exports are separately documented at <https://developer.wordpress.org/cli/commands/db/export/>. WooCommerce confirms removing the plugin alone does not delete its orders, while intentional data purging is a distinct operation: <https://woocommerce.com/document/installing-uninstalling-woocommerce/>.

## Must-pass requirements before shutting down production WordPress

1. **Fresh encrypted, off-host backup:** verify a complete current media tree and database; check checksums; restore the database and required media to an isolated environment. Keep the decryption key outside the shared host and repository.
2. **Previous customer access:** explicitly choose whether the orchestra will reissue purchased files manually from protected storage, retain a secured purchase-support portal elsewhere, or take another compliant route. Review contract, refund and personal-data retention obligations before any deletion.
3. **Static routes and SEO:** preserve 394 existing pages, 146 editorial routes, and 46 products; classify the remaining **270 unapproved attachment-detail addresses**, 13 intentionally excluded Studio 5 gallery URLs and old login/checkout paths. Provide intentional 301/410/404 outcomes; do not bulk-redirect unrelated attachment pages to the homepage or publish withheld media.
4. **Hosting and safety:** stage a full Astro public-domain replacement, verify TLS, redirect canonicalization, security headers, `robots.txt`, sitemap, BF/EN localization and protected legacy media URL denial, then rehearse rollback to WordPress without touching existing email or unrelated subdomains.
5. **Explicit approval:** approve the precise cutover/deletion target and a recovery strategy before changing `/home/hzorche/public_html`, DNS, database tables or live file permissions.

## Deterministic staging controls

`pnpm run retirement:report` validates nine static former-store notices and the 46 product archive pages. `pnpm run retirement:cutover:gate` and the primary `pnpm run cutover:gate` stay **blocked** until all retirement safeguards are independently evidenced; a successful Astro preview build is not permission to delete WordPress.

The original hybrid WooCommerce cutover gate remains available as `commerce:cutover:gate` only for historical comparison. It is no longer the target architecture. No production WordPress removal, live redirect, payment, login, or order change is authorized by this checkpoint.
