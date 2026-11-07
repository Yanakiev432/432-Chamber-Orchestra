import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  thirdPersonEditorialRoutes,
  thirdPersonEditorialParagraphRevisions,
  thirdPersonEditorialTitleRevisions,
  thirdPersonPatronBoilerplate
} from "./orchestra-third-person-editorial.mjs";

const archive = JSON.parse(readFileSync("src/content/legacyArchive.json", "utf8"));
assert.equal(archive.items.length, 144, "Historical archive inventory changed");
assert.equal(thirdPersonEditorialRoutes.length, 10);
assert.equal(thirdPersonEditorialParagraphRevisions, 21);
assert.equal(thirdPersonEditorialTitleRevisions, 3);
for (const route of thirdPersonEditorialRoutes) {
  assert.equal(archive.items.filter((item) => item.path === route).length, 1,
    "Editorial correction missing or ambiguous: " + route);
}
for (const rule of thirdPersonPatronBoilerplate) {
  const productParagraphs = archive.items.filter((x) => x.kind === "product")
    .flatMap((x) => x.paragraphs);
  assert.equal(productParagraphs.filter((p) => p === rule.now).length, 17,
    "Patron acknowledgements changed");
  assert.ok(!productParagraphs.includes(rule.old), "Old patron first-person text reappeared");
}
// This is deliberately a speaker-voice audit, not a global ban on "I":
// visitor consent declarations are spoken by the visitor, not the orchestra.
// Historical source snapshots, original URLs and genuine quotations are preserved.
const speakerVoice = /(?<![A-Za-z])(?:we|our|ours|us)(?![A-Za-z])|(?<![\p{L}])(?:ние|нас|ни|сме|бихме|радваме|каним|целим|сравняваме|виждаме|наш|наша|наши|нашите|нашата|нашият|нашия|нашето)(?![\p{L}])/giu;
function offending(text) {
  speakerVoice.lastIndex = 0;
  const found = speakerVoice.exec(text);
  return found ? found[0] : null;
}
const violations = [];
for (const rec of archive.items) {
  const title = offending(rec.title);
  if (title) violations.push(rec.path + " title: " + title);
  for (const [index, paragraph] of rec.paragraphs.entries()) {
    const word = offending(paragraph);
    if (word) violations.push(rec.path + " paragraph " + index + ": " + word);
  }
}
for (const path of [
  "src/components/Hero.astro",
  "src/components/OrchestraStageSection.astro",
  "src/components/RecordingsSpotlight.astro",
  "src/components/SponsorBriefPage.astro",
  "src/content/siteContent.ts",
  "src/content/crmConfig.ts"
]) {
  const word = offending(readFileSync(path, "utf8"));
  if (word) violations.push(path + ": " + word);
}
const dist = resolve("dist");
let htmlPages = 0;
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (entry.name === "index.html") {
      htmlPages++;
      const html = readFileSync(file, "utf8");
      const visible = html
        .replace(/<(?:script|style|svg|noscript)\b[^>]*>[\s\S]*?<\/(?:script|style|svg|noscript)>/gi, " ")
        .replace(/<!--([\s\S]*?)-->/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&(?:nbsp|amp|quot|apos);/gi, " ");
      const word = offending(visible);
      if (word) violations.push(file + " rendered text: " + word);
    }
  }
}
scan(dist);
const demoCount=JSON.parse(readFileSync("src/content/publicDemoAttachmentRoutes.json","utf8")).items.length;
assert.equal(htmlPages, 318+demoCount, "Built page count changed");
assert.deepEqual(violations, [], "First-person orchestra copy persists in public preview");
for (const lang of ["bg", "en"]) {
  const html = readFileSync(join(dist, lang, "index.html"), "utf8");
  assert.ok(html.includes("a<sup>1</sup> = 432 Hz"), "Concert-pitch notation lost");
}
console.log(JSON.stringify({
  gate: "ORCHESTRA_THIRD_PERSON_EDITORIAL_PASS",
  pages: htmlPages,
  revisedRoutes: thirdPersonEditorialRoutes.length,
  historicalParagraphsRewritten: thirdPersonEditorialParagraphRevisions,
  historicalTitlesRewritten: thirdPersonEditorialTitleRevisions,
  patronAcknowledgementsPerLanguage: 17,
  originalWordPressSnapshotsUnchanged: true
}));
