# G3 Consent-first GA4 staging — 16 November 2026

STATUS: SOURCE AND TESTS PASS; PRODUCTION NO-GO. No live WordPress file, plugin, cookie settings or database modifications.

## Observed problem

432hz-orchestra.com currently runs Cookie Notice 2.4.1 in classic mode, with only an Ok button and no Reject or Revoke. The configured app_blocking=true is not operational automatic Cookie Compliance blocking in classic mode. The public page source includes an executable Google UA script ahead of the cookie notice JavaScript. Actual Google network requests before consent have not been captured; they remain UNKNOWN.

## Staged, disabled-by-default components

1. orch432-g3-legacy-guard.preview.php: if explicitly enabled, scopes to the public blog ID 1 and host 432hz-orchestra.com and removes four known ExactMetrics/Analyticator emitter hooks. No network-wide plugin deactivation.
2. orch432-g3-consent-bridge.preview.php: a separately flagged site-local bridge, running after the guard, confirms no known legacy hook remains, then prepares EN/BG Accept/Reject/Change Cookie Notice options only in request memory. It registers the same-origin ES module entry.
3. consent-first-entry.preview.mjs: does not start analytics unless an explicit matching server approval config exists. consent-first-ga4.mjs is inert on import, rejects preexisting Google tags/gtag/ga/dataLayer and wrong sites, and never treats the old Accept-only cookie as sufficient.
4. outbound-tracker.mjs: existing sanitized Bandcamp event module, disabled unless a separate native enhanced-measurement and dedup gate passes.

The two PHP flags remain FALSE in the repository; nothing has been installed on WordPress. The final on-disk plugin layout must serve the three related JS module files from one valid same-origin directory. The source-only PHP eval test cannot validate actual WordPress asset URL resolution, CSP or caching.

## Consent design

No Google tag is injected before explicit Accept. A fresh versioned __Host-orch432-ga4-v1 marker AND the classic cookie_notice_accepted=true are required. The client queues Consent Mode v2 denied defaults followed by granted analytics only after valid explicit consent, while all ad types stay denied. GA4 ID is G-YMLKYY9HGT. Config disables automatic pageviews; one manual page_view is queued after tag load.

Reject stops custom sends, clears the versioned marker and known first-party analytics cookies, then reloads if a tag had loaded. Reload cannot truly unload a Google tag without leaving the page; network and cookie cleanup after revocation require browser confirmation. The click tracker is OFF by default because native GA4 enhanced measurement can also emit outbound click events.

Installed Cookie Notice front.js sets status REJECT upon clicking the close X despite the misleading data-cookie-set=accept attribute in HTML. Avoid a speculative X patch. Revoke reopens choices and the user then selects Reject. Validate this interaction with browser accessibility and network tests.

## Evidence

Lenovo Windows, Node 22.23.2 aggregate: 54 PASS / 0 FAIL across consent-first-ga4.test.mjs (25), consent-preflight.test.mjs (19), and outbound-tracker.test.mjs (10).

Read-only Everest WordPress PHP7.4.34 eval: for BOTH EN and BG, the four legacy hooks were removed in disposable process memory, 3/3 choices rendered, zero DOM warnings, module enqueued and approved config registered before it. No DB or file writes. This is not a deployed browser integration test.

Machine receipt: G3_ConsentFirst_GA4_Bridge_Staging_20261116.json in C:\Users\User\Documents\432 Chamber Orchestra\Marketing\Bandcamp. GitHub Draft PR #8, unmerged.

## Remaining before any explicit production GO

- Approve exact per-site EN/BG privacy and Cookie Notice copy, accessibility and withdrawal behavior.
- Verify all injected Google tags, native GA4 Destinations, enhanced outbound events and old UA migration path.
- Capture isolated anonymous browser HAR plus cookies on first load, Reject, Accept, Revoke, reload and one Bandcamp CTA; no Google data on denial and no duplicate link events.
- Verify assets resolve correctly when actually installed, WordPress caching and other multisite tenants.
- Confirm 46 bilingual Woo product links to 23 Bandcamp destinations, 8 homepage audio embeds, 12 Bandcamp release pages and checkout redirects.
- Save rollback snapshot and require separate explicit owner GO. Never use Windows Chromium during the account-lockout HOLD.

Official references: https://developers.google.com/tag-platform/security/concepts/consent-mode and https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic

No publishing, advertising, fan messages, paid services or production changes.
