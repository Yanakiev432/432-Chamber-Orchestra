import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
// Export contains exclusively public WordPress posts, products and taxonomy records.
const base = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(resolve(base, "docs/legacy-wordpress-published-routes-20261105.json"), "utf8"));
const snapshot = JSON.parse(readFileSync(resolve(base, "docs/wordpress-public-source-20261106.json"), "utf8"));
const crosswalk = readFileSync(resolve(base, "docs/wordpress-bandcamp-23-pair-crosswalk-20261104.csv"), "utf8")
  .trim().split(/\r?\n/).slice(1).map((line) => [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]));
const translations = JSON.parse(readFileSync(resolve(base, "docs/wordpress-polylang-public-pairs-20261106.json"), "utf8"));
const mediaInventory = JSON.parse(readFileSync(resolve(base, "docs/wordpress-public-media-inventory-20261106.json"), "utf8"));
const localThumbs = new Map(mediaInventory.images.map((x) => [x.url, x.local]));
if (snapshot.posts.length !== 94 || snapshot.terms.length !== 29 || manifest.routes.length !== 123 || crosswalk.length !== 23)
  throw new Error("SOURCE_COUNTS_CHANGED");
const posts = new Map(snapshot.posts.map((x) => [Number(x.ID), x]));
const terms = new Map(snapshot.terms.map((x) => [Number(x.term_id), x]));
const attachments = new Map(snapshot.publicAttachments.map((x) => [Number(x.ID), x]));
const productLinks = new Map(crosswalk.flatMap((r) => [[Number(r[0]), r[4]], [Number(r[1]), r[4]]]));
const entities = { amp: "&", quot: '"', apos: "'", nbsp: " ", lt: "<", gt: ">", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", copy: "©" };
function decode(s) {
  return String(s ?? "").replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi, (raw, key) => {
    if (key.startsWith("#")) {
      const n = key[1]?.toLowerCase() === "x" ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : raw;
    }
    return Object.hasOwn(entities, key) ? entities[key] : raw;
  });
}
const name = (s) => s.replace(/(?:д-р\s+)?Иван(?:\s+К\.)?\s+Янакиев/gu, "Иван Янакиев")
  .replace(/Ivan(?:\s+K\.)?\s+Yanakiev(?:,?\s+PhD)?/gi, "Ivan Yanakiev");
