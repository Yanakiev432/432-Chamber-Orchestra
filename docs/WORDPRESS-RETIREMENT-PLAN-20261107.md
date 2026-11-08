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

## Forensic archive and cPanel verification — continued 7 November

**Full-file archive verified without a second 6+ GiB on-disk copy.** All **30,642 regular files** in the 11-part backup were decompressed and SHA-256-streamed, totaling **6,576,778,451 bytes (6.125 GiB)**. The manifest includes 3,883 directory entries. **All 26 historical WooCommerce media files** matched their independent private SHA-256 manifest. Three selected WordPress/WooCommerce files were extracted to a private directory and byte-for-byte hash-compared to the current production copies (**3/3 PASS**); the temporary extracted copies, including credentials, were then deleted. The sanitized evidence receipt remains private.

An initial attempt at complete file extraction into the private staging folder was stopped by the host with `EDQUOT` after about 24,000 temporary files. The **24,239** files created by that failed test were removed without touching the source archive or production. cPanel currently reports **28.62 GB used of a 50 GB disk allotment**, so the precise cause of the quota refusal (such as a separate file-count limit) has **not** been established. It is incorrect to mark a complete physical file restore as done.

**Actual virtual-host boundaries:** read-only cPanel UAPI inspection confirmed **16 registered domains**, with only two other domains nested under the main document root: `432hz-foundation.com` and `432project.432hz-orchestra.com`. The latter has a separate WordPress installation. A dry-run audit identified the main orchestra WordPress core folders (`wp-admin`: 568 files; `wp-content`: 28,241; `wp-includes`: 1,802), plus 18 root-level WordPress/config candidates. No source files, document roots, DNS records or `.htaccess` files were changed. These are **review candidates, not an authorized deletion list**. The ability to change the main-domain document root in place has not been established.

**Remaining hard gates:** independent encrypted backup outside Superhosting, validated *full* WordPress and SQL restoration in a suitable isolated environment, customer download entitlements/retention service policy, host-safe file migration dry-run with rollback, and explicit approval. The Lenovo C: volume was not BitLocker-protected; private backups must not be downloaded there as plaintext.

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

## 7 November — SQL restore PASS and privately staged production candidate

The full November 7 WordPress SQL backup was **actually restored** into an isolated MariaDB 10.11 Docker container, with no network, no disk logs, a tmpfs database and cgroup swap disabled. **All 116 tables** were restored and MariaDB table checks passed. Aggregates matched the source: **188 WooCommerce download permissions**, **12 orders with permission grants**, **19 entitled products**, **46 published priced downloadable products**, and **14 completed / 7 on-hold / 7 pending** orders. Transport was encrypted asymmetrically; no plaintext SQL was stored on the unencrypted Lenovo C: drive. After verification the container, temporary decryption key and ciphertext were removed. The private receipt SHA-256 is `8d52f5d90b2e08569fa76a52ef7a61deb71a4ed6b9b55ab8e899247b0f3b5d8d`.

Astro's **production-only** candidate is also complete and strictly staged **outside all public document roots** on Everest. It contains **618 allowlisted files**, **394 HTML pages**, a **384-URL canonical sitemap**, nine noindex retired-shop notices and one noindex root redirect to `/bg/`. ZIP SHA-256: `9112131bc719c3e80e68d5632a7836c83158d9e06143d66778d07cf51bb30a2a` (129,488,633 compressed bytes). The ZIP was reconstructed from eight checksum-verified parts, decompressed to 155,597,213 bytes and all 618 extracted files hashed and retained privately. Source commit: `240dc6919e189481de8d54c74bbc70de6f0c0f73`.

Read-only comparison against the live WordPress root found 616 new file paths and two existing-file collisions. No candidate file touches the foundation or project domain. The main WordPress `index.php` and `.htaccess` are unchanged and require an owner-approved cutover/rollback procedure.

**Important distinction:** the **SQL database restoration is now PASS**. This is *not* full WordPress runtime restoration, an off-host recoverable backup, or approval to discontinue fulfillment of historical downloads. All remaining safeguards remain mandatory.

## 8 November: independent checks against silent legacy dependencies

The production artifact gate now rejects active HTML references to the orchestra's old self-hosted WordPress content, PHP, JSON or WooCommerce endpoints. The new production candidate build and file-level parity comparison show **0 active self-origin WordPress dependencies**, **2 external third-party PDF URLs hosted by artstudies.bg**, and **618/618 source-file SHA-256 matches** with the previously staged, non-public release. A private mock transaction staged and reverted all 618 static files without changing the real WordPress; the fixture is not equivalent to full real-site rollback. The 12 completed historical purchaser orders and 188 permission rows are available for private read-only verification via a CLI whose 11 synthetic tests passed; no automated buyer download delivery is authorised yet. The encrypted off-host backup and explicit final cutover permission remain open.
