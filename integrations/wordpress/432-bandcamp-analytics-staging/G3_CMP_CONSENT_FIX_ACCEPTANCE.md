# G3 — 432 Chamber Orchestra consent-first remediation gate (staging only)

**NO production edits, no network plugin toggles, no installation of analytics or consent scripts.** This is acceptance criteria, **not** evidence that the requirements have been met.

## Verified read-only state — 15 November 2026

The WordPress site blog ID 1 uses multisite and the following *network-activated* plugins: Cookie Notice **2.4.1**, Google Analyticator **6.5.4**, ExactMetrics **7.12.1**. Cookie Notice has **per-site and network `global_override=false`**; source indicates the UI can be considered for site-local changes, subject to approval and tests. (This does not mean a local configuration automatically prevents tracking.)

Public anonymous HTTP 200 checks on `/en/`, `/bg/`, and one EN product page found the Cookie Notice banner with **only the `Ok` / `cn-accept-cookie` action**. Its text is in English on both language routes. Read-only WordPress settings: `refuse_opt=false`, `app_blocking=true`, `on_click=false`, `on_scroll=false`; runtime `cnArgs.refuse="0"` and `cnArgs.revokeCookies="0"`. **There is no Reject or Revoke control in these sampled banners**. Other privacy-page mechanisms were not exhaustively examined.

The same public pages include Google `gtag/js?id=UA-43283273-2`, ExactMetrics `frontend-gtag.js?ver=7.12.1`, Cookie Notice `front.min.js?ver=2.4.1`, and Analyticator `external-tracking.min.js?ver=6.5.4`. This **does not prove Google analytics requests are sent before consent** — only that scripts appear in rendered HTML. Whether `app_blocking` prevents effective tracking **remains unproven**.

Connected GA4 verified IDs: property **397059277**, stream **5843252803**, measurement **G-YMLKYY9HGT**, hostname `432hz-orchestra.com`. From 7–15 Nov 2026: **26 sessions** and **30 page_view** events. Channel sessions: direct 22, ChatGPT 2, DuckDuckGo 1, my-back-office.net 1. Exactly **one host-named `432orchestra.bandcamp.com` event** was reported on **5 November 2026** on the Bulgarian Mozart rehearsal product URL. This is **not a verified sale or attribution**. No `purchase` event in the retrieved Nov 1–15 event dataset, but Bandcamp orders occur off-site.

## Acceptance conditions, in order

1. Confirm each language route's privacy and tracking disclosure, and **explicitly approve** the exact changes to site-local Cookie Notice options and any script-gating code. Do not infer authorisation from this draft.
2. Present accessible, equally available **Accept all / Reject non-essential / Change consent** choices, **on both EN and BG**. Reject and revoke must be real actions, not decorative buttons.
3. Immediately after first load without consent, prove by **fresh anonymous browser network HAR + cookie/storage inspector** that no non-essential GA/Google request or cookie is emitted. Do not mark this true from source HTML alone.
4. After Reject, continue ordinary site navigation; verify **zero non-essential analytics requests/cookies**. An external Bandcamp link should still navigate normally and not send a tracking event.
5. After Accept, prove one GA4 pageview, and for exactly one Bandcamp CTA click, prove one sanitized link event and no dual legacy GA4 event. Confirm the actual Google tag **Destinations** mapping to GA4 first.
6. After consent revocation, prove subsequent Google traffic stops, non-essential analytics cookies are cleared or otherwise handled according to the accepted policy, and visitor can freely change the choice again.
7. Regression-check both language homepages, Woo archive pages 1/2, representative Woo product, site consent UI; preserve all **46 WP language product maps → 23 HTTPS200 Bandcamp destinations**, all eight homepage Bandcamp embeds and Woo checkout redirects.
8. Confirm changes are isolated to the approved WordPress site. Network-activated Analyticator/ExactMetrics/Cookie Notice must **not be disabled network-wide** as a shortcut; verify exact plugin hooks and staged rollback. Restore the previously saved WordPress option values or staged plugin code if any outcome fails.
9. Only after a **separate explicit production GO**, carry out the exact approved mutation and repeat tests. Draft PR #8 remains NO-GO and unmerged; PR #9 SEO and PR #10 homepage copy are independent.

## Regulatory reference (not legal certification)

- [EDPB Cookie Banner Taskforce report](https://www.edpb.europa.eu/documents/task-force-report/report-of-the-work-undertaken-by-the-cookie-banner-taskforce_en) — consent and refusal must be genuine choices; consent cannot come from inaction.
- [European Commission — consent and withdrawal](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data_en) — freely given, informed opt-in and withdraw as easily as giving consent.
- [Dutch DPA clear cookie banners](https://autoriteitpersoonsgegevens.nl/en/node/4094/clear-and-misleading-cookie-banners) — Accept and Reject options equally accessible.

## Machine evidence

On owner's Lenovo:
- `C:\Users\User\Documents\432 Chamber Orchestra\Marketing\Bandcamp\G3_CMP_GA4_Static_ReadOnly_Audit_20261115.json` SHA256 `c1473912f8b6a3fcf8b82e85ecffe6acd82b815760e1cd2fcd1cb4f9664acff3`
- `G3-node-validation/evidence-current.json` (current fail-closed G3 preflight)
- `G3-node-validation/consent-preflight.test.mjs` (**15/15 Node 22.23.2 tests PASS**, evidence remains **NO_GO**).

**Do not start Windows Chromium during the account-lockout HOLD**. An isolated anonymous browser, if reliably available, must never attach to the Windows owner profile and must capture network data before anyone may claim network proof.

**Current result: G3 STATIC CONSENT UI FAIL / NETWORK UNKNOWN / NO DEPLOY / €0.**
