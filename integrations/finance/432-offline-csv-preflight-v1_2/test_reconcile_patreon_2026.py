"""Offline synthetic fixtures only: no real members, payouts or credentials."""
import csv
from decimal import Decimal
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from reconcile_patreon_2026 import (read_report, reconcile, run, month_key, transaction_month, money)

class PatreonCSVPreflightTests(unittest.TestCase):
    def write_csv(self,root,name,headers,rows):
        p=Path(root)/name
        with p.open('w',encoding='utf-8-sig',newline='') as f:
            w=csv.DictWriter(f,fieldnames=headers); w.writeheader();w.writerows(rows)
        return p

    def synthetic_inputs(self,root):
        payouts=self.write_csv(root,'monthly.csv', ['Month','Currency','Finalized earnings','Total payout','Payout fees','Total received after fees'],
            [{'Month':'Nov 2026','Currency':'USD','Finalized earnings':'10.00','Total payout':'10.00','Payout fees':'-0.30','Total received after fees':'9.70'}])
        earnings=self.write_csv(root,'earnings.csv', ['Month - successful transactions','Currency','Total gross earnings','Total net earnings','Refunds'],
            [{'Month - successful transactions':'November 2026','Currency':'USD','Total gross earnings':'12.00','Total net earnings':'10.00','Refunds':'-1.00'}])
        tx=self.write_csv(root,'member.csv',['Member email','Member user ID','Transaction charge date','Transaction success date','Transaction finalized date','Transaction type','Creator currency','Net earnings','Finalized earnings'],
            [{'Member email':'private@example.com','Member user ID':'sensitive-123','Transaction charge date':'2026-11-10','Transaction success date':'2026-11-11','Transaction finalized date':'2026-11-15','Transaction type':'membership','Creator currency':'USD','Net earnings':'10.00','Finalized earnings':'10.00'}])
        return {'payouts':payouts,'earnings':earnings,'transactions':tx}

    def test_01_sanitized_happy_path(self):
        with TemporaryDirectory() as td:
            r=run(self.synthetic_inputs(td))
            self.assertEqual(r['payouts_by_month'][0]['sent_to_payout_account'],'9.70')
            self.assertEqual(r['earnings_by_month'][0]['transaction_count'],1)
            self.assertNotIn('private@example.com',str(r))
            self.assertNotIn('sensitive-123',str(r))
            self.assertNotIn(td,str(r))

    def test_02_payout_identity_hard_failure(self):
        with self.assertRaisesRegex(ValueError,'Total payout'):
            reconcile([dict(month='Nov 2026',currency='USD',finalized='10',withdrawn='10',fees='-0.30',received='10')],
                      [dict(month='Nov 2026',currency='USD',gross='12',net='10')],
                      [dict(charge_date='2026-11-10',success_date='2026-11-11',finalized_date='2026-11-15',type='membership',currency='USD',net='10')])

    def test_03_duplicate_month_currency_rejected(self):
        p=dict(month='2026-11',currency='USD',finalized='10',withdrawn='10',fees='0',received='10')
        with self.assertRaisesRegex(ValueError,'duplicate month'):
            reconcile([p,p],[],[])

    def test_04_unknown_schema_fails_closed(self):
        with TemporaryDirectory() as td:
            p=self.write_csv(td,'bad.csv',['Name','Currency'],[{'Name':'person','Currency':'USD'}])
            with self.assertRaisesRegex(ValueError,'required headers missing'):
                read_report(p,'payouts')

    def test_05_malformed_number_rejected_without_value_echo(self):
        try: money('sensitive-foo','2','fee')
        except ValueError as e: self.assertNotIn('sensitive-foo',str(e))
        else: self.fail('Expected ValueError')

    def test_05a_ambiguous_european_decimal_comma_rejected(self):
        with self.assertRaisesRegex(ValueError, 'ambiguous amount separators'):
            money('1,23', 2, 'Net earnings')

    def test_05b_irregular_thousands_grouping_rejected(self):
        with self.assertRaisesRegex(ValueError, 'ambiguous amount separators'):
            money('12,34,567.89', 2, 'Net earnings')

    def test_05c_valid_us_thousands_comma_retained(self):
        self.assertEqual(money('1,234.56', 2, 'Net earnings'), Decimal('1234.56'))

    def test_05d_parenthesized_negative_grouped_amount(self):
        self.assertEqual(money('(1,234.56)', 2, 'Payout fees'), Decimal('-1234.56'))

    def test_05e_missing_required_payout_amount_not_silently_zero(self):
        with self.assertRaisesRegex(ValueError, 'missing required amount'):
            reconcile([dict(month='Nov 2026',currency='USD',finalized='',withdrawn='0',fees='0',received='0')],[],[])

    def test_05f_missing_required_earnings_net_not_silently_zero(self):
        with self.assertRaisesRegex(ValueError, 'missing required amount'):
            reconcile([],[dict(month='Nov 2026',currency='USD',gross='20',net='')],[])

    def test_06_negative_fees_accounted_without_double_subtraction(self):
        p=[dict(month='2026-11',currency='USD',finalized='30.00',withdrawn='20',fees='-1',received='19',other_memberships='-3')]
        r=reconcile(p,[],[])
        self.assertEqual(r['payouts_by_month'][0]['sent_to_payout_account'],'19.00')

    def test_07_pending_transactions_distinguished_from_finalized(self):
        p=[dict(month='2026-11',currency='USD',finalized='0',withdrawn='0',fees='0',received='0')]
        t=[dict(charge_date='2026-11-15',success_date='2026-11-15',finalized_date='',type='membership',currency='USD',net='9')]
        result=reconcile(p,[],t)
        self.assertTrue(any('without finalized date' in e for e in result['warnings']))
        self.assertIsNone(result['payouts_by_month'][0]['transactions_finalized_by_month'])

    def test_08_multicurrency_not_combined(self):
        p=[dict(month='2026-11',currency=c,finalized='10',withdrawn='10',fees='0',received='10') for c in ('USD','EUR')]
        result=reconcile(p,[],[])
        self.assertEqual([x['currency'] for x in result['payouts_by_month']],['EUR','USD'])

    def test_09_refunds_as_negative_transaction_not_positive_volume(self):
        p=[]
        e=[dict(month='2026-11',currency='USD',gross='10',net='6',refunds='-4')]
        t=[dict(charge_date='2026-11-01',success_date='2026-11-01',finalized_date='',type='membership',currency='USD',net='10'),
           dict(charge_date='2026-11-01',success_date='2026-11-14',finalized_date='',type='refund',currency='USD',net='-4')]
        result=reconcile(p,e,t)
        self.assertEqual(result['earnings_by_month'][0]['transactions_net_by_success_month'],'6.00')

    def test_10_date_timezone_not_shifted(self):
        self.assertEqual(transaction_month('2026-11-01',2,'date'),'2026-11')
        self.assertEqual(month_key('Nov 2026',2,'month'),'2026-11')

    def test_11_missing_success_date_column_fails(self):
        with TemporaryDirectory() as td:
            p=self.write_csv(td,'bad.csv',['Transaction charge date','Transaction type','Creator currency','Net earnings'],
              [{'Transaction charge date':'2026-11-01','Transaction type':'membership','Creator currency':'USD','Net earnings':'9'}])
            with self.assertRaisesRegex(ValueError,'missing Transaction success date'):
                read_report(p,'transactions')

    def test_12_no_pii_in_row_date_validation(self):
        with self.assertRaisesRegex(ValueError,'unrecognized Pacific-time date') as cm:
            transaction_month('veryprivate@inval.id',2,'date')
        self.assertNotIn('veryprivate',str(cm.exception))

    def test_13_invalid_sign_fails(self):
        with self.assertRaisesRegex(ValueError,'unexpected payout/fee sign'):
            reconcile([dict(month='2026-11',currency='USD',finalized='10',withdrawn='10',fees='1',received='11')],[],[])

    def test_14_bom_and_duplicate_headers(self):
        with TemporaryDirectory() as td:
            p=self.write_csv(td,'duplicates.csv',['Month','Month ', 'Currency','Total payout'],
                 [{'Month':'Nov 2026','Month ':'Nov 2026','Currency':'USD','Total payout':'10'}])
            with self.assertRaisesRegex(ValueError,'duplicate header'):
                read_report(p,'payouts')

    def test_16_legacy_blank_success_date_flagged(self):
        t=[dict(charge_date='2020-11-01',success_date='',finalized_date='',type='membership',currency='USD',net='9')]
        r=reconcile([],[],t)
        self.assertTrue(any('without success date' in w for w in r['warnings']))

    def test_17_dated_finalization_with_blank_amount_not_assumed(self):
        p=[dict(month='2026-11',currency='USD',finalized='9',withdrawn='9',fees='0',received='9')]
        t=[dict(charge_date='2026-11-05',success_date='2026-11-06',finalized_date='2026-11-09',finalized='',type='membership',currency='USD',net='9')]
        r=reconcile(p,[],t)
        self.assertIsNone(r['payouts_by_month'][0]['transactions_finalized_by_month'])
        self.assertTrue(any('no explicit finalized amount' in w for w in r['warnings']))

    def test_15_mismatched_member_earnings_not_claimed_reconciled(self):
        e=[dict(month='2026-11',currency='USD',gross='10',net='10')]
        t=[dict(charge_date='2026-11-01',success_date='2026-11-01',finalized_date='',type='membership',currency='USD',net='7')]
        r=reconcile([],e,t)
        self.assertNotEqual(r['earnings_by_month'][0]['net_difference_to_transactions'],'0.00')
        self.assertTrue(any('difference' in x for x in r['warnings']))

    def test_18_exact_duplicate_transaction_row_rejected_privately(self):
        with TemporaryDirectory() as td:
            paths=self.synthetic_inputs(td)
            with paths['transactions'].open('r',encoding='utf-8-sig',newline='') as fp:
                rows=list(csv.DictReader(fp))
            tx=self.write_csv(td,'member.csv',list(rows[0].keys()),[rows[0],rows[0]])
            with self.assertRaisesRegex(ValueError,'duplicate exact row') as ctx:
                read_report(tx,'transactions')
            self.assertNotIn('private@example.com',str(ctx.exception))
            self.assertNotIn('sensitive-123',str(ctx.exception))

    def test_19_same_amounts_different_members_not_duplicate(self):
        with TemporaryDirectory() as td:
            paths=self.synthetic_inputs(td)
            with paths['transactions'].open('r',encoding='utf-8-sig',newline='') as fp:
                rows=list(csv.DictReader(fp))
            second=dict(rows[0]);second['Member user ID']='different-id';second['Member email']='another@example.com'
            tx=self.write_csv(td,'member.csv',list(rows[0].keys()),[rows[0],second])
            items,info=read_report(tx,'transactions')
            self.assertEqual(info['rows'],2)
            self.assertNotIn('private@example.com',str(info))
    def test_20_reject_internal_ascii_whitespace_in_amount(self):
        with self.assertRaisesRegex(ValueError, 'internal whitespace'):
            money('1 23',2,'Net earnings')

    def test_21_reject_unicode_internal_whitespace_in_amount(self):
        with self.assertRaisesRegex(ValueError, 'internal whitespace'):
            money('1\u00a023.45',2,'Net earnings')

    def test_22_whitespace_edge_allowed_but_not_in_middle(self):
        self.assertEqual(money(' 123.45 ',2,'Net earnings'),Decimal('123.45'))
        with self.assertRaisesRegex(ValueError, 'internal whitespace'):
            money('1 234.56',2,'Net earnings')

    def test_23_success_month_outside_earnings_report_flagged_and_exposed(self):
        p=[dict(month='2026-10',currency='USD',finalized='0',withdrawn='0',fees='0',received='0')]
        e=[dict(month='2026-10',currency='USD',gross='10',net='10')]
        t=[dict(charge_date='2026-11-12',success_date='2026-11-12',finalized_date='',type='membership',currency='USD',net='7')]
        r=reconcile(p,e,t)
        self.assertEqual(r['unmatched_transaction_coverage']['successful_month_currency_not_in_earnings'],
                         [{'month_pt':'2026-11','currency':'USD','net':'7.00','rows':1}])
        self.assertTrue(any('absent from earnings export' in w for w in r['warnings']))

    def test_24_finalization_month_outside_payout_report_flagged(self):
        p=[dict(month='2026-10',currency='USD',finalized='0',withdrawn='0',fees='0',received='0')]
        t=[dict(charge_date='2026-11-12',success_date='2026-11-12',finalized_date='2026-11-14',
                finalized='7',type='membership',currency='USD',net='7')]
        r=reconcile(p,[],t)
        self.assertEqual(r['unmatched_transaction_coverage']['finalized_month_currency_not_in_payouts'],
                         [{'month_pt':'2026-11','currency':'USD','finalized':'7.00'}])
        self.assertTrue(any('absent from payout export' in w for w in r['warnings']))

    def test_25_multicurrency_unmatched_coverage_does_not_mix_currency(self):
        p=[dict(month='2026-11',currency='EUR',finalized='0',withdrawn='0',fees='0',received='0')]
        e=[dict(month='2026-11',currency='EUR',gross='10',net='10')]
        t=[dict(charge_date='2026-11-12',success_date='2026-11-12',finalized_date='2026-11-14',
                finalized='12',type='membership',currency='USD',net='12')]
        r=reconcile(p,e,t)
        self.assertEqual(r['unmatched_transaction_coverage']['successful_month_currency_not_in_earnings'][0]['currency'],'USD')
        self.assertEqual(r['unmatched_transaction_coverage']['finalized_month_currency_not_in_payouts'][0]['currency'],'USD')

    def test_26_existing_covered_months_create_no_unmatched_coverage(self):
        p=[dict(month='2026-11',currency='USD',finalized='7',withdrawn='7',fees='0',received='7')]
        e=[dict(month='2026-11',currency='USD',gross='7',net='7')]
        t=[dict(charge_date='2026-11-12',success_date='2026-11-12',finalized_date='2026-11-14',
                finalized='7',type='membership',currency='USD',net='7')]
        r=reconcile(p,e,t)
        self.assertEqual(r['unmatched_transaction_coverage']['successful_month_currency_not_in_earnings'],[])
        self.assertEqual(r['unmatched_transaction_coverage']['finalized_month_currency_not_in_payouts'],[])

if __name__ == '__main__': unittest.main(verbosity=2)
