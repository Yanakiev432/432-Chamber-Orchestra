import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";

const collection=JSON.parse(readFileSync("src/content/publicAudioExcerpts.json","utf8"));
assert.equal(collection.version,1);
assert.equal(collection.tracks.length,11);
assert.equal(collection.protectedWooCommerceFilesIncluded,false);
assert.equal(collection.excludedUnreviewedAudio,6);
assert.equal(collection.tuning,"a¹ = 432 Hz");
const accepted=[1,2,7,8,9,10,11,13,14,15,16];
assert.deepEqual(collection.tracks.map(x=>x.number),accepted);
const sourceDir=resolve("public/audio-excerpts");
const renderedDir=resolve("dist/audio-excerpts");
const expected=accepted.map(n=>"demo-"+String(n).padStart(2,"0")+".mp3");
for(const dir of [sourceDir,renderedDir]){
 assert.ok(existsSync(dir),"Audio excerpt directory absent: "+dir);
 assert.deepEqual(readdirSync(dir).sort(),[...expected].sort(),"Unapproved file in audio excerpts: "+dir);
}
const sampleSha=new Set();
let audioBytes=0;
for(const track of collection.tracks){
 const name="demo-"+String(track.number).padStart(2,"0")+".mp3";
 assert.equal(track.src,"/audio-excerpts/"+name);
 assert.equal(track.mime,"audio/mpeg");
 assert.ok(track.durationSeconds>=15 && track.durationSeconds<=60,"Unreviewed long recording: "+name);
 assert.ok(track.sizeBytes>=500000 && track.sizeBytes<=3000000);
 assert.ok(track.originalPublicUrl.startsWith("https://432hz-orchestra.com/wp-content/uploads/2016/12/DEMO-"));
 assert.ok(!/woocommerce_uploads|checkout|private|\/download\//i.test(track.originalPublicUrl));
 assert.ok(/^[0-9a-f]{64}$/.test(track.sha256));
 assert.ok(!sampleSha.has(track.sha256),"Duplicate recording sha: "+name);
 sampleSha.add(track.sha256);
 assert.ok(track.title.bg.length>3 && track.title.en.length>3);
 for(const root of [sourceDir,renderedDir]){
  const raw=readFileSync(join(root,name));
  assert.equal(raw.length,track.sizeBytes,"Audio length mismatch: "+name);
  assert.equal(createHash("sha256").update(raw).digest("hex"),track.sha256,"Audio hash mismatch: "+name);
 }
 audioBytes+=track.sizeBytes;
}
assert.equal(audioBytes,14930244,"Unexpected audio collection byte count");
for(const lang of ["bg","en"]){
 const file=resolve("dist",lang,"recordings","excerpts","index.html");
 assert.ok(existsSync(file),"Missing excerpt page "+lang);
 const html=readFileSync(file,"utf8");
 assert.equal((html.match(/<audio\b/g)||[]).length,11,"Not all excerpts are playable: "+lang);
 assert.ok(html.includes("a<sup>1</sup> = 432 Hz"),"Concert pitch notation missing: "+lang);
 for(const track of collection.tracks){
  assert.equal(html.split('src="'+track.src+'"').length-1,1,"Wrong player source count: "+track.src);
  assert.ok(html.includes(track.title[lang]),"Audio title missing: "+track.number);
 }
 const disc=readFileSync(resolve("dist",lang,"recordings","index.html"),"utf8");
 assert.ok(disc.includes('href="/'+lang+'/recordings/excerpts/"'),"Missing discography link: "+lang);
}
console.log(JSON.stringify({
 gate:"PUBLIC_AUDIO_EXCERPTS_PROTECTED_MEDIA_GATE_PASS",
 tracks:11,sourceAudioBytes:audioBytes,languagePages:2,
 protectedWooCommerceFilesIncluded:false,unreviewedFilesExcluded:6
}));
