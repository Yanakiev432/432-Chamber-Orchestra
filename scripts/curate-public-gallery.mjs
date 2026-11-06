import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { resolve, join } from "node:path";

// Keep the original 56 gallery files in public/ and the WordPress backup.
// The generated preview must contain only the ten approved Studio 5 images.
const archive=JSON.parse(readFileSync(resolve("src/content/legacyGallery.json"),"utf8"));
const selection=JSON.parse(readFileSync(resolve("src/content/studio5PhotoSelection.json"),"utf8"));
const album=archive.albums.find(a=>a.id===selection.albumId);
assert.ok(album);
assert.equal(album.images.length,selection.sourceImageCount);
assert.deepEqual(selection.keptPositions,[2,5,11,14,16,17,18,20,21,23]);
const approved=selection.keptPositions.map((position,i)=>{
 const photo=album.images[position-1];
 assert.equal(photo.filename,selection.keptFilenames[i],"Studio 5 order changed");
 return photo;
});
assert.equal(new Set(approved.map(x=>x.id)).size,10);
const approvedIds=new Set(approved.map(x=>x.id));
const rejected=album.images.filter(x=>!approvedIds.has(x.id));
assert.equal(rejected.length,13);
const generatedGallery=resolve("dist/legacy-gallery");
const sourceGallery=resolve("public/legacy-gallery");
assert.ok(existsSync(generatedGallery));
const allFiles=[...archive.albums.flatMap(x=>x.images),...archive.unassigned];
assert.equal(allFiles.length,56);
for(const photo of allFiles){
 assert.ok(existsSync(join(sourceGallery,photo.filename)),"Original is missing: "+photo.filename);
 const dest=join(generatedGallery,photo.filename);
 if(rejected.some(x=>x.id===photo.id)){
  if(existsSync(dest))unlinkSync(dest);
  assert.ok(!existsSync(dest),"Rejected image copied into preview: "+dest);
  const url="/en/blog/gmedia/"+photo.filename.replace(/\.jpg$/i,"-jpg").toLowerCase()+"/";
  assert.ok(!existsSync(resolve("dist",url.slice(1),"index.html")),"Rejected single-photo page still generated: "+url);
 }else{
  assert.ok(existsSync(dest),"Approved or unrelated image is missing: "+photo.filename);
 }
}
assert.equal(readdirSync(generatedGallery).filter(x=>x.toLowerCase().endsWith(".jpg")).length,43);
console.log(JSON.stringify({gate:"STUDIO5_EDITORIAL_CURATION_PASS",sourceStudio5Photos:23,keptPositions:selection.keptPositions,publicStudio5Photos:10,excludedStudio5Photos:13,publicGalleryPhotosTotal:43}));
