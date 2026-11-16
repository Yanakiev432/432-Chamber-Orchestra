#!/usr/bin/env python3
"""Offline, PII-safe reconciliation of Patreon November 2026 CSV formats.

No network, no data upload, no mutation of input. This is an auditable financial
preflight; payout-account and bank settlement need separate evidence.
"""
from __future__ import annotations

import argparse
import csv
from collections import defaultdict
from datetime import datetime
from decimal import Decimal, InvalidOperation
from hashlib import sha256
import json
from pathlib import Path
import re
import sys

VERSION = "1.2.0"
CENT = Decimal("0.01")
SCHEMAS = {
    "payouts": {
        "required": {"month": "Month", "currency": "Currency", "finalized": "Finalized earnings",
                     "withdrawn": "Total payout", "fees": "Payout fees", "received": "Total received after fees"},
        "optional": {"adjustments": "Payout adjustments", "other_memberships": "Membership to other creators"},
    },
    "earnings": {
        "required": {"month": "Month - successful transactions", "currency": "Currency",
                     "gross": "Total gross earnings", "net": "Total net earnings"},
        "optional": {"refunds": "Refunds", "adjustments": "Patreon adjustments",
                     "recovered": "Recovered payments"},
    },
    "transactions": {
        "required": {"charge_date": "Transaction charge date", "type": "Transaction type",
                     "currency": "Creator currency", "net": "Net earnings"},
        "optional": {"success_date": "Transaction success date", "finalized_date": "Transaction finalized date",
                     "original_charge_date": "Original charge date", "finalized": "Finalized earnings"},
    },
}


def normalize_header(s: str) -> str:
    return re.sub(r"\s+", " ", str(s).replace("\ufeff", "").strip()).casefold()


def money(raw: str, row_num: int, column: str, *, blank_zero: bool = True) -> Decimal:
    s = str(raw or "").strip().replace("\u2212", "-")
    if not s and blank_zero:
        return Decimal("0.00")
    if not s:
        raise ValueError(f"row {row_num}: missing required amount in {column}")
    # Differentiate exact decimal syntax from display formatting; no floating point.
    if s.startswith("(") and s.endswith(")"):
        s = "-" + s[1:-1]
    # Fail closed on ambiguous decimal commas: silently stripping a comma
    # would turn a European 1,23 into 123.00, inflating revenue 100-fold.
    # Bandcamp/Patreon CSV exports use a period for decimals. Permit only
    # conventional, correctly grouped thousands separators (e.g. 1,234.56).
    s = s.replace(" ", "")
    if "," in s:
        if not re.fullmatch(r"[+-]?\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?", s):
            raise ValueError(f"row {row_num}: ambiguous amount separators in {column}")
        s = s.replace(",", "")
    if not re.fullmatch(r"[+-]?\d+(?:\.\d{1,2})?", s):
        raise ValueError(f"row {row_num}: invalid amount in {column}")
    try:
        out = Decimal(s).quantize(CENT)
    except InvalidOperation:
        raise ValueError(f"row {row_num}: invalid amount in {column}") from None
    if not out.is_finite():
        raise ValueError(f"row {row_num}: nonfinite amount in {column}")
    return out


def month_key(raw: str, row_num: int, column: str) -> str:
    s = str(raw or "").strip()
    for fmt in ("%Y-%m", "%Y/%m", "%B %Y", "%b %Y", "%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m")
        except ValueError:
            continue
    raise ValueError(f"row {row_num}: unrecognized Pacific-time date in {column}")


def transaction_month(raw: str, row_num: int, column: str) -> str | None:
    s = str(raw or "").strip()
    if not s:
        return None
    for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%m/%d/%Y", "%m/%d/%Y %H:%M:%S",
                "%B %d, %Y", "%b %d, %Y", "%B %d, %Y %I:%M %p", "%b %d, %Y %I:%M %p"):
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m")
        except ValueError:
            continue
    raise ValueError(f"row {row_num}: unrecognized Pacific-time date in {column}")


