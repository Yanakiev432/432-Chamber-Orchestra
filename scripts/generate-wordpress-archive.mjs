import { readFileSync, writeFileSync } from "node:fs";
import { canonicalPitch } from "./concert-pitch-standard.mjs";
import { applyOrchestraEditorial, revisedOrchestraArchiveRecords, revisedOrchestraArchiveParagraphCount } from "./orchestra-pitch-editorial.mjs";
import { applyThirdPersonEditorial, thirdPersonEditorialRoutes, thirdPersonEditorialParagraphRevisions, thirdPersonEditorialTitleRevisions, thirdPersonPatronBoilerplate } from "./orchestra-third-person-editorial.mjs";
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
// Public editorial exclusions: preserve the read-only WordPress snapshot, but never
// republish the withdrawn historical soloists paragraph in generated site content.
const withdrawnSoloistsStatement = (p) =>
  /until now soloists of the ensemble|до момента солисти на камерен оркестър\s*432/i.test(p);
function sourceLinks(body) {
  const links = [];
  for (const m of String(body || "").matchAll(/<(?:a|iframe|video|source)\b[^>]*?\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const target = url(m[1]);
    if (target && !/operamusica\.com\/artist\/miryana-?kalushkova/i.test(target) && !links.includes(target)) links.push(target);
  }
  return links.slice(0, 50);
}
const archivedBandcampTracks = new Map([
  ["789550373", ["Bizet — Entr'acte from Carmen", "https://432orchestra.bandcamp.com/track/g-bizet-entracte-suite-carmen-432-hz"]],
  ["1823013299", ["Satie — Gymnopédie No. 1", "https://432orchestra.bandcamp.com/track/e-satie-gymnopedie-no-1-432-hz"]],
  ["2953827234", ["Schubert — Moment musical No. 3", "https://432orchestra.bandcamp.com/track/fr-schubert-moment-musicaux-no-3-d-780-432-hz"]],
  ["3481191004", ["Bach — Air", "https://432orchestra.bandcamp.com/track/j-s-bach-2-air-orchestral-suite-no-3-432-hz"]]
]);
function historicAudioEmbeds(body) {
  const content = String(body || "");
  const out = [];
  for (const hit of content.matchAll(/\[bandcamp[^\]]*?\btrack=(\d+)[^\]]*\]/gi)) {
    const track = hit[1], source = archivedBandcampTracks.get(track);
    if (!source) throw new Error("UNMAPPED_HISTORICAL_BANDCAMP_TRACK_" + track);
    out.push({service:"bandcamp",label:source[0],targetUrl:source[1],
      embedUrl:"https://bandcamp.com/EmbeddedPlayer/track="+track+"/size=large/bgcol=091f19/linkcol=c7a76d/artwork=small/transparent=true/"});
  }
  for (const hit of content.matchAll(/\[soundcloud[^\]]*?playlists\/(\d+)[^\]]*\]/gi)) {
    if (hit[1] !== "72673758") throw new Error("UNVERIFIED_HISTORICAL_SOUNDCLOUD_PLAYLIST");
    out.push({service:"soundcloud",label:"432 Chamber Orchestra — archived SoundCloud playlist",targetUrl:null,
      embedUrl:"https://w.soundcloud.com/player/?url="+encodeURIComponent("https://api.soundcloud.com/playlists/"+hit[1])+"&auto_play=false&hide_related=true&show_comments=false&show_user=true&visual=true"});
  }
  return out;
}
function paras(body) {
  return name(decode(String(body || "").replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe\s*>/gi, "")
    .replace(/<form\b[\s\S]*?<\/form\s*>/gi, "")
    .replace(/\[(?:\/)?(?:bandcamp|soundcloud|caption|video_gallery|video_grid|contact-form|contact-field|gmedia|products|gallery|woocommerce|product_page|download_checkout|edd_receipt|purchase_history)[^\]]*\]/gi, "")
    .replace(/<br\s*\/?>/gi, "\n").replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<\/(?:p|li|div|h[1-6]|blockquote|ul|ol|table|tr|section)\s*>/gi, "\n\n")
    .replace(/<[^>]*>/g, "").replace(/\r\n?/g, "\n"))).split(/\n{2,}/)
      .map((s) => s.replace(/[ \t]+/g, " ").trim()).filter((p) => Boolean(p) && !withdrawnSoloistsStatement(p));
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
    eventDate: null,
    paragraphs: paras(r.kind === "taxonomy" ? source.description : source.post_content),
    sourceLinks: r.kind === "taxonomy" ? [] : sourceLinks(source.post_content),
    thumbnail: thumbnailId ? (localThumbs.get(url(attachments.get(thumbnailId)?.guid || "")) || url(attachments.get(thumbnailId)?.guid || "")) : null,
    relatedIds,
    // WordPress BG founder biography pointed to an unavailable Foundation mirror of VBAL6546.
    // The identically named 300x209 image is recovered from this WordPress public uploads (2016/12).
    inlineImages: Number(r.id) === 95 ? ["/legacy-media/wp-inline-95.jpg"] : [],
    audioEmbeds: r.kind === "taxonomy" ? [] : historicAudioEmbeds(source.post_content),
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
// The 2026-11-06 Events Calendar addendum covers publicly accessible custom post types,
// taxonomies and stable calendar view URLs omitted by the original 123-route inventory.
const eventSource = JSON.parse(readFileSync(resolve(base, "docs/wordpress-public-events-addendum-20261106.json"), "utf8"));
if (eventSource.events.length !== 2 || eventSource.categories.length !== 13 || eventSource.routes.length !== 23)
  throw new Error("WORDPRESS_EVENT_ADDENDUM_CHANGED");
