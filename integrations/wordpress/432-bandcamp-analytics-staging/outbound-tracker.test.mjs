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

const liveWooAnchor = (placement, className, id = "") => ({
  protocol: "https:",
  hostname: "432orchestra.bandcamp.com",
  port: "",
  dataset: {},
  classList: { contains: (selector) => selector === (placement === "shop_grid" ? "c432-bandcamp-loop-button" : "c432-bandcamp-button") },
  closest(selector) {
    if (selector === "li.product, div.product") return placement === "shop_banner" ? null : { className, id };
    if (selector === ".c432-bandcamp-single") return placement === "product_page" ? {} : null;
    if (selector === ".c432-bandcamp-shop") return placement === "shop_banner" ? {} : null;
    return null;
  },
});

test("production shop markup uses post-919 class without data attribute", () => {
  const d = doc(); const sent = [];
  installBandcampOutboundTracking({ document: d, isAnalyticsConsentGranted: () => true, isGa4Ready: () => true, sendEvent: (_name, args) => sent.push(args) });
  d.click(liveWooAnchor("shop_grid", "product type-product post-919 status-publish"));
  assert.deepEqual(sent, [{ placement: "shop_grid", product_id: "919" }]);
});

test("production single page recovers post-769 from product wrapper", () => {
  const d = doc(); const sent = [];
  installBandcampOutboundTracking({ document: d, isAnalyticsConsentGranted: () => true, isGa4Ready: () => true, sendEvent: (_name, args) => sent.push(args) });
  d.click(liveWooAnchor("product_page", "product type-product post-769 status-publish", "product-769"));
  assert.deepEqual(sent, [{ placement: "product_page", product_id: "769" }]);
});

test("shop banner emits placement but no fabricated product id", () => {
  const d = doc(); const sent = [];
  installBandcampOutboundTracking({ document: d, isAnalyticsConsentGranted: () => true, isGa4Ready: () => true, sendEvent: (_name, args) => sent.push(args) });
  d.click(liveWooAnchor("shop_banner", ""));
  assert.deepEqual(sent, [{ placement: "shop_banner" }]);
});

test("invalid WP post class does not leak arbitrary id", () => {
  const d = doc(); const sent = [];
  installBandcampOutboundTracking({ document: d, isAnalyticsConsentGranted: () => true, isGa4Ready: () => true, sendEvent: (_name, args) => sent.push(args) });
  d.click(liveWooAnchor("shop_grid", "product post-0 attacker fake-1234", "bad-1"));
  assert.deepEqual(sent, [{ placement: "shop_grid" }]);
});

test("revoking consent stops later events and keeps links working", () => {
  const d = doc(); const sent = []; let consent = true;
  installBandcampOutboundTracking({ document: d, isAnalyticsConsentGranted: () => consent, isGa4Ready: () => true, sendEvent: (_name, args) => sent.push(args) });
  d.click(liveWooAnchor("shop_grid", "post-919")); consent = false;
  assert.doesNotThrow(() => d.click(liveWooAnchor("shop_grid", "post-919")));
  assert.equal(sent.length, 1);
});

test("sender exception never breaks navigation", () => {
  const d = doc();
  installBandcampOutboundTracking({ document: d, isAnalyticsConsentGranted: () => true, isGa4Ready: () => true, sendEvent: () => { throw new Error("GA4 offline"); } });
  assert.doesNotThrow(() => d.click(liveWooAnchor("shop_grid", "post-919")));
});
