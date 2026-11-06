import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { canonicalPitch } from "./concert-pitch-standard.mjs";

const cases = [
  ["A=432 Hz", "a¹ = 432 Hz"],
  ["a1 = 432 Hz", "a¹ = 432 Hz"],
  ["а1 = 432 Hz", "a¹ = 432 Hz"],
  ["ла = 432 Hz", "a¹ = 432 Hz"],
  ["ла1 = 432 Hz", "a¹ = 432 Hz"],
  ["a₁=432Hz", "a¹ = 432 Hz"],
  ["A=440 / A=432", "a¹ = 440 Hz / a¹ = 432 Hz"],
  ["A=440 Hz", "a¹ = 440 Hz"],
  ["432 Hz Quartet Music", "432 Hz Quartet Music"],
  ["https://432hz-orchestra.com/en/", "https://432hz-orchestra.com/en/"]
];
for (const [input, expected] of cases) {
  if (canonicalPitch(input) !== expected)
    throw new Error("PITCH_CANONICALIZER_FAILED " + JSON.stringify({input,expected,actual:canonicalPitch(input)}));
}
const sources=[
  "src/content/siteContent.ts",
  "src/content/audioArchive.ts",
  "src/content/legacyArchive.json",
  "src/content/legacyVideos.json",
  "src/components/PressPage.astro"
];
for (const file of sources) {
  const content=readFileSync(file,"utf8");
  if (canonicalPitch(content)!==content)
    throw new Error("SOURCE_NOT_CANONICAL "+file);
}
const root=resolve("dist");
let pages=0, semanticSuperscripts=0, metaSuperscripts=0;
const unnormalized=/(?<![\p{L}\p{N}])(?:ла|[aа])\s*[1¹₁]?\s*=\s*(?:432|440)(?:\s*Hz)?(?=$|[^\p{L}\p{N}])/giu;
function scan(dir) {
  for(const e of readdirSync(dir,{withFileTypes:true})){
    const path=join(dir,e.name);
    if(e.isDirectory()) scan(path);
    else if(e.name==="index.html"){
      const html=readFileSync(path,"utf8");
      pages++;
      const bad=[...html.matchAll(unnormalized)].filter(m=>m[0]!==("a¹ = "+(m[0].includes("440")?"440":"432")+" Hz"));
      if(bad.length) throw new Error("OLD_PITCH_NOTATION_IN_HTML "+path+" "+bad.slice(0,3).map(x=>x[0]).join(","));
      semanticSuperscripts += (html.match(/a<sup>1<\/sup> = (?:432|440) Hz/g)||[]).length;
      metaSuperscripts += (html.match(/a¹ = (?:432|440) Hz/g)||[]).length;
      if(html.includes("Until now soloists of the ensemble") || html.includes("До момента солисти на Камерен оркестър 432"))
        throw new Error("WITHDRAWN_TEXT_REAPPEARED "+path);
    }
  }
}
scan(root);
if(pages!==229 || semanticSuperscripts<40)
  throw new Error("PITCH_RENDER_INCOMPLETE "+JSON.stringify({pages,semanticSuperscripts,metaSuperscripts}));
console.log(JSON.stringify({gate:"LATIN_A_SUPERSCRIPT_PITCH_PASS",pages,semanticSuperscripts,metaSuperscripts,sources:sources.length}));
