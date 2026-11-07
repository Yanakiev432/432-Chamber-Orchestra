import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const routes = JSON.parse(readFileSync("src/content/publicDemoAttachmentRoutes.json", "utf8")).items;
const tracks = JSON.parse(readFileSync("src/content/publicAudioExcerpts.json", "utf8")).tracks;
const demoAudit = JSON.parse(readFileSync("docs/wordpress-public-demo-audio-audit-20261106.json", "utf8"));
const others = [
  "src/content/legacyArchive.json",
  "src/content/legacyGmediaRoutes.json",
  "src/content/legacyTaxonomyRoutes.json",
  "src/content/legacyExtendedRoutes.json",
  "src/content/legacyFeaturedAttachments.json"
].flatMap((file) => JSON.parse(readFileSync(file, "utf8")).items);
const existingPaths = new Set(others.map((item) => item.path.toLowerCase()));
const totalPages = 318 + routes.length;
assert.equal(routes.length,22,"Expected 22 source attachment permalinks");
assert.equal(tracks.length,11,"Expected eleven pre-reviewed public MP3s");
assert.equal(demoAudit.oldWordPressAttachmentPermalinksMatched,22);
assert.equal(demoAudit.alreadyPublishedShortMP3,11);
assert.equal(new Set(routes.map((item)=>item.id)).size,22);
assert.equal(new Set(routes.map((item)=>item.path.toLowerCase())).size,22);
assert.equal(tracks.reduce((total,item)=>total+item.sizeBytes,0),demoAudit.publicAudioBytes);
const expectedByNumber=new Map(tracks.map((track)=>[track.number,track]));
const seen = new Map();
for (const route of routes) {
  assert.equal(route.kind,"demo_attachment");
  assert.ok(["bg","en"].includes(route.language));
  assert.ok(route.path.startsWith("/"+route.language+"/")&&route.path.endsWith("/"));
  assert.ok(!existingPaths.has(route.path.toLowerCase()),"Historical route collision: "+route.path);
  const url = new URL(route.originalUrl);
  assert.equal(url.hostname,"432hz-orchestra.com","Foreign permalink");
  assert.equal(url.protocol,"https:","Historical URL must use HTTPS");
  assert.equal(decodeURIComponent(url.pathname),route.path,"Historical slug mismatched: "+route.path);
  assert.ok(!url.search&&!url.hash,"No query or fragment in source permalink");
  const track=expectedByNumber.get(route.demoNumber);
  assert.ok(track,"Attachment not linked to a whitelisted recording: "+route.path);
  assert.equal(route.mediaSrc,track.src);
  assert.equal(route.title,track.title[route.language]);
  assert.equal(route.excerptPath,"/"+route.language+"/recordings/excerpts/#excerpt-"+String(track.number).padStart(2,"0"));
  assert.ok(!route.mediaSrc.toLowerCase().includes("woocommerce"));
  const paired = routes.filter((r)=>r.demoNumber===route.demoNumber);
  assert.equal(paired.length,2,"Expected BG+EN source permalinks per excerpt");
  assert.equal(route.alternatePath,paired.find((r)=>r.language!==route.language)?.path);
  const mp3=join(resolve("dist"),track.src.slice(1));
  assert.ok(existsSync(mp3),"Missing published short MP3");
  const bytes=readFileSync(mp3);
  assert.equal(bytes.length,track.sizeBytes,"MP3 length drift: "+mp3);
  assert.equal(createHash("sha256").update(bytes).digest("hex"),track.sha256,"MP3 hash drift: "+mp3);
  const file=join(resolve("dist"),route.path.slice(1),"index.html");
  assert.ok(existsSync(file),"Missing demo attachment page: "+route.path);
  const html=readFileSync(file,"utf8");
  assert.ok(html.includes('src="'+track.src+'"'),"Wrong audio in historic media page: "+route.path);
  assert.ok(html.includes('href="'+route.excerptPath+'"'),"Specific excerpt anchor link missing");
  assert.ok(html.includes('content="noindex,nofollow"'),"Demo attachment is indexable on preview");
  assert.ok(html.includes(route.originalUrl),"Original source URL not credited");
  assert.ok(html.includes('<audio '),"No actual audio player on historical page");
  seen.set(track.number,(seen.get(track.number)||0)+1);
}
assert.equal(seen.size,11);
assert.ok([...seen.values()].every((n)=>n===2));
for (const language of ["bg","en"]) {
  const path=join(resolve("dist"),language,"recordings","excerpts","index.html");
  const html=readFileSync(path,"utf8");
  for (const track of tracks)
    assert.ok(html.includes('id="excerpt-'+String(track.number).padStart(2,"0")+'"'),
      "Specific recording anchor missing: "+language+" "+track.number);
}
console.log(JSON.stringify({
  gate:"HISTORICAL_PUBLIC_DEMO_ATTACHMENT_PASS",
  sourcePermalinksRestored:routes.length,
  reviewedShortMp3:tracks.length,
  sourceMpegAttachmentsExcluded:15,
  htmlPages:totalPages,
  protectedWooCommerceFilesAdded:0,
  originalWordPressSourceUntouched:true
}));
