# 432 Chamber Orchestra — WordPress public migration and protected service preservation

**Evidence:** 6 November 2026. **Production:** WordPress remains live. **Preview:** independent Astro subdomain.

## Public route inventory and parity

- Original 5 November WordPress inventory: 123 fixed public URLs (35 pages, 13 posts, 46 bilingual music products, 29 blog/music categories and tags).
- Verified 6 November Events Calendar addendum: 23 additional HTTP-200 URLs (two historic concert events, 13 event categories, eight calendar view URLs).
- Total observed, fixed public WordPress URLs: **146**. The original 123-route snapshot remains unchanged and the 23-route addendum is separately documented.
- Astro contains 144 corresponding historical routes plus 21 curated pages, **165 static pages**. Archive indexes are browseable, with multilingual permalinks and historical event pages.
- Both event records describe a concert dated 27 December 2016. BG WordPress recorded an evening start; EN recorded all-day, so the common date is displayed without assuming an exact common hour.
- Original music shop pages now link to 23 preserved product entries per language and their Bandcamp destinations. Historic calendar plugin month/list views are represented as permanent archives, not misleading upcoming events.

## Media

- 46 product routes (23 EN/BG pairs) map to verified Bandcamp tracks or albums. Curated Bandcamp catalogue: 12 releases, 53 track positions (not distinct compositions).
- The source Gmedia collection has 56 photographs, with two public albums of 23 and 32 photos, plus one unassigned source photo. 56 files were imported, distinct from the curated landing-page imagery.
- 32 product images, one locally recovered biography image, one event poster: 34 local legacy-media files. Total imported historical media: **90 files**.
- Five unique YouTube references, eight original Bandcamp music-player embeds from blog articles and two original SoundCloud playlist embeds. External-player availability remains subject to the respective services.
- The redesigned homepage uses the new recordings catalogue instead of copying its four historical homepage audio widgets verbatim.

## Protected historical downloads — PRIVATE

- All 46 historic WooCommerce products are marked downloadable.
- Their metadata contains 80 downloadable file references: 80/80 existing, 0 missing.
- These 80 references point to 26 distinct WAV/MP3 files, totalling 2,180,093,616 bytes. All 26 were independently SHA-256 hashed read-only on 6 November.
- The private filename/path/size/hash manifest is stored OUTSIDE both webroots at:
  /home/hzorche/ra-core-deploy-staging/orchestra-protected-download-integrity-20261106.json
- Private manifest SHA-256:
  884566469074c73335f916f750af05c734aacfee93fa3dd00da4b613967b253a
- File mode: 0600. Do not move protected audio or this private manifest into Astro public assets or Git.
- The larger production uploads tree is approximately 5.5 GiB and is intentionally retained on WordPress. Do not delete it during any future cutover.

## Functional restrictions and release policy

- Nine legacy account, cart, payment, purchase history and download-related routes are present in Astro as explicit historic notices, NOT functioning payment/customer pages. The WordPress backend remains authoritative for orders, entitlements, download access and callbacks.
- CRM/listening forms need verified integrations and lawful consent controls before activation. Archive route parity does not equal live backend parity.
- The public archive build was tested in both production-origin and preview-origin configurations; public link, SEO, historical-route and media-hash gates are mandatory.
- The live domain WordPress root, its .htaccess and its database are not modified by this migration. The independent preview stays passwordless as requested, but is marked noindex/nofollow and robots Disallow.
- Production-root cutover remains deliberately BLOCKED until an approved hybrid routing strategy, historic order/download access, real purchase-flow QA, backup, rollback and accessibility testing are completed. Never copy Astro dist directly over the WordPress root.

## Reproduction

The public-only WordPress page/post/product, Gmedia, Polylang and Events Calendar snapshots are preserved under docs; generated data is under src/content.

Run these from the project checkout with pnpm:
1. pnpm run legacy:generate
2. pnpm run typecheck
3. pnpm run build
4. pnpm run links:validate
5. pnpm run photos:validate
6. pnpm run legacy:validate
7. pnpm run preview:gate

For a preview build, set PUBLIC_SITE_URL to https://preview.432hz-orchestra.com and PUBLIC_PREVIEW_MODE to true. For local production-origin validation only, set PUBLIC_SITE_URL to the live domain, PUBLIC_PREVIEW_MODE false and run pnpm run seo:validate. No build step authorizes production deployment.
