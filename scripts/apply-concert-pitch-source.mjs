import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { canonicalPitch } from "./concert-pitch-standard.mjs";

const sources = [
  "src/content/siteContent.ts",
  "src/content/audioArchive.ts",
  "src/content/legacyVideos.json",
  "src/components/PressPage.astro"
];
let total = 0;
for (const relative of sources) {
  const path = resolve(relative);
  const before = readFileSync(path, "utf8");
  const after = canonicalPitch(before);
  if (after !== before) {
    writeFileSync(path, after, "utf8");
    const changes = (after.match(/a¹ = (?:432|440) Hz/g) || []).length - (before.match(/a¹ = (?:432|440) Hz/g) || []).length;
    console.log(relative, "normalized", changes);
    total += changes;
  }
}
console.log("SOURCE_PITCH_NORMALIZATION_COUNT", total);
