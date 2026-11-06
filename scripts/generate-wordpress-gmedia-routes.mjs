import {readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalPitch} from "./concert-pitch-standard.mjs";

// Read-only public WordPress XML sitemap snapshot and already verified Gmedia
// photographs. No plugins or private downloads are accessed by this generator.
const root=resolve(".");
const sitemap=JSON.parse(readFileSync(resolve(root,"docs/wordpress-all-sitemaps-audit-20261106.json"),"utf8"));
const gallery=JSON.parse(readFileSync(resolve(root,"src/content/legacyGallery.json"),"utf8"));
const existing=JSON.parse(readFileSync(resolve(root,"src/content/legacyArchive.json"),"utf8")).items;
const byImageSlug=new Map();
const albumForImage=new Map();
const images=[...gallery.albums.flatMap(a=>a.images),...gallery.unassigned];
const originalURLs=[];
for(const album of gallery.albums)
  for(const image of album.images) albumForImage.set(image.id,album.id);
for(const image of images){
 const slug=image.filename.toLowerCase().replace(/\.jpg$/,"-jpg");
 if(byImageSlug.has(slug))throw Error("DUPLICATE_IMAGE_SLUG "+slug);
 byImageSlug.set(slug,image);
}
if(byImageSlug.size!==56)throw Error("EXPECTED_56_PHOTOGRAPHS");
const albumsBySlug=new Map([
  ["concert-on-23-03-2016",{id:1,title:"Concert on 23.03.2016",bg:"Концерт в Студио 5 — архивен албум",imageCount:23}],
  ["contemporary-bulgaran-composers-in-432-hz",{id:6,title:"Contemporary Bulgaran Composers in 432 Hz",bg:"Български съвременници в 432 Hz",imageCount:32}],
  ["concert-148-years-bulgarian-academy-of-sciences",{id:null,title:"Concert 148 Years Bulgarian Academy of Sciences",bg:"Концерт „148 години БАН“",imageCount:0}]
]);
const sourcePairs=[
  ["gmedia",sitemap.sitemaps.gmedia.urls],
  ["gmedia_album",sitemap.sitemaps.gmedia_album.urls],
  ["gmedia_gallery",sitemap.sitemaps.gmedia_gallery.urls]
];
const items=[];
function item(raw,kind,title,options={}){
 const url=new URL(raw);
 if(url.origin!==sitemap.origin)throw Error("CROSS_ORIGIN_IN_SITEMAP");
 const path=decodeURIComponent(url.pathname);
 const language=path.startsWith("/bg/")?"bg":"en";
 const obj={
  id:null,kind,language,path,title:canonicalPitch(title),originalUrl:raw,date:null,eventDate:null,
  paragraphs:(options.paragraphs||[]).map(canonicalPitch),
  sourceLinks:[],thumbnail:null,relatedIds:[],
  inlineImages:options.photo?[options.photo.src]:[],
  audioEmbeds:[],bandcampUrl:null,dynamicWordPress:false,alternatePath:null,
  albumId:options.albumId??null,
  albumPath:options.albumPath??null,
  mediaSrc:options.photo?.src??null
 };
 if(existing.some(e=>e.path.toLowerCase()===obj.path.toLowerCase())||
    items.some(e=>e.path.toLowerCase()===obj.path.toLowerCase()))
    throw Error("DUPLICATE_ROUTE "+obj.path);
 items.push(obj);
 return obj;
}
const albums=Array.from(albumsBySlug.values());
for(const [kind,urls] of sourcePairs){
 for(const raw of urls){
  originalURLs.push(raw);
  const path=decodeURIComponent(new URL(raw).pathname);
  const slug=path.replace(/\/$/,"").split("/").at(-1);
  const bg=path.startsWith("/bg/");
  if(kind==="gmedia"){
    if(slug==="gmedia"){
      item(raw,"gmedia_index",bg?"Архив на фотографиите":"Gmedia Posts Archive",{
        paragraphs: bg?[
          "Оригиналната българска Gmedia страница няма публикувани отделни записи. Тук са представени запазените публични концертни фотографии от оригиналния архив."
        ]:[
          "Public concert photographs from the original WordPress Gmedia archive, preserved with their original albums."
        ]});
      continue;
    }
    const image=byImageSlug.get(slug);
    if(!image)throw Error("IMAGE_WITHOUT_SOURCE_FILE "+slug);
    const albumId=albumForImage.get(image.id)||null;
    const albumPath=albumId===1?"/en/blog/gmedia-album/concert-on-23-03-2016/":
      albumId===6?"/blog/gmedia-album/contemporary-bulgaran-composers-in-432-hz/":null;
    item(raw,"gmedia_photo",image.title,{photo:image,albumId,albumPath,
      paragraphs:[albumId===1?"Original photographic record from the concert archive in Studio 5, Sofia.":
                  albumId===6?"Original photograph from the orchestra archive of Bulgarian contemporaries.":
                  "Original standalone photograph from the WordPress gallery."]});
  }else if(kind==="gmedia_album"){
    if(slug==="gmedia-album"){
      item(raw,"gmedia_album_index",bg?"Албуми на оркестъра":"Gmedia Albums Archive",{
        paragraphs:[bg?"Публичните фотоалбуми на Камерен оркестър 432 от WordPress.":
          "The original publicly listed WordPress gallery albums."]});
      continue;
    }
    const record=albumsBySlug.get(slug);
    if(!record)throw Error("UNKNOWN_ALBUM "+slug);
    const pars=record.id===1?[
      "Original WordPress album title: Concert on 23.03.2016. Its date conflicts with the orchestra history, which records the concert at Studio 5 on 13 March 2016. The discrepancy in original metadata is retained for verification."
    ]:record.id===6?[
      "Photographs preserved from the original WordPress album. The album title is retained as published."
    ]:[
      "The album was publicly listed in WordPress, but contained no registered photographs in the recovered Gmedia album data. The album title is retained without inventing images."
    ];
    item(raw,"gmedia_album",record.title,{albumId:record.id,paragraphs:pars});
  }else if(kind==="gmedia_gallery"){
    item(raw,"gmedia_gallery","432 Chamber Orchestra Gallery",{
      paragraphs:["Original public Gmedia gallery, restored from the two populated albums and one unassigned photograph."]});
  }
 }
}
if(items.length!==64 || originalURLs.length!==64)throw Error("PUBLIC_GMEDIA_64_INVARIANT "+items.length);
const groups=Object.fromEntries([...new Set(items.map(x=>x.kind))].map(k=>[k,items.filter(x=>x.kind===k).length]));
if(groups.gmedia_photo!==56 || groups.gmedia_index!==2 || groups.gmedia_album!==3 ||
 groups.gmedia_album_index!==2 || groups.gmedia_gallery!==1)throw Error("UNEXPECTED_GMEDIA_GROUP_COUNTS "+JSON.stringify(groups));
for(const row of items.filter(x=>x.kind==="gmedia_photo")){
 if(!row.mediaSrc.startsWith("/legacy-gallery/"))throw Error("PHOTO_NOT_LOCAL");
}
const result={version:1,origin:sitemap.origin,galleryOriginalImageCount:56,groups,items};
writeFileSync(resolve(root,"src/content/legacyGmediaRoutes.json"),JSON.stringify(result,null,2)+"\n","utf8");
console.log(JSON.stringify({gate:"GMEDIA_64_PUBLIC_ROUTES_MIGRATED",total:items.length,groups,
  originalGalleryImages:56, populatedAlbums:2, zeroPhotoAlbums:1},null,2));
