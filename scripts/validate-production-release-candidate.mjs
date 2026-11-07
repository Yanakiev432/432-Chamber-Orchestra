import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, extname, sep } from "node:path";

const expectedOrigin="https://432hz-orchestra.com";
assert.equal(process.env.PUBLIC_SITE_URL?.replace(/\/$/,""),expectedOrigin,
  "Production artifacts require the exact main-domain origin");
assert.equal(process.env.PUBLIC_PREVIEW_MODE,"false",
  "Production artifacts must explicitly disable preview mode");
const root=resolve("dist");
assert.ok(existsSync(root),"Build Astro before production validation");
const withholding=new Set([
 ".htaccess",
 "brand/source/README.txt",
 "brand/foundation/source/432_hertz_foundation_brand_assets_v2/README.md",
 "brand/foundation/source/432_hertz_foundation_brand_assets_v2/docs/naming_rules.md",
 "brand/foundation/source/432_hertz_foundation_brand_assets_v2/web/FoundationLogo.astro"
]);
const permittedExts=new Set([".html",".css",".jpg",".png",".svg",".mp3",".wav"]);
const files=[];
function collect(folder) {
 for(const item of readdirSync(folder,{withFileTypes:true})){
  const f=join(folder,item.name);
  if(item.isDirectory())collect(f);
  else if(item.isFile())files.push(f);
  else throw new Error("Generated artifact contains a nonregular file");
 }
}
collect(root);
const rel=(p)=>relative(root,p).split(sep).join("/");
assert.equal(files.length,623,"Source/output inventory changed: review every new file");
const included=[],withheld=[];
for(const f of files){
 const name=rel(f), ext=extname(name).toLowerCase();
 if(withholding.has(name)){withheld.push(name);continue;}
 if(permittedExts.has(ext)||name==="robots.txt"||name==="sitemap.xml")included.push(f);
 else throw new Error("Unexpected non-allowlisted public artifact: "+name);
}
assert.equal(withheld.length,5,"Five source/config files must be withheld");
assert.equal(included.length,618,"Static production package allowlist count drift");
const tracks=JSON.parse(readFileSync("src/content/publicAudioExcerpts.json","utf8")).tracks;
const historic=JSON.parse(readFileSync("src/content/legacyFeaturedAttachments.json","utf8")).items
 .filter((row)=>row.kind==="audio_attachment");
assert.equal(tracks.length,11);
assert.equal(historic.length,4);
const media=new Map();
for(const a of tracks)media.set(a.src.slice(1),{bytes:a.sizeBytes,sha256:a.sha256});
for(const a of historic){
 assert.ok(!media.has(a.mediaSrc.slice(1)),"Duplicate approved historic source");
 media.set(a.mediaSrc.slice(1),{bytes:a.mediaBytes,sha256:a.mediaSha256});
}
assert.equal(media.size,15);
let audio=0;
for(const f of included){
 const name=rel(f);
 if(![".mp3",".wav"].includes(extname(name).toLowerCase()))continue;
 const row=media.get(name);
 assert.ok(row,"A previously unreviewed audio file entered production assets: "+name);
 audio++;
 assert.equal(statSync(f).size,row.bytes,"Audio size changed");
 assert.equal(createHash("sha256").update(readFileSync(f)).digest("hex"),row.sha256,
   "Approved public audio hash changed");
}
assert.equal(audio,15,"Public audio whitelist no longer matches generated files");
const html=included.filter((f)=>f.endsWith("index.html"));
assert.equal(html.length,394);
let notices=0,noindex=0;
for(const file of html){
 const name=rel(file), route=name==="index.html"?"/":"/"+name.slice(0,-"index.html".length);
 const data=readFileSync(file,"utf8");
 const match=data.match(/<link rel="canonical" href="([^"]+)"/);
 assert.ok(match,"Missing HTML canonical: "+route);
 assert.equal(new URL(match[1]).href,new URL(route,expectedOrigin).href,"Wrong canonical in production HTML: "+route);
 assert.ok(!data.includes("https://preview.432hz-orchestra.com"),"Preview origin in production output");
 const retired=data.includes('data-legacy-store-retired="true"');
 const unindexed=data.includes('<meta name="robots" content="noindex,nofollow"');
 assert.equal(unindexed,retired,"Only retired WooCommerce routes may be excluded from indexing");
 notices+=Number(retired);
 noindex+=Number(unindexed);
}
assert.equal(notices,9);
assert.equal(noindex,9);
const robots=readFileSync(join(root,"robots.txt"),"utf8");
assert.ok(robots.includes("User-agent: *")&&robots.includes("Allow: /"));
assert.ok(!robots.includes("Disallow: /"));
assert.ok(robots.includes("Sitemap: "+expectedOrigin+"/sitemap.xml"));
const sitemap=readFileSync(join(root,"sitemap.xml"),"utf8");
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m)=>m[1]);
assert.equal(urls.length,385);
assert.ok(urls.every((u)=>u.startsWith(expectedOrigin+"/")));
const plan=JSON.parse(readFileSync("docs/wordpress-retirement-plan-20261107.json","utf8"));
assert.equal(plan.productionWordPressRemoved,false);
assert.equal(plan.productionWordPressChanged,false);
assert.equal(plan.cutoverReadiness.finalWrittenOwnerApproval,false);
assert.equal(plan.backupEvidence.encryptedOffHostCopyCompleted,false);
console.log(JSON.stringify({
 gate:"MAIN_DOMAIN_ASTRO_STATIC_ARTIFACT_ALLOWLIST_PASS",
 releaseOrigin:expectedOrigin,generatedFiles:files.length,allowedReleaseFiles:included.length,
 withheldSourceAndConfigFiles:withheld.length,htmlPages:html.length,
 indexablePages:html.length-noindex,retiredStoreNoindexPages:noindex,
 curatedShortMp3s:tracks.length,verifiedHistoricalPublicLisztAssets:historic.length,
 approvedAudioCount:audio,unapprovedAudioCount:0,
 approvedMainDomainCutover:false,productionWordPressChanged:false
}));
