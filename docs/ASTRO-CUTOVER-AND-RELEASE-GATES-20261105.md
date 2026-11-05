# 432 Chamber Orchestra — Astro readiness, commerce preservation and release gates

**Evidence date:** 2026-11-05. **Production state:** WordPress Multisite main blog 1 continues to serve `https://432hz-orchestra.com/` with **Bandcamp-only WooCommerce Bridge v1.0.4**. This branch has **not** been deployed.

## Decisions locked in

- Bandcamp is the sole new digital-music payment destination. No new WooCommerce music checkout.
- The original WordPress posts, 46 public product permalinks (23 Bulgarian and 23 English), media, WordPress administration and historical WooCommerce orders remain accessible.
- No paid LLM API, GPU work, unapproved payment test, WordPress upgrade, theme rewrite, forced Git branch update or production deployment during Astro development.
- Use Foundation's approved visual identity. The light-background Astro header now uses the approved **`/brand/foundation/logo-foundation-light.svg`**, with a separate visible `432 Chamber Orchestra` label. The dark-background WordPress header uses the corresponding approved Foundation dark variant.

## Verified blockers — do not bypass

1. **Legacy URL collision.** Astro currently emits **21 static HTML pages** and none of the 46 real historical `/en/product/` or `/bg/product/` routes. The 46 public WordPress source URLs are preserved in `docs/legacy-wordpress-public-routes-20261105.json`. `pnpm run cutover:report` reports 46 absent; `pnpm run cutover:gate` is deliberately fail-closed.
2. **Original cPanel deployment workflow was unsafe.** It built a `cpanel-deploy` branch and copied `dist/` and a new `.htaccess` to `/home/hzorche/public_html/`. This would risk overwriting the live WordPress rewrite rules. In **both** the Astro PR #2 branch and this branch, `.github/workflows/build-cpanel-deploy.yml` is changed to **read-only CI validation and a short-lived build artifact**. The existing deployed/default/feature branch is not changed by merely editing this draft branch; **do not merge/redeploy from a branch without the guarded workflow**. Do not use old cPanel auto-deploy instructions.
3. **WordPress is still required** for archival access, Woo order administration, legacy WordPress media URLs and any past order-pay/order-received links. Static route parity alone cannot prove payment and media continuity; a server routing architecture must be designed and tested before any root cutover.
4. **CRM features are not fully live.** Current Astro certificate form explicitly opens a `mailto:` request and has no backend. Listening circle forms depend on optional Brevo/Tally environment settings; missing settings fall back to email. Do not claim automatic CRM capture without verifying the configured service and consent workflow.
5. **Bandcamp image preview is separate from WordPress branding.** The shared iMessage card for the Katyusha track uses the `og:image` supplied by Bandcamp (`https://f4.bcbits.com/img/a3035628660_5.jpg` as of this audit). Changing the WordPress or Astro header logo does **not** change this old Bandcamp album artwork. A future artist-admin Bandcamp cover-art update is needed, followed by rechecking link preview caching.

## Safe Astro preview mode

The planned preview must be hosted on a **separate, owner-approved HTTPS hostname** with its own document root, not under WordPress `public_html`. The following is a *local test origin*, not a claim that the DNS host already exists:

```powershell
$env:PUBLIC_SITE_URL = 'https://preview.432hz-orchestra.com'
$env:PUBLIC_PREVIEW_MODE = 'true'
pnpm run build
pnpm run preview:gate
Remove-Item Env:PUBLIC_SITE_URL
Remove-Item Env:PUBLIC_PREVIEW_MODE
pnpm run build
pnpm run seo:validate
```

Preview build emits `Disallow: /` in robots.txt without a sitemap advertisement and `noindex,nofollow` on **all 21 HTML pages**, including the root redirect. Preview canonical links use only the supplied preview origin. The source is kept separate from production until a hosting directory, SSL and a rollback plan are approved.

## Bandcamp catalogue changes

- Official artist index: `https://432orchestra.bandcamp.com/music`.
- Current curated catalogue: **12 releases / 53 track positions**, where 53 is **not** the number of distinct compositions.
- Run `pnpm run bandcamp:test` for offline parsing invariants; run `pnpm run bandcamp:audit` for a read-only public-source comparison. It must fail for a missing/changed release, never silently add unverified titles, track counts or image rights.
- `.github/workflows/bandcamp-catalogue-audit.yml` contains a read-only daily check. **Scheduled execution is not active until merged to the repository default branch with GitHub Actions enabled.** Even when active, it **alerts through CI failure** rather than automatically publishing a guessed release or modifying the current WordPress catalogue.
- For a new release: check its Bandcamp source, title, year, track count, cover usage and URL; edit `src/content/bandcampCatalog.ts`; run audit/build/SEO/preview gates; review and publish separately.

## Proven local gates — 2026-11-05

