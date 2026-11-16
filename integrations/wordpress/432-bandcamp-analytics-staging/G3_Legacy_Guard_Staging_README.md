# G3 — PHP 7.4 legacy emitter suppression candidate (staging only)

**DO NOT DEPLOY OR ACTIVATE.** This is one component of an unapproved consent-safe analytics redesign, not the solution by itself.

The existing classic Cookie Notice 2.4.1 interface is active on blog ID 1. Direct WordPress source/runtime check says `Cookie_Notice()->get_status() === ''`, `app_blocking = true`, with no Cookie Compliance App ID/key. **The Cookie Notice automated blocking code lives in `add_cookie_compliance()` and is registered only when status is `active`.** In the current classic banner branch `add_cookie_notice()` and `cnArgs` run instead. This means the true `app_blocking` option alone **does not activate that automatic blocker**.

Read-only public EN page HTML confirms `gtag/js?id=UA-43283273-2` appears as an ordinary executable async script, followed by its inline `__gtagTracker('config', 'UA-...')` and ExactMetrics outbound script **before** the asynchronous Cookie Notice `front.min.js`. The modern Hu Banner script is absent. This is a source-and-HTML **preconsent loading risk**. A real fresh-browser HAR is still needed before declaring precisely which requests were transmitted or cookies written.

Installed plugin callback identities (read-only source):
- ExactMetrics 7.12.1: `wp_head:exactmetrics_tracking_script@6`; `template_redirect:exactmetrics_events_tracking@9` dynamically builds the `exactmetrics-frontend-script` event listener.
- Google Analyticator 6.5.4: `wp_head:add_google_analytics@99`; `wp_print_scripts:ga_external_tracking_js@99999` enqueues `ga-external-tracking`.
- Cookie Notice 2.4.1 is network-activated. **Never deactivate it or either Analytics plugin network-wide** on the strength of this report.

`orch432-g3-legacy-guard.preview.php` is a deliberately **opt-in-only** proposed PHP 7.4 hook file. It returns immediately unless `ORCH432_G3_STAGING_LEGACY_GUARD_ENABLED === true`. In that case it removes only the four **known** legacy hooks for **blog ID 1**, `home_url` host `432hz-orchestra.com`, and non-admin requests; it also dequeues the two known outbound JS handles. It makes **no database/option writes**. It does **not** manage consent, GA4 configuration, browsers, cookies, notifications, or networks.

**Required staged rollout before owner GO**:
1. Complete EN/BG CMP Accept, Reject, Change decision and privacy text, opt-in server-side tag gating, cookies and withdrawal lifecycle.
2. Validate actual WordPress hook registration/read-only process memory before and after calling the candidate — do **not** assume missing hooks are handled.
3. Establish verified native GA4 tag Destinations and ensure exactly one post-consent tag, with NO Google tags under denied/unknown state (Google Basic Consent Mode). Avoid double counted page_views and outbound clicks.
4. Run anonymous browser network/cookie tests for fresh, Reject, Accept, Revoke; check product click links independent of consent, page2 Woo and 46/23 destination maps; retain rollback.
5. Separate **explicit** approval for exact plugin code and site scope; never merge Draft PR #8 to production automatically.

Google Basic Mode (tags fully blocked before consent): https://support.google.com/analytics/answer/14009635?hl=en

**This preview is not a complete GDPR compliance claim, does not constitute operational permission, and is not live.**