function url(raw) {
  try {
    const x = new URL(decode(raw), snapshot.sourceOrigin);
    if (!["http:", "https:"].includes(x.protocol)) return null;
    // WordPress source encoded the external tone generator as a broken same-origin /http:/ path.
    // The intended external target was verified HTTP 200 on 2026-11-06.
    if (x.hostname === "432hz-orchestra.com" && x.pathname === "/http:/www.onlinetonegenerator.com/432Hz.html")
      return "https://onlinetonegenerator.com/432Hz.html";
    if (x.hostname === "432hz-orchestra.com") x.protocol = "https:";
    return x.href;
  } catch { return null; }
}
const keyPath = (raw) => decodeURIComponent(new URL(raw).pathname).replace(/\/?$/, "/").toLowerCase();
function sourceLinks(body) {
  const links = [];
  for (const m of String(body || "").matchAll(/<(?:a|iframe|video|source)\b[^>]*?\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const target = url(m[1]);
    if (target && !links.includes(target)) links.push(target);
  }
  return links.slice(0, 50);
}
function paras(body) {
  return name(decode(String(body || "").replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe\s*>/gi, "")
    .replace(/<form\b[\s\S]*?<\/form\s*>/gi, "")
    .replace(/\[(?:\/)?(?:bandcamp|contact-form|contact-field|gmedia|products|gallery|woocommerce|product_page)[^\]]*\]/gi, "")
    .replace(/<br\s*\/?>/gi, "\n").replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<\/(?:p|li|div|h[1-6]|blockquote|ul|ol|table|tr|section)\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "").replace(/\r\n?/g, "\n"))).split(/\n{2,}/)
      .map((s) => s.replace(/[ \t]+/g, " ").trim()).filter(Boolean);
}
const thumbs = new Map(snapshot.publicMeta.filter((m) => m.meta_key === "_thumbnail_id").map((m) => [Number(m.post_id), Number(m.meta_value)]));
const relations = new Map();
for (const r of snapshot.relationships) {
  const k = Number(r.term_taxonomy_id);
  if (!relations.has(k)) relations.set(k, []);
  relations.get(k).push(Number(r.object_id));
}
const items = [];
for (const r of manifest.routes) {
  if (["/bg/", "/en/"].includes(keyPath(r.url))) continue;
  const path = decodeURIComponent(new URL(r.url).pathname);
  const language = path.startsWith("/bg/") ? "bg" : "en";
  const source = r.kind === "taxonomy" ? terms.get(Number(r.id)) : posts.get(Number(r.id));
  if (!source || (r.kind !== "taxonomy" && source.post_type !== r.kind)) throw new Error("MISSING_SOURCE_" + r.kind + "_" + r.id);
  const title = name(decode(r.kind === "taxonomy" ? source.name : source.post_title)).replace(/^\s*д-р\s+/i, "").trim();
  if (!title) throw new Error("EMPTY_TITLE " + r.id);
  const thumbnailId = thumbs.get(Number(r.id));
  const relatedIds = r.kind === "taxonomy" ? [...new Set(relations.get(Number(source.term_taxonomy_id)) || [])].filter((id) => posts.has(id))
    : (r.kind === "page" && /\/news\/$/.test(path) ? snapshot.posts.filter((p) => p.post_type === "post").map((p) => Number(p.ID)) : []);
  items.push({
    id: Number(r.id), kind: r.kind, language, path, title, originalUrl: r.url,
    date: r.kind === "taxonomy" ? null : source.post_date_gmt,
    paragraphs: paras(r.kind === "taxonomy" ? source.description : source.post_content),
    sourceLinks: r.kind === "taxonomy" ? [] : sourceLinks(source.post_content),
    thumbnail: thumbnailId ? (localThumbs.get(url(attachments.get(thumbnailId)?.guid || "")) || url(attachments.get(thumbnailId)?.guid || "")) : null,
    relatedIds,
    // WordPress BG founder biography pointed to an unavailable Foundation mirror of VBAL6546.
    // The identically named 300x209 image is recovered from this WordPress public uploads (2016/12).
    inlineImages: Number(r.id) === 95 ? ["/legacy-media/wp-inline-95.jpg"] : [],
    bandcampUrl: r.kind === "product" ? productLinks.get(Number(r.id)) ?? null : null,
    dynamicWordPress: r.kind === "page" && /\/(?:cart|checkout|checkout-2|my-account|ms-download-page|purchase-history|purchase-confirmation|transaction-failed|кошница)\/?$/.test(path)
  });
}
const urlsById = new Map(manifest.routes.filter((x) => x.kind !== "taxonomy").map((x) => [Number(x.id), decodeURIComponent(new URL(x.url).pathname)]));
const alternateById = new Map();
for (const group of translations.groups) {
  if (group.length !== 2) continue;
  const [a, b] = group.map(Number);
  if (urlsById.has(a) && urlsById.has(b)) { alternateById.set(a, urlsById.get(b)); alternateById.set(b, urlsById.get(a)); }
}
for (const item of items) item.alternatePath = item.kind === "taxonomy" ? null : (alternateById.get(item.id) || null);
if (items.length !== 121 || items.filter((x) => x.kind === "product").length !== 46 ||
    items.filter((x) => x.kind === "product" && !x.bandcampUrl).length ||
    new Set(items.map((x) => x.path.toLowerCase())).size !== 121) throw new Error("MIGRATION_INVARIANT_FAILED");
const target = resolve(base, "src/content/legacyArchive.json");
writeFileSync(target, JSON.stringify({version:1, capturedUtc:snapshot.capturedUtc, items}, null, 2) + "\n", "utf8");
const kinds = Object.fromEntries(["page","post","product","taxonomy"].map((k) => [k, items.filter((x) => x.kind === k).length]));
console.log(JSON.stringify({gate:"WORDPRESS_IMPORT_PASS",imported:items.length,kinds,
  productsMapped:items.filter((x)=>x.bandcampUrl).length,
  textPages:items.filter((x)=>x.paragraphs.length).length,
  emptyIds:items.filter((x)=>!x.paragraphs.length).map((x)=>x.kind+":"+x.id)
}, null, 2));
