# G3 — Existing GA4 Bandcamp-host event: de-duplication gate (15 Nov 2026)

**READ-ONLY evidence from the connected 432 Chamber Orchestra GA4 property `397059277`, stream `G-YMLKYY9HGT`.**

For the 21-day interval 25 October through 14 November 2026, GA4 reports:
- event name **`432orchestra.bandcamp.com`**, count **1**;
- event-bearing page **`/bg/product/432-chamber-orchestra-w-mozart-divertimento-d-dur-kv-136-yanakiev-recording-rehearsal-2/`**;
- measurement ID **`G-YMLKYY9HGT`**.

Interpretation is **uncertain**: the hostname-shaped event is consistent with an existing legacy outbound-link tracker, but neither the sender (Google Analyticator, ExactMetrics or another script), its consent conditions, nor whether the action was a real browser click has been demonstrated. The event is **not** a Bandcamp purchase.

**New hard blocks before G3 rollout:**
1. `legacyBandcampEventMapped` — identify the existing event's emitting script / Google tag destination and track it without collecting personal data.
2. `legacyAndNewOutboundDeduped` — demonstrate one outbound click produces at most one marketing event under the agreed naming convention; disable or replace legacy emission only after site-wide review and consent QA.

The `consent-preflight.mjs` evaluator now checks both conditions. `evidence-current.json` stores them as null (untested). Node built-in tests: **12 PASS / 0 FAIL**, and current evidence produces **NO_GO with 20 unmet or untested conditions**. A NO_GO count represents a control checklist, not a count of proved privacy violations.

**Never activate or install** the new tracker merely to obtain its event, since GA4 already contains a potential legacy counterpart. No live WordPress changes, consent UI changes or advertising spend are authorized.

See the canonical Notion G3 page for follow-up and full visitor-network audit.


## Source-level attribution completed, transport-level attribution still open (15 November 2026)

Read-only inspection of the actual installed and publicly loaded plugin code confirms **two legacy outbound-click handlers**.

1. **Google Analyticator 6.5.4** — anonymous Bulgarian Mozart product page loads `external-tracking.min.js?ver=6.5.4`. WordPress `ga_status=enabled`, `ga_outbound=enabled`, `ga_event=enabled`, `ga_analytic_snippet=disabled`. The 1,190-byte minified JS registers `jQuery("a").click` and on an HTTP(S) link outside `document.domain` calls `ga("send","event","Outbound Traffic",<URL-hostname>,<full URL>)`. This **statically explains the exact string** `432orchestra.bandcamp.com` found as a GA4 event name, but does not prove the Google tag bridge routing or actual network delivery.
2. **ExactMetrics 7.12.1** — same public page loads `frontend-gtag.js?ver=7.12.1`. Actual HTML local configuration shows `ua` set and **`v4_id` blank**. Its source can turn `outbound-link` into a GA4 `click` when a `v4_id` exists; it is **not** directly configured with a GA4 v4 ID on this page. A second outbound handler exists, but not proof of a duplicate GA4 request.

**Decision:** source tracing is verified, but `legacyBandcampEventMapped` and `legacyAndNewOutboundDeduped` stay **null**, until native Google tag Destinations and a visitor-network Accept/Reject/Revoke/one-click capture are checked. Do not auto-disable network-activated plugins or introduce a third outbound listener. `evidence-current.json` records evidence and uncertainty separately. **No production mutation, browser launch or paid service.**

The expanded preflight test suite requires static proof to **still return NO_GO** without real network/dedup proof.
