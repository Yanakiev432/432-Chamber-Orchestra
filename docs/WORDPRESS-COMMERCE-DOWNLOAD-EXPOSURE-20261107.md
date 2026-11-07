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

**The current WordPress setting is `woocommerce_file_download_method = force`**, independently verified in a read-only database transaction. The option to append a hash to new download filenames is enabled. These settings do not retroactively restrict public Media Library URLs. Insecure-redirect fallback, actual authenticated customer downloads, expired grants, historical order continuation and payment callbacks remain **unverified**.

## Owner-gated remediation — exact order

1. Preserve an offline/private SHA-256 inventory, full file backups, current prices, product-to-file mapping and a reversible deployment receipt. Do not publish direct media paths.
2. `Force downloads` is confirmed. Verify any insecure redirect fallback, login requirements and download-entitlement grants. A read-only search of 94 published post/page/product bodies found no literal direct references to these 26 media paths or basenames, but dynamically generated player/plugin links remain possible.
3. Validate precise server-side denial of the 22 original direct media paths while preserving PHP-based WooCommerce Force Downloads. Two candidate `<FilesMatch>` rules were prepared privately (six files from 2016/12, sixteen from 2017/10). In an isolated preview-host test, the same Apache rule blocked a harmless dummy file with 403 while a neighboring control remained HTTP 200. Test WooCommerce buyer delivery and PHP size/time limits before deployment, particularly the largest **277.51 MB** WAV file.
4. Test anonymously inaccessible original file paths (403/404) **and** successful delivery to authorized buyers, including WAV byte SHA, expired/unauthorized grants, historical orders, BG/EN routes, mobile Safari and rollback.
5. Only after explicit owner authorization, stage the minimum production change with backup and reversible verification. Keep the existing WordPress commerce backend; do not replace its production webroot with Astro.

## Isolated web-server enforcement dry-run

A private non-webroot receipt records the two candidate `.htaccess` files and an exact-match audit of all 22 names, with **zero additional file matches**. The receipt SHA-256 is `08a2553ed6339b68229d498c760fa2b59e9b24885db639db00b314d755498e98`.

Separately, a harmless temporary folder on the isolated Astro preview tested the same `<FilesMatch>` Apache syntax over HTTPS: **403** for the matching dummy `.wav` and **200** for its unrelated `.txt` neighbor. The temporary folder was deleted immediately. This validates server rule execution, **not** authenticated WooCommerce delivery. Neither public nor protected paid media were used for this test.

## Deterministic safety check

`pnpm run commerce:security:report` validates the redacted evidence snapshot. `pnpm run commerce:cutover:gate` must **return nonzero** while 22 direct paid-media paths remain accessible or valid-buyer download QA is incomplete, even though the `force` setting is now verified. This deliberate cutover failure does **not** stop normal preview builds.

**No production changes have been made.**
