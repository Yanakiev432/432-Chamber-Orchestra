import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const file = path => readFileSync(new URL(path, import.meta.url), "utf8");
const pairs = [
  ["outbound-tracker.mjs","outbound-tracker.browser.js",null,null],
  ["consent-first-ga4.mjs","consent-first-ga4.browser.js",'./outbound-tracker.mjs','./outbound-tracker.browser.js'],
  ["consent-first-entry.preview.mjs","consent-first-entry.preview.js",'./consent-first-ga4.mjs','./consent-first-ga4.browser.js'],
];

test("three browser .js modules reproduce the audited .mjs sources exactly except two import paths",()=>{
  for(const [a,b,oldPath,newPath] of pairs){
    const source=file(a),expected=oldPath?source.replace(oldPath,newPath):source;
    assert.equal(file(b),expected);
  }
});

test("all browser transitive imports use same-directory .js paths; never .mjs",()=>{
  for(const [,b] of pairs){
    const source=file(b);
    assert.doesNotMatch(source,/from\s+["'][^"']+\.mjs["']/);
    assert.doesNotMatch(source,/https?:\/\/.*\.mjs["']/);
  }
  assert.match(file("consent-first-ga4.browser.js"),/from "\.\/outbound-tracker\.browser\.js"/);
  assert.match(file("consent-first-entry.preview.js"),/from "\.\/consent-first-ga4\.browser\.js"/);
});

test("browser .js entry import is inert without explicit window approval",async()=>{
  const module=await import("./consent-first-entry.preview.js");
  assert.ok(module);
  assert.equal(typeof globalThis.window,"undefined");
});

test("browser .js GA4 exports and outbound tracking resolve in Node22 ESM",async()=>{
  const loader=await import("./consent-first-ga4.browser.js");
  const out=await import("./outbound-tracker.browser.js");
  assert.equal(loader.GA4_MEASUREMENT_ID,"G-YMLKYY9HGT");
  assert.equal(typeof loader.installConsentFirstGA4,"function");
  assert.equal(typeof out.installBandcampOutboundTracking,"function");
});

test("WordPress bridge enqueues the .js browser entry and retains the disabled-by-default feature flag",()=>{
  const source=file("orch432-g3-consent-bridge.preview.php");
  assert.match(source,/plugins_url\(\s*'consent-first-entry\.preview\.js'/);
  assert.doesNotMatch(source,/plugins_url\(\s*'[^']+\.mjs'/);
  assert.match(source,/ORCH432_G3_STAGING_BRIDGE_ENABLED/);
  assert.match(source,/script_loader_tag/);
});

test("all three .js modules have a stable digest and no edited logic beyond import paths",()=>{
  const outputs=pairs.map(([,dst])=>createHash("sha256").update(file(dst)).digest("hex"));
  assert.equal(new Set(outputs).size,3);
  assert.equal(outputs.length,3);
});

test("browser entry still refuses any implicit analytics consent in the absence of approved server config",()=>{
  const code=file("consent-first-entry.preview.js");
  assert.match(code,/approval\.enabled === true/);
  assert.match(code,/approval\.uiChoicesVerified === true/);
  assert.match(code,/approval\.legacyHooksRemoved === true/);
  assert.match(code,/captureBandcampOutbound: false/);
});


test("site-local WordPress guard checks the actual incoming HTTP_HOST as well as home_url",()=>{
  const source=file("orch432-g3-legacy-guard.preview.php");
  assert.match(source,/get_current_blog_id\(\)\s*!==\s*1/);
  assert.match(source,/is_admin\(\)/);
  assert.match(source,/home_url\(\s*'\/'\s*\)/);
  assert.match(source,/\$_SERVER\['HTTP_HOST'\]/);
  assert.match(source,/\$request_host\s*===\s*'432hz-orchestra\.com'/);
});
