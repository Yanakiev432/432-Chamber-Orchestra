import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const dist = resolve("dist");
const origin = new URL(process.env.PUBLIC_SITE_URL || "https://432hz-orchestra.com").origin;
const load = (path) => readFileSync(join(dist, path), "utf8");

assert.ok(existsSync(dist), "Run the Astro build before SEO validation.");
const sitemap = load("sitemap.xml");
const robots = load("robots.txt");

assert.ok(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "Missing XML declaration.");
assert.ok(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), "Missing sitemap namespace.");
assert.ok(sitemap.includes("</urlset>"), "Missing sitemap closing element.");

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const importedCount = JSON.parse(readFileSync(resolve("src/content/legacyArchive.json"), "utf8")).items.length;
const gmediaCount = JSON.parse(readFileSync(resolve("src/content/legacyGmediaRoutes.json"), "utf8")).items.length;
const taxonomyCount = JSON.parse(readFileSync(resolve("src/content/legacyTaxonomyRoutes.json"), "utf8")).items.length;
const extendedCount = JSON.parse(readFileSync(resolve("src/content/legacyExtendedRoutes.json"), "utf8")).items.length;
const attachmentCount = JSON.parse(readFileSync(resolve("src/content/legacyFeaturedAttachments.json"), "utf8")).items.length;
assert.equal(sitemapUrls.length, 28 + importedCount + gmediaCount + taxonomyCount + extendedCount + attachmentCount, "Sitemap must enumerate every curated and historical page.");
assert.equal(new Set(sitemapUrls).size, sitemapUrls.length, "Duplicate sitemap URLs.");
assert.ok(sitemapUrls.every((url) => url.startsWith(origin + "/")), "Sitemap URLs must be absolute and use the configured origin.");

const htmlFiles = [];
function scan(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, item.name);
    if (item.isDirectory()) scan(file);
    else if (item.isFile() && item.name === "index.html") htmlFiles.push(file);
  }
}
scan(dist);
const htmlUrls = htmlFiles.map((file) => {
  const rel = relative(dist, file).split(sep).join("/");
  const path = rel === "index.html" ? "/" : "/" + rel.slice(0, -"index.html".length);
  return new URL(path, origin).href;
});
assert.deepEqual(new Set(sitemapUrls), new Set(htmlUrls), "Sitemap must match the actual static pages.");
const previewMode = process.env.PUBLIC_PREVIEW_MODE === "true";
if (previewMode) {
  assert.ok(robots.includes("Disallow: /"), "Preview robots must disallow crawling.");
  assert.ok(!robots.includes("Sitemap:"), "Isolated preview must not advertise a sitemap.");
  for (const file of htmlFiles) {
    assert.ok(readFileSync(file, "utf8").includes('content="noindex,nofollow"'),
      "Preview page is indexable: " + file);
  }
} else {
  assert.ok(robots.includes("Sitemap: " + origin + "/sitemap.xml"),
    "Production robots must advertise an absolute sitemap URL.");
}

for (const lang of ["bg", "en"]) {
  const other = lang === "bg" ? "en" : "bg";
  const html = load(lang + "/recordings/index.html");
  const pageUrl = origin + "/" + lang + "/recordings/";
  const otherUrl = origin + "/" + other + "/recordings/";

  assert.ok(html.includes('rel="canonical" href="' + pageUrl + '"'), "Invalid " + lang + " recordings canonical.");
  assert.ok(html.includes('hreflang="' + lang + '" href="' + pageUrl + '"'), "Missing self alternate: " + lang);
  assert.ok(html.includes('hreflang="' + other + '" href="' + otherUrl + '"'), "Missing translated alternate: " + lang);
  assert.ok(html.includes('"@type":"MusicGroup"'), "Missing MusicGroup structured data: " + lang);
  assert.ok(html.includes('property="og:image" content="' + origin + "/"), "Missing absolute OG image: " + lang);
  const links = new Set([...html.matchAll(/https:\/\/432orchestra\.bandcamp\.com\/(?:album|track)\/[a-z0-9-]+/g)].map((match) => match[0]));
  assert.equal(links.size, 12, "Expected exactly 12 distinct Bandcamp release links: " + lang);
}

console.log("SEO BUILD GATE PASS: " + sitemapUrls.length + " sitemap URLs, robots, 2 canonical/hreflang pages, 12 links each, schema and OG image.");
