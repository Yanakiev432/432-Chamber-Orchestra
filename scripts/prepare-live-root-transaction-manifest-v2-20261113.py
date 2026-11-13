#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build an exact read-only WordPress-to-Astro production transaction manifest.

Everest Python 3.6 compatible. Only mutation: creation of two private
owner-only inventory files in a newly created NON-WEBROOT directory.
NEVER writes public_html or replaces the live .htaccess. Fail-closed on
unknown release artifacts, symlinks, filesystem, source SHA or collisions.
"""
from __future__ import print_function
import os, re, sys, json, hashlib, stat, datetime, zipfile
WEB='/home/hzorche/public_html'
STAGE='/home/hzorche/ra-core-deploy-staging/432-astro-main-domain-618files-240dc69-private-unpublished'
PRIVATE='/home/hzorche/ra-core-deploy-staging/432-wp-recovery-v2-20261110'
ZIP='/home/hzorche/ra-core-deploy-staging/432-astro-main-domain-618files-240dc69-20261107.zip'
V6=PRIVATE+'/432-main-domain-astro-apache-v6-16-aliases-20261113.htaccess'
RELEASE=PRIVATE+'/432-APACHE-V6-618-ASSET-LOCKED-RELEASE-PACKET-20261113.json'
MANIFEST_DIR=PRIVATE+'/432-LIVE-TRANSACTION-SCOPED-MANIFEST-20261113-v2'
FULL=MANIFEST_DIR+'/private-cutover-file-transaction-manifest.json'
SANITIZED=PRIVATE+'/432-LIVE-TRANSACTION-SCOPED-READINESS-20261113-v2.json'
ZIP_SHA='9112131bc719c3e80e68d5632a7836c83158d9e06143d66778d07cf51bb30a2a'
V6_SHA='ae9148bec5c7b701d6699c191c37d2f5505766c208f2836d75f73c7d29eee907'
BUNDLE_MANIFEST_SHA='d5f5137b22fa67870eab5ffabc5aa5c0819696286535bd0a86c2c30980b0c965'
OLD_HT_SHA='add4747dda78b4663a4db7deb815243754b0ab7f884c1ca265a439dc216e06cb'
OLD_INDEX_SHA='eea9347b1e266ca5407b92633958c148dbfebea307e511a3a226ea61828e2eba'
PRESERVE=['.well-known','432hz-foundation.com','432project.432hz-orchestra.com','cgi-bin','old','wordpress']
CORE_DIRS=['wp-admin','wp-content','wp-includes']
CORE_MAIN=['index.php']
COLLISION=['robots.txt','sitemap.xml']


def need(ok,reason):
 if not ok:raise RuntimeError(reason)

def digest(path):
 h=hashlib.sha256()
 with open(path,'rb') as f:
  for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
 return h.hexdigest()

def regular(path):
 st=os.lstat(path)
 need(stat.S_ISREG(st.st_mode) and not stat.S_ISLNK(st.st_mode),'UNSAFE_NONREGULAR_FILE')
 return st

def kind(path):
 st=os.lstat(path)
 if stat.S_ISREG(st.st_mode):return 'file'
 if stat.S_ISDIR(st.st_mode):return 'directory'
 if stat.S_ISLNK(st.st_mode):return 'symlink'
 return 'other'

def write_exclusive(path,obj):
 data=(json.dumps(obj,sort_keys=True,indent=2,ensure_ascii=False)+'\n').encode('utf8')
 fd=os.open(path,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
 with os.fdopen(fd,'wb') as out:
  out.write(data)
  out.flush()
  os.fsync(out.fileno())
 return hashlib.sha256(data).hexdigest()

def main():
 os.umask(0o077)
 need(not os.path.lexists(MANIFEST_DIR) and not os.path.lexists(SANITIZED),'MANIFEST_ALREADY_CREATED')
 need(os.path.realpath(WEB)==WEB and os.path.realpath(STAGE)==STAGE
      and os.path.realpath(PRIVATE)==PRIVATE,'SOURCE_ROOT_NOT_PINNED')
 need(os.stat(WEB).st_dev==os.stat(STAGE).st_dev==os.stat(PRIVATE).st_dev,
      'STAGING_NOT_ON_SAME_FILESYSTEM_FOR_TRANSACTION')
 need(digest(ZIP)==ZIP_SHA and digest(V6)==V6_SHA,'RELEASE_ZIP_OR_V6_HASH_CHANGED')
 need(digest(WEB+'/.htaccess')==OLD_HT_SHA
      and digest(WEB+'/index.php')==OLD_INDEX_SHA,'LIVE_ROOT_BASELINE_CHANGED')
 packet=json.load(open(RELEASE))
 need(packet.get('releaseStaticFiles')==618
      and packet.get('privateReleaseZipSha256')==ZIP_SHA
      and packet.get('privateApacheV6Sha256')==V6_SHA
      and packet.get('productionCutoverAllowed') is False,'RELEASE_PACKET_NOT_PINNED')
 need(os.path.isdir(WEB) and os.path.isdir(STAGE),'SOURCE_DIRECTORY_MISSING')
 for p in PRESERVE:
  path=WEB+'/'+p
  need(os.path.isdir(path) and not os.path.islink(path),'PROTECTED_SIBLING_ABSENT_OR_SYMLINK')
 for p in CORE_DIRS:
  path=WEB+'/'+p
  need(os.path.isdir(path) and not os.path.islink(path),'WORDPRESS_CORE_DIR_UNEXPECTED')
 regular(WEB+'/index.php')
 actual={}
 for folder,dirs,files in os.walk(STAGE):
  need(not os.path.islink(folder),'STAGE_DIRECTORY_SYMLINK')
  for name in dirs:
   need(not os.path.islink(os.path.join(folder,name)),'STAGE_SYMLINKED_DIR')
  for name in files:
   path=os.path.join(folder,name)
   regular(path)
   rel=os.path.relpath(path,STAGE).replace(os.sep,'/')
   need(rel and not rel.startswith('/') and '..' not in rel.split('/')
        and '\\' not in rel,'UNSAFE_RELEASE_PATH')
   need(not rel.startswith(tuple(x+'/' for x in PRESERVE+CORE_DIRS)),'RELEASE_OVERLAPS_PROTECTED_ROOT')
   actual[rel]=digest(path)
 need(len(actual)==618,'EXPECTED_618_RELEASE_FILES')
 h=hashlib.sha256()
 for rel in sorted(actual):
  h.update((rel+'\t'+actual[rel]+'\n').encode('utf8'))
 need(h.hexdigest()==BUNDLE_MANIFEST_SHA,'PUBLISH_RELEASE_MANIFEST_SHA256_CHANGED')
 overlaps=[]
 unexpected=[]
 for rel in actual:
  path=WEB+'/'+rel
  if os.path.lexists(path):
   if not os.path.isfile(path) or os.path.islink(path):
    unexpected.append(rel)
   else:
    overlaps.append(rel)
 need(sorted(overlaps)==COLLISION and not unexpected,'EXPECTED_ONLY_ROBOTS_AND_SITEMAP_OVERLAPS')
 entries=[]
 for name in sorted(os.listdir(WEB)):
  path=WEB+'/'+name
  t=kind(path)
  need(t not in ('symlink','other'),'PRODUCTION_ROOT_UNSAFE_SYMLINK_OR_SPECIAL')
  if name in PRESERVE:category='PRESERVE_NESTED_NEVER_MOVE'
  elif name in CORE_DIRS:category='PARK_WORDPRESS_CORE_DIRECTORY_AFTER_APPROVAL'
  elif name=='index.php':category='PARK_WORDPRESS_INDEX_PHP_AFTER_APPROVAL'
  elif name=='.htaccess':category='BACKUP_REPLACE_APACHE_AFTER_APPROVAL'
  elif name in COLLISION:category='BACKUP_REPLACE_PUBLIC_STATIC_AFTER_APPROVAL'
  elif (re.match(r'^wp-[A-Za-z0-9_-]+\.php$',name)
        or name=='xmlrpc.php' or name=='license.txt'):
   category='PARK_WORDPRESS_CORE_ROOT_FILE_AFTER_APPROVAL'
  else:category='OWNER_REVIEW_UNCLASSIFIED_KEEP_UNTOUCHED'
  entries.append({'name':name,'type':t,'category':category,
    'rootFileBytes':os.stat(path).st_size if t=='file' else None,
    'rootFileSha256':digest(path) if t=='file' else None})
 counts={}
 for row in entries:counts[row['category']]=counts.get(row['category'],0)+1
 need(counts.get('PARK_WORDPRESS_CORE_ROOT_FILE_AFTER_APPROVAL')==15, 'WP_ROOT_PHP_CLASSIFICATION_MISMATCH')
 need(len(entries)==51 and len(CORE_DIRS)==3 and len(PRESERVE)==6,
      'EXPECTED_ROOT_BASELINE_51_DRIFTED')
 needed=[x['name'] for x in entries if x['category']=='OWNER_REVIEW_UNCLASSIFIED_KEEP_UNTOUCHED']
 with zipfile.ZipFile(ZIP) as z:
  names=[x.filename for x in z.infolist() if not x.is_dir()]
  need(len(names)==618 and set(names)==set(actual),'RELEASE_ZIP_STAGE_MISMATCH')
 result={
  'schemaVersion':1,
  'gate':'432_REAL_PRODUCTION_ROOT_51_ENTRIES_618_ASTRO_SCOPED_TRANSACTION_MANIFEST_PREPARED',
  'createdUTC':datetime.datetime.utcnow().isoformat()+'Z',
  'liveRootBaselines':{'htaccess':OLD_HT_SHA,'indexPhp':OLD_INDEX_SHA},
  'publicRootExactPath':WEB,'privateStageExactPath':STAGE,
  'sameFilesystemDev':os.stat(WEB).st_dev,
  'releaseV6ApacheSHA256':V6_SHA,
  'releaseZipSha256':ZIP_SHA,
  'release618SortedFileManifestSHA256':BUNDLE_MANIFEST_SHA,
  'staticFileSHA256Allowlist':actual,
  'existingReleaseOverlaps':overlaps,
  'newOnlyReleaseFiles':616,
  'liveRootEntries':entries,
  'rootCategoryCounts':counts,
  'existingRootUnclassifiedNamesRequiringOwnerDecision':needed,
  'allSixNestedSubdirectoriesPreserveUnchanged':True,
  'applyAllowed':False,
  'ownerExactMoveAllowlistApproved':False,
  'productionWordPressDatabaseOrFileModified':False,
  'liveProductionRollbackProven':False,
  'recommendation':'Inspect and explicitly approve every unclassified root name before any owner-authorized live transaction.'
 }
 os.mkdir(MANIFEST_DIR,0o700)
 manifest_sha=write_exclusive(FULL,result)
 safe={
  'gate':'432_EXACT_618_ASSET_AND_51_ROOT_PRODUCTION_TRANSACTION_MANIFEST_READY_ONLY',
  'manifestCreatedUTC':result['createdUTC'],
  'privateManifestSHA256':manifest_sha,
  'releasedStaticFiles':618,'newOnlyReleaseFiles':616,
  'existingOverlaps':COLLISION,
  'rootEntryCount':len(entries),'rootClassificationCounts':counts,
  'ownerUnclassifiedRootEntriesRemaining':len(needed),
  'sixNestedSitesAndProtectedFoldersUntouched':True,
  'sameFilesystem':True,
  'rollbackBaselineRootHtaccessSHA256':OLD_HT_SHA,
  'rollbackBaselineIndexPhpSHA256':OLD_INDEX_SHA,
  'privateManifestContainsWordpressRootNamesDoNotPublish':True,
  'liveCutoverApplied':False,'productionDatabaseChanged':False,
  'ownerSignedFileMoveDecisionApproved':False
 }
 receipt_sha=write_exclusive(SANITIZED,safe)
 print(json.dumps({'gate':safe['gate'],'releaseCount':618,'newOnly':616,
  'overlapCount':2,'rootEntries':51,'categoryCounts':counts,
  'ownerReviewItems':len(needed),
  'privateManifestSHA256':manifest_sha,'privateReceiptSHA256':receipt_sha,
  'liveChanges':False},sort_keys=True))
 return 0

if __name__=='__main__':
 try:sys.exit(main())
 except Exception as exc:
  print(json.dumps({'gate':'432_REAL_ROOT_TRANSACTION_MANIFEST_FAILED_CLOSED',
    'errorClass':type(exc).__name__}),file=sys.stderr)
  sys.exit(3)
