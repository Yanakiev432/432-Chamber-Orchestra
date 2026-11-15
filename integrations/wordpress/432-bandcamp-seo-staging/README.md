
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
- bg-shop-canonical-guard.php — strictly scoped candidate for Yoast 'wpseo_canonical', 'wpseo_opengraph_url', and 'wpseo_schema_graph' filters on BG Woo archives.
- bg-shop-canonical-guard.test.php — 20 isolated assertions (three hooks, valid BG routes, nested JSON-LD and unrelated multisite safety).

Tested: PHP 8.4 initial lint PASS; **20/20 revised assertions PASS on PHP 7.4.34** on Everest, in CLI memory. GitHub source and test blobs were the tested inputs. Actual production frontend rendering after installation remains untested.

No 301 redirect, cart, checkout, product URL or G3 Analytics changes. A narrowly scoped **Yoast JSON-LD graph URL fix is staged**; no live WordPress schema changed.

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
2. Validate canonical, og:url, JSON-LD WebPage/ImageObject/BreadcrumbList IDs. Preserve page-1 reciprocal hreflang. Do **not** invent page-2 hreflang: Polylang 3.2.8 deliberately suppresses it on paginated archives, and page-2 EN/BG product sets are not exact translations.
3. Preserve distinct curated BG page 997 and complete Woo 23-product catalogue; verify pagination.
4. Regression-check 23 Bandcamp destinations, all 46 WP language mappings, Woo cart and checkout redirects, and other multisite websites.
5. Save rollback and obtain separate explicit approval for the exact production changes. No user account or ad changes.

## Official references

- Google canonical rules: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- Yoast og:url filter: https://yoast.com/help/change-og-url/

Local read-only source snapshot on Lenovo: C:\Users\User\Documents\432 Chamber Orchestra\Marketing\Bandcamp\G4_WordPress_Organic_SEO_Live_Audit_20261115.json ; SHA-256 9b7763475b2789df4d3a4647eee9458d3246c55f39316242d2b8ebcf57064eed.


## 15 November — native source, JSON-LD and WordPress-context verification

Installed read-only versions: WordPress 5.9.20, WooCommerce 7.0.2, Polylang 3.2.8, Yoast SEO 19.8, PHP 7.4.34. Checked installed Yoast source for \`wpseo_schema_graph\` and \`wpseo_opengraph_url\` filters. Raw anonymous live pages (no patch installed) report:

- /bg/shop/: WebPage, ImageObject and BreadcrumbList schema \`@id\` incorrectly reference /en/shop/ despite \`inLanguage=bg-BG\`.
- /bg/shop/page/2/: WebPage and ImageObject point at /en/shop/; \`canonical\` = EN page2, \`og:url\` = EN page1.
- Both EN and BG shop page2 omit \`hreflang\` deliberately: Polylang 3.2.8 source \`frontend-filters-links.php\` returns immediately if \`is_paged()\`. Six of seven page-2 English product IDs translate to the Bulgarian page-2 IDs; the seventh EN page-2 product is on BG page1 and vice versa. Thus page2 is not an exact reciprocal content pair. Do not add forced page2 hreflang links.

The third Yoast hook rewrites only URL strings equal to the erroneous English shop root/paginated URL or their fragments, inside the BG Woo archive graph. BG \`WebSite\` and \`Organization\` identifiers, external image URLs and unrelated routes stay unchanged.

**Test evidence:** \`20 PASS / 0 FAIL\` PHP 7.4.34 isolated tests on the actual hosting PHP binary; candidate source and GitHub blob hashes matched. A separate read-only \`wp()\` bootstrap for the exact BG page2 route resolved \`is_shop()=true\` and \`is_paged()=true\`. Because CLI starts with language \`en\` even for that route, test code set Polylang \`curlang=bg\` *only in process memory*. With three filters registered, \`apply_filters()\` corrected canonical, OpenGraph URL and a Schema.org fixture to their intended BG page2 values. This is a scoped WP integration test of hook registration and behavior, **not** a live HTML render or an installed plugin test.

**Remaining:** exact live post-install anonymous HTML verification with consent unchanged, real rollback plan, 23 Bandcamp destinations and 46 WP mappings, and separate owner authorization before any production write.


## Public outbound and Polylang mapping baseline (15 November, before deployment)

A fresh **read-only** crawl of all four Woo archive pages checked 16 + 7 English product cards and 16 + 7 Bulgarian product cards. Results:

- **46/46** cards have exactly one mapped official Bandcamp destination.
- **23/23** distinct Bandcamp destinations returned HTTPS HTTP **200**.
- **23/23** destination pairs consist of one English and one Bulgarian Woo product.
- A separate read-only WP/Polylang query confirmed **23/23** pair mappings using `pll_get_post_translations`, with 0 mismatches.
- No public page, cart state or redirect was edited. Checks did not submit a purchase.
- Evidence JSON on the authorized Lenovo Documents root: `G4_WordPress_SEO_Bridge_Regressions_20261115.json`, SHA-256 `568ff93bf877ec513555d5a0b9c0e690fef42a2a1656af154ba6eeb11a0ea8de`.

These results are a **before-change baseline**, not a post-deployment pass. Re-run the identical 46/23 checks after any explicitly authorized deployment. The private Bandcamp export and consent-related browser QA remain separate tasks.
