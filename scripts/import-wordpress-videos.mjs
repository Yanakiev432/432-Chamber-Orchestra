import {readFileSync,writeFileSync} from "node:fs";
const s=JSON.parse(readFileSync("docs/wordpress-public-source-20261106.json","utf8"));
const vids=new Map();
const re=/(?:youtube-nocookie\.com\/embed\/|youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/gi;
for(const p of s.posts){
 for(const match of String(p.post_content||"").matchAll(re)){
   const id=match[1];
   if(!vids.has(id))vids.set(id,[]);
   vids.get(id).push({postId:Number(p.ID),title:p.post_title});
 }
}
const descriptors={
 "_smFTGfWfKI":{bg:"Архивен видеоматериал за оркестъра I",en:"Orchestra archive video I"},
 "R1bSsCbIEPI":{bg:"Архивен видеоматериал за оркестъра II",en:"Orchestra archive video II"},
 "6lFHcBLpaq4":{bg:"Иван Янакиев — диригент",en:"Ivan Yanakiev — conductor"},
 "VKKQp5_5u-M":{bg:"Концертен строй A=432 Hz — архивен материал",en:"A=432 Hz concert pitch — archival material"},
 "1Co8_24qnG0":{bg:"Концерт в БАН — Моцарт, Златев-Черкин, Вивалди",en:"BAS concert — Mozart, Zlatev-Cherkin, Vivaldi"}
};
if(vids.size!==5||[...vids.keys()].some(k=>!descriptors[k]))throw new Error("VIDEO_INVENTORY_CHANGED");
const items=[...vids].map(([id,sourcePosts])=>({id,title:descriptors[id],sourcePosts,
  embed:"https://www.youtube-nocookie.com/embed/"+id,
  original:"https://www.youtube.com/watch?v="+id}));
writeFileSync("src/content/legacyVideos.json",JSON.stringify({version:1,items},null,2)+"\n");
console.log("HISTORICAL_VIDEO_INDEX_PASS="+items.length);
