import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import {
  revisedOrchestraArchiveRecords,
  revisedOrchestraArchiveParagraphCount
} from "./orchestra-pitch-editorial.mjs";

// The orchestra has withdrawn its former artistic-identity claim about
// open fifths/fourths. Leave historical source snapshots untouched but
// never present that claim on public preview pages.
const rejected = /(?:open[\s"'“”’\-]*fifths?|open[\s"'“”’\-]*fourths?|отворен(?:и|ите|а|ата|ият|ия)?\s+квинт(?:и|ите|а)?|отворен(?:и|ите|а|ата|ият|ия)?\s+кварт(?:и|ите|а)?)/i;

const source = readFileSync("src/content/siteContent.ts", "utf8");
assert.ok(!rejected.test(source), "Withdrawn tuning in editorial site content");
const records = JSON.parse(readFileSync("src/content/legacyArchive.json", "utf8")).items;
assert.equal(records.length, 144);
assert.equal(revisedOrchestraArchiveParagraphCount, 11);
assert.equal(revisedOrchestraArchiveRecords.length, 7);
for (const record of records) {
  assert.ok(!rejected.test(record.title), "Withdrawn tuning in archive title " + record.path);
  assert.ok(!record.paragraphs.some((p) => rejected.test(p)),
    "Withdrawn tuning in generated historical text " + record.path);
}
for (const revision of revisedOrchestraArchiveRecords) {
  const matches = records.filter((x) => x.id === revision.id && x.path === revision.path);
  assert.equal(matches.length, 1, "Expected editorially corrected record " + revision.path);
}
for (const path of [
  "/en/about/432-chamber-orchestra/",
  "/bg/относно/камерен-оркестър-432/",
  "/en/about/ivan-yanakiev/",
  "/bg/относно/иван-янакиев/",
  "/bg/относно/ла-432-hz-концертен-строй/"
]) {
  assert.ok(records.some((x) => x.path === path), "Historical route must be preserved: " + path);
}
const root = resolve("dist");
let htmlPages = 0;
let violations = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes:true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name === "index.html") {
      htmlPages++;
      const html = readFileSync(file, "utf8");
      if (rejected.test(html)) violations.push(file);
    }
  }
}
walk(root);
assert.equal(htmlPages, 318, "Published page count drift");
assert.deepEqual(violations, [], "Withdrawn tuning still present in compiled public pages");
for (const path of ["/bg/", "/en/"]) {
  const file = join(root, path.slice(1), "index.html");
  const html = readFileSync(file, "utf8");
  assert.ok(html.includes("a<sup>1</sup> = 432 Hz"), "Orchestra pitch must remain: " + path);
}
const approvedHero = [
  {
    lang: "bg",
    text: "Камерен оркестър 432 изпълнява струнния репертоар в концертен строй a¹ = 432 Hz. Интересуват ни акустичните свойства на звука и начинът, по който музиката се възприема и преживява при този строй. Елате и чуйте сами."
  },
  {
    lang: "en",
    text: "432 Chamber Orchestra performs the string repertoire at concert pitch a¹ = 432 Hz. We are interested in the acoustic properties of sound and in how music is heard and experienced at this pitch. Come and listen for yourself."
  }
];
for (const { lang, text } of approvedHero) {
  assert.ok(source.includes(text), "The revised orchestra statement must remain exact: " + lang);
  const html = readFileSync(join(root, lang, "index.html"), "utf8");
  const rendered = text.replaceAll("a¹", "a<sup>1</sup>");
  assert.ok(html.includes(rendered), "The public homepage must show the revised statement: " + lang);
}
const historicalSource = readFileSync("docs/wordpress-public-source-20261106.json", "utf8");
assert.ok(/open fifths|отворени квинти/i.test(historicalSource),
  "Historical WordPress evidence must not be rewritten to conceal previous statements");
console.log(JSON.stringify({
  gate:"ORCHESTRA_WITHDRAWN_TUNING_EDITORIAL_PASS",
  pages:htmlPages,
  correctedHistoricalRoutes:revisedOrchestraArchiveRecords.length,
  replacedHistoricalParagraphs:revisedOrchestraArchiveParagraphCount,
  originalWordPressSnapshotPreserved:true,
  pitch:"a¹ = 432 Hz"
}));
