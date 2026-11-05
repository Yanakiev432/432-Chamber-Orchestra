import test from "node:test";
import assert from "node:assert/strict";
import { parseArtistGrid, expectedReleaseUrls, compareReleases } from "./audit-bandcamp-live.mjs";

const base = "https://432orchestra.bandcamp.com";
const html = [
'<ul>',
'<li data-item-id="album-100" class="music-grid-item square">',
'  <a href="/album/test-album"><div class="art"><img src="https://example.invalid/x.jpg"></div>',
'  <p class="title"> A &amp; B: &#x2014; Six Notturni </p></a>',
'</li>',
'<li class="music-grid-item" data-item-id="track-200">',
'  <a href="/track/test-track"><p class="title"> Track &#39;Two&#39; </p></a>',
'</li>',
'</ul>'
].join("\n");

test("parses only release music-grid tiles with safe Bandcamp URLs", () => {
  const rows = parseArtistGrid(html);
  assert.deepEqual(rows, [
    { url: base + "/album/test-album", title: "A & B: — Six Notturni" },
    { url: base + "/track/test-track", title: "Track 'Two'" }
  ]);
});
test("identifies new releases without silently publishing them", () => {
  const rows = parseArtistGrid(html);
  const current = [base + "/album/test-album", base + "/track/test-track"];
  assert.equal(compareReleases(rows, current).match, true);
  const drift = compareReleases(rows, [current[0], base + "/track/deleted-track"]);
  assert.deepEqual(drift.newUnreviewedReleases.map((x) => x.url), [current[1]]);
  assert.deepEqual(drift.removedOrChangedUrlReleases, [base + "/track/deleted-track"]);
  assert.equal(drift.match, false);
});
test("blocks parse changes and off-artist URLs", () => {
  assert.throws(() => parseArtistGrid("<html>layout changed</html>"), /No public music-grid/);
  assert.throws(() => parseArtistGrid(html.replace("/track/test-track", "https://evil.invalid/track/test-track")), /Unexpected release URL/);
  assert.throws(() => parseArtistGrid(html + html), /Duplicate release/);
});
test("extracts only curated Bandcamp URL fields", () => {
  const source = 'const arr = [{url: "' + base + '/album/test-album"}, {url: "' + base + '/track/test-track"}]';
  assert.deepEqual(expectedReleaseUrls(source), [base + "/album/test-album", base + "/track/test-track"]);
  assert.throws(() => expectedReleaseUrls("export const arr=[]"), /No curated/);
});
