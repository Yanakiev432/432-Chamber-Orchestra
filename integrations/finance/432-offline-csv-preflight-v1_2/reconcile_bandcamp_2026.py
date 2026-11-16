#!/usr/bin/env python3
"""PII-safe local Bandcamp Raw Data CSV audit; sales and payouts separate.

Follows Bandcamp's June 2026 raw-data field definitions. Does not assume a
sales-line count equals orders or that payouts belong to same sale month.
"""
from __future__ import annotations
import argparse
from collections import defaultdict
import json
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timezone
from reconcile_patreon_2026 import money, read_report as _unused, CENT, normalize_header
import csv
from hashlib import sha256
import re
import sys

COLUMNS = {
 "date": "date", "type": "item type", "currency": "currency", "item": "item name",
 "quantity":"quantity", "subtotal":"sub total", "additional":"additional fan contribution",
 "marketplace_tax":"marketplace tax", "seller_tax":"seller tax",
 "fee":"transaction fee", "share":"collected revenue share", "net":"net amount",
 "received":"amount you received", "order":"bandcamp transaction id",
 "balance_change":"change to payout balance", "item_url":"item url"
}
REQUIRED={"date","type","currency","subtotal","additional","marketplace_tax","received","order","net"}
SALE_TYPES={"album","track"}
PAYOUT_TYPES={"payout"}
REVERSAL_TYPES={"reversal","refund"}


def utc_month(value,row):
    s=str(value or "").strip()
    # Bandcamp raw report date is UTC. Parse explicitly but do not convert local time.
    s=s.replace(" UTC", "").replace("Z", "+00:00")
    try:
        parsed=datetime.fromisoformat(s)
        if parsed.tzinfo is not None:
            parsed=parsed.astimezone(timezone.utc)
        return parsed.strftime("%Y-%m")
    except ValueError: pass
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%m/%d/%Y %H:%M:%S", "%m/%d/%Y %I:%M:%S %p", "%m/%d/%Y", "%b %d, %Y %I:%M %p", "%d %b %Y %H:%M:%S GMT", "%d %b %Y %H:%M:%S", "%d %b %Y %H:%M GMT"):
        try: return datetime.strptime(s,fmt).strftime("%Y-%m")
        except ValueError: pass
    raise ValueError(f"raw row {row}: unrecognized UTC transaction date")


def read_bandcamp_raw(path:Path):
    if path.stat().st_size>150*1024*1024:
        raise ValueError("raw: input >150 MiB; split export by period")
    h=sha256(path.read_bytes()).hexdigest()
    with path.open('r',encoding='utf-8-sig',newline='') as f:
        rdr=csv.DictReader(f)
        if not rdr.fieldnames or any(x is None for x in rdr.fieldnames):
            raise ValueError("raw: CSV header missing")
        mapping={}
        for name in rdr.fieldnames:
            key=normalize_header(name)
            if key in mapping:raise ValueError("raw: duplicate CSV header")
            mapping[key]=name
        keys={k:mapping.get(normalize_header(v)) for k,v in COLUMNS.items()}
        missing=sorted(COLUMNS[k] for k in REQUIRED if not keys[k])
        if missing:raise ValueError("raw: missing required fields: "+", ".join(missing))
        items=[]
        for n,row in enumerate(rdr,2):
            if n>2_000_001:raise ValueError("raw: >2 million lines; split export")
            if None in row or any(v is None for v in row.values()):
                raise ValueError(f"raw: malformed row {n}")
            if not any(str(v or "").strip() for v in row.values()):continue
            items.append({key:(row[col] if col else "") for key,col in keys.items()})
        if not items:raise ValueError("raw: no records")
    return items,{"sha256":h,"rows":len(items)}


