# 432 — WooCommerce original paid media: live anonymous HTTP exposure, 12 November 2026

**Security outcome: HIGH PRIORITY. 22/26 original paid recording files remain anonymously downloadable. Exact-file mitigation is prepared and fully preflight-tested, but NOT applied to production.**

## Current production evidence

A new read-only inventory on Everest queried the *current* published WooCommerce product `_downloadable_files` metadata: **46 product metadata rows, 80 file references and 26 distinct original media files**. This is a fresh 12 November production recheck, not only the earlier 7 November snapshot.

Read-only, unauthenticated HTTPS `HEAD` and **one-byte** `Range: bytes=0-0` tests yielded:

| Source media | Count | HEAD | One-byte GET |
| --- | ---: | --- | --- |
| Original WAV publicly reachable | 20 | 200 | 206 |
| Original MP3 publicly reachable | 2 | 200 | 206 |
| Existing protected WAV | 4 | 403 | 403 |
| **Total** | **26** | **22 public; 4 denied** | **22 public; 4 denied** |

The **22 exposed file paths** were also tested against both `432hz-orchestra.com` and `www.432hz-orchestra.com`: **44/44 one-byte HTTPS responses were 206**. No full audio was downloaded, and URLs, filenames, source media content and buyer/customer data were intentionally omitted from all public reports.

This does *not* prove that any unauthorized person has actually downloaded the files. It proves unauthenticated delivery was technically possible.

## Actual WooCommerce 7.0.2 delivery behavior

Verified live options: `woocommerce_file_download_method=force`, `woocommerce_downloads_redirect_fallback_allowed=no`. The deployed WooCommerce 7.0.2 `WC_Download_Handler::parse_file_path` was called in an isolated read-only WP-CLI context and **resolved 80/80 references to 26 existing, local, PHP-readable files, 0 remote, 0 missing**.

This supports the feasibility of a *server-side Apache denial of direct media URLs* while retaining approved, token-checked PHP Force Downloads. However, an end-to-end authenticated real historical purchaser test has NOT been performed, so customer-access compatibility remains unproven.

WooCommerce's official downloadable-product guidance distinguishes PHP Force Downloads from direct file URLs and recommends protection of original media stored in public WordPress uploads: https://woocommerce.com/document/digital-downloadable-product-handling/.

## Private, exact-match and reversible mitigation

Two private Apache `FilesMatch` candidate rules were generated from the **current** 22 paid filenames, grouped into two existing upload directories (**16 and 6 originals**). Both target directories currently have no direct `.htaccess`. PHP PCRE matched **22/22 exact paid files** and **0/1,451 unrelated neighboring files**.

The private root-only candidate files, exact media names, and guarded operation script reside **outside all web roots** on Everest under `ra-core-deploy-staging/432-wp-recovery-v2-20261110/`.

The guard file `SAFE-432-WOO-22-SOURCE-MEDIA-GUARD-20261112.py` has SHA-256 `b776d7e0d48cfbaabe1d28b60bb1f742946f43011dba4699faeef7f9904b01d1`. **Dry-run PASS.** A deliberately unauthorized `--apply` test refused the operation, exit code 3; no production `.htaccess`, media permissions, files, orders or databases were modified. When authorized, the guard is designed to create only the two exact pinned `.htaccess` files, test 44 direct HTTP requests for denial, and reverse its own writes upon a failed gate.

**Do not paste the sensitive private rule files or original media URLs into GitHub, chat, public Astro, email or external dashboards.** Never deploy a blanket `Deny from all` over WordPress `wp-content/uploads`, which would also break images and previews.

## Release blockers and decision

The remaining mandatory steps before this remediation can be marked PASS are:

1. Explicitly authorize this *exact production security change* independently of Astro cutover.
2. Apply only the two hash-pinned restrictive rules after rechecking current WooCommerce `force` + no fallback and all source media baselines.
3. Verify all 22 direct URLs are denied on **both** hostnames, other public media and site pages remain accessible, and the 4 previously protected originals stay denied.
4. Verify WooCommerce's authenticated original download entitlement on an authorized test purchase or suitably isolated reproducible fixture **without expanding old buyer rights**.
5. Preserve the private rollback capability and receipt. A rollback would deliberately expose paid media again, and therefore must not be executed casually.

Until these actual results exist, `excludedMediaAndUnreviewedFilesDenylistValidated` remains **false**. **No change to the 12 existing WordPress retirement gates**, and no Astro main-domain deployment, order suspension, DNS update, PFX exposure, or buyer-data export occurred in this work.
