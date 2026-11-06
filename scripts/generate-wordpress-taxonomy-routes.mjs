import {readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {canonicalPitch} from "./concert-pitch-standard.mjs";

const read=(p)=>JSON.parse(readFileSync(resolve(p),"utf8"));
const sitemap=read("docs/wordpress-all-sitemaps-audit-20261106.json");
const terms=read("docs/wordpress-taxonomy-terms-public-20261106.json");
const original=read("src/content/legacyArchive.json").items;
const gmedia=read("src/content/legacyGmediaRoutes.json").items;
const missing=read("docs/wordpress-sitemap-vs-astro-parity-20261106.json").missing;
const sourceKinds=["category","post_tag","post_format","product_cat","product_tag","tribe_events_cat"];
const filtered=missing.filter(x=>sourceKinds.includes(x.kind));
if(filtered.length!==26)throw Error("TAXONOMY_SOURCE_COUNT_CHANGED "+filtered.length);
const allPaths=new Set([...original,...gmedia].map(x=>x.path.toLowerCase()));
const activeObjects=new Map(original.filter(x=>["post","product","event"].includes(x.kind)).map(x=>[x.id,x]));
const termsFor=(kind,slug)=>terms.terms.filter(t=>t.taxonomy===kind&&decodeURIComponent(t.slug).toLowerCase()===slug.toLowerCase());
const items=[];
for(const s of filtered){
 const path=decodeURIComponent(new URL(s.url).pathname);
 const slug=path.replace(/\/$/,"").split("/").at(-1);
 const termSlug=s.kind==="post_format"?"post-format-"+slug:slug;
 const matches=termsFor(s.kind,termSlug);
 if(matches.length!==1)throw Error("UNIQUE_PUBLIC_TERM_NOT_FOUND "+s.kind+" "+path+" matches="+matches.length);
 const t=matches[0];
 const id=Number(t.term_id);
 const termTaxonomy=Number(t.term_taxonomy_id);
 const links=terms.relationships.filter(x=>Number(x.term_taxonomy_id)===termTaxonomy)
     .map(x=>Number(x.object_id)).filter(x=>activeObjects.has(x));
 const visible=Array.from(new Set(links));
 const bg=path.startsWith("/bg/");
 if(allPaths.has(path.toLowerCase()))throw Error("TAXONOMY_PATH_COLLISION "+path);
 const description=t.description?String(t.description).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim():"";
 const title=s.kind==="post_format"?({audio:bg?"Аудио публикации":"Audio posts",image:bg?"Снимкови публикации":"Image posts",video:bg?"Видеопубликации":"Video posts"})[slug]:t.name;
 const item={
  id,kind:"taxonomy",language:bg?"bg":"en",path,title:canonicalPitch(title),
  originalUrl:s.url,date:null,eventDate:null,
  paragraphs:description?[canonicalPitch(description)]:[],
  sourceLinks:[],thumbnail:null,relatedIds:visible,
  inlineImages:[],audioEmbeds:[],bandcampUrl:null,dynamicWordPress:false,
  alternatePath:null,albumId:null,albumPath:null,mediaSrc:null,
  taxonomy:s.kind,registeredCount:Number(t.count),parentTermId:Number(t.parent)
 };
 allPaths.add(path.toLowerCase());
 items.push(item);
}
if(items.length!==26 || new Set(items.map(x=>x.path.toLowerCase())).size!==26)
 throw Error("TAXONOMY_26_INVARIANT_FAILED");
const groups=Object.fromEntries(sourceKinds.map(kind=>[kind,items.filter(x=>x.taxonomy===kind).length]));
if(JSON.stringify(groups)!==JSON.stringify({category:6,post_tag:3,post_format:3,product_cat:3,product_tag:9,tribe_events_cat:2}))
 throw Error("TAXONOMY_BREAKDOWN_CHANGED "+JSON.stringify(groups));
const dest="src/content/legacyTaxonomyRoutes.json";
writeFileSync(resolve(dest),JSON.stringify({version:1,originalWordPressSource:"public sitemaps + published records only",groups,items},null,2)+"\n");
console.log(JSON.stringify({gate:"WORDPRESS_PUBLIC_26_TAXONOMY_ROUTES_RESTORED",items:items.length,groups,
  withPublishedRelatedItems:items.filter(x=>x.relatedIds.length).length,
  totalPublishedRelatedReferences:items.reduce((sum,x)=>sum+x.relatedIds.length,0)},null,2));