def read_report(path: Path, kind: str) -> tuple[list[dict], dict]:
    if path.stat().st_size > 150 * 1024 * 1024:
        raise ValueError(f"{kind}: input over 150 MiB safety limit")
    with path.open("rb") as f:
        digest = sha256(f.read()).hexdigest()
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames or any(h is None or not h.strip() for h in reader.fieldnames):
            raise ValueError(f"{kind}: invalid or absent CSV header")
        reverse = {}
        for key in reader.fieldnames:
            norm = normalize_header(key)
            if norm in reverse:
                raise ValueError(f"{kind}: duplicate header names")
            reverse[norm] = key
        aliases = {}
        for role, caption in {**SCHEMAS[kind]["required"], **SCHEMAS[kind]["optional"]}.items():
            aliases[role] = reverse.get(normalize_header(caption))
        absent = sorted(SCHEMAS[kind]["required"][key] for key in SCHEMAS[kind]["required"] if not aliases[key])
        if absent:
            raise ValueError(f"{kind}: required headers missing: {', '.join(absent)}")
        if kind == "transactions" and not aliases["success_date"]:
            # Critical: cannot group historic earnings by charge-date as a proxy.
            raise ValueError("transactions: missing Transaction success date; cannot safely align by earnings month")
        out = []
        seen_transactions = set()
        for idx, row in enumerate(reader, start=2):
            if idx > 2_000_001:
                raise ValueError(f"{kind}: over 2 million rows; split report by date")
            if None in row or any(v is None for v in row.values()):
                raise ValueError(f"{kind}: malformed row {idx}")
            if not any(str(v or "").strip() for v in row.values()):
                continue
            if kind == "transactions":
                # Fingerprint the full source row in memory, including optional
                # member fields; never output the fingerprint or row values.
                # Do not retain the raw member fields in the de-dup set.
                fingerprint = sha256(json.dumps(row, sort_keys=True, ensure_ascii=False).encode("utf-8")).digest()
                if fingerprint in seen_transactions:
                    raise ValueError(f"transactions: duplicate exact row {idx}; potential overlapping export")
                seen_transactions.add(fingerprint)
            item = {}
            for role in aliases:
                if aliases[role]:
                    item[role] = row[aliases[role]]
            out.append(item)
        if not out:
            raise ValueError(f"{kind}: no data rows")
    return out, {"sha256": digest, "rows": len(out),
                 "recognized_optional_fields": sorted(x for x in SCHEMAS[kind]["optional"] if aliases[x])}


