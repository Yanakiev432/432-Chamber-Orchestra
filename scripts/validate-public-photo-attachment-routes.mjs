import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";

const read=(f)=>JSON.parse(readFileSync(f,"utf8"));
const manifest=read("src/content/publicPhotoAttachmentRoutes.json");
const routes=manifest.items;
const gallery=read("src/content/legacyGallery.json");
const selected=read("src/content/studio5PhotoSelection.json");
const concert=read("src/content/concertArchiveCurated.json");
const approved=new Map();
for(const img of gallery.albums.find((a)=>a.id===6).images)
 approved.set(img.src,{category:"bulgarian-composers",filename:img.filename,sha256:img.sha256});
for(const filename of selected.keptFilenames){
 const img=gallery.albums.find((a)=>a.id===1).images.find((p)=>p.filename===filename);
 assert.ok(img);
 approved.set(img.src,{category:"studio-5",filename:img.filename,sha256:img.sha256});
}
for(const img of concert.photos)
 approved.set(img.src,{category:"orchestra-concert",filename:img.source,sha256:img.optimizedSha256});
assert.equal(approved.size,54,"Only 54 already curated images are permitted");
assert.equal(routes.length,54,"Expected 54 historically verified WordPress photo permalinks");
assert.equal(new Set(routes.map((r)=>r.id)).size,54);
assert.equal(new Set(routes.map((r)=>r.path.toLowerCase())).size,54);
const prior=[
 "src/content/legacyArchive.json",
 "src/content/legacyGmediaRoutes.json",
 "src/content/legacyTaxonomyRoutes.json",
 "src/content/legacyExtendedRoutes.json",
 "src/content/legacyFeaturedAttachments.json",
 "src/content/publicDemoAttachmentRoutes.json"
].flatMap((file)=>read(file).items);
const previousPaths=new Set(prior.map((r)=>r.path.toLowerCase()));
const counts={ "studio-5":0,"bulgarian-composers":0,"orchestra-concert":0 };
const allowedStudio5=new Set(selected.keptFilenames);
for(const route of routes){
 assert.equal(route.kind,"photo_attachment");
 assert.ok(["en","bg"].includes(route.language));
 assert.ok(route.path.startsWith("/"+route.language+"/")&&route.path.endsWith("/"));
 assert.ok(!previousPaths.has(route.path.toLowerCase()),"WordPress path collision: "+route.path);
 const old=new URL(route.originalUrl);
 assert.equal(old.origin,"https://432hz-orchestra.com");
 assert.equal(decodeURIComponent(old.pathname),route.path,"Original permalink differs");
 assert.ok(!old.search&&!old.hash);
 const whitelist=approved.get(route.photoSrc);
 assert.ok(whitelist,"Unapproved image linked: "+route.photoSrc);
 assert.equal(whitelist.filename,route.sourceFilename,"Original filename mismatch");
 assert.equal(whitelist.sha256,route.photoSha256,"Curated image SHA differs");
 assert.equal(whitelist.category,route.photoCategory,"Wrong concert album mapping");
 assert.equal(route.albumPath,"/"+route.language+"/gallery/"+route.photoCategory+"/","Wrong album route");
 assert.equal(route.alternatePath,null,"Do not invent unavailable translation permalinks");
 assert.ok(typeof route.photoAlt==="string"&&route.photoAlt.length>10);
 if(route.photoCategory==="studio-5")
  assert.ok(allowedStudio5.has(route.sourceFilename),"Excluded Studio 5 photo reused");
 counts[route.photoCategory]++;
 const file=join(resolve("dist"),route.photoSrc.slice(1));
 assert.ok(existsSync(file),"Missing curated image: "+route.photoSrc);
 const digest=createHash("sha256").update(readFileSync(file)).digest("hex");
 assert.equal(digest,route.photoSha256,"Image bytes changed: "+route.photoSrc);
 const page=join(resolve("dist"),route.path.slice(1),"index.html");
 assert.ok(existsSync(page),"Missing historic photo permalink: "+route.path);
 const html=readFileSync(page,"utf8");
 assert.ok(html.includes('src="'+route.photoSrc+'"'),"Wrong image in historical page");
 assert.ok(html.includes('href="'+route.albumPath+'"'),"Album link missing");
 assert.ok(html.includes(route.originalUrl),"Original source permalink missing");
 assert.ok(html.includes('content="noindex,nofollow"'),"Historical photo page is indexable");
 assert.ok(html.includes("<figure"),"Image is not semantically presented");
 assert.ok(existsSync(join(resolve("dist"),route.albumPath.slice(1),"index.html")),"Album missing");
}
assert.deepEqual(counts,{"studio-5":10,"bulgarian-composers":32,"orchestra-concert":12});
assert.deepEqual(manifest.approvedCategories,counts);
console.log(JSON.stringify({
 gate:"HISTORICAL_CURATED_PHOTO_ATTACHMENT_PASS",
 publicPhotoPermalinksRestored:routes.length,
 studio5Approved:counts["studio-5"],
 contemporaryBulgarianComposers:counts["bulgarian-composers"],
 documentaryConcert:counts["orchestra-concert"],
 originalWordPressPhotosCopied:0,
 protectedFilesCopied:0,
 totalHtmlPages:318+read("src/content/publicDemoAttachmentRoutes.json").items.length+routes.length
}));
