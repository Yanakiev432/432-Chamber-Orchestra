// G3 staging-only readiness gate. Pure data check; no network, cookies, browser or deployment.
const EXPECTED = Object.freeze({
  propertyId: "397059277",
  streamId: "5843252803",
  measurementId: "G-YMLKYY9HGT",
});
const BOOLEAN_GATES = Object.freeze([
  ["nativeDestinationVerified", "native GA4 destination must be inspected"],
  ["legacyTagPlanApproved", "legacy ExactMetrics/Analyticator migration plan and rollback must be reviewed"],
  ["legacyBandcampEventMapped", "existing GA4 event named 432orchestra.bandcamp.com must be traced to the actual legacy sender"],
  ["legacyAndNewOutboundDeduped", "existing and proposed Bandcamp click events must not count the same click twice"],
  ["acceptAndRejectVisible", "equal Accept/Reject choices must be visible"],
  ["withdrawalAvailable", "withdraw/change consent control must be available"],
  ["initialNoGoogleRequests", "no analytics requests before consent"],
  ["initialNoAnalyticsCookies", "no analytics cookies before consent"],
  ["rejectNoGoogleRequests", "reject must produce no analytics requests"],
  ["revokeStopsGoogleRequests", "revocation must stop subsequent analytics requests"],
  ["revokeClearsAnalyticsCookies", "revocation must clear non-essential analytics cookies"],
  ["acceptedExactlyOneGa4PageView", "accepted session must produce exactly one GA4 page_view"],
  ["acceptedOutboundClickWorks", "accepted Bandcamp CTA must emit one sanitized custom event"],
  ["deniedOutboundClickSilent", "denied Bandcamp CTA must emit zero events"],
  ["allNetworkSitesConsentTested", "all affected multisite sites and language routes must be tested"],
  ["destinationRegressionPassed", "12 release links and 23 WordPress mappings must pass"],
  ["rollbackReady", "rollback steps and previous configuration must be stored"],
  ["productionChangeExplicitlyApproved", "user must authorize the exact production change"],
]);
export function evaluatePreflight(evidence) {
  const e = evidence && typeof evidence === "object" && !Array.isArray(evidence) ? evidence : {};
  const failures = [];
  if (e.propertyId !== EXPECTED.propertyId || e.streamId !== EXPECTED.streamId || e.measurementId !== EXPECTED.measurementId) {
    failures.push("verified GA4 property/stream/measurement identity mismatch or missing");
  }
  for (const [key, message] of BOOLEAN_GATES) if (e[key] !== true) failures.push(message);
  const checked = e.checkedAtUtc;
  if (typeof checked !== "string" || !/^20\d{2}-\d{2}-\d{2}T/.test(checked) || Number.isNaN(Date.parse(checked))) {
    failures.push("auditable UTC check timestamp required");
  }
  // Any unresolved failed check remains a blocker even if other assertions pass.
  if (e.unresolvedFindings !== 0) failures.push("unresolved findings must be exactly zero");
  return Object.freeze({
    status: failures.length ? "NO_GO" : "READY_FOR_MANUAL_GO_REVIEW",
    blockers: failures,
    checkedRequirements: BOOLEAN_GATES.length + 3,
    neverAutoDeploy: true,
  });
}
