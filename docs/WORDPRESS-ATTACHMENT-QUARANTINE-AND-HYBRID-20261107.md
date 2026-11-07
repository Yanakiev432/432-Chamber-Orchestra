# 432 Chamber Orchestra — remaining WordPress media triage and commerce boundary

**Evidence date:** 7 November 2026. **Scope:** read-only audit of the original WordPress site and fail-closed regression checks in the independent Astro preview. **No production changes.**

## Verified inventory and exact accounting

The original site exposes **353 WordPress attachment detail-page URLs**, each observed HTTP 200 in the original public route probe. Astro now has **83 corresponding attachment pages** (7 earlier archival/featured pages, 22 reviewed promotional audio pages and 54 reviewed photographic pages). Of the **270 remaining detail-page URLs**, the verified original MIME inventory is:

| Pending class | Source URLs | Disposition |
| --- | ---: | --- |
| WordPress `woocommerce_uploads` WAV attachment pages | 8 (4 distinct files) | **BLOCK**: protected products |
| Other original WAV attachment pages | 100 | Hold: rights, provenance, purchase-status, and media-length review |
| Other DEMO MP3 attachment pages | 12 (6 distinct files) | **BLOCK 4** paid-product-linked public demos, **BLOCK 2** truncated URLs; hold 6 for rights/duration review |
| Specifically rejected Studio 5 photograph attachment pages | 13 | **BLOCK**: previously explicit editorial exclusion |
| Other variant of the Studio 5 Concert series | 1 | Hold: crop/content and editorial review |
| Additional VBAL image variants | 22 | Hold: compare actual visual content and approvals |
| Additional DSC concert frames | 42 | Hold: not among the twelve curated frames |
| Historical branding, logos, crops or layout artwork | 38 | Hold: verify current identity and archival relevance |
| Other uncurated historical images | 34 | Hold: rights, person-specific content, context |
| **Total** | **270** | **No automatic redirect or publication** |

All 270 item-level decisions and their public historical attachment permalink IDs are in `docs/wordpress-remaining-media-review-20261107.json`. Direct media download URLs are omitted. Media filenames and historic page paths are additionally suppressed for **all 12 high-risk records**: eight WooCommerce-protected WAV attachments and four public MP3 attachment URLs also referenced by positive-price WooCommerce products. Filename-based image groups are *preliminary* and are not evidence of identical visual content, ownership or permission.

The 13 rejected Studio 5 WordPress attachment pages are **different original routes** from the 13 excluded Gmedia photograph URLs in the broader source-path comparison. Do not double count them as a new editorial omission or publish either class.

## Verified WooCommerce delivery boundary — corrected forensic finding

The earlier assertion of **two duplicates of protected WooCommerce files** was incorrect. The two DEMO MP3s are the original *publicly stored* files, and the same public file paths appear in the product-download manifest. The full **26-file, 46-product** read-only audit found:

| File storage and format | Files | Anonymous `HEAD` | One-byte anonymous `Range GET` | Published priced products |
| --- | ---: | --- | --- | ---: |
| Standard public uploads, WAV | 20 | 20 × 200 | 20 × 206 | 36 |
| Standard public uploads, MP3 | 2 | 2 × 200 | 2 × 206 | 2 |
| Protected `woocommerce_uploads`, WAV | 4 | 4 × 403 | 4 × 403 | 8 |
| **Total** | **26** | **22 accessible** | **22 accessible** | **46** |

The original download manifest contains **80 references**. All 46 associated products were verified through a **read-only WordPress database transaction** to have positive prices, published status and downloadable-product metadata. Directly accessible files total approximately **2.02 GB**; 20 WAV files last between **58.6 and 481.8 seconds** (14 last over two minutes). The protected `woocommerce_uploads` directory has a functioning Apache denial rule, but it does not protect the 22 files stored elsewhere.

