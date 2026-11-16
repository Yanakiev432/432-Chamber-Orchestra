import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { evaluatePreflight } from "./consent-preflight.mjs";

const good = () => ({
  propertyId: "397059277",
  streamId: "5843252803",
  measurementId: "G-YMLKYY9HGT",
  nativeDestinationVerified: true,
  legacyTagPlanApproved: true,
  legacyBandcampEventMapped: true,
  legacyAndNewOutboundDeduped: true,
  acceptAndRejectVisible: true,
  withdrawalAvailable: true,
  initialNoGoogleRequests: true,
  initialNoAnalyticsCookies: true,
  rejectNoGoogleRequests: true,
  revokeStopsGoogleRequests: true,
  revokeClearsAnalyticsCookies: true,
  acceptedExactlyOneGa4PageView: true,
  acceptedOutboundClickWorks: true,
  deniedOutboundClickSilent: true,
  allNetworkSitesConsentTested: true,
  destinationRegressionPassed: true,
  rollbackReady: true,
  productionChangeExplicitlyApproved: true,
  checkedAtUtc: "2026-11-15T05:00:00Z",
  unresolvedFindings: 0,
});
test("current unknowns are NOT GO and never deploy", () => {
  const s = evaluatePreflight({ propertyId: "397059277", streamId: "5843252803", measurementId: "G-YMLKYY9HGT" });
  assert.equal(s.status, "NO_GO");
  assert.equal(s.neverAutoDeploy, true);
  assert.ok(s.blockers.length > 10);
});
test("full asserted evidence permits only human go review", () => {
  const s = evaluatePreflight(good());
  assert.equal(s.status, "READY_FOR_MANUAL_GO_REVIEW");
  assert.equal(s.neverAutoDeploy, true);
  assert.equal(s.blockers.length, 0);
});
test("correct GA4 stream ID is not equivalent to validated tag destinations", () => {
  const e = good(); e.nativeDestinationVerified = false;
  assert.equal(evaluatePreflight(e).status, "NO_GO");
});
test("missing reject choice is a hard stop", () => {
  const e = good(); e.acceptAndRejectVisible = false;
  assert.ok(evaluatePreflight(e).blockers.some(x => x.includes("Accept/Reject")));
});
test("advanced cookieless pings before consent do not pass Basic Mode gate", () => {
  const e = good(); e.initialNoGoogleRequests = false;
  assert.equal(evaluatePreflight(e).status, "NO_GO");
});
test("revoke with residual cookies fails", () => {
  const e = good(); e.revokeClearsAnalyticsCookies = false;
  assert.equal(evaluatePreflight(e).status, "NO_GO");
});
test("GA4 double pageview fails", () => {
  const e = good(); e.acceptedExactlyOneGa4PageView = false;
  assert.equal(evaluatePreflight(e).status, "NO_GO");
});
test("previous change approval never carries over", () => {
  const e = good(); e.productionChangeExplicitlyApproved = false;
  assert.equal(evaluatePreflight(e).status, "NO_GO");
});
test("unresolved findings fail even with all flags asserted", () => {
  const e = good(); e.unresolvedFindings = 1;
  assert.equal(evaluatePreflight(e).status, "NO_GO");
});
test("malformed, empty and missing data fail closed", () => {
  for (const e of [null, undefined, [], "", {}, 123]) {
    assert.equal(evaluatePreflight(e).status, "NO_GO");
  }
});

test("unidentified existing GA4 Bandcamp host event blocks deploy", () => {
  const e = good(); e.legacyBandcampEventMapped = false;
  const r = evaluatePreflight(e);
  assert.equal(r.status, "NO_GO");
  assert.ok(r.blockers.some(x => x.includes("existing GA4 event")));
});
test("potential double-counted outbound link clicks block deploy", () => {
  const e = good(); e.legacyAndNewOutboundDeduped = false;
  const r = evaluatePreflight(e);
  assert.equal(r.status, "NO_GO");
  assert.ok(r.blockers.some(x => x.includes("same click twice")));
});

test("static legacy event emitter identification cannot authorize unknown GA4 network delivery", () => {
  const e = good();
  e.legacyBandcampEventMapped = null;
  e.legacyAndNewOutboundDeduped = null;
  e.legacyTrackerStaticAudit = {
    level: "STATIC_CODE_PLUS_ACTUAL_PUBLIC_SCRIPT_LOADING_CONFIRMED__GA4_DELIVERY_UNVERIFIED"
  };
  const r = evaluatePreflight(e);
  assert.equal(r.status, "NO_GO");
  assert.ok(r.blockers.some(b => b.includes("existing GA4 event")));
  assert.ok(r.blockers.some(b => b.includes("same click twice")));
});


