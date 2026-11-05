import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, relative, join, sep } from "node:path";

const dist = resolve("dist");
const manifest = JSON.parse(readFileSync("docs/legacy-wordpress-public-routes-20261105.json", "utf8"));
const products = manifest.product_routes;
assert.equal(products.length, 46, "Expected 46 public legacy product routes");
assert.equal(new Set(products.map((p) => p.id)).size, 46, "Duplicate WordPress product IDs");
assert.equal(products.filter((p) => p.language === "bg").length, 23, "BG count must be 23");
assert.equal(products.filter((p) => p.language === "en").length, 23, "EN count must be 23");
assert.ok(products.every((p) => {
  const url = new URL(p.url);
  return url.protocol === "https:" && url.hostname === manifest.root_domain &&
    /^\/(bg|en)\/product\/.+\/$/.test(url.pathname) && !url.search && !url.hash;
}), "All legacy URLs must be public, on the verified domain, and be product routes");

assert.ok(existsSync(dist), "Build Astro first: pnpm build");
const built = [];
function walk(folder) {
  for (const ent of readdirSync(folder, { withFileTypes: true })) {
    const file = join(folder, ent.name);
    if (ent.isDirectory()) walk(file);
    else if (ent.isFile() && ent.name === "index.html") {
      const p = relative(dist, file).split(sep).join("/");
      built.push("/" + p.replace(/index\.html$/, ""));
    }
  }
}
walk(dist);
const paths = new Set(built);
const unmapped = products.filter((p) => !paths.has(new URL(p.url).pathname));
const modeArg = process.argv.find((v) => v.startsWith("--mode="));
const mode = modeArg?.split("=")[1] || "report";
assert.ok(["report", "replace", "preview"].includes(mode), "Unknown --mode; use report, replace or preview");

const report = {
  mode,
  totalLegacyProductRoutes: products.length,
  distinctAstroStaticRoutes: paths.size,
  legacyProductRoutesAbsentFromAstro: unmapped.length,
  exampleMissingRoutes: unmapped.slice(0, 4).map((p) => new URL(p.url).pathname),
  protectedRoutes: manifest.cart_checkout_routes.length,
  authoritativeOrigin: "https://" + manifest.root_domain
};

if (mode === "replace") {
  assert.equal(unmapped.length, 0,
    "CUTOVER BLOCKED: WordPress product permalinks are absent from Astro dist. " +
    "Do not overwrite public_html or remove WordPress. A reviewed preservation/redirect plan is mandatory.");
  // Route coverage alone is not sufficient: historic Woo orders, wp-content media,
  // customer history and callbacks need independent proof outside this static gate.
  assert.fail("CUTOVER BLOCKED: static route parity does not prove legacy WordPress order/media continuity.");
}

if (mode === "preview") {
  const robots = readFileSync(join(dist, "robots.txt"), "utf8");
  const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
  const preview = process.env.PUBLIC_SITE_URL;
  assert.ok(preview && /^https:\/\/[^/]+\/?$/.test(preview), "Set PUBLIC_SITE_URL to a separate HTTPS preview origin");
  assert.notEqual(new URL(preview).hostname, manifest.root_domain, "Preview cannot be on production host");
  assert.equal(process.env.PUBLIC_PREVIEW_MODE, "true", "Preview requires PUBLIC_PREVIEW_MODE=true");
  assert.ok(robots.includes("Disallow: /"), "Preview must disallow indexing");
  assert.ok(!robots.includes("Sitemap:"), "Preview must not advertise a sitemap");
  assert.ok(sitemap.includes(new URL("/en/recordings/", preview).href), "Preview URLs must use preview origin");
  for (const path of built) {
    const page = readFileSync(join(dist, path.slice(1), "index.html"), "utf8");
    assert.ok(page.includes('<meta name="robots" content="noindex,nofollow"'),
      "Missing noindex on preview page: " + path);
  }
  report.previewIsolation = "PASS";
}

console.log(JSON.stringify(report, null, 2));
if (mode === "report" && unmapped.length > 0) {
  console.log("CUTOVER STATUS: BLOCKED. Parallel, non-indexed preview can proceed.");
}
