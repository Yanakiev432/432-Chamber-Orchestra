
# G4 — Multilingual Shop canonical and organic SEO QA

**STAGING ONLY. No deployment, WordPress edit, redirects or plugin activation authorized.**

## Verified 15 November 2026

- WordPress multisite blog 1, Yoast, Polylang, WooCommerce.
- English Woo shop page ID **106**; translated Bulgarian WordPress page ID **997**.
- Actual Woo archive /en/shop/ has 23 products, with page 2. Actual BG Woo archive /bg/shop/ also has 23 products on two pages.
- BG translated page /bg/магазин/ (ID 997) is a **separate 15-item curated listing**, not the full archive. **Do not redirect** it.
- Current live BG Woo archive has canonical and OpenGraph URL pointing to EN: /bg/shop/ → /en/shop/, and /bg/shop/page/2/ → /en/shop/page/2/.
- Reciprocal EN/BG hreflang currently uses /en/shop/ ↔ /bg/shop/. The incorrect BG canonical contradicts this.
- 432 Bandcamp-only bridge v1.0.4 remains unchanged.

## Draft fix (no production deployment)

Files:
- bg-shop-canonical-guard.php — strictly scoped candidate for Yoast 'wpseo_canonical' and 'wpseo_opengraph_url' filters on BG Woo archives.
- bg-shop-canonical-guard.test.php — 14 isolated assertions (both hooks, valid BG routes, unrelated routes and multisite safety).

Tested: PHP 8.4 php -l PASS and **14/14 assertions PASS**. Source GitHub blobs match tested sources. The production runtime is PHP 7.4 and **must** also pass before any GO.

No 301 redirect, cart, checkout, product URL, WordPress schema or G3 Analytics changes.

## Proposed organic metadata (not published)

| Page | Proposed title | Proposed meta description |
| --- | --- | --- |
| /en/ | 432 Chamber Orchestra / Recordings at A = 432 Hz | Listen to chamber and orchestral recordings by 432 Chamber Orchestra in Sofia, Bulgaria. Explore 12 releases, live performances and demos on Bandcamp. |
| /bg/ | Камерен оркестър 432 / Записи и музика | Слушайте камерни и оркестрови записи на Камерен оркестър 432 от София. Разгледайте 12 издания в Bandcamp, концерти и демозаписи. |
| /en/shop/ | Digital Recordings / 432 Chamber Orchestra | Browse chamber and orchestral recordings, live performances and demos by 432 Chamber Orchestra. Listen to individual tracks and purchase via Bandcamp. |
| /bg/shop/ | Дигитални записи / Камерен оркестър 432 | Разгледайте камерните и оркестровите записи на Камерен оркестър 432, концерти и демозаписи. Слушайте и купувайте през Bandcamp. |
| /bg/магазин/ | Подбрани записи / Камерен оркестър 432 | Подбрани записи на Камерен оркестър 432. Слушайте музика от Моцарт, Бах и други композитори или вижте пълния дигитален каталог. |

The homepages still promise a "permanent sale"; validate it or replace with neutral listening-first copy, with no promise of a discount. The EN shop meta description is still "This is where you can browse products in this store." Preserve all public slugs and existing purchases.

## Explicit production acceptance gates

1. Validate PHP 7.4 and actual WordPress language/is_shop() routing for BG shop and page 2.
2. Validate canonical, og:url, JSON-LD WebPage URL and reciprocal hreflang; do not assume Yoast canonical filters change all schema IDs.
3. Preserve distinct curated BG page 997 and complete Woo 23-product catalogue; verify pagination.
4. Regression-check 23 Bandcamp destinations, all 46 WP language mappings, Woo cart and checkout redirects, and other multisite websites.
5. Save rollback and obtain separate explicit approval for the exact production changes. No user account or ad changes.

## Official references

- Google canonical rules: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- Yoast og:url filter: https://yoast.com/help/change-og-url/

Local read-only source snapshot on Lenovo: C:\Users\User\Documents\432 Chamber Orchestra\Marketing\Bandcamp\G4_WordPress_Organic_SEO_Live_Audit_20261115.json ; SHA-256 9b7763475b2789df4d3a4647eee9458d3246c55f39316242d2b8ebcf57064eed.