def summarize(raw):
    bucket=defaultdict(lambda:{"sale_lines":0,"gross_ex_tax":Decimal('0'),
       "marketplace_tax_remitted_by_bandcamp":Decimal('0'),"seller_tax":Decimal('0'),
       "reported_sale_net":Decimal('0'),"known_sale_net_lines":0,
       "payout_lines":0,"bandcamp_reported_payout_received":Decimal('0'),
       "reversal_lines":0,"reported_reversal_net":Decimal('0'),"unclassified_lines":0,
       "pending_fee_markers":0,"blank_fee_lines":0,"known_fee_total":Decimal('0'),
       "order_ids":set(),"missing_order_ids":0,"unknown_net_sale_lines":0,
    })
    seen_sale_lines = set()
    for i,r in enumerate(raw,2):
        mon=utc_month(r['date'],i)
        cur=str(r['currency']).strip().upper()
        if not re.fullmatch(r'[A-Z]{3}',cur):raise ValueError(f"raw row {i}: invalid currency")
        cat=str(r['type']).strip().casefold()
        b=bucket[(mon,cur)]
        if cat in SALE_TYPES:
            qty=str(r['quantity']).strip()
            if qty:
                if not re.fullmatch(r'\d+',qty) or int(qty)<1:
                    raise ValueError(f"raw row {i}: invalid sale quantity")
            txid=str(r['order']).strip()
            # Different items in one order are separate rows, but multiple
            # copies of the same item appear on one row (Bandcamp Raw Data).
            # Never double-count duplicated/overlapping export item identities.
            item_identity = str(r.get('item_url') or r.get('item') or '').strip()
            if txid and item_identity:
                key = (cur, txid, cat, item_identity)
                if key in seen_sale_lines:
                    raise ValueError(f"raw row {i}: repeated sale item identity; overlapping export or duplicate entry")
                seen_sale_lines.add(key)
            subtotal=money(r['subtotal'],i,'sub total',blank_zero=False)
            contribution=money(r['additional'],i,'additional fan contribution')
            market_tax=money(r['marketplace_tax'],i,'marketplace tax')
            seller_tax=money(r['seller_tax'],i,'seller tax')
            if min(subtotal,contribution,market_tax,seller_tax) < 0:
                raise ValueError(f"raw row {i}: negative sale amount/tax; verify reversal classification")
            b['sale_lines']+=1
            b['gross_ex_tax']+=subtotal+contribution
            b['marketplace_tax_remitted_by_bandcamp']+=market_tax
            b['seller_tax']+=seller_tax
            if txid: b['order_ids'].add(txid)
            else: b['missing_order_ids']+=1
            if str(r['net']).strip():
                b['reported_sale_net']+=money(r['net'],i,'net amount')
                b['known_sale_net_lines']+=1
            else: b['unknown_net_sale_lines']+=1
            f=str(r['fee']).strip()
            if f=='*':b['pending_fee_markers']+=1
            elif not f:b['blank_fee_lines']+=1
            else:b['known_fee_total']+=money(f,i,'transaction fee')
        elif cat in PAYOUT_TYPES:
            b['payout_lines']+=1
            b['bandcamp_reported_payout_received']+=money(r['received'],i,'amount you received',blank_zero=False)
        elif cat in REVERSAL_TYPES:
            b['reversal_lines']+=1
            if str(r['net']).strip():b['reported_reversal_net']+=money(r['net'],i,'net amount')
        else:
            b['unclassified_lines']+=1
    report=[];warnings=[]
    for (mon,cur),d in sorted(bucket.items()):
        if d['missing_order_ids']:
            warnings.append(f"{mon}/{cur}: missing Bandcamp transaction IDs; order count is a lower bound")
        if d['pending_fee_markers'] or d['blank_fee_lines'] or d['unknown_net_sale_lines']:
            warnings.append(f"{mon}/{cur}: incomplete fee/net values or pending transaction; totals are partial")
        if d['unclassified_lines']:
            warnings.append(f"{mon}/{cur}: unclassified rows (e.g. packages) excluded from digital sales totals")
        if d['reversal_lines']:
            warnings.append(f"{mon}/{cur}: reversals/refunds exist; do not treat sale net as final without reversal reconciliation")
        report.append({"month_utc":mon,"currency":cur,
            **{k:format(v,'.2f') if isinstance(v,Decimal) else len(v) if isinstance(v,set) else v for k,v in d.items() if k!='order_ids'},
            "distinct_known_order_ids":len(d['order_ids'])})
    return {"schema":"432-bandcamp-raw-pii-safe-preflight/1.2",
      "status":"RAW_ONLY_NOT_OFFICIAL_PAYOUT_STATEMENT_OR_BANK_VERIFIED",
      "calendar":"UTC transaction date from Bandcamp raw data",
      "privacy":"No item names, transaction identifiers, purchaser details, addresses, or raw CSV rows emitted",
      "by_month_currency":report,"warnings":warnings,
      "limits":["Raw sale item rows are not orders: multiple items may share one Bandcamp transaction ID",
        "Digital sale net is separate from payout received, and payouts can occur in later months",
        "Refunds/reversals are separate rows and require source-specific reconciliation",
        "Packages/physical/unknown item types are excluded from digital sales aggregates",
        "Sales subtotal plus contributions excludes marketplace tax and seller tax; compare Revenue Summary separately",
        "Bank and PayPal actual settlement require evidence separate from Bandcamp payout statement",
        "Repeated item identities within the same order cannot be safely merged; exports are rejected instead of silently doubling revenue"]}


def run(path):
    lines,evidence=read_bandcamp_raw(path)
    result=summarize(lines)
    result['input']=evidence
    return result


def main(argv=None):
    p=argparse.ArgumentParser(description="Offline PII-safe Bandcamp raw CSV sales/payout preflight")
    p.add_argument('--raw',type=Path,required=True);p.add_argument('--out',type=Path)
    ns=p.parse_args(argv)
    try:
        result=run(ns.raw);out=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
        if ns.out:ns.out.write_text(out,encoding='utf8');print('PASS: anonymous month/currency data written')
        else:print(out)
        return 0
    except (OSError,ValueError,UnicodeError,csv.Error) as exc:
        print('FAIL: '+str(exc),file=sys.stderr)
        return 2

if __name__=='__main__':raise SystemExit(main())
