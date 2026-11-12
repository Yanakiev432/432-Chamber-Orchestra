"""Synthetic-only tests for non-deployed, owner-gated legacy buyer delivery."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import threading
import time
import unittest
from urllib.request import urlopen
from urllib.error import HTTPError

SOURCE=Path(__file__).resolve().parents[1]/"scripts"/"historical_buyer_private_delivery.py"
spec=importlib.util.spec_from_file_location("buyer_private_delivery",str(SOURCE))
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


@unittest.skipUnless(os.name=="posix","private service requires POSIX file modes and flock")
class BuyerDeliverySecurityTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix="432-purchase-synthetic-")
        base=Path(self.tmp.name)
        self.media=base/"private-originals"
        self.media.mkdir(mode=0o700)
        self.state=base/"private-state"
        self.state.mkdir(mode=0o700)
        self.source=self.media/"licensed-original.wav"
        self.content=b"synthetic bytes only; no real purchase or audio"
        self.source.write_bytes(self.content)
        os.chmod(self.source,0o600)
        self.h=hashlib.sha256(self.content).hexdigest()
        self.now=int(time.time())
        self.policy=self.state/"owner-policy.json"
        self.approval=self.state/"manual-approval.json"
        self.ticket="synthetic-ticket-123456"
        self.catalog=self.state/"private-catalog.json"
        self.write(self.catalog,{
            "gate":"432_WOO_80_PRODUCT_DOWNLOAD_LINKS_JOINED_TO_26_PRIVATE_MEDIA",
            "privateCatalogOnly":True,
            "catalogEntries":[{
                "productId":11,"downloadId":"a"*32,
                "privateFilename":self.source.name,"sha256":self.h,"bytes":len(self.content)
            }]
        })
        self.write(self.policy,{
            "gate":module.POLICY_GATE,
            "ownerApproved":True,
            "accountantRetentionReviewed":True,
            "humanReissueProcessApproved":True,
            "protectedDeliveryMechanismApproved":True,
            "reviewedAtEpoch":self.now-15,
            "expiresAtEpoch":self.now+18000
        })
        self.write(self.approval,{
            "gate":module.APPROVAL_GATE,
            "ticketId":self.ticket,
            "mediaRelativePath":self.source.name,
            "mediaSha256":self.h,
            "productId":11,
            "downloadId":"a"*32,
            "reviewedAtEpoch":self.now-10,
            "ownerAuthorizedThisSpecificReissue":True,
            "operatorVerifiedOriginalOrder":True,
            "originalCompletedPaymentVerified":True,
            "originalMailboxControlVerified":True,
            "originalGrantCurrentAndNotExhausted":True,
            "sourceRightsConfirmed":True,
            "noUnresolvedRefundOrDispute":True,
            "privateMediaHashIndependentlyVerified":True
        })

    def tearDown(self):
        self.tmp.cleanup()

    def write(self,path,data):
        path.write_text(json.dumps(data),encoding="utf-8")
        os.chmod(path,0o600)

    def issue(self,ttl=120):
        return module.issue(self.state,self.media,self.policy,self.approval,ttl,self.now,
                            catalog_path=self.catalog)

    def token(self,token_path):
        return token_path.read_text().strip()

    def ledger(self):
        return json.loads((self.state/"delivery-ledger.json").read_text())["items"]

    def test_policy_missing_refuses_all_issue(self):
        self.policy.unlink()
        with self.assertRaises(module.Closed):
            self.issue()
        self.assertFalse((self.state/"delivery-ledger.json").exists())

    def test_owner_reissue_or_email_unverified_denies(self):
        data=json.loads(self.approval.read_text())
        for flag in ("ownerAuthorizedThisSpecificReissue","originalMailboxControlVerified",
                     "originalGrantCurrentAndNotExhausted","noUnresolvedRefundOrDispute"):
            changed=dict(data,**{flag:False})
            self.write(self.approval,changed)
            with self.assertRaises(module.Closed):
                self.issue()
        self.assertFalse((self.state/"delivery-ledger.json").exists())

    def test_unreviewed_privacy_policy_refuses_issue(self):
        p=json.loads(self.policy.read_text())
        p["accountantRetentionReviewed"]=False
        self.write(self.policy,p)
        with self.assertRaises(module.Closed):
            self.issue()

    def test_private_catalog_rejects_wrong_product_file_pair(self):
        d=json.loads(self.approval.read_text())
        d["downloadId"]="b"*32
        self.write(self.approval,d)
        with self.assertRaises(module.Closed):
            self.issue()
        self.assertFalse((self.state/"delivery-ledger.json").exists())

    def test_missing_private_catalog_denies_issue(self):
        self.catalog.unlink()
        with self.assertRaises(module.Closed):
            self.issue()

    def test_stale_approval_refuses_issue(self):
        p=json.loads(self.approval.read_text())
        p["reviewedAtEpoch"]=self.now-module.MAX_APPROVAL_AGE-1
        self.write(self.approval,p)
        with self.assertRaises(module.Closed):
            self.issue()

    def test_excessive_ttl_refused(self):
        with self.assertRaises(module.Closed):
            self.issue(3601)

    def test_media_hash_change_fails_closed(self):
        self.source.write_bytes(b"altered fake audio")
        with self.assertRaises(module.Closed):
            self.issue()

    def test_symlink_media_denied(self):
        self.source.unlink()
        outside=Path(self.tmp.name)/"outside.wav"
        outside.write_bytes(self.content)
        os.chmod(outside,0o600)
        self.source.symlink_to(outside)
        with self.assertRaises(module.Closed):
            self.issue()

    def test_single_use_issue_redeem_then_denied(self):
        token_file=self.issue()
        self.assertEqual(os.stat(token_file).st_mode & 0o077,0)
        bearer=self.token(token_file)
        self.assertRegex(bearer,module.TOKEN_PATTERN)
        ledger=(self.state/"delivery-ledger.json").read_text()
        self.assertNotIn(bearer,ledger)
        self.assertNotIn(self.ticket,ledger)
        self.assertEqual(self.ledger()[0]["status"],"ISSUED")
        with module.claim(self.state,self.media,bearer,self.now+1) as source:
            self.assertEqual(source.read(),self.content)
        self.assertEqual(self.ledger()[0]["status"],"REDEEMED")
        self.assertFalse(token_file.exists(), "Used bearer must be removed")
        with self.assertRaises(module.Closed):
            module.claim(self.state,self.media,bearer,self.now+2)
        with self.assertRaises(module.Closed):
            self.issue() # no duplicate ticket

    def test_expired_grant_does_not_release_file(self):
        token=self.token(self.issue(ttl=1))
        with self.assertRaises(module.Closed):
            module.claim(self.state,self.media,token,self.now+1)
        self.assertEqual(self.ledger()[0]["status"],"ISSUED")

    def test_revoke_denies_claim(self):
        token=self.token(self.issue())
        grant=self.ledger()[0]["id"]
        self.assertTrue(module.revoke(self.state,grant))
        self.assertFalse((self.state/("token-"+grant+".secret")).exists())
        with self.assertRaises(module.Closed):
            module.claim(self.state,self.media,token,self.now+2)
        self.assertEqual(self.ledger()[0]["status"],"REVOKED")

    def test_changed_media_after_issuance_denies_claim(self):
        token=self.token(self.issue())
        self.source.write_bytes(b"replaced")
        with self.assertRaises(module.Closed):
            module.claim(self.state,self.media,token,self.now+1)
        self.assertEqual(self.ledger()[0]["status"],"ISSUED")

    def test_public_document_root_rejected(self):
        public=Path(self.tmp.name)/"public_html"
        public.mkdir(mode=0o700)
        fake=public/"paid.wav"
        fake.write_bytes(self.content)
        os.chmod(fake,0o600)
        approval=json.loads(self.approval.read_text())
        approval["mediaRelativePath"]="paid.wav"
        self.write(self.approval,approval)
        with self.assertRaises(module.Closed):
            module.issue(self.state,public,self.policy,self.approval,90,self.now,
                         catalog_path=self.catalog)

    def test_single_use_local_http_no_query_no_logs(self):
        import contextlib
        srv=module.LocalOnlyDownloadServer(("127.0.0.1",0),
                                            module.make_handler(self.state,self.media))
        thread=threading.Thread(target=srv.serve_forever,daemon=True)
        thread.start()
        try:
            bearer=self.token(self.issue())
            url="http://127.0.0.1:%d/d/%s"%(srv.server_port,bearer)
            with urlopen(url,timeout=5) as r:
                self.assertEqual(r.status,200)
                self.assertEqual(r.headers["Cache-Control"],"private, no-store, max-age=0")
                self.assertEqual(r.read(),self.content)
            with self.assertRaises(HTTPError) as e:
                urlopen(url,timeout=5)
            self.assertEqual(e.exception.code,404)
            with self.assertRaises(HTTPError) as e:
                urlopen(url+"?debug=1",timeout=5)
            self.assertEqual(e.exception.code,404)
        finally:
            srv.shutdown()
            srv.server_close()
            thread.join(timeout=3)


if __name__=="__main__":
    unittest.main()
