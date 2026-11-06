import assert from "node:assert/strict";
import {existsSync,readFileSync,readdirSync,statSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve,join} from "node:path";
const read=(p)=>JSON.parse(readFileSync(p,"utf8"));
const source=read("docs/wordpress-public-source-20261106.json");
const manifest=read("docs/legacy-wordpress-published-routes-20261105.json");
const addon=read("docs/wordpress-public-events-addendum-20261106.json");
const imported=read("src/content/legacyArchive.json").items;
const gallery=read("src/content/legacyGallery.json");
const videos=read("src/content/legacyVideos.json");
const productAssets=read("docs/wordpress-public-media-inventory-20261106.json");
const galleryAssets=read("docs/wordpress-gmedia-media-inventory-20261106.json");
const root=resolve("dist");
assert.equal(source.posts.length,94);
assert.equal(source.terms.length,29);
assert.equal(manifest.routes.length,123);
assert.equal(addon.routes.length,23);
assert.equal(addon.events.length,2);
assert.equal(addon.categories.length,13);
assert.equal(imported.length,144);
assert.equal(new Set(imported.map((r)=>r.path.toLowerCase())).size,144);
assert.deepEqual(Object.fromEntries(["page","post","product","taxonomy","event","event_category","event_view"].map((k)=>[k,imported.filter((r)=>r.kind===k).length])),
  {page:33,post:13,product:46,taxonomy:29,event:2,event_category:13,event_view:8});
assert.equal(imported.filter((x)=>x.kind==="product"&&x.bandcampUrl?.startsWith("https://432orchestra.bandcamp.com/")).length,46);
assert.equal(imported.filter((x)=>x.dynamicWordPress).length,9);
const audioEmbeds=imported.flatMap((x)=>x.audioEmbeds || []);
assert.equal(audioEmbeds.length,10,"Expected ten historical audio player embeds");
assert.equal(audioEmbeds.filter((x)=>x.service==="bandcamp").length,8);
assert.equal(audioEmbeds.filter((x)=>x.service==="soundcloud").length,2);
assert.equal(imported.filter((x)=>x.kind==="event" && x.eventDate==="2016-12-27").length,2);
assert.equal(gallery.albums.length,2);
assert.deepEqual(gallery.albums.map((a)=>a.images.length),[23,32]);
assert.equal(gallery.unassigned.length,1);
assert.equal(videos.items.length,5);
assert.equal(productAssets.images.length,32);
assert.equal(galleryAssets.images.length,56);
assert.equal(productAssets.failures.length,0);
assert.equal(galleryAssets.errors.length,0);
for(const a of [...productAssets.images,...galleryAssets.images]){
 const assetPath = a.local ?? ("/legacy-gallery/" + a.filename);
 const file=join(root,assetPath.slice(1));
 assert.ok(existsSync(file),"Missing imported media "+a.local);
 const raw=readFileSync(file);
 assert.equal(raw.length,a.size ?? a.bytes,"Wrong image size "+a.local);
 assert.equal(createHash("sha256").update(raw).digest("hex"),a.sha256,"Wrong image SHA "+a.local);
}
const eventImage=join(root,"legacy-media","wp-event-fw.png");
assert.ok(existsSync(eventImage),"Missing recovered event photograph");
assert.equal(createHash("sha256").update(readFileSync(eventImage)).digest("hex"),"8378bd754641ba703be1be6e8769cb67ade2a1549a88ca3efde06dcf37b92beb");
let hit=0;
for(const rec of [...manifest.routes,...addon.routes]){
 const path=decodeURIComponent(new URL(rec.url).pathname);
 const relative=path.slice(1)+"index.html";
 const file=join(root,relative);
 assert.ok(existsSync(file) && statSync(file).isFile(),"LEGACY_ADDRESS_MISSING "+path);
 const html=readFileSync(file,"utf8");
 assert.ok(html.includes("<h1") || ["/bg/","/en/"].includes(path),"No page heading "+path);
 if(process.env.PUBLIC_PREVIEW_MODE==="true")
  assert.ok(html.includes('content="noindex,nofollow"'),"No noindex "+path);
 hit++;
}
const allPages=(function walk(path){return readdirSync(path,{withFileTypes:true}).flatMap((e)=>e.isDirectory()?walk(join(path,e.name)):(e.name==="index.html"?[join(path,e.name)]:[]));})(root);
assert.equal(allPages.length,165,"Expected 21 native and 144 legacy routes");
console.log(JSON.stringify({gate:"FULL_LEGACY_PUBLIC_ROUTE_PARITY_PASS",historicalRoutesVerified:hit,
  allStaticPages:allPages.length,sourcePosts:source.posts.length,archivePages:imported.length,
  originalGalleryImages:galleryAssets.images.length,productImages:productAssets.images.length,
  originalVideoReferences:videos.items.length,historicAudioEmbeds:audioEmbeds.length,bandcampMappedProducts:46,
  sensitiveWordPressFunctionalRoutesRetainedExternally:9,
  caveat:"Static parity does not replace WordPress order and account backend; production cutover remains blocked"},null,2));
