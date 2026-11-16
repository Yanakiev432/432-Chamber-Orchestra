"""Synthetic only: full official source remains unavailable."""
import csv
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from reconcile_bandcamp_2026 import read_bandcamp_raw, summarize as _summarize, utc_month, run, COLUMNS

def summarize(raw):
    return _summarize([{role: row.get(col,'') for role,col in COLUMNS.items()} for row in raw])

HEADERS=['date','item type','currency','item name','quantity','sub total','additional fan contribution','marketplace tax','seller tax','transaction fee','collected revenue share','net amount','amount you received','bandcamp transaction id','change to payout balance','buyer name','buyer email']

def record(**kw):
    d={'date':'2026-11-10 17:30:00','item type':'album','currency':'EUR','item name':'Private title',
      'quantity':'1','sub total':'100.40','additional fan contribution':'0','marketplace tax':'0',
      'seller tax':'0','transaction fee':'0.49','collected revenue share':'15.06','net amount':'84.85',
      'amount you received':'0','bandcamp transaction id':'tx-private-23',
      'change to payout balance':'84.85','buyer name':'PRIVATE NAME','buyer email':'secret@example.org'}
    d.update(kw);return d

class BandcampAuditTests(unittest.TestCase):
 def mkcsv(self,d,rows,headers=HEADERS):
    p=Path(d)/'sample.csv'
    with p.open('w',newline='',encoding='utf-8-sig') as f:
      w=csv.DictWriter(f,fieldnames=headers);w.writeheader();w.writerows(rows)
    return p
 def test_01_multiitem_cart_not_double_count_orders(self):
    s=summarize([record(),record(**{'item type':'track','sub total':'2','net amount':'1.5'})]);row=s['by_month_currency'][0]
    self.assertEqual(row['sale_lines'],2);self.assertEqual(row['distinct_known_order_ids'],1)
    self.assertEqual(row['gross_ex_tax'],'102.40')
 def test_02_payout_is_not_sale(self):
    s=summarize([record(),record(**{'date':'2026-11-11','item type':'payout','amount you received':'83.80','net amount':'','sub total':''})]);r=s['by_month_currency'][0]
    self.assertEqual(r['reported_sale_net'],'84.85');self.assertEqual(r['bandcamp_reported_payout_received'],'83.80')
 def test_03_no_personal_details_in_summary(self):
    s=str(summarize([record()]));self.assertNotIn('PRIVATE NAME',s);self.assertNotIn('secret@example.org',s);self.assertNotIn('tx-private-23',s)
 def test_04_pending_star_does_not_guess_fee(self):
    r=summarize([record(**{'transaction fee':'*'})])['by_month_currency'][0]
    self.assertEqual(r['pending_fee_markers'],1);self.assertEqual(r['known_fee_total'],'0.00')
 def test_05_blank_cart_fee_not_invalid(self):
    r=summarize([record(**{'transaction fee':''})])['by_month_currency'][0];self.assertEqual(r['blank_fee_lines'],1)
 def test_06_refunds_separate_not_new_sale(self):
    r=summarize([record(),record(**{'item type':'reversal','net amount':'-30','sub total':'-40'})])['by_month_currency'][0]
    self.assertEqual(r['sale_lines'],1);self.assertEqual(r['reversal_lines'],1);self.assertEqual(r['reported_reversal_net'],'-30.00')
 def test_07_physical_package_not_digital(self):
    r=summarize([record(**{'item type':'package'})])['by_month_currency'][0]
    self.assertEqual(r['sale_lines'],0);self.assertEqual(r['unclassified_lines'],1)
 def test_08_currency_separate(self):
    a=summarize([record(),record(**{'currency':'USD'})])['by_month_currency'];self.assertEqual(len(a),2)
 def test_09_calendar_utc(self):
    self.assertEqual(utc_month('2026-11-01T00:30:00+00:00',2),'2026-11')
    self.assertEqual(utc_month('2026-10-31T23:30:00-01:00',2),'2026-11')
 def test_10_no_transaction_ids_lower_bound_warning(self):
    s=summarize([record(**{'bandcamp transaction id':''})]);self.assertTrue(any('lower bound' in w for w in s['warnings']))
 def test_11_missing_required_header_fails(self):
    with TemporaryDirectory() as d:
      h=[x for x in HEADERS if x!='net amount'];p=self.mkcsv(d,[{k:record()[k] for k in h}],h)
      with self.assertRaisesRegex(ValueError,'missing required'):read_bandcamp_raw(p)
 def test_12_pii_safe_input_output(self):
    with TemporaryDirectory() as d:
      r=run(self.mkcsv(d,[record()]));self.assertNotIn('secret@example.org',str(r));self.assertNotIn(d,str(r))
 def test_13_unknown_bad_currency_fails(self):
    with self.assertRaisesRegex(ValueError,'currency'):summarize([record(**{'currency':'BAD1'})])
 def test_13b_missing_sale_subtotal_not_silently_zero(self):
    with self.assertRaisesRegex(ValueError, 'missing required amount'):
      summarize([record(**{'sub total':''})])
 def test_14_unknown_bad_date_no_value_leak(self):
    with self.assertRaises(ValueError) as cm:summarize([record(**{'date':'some secret private info'})])
    self.assertNotIn('some secret',str(cm.exception))
 def test_15_duplicate_same_item_in_one_order_fails_closed(self):
    a=record()
    with self.assertRaisesRegex(ValueError,'repeated sale item identity'):
      summarize([a,a.copy()])
 def test_16_distinct_items_same_order_both_count(self):
    a=record();b=record(**{'item name':'Different album', 'sub total':'2.00'})
    z=summarize([a,b])['by_month_currency'][0]
    self.assertEqual(z['sale_lines'],2);self.assertEqual(z['distinct_known_order_ids'],1)
 def test_17_same_item_different_orders_count(self):
    a=record();b=record(**{'bandcamp transaction id':'another-order'})
    z=summarize([a,b])['by_month_currency'][0]
    self.assertEqual(z['sale_lines'],2);self.assertEqual(z['distinct_known_order_ids'],2)
 def test_18_item_url_identity_overrides_same_display_name(self):
    a=record(**{'item url':'https://432orchestra.bandcamp.com/album/a'})
    b=record(**{'item url':'https://432orchestra.bandcamp.com/album/b'})
    z=summarize([a,b])['by_month_currency'][0]
    self.assertEqual(z['sale_lines'],2)
 def test_19_negative_sale_contribution_requires_review(self):
    with self.assertRaisesRegex(ValueError,'negative sale amount'):
      summarize([record(**{'additional fan contribution':'-1.00'})])
 def test_20_negative_sale_tax_requires_review(self):
    with self.assertRaisesRegex(ValueError,'negative sale amount'):
      summarize([record(**{'seller tax':'-0.01'})])
 def test_22_official_style_gmt_datetime_supported(self):
    self.assertEqual(utc_month('04 Jan 2021 23:22:11 GMT',2),'2021-01')
 def test_23_explicit_timezone_conversion_on_boundary(self):
    self.assertEqual(utc_month('2026-11-01T00:30:00+02:00',2),'2026-10')
 def test_21_duplicate_rejected_without_leaking_identity(self):
    with self.assertRaises(ValueError) as ctx:
      summarize([record(),record()])
    self.assertNotIn('tx-private-23',str(ctx.exception))
    self.assertNotIn('PRIVATE NAME',str(ctx.exception))
if __name__=='__main__':unittest.main(verbosity=2)
