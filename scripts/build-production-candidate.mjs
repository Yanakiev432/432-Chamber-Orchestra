import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const env={
 ...process.env,
 PUBLIC_SITE_URL:"https://432hz-orchestra.com",
 PUBLIC_PREVIEW_MODE:"false"
};
const commands=[
 ["Astro static production build",["node_modules/astro/astro.js","build"]],
 ...[
 "curate-public-gallery","render-concert-pitch-superscript",
 "validate-public-audio-excerpts","validate-footer-editorial",
 "validate-orchestra-tuning-editorial","validate-third-person-voice",
 "validate-public-demo-attachment-routes","validate-public-photo-attachment-routes",
 "validate-remaining-attachment-quarantine"
 ].map((name)=>[name,["scripts/"+name+".mjs"]]),
 ["WooCommerce read-only source snapshot",["scripts/validate-woocommerce-commerce-surface.mjs","--mode=report"]],
 ["WordPress retirement documentation",["scripts/validate-wordpress-retirement-static.mjs","--mode=report"]],
 ["Historical route preservation",["scripts/validate-legacy-parity.mjs"]],
 ["Internal links",["scripts/validate-static-links.mjs"]],
 ["Production sitemap/canonical SEO",["scripts/validate-seo-build.mjs"]],
 ["Production artifact fail-closed allowlist",["scripts/validate-production-release-candidate.mjs"]]
];
for(const [name,args] of commands){
 console.log("PRODUCTION_BUILD_STEP "+name);
 const result=spawnSync(process.execPath,args,{cwd:resolve("."),env,stdio:"inherit",windowsHide:true});
 if(result.error||result.status!==0){
   console.error("PRODUCTION_CANDIDATE_GATE_FAILED "+name+" status="+String(result.status));
   process.exit(result.status||2);
 }
}
console.log("ASTRO_PRODUCTION_CANDIDATE_ALL_GATES_PASS: files generated locally, no live WordPress changes");
