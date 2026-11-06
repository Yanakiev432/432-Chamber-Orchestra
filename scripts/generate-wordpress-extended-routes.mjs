import {readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalPitch} from "./concert-pitch-standard.mjs";

const read = (p) => JSON.parse(readFileSync(resolve(p),"utf8"));
const evidence=read("docs/wordpress-public-extra-linked-pages-20261106.json");
const existing=[
 ...read("src/content/legacyArchive.json").items,
 ...read("src/content/legacyGmediaRoutes.json").items,
 ...read("src/content/legacyTaxonomyRoutes.json").items
];
const known=new Map(existing.map(x=>[x.path.toLowerCase(),x]));
if(evidence.items.length!==63 || evidence.success!==63)throw Error("PUBLIC_SOURCE_LINK_SNAPSHOT_CHANGED");
const restricted="/en/my-account/lost-password/";
const posterAttachment="/en/афиш-чайната-fw/";
const chosen=evidence.items.filter(x=>x.path!==restricted && x.path!==posterAttachment);
if(chosen.length!==61)throw Error("EXTENDED_PUBLIC_ROUTE_COUNT_CHANGED "+chosen.length);
const sourcePaths=new Set(chosen.map(x=>x.path.toLowerCase()));
if(sourcePaths.size!==61)throw Error("EXTENDED_DUPLICATE_URL");
const items=[];
const mapURL=(p)=>known.get(p.toLowerCase());
for(const source of chosen){
 const {path,originalUrl,status,finalPath,mainLinks}=source;
 if(status!==200 || finalPath!==path)throw Error("NONCANONICAL_SOURCE_URL "+path);
 if(!path.startsWith("/bg/")&&!path.startsWith("/en/")&&!path.startsWith("/blog/"))throw Error("UNEXPECTED_URL_ROOT");
 if(path.includes("..") || path.includes("?") || path.includes("#"))throw Error("UNSAFE_PATH "+path);
 if(known.has(path.toLowerCase()))throw Error("ARCHIVE_URL_COLLISION "+path);
 const bg=path.startsWith("/bg/");
 const pageNum=Number(path.match(/\/page\/(\d+)\/$/)?.[1] || 1);
 const basePath=pageNum>1?path.replace(/page\/\d+\/$/,""):path;
 const photoArchive=/\/gmedia(?:-|\/|$)/.test(path);
 const musicArchive=/\/(?:shop|product-category|product-tag)\//.test(path);
 const imageArchive=/\/(?:type\/image|gmedia)/.test(path);
 const heading=(source.heading || "").trim();
 const fromTitle=(source.pageTitle || "").split(" • ")[0].trim();
 const originalTitle=heading && !/нищо не е намерено|nothing found/i.test(heading) ? heading : fromTitle;
 const publicBase = photoArchive
   ? (bg ? "Концертни фотографии" : "Concert photographs")
   : musicArchive
     ? (bg ? "Музикални записи" : "Music and recordings")
     : /\/type\/audio\//.test(path)
       ? (bg ? "Аудиозаписи" : "Audio recordings")
       : /\/type\/video\//.test(path)
         ? (bg ? "Видеозаписи" : "Video recordings")
         : /\/type\/image\//.test(path)
           ? (bg ? "Фотографии" : "Photographs")
           : originalTitle;
 const displayName=publicBase || (bg ? "Из архива" : "From the archive");
 const title=canonicalPitch(pageNum>1?displayName+(bg?" · страница ":" · page ")+pageNum:displayName);
 const resolvedLinks=(mainLinks||[]).map(mapURL).filter(Boolean);
 const listingLinks=[...new Map(resolvedLinks.map(x=>[x.path,x])).values()]
     .filter(x=>["gmedia_photo","post","product","event","page","gmedia_album"].includes(x.kind))
     .map(x=>({path:x.path,title:x.title,thumbnail:x.mediaSrc||x.thumbnail||null,kind:x.kind}));
 const siblingPaths=chosen.filter(x=>x.path===basePath || x.path.startsWith(basePath+"page/"))
    .map(x=>x.path);
 if(known.has(basePath.toLowerCase()))siblingPaths.push(basePath);
 const paginationLinks=[...new Set(siblingPaths)].sort((a,b)=>{
  const n=(p)=>Number(p.match(/\/page\/(\d+)\/$/)?.[1]||1);
  return n(a)-n(b);
 }).map(x=>({path:x,page:Number(x.match(/\/page\/(\d+)\/$/)?.[1]||1)}));
 const count=listingLinks.length;
 const note=count===0
    ? (bg ? "В тази колекция няма публикувани материали." : "There are no published items in this collection.")
    : photoArchive
      ? (bg ? "Фотографии от концерти на Камерен оркестър 432." : "Photographs from concerts by 432 Chamber Orchestra.")
      : musicArchive
        ? (bg ? "Музика от репертоара на Камерен оркестър 432." : "Music from the repertoire of 432 Chamber Orchestra.")
        : (bg ? "Публикации и материали, посветени на оркестъра и неговата музика." : "Articles and materials on the orchestra and its music.");
 const item={
  id:null,kind:"archive_collection",language:bg?"bg":"en",path,title,
  originalUrl,date:null,eventDate:null,
  paragraphs:[note],sourceLinks:[],
  thumbnail:null,relatedIds:[],inlineImages:[],audioEmbeds:[],
  bandcampUrl:null,dynamicWordPress:false,alternatePath:null,
  archivePage:pageNum,archiveOriginalHeading:source.heading,
  archiveOriginalTitle:source.pageTitle,archiveArticlesCount:source.articleCount,
  listingLinks,paginationLinks,
  metadataOnly:false
 };
 items.push(item);
}
const pages=items.filter(x=>x.archivePage>1);
const containedPhotos=items.reduce((acc,x)=>acc+x.listingLinks.filter(y=>y.kind==="gmedia_photo").length,0);
const containedProducts=items.reduce((acc,x)=>acc+x.listingLinks.filter(y=>y.kind==="product").length,0);
if(pages.length!==45)throw Error("PAGINATION_45_CHANGED "+pages.length);
if(containedPhotos!==284 || containedProducts!==89)throw Error("STUDIO5_CURATED_COLLECTION_COUNTS_CHANGED "+JSON.stringify({containedPhotos,containedProducts}));
const result={version:1,origin:evidence.origin,sourceVerification:"63 public routes HTTP200; restricted WordPress account workflow and public attachment handled separately",items};
writeFileSync(resolve("src/content/legacyExtendedRoutes.json"),JSON.stringify(result,null,2)+"\n","utf8");
console.log(JSON.stringify({gate:"VERIFIED_61_WORDPRESS_PUBLIC_ARCHIVES_IMPORTED",routes:items.length,
 paginationPages:pages.length,photoPageLinks:containedPhotos,productPageLinks:containedProducts,
 emptyPublicArchives:items.filter(x=>x.listingLinks.length===0).length},null,2));
