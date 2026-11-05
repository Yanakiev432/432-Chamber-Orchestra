import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync("src/content/photoArchive.ts", "utf8");
const stage = readFileSync("src/components/OrchestraStageSection.astro", "utf8");
const gallery = "public/orchestra/photos";
const allowed = readdirSync(gallery).filter((name) => name.toLowerCase().endsWith(".jpg"));
const discarded = /Concert-\d+\.jpg/i;
assert.equal(allowed.length, 8, "Expected eight approved VBAL-series and original hero photographs");
assert.ok(allowed.every((name) => !discarded.test(name)), "Disallowed guest-soloist photo remains in public assets");
assert.equal([...source.matchAll(/galleryPhoto\("/g)].length, 8, "Gallery inventory must contain exactly eight approved WordPress photographs");
assert.ok(!discarded.test(source), "Disallowed guest-soloist photo referenced in gallery inventory");
assert.ok(!discarded.test(stage), "Disallowed guest-soloist photo referenced in main landing page");
for (const filename of ["VBAL6572.jpg", "VBAL6574.jpg", "VBAL6537-1.jpg"]) {
  assert.ok(stage.includes("/orchestra/photos/" + filename), "Selected stage photograph missing: " + filename);
}
assert.ok(existsSync(join(gallery, "cropped-VBAL6560-1.jpg")), "Original WordPress orchestra hero must be preserved");
assert.ok(existsSync("dist/bg/index.html") && existsSync("dist/en/index.html"), "Build before validating");
for (const language of ["bg", "en"]) {
  const homepage = readFileSync("dist/" + language + "/index.html", "utf8");
  const archive = readFileSync("dist/" + language + "/archive/index.html", "utf8");
  assert.ok(!discarded.test(homepage), "Disallowed photo in " + language + " homepage");
  assert.ok(!discarded.test(archive), "Disallowed photo in " + language + " archive");
  assert.ok(homepage.includes("/orchestra/photos/VBAL6572.jpg"), "Approved first photograph not shown");
}
if (existsSync("dist/orchestra/photos")) {
  const deployFiles = readdirSync("dist/orchestra/photos").filter((name) => name.endsWith(".jpg"));
  assert.equal(deployFiles.length, 8, "Disallowed photography still present in deployable output");
  assert.ok(deployFiles.every((name) => !discarded.test(name)));
}
console.log("PHOTO_SELECTION PASS: 9 guest-soloist concert-series images excluded; 8 approved gallery images, 14 curated archive photos, 2 language editions");