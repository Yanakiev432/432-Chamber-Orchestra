# G4 — Bundle-first WordPress homepage copy (EN/BG), staging only

**NOT LIVE. NOT AUTHORIZED FOR PUBLIC EDITS.** No WordPress, Bandcamp, Patreon, advertising or fan-account changes have occurred. This branch is independent of SEO canonical Draft PR #9 and tracking Draft PR #8.

## Why this matters

From the owner's anonymized 2026 email reconciliations:
- Four **Full Digital Discography** Bandcamp orders → **€366.80** in PayPal email notices.
- All twelve matched Bandcamp order notices → **€412.23**.
- Bundle share → **88.98%** of that limited notice sample. The sample is small; this does not prove future conversion or a purchase rate.
- Current public Bandcamp offer: *Full Digital Discography* comprising **12 releases**, **€100.40 minimum** and **20% discount**, observed 15 November 2026. Official album page JSON-LD also exposes the full-discography offer. The price/discount may change; they are intentionally **not hard-coded in evergreen WordPress copy**.
- The two WordPress homepages have no visible dedicated full-discography CTA. The old introductory paragraphs promise a "permanent sale" and both link to an English legacy **/en/buy-our-music/** page. The Bulgarian homepage sends Bulgarian readers to that English page.

Relevant public pages:
- EN homepage: https://432hz-orchestra.com/en/
- BG homepage: https://432hz-orchestra.com/bg/
- Verified Bandcamp landing **with visible full-discography purchase option**: https://432orchestra.bandcamp.com/album/432-hz-quartet-music
- Official Bandcamp all-releases view: https://432orchestra.bandcamp.com/music
- Bandcamp official full discography guide: https://get.bandcamp.help/en/articles/15263410-how-do-i-enable-the-purchase-of-my-full-digital-discography

## Exact approval scope

The JSON manifest `G4_Homepage_Bundle_First_Copy_Staging_20261115.json` contains the **entire original WordPress post_content**, source content SHA-256, exact original fragment, its bilingual proposed replacement and the *entire proposed post_content*.

| Language | WordPress page ID | Current page | Source SHA-256 |
| --- | ---: | --- | --- |
| EN | 47 | `/en/` | `b712a49257c4a968c871a09d79dd16c4b943015c1dbd789cc4e2e3ba50a88e93` |
| BG | 61 | `/bg/` | `69c3c8f98afef409674b7a0a7059e657351e5cfa756f00c9cb2f0a6f5a30b1d1` |

The target field is one initial promotional paragraph **per page**. Nothing else. Preserve all four original Bandcamp embeds, survey descriptions/links, Foundation support links and page IDs. Do not change WooCommerce, product slugs, checkout, cookies, analytics, CMP or the Bandcamp account. Do **not** create a new product called Full Digital Discography.

### Proposed English intro

**Explore the recordings of 432 Chamber Orchestra**

Listen to orchestral and chamber performances at A = 432 Hz, including live concerts and clearly identified demos and rehearsal recordings.

**Explore the full digital discography — 12 releases on Bandcamp** — link to official 432 Hz Quartet Music album page, which contains the full-discography buying option. On Bandcamp, you can choose the full-discography purchase option or **browse individual recordings** via the official Bandcamp `/music` page.

### Предложение за български текст

**Открийте записите на Камерен оркестър 432**

Слушайте оркестрови и камерни изпълнения при концертен строй ла = 432 Hz, включително концертни записи и ясно обозначени демо- и репетиционни записи.

**Разгледайте пълната дигитална дискография — 12 издания в Bandcamp** — връзка към официалната страница на албума „432 Hz Quartet Music“, която съдържа опцията за покупка на цялата дискография. В Bandcamp можете да изберете покупка на цялата дискография или да **разгледате отделните записи** чрез страницата `/music`.

## Safety gate and tests

- `G4_Bundle_First_Copy_Validator_20261115.mjs` is a **pure, read-only validator**, with no WordPress API or network access. It verifies exact source post_content SHA, unique original paragraph, byte-exact preservation of non-target content and all four audio embeds, both official Bandcamp URLs, no hard-coded prices/discounts, and approval=false.
- `G4_Bundle_First_Copy_Validator_20261115.test.mjs`: executed with the owner's Node 22.23.2 on Lenovo — **11 PASS / 0 FAIL**; unit test results do not confer production permission.
- The validator returns `READY_FOR_EXPLICIT_COPY_APPROVAL`, never "DEPLOY". A changed WP source hash is an explicit STOP, not a merge/rebase trigger.
- The public Bandcamp **album page**, rather than unverified checkout-fragment deep links, is used for the proposed CTA. JSON-LD offer fragment is recorded as evidence only; the visitor behavior of the fragment has not been browser-tested.

## After separate explicit owner GO (not executed)

1. Re-read current WP post_content for IDs 47 and 61, match stored SHA-256 and exact fragment. If any mismatch, STOP for a new diff.
2. Snapshot both posts and export reversible prechange content. Apply only the chosen replacement fragment to exactly the approved page IDs.
3. Inspect anonymous EN/BG homepage visually at desktop/mobile; both CTAs should open the official Bandcamp page/catalog, and the full-discography option must be easy to find without misleading "buy now" wording.
4. Verify all 8 existing audio embeds, survey/Support links, 46 Woo product links, 23 Bandcamp destinations, and cart/checkout redirects. Preserve consent behavior and unrelated multisite websites.
5. Record actual change result and rollback receipt. Publishing social posts, emailing followers, changing Bandcamp discount or any paid action require separate permission.

**Changes performed:** GitHub draft and Lenovo local staging only. **Public updates:** 0. **Spend:** €0.

## In-memory WordPress preflight passed (15 November 2026)

The actual **published WordPress post_content** was independently re-read on Everest via PHP 7.4.34 and `wp-load.php`, with **no database changes**. For both EN ID47 and BG ID61, the source SHA-256 matched the staged manifest, the original fragment occurred exactly once, Polylang language matched, all four audio shortcodes remained byte-identical after replacing only the specified paragraph, and DOMDocument found zero parser warnings. Both verified Bandcamp CTA URLs appeared in each proposed text. **2/2 PASS_NO_WRITE**.

An initial CLI invocation with an artificially low `128M` PHP memory limit failed at Jetpack bootstrap (no changes); repeated under `512M` completed successfully. This is **not** a production frontend/browser visual test; the PR remains Draft and requires separate approval before any public edit.

Read-only machine receipt: `C:\Users\User\Documents\432 Chamber Orchestra\Marketing\Bandcamp\G4_Homepage_WP_InMemory_Preflight_20261115.json`, SHA-256 `15b6aa9e6b045c345b0e3d00f89928114559c633808b173f4de796f1f0adcc5f`.
