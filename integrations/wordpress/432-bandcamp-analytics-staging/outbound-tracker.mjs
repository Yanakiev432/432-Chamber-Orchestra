// STAGING ONLY — no automatic initialization, no cookies, no navigation changes.
// Integration must be explicitly approved and gated by a working CMP and GA4 readiness.
const subscriptions = new WeakMap();

export function installBandcampOutboundTracking(options) {
  const { document: doc, isAnalyticsConsentGranted, isGa4Ready, sendEvent, allowedCampaigns = [] } = options || {};
  if (!doc || typeof doc.addEventListener !== "function" || typeof isAnalyticsConsentGranted !== "function" || typeof isGa4Ready !== "function" || typeof sendEvent !== "function") {
    throw new TypeError("Explicit document, consent check, GA4 readiness check, and sender are required");
  }
  if (subscriptions.has(doc)) return subscriptions.get(doc);
  const handler = (event) => {
    try {
      if (!isAnalyticsConsentGranted() || !isGa4Ready()) return;
      const anchor = event?.target?.closest?.("a[href]");
      if (!anchor || anchor.protocol !== "https:" || anchor.hostname !== "432orchestra.bandcamp.com" || (anchor.port && anchor.port !== "443")) return;
      const placement = anchor.classList?.contains("c432-bandcamp-loop-button")
        ? "shop_grid"
        : anchor.closest?.(".c432-bandcamp-single")
          ? "product_page"
          : anchor.closest?.(".c432-bandcamp-shop")
            ? "shop_banner"
            : "other";
      const payload = { placement };
      const productId = String(anchor.dataset?.c432ProductId || "");
      if (/^[1-9][0-9]{0,7}$/.test(productId)) payload.product_id = productId;
      const search = String(doc.location?.search || "");
      const campaign = search.match(/(?:^\?|&)utm_campaign=([a-z0-9_-]{1,64})(?:&|$)/);
      if (campaign && allowedCampaigns.includes(campaign[1])) payload.utm_campaign = campaign[1];
      sendEvent("bandcamp_outbound_click", payload);
    } catch (_error) {
      // Tracking never blocks navigation, even if a consent adapter or sender fails.
    }
  };
  doc.addEventListener("click", handler, true);
  const uninstall = () => {
    doc.removeEventListener("click", handler, true);
    subscriptions.delete(doc);
  };
  subscriptions.set(doc, uninstall);
  return uninstall;
}
