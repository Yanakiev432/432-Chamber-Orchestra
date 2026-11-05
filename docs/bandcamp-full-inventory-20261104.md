# 432 Chamber Orchestra catalogue reconciliation (read-only)

**Initial inventory:** 2026-11-04. **Live URL and purchase-CTA checks:** 2026-11-05. No source store items or existing Bandcamp releases modified.

## Counting correctly
- **12 Bandcamp releases** on the /music page.
- **53 listed track positions** across those releases: 6 + 7 + 12 + 1 + 3 + 16 + 1 + 1 + 1 + 1 + 1 + 3 = 53. Not necessarily unique musical works or separate Bandcamp *release* products.
- 2018 Christmas album repeats one *Waltz of the Flowers* title in two adjacent track positions (8 and 9). Investigate whether the audio files themselves are duplicates before proposing correction.
- **46 published WordPress WooCommerce product posts** from read-only SQL, consisting of **23 Polylang translation pairs**, one EN and one BG each.
- Every pair has an identified Bandcamp destination by source release or title. **All 23 Bandcamp destinations returned HTTP 200 with visible Buy Digital Track/Album controls on 2026-11-05. All 46 individual WordPress product URLs returned HTTP 200 and contained WooCommerce add-to-cart controls.** However, waveform-level recording identity, payment completion, and visitor metrics are not independently verified.

## Release inventory

| Bandcamp release | Year | Listed tracks | Destination |
|---|---:|---:|---|
| Mozart — Six Notturni (Canzonetti) | 2019 | 6 | https://432orchestra.bandcamp.com/album/wolfgang-amadeus-mozart-six-notturni-canzonetti |
| 432 Hz Quartet Music — Part 2 | 2019 | 7 | https://432orchestra.bandcamp.com/album/432-hz-quartet-music-part-2 |
| Have Yourself a 432 Hz Christmas — Live Concert | 2018 | 12 | https://432orchestra.bandcamp.com/album/have-yourself-a-432-hz-christmas-live-concert |
| Mozart — Divertimento KV 136 (rehearsal) | 2017 | 1 | https://432orchestra.bandcamp.com/track/432-chamber-orchestra-w-a-mozart-divertimento-in-d-dur-kv-136-yanakiev-recording-from-rehearsal |
| Vivaldi — RV 151 (rehearsal) | 2017 | 3 | https://432orchestra.bandcamp.com/album/432-chamber-orchestra-antonio-vivaldi-concerto-alla-ristica-in-g-rv-151-432-hz-yanakiev-recording-from-rehearsal |
| 432 Hz Quartet Music | 2017 | 16 | https://432orchestra.bandcamp.com/album/432-hz-quartet-music |
| Bizet — Carmen Suite, Entr'acte | 2016 | 1 | https://432orchestra.bandcamp.com/track/g-bizet-entracte-suite-carmen-432-hz |
| Satie — Gymnopédie No. 1 | 2016 | 1 | https://432orchestra.bandcamp.com/track/e-satie-gymnopedie-no-1-432-hz |
| Schubert — Moment musical No. 3 | 2016 | 1 | https://432orchestra.bandcamp.com/track/fr-schubert-moment-musicaux-no-3-d-780-432-hz |
| Bach — Air | 2016 | 1 | https://432orchestra.bandcamp.com/track/j-s-bach-2-air-orchestral-suite-no-3-432-hz |
| Elgar — Elegy for Strings | 2013 | 1 | https://432orchestra.bandcamp.com/track/edward-elgar-elegy-for-strings-op-58-432-hz |
| Vivaldi — RV 151 (2013 demo) | 2013 | 3 | https://432orchestra.bandcamp.com/album/demo-vivaldi-antonio-concerto-in-g-alla-rustica-rv-151-432-hz-demo |

## WordPress → Bandcamp crosswalk

See [23-pair CSV](wordpress-bandcamp-23-pair-crosswalk-20261104.csv).

Interpretation:
- 1 full Quartet album pair → full album
- 16 individually listed Quartet tracks → specific track pages in the same album
- 6 other WordPress product pairs → Bizet, Mozart KV136, Vivaldi RV151 (2017 album), Satie, Schubert, Bach.
- The **2018 live Christmas**, **2019 Quartet Part 2**, **2019 Mozart Notturni**, **2013 Vivaldi demo** and **2013 Elgar** releases are in Bandcamp but do not have a distinct matching WooCommerce product among the 23 pairs.

## Safety decisions
- Do not delete or merge Polylang posts. Preserve all 46 source records and both languages.
- Preserve all 46 established product permalinks and add direct Bandcamp purchase buttons on those pages. Even with HTTP verification now complete, **do not apply 301 redirects**: these pages have bilingual SEO and a functioning existing add-to-cart interface. Migrations and redirect policy require separate approval.
- Do not silently correct old Bandcamp slugs; some contain misspellings and remain the official working destinations.
- Do not treat 12 releases as 12 tracks or treat 53 track listings as 53 **distinct compositions**.
- No actual Bandcamp artist-product write access is available through this task; storefront profile corrections need an authenticated admin action.

## Public sources
- https://432orchestra.bandcamp.com/music
- https://432orchestra.bandcamp.com/album/432-hz-quartet-music
- https://432orchestra.bandcamp.com/album/432-hz-quartet-music-part-2
- https://432orchestra.bandcamp.com/album/have-yourself-a-432-hz-christmas-live-concert
- https://432orchestra.bandcamp.com/album/wolfgang-amadeus-mozart-six-notturni-canzonetti

## 2026-11-05 verification limits
- All **12 Bandcamp release-level URLs** returned HTTP 200 and exposed a Buy Digital Track/Album button.
- All **23 mapped Bandcamp destinations** returned HTTP 200 with a visible digital purchase control and streaming/download text (21 tracks, two albums).
- All **46 bilingual WooCommerce product pages** returned HTTP 200, with matching product IDs, titles, amounts, and WooCommerce buy-button markup.
- The configured WordPress checkout page and gateway availability were inspected *read-only*. An empty cart redirects to `/en/cart/`; a completed checkout transaction has not been tested.
- Actual visual QA on a mobile viewport, purchase completion, and semantic/audio identity checks remain separate gates.
- Polylang's actual Bulgarian shop permalink is `/bg/магазин/` (page ID 997), and its canonical points to itself. `/bg/shop/` is a noncanonical alternative route pointing to the English shop; **do not call this a defect in the actual Bulgarian shop**.
- The Bulgarian cart is `/bg/кошница/` (page ID 965). No Bulgarian checkout Polylang translation was found for the configured checkout page (English page ID 108); a full localized purchase-flow test remains pending.
