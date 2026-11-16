/**
 * G3 STAGING-ONLY WordPress module entry. No initialization without an
 * explicit server-injected approved config emitted by a site-scoped WP bridge.
 * NOT present on production WordPress. No live consent assertions are made.
 */
import { installConsentFirstGA4 } from "./consent-first-ga4.browser.js";

const approval = typeof window !== "undefined" ? window.__ORCH432_G3_APPROVED__ : undefined;
if (approval &&
    approval.revision === "G3-BASIC-20261116" &&
    approval.enabled === true &&
    approval.uiChoicesVerified === true &&
    approval.legacyHooksRemoved === true &&
    approval.measurementId === "G-YMLKYY9HGT") {
  installConsentFirstGA4({
    document,
    window,
    consentUiApproved: true,
    legacyEmittersSuppressed: true,
    // Native enhanced-measurement Bandcamp click behavior not verified.
    captureBandcampOutbound: false,
    nativeOutboundSettingsVerified: false,
  });
}