def reconcile(payouts: list[dict], earnings: list[dict], transactions: list[dict]) -> dict:
    warnings: list[str] = []
    p_months = {}; e_months = {}; tx_success = defaultdict(lambda: Decimal("0"))
    tx_finalized = defaultdict(lambda: Decimal("0"))
    tx_count = defaultdict(int)
    missing_finalization = 0
    missing_success = 0
    unknown_finalized_amount = 0
    for i, r in enumerate(payouts, 2):
        mon = month_key(r["month"], i, "Month")
        cur = r["currency"].strip().upper()
        if not re.fullmatch(r"[A-Z]{3}", cur):
            raise ValueError(f"payouts row {i}: invalid payout currency")
        k = (mon,cur)
        if k in p_months:
            raise ValueError(f"payouts row {i}: duplicate month/currency")
        # These four fields define the payout identity. Missing amounts are
        # UNKNOWN, never a silent zero (an explicit "0" remains valid).
        amounts = {key: money(r.get(key,""), i, key, blank_zero=False)
                   for key in ("finalized","withdrawn","fees","received")}
        amounts["other_memberships"] = money(r.get("other_memberships", ""), i, "other_memberships")
        amounts["adjustments"] = money(r.get("adjustments", ""), i, "adjustments")
        if amounts["withdrawn"] < 0 or amounts["received"] < 0 or amounts["fees"] > 0:
            raise ValueError(f"payouts row {i}: unexpected payout/fee sign")
        # Official payout formula; do not subtract 'Membership to other creators' twice.
        delta = amounts["withdrawn"] + amounts["fees"] - amounts["received"]
        if abs(delta) > CENT:
            raise ValueError(f"payouts row {i}: Total payout + Payout fees != Total received after fees")
        p_months[k] = amounts
    for i, r in enumerate(earnings, 2):
        mon = month_key(r["month"], i, "Month - successful transactions")
        cur = r["currency"].strip().upper()
        if not re.fullmatch(r"[A-Z]{3}", cur):
            raise ValueError(f"earnings row {i}: invalid currency")
        k=(mon,cur)
        if k in e_months:
            raise ValueError(f"earnings row {i}: duplicate month/currency")
        e_months[k] = {field: money(r.get(field,""), i, field,
                                      blank_zero=field not in ("gross", "net"))
                       for field in ("gross", "net", "refunds", "adjustments", "recovered")}
    for i, r in enumerate(transactions,2):
        cur = r["currency"].strip().upper()
        if not re.fullmatch(r"[A-Z]{3}", cur):
            raise ValueError(f"transactions row {i}: invalid creator currency")
        succeeded = transaction_month(r["success_date"], i, "Transaction success date")
        finalized = transaction_month(r.get("finalized_date", ""), i, "Transaction finalized date")
        net=money(r["net"],i,"Net earnings",blank_zero=False)
        if succeeded is not None:
            tx_success[(succeeded,cur)] += net
            tx_count[(succeeded,cur)] += 1
        else:
            missing_success += 1
        if finalized is not None:
            if "finalized" in r and str(r.get("finalized", "")).strip():
                tx_finalized[(finalized,cur)] += money(r["finalized"],i,"Finalized earnings")
            else:
                unknown_finalized_amount += 1
        else:
            missing_finalization += 1
    if missing_success:
        warnings.append(f"Transaction rows without success date: {missing_success}; older history or pending records cannot be aligned with earnings month.")
    if unknown_finalized_amount:
        warnings.append(f"Transaction rows with finalized date but no explicit finalized amount: {unknown_finalized_amount}; not substituted with net amount.")
    if missing_finalization:
        warnings.append(f"Transaction rows without finalized date: {missing_finalization}; may be pending/older. Not counted as finalized.")
    # Earnings and payouts are not the same cohort (successful vs finalization vs withdrawal month).
    # Compare by like-for-like month only; discrepancies are investigatory, not errors.
    e_compare=[]; p_compare=[]
    for key in sorted(e_months):
        e=e_months[key]
        if key in tx_success:
            diff=e["net"]-tx_success[key]
            if abs(diff)>CENT:
                warnings.append(f"Earnings/member transactions difference in {key[0]}/{key[1]}; check scope, adjustments, refunds and export date range")
        else:
            diff=None
        e_compare.append({"month_pt":key[0],"currency":key[1],"gross_earnings":format(e["gross"],".2f"),
                          "net_earnings":format(e["net"],".2f"),
                          "transactions_net_by_success_month":format(tx_success[key],".2f") if key in tx_success else None,
                          "net_difference_to_transactions":format(diff,".2f") if diff is not None else None,
                          "transaction_count":tx_count.get(key,0)})
    for key in sorted(p_months):
        p=p_months[key]
        diff=p["finalized"]-tx_finalized[key] if key in tx_finalized else None
        if diff is not None and abs(diff)>CENT:
            warnings.append(f"Finalized/member transactions difference in {key[0]}/{key[1]}; investigate holds, adjustments and coverage")
        p_compare.append({"month_pt":key[0],"currency":key[1],"finalized_earnings":format(p["finalized"],".2f"),
                          "withdrawals_gross":format(p["withdrawn"],".2f"),"payout_fees":format(p["fees"],".2f"),
                          "sent_to_payout_account":format(p["received"],".2f"),
                          "transactions_finalized_by_month":format(tx_finalized[key],".2f") if key in tx_finalized else None,
                          "finalization_difference":format(diff,".2f") if diff is not None else None})
    if sorted(p_months)!=sorted(e_months):
        warnings.append("Payout and earnings report month/currency coverage differs; do not compare cross-period totals")
    return {
        "schema":"432-patreon-csv-structure-preflight/1.2",
        "version":VERSION,
        "status":"CSV_STRUCTURE_ONLY_SOURCE_AUTHENTICITY_AND_BANK_UNVERIFIED",
        "timezone":"America/Los_Angeles (Patreon reporting calendar; no timezone conversion)",
        "privacy":"Aggregated by month/currency only; member name, email and ID never emitted",
        "earnings_by_month":e_compare,
        "payouts_by_month":p_compare,
        "warnings":warnings,
        "limits":[
            "Gross earnings, finalized earnings, initiated payouts and bank receipts are distinct",
            "Only Patreon payout fees included; third-party bank or PayPal fees require external reconciliation",
            "Transactions not finalized in selected months can be pending; older records may lack finalized dates",
            "Monthly export date ranges must be aligned, complete and may include different transaction timing",
            "Bandcamp data and PayPal notices are not represented in these reports",
            "Exact duplicate transaction rows are rejected; partial overlap and unverified provenance still need independent review",
            "Not a license to spend, publish, withdraw, or change account settings"
        ]
    }


def run(paths: dict[str,Path]):
    inputs={}
    rows={}
    for kind in ("payouts","earnings","transactions"):
        rows[kind],inputs[kind]=read_report(paths[kind],kind)
    result=reconcile(rows["payouts"],rows["earnings"],rows["transactions"])
    result["inputs"]=inputs
    result["evidence_status"]="CSV_FILES_READ_SOURCE_AUTHENTICITY_NOT_VERIFIED"
    return result


def main(argv=None):
    parser=argparse.ArgumentParser(description="PII-safe offline Patreon 2026 CSV reconciliation")
    parser.add_argument("--payouts", type=Path, required=True)
    parser.add_argument("--earnings", type=Path, required=True)
    parser.add_argument("--transactions", type=Path, required=True)
    parser.add_argument("--out",type=Path)
    ns=parser.parse_args(argv)
    try:
        result=run({"payouts":ns.payouts,"earnings":ns.earnings,"transactions":ns.transactions})
        content=json.dumps(result,ensure_ascii=False,indent=2)+"\n"
        if ns.out:
            ns.out.write_text(content,encoding="utf-8")
            print("PASS: sanitized report written, without member details")
        else:
            print(content)
        return 0
    except (ValueError,UnicodeError,OSError,csv.Error) as exc:
        # All application errors name only report/header/row; never raw source value.
        print("FAIL: "+str(exc),file=sys.stderr)
        return 2

if __name__=="__main__":
    raise SystemExit(main())
