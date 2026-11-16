/**
 * 432 Chamber Orchestra — ONE consent-first GA4 sender, STAGING ONLY.
 * Nothing runs on import; there is no automatic initialization or WP deployment.
 * This integrates with Cookie Notice 2.4.1's documented setCookieNotice event.
 * It MUST NOT be deployed without a fully reviewed and tested EN/BG consent UI,
 * a working site-scoped guard of the legacy Google emitters, and explicit owner GO.
 */
import { installBandcampOutboundTracking } from "./outbound-tracker.mjs";

export const GA4_MEASUREMENT_ID = "G-YMLKYY9HGT";
export const CONSENT_MARKER = "__Host-orch432-ga4-v1";
const SITE_HOST = "432hz-orchestra.com";
const NOTICE_COOKIE = "cookie_notice_accepted";

export function readCookie(doc, name) {
  const items = String(doc?.cookie ?? "").split(";");
  for (const raw of items) {
    const n = raw.trim();
    if (n.startsWith(name + "=")) return n.slice(name.length + 1);
  }
  return null;
}

function setMarker(doc) {
  doc.cookie = CONSENT_MARKER + "=granted; Path=/; Max-Age=2592000; SameSite=Lax; Secure";
}

function clearMarker(doc) {
  doc.cookie = CONSENT_MARKER + "=; Path=/; Max-Age=0; SameSite=Lax; Secure";
}

/**
 * Limit cleanup to known first-party analytics cookie names and both common
 * domain variations; no deletion of cookie_notice_accepted or session cookies.
 * Actual third-party and partitioned cookie cleanup requires browser QA.
 */
export function clearFirstPartyAnalyticsCookies(doc, hostname) {
  const host = String(hostname || "").toLowerCase();
  const names = String(doc.cookie || "")
    .split(";")
    .map((item) => item.trim().split("=")[0])
    .filter((name) => /^(_ga(?:_[A-Za-z0-9]+)?|_gid|_gat(?:_[A-Za-z0-9]+)?|_gac_[A-Za-z0-9]+|_gcl_[A-Za-z0-9]+)$/.test(name));
  for (const name of [...new Set(names)]) {
    const suffixes = ["", "; Domain=" + host];
    if (host === SITE_HOST) suffixes.push("; Domain=." + SITE_HOST);
    for (const domain of suffixes) {
      doc.cookie = name + "=; Path=/; Max-Age=0; SameSite=Lax; Secure" + domain;
    }
  }
}

/**
 * Existing legacy cookie acceptance is NOT enough: it was collected with an
 * Accept-only banner. Require a versioned new marker created *after* the
 * approved, equal-choice banner emits an explicit Accept event.
 */
export function hasVersionedAnalyticsConsent(doc) {
  return readCookie(doc, NOTICE_COOKIE) === "true" &&
    readCookie(doc, CONSENT_MARKER) === "granted";
}

const consentDefaults = Object.freeze({
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
});

const consentAfterAccept = Object.freeze({
  analytics_storage: "granted",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
});

/**
 * Feature gating is deliberately stronger than ordinary runtime config:
 * - consentUiApproved: only a reviewed visible equal-choice EN/BG UI
 * - legacyEmittersSuppressed: required PHP guard and no extra GA injection
 * - nativeOutboundSettingsVerified: needed before emitting extra link event
 * The module does not claim these facts by itself.
 */
