# 432 Chamber Orchestra — remaining WordPress media triage and commerce boundary

**Evidence date:** 7 November 2026. **Scope:** read-only audit of the original WordPress site and fail-closed regression checks in the independent Astro preview. **No production changes.**

## Verified inventory and exact accounting

The original site exposes **353 WordPress attachment detail-page URLs**, each observed HTTP 200 in the original public route probe. Astro now has **83 corresponding attachment pages** (7 earlier archival/featured pages, 22 reviewed promotional audio pages and 54 reviewed photographic pages). Of the **270 remaining detail-page URLs**, the verified original MIME inventory is:

| Pending class | Source URLs | Disposition |
| --- | ---: | --- |
| WordPress `woocommerce_uploads` WAV attachment pages | 8 (4 distinct files) | **BLOCK**: protected products |
| Other original WAV attachment pages | 100 | Hold: rights, provenance, purchase-status, and media-length review |
| Other DEMO MP3 attachment pages | 12 (6 distinct files) | **BLOCK 6** URLs (protected-hash match or truncated content); hold 6 for rights/duration review |
| Specifically rejected Studio 5 photograph attachment pages | 13 | **BLOCK**: previously explicit editorial exclusion |
| Other variant of the Studio 5 Concert series | 1 | Hold: crop/content and editorial review |
| Additional VBAL image variants | 22 | Hold: compare actual visual content and approvals |
| Additional DSC concert frames | 42 | Hold: not among the twelve curated frames |
| Historical branding, logos, crops or layout artwork | 38 | Hold: verify current identity and archival relevance |
| Other uncurated historical images | 34 | Hold: rights, person-specific content, context |
| **Total** | **270** | **No automatic redirect or publication** |

All 270 item-level decisions and their public historical attachment permalink IDs are in `docs/wordpress-remaining-media-review-20261107.json`. Direct media download URLs are omitted. Media filenames and historic page paths are additionally suppressed for **all 12 high-risk records**: eight WooCommerce-protected WAV attachments and four MP3 attachment URLs whose bytes exactly match protected WooCommerce downloads. Filename-based image groups are *preliminary* and are not evidence of identical visual content, ownership or permission.

The 13 rejected Studio 5 WordPress attachment pages are **different original routes** from the 13 excluded Gmedia photograph URLs in the broader source-path comparison. Do not double count them as a new editorial omission or publish either class.

## Verified WooCommerce access boundary

- The eight remaining WooCommerce WAV attachment records reference **four distinct protected source files**.
- The actual protected uploads directory contains a case-insensitive Apache `deny from all` rule.
- Four *anonymous* HTTPS `HEAD` requests to the **direct protected media URLs** all returned **403 Forbidden**, without authenticating or downloading media.
- A path-redacted, non-public receipt was written in the owner's private server staging directory:
  `/home/hzorche/ra-core-deploy-staging/orchestra-woocommerce-anonymous-access-guard-20261107.json`
- Receipt SHA-256:
  `ea93a4a641c78700448d98a0ab6645f9c92458e649e2bc2179543accfc2918f0`
- Anonymous **GET with a one-byte Range request** also returned HTTP **403 for all four protected-directory source files**, without downloading their bodies.
- **HIGH-PRIORITY ACCESS CONTROL GAP:** two other original WordPress files are *byte-for-byte identical* to content listed in the private WooCommerce protected-download manifest (SHA-256 exact). Those two copies reside outside the protected uploads directory; anonymous `HEAD` returned **200**, and one-byte anonymous `Range GET` returned **206** for both. They are publicly downloadable by anyone knowing their original media URLs even though the protected copies deny anonymous requests.
- A separate **private, mode 0600** incident receipt identifies exactly which two source copies and which protected entries are duplicates:
  `/home/hzorche/ra-core-deploy-staging/orchestra-wordpress-protected-content-public-duplicate-20261107.json`
- Private incident receipt SHA-256:
  `ade2328d74c7fed9454c0eb7cd70c5ece6c1aa8c72245764fae2c8d95b5bf2a9`
- No vulnerable media URLs, direct filenames, hashes or protected paths are recorded in the public review manifest. **The precise remediation is owner-gated**: determine whether these files were intentionally promoted for free; retain a private backup; replace each publicly accessible byte-identical copy with an approved short excerpt *or* restrict the exact original URL; update affected legacy players; and separately verify authorized purchased downloads, rollback and redirects.
- These findings do **not** verify valid customer download grants, expired links, checkout callbacks, stored historical orders, or the safety of any future routing changes.

## Fail-closed regression control

`scripts/validate-remaining-attachment-quarantine.mjs` is part of `pnpm build` and is also runnable using `pnpm run attachments:quarantine:validate`. It verifies that:

- The 353 WordPress attachment IDs are partitioned into **83 approved/restored** versus **270 held/blocked** without duplicates or omissions.
- None of the 270 held/blocked original attachment page URLs exists in the Astro preview output.
- All twelve high-risk protected-content records (eight WAV entries under protected WooCommerce storage plus four MP3 entries proven byte-identical to protected purchases) lack direct media filenames and historical attachment-page paths in the tracked review manifest.
- All 13 excluded Studio 5 image filenames remain quarantined, regardless of similar filenames or variants.
- None of the 12 unapproved DEMO attachment URLs is silently authorized: **4 are blocked by protected WooCommerce SHA match**, **2 by truncated 2088-byte media**, and **6 remain on hold for duration/rights review**. No pending item has been published as a placeholder.
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

## Next work

**Priority 1:** resolve the two public copies that exactly match WooCommerce protected-download content, under an explicit owner-approved surgical change plan. **Priority 2:** verify permitted purchased-download behavior and hybrid WordPress commerce routing without changing historical orders or charging real customers. **Priority 3:** further review only the three distinct DEMO MP3 files whose six public-page URLs remain on hold, followed by historical visual assets. No mass redirect or production cutover is approved.
