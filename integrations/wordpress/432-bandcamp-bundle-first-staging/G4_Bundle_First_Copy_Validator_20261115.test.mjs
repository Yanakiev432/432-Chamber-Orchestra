import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateHomepageBundleStaging } from "./G4_Bundle_First_Copy_Validator_20261115.mjs";
const original = JSON.parse(readFileSync(new URL("./G4_Homepage_Bundle_First_Copy_Staging_20261115.json",import.meta.url),"utf8"));
const edited = change=>{const d=structuredClone(original);change(d);return d;};
test("source content exactly matches WordPress hashes and only intended paragraphs changed",()=>{
  const r=validateHomepageBundleStaging(original);
  assert.equal(r.state,"READY_FOR_EXPLICIT_COPY_APPROVAL"); assert.deepEqual(r.failures,[]);assert.equal(r.may_publish,false);assert.equal(r.docs_checked,2);
});
test("wrong source hash is rejected",()=>{
  const a=edited(d=>{d.documents[0].original_post_content_sha256="0".repeat(64)});
  assert.equal(validateHomepageBundleStaging(a).state,"INVALID");
});
test("mutated non-target content is rejected",()=>{
  const a=edited(d=>{d.documents[1].proposed_full_content+="<p>extra side effect</p>"});
  assert.ok(validateHomepageBundleStaging(a).failures.some(x=>x.includes("unexpected changes")));
});
test("missing exactly one source occurrence is rejected",()=>{
  const a=edited(d=>{d.documents[0].expected_original_fragment="absent"});
  assert.equal(validateHomepageBundleStaging(a).state,"INVALID");
});
test("missing Bandcamp bundle destination is rejected",()=>{
  const a=edited(d=>{d.documents[0].replacement_fragment=d.documents[0].replacement_fragment.replaceAll("https://432orchestra.bandcamp.com/album/432-hz-quartet-music","https://example.com")});
  assert.equal(validateHomepageBundleStaging(a).state,"INVALID");
});
test("changes to existing Bandcamp audio embeds are rejected",()=>{
  const a=edited(d=>{d.documents[0].original_full_content=d.documents[0].original_full_content.replace("track=789550373","track=1");d.documents[0].original_post_content_sha256="0".repeat(64)});
  assert.ok(validateHomepageBundleStaging(a).failures.some(x=>x.includes("source sha mismatch")));
});
test("evergreen price or stale discounts are rejected",()=>{
  const a=edited(d=>{d.documents[0].replacement_fragment+=" 20% discount"});
  assert.ok(validateHomepageBundleStaging(a).failures.some(x=>x.includes("discount/price")));
});
test("production approval cannot be self-declared by manifest",()=>{
  const a=edited(d=>{d.documents[1].wordPress_approved=true});
  assert.equal(validateHomepageBundleStaging(a).state,"INVALID");
});
test("swapping BG and EN page IDs is rejected",()=>{
  const a=edited(d=>{d.documents[0].wp_post_id=61});
  assert.equal(validateHomepageBundleStaging(a).state,"INVALID");
});
test("wrong full-discography landing is rejected",()=>{
  const a=edited(d=>{d.bandcamp_bfd_evidence.safe_page_url="https://example.com"});
  assert.equal(validateHomepageBundleStaging(a).state,"INVALID");
});
test("malformed or missing documents are rejected",()=>{
  assert.equal(validateHomepageBundleStaging(null).state,"INVALID");
  assert.equal(validateHomepageBundleStaging({}).state,"INVALID");
  assert.equal(validateHomepageBundleStaging(edited(d=>{d.documents=[]})).state,"INVALID");
});
