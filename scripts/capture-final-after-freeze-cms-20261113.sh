#!/usr/bin/env bash
# 432 RELEASE-P4. Final encrypted snapshot runner. NEVER freezes checkout itself.
# --preflight is read only; --capture-final requires explicit owner approval.
set -euo pipefail
umask 077
export LC_ALL=C
web=/home/hzorche/public_html
private=/home/hzorche/ra-core-deploy-staging/432-wp-recovery-v2-20261110
manifest="$private/432-LIVE-TRANSACTION-SCOPED-MANIFEST-20261113-v2/private-cutover-file-transaction-manifest.json"
pem="$private/recipient-v2-public.pem"
owner="$private/432-OWNER-P4-FINAL-ARCHIVE-AUTHORIZATION.json"
output=/home/hzorche/ra-core-deploy-staging/432-P4-FINAL-POSTFREEZE-CMS
approval=AUTHORIZE_432_P4_FINAL_SNAPSHOT_AFTER_FREEZE
needsha=1a35bcfcf117b704d98e4cb931f1fdce7fd28862e8e59cde5a38207a192b370c
certfp=F7:54:9D:58:1C:91:D4:E1:20:64:91:A1:64:4F:2F:CE:1F:69:DC:E7:96:B4:F5:B0:02:D0:F7:02:00:47:25:47
test -f "$web/wp-config.php"
test -f "$pem" && test -f "$manifest"
test "$(sha256sum "$manifest" | cut -d' ' -f1)" = "$needsha"
test "$(openssl x509 -in "$pem" -fingerprint -sha256 -noout | cut -d= -f2)" = "$certfp"
test "$(stat -c %a "$private")" = 700

order_counts() {
 cd "$web"
 if wp-cli.phar db query "SHOW TABLES LIKE 'wpqt_wc_orders'" --skip-plugins --skip-themes --skip-column-names 2>/dev/null | grep -qx wpqt_wc_orders; then
   wp-cli.phar db query "SELECT 'posts',COUNT(*),COALESCE(MAX(ID),0) FROM wpqt_posts WHERE post_type='shop_order' UNION ALL SELECT 'grants',COUNT(*),COALESCE(MAX(permission_id),0) FROM wpqt_woocommerce_downloadable_product_permissions UNION ALL SELECT 'hpos',COUNT(*),COALESCE(MAX(id),0) FROM wpqt_wc_orders WHERE type='shop_order'" --skip-plugins --skip-themes --skip-column-names 2>/dev/null
 else
   wp-cli.phar db query "SELECT 'posts',COUNT(*),COALESCE(MAX(ID),0) FROM wpqt_posts WHERE post_type='shop_order' UNION ALL SELECT 'grants',COUNT(*),COALESCE(MAX(permission_id),0) FROM wpqt_woocommerce_downloadable_product_permissions" --skip-plugins --skip-themes --skip-column-names 2>/dev/null
 fi
}
case "$1" in
 --preflight)
   order_counts | python3 -c 'import sys,json
a=[l.split() for l in sys.stdin if l.strip()]
assert len(a) in (2,3) and all(len(r)==3 and r[1].isdigit() and r[2].isdigit() for r in a)
print(json.dumps({"gate":"432_FINAL_ARCHIVE_PREPARED_NOT_AUTHORIZED","databaseCounters":{r[0]:{"rows":int(r[1]),"maxId":int(r[2])} for r in a},"ownerAuthorization":False,"finalSnapshotCaptured":False,"productionChanged":False},sort_keys=True))'
   test ! -e "$output"
   ;;
 --capture-final)
   if [ "$#" -ne 2 ] || [ "$2" != "$approval" ]; then
     echo "REFUSED_MISSING_EXACT_FINAL_CAPTURE_AUTHORIZATION" >&2;exit 4
   fi
   test ! -e "$output" || { echo "REFUSE_EXISTING_FINAL_TARGET" >&2;exit 4; }
   OWNER_GATE="$owner" ROOT_PATH="$web" python3 - <<'PY'
import os,json,datetime,hashlib
p=os.environ['OWNER_GATE']
if not os.path.isfile(p) or os.path.islink(p) or (os.stat(p).st_mode & 0o077):
 raise RuntimeError('PRIVATE_OWNER_APPROVAL_NOT_PRESENT')
with open(p,'rb') as f:raw=f.read(16000)
if len(raw)>=16000: raise RuntimeError('OWNER_APPROVAL_TOO_LARGE')
x=json.loads(raw)
if x.get('gate')!='432_OWNER_P4_FINAL_POSTFREEZE_CAPTURE_APPROVAL':
 raise RuntimeError('WRONG_OWNER_APPROVAL_GATE')
fields=('approvedByOwner','allCheckoutChannelsBlocked','inflightPaymentsReconciled',
 'paymentWebhooksDrained','historicalBuyersPolicyApproved',
 'independentFullEncryptedBackupVerified','offLenovoPfxPasswordEscrowVerified',
 'exactWebrootScopeAndRollbackApproved','finalP4CaptureApproved')
