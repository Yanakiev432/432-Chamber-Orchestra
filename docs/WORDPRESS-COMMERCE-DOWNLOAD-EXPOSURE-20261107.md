# 432 Chamber Orchestra — production WooCommerce download-surface audit

**7 November 2026 · Read-only forensic review · Production cutover BLOCKED.**

## Verified results

An earlier report incorrectly described two DEMO MP3 assets as duplicates of protected WooCommerce files. They are **the original public media files** listed as downloads for two WooCommerce products. The complete 26-file download manifest corresponds to **80 download references and 46 published positive-price downloadable products**.

| Storage | Distinct files | Anonymous HEAD | One-byte Range GET | Paid products |
| --- | ---: | --- | --- | ---: |
| Ordinary WordPress uploads: WAV | 20 | 200 (20/20) | 206 (20/20) | 36 |
| Ordinary WordPress uploads: MP3 | 2 | 200 (2/2) | 206 (2/2) | 2 |
| Protected `woocommerce_uploads`: WAV | 4 | 403 (4/4) | 403 (4/4) | 8 |

About **2.02 GB** of originally configured product media is directly retrievable without a purchase: **2,010.64 MB of WAV** and **5.84 MB of MP3**. WAV duration ranges **58.6–481.8 seconds** (14 exceed two minutes). Only one byte was read from each accessible original in the access probe; no full paid files were downloaded or copied to Astro. The read-only database transaction examined product status, price and download metadata, not customer information.

The private 26-file manifest and protected source filenames remain outside the Git repository. The prior narrow private incident receipt was retained as evidence but its conclusion is **superseded**.

## Root cause and requirements

Per [WooCommerce Digital/Downloadable Product Guide](https://woocommerce.com/document/digital-downloadable-product-handling/) and [Approved Download Directories](https://woocommerce.com/document/approved-download-directories/), media selected from the public WordPress Media Library remain directly accessible. `Redirect only` download delivery is insecure. `Force downloads` or properly configured X-Sendfile/X-Accel can deliver entitled purchases, **but changing this option alone will not make an already public file URL private**.

The currently active download method and any insecure fallback have **not been independently verified**. Live authenticated customer downloads, expired grants, historical order continuation and purchase callbacks have **not been tested**.

## Owner-gated remediation — exact order

1. Preserve an offline/private SHA-256 inventory, full file backups, current prices, product-to-file mapping and a reversible deployment receipt. Do not publish direct media paths.
2. Verify the currently configured WooCommerce delivery method, redirect fallback, login requirements and download-entitlement grants. Inspect references from historical public audio players before changing a filename or URL.
3. Rehearse protected storage and repointing product download metadata on an isolated store. Choose Force Downloads or hosting-supported X-Accel/X-Sendfile, accounting for the largest **277.51 MB** WAV file.
4. Test anonymously inaccessible original file paths (403/404) **and** successful delivery to authorized buyers, including WAV byte SHA, expired/unauthorized grants, historical orders, BG/EN routes, mobile Safari and rollback.
5. Only after explicit owner authorization, stage the minimum production change with backup and reversible verification. Keep the existing WordPress commerce backend; do not replace its production webroot with Astro.

## Deterministic safety check

`pnpm run commerce:security:report` validates the redacted evidence snapshot. `pnpm run commerce:cutover:gate` must **return nonzero** while 22 direct paid-media paths remain accessible, the actual delivery settings are unknown, or buyer-download QA is incomplete. This deliberate cutover failure does **not** stop normal preview builds.

**No production changes have been made.**
