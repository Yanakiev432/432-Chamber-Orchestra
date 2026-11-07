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

## Shared hosting boundary — irreversible deletion hazard

**Critical shared-webroot boundary:** `/home/hzorche/public_html` includes additional directories for `432hz-foundation.com` and `432project.432hz-orchestra.com` (the latter has its own WordPress core and `wp-config.php`). Other directories include `cgi-bin`, `old`, `wordpress`, and historical assets. **Never delete or replace the entire `public_html` directory.** Use a reviewed, explicit manifest of the orchestra-root WordPress files and leave every unrelated nested application untouched. A read-only audit found 17 original files changed since 4 November (around 4 MB), so a final incremental pre-cutover capture is still necessary.

## Verified standalone preview release (7 November)

The preview has been deployed and independently verified at **394/394 exact HTTPS HTML parity**, including nine former-store help notices. The **385-entry sitemap** excludes the old checkout/account routes, while all 394 preview pages remain `noindex,nofollow`. The **22 historical short-demo attachment URLs**, **54 vetted photo attachment URLs**, and **11 approved short audio excerpts** are still live. The 46 historic BG/EN product records have **23 unique Bandcamp destinations**, each of which returned HTTPS HEAD 200 in a bounded read-only check; that does *not* verify active pricing or sales.

The latest deployed HTML comes from Git commit `7832cea5fb5bf04c883e792efc8e0fc07755eddf`. A full 396-file preview-only release was followed by a one-HTML-page patch to replace the final active link back to the retiring WordPress root with the local `/bg/контакти/` route. The final one-page ZIP SHA-256 is `744fd3ac3dd4ce1985c70266968f07ac0008cb28246b3d5bd35fa95c741db05f`. Both preview deployments have independent rollback receipts. **No WordPress production files or databases were changed.**

## Additional backup verification and operator safety

The **11 file-archive parts** from 4 November were rechecked using their existing SHA-256 manifest (PASS). The new 7 November SQL dump was checked by SHA-256, gzip integrity, `CREATE TABLE` count (**116**), WooCommerce permission table and logical dump footer. This is a *structural* check, not a test restoration.

A private **19-file supplemental archive** includes 15 files modified since 4 November inside the orchestra WordPress `wp-content` and four current root configuration files. It excludes all other nested sites. SHA-256: `2af9de3c69d67f1b49f8956f62d2ff981e880f3c739ff4b615de1b62b1cf8dac`; size 79,119 bytes. Its path and sensitive contents remain outside the webroot under `/home/hzorche/ra-core-deploy-staging/432-retirement-readiness-20261107/`. This is **not** a replacement for a full updated file-tree backup or a restore drill.

A local security check found **BitLocker protection OFF for Lenovo C:** at the time of inspection. Do not move customer-containing SQL or WordPress archives there in plaintext; perform an encrypted export to a physically separate backup medium or approved encrypted storage, with the key held separately. An encrypted off-host backup has **not** yet been completed.

## Must-pass requirements before shutting down production WordPress

1. **Fresh encrypted, off-host backup:** verify a complete current media tree and database; check checksums; restore the database and required media to an isolated environment. Keep the decryption key outside the shared host and repository.
2. **Previous customer access:** explicitly choose whether the orchestra will reissue purchased files manually from protected storage, retain a secured purchase-support portal elsewhere, or take another compliant route. Review contract, refund and personal-data retention obligations before any deletion.
3. **Static routes and SEO:** preserve 394 existing pages, 146 editorial routes, and 46 products; classify the remaining **270 unapproved attachment-detail addresses**, 13 intentionally excluded Studio 5 gallery URLs and old login/checkout paths. Provide intentional 301/410/404 outcomes; do not bulk-redirect unrelated attachment pages to the homepage or publish withheld media.
4. **Hosting and safety:** stage a full Astro public-domain replacement, verify TLS, redirect canonicalization, security headers, `robots.txt`, sitemap, BG/EN localization and protected legacy media URL denial, then rehearse rollback to WordPress without touching existing email or unrelated subdomains.
5. **Directory isolation:** prove that the standalone project WordPress and foundation site are preserved; make an explicit allowlist for the orchestra-root files and confirm the new site does not override unrelated vhosts or nested directories.
6. **Explicit approval:** approve the precise cutover/deletion target and a recovery strategy before changing `/home/hzorche/public_html`, DNS, database tables or live file permissions.

## Deterministic staging controls

`pnpm run retirement:report` validates nine static former-store notices and the 46 product archive pages. `pnpm run retirement:cutover:gate` and the primary `pnpm run cutover:gate` stay **blocked** until all retirement safeguards are independently evidenced; a successful Astro preview build is not permission to delete WordPress.

The original hybrid WooCommerce cutover gate remains available as `commerce:cutover:gate` only for historical comparison. It is no longer the target architecture. No production WordPress removal, live redirect, payment, login, or order change is authorized by this checkpoint.
