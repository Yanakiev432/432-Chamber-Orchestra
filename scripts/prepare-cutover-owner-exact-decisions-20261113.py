#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Private, non-destructive owner decision sheet for 432 WordPress cutover.

On Everest Python 3.6. Reads the exact SHA-pinned REAL 51-entry webroot
inventory, compiles deterministic 23 legacy-file recommendations and
22 exact candidate park/backup moves. Creates only owner-private metadata.
Every owner decision is explicitly UNAPPROVED; this script cannot cut over.
"""
import os, sys, json, hashlib, datetime

PRIVATE='/home/hzorche/ra-core-deploy-staging/432-wp-recovery-v2-20261110'
INVENTORY=PRIVATE+'/432-LIVE-TRANSACTION-SCOPED-MANIFEST-20261113-v2/private-cutover-file-transaction-manifest.json'
SHA='1a35bcfcf117b704d98e4cb931f1fdce7fd28862e8e59cde5a38207a192b370c'
OUTPUT=PRIVATE+'/432-OWNER-EXACT-ROOT-51-CUTOVER-DECISIONS-20261113.json'
PUBLIC=PRIVATE+'/432-OWNER-EXACT-ROOT-CUTOVER-DECISION-SUMMARY-20261113.json'

HOST_KEEP={
 '.fastinclude','.user.ini---','error_log','mig-php56.fcgi',
 'php.fcgi','php56-fcgi.ini','php72-fcgi.ini'
}
SEO_KEEP={
 '400.html','401.html','402.html','403.html','404.html',
 'BingSiteAuth.xml','google85914ba4ed776e8b.html'
}
BACKUPS_ARCHIVE={
 '.htaccess.sh_migrate','.htaccess_SuperHosting_bak',
 '.sitemap.xml.backup-normalize-20260814T183327Z',
 '.sitemap.xml.backup-normalize-20260814T183750Z',
 '.sitemap.xml.backup-sanitation-20260814T143206Z',
 '.sitemap.xml.backup-seo-20260814T182724Z'
}
NEEDS_INVESTIGATION={'huge-it-google-map-custom-icons',
 'peeus4lq0jfi1yjc3a18xlp2ujwvjodw.php','ror.xml'}
GROUPS=[
 ('HOST_RUNTIME_KEEP_UNTIL_HOSTING_REVIEW',HOST_KEEP),
 ('SEO_AND_CPANEL_ERROR_PAGES_PRESERVE',SEO_KEEP),
 ('LEGACY_BACKUPS_PROPOSE_PRIVATE_PARK_AFTER_APPROVAL',BACKUPS_ARCHIVE),
 ('UNKNOWN_ASSETS_OR_PHP_HUMAN_REVIEW',NEEDS_INVESTIGATION)
]


def require(cond,code):
 if not cond:raise RuntimeError(code)

def digest(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(65536),b''):h.update(b)
 return h.hexdigest()

def write_excl(path,data):
 b=(json.dumps(data,indent=2,sort_keys=True,ensure_ascii=False)+'\n').encode('utf8')
 fd=os.open(path,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
 with os.fdopen(fd,'wb') as f:
  f.write(b);f.flush();os.fsync(f.fileno())
 return hashlib.sha256(b).hexdigest()

def main():
 os.umask(0o077)
 require(not os.path.lexists(OUTPUT) and not os.path.lexists(PUBLIC),
         'DECISION_SHEET_ALREADY_EXISTS')
 require(digest(INVENTORY)==SHA,'CANONICAL_REAL_WEBROOT_FILE_INVENTORY_CHANGED')
 j=json.load(open(INVENTORY))
 entries=j['liveRootEntries']
 require(len(entries)==51 and j['newOnlyReleaseFiles']==616,'REAL_ROOT_SCOPE_MISMATCH')
 other=[x for x in entries if x['category']=='OWNER_REVIEW_UNCLASSIFIED_KEEP_UNTOUCHED']
 names=set(x['name'] for x in other)
 allnames=set().union(*[group for _,group in GROUPS])
 require(len(names)==23 and names==allnames,'OWNER_23_FILE_SCOPE_CHANGED')
 require([len(g) for _,g in GROUPS]==[7,7,6,3],'OWNER_GROUP_COUNTS_CHANGED')
 review=[]
 for x in other:
  group=next(label for label,items in GROUPS if x['name'] in items)
  review.append({'name':x['name'],'kind':x['type'],
   'sourceSha256':x['rootFileSha256'],
   'recommendation':group,
   'actionApprovedByOwner':False,
   'ownerDecision':'PENDING',
   'operationsPermittedNow':[],
   'note':'No autonomous deletion or disclosure. Preserve by default until explicit approval.'})
 candidates=[x for x in entries if x['category'] in (
   'PARK_WORDPRESS_CORE_DIRECTORY_AFTER_APPROVAL',
   'PARK_WORDPRESS_CORE_ROOT_FILE_AFTER_APPROVAL',
   'PARK_WORDPRESS_INDEX_PHP_AFTER_APPROVAL',
   'BACKUP_REPLACE_APACHE_AFTER_APPROVAL',
   'BACKUP_REPLACE_PUBLIC_STATIC_AFTER_APPROVAL')]
 protected=[x for x in entries if x['category']=='PRESERVE_NESTED_NEVER_MOVE']
 require(len(candidates)==22 and len(protected)==6,'REPLACE_SCOPE_NOT_22_PLUS_6')
 assert len({x['name'] for x in candidates})==22
 decision={'schemaVersion':1,
  'gate':'432_EXACT_PRODUCTION_CUTOVER_OWNER_DECISIONS_PENDING',
  'dateUTC':datetime.datetime.utcnow().isoformat()+'Z',
  'sourceRealRootInventorySha256':SHA,
  'exactParkOrBackupCandidates':[{'name':x['name'],
    'proposedCategory':x['category'],'kind':x['type'],
    'approvedForPhysicalMove':False,'originalHash':x['rootFileSha256']}
    for x in candidates],
  'protectedDirectoriesNeverMove':sorted(x['name'] for x in protected),
  'unclassifiedReviewRecords':review,
  'releaseAstroFiles':618,
  'newStaticFilesNoOverlap':616,
  'staticOverlapsRequiringByteCopy':2,
  'candidateRootMovesOrBackups':22,
  'unclassifiedItemsNeedingSignedDisposition':23,
  'ownerApproves16Redirects':False,
  'ownerApproves13Gallery404s':False,
  'ownerApprovesAll22CandidateMoves':False,
  'ownerApproves23UnclassifiedDecisions':False,
  'ownerApprovesCutover':False,
  'backupPfxEscrowOffLenovoProven':False,
  'secondIndependentBackupProven':False,
  'buyerFulfillmentAndRetentionOwnerApproved':False,
  'finalPostCheckoutStopEncryptedBackupReady':False,
  'safeToApplyProductionTransaction':False,
  'executionPerformed':False}
 sha=write_excl(OUTPUT,decision)
 groups={label:len(items) for label,items in GROUPS}
 summary={'gate':'432_PRECISE_51_ROOT_OWNER_DECISION_GROUPS_COMPILED_NOT_APPROVED',
  'createdUTC':decision['dateUTC'],'sourceInventorySha256':SHA,
  'privateOwnerSheetSha256':sha,'allRootEntries':51,
  'coreMoveBackupCandidates':22,'protectedNestedDirectories':6,
  'otherRootEntries':23,'proposedDecisionGroupCounts':groups,
  'releaseAstroFiles':618,
  'ownerApprovalObtained':False,
  'productionWordPressFilesMoved':False,
  'cutoverCompleted':False}
 digest_out=write_excl(PUBLIC,summary)
 print(json.dumps({'gate':summary['gate'],'rootEntries':51,
  'moveCandidateCount':22,'untouchableNestedDirs':6,'ownerReviewItems':23,
  'decisionGroups':groups,'privateOwnerSheetSha256':sha,
  'sanitizedSummarySha256':digest_out,'productionChanges':False},sort_keys=True))
 return 0

if __name__=='__main__':
 try:sys.exit(main())
 except Exception as exc:
  print(json.dumps({'gate':'432_CUTOVER_OWNER_EXACT_DECISION_SHEET_FAILED_CLOSED',
    'errorClass':type(exc).__name__}),file=sys.stderr)
  sys.exit(3)
