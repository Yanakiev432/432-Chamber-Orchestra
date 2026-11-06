import {readFileSync,writeFileSync,statSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import {canonicalPitch} from "./concert-pitch-standard.mjs";

// The six media attachment permalinks in the public WordPress sitemap.
// Source names, paths and hashes were verified read-only against the legacy host.
// These files are NOT in the protected WooCommerce download manifest.
const sitemap=JSON.parse(readFileSync("docs/wordpress-all-sitemaps-audit-20261106.json","utf8"));
const urls=sitemap.sitemaps.attachment.urls;
if(urls.length!==6)throw Error("SITEMAP_ATTACHMENT_COUNT_CHANGED");
const definitions=[
 {id:254,slug:"01-liszt-liebestraume-440et",kind:"audio_attachment",
  title:"Franz Liszt — Liebesträume · a¹ = 440 Hz (ET)",
  paragraph:"Historic audio recording of Liebesträume, labelled a¹ = 440 Hz (ET).",
  src:"/legacy-samples/liszt-liebestraume-440-et.wav",mime:"audio/wav",
  sha256:"82c6a5f48a4d1980efeecd980ce0409f555f7ba1106ba3e4d6bcba977d5e1aa2",
  bytes:39366700,parentPath:"/en/about/432-hz-concert-pitch/"},
 {id:264,slug:"liebestraume-3",kind:"audio_attachment",
  title:"Franz Liszt — Liebesträume · a¹ = 432 Hz (OFT)",
  paragraph:"Historic audio recording of Liebesträume, labelled a¹ = 432 Hz (OFT).",
  src:"/legacy-samples/liszt-liebestraume-432-oft.mp3",mime:"audio/mpeg",
  sha256:"c28722b4c9168e7c0a80dd7b2acbf43626ed0707ea23c5463f2dda8d3c26b97c",
  bytes:8918969,parentPath:"/en/about/432-hz-concert-pitch/"},
 {id:263,slug:"liebestraume-2",kind:"audio_attachment",
  title:"Franz Liszt — Liebesträume · a¹ = 432 Hz (ET)",
  paragraph:"Historic audio recording of Liebesträume, labelled a¹ = 432 Hz (ET).",
  src:"/legacy-samples/liszt-liebestraume-432-et.mp3",mime:"audio/mpeg",
  sha256:"b6c896c4b1d385e09e0f3a3d9a1b1dfd63b7b410596bb4726673507945b7323b",
  bytes:8918969,parentPath:"/en/about/432-hz-concert-pitch/"},
 {id:262,slug:"liebestraume",kind:"audio_attachment",
  title:"Franz Liszt — Liebesträume · a¹ = 440 Hz (ET)",
  paragraph:"Historic audio recording of Liebesträume, labelled a¹ = 440 Hz (ET).",
  src:"/legacy-samples/liszt-liebestraume-440-et.mp3",mime:"audio/mpeg",
  sha256:"7466734ab5d05d4cb9fc667472c726d426761930a4c461858fa09d7d4b549824",
  bytes:8918969,parentPath:"/en/about/432-hz-concert-pitch/"},
 {id:319,slug:"афиш-чайната-fw-2",kind:"image_attachment",
  title:"Афиш — концерт на квартет от Камерен оркестър 432",
  paragraph:"Афиш на квартетния концерт на Камерен оркестър 432.",
  src:"/legacy-media/wp-event-fw.png",mime:"image/png",
  sha256:"8378bd754641ba703be1be6e8769cb67ade2a1549a88ca3efde06dcf37b92beb",
  bytes:69078,parentPath:"/bg/event/концерт-на-квартет-от-камерен-оркестъ/"},
 {id:404,slug:"9629673-orig_2_orig1",kind:"image_attachment",
  title:"Archive graphic",
  paragraph:"Graphic preserved from the orchestra's original homepage.",
  src:"/legacy-media/wp-homepage-9629673.png",mime:"image/png",
  sha256:"5c9072361a280441a2c050a3136c46b8b1ac6f1b1c47419edb86d0e935474c04",
  bytes:7543,parentPath:"/en/"}
];
const existing=[...JSON.parse(readFileSync("src/content/legacyArchive.json","utf8")).items,
...JSON.parse(readFileSync("src/content/legacyGmediaRoutes.json","utf8")).items,
...JSON.parse(readFileSync("src/content/legacyTaxonomyRoutes.json","utf8")).items,
...JSON.parse(readFileSync("src/content/legacyExtendedRoutes.json","utf8")).items];
const known=new Set(existing.map(x=>x.path.toLowerCase()));
const items=urls.map((raw,i)=>{
 const cfg=definitions[i];
 const url=new URL(raw);
 if(url.origin!==sitemap.origin)throw Error("ORIGIN_MISMATCH");
 const path=decodeURIComponent(url.pathname);
 const slug=path.split("/").filter(Boolean).at(-1);
 if(slug!==cfg.slug)throw Error("PUBLIC_ATTACHMENT_SOURCE_DRIFT "+slug+" != "+cfg.slug);
 if(known.has(path.toLowerCase()))throw Error("ATTACHMENT_ROUTE_COLLIDES "+path);
 const file=resolve("public"+cfg.src);
 if(statSync(file).size!==cfg.bytes)throw Error("SOURCE_AUDIO_BYTES_MISMATCH "+cfg.src);
 if(createHash("sha256").update(readFileSync(file)).digest("hex")!==cfg.sha256)
  throw Error("SOURCE_AUDIO_HASH_MISMATCH "+cfg.src);
 return {
  id:cfg.id,kind:cfg.kind,language:path.startsWith("/bg/")?"bg":"en",
  path,title:canonicalPitch(cfg.title),originalUrl:raw,
  date:null,eventDate:null,
  paragraphs:[canonicalPitch(cfg.paragraph)],
  sourceLinks:[],thumbnail:null,relatedIds:[],
  inlineImages:cfg.kind==="image_attachment"?[cfg.src]:[],
  audioEmbeds:[],bandcampUrl:null,dynamicWordPress:false,alternatePath:null,
  mediaSrc:cfg.src,mediaMime:cfg.mime,mediaSha256:cfg.sha256,
  mediaBytes:cfg.bytes,parentPath:cfg.parentPath
 };
});
if(items.length!==6||new Set(items.map(x=>x.path.toLowerCase())).size!==6)
 throw Error("SIX_PUBLIC_ATTACHMENT_ROUTES_INVARIANT_FAILED");
writeFileSync("src/content/legacyFeaturedAttachments.json",JSON.stringify({
 version:1,origin:sitemap.origin,mediaOrigin:"public legacy WordPress attachments (not paid WooCommerce)",items
},null,2)+"\n");
console.log(JSON.stringify({gate:"SIX_VERIFIED_LEGACY_MEDIA_PAGES_GENERATED",
 routes:items.length,audioPages:items.filter(x=>x.kind==="audio_attachment").length,
 imagePages:items.filter(x=>x.kind==="image_attachment").length,
 audioBytes:items.filter(x=>x.kind==="audio_attachment").reduce((n,x)=>n+x.mediaBytes,0)},null,2));
