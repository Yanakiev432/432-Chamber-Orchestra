import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync("src/content/photoArchive.ts", "utf8");
const stage = readFileSync("src/components/OrchestraStageSection.astro", "utf8");
const gallery = "public/orchestra/photos";
const allowed = readdirSync(gallery).filter((name) => name.toLowerCase().endsWith(".jpg"));
// Guest-soloist photography is forbidden only under /orchestra/photos/.
// The selected Studio 5 album has /legacy-gallery/Concert-3.jpg,
// while the approved December archive uses /archive/concert-2016/concert-0460.jpg.
const discardedFilename = /^Concert-\d+\.jpg$/i;
const discardedPublicReference = /\/orchestra\/photos\/Concert-\d+\.jpg/i;
assert.equal(allowed.length, 8, "Expected eight approved VBAL-series and original hero photographs");
assert.ok(allowed.every((name) => !discardedFilename.test(name)), "Disallowed guest-soloist photo remains in public assets");
assert.equal([...source.matchAll(/galleryPhoto\("/g)].length, 8, "Gallery inventory must contain exactly eight approved WordPress photographs");
assert.ok(!discardedPublicReference.test(source), "Disallowed guest-soloist photo referenced in gallery inventory");
assert.ok(!discardedPublicReference.test(stage), "Disallowed guest-soloist photo referenced in main landing page");
for (const filename of ["VBAL6572.jpg", "VBAL6574.jpg", "VBAL6537-1.jpg"]) {
  assert.ok(stage.includes("/orchestra/photos/" + filename), "Selected stage photograph missing: " + filename);
}
assert.ok(existsSync(join(gallery, "cropped-VBAL6560-1.jpg")), "Original WordPress orchestra hero must be preserved");
assert.ok(existsSync("dist/bg/index.html") && existsSync("dist/en/index.html"), "Build before validating");
for (const language of ["bg", "en"]) {
  const homepage = readFileSync("dist/" + language + "/index.html", "utf8");
  const archive = readFileSync("dist/" + language + "/archive/index.html", "utf8");
  assert.ok(!discardedPublicReference.test(homepage), "Disallowed photo in " + language + " homepage");
  assert.ok(!discardedPublicReference.test(archive), "Disallowed photo in " + language + " archive");
  assert.ok(homepage.includes("/orchestra/photos/VBAL6572.jpg"), "Approved first photograph not shown");
}
if (existsSync("dist/orchestra/photos")) {
  const deployFiles = readdirSync("dist/orchestra/photos").filter((name) => name.endsWith(".jpg"));
  assert.equal(deployFiles.length, 8, "Disallowed photography still present in deployable output");
  assert.ok(deployFiles.every((name) => !discardedFilename.test(name)));
}
console.log("PHOTO_SELECTION PASS: guest-soloist hero series excluded, approved Studio 5 and other concert archives preserved");