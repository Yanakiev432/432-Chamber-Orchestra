import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
const read=(f)=>JSON.parse(readFileSync(f,"utf8"));
const manifest=read("docs/wordpress-remaining-media-review-20261107.json");
const approvedFiles=[
 "src/content/legacyFeaturedAttachments.json",
 "src/content/publicDemoAttachmentRoutes.json",
 "src/content/publicPhotoAttachmentRoutes.json"
];
const approved=approvedFiles.flatMap((f)=>read(f).items);
const historicalPoster={id:313,path:"/en/афиш-чайната-fw/"};
assert.ok(existsSync(join(resolve("dist"),historicalPoster.path.slice(1),"index.html")),"Native archived poster page missing");
approved.push(historicalPoster);
const ids=new Set(approved.map((r)=>r.id));
const approvedPaths=new Set(approved.map((r)=>r.path.toLowerCase()));
const counts={
 "woo-protected-wave":8,
 "unreviewed-wave":100,
 "unapproved-demo-mp3":12,
 "editorially-excluded-studio5":13,
 "studio5-other-variant":1,
 "additional-vbal":22,
 "additional-dsc":42,
 "branding-layout-review":38,
 "uncurated-visual-review":34
};
assert.equal(manifest.version,1);
assert.equal(manifest.sourceAttachments,353);
assert.equal(manifest.publicAttachmentPagesAlreadyRestored,83);
assert.equal(manifest.remaining,270);
assert.deepEqual(manifest.classificationCounts,counts);
assert.equal(approved.length,83,"Approved attachment inventory drift");
assert.equal(ids.size,83,"Duplicate approved WordPress attachment ID");
assert.equal(manifest.items.length,270,"Review queue must contain every remaining source attachment");
const allIds=new Set(ids);
const gmedia=read("src/content/legacyGallery.json");
const selected=new Set(read("src/content/studio5PhotoSelection.json").keptFilenames);
const rejected=new Set(gmedia.albums.find((x)=>x.id===1).images
 .filter((x)=>!selected.has(x.filename)).map((x)=>x.filename));
assert.equal(rejected.size,13);
const rejectedActual=new Set();
const seenPaths=new Set();
const observed={};
for(const row of manifest.items){
 assert.ok(Number.isInteger(row.id)&&row.id>0);
 assert.ok(!allIds.has(row.id),"Approved and quarantined media ID overlap: "+row.id);
 allIds.add(row.id);
 assert.ok(Object.hasOwn(counts,row.classification),"Unexpected review classification");
 assert.ok(row.decision.startsWith("HOLD_")||row.decision.startsWith("BLOCK_"),
   "Review item was silently authorized: "+row.id);
 assert.ok(row.evidence.length>=24,"Missing evidence label");
 observed[row.classification]=(observed[row.classification]||0)+1;
 if(row.decision==="BLOCK_PRIVATE_MEDIA"||row.decision==="BLOCK_PROTECTED_DOWNLOAD_HASH"){
  assert.equal(row.mime,row.decision==="BLOCK_PRIVATE_MEDIA"?"audio/wav":"audio/mpeg");
  assert.equal(row.sourcePagePath,null,"Protected or byte-identical media page URL must never enter tracked manifest");
  assert.equal(row.sourceMediaFilename,null,"Protected media filename must remain private");
 }else{
  assert.ok(row.sourcePagePath.startsWith("/bg/")||row.sourcePagePath.startsWith("/en/"),
    "Missing source permalink in audit");
  assert.ok(row.sourcePagePath.endsWith("/")&&!row.sourcePagePath.includes("?"));
  assert.ok(!seenPaths.has(row.sourcePagePath),"Duplicate unreviewed permalink");
  seenPaths.add(row.sourcePagePath);
  assert.ok(!approvedPaths.has(row.sourcePagePath.toLowerCase()),"Source unexpectedly approved");
  assert.ok(!existsSync(join(resolve("dist"),row.sourcePagePath.slice(1),"index.html")),
    "QUARANTINE_BREACH: an unreviewed historical attachment page was generated: "+row.id);
 }
 if(row.classification==="editorially-excluded-studio5"){
  assert.equal(row.decision,"BLOCK_USER_EXCLUDED");
  assert.ok(rejected.has(row.sourceMediaFilename),"A new image was misidentified as excluded");
  rejectedActual.add(row.sourceMediaFilename);
 }
 if(row.mime.startsWith("audio/")){
  assert.equal(row.sourceMediaFilename,null,"Audio direct file names are forbidden in public review data");
 }
}
assert.deepEqual(observed,counts);
assert.deepEqual(rejectedActual,rejected,"Thirteen editorially excluded Studio 5 photos must stay excluded");
assert.equal(allIds.size,353,"Every historical WordPress attachment ID must be exactly one of approved/quarantined");
assert.equal(seenPaths.size,258,"Non-sensitive unreviewed source permalinks count drift");
assert.equal(manifest.highRiskSourcePagePathsRedacted,4);
const localPages=read("docs/wordpress-coverage-checkpoint-20261107.json");
assert.equal(localPages.astroStaticPages,394);
assert.equal(localPages.sourcePathsMatched,352);
assert.equal(localPages.attachmentPagesRemaining,270);
assert.equal(localPages.productionRedirectsDeployed,0);
assert.equal(localPages.productionCutoverApproved,false);
const mp3Items=manifest.items.filter((item)=>item.classification==="unapproved-demo-mp3");
const mp3Counts={};
for(const item of mp3Items){
  mp3Counts[item.decision]=(mp3Counts[item.decision]||0)+1;
  assert.ok(item.exclusionEvidence && item.exclusionEvidence.length>40,
    "Missing per-exclusion evidence for historical DEMO MP3 ID "+item.id);
}
assert.deepEqual(mp3Counts,{
  HOLD_DURATION_AND_RIGHTS_REVIEW:6,
  BLOCK_PROTECTED_DOWNLOAD_HASH:4,
  BLOCK_TRUNCATED_MP3:2
},"MP3 risk subclasses must not silently change");
assert.deepEqual(manifest.mp3Subclasses,{
  protectedDownloadHashMatches:4,
  truncatedOriginalMp3:2,
  holdForRightsDuration:6,
  distinctOriginalMp3:6
},"Six distinct excluded MP3s and their 12 permalinks must remain accounted for");
const gate={
 gate:"WORDPRESS_REMAINING_MEDIA_FAIL_CLOSED_PASS",
 sourceAttachments:353,
 approvedDetailPages:approved.length,
 unapprovedBlocked:manifest.items.length,
 blockedWooAttachmentIds:counts["woo-protected-wave"],
 uniqueProtectedFilesAnonymousHead403:manifest.protectedSourceMediaFiles,
 reviewOnlyWav:counts["unreviewed-wave"],
 excludedDemoPermalinks:counts["unapproved-demo-mp3"],
 demoProtectedHashMatchedUrls:mp3Counts.BLOCK_PROTECTED_DOWNLOAD_HASH,
 demoTruncatedUrls:mp3Counts.BLOCK_TRUNCATED_MP3,
 excludedStudio5Photos:rejectedActual.size,
 otherVisualReview:counts["studio5-other-variant"]+counts["additional-vbal"]+counts["additional-dsc"]+counts["branding-layout-review"]+counts["uncurated-visual-review"],
 unauthorizedSourcePagesPublished:0,
 wordpressProductionChanged:false
};
assert.equal(gate.uniqueProtectedFilesAnonymousHead403,4);
console.log(JSON.stringify(gate));
