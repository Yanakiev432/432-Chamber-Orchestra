import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
const read=(path)=>JSON.parse(readFileSync(path,"utf8"));
const plan=read("docs/wordpress-retirement-plan-20261107.json");
const legacy=read("src/content/legacyArchive.json");
const mode=process.argv.find(x=>x.startsWith("--mode="))?.slice(7) || "report";
assert.ok(["report","cutover"].includes(mode),"Use report or cutover mode");
const root=resolve("dist");
assert.equal(plan.schemaVersion,1);
assert.equal(plan.editorialSourceInventory.staticHtmlPages,394);
assert.equal(plan.editorialSourceInventory.observedOriginalPaths,636);
assert.equal(plan.editorialSourceInventory.matchedByAstro,352);
assert.equal(plan.editorialSourceInventory.pendingOriginalAttachmentDetailRoutes,270);
assert.equal(plan.retainedHistoricalProductData.oldCustomerDownloadPermissionRows,188);
assert.equal(plan.retainedHistoricalProductData.ordersAssociatedWithDownloadPermissions,12);
assert.equal(plan.hostingRootBoundary.neverRecursivelyDeleteWholePublicHtml,true);
assert.equal(plan.hostingRootBoundary.separateApplicationsDetected,true);
assert.equal(plan.hostingRootBoundary.cpanelVerifiedDomains,16);
assert.equal(plan.hostingRootBoundary.readOnlyCutoverRootScope.candidateCoreDirectoryTotalFiles,30611);
assert.equal(plan.hostingRootBoundary.exactDeletionAllowlistApproved,false);
assert.equal(plan.backupEvidence.fullArchiveStreamVerification.regularFilesStreamed,30642);
assert.equal(plan.backupEvidence.fullArchiveStreamVerification.originalWooCommerceDownloadMediaSha256Matched,26);
assert.equal(plan.backupEvidence.fullArchiveStreamVerification.independentSmallSampleFilesRestoredAndCompared,3);
assert.equal(plan.backupEvidence.fullArchiveStreamVerification.fullPhysicalRestoreCompleted,false);
assert.equal(plan.backupEvidence.hostQuotaComplication.temporaryRestoreDirectoryCleaned,true);
assert.equal(plan.backupEvidence.databaseRestoreDrillPassed,true);
assert.equal(plan.backupEvidence.isolatedMariaDbRestore.restoredTables,116);
assert.equal(plan.backupEvidence.isolatedMariaDbRestore.downloadPermissions,188);
assert.equal(plan.backupEvidence.isolatedMariaDbRestore.engineCheckPass,true);
assert.equal(plan.backupEvidence.isolatedMariaDbRestore.durableOffhostBackupCompleted,false);
assert.equal(plan.productionCandidate.allowlistedFiles,618);
assert.equal(plan.productionCandidate.htmlPages,394);
assert.equal(plan.productionCandidate.indexableSitemapUrls,384);
assert.equal(plan.productionCandidate.stagingOutsideWebroots,true);
assert.equal(plan.productionCandidate.approvedForProductionCutover,false);
assert.equal(plan.hostingRootBoundary.productionOverlapDryRun.existingFiles,2);
assert.equal(plan.hostingRootBoundary.productionOverlapDryRun.nestedSiteCollisions,0);
assert.equal(plan.hostingRootBoundary.apacheCutoverRehearsal.securityCases,40);
assert.equal(plan.hostingRootBoundary.apacheCutoverRehearsal.securityCasesPassed,40);
assert.equal(plan.hostingRootBoundary.apacheCutoverRehearsal.candidateSha256,"8fbb14f21ec3df1444f8203508181008e81f69f9b382b6b41370d902139142ae");
assert.equal(plan.hostingRootBoundary.apacheCutoverRehearsal.appliedToProduction,false);
assert.equal(plan.hostingRootBoundary.apacheCutoverRehearsal.realProductionApacheAcceptancePerformed,false);
assert.equal(plan.historicalBuyerOfflineSupport.permissionRows,188);
assert.equal(plan.historicalBuyerOfflineSupport.archivedCompletedOrdersWithDownloadPermissions,12);
assert.equal(plan.historicalBuyerOfflineSupport.billingEmailAndOrderKeyMismatches,0);
assert.equal(plan.historicalBuyerOfflineSupport.usableByArchiveDateQuotaAndMetadata,124);
assert.equal(plan.historicalBuyerOfflineSupport.ordersWithUsableRows,8);
assert.equal(plan.historicalBuyerOfflineSupport.staticSyntheticTestsPassing,11);
assert.equal(plan.historicalBuyerOfflineSupport.nonTtyLookupRefusalPassed,true);
assert.equal(plan.historicalBuyerOfflineSupport.humanVerifiedBuyerSupportPolicyApproved,false);
assert.equal(plan.hostingRootBoundary.transactionalRollbackFixture.stagedStaticFiles,618);
assert.equal(plan.hostingRootBoundary.transactionalRollbackFixture.originalMockFilesAllRestoredWithSameSha256,13);
assert.equal(plan.hostingRootBoundary.transactionalRollbackFixture.fullRealWordPressMediaAndRuntimeRollbackProven,false);
assert.equal(plan.productionCandidate.remainingOriginWordPressActiveMediaDependencies,0);
assert.equal(plan.productionCandidate.latestRebuildIdenticalToPrivatelyStagedEverestRelease,true);
assert.equal(plan.productionCandidate.entire618FilesSortedPathSha256ManifestRoot,"d5f5137b22fa67870eab5ffabc5aa5c0819696286535bd0a86c2c30980b0c965");
assert.equal(plan.productionCandidate.currentlyActiveSelfHostedWordPressDependencies,0);
assert.equal(plan.productionCandidate.externalWpContentPdfLinksCount,2);
assert.equal(plan.integrated20261108ReleaseEvidence.syntheticFull618FileTransactionAndRollbackPassed,true);
assert.equal(plan.integrated20261108ReleaseEvidence.originalBuyerFulfillmentDecisionApproved,false);
assert.equal(plan.integrated20261108ReleaseEvidence.encryptedOffhostCopyCompleted,true);
assert.equal(plan.backupEvidence.encryptedOffHostCopyCompleted,true);
assert.equal(plan.backupEvidence.encryptedOffHostFullFileArchive.sourceMediaArchiveOriginalParts,11);
assert.equal(plan.backupEvidence.encryptedOffHostFullFileArchive.sourceArchiveRegularFiles,30642);
assert.equal(plan.backupEvidence.encryptedOffHostFullFileArchive.sourceArchiveUncompressedMembers,34525);
assert.equal(plan.backupEvidence.encryptedOffHostFullFileArchive.originalCompressedFileArchiveBytes,5645511107);
assert.equal(plan.backupEvidence.encryptedOffHostFullFileArchive.ciphertextFileArchiveBytes,5651030680);
assert.equal(plan.backupEvidence.encryptedOffHostFullFileArchive.sourceArchiveUnsafePathCount,0);
assert.equal(plan.backupEvidence.encryptedOffHostFullFileArchive.largeCmsFileDecryptionFromLenovoPassed,false);
assert.equal(plan.backupEvidence.encryptedOffHostFullFileArchive.manualRecoveryPasswordPortableEscrowCompleted,false);
assert.equal(plan.backupEvidence.encryptedOffHostFullFileArchive.isolatedFullWordPressFilesystemRestoreFromOffhostCipherPassed,false);
assert.equal(plan.backupEvidence.durableOffhostBackupCompleted,false);
assert.equal(plan.cutoverReadiness.portableBackupKeyEscrowVerified,false);
assert.equal(plan.cutoverReadiness.fullEncryptedArchiveOffhostRestoreDrillPassed,false);
assert.equal(plan.cutoverReadiness.secondIndependentBackupCopyVerified,false);
assert.equal(plan.cutoverReadiness.finalFreshBackupAfterOrdersStopped,false);
assert.equal(plan.integrated20261108ReleaseEvidence.fullRealRuntimeRollbackProven,false);
assert.equal(plan.cutoverReadiness.productionRollbackDryRunPassed,false);
assert.equal(plan.cutoverReadiness.productionStaticHostAndTlsSmokeTestPassed,false);
assert.equal(plan.hostingRootBoundary.scopedTargetFileAllowlistApproved,false);
assert.ok(plan.hostingRootBoundary.preservedDirectoriesBeforeAndAfterRetirement.includes("432project.432hz-orchestra.com"));
assert.equal(plan.productionWordPressRemoved,false);
assert.equal(plan.productionWordPressChanged,false);
const pages=legacy.items.filter(x=>x.dynamicWordPress===true);
const products=legacy.items.filter(x=>x.kind==="product");
assert.equal(pages.length,9,"Unexpected number of historical dynamic WooCommerce URLs");
assert.equal(products.length,46,"Expected 46 archival products");
const sitemap=readFileSync(join(root,"sitemap.xml"),"utf8");
const indexedPaths=new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match)=>new URL(match[1]).pathname));
for(const record of [...pages,...products]){
 const target=join(root,record.path.slice(1),"index.html");
 assert.ok(existsSync(target),"Missing historical static route: "+record.path);
 const html=readFileSync(target,"utf8");
 assert.ok(!/<form\b[^>]*class=["'][^"']*(?:woocommerce|cart|checkout)/i.test(html),"Active checkout form in a retired route: "+record.path);
 assert.ok(!/name=["']add-to-cart["']|single_add_to_cart_button|wc-add-to-cart/i.test(html),"Active cart mechanism in archive: "+record.path);
 if(record.dynamicWordPress){
  assert.ok(html.includes('data-legacy-store-retired="true"'),"Missing historical store notice: "+record.path);
  assert.ok(html.includes("mailto:info@432hz-foundation.com"),"Missing official contact for historical order: "+record.path);
  assert.ok(html.includes('<meta name="robots" content="noindex,nofollow"'),"Former checkout/account URL must be noindex: "+record.path);
  assert.ok(!indexedPaths.has(record.path),"Former checkout/account URL included in sitemap: "+record.path);
 }
 assert.ok(!html.includes("View the original publication")&&!html.includes("Към първоначалната публикация"),"Dead original-site CTA preserved in archive");
}
// Retiring the source WordPress origin must leave zero active primary-origin anchors.
// Historical provenance in data attributes is intentionally retained.
let oldPrimaryWordPressLinks=0;
function auditAnchorLinks(folder) {
 for (const entry of readdirSync(folder,{withFileTypes:true})) {
  const file=join(folder,entry.name);
  if (entry.isDirectory()) auditAnchorLinks(file);
  else if(entry.isFile()&&entry.name==="index.html") {
   const html=readFileSync(file,"utf8");
   oldPrimaryWordPressLinks += [...html.matchAll(/<a\b[^>]*\bhref=["']https:\/\/432hz-orchestra\.com\//gi)].length;
  }
 }
}
auditAnchorLinks(root);
assert.equal(oldPrimaryWordPressLinks,0,"Live anchors still point to retiring WordPress root domain");
const conditions={
  encryptedOffHostCopyCompleted:plan.backupEvidence.encryptedOffHostCopyCompleted,
  databaseRestoreDrillPassed:plan.backupEvidence.databaseRestoreDrillPassed,
  freshPrecutoverMediaArchiveCompleted:plan.backupEvidence.freshPrecutoverMediaArchiveCompleted,
  ...plan.cutoverReadiness
};
const pending=Object.entries(conditions).filter(([,value])=>value!==true).map(([name])=>name);
const result={
 gate:mode==="report"?"ASTRO_ONLY_RETIREMENT_PREPARATION_PASS":"ASTRO_ONLY_RETIREMENT_CUTOVER_BLOCKED",
 target:plan.targetArchitecture,
 historicWooCommerceRouteNotices:pages.length,
 staticHistoricalProductRoutes:products.length,
 archivedPermissions:plan.retainedHistoricalProductData.oldCustomerDownloadPermissionRows,
 pendingGates:pending,
 productionWordPressChanged:false
};
console.log(JSON.stringify(result));
if(mode==="cutover"){
 console.error("RETIREMENT CUTOVER BLOCKED: "+pending.join(", "));
 process.exitCode=pending.length?2:0;
}
