#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Private-only durable-journal crash recovery for exact 51 root / 618 Astro scope.

Runs 7 isolated synthetic file transactions on Everest; 6 workers are
abruptly killed by SIGKILL. Recovery is a NEW process, using an fsync'd
journal + actual filesystem state, never in-memory worker state.

No prod --apply, no access to actual web root, no paid media/PII.
Python 3.6 compatible. Every fixture must be under PRIVATE and contain
a marker written by this program. Full user release paths are read
from SHA-pinned owner-private manifest, not hard-coded in public output.
"""
from __future__ import print_function
import argparse, datetime, hashlib, json, os, shutil, signal, stat, subprocess, sys, tempfile

PRIVATE='/home/hzorche/ra-core-deploy-staging/432-wp-recovery-v2-20261110'
MANIFEST=PRIVATE+'/432-LIVE-TRANSACTION-SCOPED-MANIFEST-20261113-v2/private-cutover-file-transaction-manifest.json'
EXPECTED='1a35bcfcf117b704d98e4cb931f1fdce7fd28862e8e59cde5a38207a192b370c'
RECEIPT=PRIVATE+'/432-EXACT-51-ROOT-DURABLE-JOURNAL-SIGKILL-ROLLBACK-20261113.json'
NESTED=set(['.well-known','432hz-foundation.com','432project.432hz-orchestra.com','cgi-bin','old','wordpress'])
MOVE_CATS=set(['PARK_WORDPRESS_CORE_DIRECTORY_AFTER_APPROVAL','PARK_WORDPRESS_CORE_ROOT_FILE_AFTER_APPROVAL',
              'PARK_WORDPRESS_INDEX_PHP_AFTER_APPROVAL','BACKUP_REPLACE_APACHE_AFTER_APPROVAL',
              'BACKUP_REPLACE_PUBLIC_STATIC_AFTER_APPROVAL'])
OVERLAP=set(['robots.txt','sitemap.xml'])
CASES=['kill-after-first-rename','kill-after-all-renames','kill-inside-partial-file',
       'kill-after-first-static','kill-after-half-static','kill-after-all-static',
       'kill-after-apache-v6']


def check(condition,reason):
 if not condition:raise RuntimeError(reason)

def file_sha(path):
 h=hashlib.sha256()
 with open(path,'rb') as f:
  for block in iter(lambda:f.read(65536),b''):h.update(block)
 return h.hexdigest()

def syncdir(d):
 fd=os.open(d,os.O_RDONLY)
 try:os.fsync(fd)
 finally:os.close(fd)

def store(path,obj):
 tmp=path+'.tmp'
 check(not os.path.lexists(tmp),'STALE_JOURNAL_TEMP')
 with open(tmp,'wb') as f:
  body=(json.dumps(obj,sort_keys=True,indent=2)+'\n').encode('utf8')
  f.write(body);f.flush();os.fsync(f.fileno())
 os.rename(tmp,path)
 syncdir(os.path.dirname(path))

def config():
 check(file_sha(MANIFEST)==EXPECTED,'PINNED_ROOT_MANIFEST_HASH_CHANGED')
 j=json.load(open(MANIFEST))
 check(j['applyAllowed'] is False,'UNEXPECTED_OWNER_APPROVAL')
 rows=j['liveRootEntries']; files=j['staticFileSHA256Allowlist']
 check(len(rows)==51 and len(files)==618,'INVENTORY_SIZE_CHANGED')
 moved=sorted(x['name'] for x in rows if x['category'] in MOVE_CATS)
 protected=set(x['name'] for x in rows if x['category']=='PRESERVE_NESTED_NEVER_MOVE')
 check(len(moved)==22 and protected==NESTED,'PHYSICAL_SIBLING_SCOPE_CHANGED')
 check(set(x for x in moved if x in files)==OVERLAP,'ONLY_TWO_EXPECTED_COLLISIONS')
 check(all('/' not in name and name not in ('..','.') for name in moved),'UNSAFE_MOVE_PATH')
 check(all(not p.startswith('/') and '..' not in p.split('/') and '\\' not in p for p in files),
       'UNSAFE_RELEASE_PATH')
 return j,moved,sorted(files)

def guard_fixture(parent):
 # Make it cryptographically and path-wise impossible to operate on live root.
 root=os.path.realpath(parent)
 check(root.startswith(PRIVATE+'/432-SIGKILL-FIXTURE-'),'NOT_AN_ISOLATED_FIXTURE')
 check(os.path.isdir(root),'FIXTURE_FOLDER_MISSING')
 marker=root+'/.432-fake-site-only'
 check(os.path.isfile(marker) and open(marker,'rb').read()==b'NO-PRODUCTION-OPERATIONS',
       'SYNTHETIC_FIXTURE_MARKER_MISSING')
 return root

def fake_file(path,data):
 d=os.path.dirname(path)
 if not os.path.isdir(d):os.makedirs(d)
 with open(path,'wb') as f:f.write(data)

def snapshot(root):
 out={}
 for here,dirs,files in os.walk(root):
  dirs.sort();files.sort()
  out['dir:'+os.path.relpath(here,root)]=True
  for name in files:
   p=os.path.join(here,name)
   out['file:'+os.path.relpath(p,root)]=file_sha(p)
 return out

def make_fixture(parent,inv,files):
 os.mkdir(parent,0o700)
 fake_file(parent+'/.432-fake-site-only',b'NO-PRODUCTION-OPERATIONS')
 real=parent+'/web'; stage=parent+'/stage'; backup=parent+'/parked'
 os.mkdir(real,0o700)
 os.mkdir(stage,0o700)
 os.mkdir(backup,0o700)
 for item in inv['liveRootEntries']:
  dst=real+'/'+item['name']
  if item['type']=='directory':
   os.mkdir(dst)
   fake_file(dst+'/__DUMMY_ORIGINAL_CANARY',b'PREEXISTING_'+item['name'].encode('utf8'))
  else:
   fake_file(dst,b'PREEXISTING_'+item['name'].encode('utf8'))
 for rel in files:fake_file(stage+'/'+rel,b'SYNTHETIC_ASTRO_'+rel.encode('utf8'))
 check(set(x for x in files if os.path.lexists(real+'/'+x))==OVERLAP,'UNEXPECTED_FIXTURE_COLLISIONS')
 j={'gate':'432_DURABLE_JOURNAL_FIXTURE_ARMED','manifestSha256':EXPECTED,
    'scopeMoves':22,'assets':618,'state':'PREPARED','createdUtc':datetime.datetime.utcnow().isoformat()+'Z'}
 store(parent+'/transaction-journal.json',j)
 return snapshot(real)

def worker(parent,inject,moved,files):
 root=guard_fixture(parent);live=root+'/web';backup=root+'/parked';stage=root+'/stage'
 journal=root+'/transaction-journal.json'
 j=json.load(open(journal))
 check(j['state']=='PREPARED' and j['manifestSha256']==EXPECTED,'JOURNAL_NOT_PREPARED')
 j['state']='ACTIVE'
 store(journal,j)
 def killer(where):
  if where==inject:os.kill(os.getpid(),signal.SIGKILL)
 for i,name in enumerate(moved,1):
  src=live+'/'+name;to=backup+'/'+name
  check(os.path.lexists(src) and not os.path.lexists(to),'INCONSISTENT_PARK_STATE')
  os.rename(src,to);syncdir(live);syncdir(backup)
  if i==1:killer('kill-after-first-rename')
  if i==22:killer('kill-after-all-renames')
 for i,rel in enumerate(files,1):
  src=stage+'/'+rel;dst=live+'/'+rel
  check(os.path.isfile(src) and not os.path.lexists(dst),'PUBLISHED_PATH_ALREADY_PRESENT')
  d=os.path.dirname(dst)
  if not os.path.isdir(d):os.makedirs(d)
  part=dst+'.432incomplete'
  check(not os.path.lexists(part),'LEFTOVER_PARTIAL_FILE')
  with open(part,'wb') as f:
   if inject=='kill-inside-partial-file' and i==1:
    f.write(b'PARTIAL_SOURCE_CRASH')
    f.flush();os.fsync(f.fileno())
    killer('kill-inside-partial-file')
   with open(src,'rb') as source:shutil.copyfileobj(source,f)
   f.flush();os.fsync(f.fileno())
  os.rename(part,dst);syncdir(d)
  if i==1:killer('kill-after-first-static')
  if i==309:killer('kill-after-half-static')
  if i==618:killer('kill-after-all-static')
 # V6 is fake; no real Apache or live root modified.
 check(not os.path.lexists(live+'/.htaccess'),'OLD_HTACCESS_NOT_MOVED')
 fake_file(live+'/.htaccess',b'SYNTHETIC_V6_NO_REAL_APACHE')
 syncdir(live)
 killer('kill-after-apache-v6')
 j['state']='COMPLETED_SYNTHETIC'
 store(journal,j)

def recover(parent,moved,files):
 root=guard_fixture(parent);live=root+'/web';backup=root+'/parked'
 journal=root+'/transaction-journal.json';j=json.load(open(journal))
 check(j['state'] in ('ACTIVE','COMPLETED_SYNTHETIC'),'JOURNAL_NEVER_ARMED')
 check(j['manifestSha256']==EXPECTED and j['scopeMoves']==22 and j['assets']==618,'JOURNAL_SCOPE_MISMATCH')
 # Recovery uses observed filesystem state, not assumed completed steps.
 # In particular, NEVER delete original robots/sitemap/.htaccess unless
 # a parked original exists. A SIGKILL before the corresponding rename
 # must leave originals byte-for-byte intact.
 removed=0;part=0
 for rel in files:
  dst=live+'/'+rel
  partial=dst+'.432incomplete'
  if os.path.lexists(partial):
   check(os.path.isfile(partial) and not os.path.islink(partial),'UNSAFE_PARTIAL')
   os.unlink(partial);part+=1
  if rel in OVERLAP and not os.path.lexists(backup+'/'+rel):
   # An original unparked robots/sitemap must NOT be deleted.
   check(os.path.isfile(dst),'ORIGINAL_OVERLAP_MISSING')
   continue
  if os.path.lexists(dst):
   check(os.path.isfile(dst) and not os.path.islink(dst),'UNSAFE_NEW_STATIC_FILE')
   os.unlink(dst);removed+=1
 if os.path.lexists(backup+'/.htaccess'):
  candidate=live+'/.htaccess'
  if os.path.lexists(candidate):
   check(os.path.isfile(candidate) and not os.path.islink(candidate),'UNEXPECTED_HTACCESS')
   os.unlink(candidate)
 elif not os.path.isfile(live+'/.htaccess'):raise RuntimeError('MISSING_UNMOVED_ORIGINAL_APACHE')
 ancestors=set()
 for rel in files:
  dirpart=os.path.dirname(rel)
  while dirpart:
   ancestors.add(dirpart)
   dirpart=os.path.dirname(dirpart)
 for rel in sorted(ancestors,key=lambda x:len(x.split('/')),reverse=True):
  d=live+'/'+rel
  if os.path.isdir(d) and not os.listdir(d):os.rmdir(d)
 restored=0
 for rel in reversed(moved):
  src=backup+'/'+rel;dst=live+'/'+rel
  if os.path.lexists(src):
   check(not os.path.lexists(dst),'ROLLBACK_REFUSES_TO_OVERWRITE_UNKNOWN_SOURCE')
   os.rename(src,dst);restored+=1
  else:
   check(os.path.lexists(dst),'LOST_ORIGINAL_WITHOUT_BACKUP')
 j['state']='ROLLBACK_RESTORED'
 j['recoveryRemovedInstalledStatic']=removed
 j['recoveryRemovedPartialFiles']=part
 j['recoveryParkedOriginalsRestored']=restored
 store(journal,j)
 return restored,removed,part

def main():
 ap=argparse.ArgumentParser()
 ap.add_argument('--rehearse-crash-recovery',action='store_true')
 ap.add_argument('--fixture-worker',help=argparse.SUPPRESS)
 ap.add_argument('--inject',default='')
 ap.add_argument('--fixture-recover',help=argparse.SUPPRESS)
 args=ap.parse_args()
 inv,moved,files=config()
 if args.fixture_worker:
  worker(args.fixture_worker,args.inject,moved,files);return 0
 if args.fixture_recover:
  out=recover(args.fixture_recover,moved,files)
  print(json.dumps({'recovered':True,'restoredOriginalCount':out[0],
    'removedSyntheticReleaseFiles':out[1],'removedPartialFiles':out[2]}))
  return 0
 check(args.rehearse_crash_recovery,'ONLY_PRIVATE_REHEARSAL_MODE_IMPLEMENTED')
 check(not os.path.lexists(RECEIPT),'REHEARSAL_ALREADY_DONE')
 result=[]
 with tempfile.TemporaryDirectory(prefix='432-SIGKILL-FIXTURE-',dir=PRIVATE) as temp:
  for case in CASES:
   folder=temp+'/'+case
   before=make_fixture(folder,inv,files)
   child_process=subprocess.run([sys.executable,os.path.realpath(__file__),
     '--fixture-worker',folder,'--inject',case],stdout=subprocess.PIPE,
     stderr=subprocess.PIPE,timeout=25)
   check(child_process.returncode==-signal.SIGKILL,'WORKER_NOT_HARD_KILLED_AS_DESIGNED')
   res=subprocess.run([sys.executable,os.path.realpath(__file__),
     '--fixture-recover',folder],stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=25)
   check(res.returncode==0,'INDEPENDENT_RECOVERY_PROCESS_FAILED')
   info=json.loads(res.stdout)
   after=snapshot(folder+'/web')
   check(before==after,'SOURCE_TREE_NOT_BYTE_IDENTICAL_AFTER_CRASH')
   check(all(os.path.isdir(folder+'/web/'+x) for x in NESTED),'PROTECTED_SIBLING_LOST')
   check(json.load(open(folder+'/transaction-journal.json'))['state']=='ROLLBACK_RESTORED',
         'JOURNAL_NOT_DURABLY_ROLLED_BACK')
   result.append({'crashCase':case,'hardKillObserved':True,
     'independentRecoverySubprocess':True,'byteIdenticalTreeRestored':True,
     'restoredOriginals':info['restoredOriginalCount'],
     'removedStagedFiles':info['removedSyntheticReleaseFiles'],
     'removedIncompleteFiles':info['removedPartialFiles']})
 os.umask(0o077)
 report={'gate':'432_RELEASE_P3_JOURNALED_7_HARD_SIGKILL_SCENARIOS_INDEPENDENT_ROLLBACK_PASS',
   'checkedUTC':datetime.datetime.utcnow().isoformat()+'Z',
   'sourcePrivateInventorySHA256':EXPECTED,
   'rootEntries':51,'targetStaticFilePaths':618,'rootParkCandidates':22,
   'preservedNestedDirectories':6,'powerLossStyleHardKillCases':len(result),
   'allIndependentRecoveryProcessRestoredByteIdentical':True,
   'scenarios':result,'originalPaidAudioUsed':False,'realCustomerDataUsed':False,
   'productionWebrootModified':False,'journalCanRestoreOnRealProduction':False,
   'ownerApprovalStatus':False,'productionExecutorImplemented':False}
 fd=os.open(RECEIPT,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
 with os.fdopen(fd,'w') as f:json.dump(report,f,sort_keys=True,indent=2)
 print(json.dumps({'gate':report['gate'],'hardKills':len(result),
   'separateRecoveryProcesses':len(result),'allByteIdentical':True,
   'receiptSha256':file_sha(RECEIPT),'productionModified':False}))
 return 0

if __name__=='__main__':
 try:sys.exit(main())
 except Exception as e:
  print(json.dumps({'gate':'432_SIGKILL_RECOVERY_FAILED_CLOSED','errorClass':type(e).__name__}),file=sys.stderr)
  sys.exit(3)
