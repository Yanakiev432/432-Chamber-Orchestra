# G3 — Bandcamp outbound tracking (STAGING ONLY)

**Do not install, inject, enqueue or deploy this prototype.** No production change and no ads are authorized. This document and the testable library are preparatory artifacts under the existing Digital Revenue OS G3 task.

## Live audit (14 November 2026)

- 432hz-orchestra.com/en and /en/shop HTML only exposed **UA-43283273-2** Google Universal Analytics identifiers, including two legacy mechanisms (ExactMetrics v7.12.1 Google tag loading the UA id, plus Google Analyticator's analytics.js). No GA4 **G-** measurement ID was found in the sampled HTML.
- A connected GA4 property 397059277 has reported sessions, but the currently sampled site's GA4 data path is **unverified**. Do not assume GA4 stream identity from the numeric property ID; obtain the actual web-stream measurement ID via authorized native GA4 access.
- Cookie Notice v2.4.1 banner includes 'If you continue to use this site we will assume that you are happy with it', a simple OK/close surface and no clear Reject observed in this anonymous HTML. This is a **compliance risk needing behavior/network review**, not a final legal determination.
- Google Universal Analytics stopped standard data processing July 2023. Current UA tags are not a sound event destination.

## Required sequence and acceptance tests before any production implementation

1. Read-only native GA4 Data Streams: verify stream URL / measurement ID, actual live Realtime / DebugView and installed tag ownership. Do **not** invent a G- ID or run a separate new GA4 property without review.
2. Inventory all analytics and third-party requests (ExactMetrics, Analyticator, other plugins, ad embeds) before and after consent. Remove or disable legacy duplicate tracking *only under explicit production approval* and with tested rollback.
3. Consent management solution: user can Accept, Reject, Change preference/withdraw; non-essential tag loading is gated until explicit choice. Assess Google Consent Mode v2 **basic**, not advanced cookieless pings, for initial minimum-data rollout. Complete legal/privacy review and confirm any third-party advertising scripts.
4. Confirm exactly **one** valid GA4 web stream, configured under accepted analytics consent. Existing GA4 tag must be verified with native Tag Assistant or DebugView, no duplicate page_view.
5. Connect this standalone, **inert** JS event tracker to a real CMP adapter and GA4 sender **only after** explicit approval: `installBandcampOutboundTracking({ document, isAnalyticsConsentGranted, isGa4Ready, sendEvent, allowedCampaigns })`. The adapter must check current consent and verified GA4 web stream configuration; do not infer consent from cookies or mere presence of `gtag`.
6. Click instrumentation: only HTTPS anchors with exact hostname `432orchestra.bandcamp.com`, optional numeric WP product ID, source placement, optional preapproved short campaign ID. No raw URL, referrer, buyer ID, email, query string or content, no storage or outbound request by this library. Standard Bandcamp checkout and external link behavior unchanged. If GA4 enhanced measurement auto-outbound click is enabled, keep `bandcamp_outbound_click` and generic `click` reports distinct; avoid double-counting.
7. Negative tests: decline, initial no choice, revoke, invalid stream, disallowed domain, malformed campaign, duplicate module setup, broken adapter. Acceptance: zero analytics requests prior to consent under basic mode; exactly one Bandcamp custom event per user activation after consent; zero PII; no additional paid tracking or Meta pixel.
8. Report outbound clicks explicitly as **interest**, never Bandcamp purchase. Paid CAC/ROAS and incremental revenue remain **N/A** unless official sales attribution supports them.

## Run the isolated tests

`node --test integrations/wordpress/432-bandcamp-analytics-staging/outbound-tracker.test.mjs`

## References

- https://developers.google.com/tag-platform/security/guides/consent
- https://developers.google.com/tag-platform/security/concepts/consent-mode
- https://support.google.com/analytics/answer/10089681?hl=en
- https://www.edpb.europa.eu/system/files/documents/2021-06/edpb_aar_2020_final_27.05.21.pdf

**Blocking gate**: legal/privacy validation and explicit user authorization are required before attaching this code to production or installing new third-party tags.

## Live evidence update — 2026-11-14 (G3 audit)

- Windsor.ai GA4 reporting verified the **existing** property 397059277 web stream ID **5843252803** and measurement ID **G-YMLKYY9HGT**, with hostname 432hz-orchestra.com. The measurement ID is confirmed by reporting metadata; do not create a second stream.
- WordPress public HTML showed only **UA-43283273-2**; site-local ExactMetrics profile options also contain only UA-43283273-2. The UA ID can potentially be connected to a GA4 destination at the **Google tag account** level, which this audit cannot read. Verify native Google tag destinations before changing tracking.
- Network-wide active plugins: `google-analyticator/google-analyticator.php`, `google-analytics-dashboard-for-wp/gadwp.php`, `cookie-notice/cookie-notice.php`. This is a **multisite**: avoid deactivating a network-wide plugin without a full network blast-radius review.
- Cookie Notice options (blog 1): `app_blocking=1`, `refuse_opt` empty, `accept_text=Ok`, `refuse_text=No`, `on_click` and `on_scroll` empty. Anonymous banner showed only OK and close; presence of script tags does **not** by itself prove network requests fired before consent because app blocking can intervene. Perform real network QA in an authorized browser before a compliance finding.
- Current live WooCommerce links do **not** contain `data-c432-product-id`; shop cards contain e.g. `li.product.post-919`, and the single-product page has `div#product-769.product.post-769`. Staging tracker now derives an **optional numeric product ID** from the nearest WooCommerce product wrapper, only after analytics consent and stream readiness; shop-wide CTA sends placement only.
- Test validation must be recorded from the actual Node runner with explicit pass count; do not call declared tests “executed” unless the command exits 0. All modifications are isolated to **draft PR #8**, with no production deployment.
