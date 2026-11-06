import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import { createHash } from "node:crypto";
const source = JSON.parse(readFileSync("docs/wordpress-public-source-20261106.json","utf8"));
const archivePath = "src/content/legacyArchive.json";
const archive = JSON.parse(readFileSync(archivePath, "utf8"));
const folder = resolve("public/legacy-media");
mkdirSync(folder, {recursive:true});
const entries = [];
const failures = [];
const blobByUrl = new Map();
const images = source.publicAttachments.filter((i)=>/^image\/(?:jpeg|png|webp|gif)$/i.test(i.post_mime_type) && new URL(i.guid).pathname.startsWith("/wp-content/uploads/"));
console.log("SOURCE_IMAGES="+images.length);
for (const attachment of images) {
  const original = new URL(attachment.guid);
  original.protocol = "https:";
  const url = original.href;
  const ext = basename(original.pathname).split(".").pop().toLowerCase();
  if (!["jpg","jpeg","png","webp","gif"].includes(ext)) {failures.push({id:attachment.ID,error:"BAD_EXT"});continue;}
  const filename = "wp-"+Number(attachment.ID)+"."+ext;
  const path = resolve(folder,filename);
  try {
    let buffer;
    if (existsSync(path)) buffer = readFileSync(path);
    else {
      const controller = new AbortController();
      const timer = setTimeout(()=>controller.abort(),20000);
      try {
        const response = await fetch(url,{signal:controller.signal,headers:{"User-Agent":"432-Chamber-Orchestra-Archive-Migration/1.0"}});
        if(!response.ok || !(response.headers.get("content-type")||"").startsWith("image/")) throw new Error("HTTP_STATUS_OR_CONTENT_TYPE_"+response.status);
        if(Number(response.headers.get("content-length")||0)>15000000) throw new Error("TOO_LARGE");
        buffer = Buffer.from(await response.arrayBuffer());
      } finally {clearTimeout(timer);}
      if(buffer.length<150 || buffer.length>15000000)throw new Error("INVALID_SIZE_"+buffer.length);
      const jpg=buffer[0]===0xff&&buffer[1]===0xd8;const png=buffer.subarray(0,4).equals(Buffer.from([137,80,78,71]));const gif=buffer.subarray(0,3).toString()==="GIF";const webp=buffer.subarray(8,12).toString()==="WEBP";
      if(!jpg&&!png&&!gif&&!webp)throw new Error("NOT_VALID_IMAGE_SIGNATURE");
      writeFileSync(path,buffer,{flag:"wx"});
    }
    const sha256=createHash("sha256").update(buffer).digest("hex");
    entries.push({id:Number(attachment.ID),url,local:"/legacy-media/"+filename,size:buffer.length,sha256});
    blobByUrl.set(url, "/legacy-media/"+filename);
    console.log("IMAGE_OK "+attachment.ID+" "+buffer.length+" "+filename);
  } catch(error){failures.push({id:attachment.ID,error:String(error.message||error)});console.error("IMAGE_FAIL "+attachment.ID+" "+String(error));}
}
for(const item of archive.items)if(item.thumbnail && blobByUrl.has(item.thumbnail))item.thumbnail=blobByUrl.get(item.thumbnail);
writeFileSync("docs/wordpress-public-media-inventory-20261106.json",JSON.stringify({origin:source.sourceOrigin,images:entries,failures},null,2)+"\n");
if(failures.length || entries.length!==images.length)throw new Error("WORDPRESS_MEDIA_INCOMPLETE_"+failures.length);
writeFileSync(archivePath,JSON.stringify(archive,null,2)+"\n");
console.log("MEDIA_IMPORT_PASS "+entries.length+" images "+entries.reduce((n,r)=>n+r.size,0)+" bytes");
