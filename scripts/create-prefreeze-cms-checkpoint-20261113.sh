#!/usr/bin/env bash
# 432 Chamber Orchestra -- PREFREEZE encrypted WordPress checkpoint.
# Read-only against live WordPress. NO order freeze; NEVER claim final snapshot.
# Always keep encrypted SQL and media tar ONLY in private non-webroot staging.
# Must be run under a trusted pinned Everest SSH session. No secrets required.
set -euo pipefail
umask 077
export LC_ALL=C
web=/home/hzorche/public_html
private=/home/hzorche/ra-core-deploy-staging/432-wp-recovery-v2-20261110
cert="$private/recipient-v2-public.pem"
out=/home/hzorche/ra-core-deploy-staging/432-p4-prefreeze-cms-checkpoint-20261113
cutoff='2026-11-07 00:00:00'
fingerprint='F7:54:9D:58:1C:91:D4:E1:20:64:91:A1:64:4F:2F:CE:1F:69:DC:E7:96:B4:F5:B0:02:D0:F7:02:00:47:25:47'
test -d "$web/wp-content" && test -f "$web/wp-config.php"
test -f "$cert" && test -d "$private" && test ! -e "$out"
test "$(openssl x509 -in "$cert" -noout -fingerprint -sha256 | sed 's/^[^=]*=//')" = "$fingerprint"
test "$(stat -c '%a' "$private")" = "700" || {
  echo 'PRIVATE_PARENT_FILE_MODE_NOT_0700';exit 3;
}
before_orders="$(cd "$web" && wp-cli.phar db query "SELECT COUNT(*) FROM wpqt_posts WHERE post_type='shop_order'" --skip-themes --skip-plugins --skip-column-names 2>/dev/null | tr -d '\r\n ')"
before_grants="$(cd "$web" && wp-cli.phar db query "SELECT COUNT(*) FROM wpqt_woocommerce_downloadable_product_permissions" --skip-themes --skip-plugins --skip-column-names 2>/dev/null | tr -d '\r\n ')"
[[ "$before_orders" =~ ^[0-9]+$ ]] && [[ "$before_grants" =~ ^[0-9]+$ ]]
before_files="$(cd "$web" && find wp-content -type f -newermt "$cutoff" | wc -l | tr -d ' ')"
[[ "$before_files" =~ ^[0-9]+$ ]]
mkdir -m 700 "$out"
sqlpart="$out/432-SQL-20261113-PREFREEZE.cms.bin.partial"
deltapart="$out/432-WPCONTENT-20261113-PREFREEZE.cms.bin.partial"
sqlfinal="$out/432-SQL-20261113-PREFREEZE.cms.bin"
deltafinal="$out/432-WPCONTENT-20261113-PREFREEZE.cms.bin"
cd "$web"
# WP CLI exports SQL directly into compression and CMS encryption.
# Pipeline errors are fatal because pipefail is set.
wp-cli.phar db export - --skip-themes --skip-plugins --single-transaction --quick --add-drop-table 2>/dev/null \
  | gzip -n -1 \
  | openssl cms -encrypt -binary -aes-256-cbc -outform DER -recip "$cert" -out "$sqlpart"
test "$(stat -c '%s' "$sqlpart")" -ge 100000
openssl cms -cmsout -inform DER -in "$sqlpart" -noout
mv "$sqlpart" "$sqlfinal"
# Backup only changes after the 7 Nov baseline. This is NOT a complete files backup.
find wp-content -type f -newermt "$cutoff" -print0 \
  | tar --null --verbatim-files-from -T - -czf - \
  | openssl cms -encrypt -binary -aes-256-cbc -outform DER -recip "$cert" -out "$deltapart"
test "$(stat -c '%s' "$deltapart")" -ge 1024
openssl cms -cmsout -inform DER -in "$deltapart" -noout
mv "$deltapart" "$deltafinal"
chmod 600 "$sqlfinal" "$deltafinal"
after_orders="$(wp-cli.phar db query "SELECT COUNT(*) FROM wpqt_posts WHERE post_type='shop_order'" --skip-themes --skip-plugins --skip-column-names 2>/dev/null | tr -d '\r\n ')"
after_grants="$(wp-cli.phar db query "SELECT COUNT(*) FROM wpqt_woocommerce_downloadable_product_permissions" --skip-themes --skip-plugins --skip-column-names 2>/dev/null | tr -d '\r\n ')"
after_files="$(find wp-content -type f -newermt "$cutoff" | wc -l | tr -d ' ')"
# A live pre-freeze checkpoint cannot establish an immutable order boundary.
# It is retained as PRELIMINARY even if counts happen to remain unchanged.
export SNAPSHOT_DIR="$out" START_ORDERS="$before_orders" END_ORDERS="$after_orders"
export START_GRANTS="$before_grants" END_GRANTS="$after_grants"
export START_FILES="$before_files" END_FILES="$after_files"
python3 - <<'PY'
import os,json,hashlib,datetime
root=os.environ['SNAPSHOT_DIR']
files=['432-SQL-20261113-PREFREEZE.cms.bin','432-WPCONTENT-20261113-PREFREEZE.cms.bin']
result={}
for name in files:
 p=os.path.join(root,name)
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for data in iter(lambda:f.read(2**20),b''): h.update(data)
 result[name]={'bytes':os.stat(p).st_size,'sha256':h.hexdigest(),'aes256CMS':True}
counts={key:int(os.environ[key]) for key in ['START_ORDERS','END_ORDERS','START_GRANTS','END_GRANTS','START_FILES','END_FILES']}
receipt={'gate':'432_20261113_ENCRYPTED_SQL_AND_WPCONTENT_DELTA_PREFREEZE_ONLY',
 'createdUTC':datetime.datetime.utcnow().isoformat()+'Z',
 'recipientPublicCertSHA256Fingerprint':'F7:54:9D:58:1C:91:D4:E1:20:64:91:A1:64:4F:2F:CE:1F:69:DC:E7:96:B4:F5:B0:02:D0:F7:02:00:47:25:47',
 'sourceBaselineStart':'2026-11-07 00:00:00',
 'encryptedFiles':result,'counts':counts,
 'ordersIntakeStopped':False,'lastFinalPostFreezeArchive':False,
 'fullIndependentEncryptedBackupCreated':False,
 'recipientPrivateKeyOnEverest':False,
 'sqlPlaintextSavedOnDisk':False,'audioPlaintextSavedInBackupFolder':False,
 'productionWordPressChanges':False,'escrowOrRestoreDrillVerifiedForThisCheckpoint':False}
rpath=os.path.join(root,'432-P4-PREFREEZE-CHECKPOINT-20261113.json')
with os.fdopen(os.open(rpath,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600),'w') as out:
 json.dump(receipt,out,indent=2,sort_keys=True)
print(json.dumps({'gate':receipt['gate'],'encryptedFileCount':2,
 'sqlCipherBytes':result[files[0]]['bytes'],'sqlCipherSha256':result[files[0]]['sha256'],
 'deltaCipherBytes':result[files[1]]['bytes'],'deltaCipherSha256':result[files[1]]['sha256'],
 'orderCountBefore':counts['START_ORDERS'],'orderCountAfter':counts['END_ORDERS'],
 'changedFilesBefore':counts['START_FILES'],'changedFilesAfter':counts['END_FILES'],
 'receiptSHA256':hashlib.sha256(open(rpath,'rb').read()).hexdigest(),
 'productionChanged':False,'finalAfterFreeze':False},sort_keys=True))
PY
echo 'PREFREEZE_ONLY_NO_ORDER_FREEZE_AND_NO_PRODUCTION_CHANGE'
