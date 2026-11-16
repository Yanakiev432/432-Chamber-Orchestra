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

Lenovo Windows, Node 22.23.2 aggregate: 67 PASS / 0 FAIL across consent-first-ga4.test.mjs (30), consent-preflight.test.mjs (19), outbound-tracker.test.mjs (10) and G3_Browser_JS_Asset_Parity_20261116.test.mjs (8).

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


## Follow-up 16 Nov: consent withdrawal across multiple tabs

The first staging module handled rejection only in the current tab. A second already-open tab could retain a loaded Google tag even after the shared consent cookie was revoked elsewhere. This is a genuine **cross-tab lifecycle gap**.

`consent-first-ga4.mjs` now uses `BroadcastChannel("orch432-ga4-consent-v1")`, when supported, to send **only** the literal `reject` to same-origin tabs (never granting consent remotely). Recipient tabs stop the client sender, clear versioned and known first-party analytics cookies, and reload if the tag was initialized. Receivers do **not** rebroadcast, preventing message loops. On `visibilitychange` or `pageshow` a fallback compares the live consent cookies with the in-tab state and fails closed if the consent was revoked. The channel is disposed with the module; it creates no identifying token.

The cookie-cleanup allowlist now also recognizes legacy first-party Google `_gcl_*` cookies such as `_gcl_au` and `_gcl_aw`, in addition to `_ga*`, `_gid`, `_gat*`, `_gac_*`. The test confirms unrelated session cookies survive. This is still only best-effort first-party cookie deletion; third-party cookies, partitioned storage and inflight network requests are **not proved cleared**.

On Lenovo Node 22.23.2: **59 PASS / 0 FAIL** across 30 new GA4 tests + 19 consent preflight + 10 outbound tests. Five new cases cover two-tab reject, no rebroadcast, resumes, invalid messages, and legacy cookie cleanup. The actual WordPress PHP bridge remains unchanged.

An isolated Linux Chromium exists, but its environment blocks navigation even to local loopback fixtures with `ERR_BLOCKED_BY_ADMINISTRATOR`; WSL guest on Lenovo is still `universal_https_live_ready=false`. **No real-browser HAR or cross-tab browser proof was obtained.** Windows Chromium remains on account-lockout HOLD.

Machine receipt `G3_CrossTab_Consent_Withdrawal_Audit_20261116.json` SHA256 `e811f1e7a56aafcec7b1b075c0d662035acfe8f4a9d584aeaefab7711bf84024`. Staging changes only. Production **NO-GO**, owner GO required.


## 16 November: public Google tag child reference, exact request host, and browser JS MIME

**Public Google tag routing evidence (read-only):** An HTTPS 200 `gtag/js?id=UA-43283273-2` response returned JavaScript containing a literal `__zone.vtp_childContainers` reference with `publicId="G-YMLKYY9HGT"`, `vtp_inheritParentConfig=true` and `vtp_enableConfiguration=false`. This materially strengthens the evidence that legacy UA and target GA4 identifiers are related, but **does NOT verify Google Analytics Admin Tag Destinations, an actual GA4 hit or the absence of duplicate hits**. A separate HTTPS 200 fetch of `gtag/js?id=G-YMLKYY9HGT` returned GA4 script without the old UA identifier. The JS is dynamically served; SHA is one observation only. See `G3_GoogleTag_ParentChild_PublicConfig_20261116.json` (SHA256 `65e44845a0b27bec3f38808009a2c0c3a6049990cacdec667e45c8533488635f`).

**Real incoming Host is now scoped:** `orch432-g3-legacy-guard.preview.php` previously checked WordPress `home_url()` but not `$_SERVER['HTTP_HOST']`. Read-only PHP7.4 WP bootstrapping showed an `other.example` request Host could pass the guard because the canonical WP home URL stayed `432hz-orchestra.com`. Source now requires BOTH canonical home URL and actual HTTP_HOST to be exactly `432hz-orchestra.com`; 5/5 real WP read-only host cases PASS, and 4/4 original plugin tracking hooks are still correctly removed in process memory. See `G3_WordPress_ActualHost_Guard_Preflight_20261116.json` SHA256 `91060d172a3c542f493e9399b214d18b46a5ade9330f677db2337824d7b63d14`.

**Browser module package now uses `.js` (not unverified `.mjs` MIME):** The three browser-loaded copies `outbound-tracker.browser.js`, `consent-first-ga4.browser.js`, `consent-first-entry.preview.js` are byte-identical to audited `.mjs` sources apart from the two relative import extensions. The PHP bridge now enqueues `consent-first-entry.preview.js` as `type="module"`. Existing public Cookie Notice `.js` on the same site returned `text/javascript`; the **future installed asset** still needs its actual HTTP MIME/cache/CSP verified. A PHP eval preview of the bridge produced a synthetic `wp-content/plugins/consent-first-entry.preview.js` URL; **it does not prove a file exists at that URL**. New `G3_Browser_JS_Asset_Parity_20261116.test.mjs` checks byte parity, ESM imports, inert entry, scope flags and Host guard. **67/67 combined Node22 tests PASS** (30 GA4, 19 preflight, 10 outbound and 8 parity/host checks). Real WP PHP7.4 EN/BG in-memory test again PASSED with both three-choice banners, module registered, zero DOM warnings and zero WordPress writes. See `G3_Browser_JS_Module_Parity_And_Host_QA_20261116.json` SHA256 `ad7755a30ea5db90a86eba01314b4567d07d81d0c1a3e608d6acd2dc89eade9e`.

**Unchanged production gate:** PR #8 is still DRAFT/NO-GO. A safe browser network HAR, installed plugin path and MIME validation, Google Tag Admin Destinations, consent lifecycle and one outbound click real delivery, rollback and explicit owner GO remain required. No owner Windows Chromium is launched during lockout HOLD. No live edits.
