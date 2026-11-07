import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const snapshot=JSON.parse(readFileSync("docs/wordpress-commerce-download-surface-20261107.json","utf8"));
const mode=process.argv.find(x=>x.startsWith("--mode="))?.split("=")[1]||"report";
assert.ok(["report","cutover"].includes(mode),"Only report and cutover modes are supported");
assert.equal(snapshot.schemaVersion,1);
assert.equal(snapshot.distinctDownloadFiles,26);assert.equal(snapshot.downloadReferences,80);
assert.equal(snapshot.publishedPositivePriceDownloadableProducts,46);
const {publicWav:w,publicMp3:m,protectedWav:p}=snapshot.storage;
assert.deepEqual([w.files,m.files,p.files],[20,2,4]);
assert.deepEqual([w.head200,m.head200,p.head403],[20,2,4]);
assert.deepEqual([w.rangeGet206,m.rangeGet206,p.rangeGet403],[20,2,4]);
assert.deepEqual([w.linkedPaidProducts,m.linkedPaidProducts,p.linkedPaidProducts],[36,2,8]);
assert.equal(w.files+m.files+p.files,26);assert.equal(w.linkedPaidProducts+m.linkedPaidProducts+p.linkedPaidProducts,46);
assert.equal(snapshot.publicFiles,22);assert.equal(snapshot.protectedFiles,4);
assert.equal(snapshot.earlierDuplicateClaimSuperseded,true);
assert.equal(snapshot.deliveryMethodVerified,true);
assert.equal(snapshot.deliveryMethod,"force");
assert.equal(snapshot.hashNewUploadFilenamesEnabled,true);
assert.deepEqual([snapshot.exactDenyRuleDryRun.fileCount,snapshot.exactDenyRuleDryRun.uploadDirectories,snapshot.exactDenyRuleDryRun.additionalFileMatches],[22,2,0]);
assert.equal(snapshot.exactDenyRuleDryRun.productionHtaccessModified,false);
assert.equal(snapshot.isolatedWebServerDenyTest.exactMatchingDummyWavHttpStatus,403);
assert.equal(snapshot.isolatedWebServerDenyTest.unrelatedDummyTextHttpStatus,200);
assert.equal(snapshot.isolatedWebServerDenyTest.testDirectoryDeleted,true);
assert.equal(snapshot.isolatedWebServerDenyTest.productionMediaOrRulesModified,false);
assert.equal(snapshot.productionChanged,false);assert.equal(snapshot.productionCutoverApproved,false);
assert.equal(snapshot.sourceDownloadUrlsIncluded,false);
const quarantine=JSON.parse(readFileSync("docs/wordpress-remaining-media-review-20261107.json","utf8"));
assert.equal(quarantine.remaining,270);assert.equal(quarantine.mp3Subclasses.publicPricedProductMp3Pages,4);
console.log(JSON.stringify({gate:mode==="report"?"WOOCOMMERCE_PAID_MEDIA_SURFACE_SNAPSHOT_PASS":"WOOCOMMERCE_CUTOVER_BLOCKED",
  products:46,publiclyAccessiblePaidMedia:22,protectedMedia:4,downloadMethodVerified:snapshot.deliveryMethodVerified,downloadMethod:snapshot.deliveryMethod,
  buyerEntitlementQA:snapshot.validPurchaserFlowVerified,originalProductionModified:false}));
if(mode==="cutover"){console.error("CUTOVER BLOCKED: 22 original paid-product files are still directly reachable; valid-buyer entitlements and any insecure fallback are still unverified.");process.exitCode=2;}
