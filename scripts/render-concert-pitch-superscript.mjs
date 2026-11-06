import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

// Source strings and SEO metadata retain Unicode a¹; rendered text nodes use
// semantic HTML a<sup>1</sup>. URLs, tag attributes, JSON-LD and scripts stay intact.
const root = resolve("dist");
const tokens = /<!--[\s\S]*?-->|<(?:script|style|title|textarea|noscript)\b[^>]*>[\s\S]*?<\/(?:script|style|title|textarea|noscript)\s*>|<[^>]*>/gi;
let pages = 0;
let occurrences = 0;
function convert(html) {
  let offset = 0;
  let output = "";
  const transform = (raw) => raw.replace(/a¹(?=\s*=\s*(?:432|440)\s*Hz)/g, () => {
    occurrences++;
    return "a<sup>1</sup>";
  });
  for (const match of html.matchAll(tokens)) {
    output += transform(html.slice(offset, match.index));
    output += match[0];
    offset = match.index + match[0].length;
  }
  output += transform(html.slice(offset));
  return output;
}
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name === "index.html") {
      pages++;
      const previous = readFileSync(file, "utf8");
      const next = convert(previous);
      if (previous !== next) writeFileSync(file, next, "utf8");
    }
  }
}
walk(root);
if (pages < 140 || occurrences < 40)
  throw new Error("PITCH_SUPERSCRIPT_RENDER_INCOMPLETE pages=" + pages + " replacements=" + occurrences);
console.log(JSON.stringify({gate:"CANONICAL_PITCH_SUPERSCRIPT_RENDER_PASS",pages,semanticSuperscripts:occurrences}));