if not all(x.get(k) is True for k in fields):raise RuntimeError('APPROVAL_DEPENDENCIES_MISSING')
when=datetime.datetime.strptime(x['approvedAtUtc'],'%Y-%m-%dT%H:%M:%SZ')
if not 0 <= (datetime.datetime.utcnow()-when).total_seconds() <= 1800:
 raise RuntimeError('OWNER_APPROVAL_EXPIRED')
expected=x.get('frozenRootHtaccessSha256','')
if len(expected)!=64 or any(c not in '0123456789abcdef' for c in expected):
 raise RuntimeError('MISSING_POSTFREEZE_HTACCESS_PIN')
actual=hashlib.sha256(open(os.environ['ROOT_PATH']+'/.htaccess','rb').read()).hexdigest()
if expected!=actual:raise RuntimeError('FROZEN_CONFIGURATION_HASH_CHANGED')
PY
   before="$(order_counts)"
   mkdir -m 700 "$output"
   cd "$web"
   sql="$output/432-WP-FINAL-SQL.cms.bin"
   media="$output/432-WP-FINAL-FILES.cms.bin"
   # No plaintext files: SQL and full scoped file TAR are streamed into CMS.
   wp-cli.phar db export - --skip-plugins --skip-themes --single-transaction --quick --add-drop-table 2>/dev/null \
     | gzip -n -1 | openssl cms -encrypt -binary -aes-256-cbc -outform DER -recip "$pem" -out "$sql.partial"
   test "$(stat -c %s "$sql.partial")" -gt 100000
   openssl cms -cmsout -inform DER -in "$sql.partial" -noout
   mv "$sql.partial" "$sql"
   python3 - "$manifest" <<'PY' | tar --null --verbatim-files-from -T - -czf - | openssl cms -encrypt -binary -aes-256-cbc -outform DER -recip "$pem" -out "$media.partial"
import json,sys
data=json.load(open(sys.argv[1]))
cats={'PARK_WORDPRESS_CORE_DIRECTORY_AFTER_APPROVAL','PARK_WORDPRESS_CORE_ROOT_FILE_AFTER_APPROVAL','PARK_WORDPRESS_INDEX_PHP_AFTER_APPROVAL','BACKUP_REPLACE_APACHE_AFTER_APPROVAL','BACKUP_REPLACE_PUBLIC_STATIC_AFTER_APPROVAL'}
files=[x['name'] for x in data['liveRootEntries'] if x['category'] in cats]
if len(files)!=22 or any('/' in n or '\\' in n or not n for n in files):
 raise RuntimeError('FINAL_FILE_SCOPE_CHANGED')
for f in sorted(files):sys.stdout.buffer.write(f.encode('utf8')+b'\0')
PY
   test "$(stat -c %s "$media.partial")" -gt 100000
   openssl cms -cmsout -inform DER -in "$media.partial" -noout
   mv "$media.partial" "$media"
   chmod 600 "$sql" "$media"
   after="$(order_counts)"
   export PRE="$before" POST="$after" FINAL_DIR="$output"
   python3 - <<'PY'
import hashlib,json,os,datetime
def parse(x):
 r=[s.split() for s in x.strip().splitlines()]
 if len(r) not in (2,3) or any(len(s)!=3 for s in r):
  raise RuntimeError('ORDER_COUNTERS_SCHEMA_CHANGED')
 return {s[0]:[int(s[1]),int(s[2])] for s in r}
pre=parse(os.environ['PRE']);post=parse(os.environ['POST'])
stable=pre==post
files={}
for name in ('432-WP-FINAL-SQL.cms.bin','432-WP-FINAL-FILES.cms.bin'):
 p=os.path.join(os.environ['FINAL_DIR'],name)
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 files[name]={'bytes':os.path.getsize(p),'sha256':h.hexdigest()}
report={'gate':('432_P4_POSTFREEZE_ENCRYPTED_CANDIDATE_NOT_INDEPENDENTLY_RESTORED' if stable else '432_P4_CAPTURE_NOT_ACCEPTED_SOURCE_ORDER_COUNT_CHANGED'),
'createdUtc':datetime.datetime.utcnow().isoformat()+'Z',
'ownerManuallyAttestedOrderFreeze':True,'independentMachineOrderFreezeProven':False,
'before':pre,'after':post,'countersUnchanged':stable,
'encryptedFiles':files,'fullScopedWordPressRootsIncluded':22,
'nonTargetSitesExcluded':True,'sourceWordPressModified':False,
'actualOffhostCopyCompleted':False,'separateRestoreCompleted':False,
'finalCutoverApproved':False}
p=os.path.join(os.environ['FINAL_DIR'],'432-P4-POSTFREEZE-STATUS.json')
with os.fdopen(os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600),'w') as f:json.dump(report,f,indent=2,sort_keys=True)
print(json.dumps({'gate':report['gate'],'countsUnchanged':stable,
 'encryptedFiles':files,'receiptSha256':hashlib.sha256(open(p,'rb').read()).hexdigest()},sort_keys=True))
if not stable:raise SystemExit(5)
PY
   ;;
 *) echo "USAGE: --preflight | --capture-final EXACT_OWNER_AUTHORIZATION" >&2;exit 2 ;;
esac
