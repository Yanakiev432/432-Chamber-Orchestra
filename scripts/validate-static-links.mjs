import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, relative, join, sep } from "node:path";

const dist = resolve("dist");
if (!existsSync(dist)) throw new Error("Missing dist: run pnpm build first");
const rootOrigin = new URL(process.env.PUBLIC_SITE_URL || "https://432hz-orchestra.com/").origin;
const failures = [];
let checked = 0;
let internalLinks = 0;
let imageAndScriptAssets = 0;
const pages = [];

function walk(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const target = join(dir, item.name);
    if (item.isDirectory()) walk(target);
    else if (item.isFile() && item.name === "index.html") pages.push(target);
  }
}
walk(dist);

function actualFile(url) {
  const decoded = decodeURIComponent(url.pathname);
  const path = decoded === "/" ? "index.html"
    : decoded.endsWith("/") ? decoded.slice(1) + "index.html"
    : decoded.slice(1).includes(".") ? decoded.slice(1)
    : decoded.slice(1) + "/index.html";
  const candidate = resolve(dist, path);
  if (!candidate.startsWith(dist + sep) && candidate !== resolve(dist, "index.html")) {
    throw new Error("Static link escapes dist: " + url.pathname);
  }
  return candidate;
}

function anchorsIn(html) {
  return new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((m) => m[1]));
}
for (const page of pages) {
  const localPage = relative(dist, page).split(sep).join("/");
  const currentRoute = "/" + localPage.replace(/index\.html$/, "");
  const pageUrl = new URL(currentRoute, rootOrigin);
  const html = readFileSync(page, "utf8");
  const tags = [...html.matchAll(/<(?:a|img|link|script|source)\b[^>]*>/gi)];
  for (const [tag] of tags) {
    const m = tag.match(/\b(?:href|src)=["']([^"']+)["']/i);
    if (!m) continue;
    const raw = m[1].replace(/&amp;/g, "&");
    if (raw.startsWith("data:") || raw.startsWith("mailto:") || raw.startsWith("tel:") || raw.startsWith("javascript:")) continue;
    checked++;
    let url;
    try { url = new URL(raw, pageUrl); }
    catch { failures.push({ from: currentRoute, target: raw, error: "INVALID_URL" }); continue; }
    if (url.origin !== rootOrigin) continue;
    internalLinks++;
    let file;
    try { file = actualFile(url); }
    catch (error) { failures.push({ from: currentRoute, target: raw, error: error.message }); continue; }
    if (!existsSync(file) || !statSync(file).isFile()) {
      failures.push({ from: currentRoute, target: raw, error: "MISSING_STATIC_ROUTE_OR_ASSET" });
      continue;
    }
    if (!file.endsWith("index.html")) imageAndScriptAssets++;
    if (url.hash && file.endsWith("index.html")) {
      const hash = decodeURIComponent(url.hash.slice(1));
      if (!anchorsIn(readFileSync(file, "utf8")).has(hash)) {
        failures.push({ from: currentRoute, target: raw, error: "MISSING_ANCHOR_ID" });
      }
    }
  }
}
const result = {
  pages: pages.length,
  checkedHrefAndSrc: checked,
  internalLinksAndAssets: internalLinks,
  assetReferences: imageAndScriptAssets,
  failures: failures.slice(0, 30),
  failureCount: failures.length
};
console.log(JSON.stringify(result, null, 2));
if (pages.length !== 21 || failures.length) process.exitCode = 2;