The previous private incident receipt is retained for traceability, but its *duplicate of private files* interpretation is superseded. It is not the definitive inventory. This audit did not change the production site or retrieve full paid recordings. Source paths and sensitive download URLs remain outside Git.

See [WooCommerce's official downloadable product guide](https://woocommerce.com/document/digital-downloadable-product-handling/) and [Approved Download Directories](https://woocommerce.com/document/approved-download-directories/). Media Library files are public by default. Changing a WooCommerce download-method setting does **not** by itself restrict an existing public direct URL. The currently configured delivery method, redirect fallback and real purchaser entitlement flow have **not yet been checked**.

## Fail-closed regression control

`scripts/validate-remaining-attachment-quarantine.mjs` is part of `pnpm build` and is also runnable using `pnpm run attachments:quarantine:validate`. It verifies that:

- The 353 WordPress attachment IDs are partitioned into **83 approved/restored** versus **270 held/blocked** without duplicates or omissions.
- None of the 270 held/blocked original attachment page URLs exists in the Astro preview output.
- All twelve high-risk protected-content records (eight WAV entries in protected WooCommerce storage plus four original public MP3 files referenced by paid products) lack direct media filenames and historical attachment-page paths in the tracked review manifest.
- All 13 excluded Studio 5 image filenames remain quarantined, regardless of similar filenames or variants.
- None of the 12 unapproved DEMO attachment URLs is silently authorized: **4 are held/blocked because they are original public files linked to priced downloads**, **2 by truncated 2088-byte media**, and **6 remain on hold for duration/rights review**. No pending item has been published as a placeholder.
- The source WordPress and its protected order/download infrastructure remain outside this static build.

**Change-control rule:** a genuine new editorial approval must move an item from the queue to an explicit allowlist and update this gate, with its original source, exact preview destination, rights and curatorial evidence, verified hashes or image-equivalence proof, and new regression checks. Do not bypass the gate by weakening count assertions.

## Hybrid WordPress/Astro production cutover — blocking requirements

The standalone Astro preview is not a replacement for a functioning store. Production must remain WordPress until the owner has approved and independently tested a real routing plan preserving all of these **at the original authoritative origin or a fully QA-tested equivalent**:

1. **Account sessions:** login/logout, authentication cookies, password recovery, session expiry, CSRF/nonces, redirects, language routing, and mobile Safari switching between Wi-Fi and cellular.
2. **Orders:** cart, checkout, order confirmation, historical order history, invoice/receipt behavior, refund/cancellation status and idempotent notifications.
3. **Downloads:** WooCommerce purchase entitlements, protected download URLs, expiry, access without/with a valid purchase, redirect signatures and prevention of direct WAV/MP3 access.
4. **Backend/webhooks:** `wp-json`, `wp-admin`, `wp-login.php`, `admin-ajax.php`, active WooCommerce Ajax/API callback URLs, payment-provider and mail-service callbacks, and other dynamic endpoints verified on the **installed** site.
5. **Infrastructure:** deployment backups, rollback, TLS/canonical URLs, SEO redirects for explicitly verified public routes, asset parity, cache rules, security headers, and no open access to `woocommerce_uploads`.
6. **End-to-end acceptance:** a permitted new test purchase and download plus read-only inspection of an existing historical order, verified with a real authenticated user under the owner's control. Do not run a real charge or change a historical order without explicit approval.

**Cutover status remains BLOCKED.** Replacing the WordPress production root with the Astro `dist` folder would break business-critical functions and is not authorized.

## Next work — no live changes without authorization

First verify the real WooCommerce File download method and insecure redirect fallback. Privately preserve every affected file hash, source path, product reference and backup. Rehearse moving/restricting **all 22 original publicly reachable product files**, repointing downloadable-product metadata and delivering through Force Downloads or correctly configured X-Sendfile/X-Accel. Audit legacy audio players first to keep authorized samples working. Test guest denial, valid purchase, expired grants, download byte hashes, historical orders, and rollback before requesting a surgical production change.

**Cutover BLOCKED. No production changes performed.**