| Gate | Evidence |
|---|---|
| Bandcamp parser/negative tests | 4/4 PASS |
| Live artist catalogue | 12/12 match; 0 new, 0 removed |
| Astro typecheck | 83 files, 0 errors/warnings/hints |
| Static build | 21 pages PASS |
| SEO | 21 sitemap URLs, BG/EN alternates and 12 release links each PASS |
| WordPress source route inventory | 46 URL records, 23 BG + 23 EN |
| Root destructive cutover | BLOCKED — 46 WordPress routes not in static output |
| Separate-domain, non-indexed preview | PASS after root redirect SEO fix |
| Production-root replacement | **NOT PERFORMED** |

## Remaining before production migration

1. Decide architecture: a **parallel Astro property** (safest) or a carefully routed **hybrid** serving approved new pages while WordPress continues to own legacy routes. Do not simply `cp dist/* public_html/`.
2. Inventory all relevant WordPress legacy URLs beyond the 46 products (media, categories, account/download and historic order endpoints) and verify them through the proposed router.
3. Validate the new site visually on iPhone/Safari and desktop; run keyboard, focus, accessibility and form behavior tests.
4. Set up and verify an isolated preview hostname and SSL, with `PUBLIC_PREVIEW_MODE=true`.
5. Verify CRM action endpoints and donation disclosures, including data handling; test without submitting personal data without approval.
6. Obtain explicit cutover approval and snapshot/rehearsed rollback before touching the existing site root.

## Additional hard evidence and offline preview — 2026-11-05

**Public WordPress routes verified beyond products:** The read-only full inventory in
`docs/legacy-wordpress-published-routes-20261105.json` includes 35 published pages,
46 published products, 13 published blog posts and 29 public category/tag archives:
**123 unique public URLs**. The independent `scripts/audit-legacy-public-http.mjs`
ran a bounded 3-concurrent `HEAD` audit on Lenovo: **123/123 PASS** —
119 HTTP 200 responses and four expected HTTP 302 redirects from historical
cart/checkout URLs to Bandcamp. No authentication, order access, checkout or payment was used.
A private detailed JSON receipt is on Lenovo:
`Documents\\432 Chamber Orchestra\\Backups\\WordPress-20261104\\QA-20261105\\legacy-route-http-123-20261105.json`
(SHA-256 `3d327887746bc2f4dc187818b9b794613bdc8537d550b7ab7c34bdbb884a894f`).

**Static route intersection:** The extended `cutover:report` found **121 of 123
published routes missing in Astro** and **two shared paths** (`/bg/`, `/en/`),
whose content would change. All 46 product routes are confirmed consistent across
the original product inventory and new all-published inventory. Old routes cannot
be discarded or replaced with blanket Bandcamp redirects: pages, press, blog,
archives and historic orders have separate preservation requirements.

**Built-site internal link audit:** A new `scripts/validate-static-links.mjs`
checks links, page anchors and static assets across all 21 generated HTML pages.
It initially detected **four broken links** from BG/EN `first-sound` navigation
to `/bg//bg/recordings/` and `/en//en/recordings/`; those were fixed by removing
redundant manual prefixes and letting the shared Header route resolver work.
The full typecheck/build/SEO/links suite then passed:
**85 Astro files, 0 errors/warnings; 746 href/src references checked,
690 internal references, 154 static asset references, 0 broken links**.
Read-only CI now runs this link validator.

**Visual QA:** The Astro build was served only on Lenovo's loopback interface,
not on a public host. Firefox headless screenshots at **390×844** and **1440×900**
were captured for the BG homepage and EN discography. The tested viewport layout
shows legible Foundation wordmark and Chamber Orchestra caption, single-column
mobile content and responsive recording cards. A physical iPhone/Safari or full
WCAG keyboard audit has not been completed. The temporary local preview server
was terminated after screenshots.

**Isolated preview package prepared, not deployed:**

- Lenovo file: `C:\\Users\\User\\Documents\\432-Astro-Preview-Only-20261105.zip`
- ZIP SHA-256: `6eec04efe76d9cfae2c1f6f820a17ca19e5974e39bf8c3877e1196443ae2650e`
- Size: **14,944,780 bytes**, 137 entries, 21 noindex/nofollow static pages,
  robots `Disallow: /`, dedicated preview canonical URLs, 0 broken local links.
- Preview hostname in this build is a **placeholder**
  `https://preview.432hz-orchestra.com`, not a configured/live DNS record.
- cPanel inspection: `432project.432hz-orchestra.com` exists but serves an
  **independent WordPress instance** (do not overwrite);
  `staging.432hz-foundation.com` serves the **Foundation staging instance**
  and currently returns HTTP 401 to unauthenticated requests (do not overwrite).
  No unused isolated orchestra preview host was found. The new site must get
  its own reviewed DNS/document root/SSL or another approved isolated hosting
  location before an **online** preview is available.
- Normal default-site `dist/` was rebuilt and passed SEO/link checks again after
  creating the preview ZIP. None of the archive files were uploaded to cPanel.

**Production remains unchanged**: WordPress main-site + Bandcamp Bridge v1.0.4,
46 music products and 123 public URLs remain live.
