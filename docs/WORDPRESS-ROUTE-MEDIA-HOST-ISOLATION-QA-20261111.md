# 432 — Route, media and nested-host pre-cutover audit (11 November 2026)

**Status: STATIC INVENTORY PASS. PRODUCTION CUTOVER BLOCKED.**

The canonical source for this review is `docs/wordpress-retirement-plan-20261107.json`; this document does not amend its owner-approval or production cutover flags.

## Verified with the current Astro dist

| Area | Evidence |
| --- | --- |
| Compiled Astro pages | **394** |
| Published legacy WordPress routes | **146/146** directly present |
| Historical product URLs | **46/46** directly present |
| Distinct sitemap URLs | **216** |
| Sitemap URLs directly present | **203/216** |
| Remaining sitemap URLs | **13/216**, all in the intentionally unpublished `gmedia` group |
| Other observed historical URLs needing a disposition | **16**, all have proposed targets in the Astro dist |
| Held historical attachment source records | **270** |
| Unique held public attachment page paths | **258** |
| Held records without a public source-page path | **12** (not reconstructed or exposed) |
| Held media pages accidentally published in dist | **0** |
| PHP, SQL, PFX, WordPress core, or physically nested other-site content in dist | **0** |

The 13 unpublished gallery paths are documented in the companion JSON. The fact that they belong to the excluded set does **not** authorize automatic `301`, `410`, photo publication or data deletion.

## The 16 not-yet-deployed route dispositions

The portable machine-readable proposals are in `docs/wordpress-route-disposition-20261111.json`. Their groups are:

| Old route group | Count | Proposed handling |
| --- | ---: | --- |
| Root `/` | 1 | Language landing `/bg/`, subject to final Apache behavior |
| Old author `admin` archives | 2 | Preserve observed historical redirect to `/en/`, subject to editorial approval |
| Old event-category aliases | 2 | Redirect to existing BG/EN curated concerts, not excluded gallery pages |
| Legacy lost-password path | 1 | Existing static account-support notice, not a real password-reset form |
| Canonical `/page/1/` aliases | 10 | Redirect to the existing first-page canonical static route |
| **Total** | **16** | **Proposal only; nothing deployed** |

The 13 excluded historical `gmedia` URLs, including Studio5-related material, are a separate unresolved editorial decision. They must not be served by guessed placeholders or silently redirected to unrelated material.

## Media gate — fail closed

The compiled static candidate excludes the 258 distinct held media pages. Twelve other source records contain no public URL and are therefore excluded without guessing their address. Existing local media validators have also passed: 270 held records preserved, 11 approved public audio excerpts, 54 approved historical photo route equivalents.

These checks do **not** demonstrate that the actual production Apache configuration will return `403` for the 26 historical paid recording identifiers, all protected original source files or hypothetical old WordPress download endpoints. The 40-case Apache rehearsal is a synthetic, non-production test of a separately SHA-256-pinned configuration. **The protected-media production gate remains false.**

## Co-hosted applications

The common `public_html` has independent content and applications, including `432hz-foundation.com` and `432project.432hz-orchestra.com`. The protected directory audit on Everest checked **six** protected top-level directories and revalidated **five** SHA-256 sentinel files with **zero differences** after the surgical `/i.php` fix. The static Astro output does not contain their physical nested directories.

This is evidence of the current file separation, **not** evidence that a real main-domain Apache cutover and rollback has been accepted by these applications' virtual-host configurations. Therefore the owner approval gate for non-target-site isolation remains false.

## Release decision

The new validator `scripts/validate-wordpress-route-media-isolation-20261111.py` checks the pinned WordPress source inventories, all 394 Astro routes, the 13 exclusions, 16 proposed destination routes, 270 held attachment records, and forbidden files. Its report is `docs/wordpress-route-media-isolation-validation-20261111.json`.

The validator must pass in `--mode=report` and **fail with exit code 2** in `--mode=cutover`.

The canonical release conditions `allPublicLegacyLinksAndRedirectsReviewed`, `excludedMediaAndUnreviewedFilesDenylistValidated` and `nonTargetSitesIsolationAuditApproved` **remain false**. They require explicit editorial approval of route dispositions, verified production Apache protection and host isolation, and a real revert rehearsal.

**No changes to production WordPress/WooCommerce, Foundation, Project, Apache, DNS, PFX, archives, payments or old download entitlements were made by this audit.**
