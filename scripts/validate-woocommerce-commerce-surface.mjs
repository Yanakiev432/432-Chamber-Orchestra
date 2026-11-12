import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const snapshot=JSON.parse(readFileSync("docs/wordpress-commerce-download-surface-20261107.json","utf8"));
const live=JSON.parse(readFileSync("docs/woocommerce-paid-media-live-exposure-20261112.json","utf8"));
const hardened=JSON.parse(readFileSync("docs/woocommerce-paid-media-protection-applied-20261112.json","utf8"));
assert.equal(hardened.gate,"432_WOO_DIRECT_22_PAID_SOURCE_FILES_HTTP_403_LOCKDOWN_APPLIED");
assert.deepEqual([hardened.protectedOriginalPaidMediaFiles,hardened.originalPaidMediaAlreadyProtected,hardened.finalOriginalPaidMediaDeniedDirectly],[22,4,26]);
assert.deepEqual([hardened.twoHostnameDirectRequestsChecked,hardened.HTTP403Results],[44,44]);
assert.equal(hardened.mediaSourceFilesChanged,0);
assert.equal(hardened.customerOrdersChanged,0);
assert.equal(hardened.ecommerceForceMethod,"force");
assert.equal(hardened.wooRedirectFallbackEnabled,false);
assert.equal(hardened.authenticatedHistoricalBuyerDeliveryEndToEnd,false);
assert.equal(hardened.notAWordPressToAstroCutover,true);

assert.equal(live.gate,"432_WOO_22_ORIGINAL_PAID_MEDIA_ANONYMOUS_HTTP_EXPOSURE_CONFIRMED_REMEDIATION_DRY_RUN_PASS_NOT_APPLIED");
assert.equal(live.checkedLocalDate,"2026-11-12");
assert.deepEqual([live.rawProductDownloadReferences,live.distinctOriginalPaidMediaFiles],[80,26]);
assert.deepEqual([live.exposedOriginalWav,live.exposedOriginalMp3,live.alreadyDeniedOriginalWav],[20,2,4]);
assert.deepEqual([live.bothCanonicalAndWwwHostMediaProbes.count,live.bothCanonicalAndWwwHostMediaProbes.status206],[44,44]);
assert.equal(live.forceDownload.method,"force");
assert.equal(live.forceDownload.redirectFallback,"no");
assert.equal(live.forceDownload.localPhysicalOriginalMediaReadableByPhp,26);
assert.equal(live.forceDownload.authenticatedRealBuyerDeliveryFlowTested,false);
assert.equal(live.privateMitigationDraft.exactFiles,22);
assert.equal(live.privateMitigationDraft.unrelatedFilesCheckedWithPhpPCRE,1451);
assert.equal(live.privateMitigationDraft.appliedToProduction,false);
assert.equal(live.privateMitigationDraft.unauthorizedApplyWithoutExactAuthorizationFailedClosed,true);
assert.equal(live.productionWordPressModified,false);

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
assert.equal(snapshot.redirectFallbackVerified,true);
assert.equal(snapshot.redirectFallbackEnabled,false);
assert.equal(snapshot.downloadsRequireLogin,false);
assert.equal(snapshot.grantDownloadsAfterPayment,true);
assert.deepEqual(snapshot.permissionTableAggregates,{
  tablePresent:true,totalPermissionRows:188,distinctOrderIdsWithPermissions:12,
  distinctProductIdsWithPermissions:19,unlimitedOrBlankPermissionCount:6,noCustomerPIIRead:true
});
assert.deepEqual(snapshot.legacyShopOrderStatusCounts,{completed:14,onHold:7,pending:7});
assert.equal(snapshot.permissionsOrCustomerRecordsModified,false);
assert.deepEqual(snapshot.anonymousProductPageInspection,{
  historicalProductUrls:46,http200:46,priceRelatedMarkup:46,
  standardCartForms:0,standardAddToCartButtons:0,errors:0,
  checkoutGloballyDisabledProven:false,newSalesCurrentlyEnabledProven:false,productionModified:false
});
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
console.log(JSON.stringify({gate:mode==="report"?"WOOCOMMERCE_PAID_MEDIA_DIRECT_ACCESS_BLOCKED":"WOOCOMMERCE_CUTOVER_BLOCKED",
  products:46,beforeFixAnonymouslyAccessiblePaidMedia:22,currentlyProtectedPaidMedia:26,downloadMethodVerified:snapshot.deliveryMethodVerified,downloadMethod:snapshot.deliveryMethod,
  buyerEntitlementQA:snapshot.validPurchaserFlowVerified,permissionsRows:snapshot.permissionTableAggregates.totalPermissionRows,redirectFallbackEnabled:snapshot.redirectFallbackEnabled,originalProductionModified:false,preFixPublicFiles:live.exposedOriginalWav+live.exposedOriginalMp3,currentPublicDirectPaidFiles:0,currentPaidMediaDirectHttp403:hardened.finalOriginalPaidMediaDeniedDirectly,postFixTwoHostnameHttp403:hardened.HTTP403Results,liveRemediationApplied:true,realBuyerEntitlementDeliveryVerified:hardened.authenticatedHistoricalBuyerDeliveryEndToEnd}));
if(mode==="cutover"){console.error("CUTOVER BLOCKED: exact 22-file direct-media lockdown applied, but historical buyer authenticated entitlements and post-Astro shared-host file isolation remain unverified.");process.exitCode=2;}