const eventsById = new Map(eventSource.events.map((e) => [Number(e.ID), e]));
const catsById = new Map(eventSource.categories.map((t) => [Number(t.term_id), t]));
const addonPaths = new Map(eventSource.routes.map((r) => [r.kind + ":" + r.id + ":" + r.lang, decodeURIComponent(new URL(r.url).pathname)]));
const eventAlternate = new Map([[316, 322], [322, 316]]);
const catAlternate = new Map([[41, 104], [104, 41], [47, 106], [106, 47]]);
for (const row of eventSource.routes) {
  const path = decodeURIComponent(new URL(row.url).pathname);
  const bg = row.lang === "bg";
  let item;
  if (row.kind === "event") {
    const ev = eventsById.get(Number(row.id));
    if (!ev || ev.post_type !== "tribe_events") throw new Error("INVALID_EVENT_" + row.id);
    const meta = eventSource.metadata.filter((m) => Number(m.post_id) === Number(row.id));
    const start = meta.find((m) => m.meta_key === "_EventStartDate")?.meta_value;
    const facebook = meta.find((m) => m.meta_key === "_EventURL")?.meta_value;
    const altId = eventAlternate.get(Number(row.id));
    item = {
      id:Number(row.id),kind:"event",language:row.lang,path,
      title:name(decode(ev.post_title)),originalUrl:row.url,date:ev.post_date_gmt,
      eventDate:start ? String(start).slice(0,10) : null,
      paragraphs:paras(ev.post_content),
      sourceLinks:[...new Set([...sourceLinks(ev.post_content),...(facebook ? [facebook]:[])])],
      thumbnail:null,inlineImages:["/legacy-media/wp-event-fw.png"],audioEmbeds:[],
      relatedIds:[],bandcampUrl:null,dynamicWordPress:false,
      alternatePath: addonPaths.get("event:"+altId+":"+(bg?"en":"bg")) || null
    };
  } else if (row.kind === "event_category") {
    const cat = catsById.get(Number(row.id));
    if (!cat) throw new Error("INVALID_EVENT_CATEGORY_" + row.id);
    const matched = eventSource.relationships.filter((r) => Number(r.term_taxonomy_id) === Number(cat.term_taxonomy_id))
      .map((r) => Number(r.object_id)).filter((id) => eventsById.has(id));
    const altId = catAlternate.get(Number(row.id));
    item = {
      id:Number(row.id),kind:"event_category",language:row.lang,path,
      title: name(decode(cat.name)), originalUrl:row.url,date:null,eventDate:null,
      paragraphs: cat.description ? paras(cat.description) : [
        bg ? "Категория от историческия концертен календар на оркестъра." : "A category from the orchestra's historical concert calendar."
      ],
      sourceLinks:[],thumbnail:null,inlineImages:[],audioEmbeds:[],relatedIds:matched,
      bandcampUrl:null,dynamicWordPress:false,
      alternatePath: altId ? addonPaths.get("event_category:"+altId+":"+(bg?"en":"bg")) || null : null
    };
  } else if (row.kind === "event_view") {
    const suffix = path.replace(/^\/(bg|en)\//,"");
    const alternate = "/"+(bg?"en":"bg")+"/"+suffix;
    const existsAlt = eventSource.routes.some((r) => decodeURIComponent(new URL(r.url).pathname) === alternate);
    item = {
      id:null,kind:"event_view",language:row.lang,path,
      title:bg ? "Архивен концертен календар" : "Historical concert calendar",originalUrl:row.url,
      date:null,eventDate:null,
      paragraphs:[bg
        ? "Събития и концерти от историята на Камерен оркестър 432."
        : "Concerts and events from the history of 432 Chamber Orchestra."],
      sourceLinks:[],thumbnail:null,inlineImages:[],audioEmbeds:[],relatedIds:[bg?316:322],
      bandcampUrl:null,dynamicWordPress:false,alternatePath:existsAlt?alternate:null
    };
  } else throw new Error("UNKNOWN_EVENT_ARCHIVE_KIND");
  if (!path.startsWith("/"+row.lang+"/")) throw new Error("LANGUAGE_PATH_MISMATCH");
  items.push(item);
}
if (items.length !== 144 || new Set(items.map((r) => r.path.toLowerCase())).size !== 144)
  throw new Error("FULL_PUBLIC_ARCHIVE_ROUTE_PARITY_FAILED");
// Normalization is applied to publication text, never to source snapshots or canonical URLs.
for (const item of items) {
  item.title = canonicalPitch(item.title);
  item.paragraphs = item.paragraphs.map(canonicalPitch);
  applyOrchestraEditorial(item);
  applyThirdPersonEditorial(item);
}
if (revisedOrchestraArchiveParagraphCount !== 11 || revisedOrchestraArchiveRecords.length !== 7 ||
    revisedOrchestraArchiveRecords.some((record) => !items.some((item) => item.id === record.id && item.path === record.path))) {
  throw new Error("ORCHESTRA_WITHDRAWN_TUNING_EDITORIAL_NOT_APPLIED");
}
if (thirdPersonEditorialRoutes.length !== 10 || thirdPersonEditorialParagraphRevisions !== 21 || thirdPersonEditorialTitleRevisions !== 3) {
  throw new Error("THIRD_PERSON_EDITORIAL_RULES_DRIFT");
}
for (const [index, rule] of thirdPersonPatronBoilerplate.entries()) {
  const expected = 17;
  if (items.filter((item) => item.kind === "product").flatMap((item) => item.paragraphs)
    .filter((p) => p === rule.now).length !== expected) {
    throw new Error("THIRD_PERSON_PATRON_COUNT_DRIFT_" + index);
  }
}
const target = resolve(base, "src/content/legacyArchive.json");
writeFileSync(target, JSON.stringify({version:1, capturedUtc:snapshot.capturedUtc, items}, null, 2) + "\n", "utf8");
const kinds = Object.fromEntries(["page","post","product","taxonomy"].map((k) => [k, items.filter((x) => x.kind === k).length]));
console.log(JSON.stringify({gate:"WORDPRESS_IMPORT_PASS",imported:items.length,kinds,
  productsMapped:items.filter((x)=>x.bandcampUrl).length,
  textPages:items.filter((x)=>x.paragraphs.length).length,
  emptyIds:items.filter((x)=>!x.paragraphs.length).map((x)=>x.kind+":"+x.id)
}, null, 2));
