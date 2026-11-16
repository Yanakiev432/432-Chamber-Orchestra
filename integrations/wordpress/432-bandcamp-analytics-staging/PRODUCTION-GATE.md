# G3 Production readiness and consent audit — staging (15 Nov 2026)

**Not a deployment script.** The module evaluates supplied evidence. It does not make requests, store cookies, access GA4, log into WordPress or change any production configuration. It returns `NO_GO` until all actual acceptance checks have been independently completed and explicit approval is recorded. A `READY_FOR_MANUAL_GO_REVIEW` response is not deployment authorization.

## Observed evidence versus unknowns

| Area | Grounded fact | State |
| --- | --- | --- |
| GA4 | Property `397059277`, stream `5843252803`, measurement `G-YMLKYY9HGT` seen via connected GA4 reporting | IDENTITY VERIFIED |
| Google tag deployment | Public HTML exposed `UA-43283273-2` through ExactMetrics and Analyticator; GA4 may be a tag destination of the legacy tag | DESTINATION UNVERIFIED |
| WordPress | Network-activated ExactMetrics, Google Analyticator, Cookie Notice | MULTISITE REGRESSION REQUIRED |
| Cookie Notice | Site blog1 `app_blocking=1` but `refuse_opt` blank; no clear Reject in sampled banner | CONSENT CONTROL HOLD |
| Network events/cookies | No authorized logged-out browser with reliable DevTools HAR used in this audit | UNKNOWN |
| Bandcamp outbound staging | `outbound-tracker.mjs`, 10/10 prior Node unit tests | STAGING ONLY |
| Spend/deploy | No user authorization to edit production or spend | HOLD |

## Checklist before production

1. **Native tag verification (read-only):** Google Analytics Admin → Data streams → `G-YMLKYY9HGT` → Google tag → Destinations. Confirm why the legacy `UA-43283273-2` tag currently produces GA4 events. No second tag until topology is proven. Screenshot or sanitized note of tag destinations.
2. **Multisite inventory and rollback (read-only):** enumerate all sites affected by network-activated ExactMetrics, Google Analyticator and Cookie Notice. Record versions/configuration and affected pages. Never network-deactivate any plugin without site-by-site QA and owner GO.
3. **Actual visitor test (not logged-in admin):** use a browser not implicated in the Windows Chromium authentication regression. Do **not** create a fresh Chromium profile on Yanakiev-Lenovo under the existing lockout hold. Capture request destinations and cookies, without recording tokens or personal data.
4. **Initial page load with no consent:** zero Analytics / Google tag network requests and zero `_ga` / `_gid` cookies (Basic Consent Mode). Do not confuse a script HTML tag being present with a request actually being sent.
5. **Reject:** clear Reject all button; no Google Analytics request and no analytics cookie. Refresh and navigate EN ↔ BG; denied state persists. Banner must not assume continuing browsing = consent.
6. **Accept:** exactly one ordinary GA4 `page_view` per regular page load to the intended `G-YMLKYY9HGT` stream, no double pageview from legacy Google Analyticator or duplicate Google tag; outbound CTA emits one `bandcamp_outbound_click` event with only approved fields.
7. **Withdraw:** a user-visible manage/change consent control. Future Analytics requests stop, non-essential cookies removed, deny test passes on subsequent navigations.
8. **Affected sites:** repeat on each distinct multisite site and translation context, not just the EN homepage.
9. **Release regression:** all 12 official release links, 23 unique WordPress mappings, local cart/checkout redirect semantics and unaffected site functions must pass.
10. **Approval:** explicit owner decision for an exact set of changes, target pages and rollback. No broad implicit GO from a generic plan continuation.

## Automated guard

`consent-preflight.mjs` is a pure, fail-closed validator for manually reviewed evidence. Use `node --test consent-preflight.test.mjs`. It has no deployment or side effect capability.

Its default result against the present incomplete evidence is `NO_GO`. Never forge booleans to obtain a GO response: each true value must be backed by a visitor test or native admin proof. No tests or consent changes should be silently attributed to the owner.

## Authoritative references
- Google [Basic versus advanced consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode) — Basic prevents all Google tag network traffic prior to consent; advanced permits cookieless pings
- Google [Set up Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent) — includes `ad_user_data` and `ad_personalization`; legacy `analytics.js` should be migrated
- Google [Google tag management / destinations](https://support.google.com/analytics/answer/12329709?hl=en)
- Cookie Notice [Refuse button](https://hu-manityco.helpscoutdocs.com/article/106-refuse-button) — unconnected sites can enable a refuse button without adding a separate paid CMP; connected sites have a different banner
- Cookie Notice [product and WordPress deployment](https://cookie-compliance.co/cookie-notice/) — test as an anonymous visitor and note multisite settings

**No new paid API, no paid CMP requirement assumed.** Evaluate the installed mode and existing free plugin capabilities first. All changes remain draft.
