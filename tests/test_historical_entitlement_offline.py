"""Synthetic, no-PII regression tests for the historical support verifier."""
import datetime as dt
import importlib.util
import unittest
from pathlib import Path

module_file=Path(__file__).resolve().parents[1]/"scripts"/"historical_entitlement_offline.py"
spec=importlib.util.spec_from_file_location("entitlement",module_file)
entitlement=importlib.util.module_from_spec(spec)
spec.loader.exec_module(entitlement)


def snapshot():
    pid="11"
    order="22"
    file_id="a"*32
    posts={
      order:{"post_type":"shop_order","post_status":"wc-completed"},
      pid:{"post_type":"product","post_status":"publish"}
    }
    meta={
      order:{"_billing_email":"test@example.invalid","_order_key":"wc_test_key"},
      pid:{"_downloadable":"yes","_downloadable_files":'a:1:{s:32:"'+file_id+'";}'}
    }
    row={
      "permission_id":"1","download_id":file_id,"product_id":pid,"order_id":order,
      "order_key":"wc_test_key","user_email":"test@example.invalid","user_id":None,
      "downloads_remaining":"1","access_granted":"2016-01-01 01:01:01",
      "access_expires":None,"download_count":"0"
    }
    return posts,meta,row


class EntitlementTest(unittest.TestCase):
    def setUp(self):
        self.posts,self.meta,self.row=snapshot()
        self.at=dt.datetime(2026,11,8,13,12,0)

    def check(self):
        return entitlement.permission_state(self.row,self.posts,self.meta,self.at)

    def test_valid(self):
        self.assertTrue(self.check()["eligible_for_manual_review"])

    def test_remaining_zero_denied(self):
        self.row["downloads_remaining"]="0"
        self.assertFalse(self.check()["eligible_for_manual_review"])

    def test_expired_denied(self):
        self.row["access_expires"]="2017-01-01 01:01:01"
        self.assertFalse(self.check()["eligible_for_manual_review"])

    def test_cancelled_order_denied(self):
        self.posts["22"]["post_status"]="wc-cancelled"
        self.assertFalse(self.check()["eligible_for_manual_review"])

    def test_mismatched_email_denied(self):
        self.row["user_email"]="other@example.invalid"
        self.assertFalse(self.check()["eligible_for_manual_review"])

    def test_mismatched_order_key_denied(self):
        self.row["order_key"]="different"
        self.assertFalse(self.check()["eligible_for_manual_review"])

    def test_missing_media_metadata_denied(self):
        self.meta["11"].pop("_downloadable_files")
        self.assertFalse(self.check()["eligible_for_manual_review"])

    def test_downloadable_no_denied(self):
        self.meta["11"]["_downloadable"]="no"
        self.assertFalse(self.check()["eligible_for_manual_review"])

    def test_hidden_lookup_failure(self):
        rows={
            "wpqt_posts":[{"ID":key,**value} for key,value in self.posts.items()],
            "wpqt_postmeta":[{"post_id":key,"meta_key":meta_key,"meta_value":meta_val}
                             for key,d in self.meta.items() for meta_key,meta_val in d.items()],
            "wpqt_woocommerce_downloadable_product_permissions":[self.row]
        }
        self.assertEqual(entitlement.lookup(rows,self.at,"22","wrong@example.invalid")["result"],"NOT_VERIFIED")
        good=entitlement.lookup(rows,self.at,"22","test@example.invalid")
        self.assertEqual(good["result"],"ARCHIVED_ORDER_MATCHED_FOR_HUMAN_REVIEW")
        self.assertFalse(good["deliveryAuthorized"])
        self.assertNotIn("test@example.invalid",str(good))
        self.assertNotIn("wc_test_key",str(good))


if __name__=="__main__":
    unittest.main()
