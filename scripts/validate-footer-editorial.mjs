import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const bgMotto = "Независим · Изискан · Разпознаваем";
const enMotto = "Independent · Refined · Remarkable";
const source = readFileSync("src/content/siteContent.ts", "utf8");
assert.ok(source.includes('motto: "' + bgMotto + '"'), "Bulgarian footer wording missing");
assert.ok(source.includes('motto: "' + enMotto + '"'), "English footer wording missing");
const rejected = /Независим\s*·\s*(?:Документиран\s*·\s*Отчетен|С история\s*·\s*С характер|Утвърден\s*·\s*Самобитен)|Independent\s*·\s*(?:Documented\s*·\s*Accountable|History\s*·\s*Character|Established\s*·\s*Distinctive)/;
let pages = 0;
let bulgarian = 0;
let english = 0;
function visit(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) visit(path);
    else if (entry.name === "index.html") {
      const html = readFileSync(path, "utf8");
      pages++;
      const footer = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i)?.[0];
      if (path === join(resolve("dist"), "index.html")) continue; // Locale redirect has no visual footer.
      assert.ok(footer, "Page footer missing: " + path);
      assert.ok(!rejected.test(footer), "Outdated orchestra motto: " + path);
      if (path.includes(join("dist", "bg") + "/") || path.includes(join("dist", "bg") + "\\")) {
        assert.ok(footer.includes(bgMotto), "Bulgarian motto missing: " + path);
        assert.ok(footer.includes("Фондация 432 Херца") || footer.includes("foundation"), "Foundation details missing: " + path);
        bulgarian++;
      } else if (path.includes(join("dist", "en") + "/") || path.includes(join("dist", "en") + "\\")) {
        assert.ok(footer.includes(enMotto), "English motto missing: " + path);
        english++;
      } else {
        assert.ok(footer.includes(bgMotto) || footer.includes(enMotto), "Motto missing: " + path);
      }
    }
  }
}
visit(resolve("dist"));
const demoCount=JSON.parse(readFileSync("src/content/publicDemoAttachmentRoutes.json","utf8")).items.length;
assert.equal(pages, 318 + demoCount, "Unexpected page count");
assert.ok(bulgarian > 50 && english > 50, "Both languages must be checked");
console.log(JSON.stringify({ gate: "ORCHESTRA_EDITORIAL_FOOTER_PASS", pages, bulgarian, english }));
