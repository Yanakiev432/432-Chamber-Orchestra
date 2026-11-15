import test from "node:test";
import assert from "node:assert/strict";
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