export function installConsentFirstGA4({
  document: doc,
  window: win,
  consentUiApproved = false,
  legacyEmittersSuppressed = false,
  captureBandcampOutbound = false,
  nativeOutboundSettingsVerified = false,
  allowedCampaigns = [],
  onDiagnostic = () => {},
} = {}) {
  if (!doc || !win || typeof doc.addEventListener !== "function" ||
      typeof doc.createElement !== "function" ||
      !doc.head || typeof doc.head.appendChild !== "function") {
    throw new TypeError("Explicit document and window-like object required");
  }

  const state = {
    initialized: false,
    ready: false,
    disabled: true,
    pageviewSent: false,
    script: null,
    cleanupOutbound: null,
    disposed: false,
    channel: null,
  };

  const host = String(win.location?.hostname ?? "").toLowerCase();
  const hasApproval = consentUiApproved === true && legacyEmittersSuppressed === true;
  const scopeOk = host === SITE_HOST && win.location?.protocol === "https:";
  const allowed = scopeOk && hasApproval;
  const diagnostic = (message) => {
    try { onDiagnostic(message); } catch (_error) { /* no navigation side effects */ }
  };

  function canSend() {
    return !state.disabled && !state.disposed &&
      state.ready && hasVersionedAnalyticsConsent(doc);
  }

  function sendEvent(name, payload) {
    if (!canSend() || typeof win.gtag !== "function") return;
    win.gtag("event", name, payload);
  }

  function preventKnownDoubleTag() {
    return Boolean(doc.querySelector?.('script[src*="googletagmanager.com/gtag/js"]')) ||
      Boolean(doc.querySelector?.('script[src*="google-analytics.com/analytics.js"]')) ||
      Boolean(doc.querySelector?.('script[src*="googletagmanager.com/gtm.js"]')) ||
      typeof win.gtag === "function" || typeof win.ga === "function" ||
      typeof win.dataLayer !== "undefined";
  }

  function initializeTag() {
    if (!allowed || state.disposed || state.initialized || !hasVersionedAnalyticsConsent(doc)) return;
    if (preventKnownDoubleTag()) {
      diagnostic("existing-google-tag-detected-stop");
      return;
    }
    state.initialized = true;
    state.disabled = false;
    state.ready = false;

    win.dataLayer = [];
    win.gtag = function gtag() {
      // Google expects the original arguments object, not an ordinary array.
      win.dataLayer.push(arguments);
    };
    // Consent v2 defaults and explicit update must precede tag config/events.
    win.gtag("consent", "default", { ...consentDefaults });
    win.gtag("consent", "update", { ...consentAfterAccept });
    win.gtag("js", new Date());
    // Disable GA4 default page_view so this adapter owns exactly one.
    win.gtag("config", GA4_MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const script = doc.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_MEASUREMENT_ID;
    script.onload = () => {
      if (state.disabled || state.disposed || !hasVersionedAnalyticsConsent(doc)) return;
      state.ready = true;
      if (!state.pageviewSent) {
        state.pageviewSent = true;
        sendEvent("page_view", {});
      }
      // Prevent two outbound events on the same click when GA4's native
      // enhanced measurement may already track links.
      if (captureBandcampOutbound === true && nativeOutboundSettingsVerified === true) {
        state.cleanupOutbound = installBandcampOutboundTracking({
          document: doc,
          isAnalyticsConsentGranted: () => hasVersionedAnalyticsConsent(doc) && !state.disabled,
          isGa4Ready: () => state.ready,
          sendEvent,
          allowedCampaigns,
        });
      }
    };
    script.onerror = () => {
      state.disabled = true;
      state.ready = false;
      diagnostic("ga4-tag-load-failed");
    };
    state.script = script;
    doc.head.appendChild(script);
  }

  function stop() {
    state.disabled = true;
    state.ready = false;
    if (typeof state.cleanupOutbound === "function") {
      state.cleanupOutbound();
      state.cleanupOutbound = null;
    }
  }

  function rejectConsent({ broadcast = false } = {}) {
    const previouslyInitialized = state.initialized;
    stop();
    clearMarker(doc);
    clearFirstPartyAnalyticsCookies(doc, host);
    if (broadcast && state.channel) {
      try { state.channel.postMessage("reject"); } catch (_error) { /* browser unavailable */ }
    }
    // Already loaded Google JavaScript cannot be truly unloaded from the
    // current document. Reload under denied/marker-absent consent to remove it.
    // We never send another Google event or consent ping after rejection.
    if (previouslyInitialized && !state.disposed) {
      diagnostic("reload-to-unload-tag-after-revocation");
      if (typeof win.location?.reload === "function") win.location.reload();
    }
  }

  function onConsentEvent(event) {
    if (!allowed || state.disposed) return;
    const choice = event?.detail?.value;
    if (choice === "true" && readCookie(doc, NOTICE_COOKIE) === "true") {
      setMarker(doc);
      initializeTag();
    } else if (choice === "false") {
      rejectConsent({ broadcast: true });
    }
  }

  function recheckConsentAfterResume() {
    if (state.disposed || !state.initialized) return;
    if (!hasVersionedAnalyticsConsent(doc)) rejectConsent();
  }

  if (allowed) {
    // Same-origin cross-tab withdrawal signal; never grants consent across tabs.
    try {
      if (typeof win.BroadcastChannel === "function") {
        state.channel = new win.BroadcastChannel("orch432-ga4-consent-v1");
        state.channel.onmessage = (event) => {
          if (event?.data === "reject") rejectConsent();
        };
      }
    } catch (_error) { state.channel = null; }
    doc.addEventListener("visibilitychange", recheckConsentAfterResume, false);
    win.addEventListener?.("pageshow", recheckConsentAfterResume, false);
    doc.addEventListener("setCookieNotice", onConsentEvent, false);
    if (hasVersionedAnalyticsConsent(doc)) initializeTag();
  }

  return Object.freeze({
    getStatus: () => ({
      enabled: allowed,
      initialized: state.initialized,
      ready: canSend(),
      pageviewSent: state.pageviewSent,
      tagInjected: Boolean(state.script),
      outboundEnabled: Boolean(state.cleanupOutbound),
    }),
    dispose: () => {
      stop();
      state.disposed = true;
      if (allowed) {
        doc.removeEventListener("setCookieNotice", onConsentEvent, false);
        doc.removeEventListener("visibilitychange", recheckConsentAfterResume, false);
        win.removeEventListener?.("pageshow", recheckConsentAfterResume, false);
      }
      try { state.channel?.close(); } catch (_error) { /* safe fallback */ }
      state.channel = null;
    },
  });
}
