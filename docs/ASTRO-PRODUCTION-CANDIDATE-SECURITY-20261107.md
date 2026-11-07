# Production-only Astro artifact — immutable media and configuration allowlist

This stage prepares the independent static replacement for `https://432hz-orchestra.com` **without deploying to the main document root**. It is not permission to delete WordPress or WooCommerce.

## Dual SEO modes

The Astro preview must remain `noindex,nofollow` for all 394 pages. The production candidate uses `PUBLIC_SITE_URL=https://432hz-orchestra.com` and `PUBLIC_PREVIEW_MODE=false`, and must have **385 indexable pages** and **9 former-store information pages with `noindex,nofollow`**. The former WooCommerce checkout/account routes stay available as static help pages but are absent from the 385-URL XML sitemap.

The demo-audio attachment, historical photo attachment, and curated-album QA scripts now explicitly distinguish preview from production. A new independent production artifact gate checks page-by-page canonical URLs, the nine historical-store noindex pages, production robots/sitemap, full output inventory, audio whitelist and withheld files.

## Verified public audio sources

The generated static files contain **15 approved-in-manifest historical audio assets**: 11 newer curated MP3 excerpts, and **four previously public Franz Liszt Liebesträume archive media files (3 MP3 plus 1 WAV)**. All 15 are pinned in checked-in source manifests by path, exact size and SHA-256. A separate private, read-only server reconciliation compared the 15 against **all 26 original product-download file SHA-256 hashes**: no byte-identical overlaps were detected. This comparison does not independently certify performer or recording rights for the older Liszt demonstrations.

## Packaging boundary

Astro currently generates 623 files. Only **618** may enter a main-domain static package. Five files are **withheld**: `.htaccess`, two Markdown source documents, one `.astro` brand source file, and one additional brand README text file. Do not upload the generic `.htaccess` to the main root: production rewrite, protected historical downloads, canonical redirects and nested virtual hosts require a separately verified server-specific configuration.

The default build and content validation are unchanged. `pnpm run production:build:qa` runs a clean production Astro build followed by all validation scripts exactly once; `pnpm run production:artifact:validate` checks a freshly built production candidate. These commands **do not publish or authorize a cutover**. Package the 618 allowlisted files only after the gate passes.

## Remaining release blockers

An encrypted, recoverable, durable backup off Superhosting; a documented historical-purchase support and personal-data retention policy; a verified full restore/rollback rehearsal; reviewed static Apache rules and a precise allowlist that protects the separately hosted foundation and project sites; and explicit approval for the live domain change.
