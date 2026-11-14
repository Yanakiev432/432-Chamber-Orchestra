import { test } from "node:test";
import assert from "node:assert/strict";
import { installBandcampOutboundTracking } from "./outbound-tracker.mjs";

const doc = (search = "?utm_campaign=archive_q4") => {
  const listeners = [];
  return {
    location: { search },
    listeners,
    addEventListener(_type, fn) { listeners.push(fn); },
    removeEventListener(_type, fn) { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); },
    click(anchor) { for (const fn of [...listeners]) fn({ target: { closest: (selector) => selector === "a[href]" ? anchor : null } }); },
  };
};
const link = (hostname = "432orchestra.bandcamp.com", product = "769") => ({
  protocol: "https:", hostname, port: "", dataset: { c432ProductId: product },
  classList: { contains: (name) => name === "c432-bandcamp-loop-button" },
  closest: () => false,
});

test("denied consent and unready GA4 send nothing", () => {
  const d = doc(); const sent = []; let consent = false; let ready = true;
  installBandcampOutboundTracking({ document: d, isAnalyticsConsentGranted: () => consent, isGa4Ready: () => ready, sendEvent: (...args) => sent.push(args) });
  d.click(link()); consent = true; ready = false; d.click(link());
  assert.equal(sent.length, 0);
});

test("one allowlisted Bandcamp CTA emits one sanitized event", () => {
  const d = doc(); const sent = [];
  const init = { document: d, isAnalyticsConsentGranted: () => true, isGa4Ready: () => true, sendEvent: (...args) => sent.push(args), allowedCampaigns: ["archive_q4"] };
  const uninstall = installBandcampOutboundTracking(init);
  assert.equal(installBandcampOutboundTracking(init), uninstall);
  assert.equal(d.listeners.length, 1);
  d.click(link()); d.click(link("432orchestra.bandcamp.com.evil.example"));
  assert.deepEqual(sent, [["bandcamp_outbound_click", { placement: "shop_grid", product_id: "769", utm_campaign: "archive_q4" }]]);
  uninstall(); assert.equal(d.listeners.length, 0);
});

test("disallowed or email-like campaign never leaves page", () => {
  const d = doc("?utm_campaign=someone%40example.org"); const sent = [];
  installBandcampOutboundTracking({ document: d, isAnalyticsConsentGranted: () => true, isGa4Ready: () => true, sendEvent: (_name, args) => sent.push(args), allowedCampaigns: ["archive_q4"] });
  d.click(link()); assert.deepEqual(sent, [{ placement: "shop_grid", product_id: "769" }]);
});

test("consent adapter exception fails closed without breaking navigation", () => {
  const d = doc(); let invoked = false;
  installBandcampOutboundTracking({ document: d, isAnalyticsConsentGranted: () => { throw Error("CMP unavailable"); }, isGa4Ready: () => true, sendEvent: () => { invoked = true; } });
  assert.doesNotThrow(() => d.click(link())); assert.equal(invoked, false);
});
