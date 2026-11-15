import { createHash } from "node:crypto";

const DOCS = new Map([["en",47],["bg",61]]);
const BUNDLE = "https://432orchestra.bandcamp.com/album/432-hz-quartet-music";
const CATALOGUE = "https://432orchestra.bandcamp.com/music";
const count = (s,needle) => s.split(needle).length - 1;
export function validateHomepageBundleStaging(pack) {
  const failures = [];
  if (pack?.schema !== "432-homepage-bundle-first-copy/1.0" || pack?.state !== "STAGING_NOT_PUBLISHED")
    failures.push("invalid or already approved staging manifest");
  if (pack?.bandcamp_bfd_evidence?.safe_page_url !== BUNDLE || pack?.bandcamp_bfd_evidence?.browse_url !== CATALOGUE)
    failures.push("unverified official destinations");
  const docs = pack?.documents;
  if (!Array.isArray(docs) || docs.length !== DOCS.size) failures.push("exactly two source pages required");
  else {
    const seen = new Set();
    for (const d of docs) {
      if (seen.has(d.lang) || DOCS.get(d.lang) !== d.wp_post_id) failures.push("wrong or duplicate EN/BG page identity");
      seen.add(d.lang);
      if (d.wordPress_approved !== false) failures.push("production approval unexpectedly set");
      if (!["original_full_content","expected_original_fragment","replacement_fragment","proposed_full_content"].every(k=>typeof d[k] === "string"))
        { failures.push("missing source or replacement strings"); continue; }
      const sha = createHash("sha256").update(d.original_full_content, "utf8").digest("hex");
      if (sha !== d.original_post_content_sha256) failures.push("WordPress post_content source sha mismatch");
      if (count(d.original_full_content,d.expected_original_fragment)!==1)
        failures.push("source paragraph not unique");
      if (d.proposed_full_content !== d.original_full_content.replace(d.expected_original_fragment,d.replacement_fragment))
        failures.push("unexpected changes outside approved snippet");
      const embeds = s=>s.match(/\[bandcamp[^\]\n]*\]/g)??[];
      if (embeds(d.original_full_content).length!==4 || JSON.stringify(embeds(d.original_full_content))!==JSON.stringify(embeds(d.proposed_full_content)))
        failures.push("Bandcamp players changed or missing");
      if (!d.replacement_fragment.includes(BUNDLE) || !d.replacement_fragment.includes(CATALOGUE))
        failures.push("both verified links required");
      if (/permanent sale|постоянно намаление|100[.,]40|20%|save 20|\bdiscount\b/i.test(d.replacement_fragment))
        failures.push("discount/price promise may become stale");
      if (count(d.replacement_fragment,"<a ")!==2) failures.push("exactly two replacement CTAs required");
      if (/<script|javascript:|data:text\/html/i.test(d.replacement_fragment)) failures.push("unsafe markup");
    }
  }
  return Object.freeze({state: failures.length?"INVALID":"READY_FOR_EXPLICIT_COPY_APPROVAL",failures,docs_checked:Array.isArray(docs)?docs.length:0,may_publish:false});
}
