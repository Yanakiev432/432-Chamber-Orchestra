import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const inventory = JSON.parse(readFileSync("docs/legacy-wordpress-published-routes-20261105.json", "utf8"));
assert.equal(inventory.routes.length, 123, "Live public inventory must be reviewed before running this audit");
const origin = new URL(inventory.origin);
const expectedRedirectPaths = new Set([
  "/en/cart/", "/en/checkout/", "/en/checkout-2/", "/bg/кошница/"
]);
const workers = 3; // Shared hosting: bounded, non-destructive requests.
const timeoutMs = 13000;
const routes = inventory.routes.map((r) => ({ ...r, url: new URL(r.url) }));
assert.ok(routes.every((r) => r.url.origin === origin.origin && r.url.protocol === "https:" &&
  !r.url.search && !r.url.hash), "Public URL origin/path precondition failed");

async function readRoute(row) {
  const started = Date.now();
  try {
    const res = await fetch(row.url, {
      method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "432ChamberOrchestra-LegacyRouteQA/1.0 (read-only; 3 concurrent)" }
    });
    const code = res.status;
    const redirect = res.headers.get("location");
    const path = decodeURI(row.url.pathname);
    const expectedRedirect = expectedRedirectPaths.has(path);
    const ok = (code === 200 || (expectedRedirect && [301, 302, 307, 308].includes(code) &&
      redirect && new URL(redirect, row.url).hostname === "432orchestra.bandcamp.com"));
    return {
      kind: row.kind, id: row.id, path: row.url.pathname, status: code, redirect: redirect || null,
      ok: Boolean(ok), elapsedMs: Date.now() - started
    };
  } catch (error) {
    return {
      kind: row.kind, id: row.id, path: row.url.pathname,
      status: null, redirect: null, ok: false,
      error: error?.name || "RequestError", elapsedMs: Date.now() - started
    };
  }
}
const results = new Array(routes.length);
let offset = 0;
await Promise.all(Array.from({ length: workers }, async () => {
  while (offset < routes.length) {
    const i = offset++;
    results[i] = await readRoute(routes[i]);
  }
}));
const byStatus = {};
for (const row of results) byStatus[row.status ?? "ERROR"] = (byStatus[row.status ?? "ERROR"] || 0) + 1;
const bad = results.filter((r) => !r.ok);
const report = {
  audit: "Public WordPress legacy route HTTP HEAD gate (no login, no private data)",
  checked: results.length, ok: results.length - bad.length, failed: bad.length,
  byStatus, broken: bad,
  totalRouteCount: inventory.routes.length,
  mode: "read-only",
  productionChanges: false
};
console.log(JSON.stringify(report, null, 2));
const out = process.argv.find((s) => s.startsWith("--output="))?.slice(9);
if (out) writeFileSync(resolve(out), JSON.stringify({ ...report, results }, null, 2) + "\n", { flag: "wx" });
if (bad.length > 0) process.exitCode = 2;
