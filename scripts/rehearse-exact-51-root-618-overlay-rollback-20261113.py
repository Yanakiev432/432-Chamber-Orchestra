#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""RELEASE-P3/P4 scoped rollback rehearsal. NO production mutation capability.

Consumes SHA256-pinned actual 51-root / 618-static owner-private manifest.
Builds a private synthetic mirror with identical *paths*, but synthetic bytes.
Executes exact move -> Astro overlay -> V6 Apache swap -> rollback,
including fail injection at each critical step; verifies original 51-path
snapshot and all six protected directories survive byte-identically.

No --apply option exists. Does not touch public_html or WordPress DB.
Everest Python 3.6 compatible; secrets and paid masters never copied.
"""
from __future__ import print_function
import argparse, hashlib, json, os, shutil, stat, sys, tempfile, datetime

PRIVATE='/home/hzorche/ra-core-deploy-staging/432-wp-recovery-v2-20261110'
MANIFEST=PRIVATE+'/432-LIVE-TRANSACTION-SCOPED-MANIFEST-20261113-v2/private-cutover-file-transaction-manifest.json'
MANIFEST_SHA='1a35bcfcf117b704d98e4cb931f1fdce7fd28862e8e59cde5a38207a192b370c'
RECEIPT=PRIVATE+'/432-EXACT-51-ROOT-618-OVERLAY-ROLLBACK-REHEARSAL-20261113.json'
WEB='/home/hzorche/public_html'
STAGE='/home/hzorche/ra-core-deploy-staging/432-astro-main-domain-618files-240dc69-private-unpublished'
PRESERVE=set(['.well-known','432hz-foundation.com','432project.432hz-orchestra.com','cgi-bin','old','wordpress'])
CATS=set(['PARK_WORDPRESS_CORE_DIRECTORY_AFTER_APPROVAL','PARK_WORDPRESS_CORE_ROOT_FILE_AFTER_APPROVAL',
          'PARK_WORDPRESS_INDEX_PHP_AFTER_APPROVAL','BACKUP_REPLACE_APACHE_AFTER_APPROVAL',
          'BACKUP_REPLACE_PUBLIC_STATIC_AFTER_APPROVAL'])
EXPECTED_OVERLAPS=set(['robots.txt','sitemap.xml'])
CHUNK=65536

def check(ok,why):
 if not ok:raise RuntimeError(why)

def digest(blob):
 return hashlib.sha256(blob).hexdigest()

def file_digest(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for block in iter(lambda:f.read(CHUNK),b''):
   h.update(block)
 return h.hexdigest()

def make_file(path, content):
 par=os.path.dirname(path)
 if not os.path.isdir(par):os.makedirs(par)
 with open(path,'wb') as f:f.write(content)

def tree_snapshot(root):
 """Tiny synthetic fixtures only; directory and file content fingerprints."""
 data={}
 for here,dirs,files in os.walk(root):
  dirs.sort();files.sort()
  rel=os.path.relpath(here,root)
  data['D:'+rel]='directory'
  for f in files:
   p=os.path.join(here,f)
   check(not os.path.islink(p),'UNSAFE_TEST_SYMLINK')
   data['F:'+os.path.relpath(p,root)]=file_digest(p)
 return data

def roll_back(root,rollback,moves,published):
 """Never rename over existing live data: moves and installations tracked explicitly."""
 for rel in reversed(published):
  file=os.path.join(root,rel)
  if os.path.exists(file):
   check(os.path.isfile(file) and not os.path.islink(file),'UNSAFE_PUBLISHED_FILE')
   os.unlink(file)
 # Remove new empty directory trees only, from deepest to shallowest.
 candidates=[]
 for rel in published:
  par=os.path.dirname(rel)
  while par and par not in candidates:
   candidates.append(par)
   par=os.path.dirname(par)
 for rel in sorted(candidates,key=lambda x:len(x.split('/')),reverse=True):
  path=os.path.join(root,rel)
  if os.path.isdir(path) and not os.listdir(path):os.rmdir(path)
 for rel in reversed(moves):
  from_rollback=os.path.join(rollback,rel)
  dst=os.path.join(root,rel)
  check(os.path.lexists(from_rollback) and not os.path.lexists(dst),'UNSAFE_ROLLBACK_RESTORE')
  os.rename(from_rollback,dst)

def execute_on_synthetic(root,stage,m,inject):
 rows=m['liveRootEntries']
 selected=[x['name'] for x in rows if x['category'] in CATS]
 releases=sorted(m['staticFileSHA256Allowlist'])
 check(len(selected)==22 and len(releases)==618,'SCOPE_COUNTS_NOT_PINNED')
 check(not PRESERVE.intersection(selected),'NESTED_DIRECTORY_IN_MOVE_SCOPE')
 check(set(x for x in releases if os.path.lexists(os.path.join(root,x)))==EXPECTED_OVERLAPS,
       'UNEXPECTED_OVERLAP_IN_FIXTURE')
 rollback=os.path.join(os.path.dirname(root),'rollback')
 os.mkdir(rollback,0o700)
 moved=[];published=[]
 # Rehearsal actively exercises the same atomic rename strategy
 # expected for a future guarded production runner.
 try:
  for i,rel in enumerate(selected,1):
   a=os.path.join(root,rel)
   b=os.path.join(rollback,rel)
   check(os.path.lexists(a) and not os.path.lexists(b),'BAD_MOVEMENT_STATE')
   os.rename(a,b)
   moved.append(rel)
   if inject=='first-move' and i==1:raise RuntimeError('SIMULATED_INTERRUPTION')
   if inject=='all-moves' and i==22:raise RuntimeError('SIMULATED_INTERRUPTION')
  for i,rel in enumerate(releases,1):
   a=os.path.join(stage,rel)
   dst=os.path.join(root,rel)
   check(not os.path.lexists(dst) and os.path.isfile(a),'PUBLISH_TARGET_ALREADY_EXISTS')
   par=os.path.dirname(dst)
   if not os.path.isdir(par):os.makedirs(par)
   shutil.copyfile(a,dst)
   published.append(rel)
   if inject=='first-asset' and i==1:raise RuntimeError('SIMULATED_INTERRUPTION')
   if inject=='half-assets' and i==309:raise RuntimeError('SIMULATED_INTERRUPTION')
   if inject=='all-assets' and i==618:raise RuntimeError('SIMULATED_INTERRUPTION')
  v6=os.path.join(root,'.htaccess')
  check(not os.path.exists(v6),'APACHE_TARGET_ALREADY_EXISTS')
  make_file(v6,b'APACHE_V6_SYNTHETIC_NEVER_PUBLISH\n')
  published.append('.htaccess')
  if inject=='apache-v6':raise RuntimeError('SIMULATED_INTERRUPTION')
  check(len(published)==619,'FULL_RELEASE_ASSET_COUNT_INVALID')
 finally:
  roll_back(root,rollback,moved,published)
 return {'relocated':22,'published':len(published),'restored':len(moved),'injected':inject!='success'}

def main():
 parser=argparse.ArgumentParser(description='Dry-only private fixture. Production apply is NOT implemented.')
 parser.add_argument('--rehearse',action='store_true')
 args=parser.parse_args()
 check(args.rehearse,'EXPLICIT_FIXTURE_MODE_ONLY')
 check(not os.path.lexists(RECEIPT),'REHEARSAL_RECEIPT_ALREADY_EXISTS')
 check(file_digest(MANIFEST)==MANIFEST_SHA,'PRIVATE_51_ENTRY_MANIFEST_CHANGED')
 j=json.load(open(MANIFEST))
 check(j['gate']=='432_REAL_PRODUCTION_ROOT_51_ENTRIES_618_ASTRO_SCOPED_TRANSACTION_MANIFEST_PREPARED','SOURCE_GATE_CHANGED')
 check(j['applyAllowed'] is False and j['ownerExactMoveAllowlistApproved'] is False,'MUST_BE_UNAPPROVED_READONLY_REHEARSAL')
 check(j['publicRootExactPath']==WEB and j['privateStageExactPath']==STAGE,'SOURCE_ROOT_CHANGED')
 check(len(j['liveRootEntries'])==51 and len(j['staticFileSHA256Allowlist'])==618,'EXACT_ROOT_OR_ASTRO_SCOPE_CHANGED')
 check(len([x for x in j['liveRootEntries'] if x['category'] in CATS])==22,'MOVE_SCOPE_CHANGED')
 check(len([x for x in j['liveRootEntries'] if x['category']=='PRESERVE_NESTED_NEVER_MOVE'])==6,'SIBLING_SCOPE_CHANGED')
 check(not any(os.path.islink(os.path.join(WEB,x)) for x in PRESERVE),'REAL_NESTED_SYMLINK_CHANGED')
 cases=['success','first-move','all-moves','first-asset','half-assets','all-assets','apache-v6']
 checks=[]
 with tempfile.TemporaryDirectory(prefix='432-atomic-51-rollback-',dir=PRIVATE) as temp:
  for case in cases:
   parent=os.path.join(temp,case)
   root=os.path.join(parent,'test-public-root')
   stage=os.path.join(parent,'test-astro-staging')
   os.makedirs(root)
   os.makedirs(stage)
   for row in j['liveRootEntries']:
    name=row['name'];path=os.path.join(root,name)
    if row['type']=='directory':
     os.mkdir(path)
     make_file(os.path.join(path,'CANARY_PRIVATE_CONTENT.txt'),b'PRIVATE_PRESERVED_'+name.encode('utf8'))
    else:
     make_file(path,b'PRIVATE_OLD_ROOT_ENTRY_'+name.encode('utf8'))
   for rel in j['staticFileSHA256Allowlist']:
    make_file(os.path.join(stage,rel),b'ASTRO_DUMMY_FOR_'+rel.encode('utf8'))
   before=tree_snapshot(root)
   check(len(before)>51,'CANARY_MIRROR_INCOMPLETE')
   ignored_error=False
   try:
    out=execute_on_synthetic(root,stage,j,case)
   except RuntimeError as error:
    check(str(error)=='SIMULATED_INTERRUPTION','UNEXPECTED_REHEARSAL_RUNTIME_ERROR')
    ignored_error=True
   check((case=='success') != ignored_error,'FAILURE_INJECTION_NOT_WORKING')
   after=tree_snapshot(root)
   check(before==after,'SYNTHETIC_ROOT_NOT_BIT_IDENTICAL_AFTER_ROLLBACK')
   for child in PRESERVE:
    check(os.path.isdir(os.path.join(root,child)),'NESTED_DIRECTORY_LOST')
   checks.append({'case':case,'sourceStateRestored':True,'interruptionSimulated':ignored_error,
                  'originalSnapshotEntries':len(before),'sourceFilesOrDirsRemoved':0})
 result={
  'gate':'432_REAL_51_TOPLEVEL_SCOPE_618_STATIC_FIXTURE_SEVEN_ATOMIC_ROLLBACKS_PASS',
  'testedUTC':datetime.datetime.utcnow().isoformat()+'Z',
  'sourceRealRootManifestSHA256':MANIFEST_SHA,
  'rehearsalCases':checks,
  'interruptedFailureCases':6,
  'completeSuccessfulSwitchCases':1,
  'totalFullRootByteIdenticalRestorations':7,
  'releaseStaticFilesPerFullCase':618,
  'exactRootParkAndBackupEntries':22,
  'protectedSiblingDirectories':6,
  'simulatedNotRealAudioOrBuyerData':True,
  'productionWordPressModified':False,
  'productionRollbackValidated':False,
  'supportedProdApplyCommandExists':False,
  'ownerProductionApproval':False
 }
 os.umask(0o077)
 fd=os.open(RECEIPT,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'w') as f:
  json.dump(result,f,sort_keys=True,indent=2)
 print(json.dumps({'gate':result['gate'],'simulatedScenarios':len(checks),
  'faultInjections':6,'exactRootEntries':51,'releaseFiles':618,
  'protectedSiblingDirectories':6,'receiptSha256':file_digest(RECEIPT),
  'productionModified':False},sort_keys=True))
 return 0

if __name__=='__main__':
 try:sys.exit(main())
 except Exception as e:
  print(json.dumps({'gate':'432_ATOMIC_ROLLBACK_REHEARSAL_FAILED_CLOSED',
    'errorClass':type(e).__name__}),file=sys.stderr)
  sys.exit(3)
