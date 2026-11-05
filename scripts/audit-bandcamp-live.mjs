import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const artistMusicUrl = "https://432orchestra.bandcamp.com/music";
const artistOrigin = new URL(artistMusicUrl).origin;

function decodeHtmlText(value) {
  return value.replace(/<[^>]*>/g, "").replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (match, code) => {
    const named = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
    if (code[0] === "#") {
      const cp = code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isInteger(cp) && cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : match;
    }
    return named[code.toLowerCase()] ?? match;
  }).replace(/\s+/g, " ").trim();
}

/** Read the artist's public music grid; never interpret scripts or arbitrary page links. */
export function parseArtistGrid(html) {
  const rows = [];
  const seen = new Set();
  const pattern = /<li\b(?=[^>]*\bdata-item-id=["'](?:album|track)-\d+["'])[^>]*>([\s\S]*?)<\/li>/gi;
  for (const match of html.matchAll(pattern)) {
    const fragment = match[1];
    const link = fragment.match(/<a\b[^>]*\bhref=["']([^"']+)["']/i)?.[1];
    const titleText = fragment.match(/<p\b[^>]*\bclass=["'][^"']*\btitle\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1];
    if (!link || !titleText) throw new Error("Bandcamp music-grid layout changed; manual inspection required.");
    const url = new URL(link, artistOrigin);
    if (url.origin !== artistOrigin || !/^\/(album|track)\/[a-z0-9-]+$/.test(url.pathname)) {
      throw new Error("Unexpected release URL: " + url.href);
    }
    if (seen.has(url.href)) throw new Error("Duplicate release in Bandcamp grid: " + url.href);
    seen.add(url.href);
    rows.push({ url: url.href, title: decodeHtmlText(titleText) });
  }
  if (rows.length === 0) throw new Error("No public music-grid releases extracted. Do not treat this as an empty catalogue.");
  return rows;
}

/** Our curated bilingual titles and track counts remain authoritative until reviewed. */
export function expectedReleaseUrls(catalogueSource) {
  const urls = [...catalogueSource.matchAll(/\burl:\s*"(https:\/\/432orchestra\.bandcamp\.com\/(?:album|track)\/[a-z0-9-]+)"/g)]
    .map((m) => m[1]);
  assert.equal(urls.length, new Set(urls).size, "Duplicate release URL in curated catalogue");
  if (urls.length === 0) throw new Error("No curated Bandcamp release URLs found");
  return urls;
}

export function compareReleases(actual, expected) {
  const live = new Set(actual.map((r) => r.url));
  const curated = new Set(expected);
  return {
    liveCount: actual.length,
    curatedCount: expected.length,
    newUnreviewedReleases: actual.filter((row) => !curated.has(row.url)),
    removedOrChangedUrlReleases: expected.filter((url) => !live.has(url)),
    match: actual.length === expected.length && live.size === expected.length &&
      actual.every((row) => curated.has(row.url))
  };
}

async function audit() {
  const fixture = process.argv.find((arg) => arg.startsWith("--fixture="))?.slice(10);
  const html = fixture
    ? readFileSync(resolve(fixture), "utf8")
    : await (async () => {
      const response = await fetch(artistMusicUrl, {
        signal: AbortSignal.timeout(25000),
        headers: { "User-Agent": "432ChamberOrchestraCatalogAudit/1.0 (public read-only)" },
        redirect: "follow"
      });
      if (!response.ok || new URL(response.url).origin !== artistOrigin) {
        throw new Error("Bandcamp response was not a successful artist-page response: HTTP " + response.status);
      }
      return response.text();
    })();
  const rows = parseArtistGrid(html);
  const expected = expectedReleaseUrls(readFileSync("src/content/bandcampCatalog.ts", "utf8"));
  const result = { source: artistMusicUrl, checkedAtUtc: new Date().toISOString(), ...compareReleases(rows, expected) };
  const outfile = process.argv.find((arg) => arg.startsWith("--output="))?.slice(9);
  if (outfile) writeFileSync(resolve(outfile), JSON.stringify(result, null, 2) + "\n", { flag: "wx" });
  console.log(JSON.stringify(result, null, 2));
  if (!result.match) {
    console.error("BANDCAMP_DRIFT: review new/removed releases, update titles/track counts and rebuild before publication.");
    process.exitCode = 2;
  } else console.log("BANDCAMP_CATALOGUE_CURRENT=PASS");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  audit().catch((e) => { console.error("BANDCAMP_AUDIT_FAILED: " + e.message); process.exitCode = 1; });
}
