import {mkdirSync,readFileSync,writeFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
const source=JSON.parse(readFileSync("docs/wordpress-gmedia-source-20261106.json","utf8"));
if(source.images.length!==56||source.relations.length!==55)throw new Error("GMEDIA_SOURCE_MISMATCH");
const folder=resolve("public/legacy-gallery");mkdirSync(folder,{recursive:true});
const stored=[];const errors=[];
for(const img of source.images) {
  const filename=String(img.gmuid);
  if(!/^[A-Za-z0-9._-]+\.jpg$/i.test(filename)||filename.includes(".."))throw new Error("BAD_GMEDIA_NAME_"+filename);
  const remote="https://432hz-orchestra.com/wp-content/grand-media/image/"+filename;
  const local=resolve(folder,filename);
  try {
    let data;
    if(existsSync(local))data=readFileSync(local);
    else {
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
      try{
        const r=await fetch(remote,{signal:controller.signal,headers:{"User-Agent":"432-Chamber-Orchestra-Archive-Migration/1.0"}});
        if(!r.ok||!String(r.headers.get("content-type")).startsWith("image/"))throw new Error("REMOTE_NOT_IMAGE_"+r.status);
        data=Buffer.from(await r.arrayBuffer());
      } finally{clearTimeout(timer);}
      if(data.length<150||data.length>8000000||data[0]!==0xff||data[1]!==0xd8)throw new Error("JPEG_BAD");
      writeFileSync(local,data,{flag:"wx"});
    }
    const albumIds=source.relations.filter((r)=>Number(r.gmedia_id)===Number(img.ID)).map((r)=>Number(r.gmedia_term_id));
    stored.push({id:Number(img.ID),title:img.title,filename,src:"/legacy-gallery/"+filename,bytes:data.length,
      sha256:createHash("sha256").update(data).digest("hex"),albumIds});
    console.log("GALLERY_OK "+img.ID+" "+data.length+" "+filename);
  }catch(error){errors.push({id:img.ID,error:String(error.message||error)});console.error("GALLERY_FAIL "+img.ID+" "+error);}
}
writeFileSync("docs/wordpress-gmedia-media-inventory-20261106.json",JSON.stringify({capturedUtc:source.capturedUtc,images:stored,errors},null,2)+"\n");
if(errors.length||stored.length!==56)throw new Error("GMEDIA_INCOMPLETE "+errors.length);
const albumIds=new Set([1,6]);
const albums=source.albums.filter((a)=>albumIds.has(Number(a.term_id))).map((album)=>({
  id:Number(album.term_id),name:album.name,description:album.description,
  images:stored.filter((img)=>img.albumIds.includes(Number(album.term_id)))
}));
if(albums.length!==2||albums[0].images.length!==23||albums[1].images.length!==32)throw new Error("ALBUM_PARITY_FAILED");
writeFileSync("src/content/legacyGallery.json",JSON.stringify({version:1,albums,unassigned:stored.filter((x)=>!x.albumIds.length)},null,2)+"\n");
console.log("GMEDIA_IMPORT_PASS: "+stored.length+" images; albums="+albums.map((a)=>a.images.length).join("+")+"; bytes="+stored.reduce((n,r)=>n+r.bytes,0));