test("observed live Cookie Notice only renders Accept and cannot be considered consent-compliant", () => {
  const current = JSON.parse(readFileSync(new URL("./evidence-current.json", import.meta.url), "utf8"));
  assert.equal(current.consentUiStaticAudit.accept_link_only_on_sampled_pages, true);
  assert.equal(current.consentUiStaticAudit.reject_option_configured, false);
  assert.equal(current.consentUiStaticAudit.revoke_option_configured, false);
  assert.equal(current.consentUiStaticAudit.bg_notice_translated, false);
  assert.equal(current.acceptAndRejectVisible, false);
  assert.equal(current.withdrawalAvailable, null);
  assert.equal(evaluatePreflight(current).status, "NO_GO");
});

test("static script presence and lack of reported purchase events must not grant GA4 tracking GO", () => {
  const e = good();
  const current = JSON.parse(readFileSync(new URL("./evidence-current.json", import.meta.url), "utf8"));
  e.initialNoGoogleRequests = current.consentUiStaticAudit.nonconsent_analytics_network_requests === "PROVEN_NO_REQUESTS";
  e.nativeDestinationVerified = current.nativeDestinationVerified;
  e.legacyBandcampEventMapped = current.legacyBandcampEventMapped;
  e.legacyAndNewOutboundDeduped = current.legacyAndNewOutboundDeduped;
  const result = evaluatePreflight(e);
  assert.equal(result.status, "NO_GO");
  assert.ok(result.blockers.some(x => x.includes("no analytics requests before consent")));
});


test("Cookie Compliance autoblocking is not active in the observed classic plugin mode", () => {
  const current = JSON.parse(readFileSync(new URL("./evidence-current.json",import.meta.url),"utf8"));
  const a = current.cookieNoticeClassicModeSourceAudit;
  assert.equal(a.get_status,"");
  assert.equal(a.cookieComplianceActive,false);
  assert.equal(a.appBlockingTrueButInactiveInClassicMode,true);
  assert.equal(a.googleScriptBeforeConsentScript,true);
  assert.equal(a.actualPreconsentGoogleTransmission,"UNKNOWN");
  assert.equal(evaluatePreflight(current).status,"NO_GO");
});

test("PHP guard is staging-only, source-hashed and not a substitute for CMP or GA4 network proof", () => {
  const current = JSON.parse(readFileSync(new URL("./evidence-current.json",import.meta.url),"utf8"));
  const source = readFileSync(new URL("./orch432-g3-legacy-guard.preview.php",import.meta.url),"utf8");
  const g = current.legacySuppressionCandidate;
  assert.ok(source.includes("ORCH432_G3_STAGING_LEGACY_GUARD_ENABLED"));
  assert.ok(source.includes("get_current_blog_id() !== 1"));
  assert.ok(source.includes("432hz-orchestra.com"));
  assert.ok(source.includes("exactmetrics_tracking_script"));
  assert.ok(source.includes("ga_external_tracking_js"));
  assert.ok(!source.includes("update_option("));
  assert.ok(!source.includes("deactivate_plugins("));
  assert.equal(g.state,"STAGED_NOT_INSTALLED_DISABLED_BY_DEFAULT");
  assert.equal(g.productionEnabled,false);
  assert.equal(g.effective_analytics_consent_guard_proven,false);
  assert.equal(evaluatePreflight(current).status,"NO_GO");
});


test("classic Cookie Notice candidate can render both-language choice UI only in process memory", () => {
  const d = JSON.parse(readFileSync(new URL("./evidence-current.json",import.meta.url),"utf8"));
  const en=d.classicCmpBilingualUiDryRun.en;
  const bg=d.classicCmpBilingualUiDryRun.bg;
  for (const a of [en,bg]) {
    assert.deepEqual([a.accept,a.reject,a.revoke],[true,true,true]);
    assert.equal(a.html_errors,0);
  }
  assert.equal(d.classicCmpBilingualUiDryRun.status,"IN_MEMORY_ONLY_NOT_LIVE");
  assert.equal(d.classicCmpBilingualUiDryRun.no_browser_network_proof,true);
  assert.equal(evaluatePreflight(d).status,"NO_GO");
});

test("the X close HTML attribute does not override actual installed JavaScript reject handler", () => {
  const d=JSON.parse(readFileSync(new URL("./evidence-current.json",import.meta.url),"utf8"));
  const a=d.classicCmpBilingualUiDryRun;
  assert.equal(a.close_attr_data_cookie_set,"accept");
  assert.equal(a.close_actual_front_js_click_handler,"setStatus('reject')");
  assert.equal(a.close_is_implicit_acceptance_bug,false);
  assert.equal(a.revoke_action,"Opens consent banner; subsequent Reject needed to record withdrawal");
});
