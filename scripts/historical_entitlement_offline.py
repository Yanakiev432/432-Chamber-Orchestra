#!/usr/bin/env python3
"""Private, read-only WooCommerce historical entitlement audit and operator lookup.

Never run this in the public website or publish the underlying SQL, customer data,
order keys, original media paths, entitlement records, or raw lookup results.
Uses only Python stdlib; the SQL input must be an independently verified export.
"""
from __future__ import annotations

import argparse
import collections
import csv
import datetime as dt
import getpass
import gzip
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import sys

CANONICAL_BACKUP_SHA256 = "cf8a047c4312328906a1553206ca4e97457a53358248687491e14723b38f3c91"
PREFIX = "wpqt_"
SCHEMAS = {
    PREFIX + "posts": (
        "ID", "post_author", "post_date", "post_date_gmt", "post_content",
        "post_title", "post_excerpt", "post_status", "comment_status",
        "ping_status", "post_password", "post_name", "to_ping", "pinged",
        "post_modified", "post_modified_gmt", "post_content_filtered",
        "post_parent", "guid", "menu_order", "post_type", "post_mime_type",
        "comment_count",
    ),
    PREFIX + "postmeta": ("meta_id", "post_id", "meta_key", "meta_value"),
    PREFIX + "woocommerce_downloadable_product_permissions": (
        "permission_id", "download_id", "product_id", "order_id",
        "order_key", "user_email", "user_id", "downloads_remaining",
        "access_granted", "access_expires", "download_count",
    ),
}
LIMIT_GZIP_BYTES = 50 * 1024 * 1024
LIMIT_ROW_BYTES = 20 * 1024 * 1024
MAX_TABLE_ROWS = 200000
TABLE_LINE = re.compile(r"^INSERT INTO \x60([^\x60]+)\x60 VALUES")
DB_TIME = "%Y-%m-%d %H:%M:%S"


def verified_source(path: Path, expected_sha256: str) -> Path:
    """Require a private regular file, SHA-pinned, not under a webroot."""
    absolute = path.absolute()
    if not re.fullmatch(r"[a-fA-F0-9]{64}", expected_sha256):
        raise ValueError("Expected SHA-256 is not valid")
    if "public_html" in absolute.parts or any(p in absolute.parts for p in ("www", "htdocs")):
        raise ValueError("Refusing to read an SQL backup from a public document root")
    st = os.lstat(absolute)
    if not stat.S_ISREG(st.st_mode) or st.st_size > LIMIT_GZIP_BYTES:
        raise ValueError("Private SQL source is not a bounded regular file")
    if st.st_mode & stat.S_IROTH:
        raise ValueError("The SQL backup must not be world-readable")
    digest = hashlib.sha256()
    with absolute.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    if digest.hexdigest().lower() != expected_sha256.lower():
        raise ValueError("The SQL snapshot differs from the pinned backup")
    return absolute


def parse_dump(path: Path) -> dict[str, list[dict[str, str | None]]]:
    """Read relevant mysqldump INSERT rows without persisting any customer data."""
    csv.field_size_limit(LIMIT_ROW_BYTES)
    data: dict[str, list[dict[str, str | None]]] = {key: [] for key in SCHEMAS}
    inside: str | None = None
    blocks = collections.Counter()
    with gzip.open(path, "rt", encoding="utf-8", errors="strict") as source:
        for line in source:
            if line.startswith("INSERT INTO \x60"):
                match = TABLE_LINE.match(line)
                inside = match.group(1) if match and match.group(1) in SCHEMAS else None
                if inside:
                    blocks[inside] += 1
                continue
            if inside is None:
                continue
            row = line.strip()
            if not row:
                continue
            if not row.startswith("(") or not row.endswith(("),", ");")):
                raise ValueError("Unexpected mysqldump row format")
            fields = next(csv.reader(
                [row[1:-2]], delimiter=",", quotechar="'",
                escapechar="\\", doublequote=False, strict=True
            ))
            cols = SCHEMAS[inside]
            if len(fields) != len(cols):
                raise ValueError("Unexpected SQL table column count")
            data[inside].append(dict(zip(cols, [
                None if field == "NULL" else field for field in fields
            ])))
            if len(data[inside]) > MAX_TABLE_ROWS:
                raise ValueError("SQL input exceeded bounded row count")
            if row.endswith(";"):
                inside = None
    if not all(blocks[key] >= 1 for key in SCHEMAS):
        raise ValueError("Required WooCommerce tables missing from source")
    if not data[PREFIX + "woocommerce_downloadable_product_permissions"]:
        raise ValueError("No historical permission rows found")
    return data


def build_index(data: dict) -> tuple[dict, dict, list]:
    posts = {row["ID"]: row for row in data[PREFIX + "posts"]}
    if len(posts) != len(data[PREFIX + "posts"]):
        raise ValueError("Duplicate WordPress post IDs")
    accepted_keys = {"_billing_email", "_order_key", "_downloadable_files", "_downloadable"}
    metadata: dict[str, dict[str, str | None]] = collections.defaultdict(dict)
    for row in data[PREFIX + "postmeta"]:
        if row["meta_key"] in accepted_keys:
            metadata[row["post_id"]][row["meta_key"]] = row["meta_value"]
    rows = data[PREFIX + "woocommerce_downloadable_product_permissions"]
    if len({x["permission_id"] for x in rows}) != len(rows):
        raise ValueError("Duplicate WooCommerce permission IDs")
    return posts, metadata, rows


def permission_state(row: dict, posts: dict, meta: dict, at: dt.datetime) -> dict:
    order = posts.get(row["order_id"])
    product = posts.get(row["product_id"])
    order_meta = meta.get(row["order_id"], {})
    product_meta = meta.get(row["product_id"], {})
    billing = (order_meta.get("_billing_email") or "").strip().casefold()
    permission_email = (row["user_email"] or "").strip().casefold()
    identity_link_ok = bool(billing) and billing == permission_email
    order_key_ok = bool(order_meta.get("_order_key")) and order_meta["_order_key"] == row["order_key"]
    order_completed = bool(order and order["post_type"] == "shop_order" and order["post_status"] == "wc-completed")
    product_ok = bool(product and product["post_type"] == "product" and product["post_status"] == "publish")
    files = product_meta.get("_downloadable_files") or ""
    file_id = row["download_id"] or ""
    file_match = bool(re.fullmatch(r"[a-fA-F0-9]{32}", file_id)) and file_id in files
    downloadable = product_meta.get("_downloadable") == "yes"
    expiry = row["access_expires"]
    unlimited_expiry = expiry in (None, "", "0000-00-00 00:00:00")
    time_ok = unlimited_expiry or dt.datetime.strptime(expiry, DB_TIME) > at
    remaining = row["downloads_remaining"]
    quota_ok = remaining in (None, "") or int(remaining) > 0
    valid = (identity_link_ok and order_key_ok and order_completed
             and product_ok and file_match and downloadable and time_ok and quota_ok)
    return {
        "eligible_for_manual_review": bool(valid),
        "expired": not time_ok,
        "quota_exhausted": not quota_ok,
        "order_completed": order_completed,
        "identity_links_match": bool(identity_link_ok and order_key_ok),
        "product_and_metadata_valid": bool(product_ok and file_match and downloadable),
    }


def audit(data: dict, at: dt.datetime) -> dict:
    posts, meta, permissions = build_index(data)
    if len(permissions) != 188:
        raise ValueError("This audited snapshot must contain exactly 188 permissions")
    states = [permission_state(p, posts, meta, at) for p in permissions]
    by_order: dict[str, list[bool]] = collections.defaultdict(list)
    emails: set[str] = set()
    for row, st in zip(permissions, states):
        by_order[row["order_id"]].append(st["eligible_for_manual_review"])
        if row["user_email"]:
            emails.add(row["user_email"].strip().casefold())
    if len(by_order) != 12 or len(emails) != 12:
        raise ValueError("Expected historical customer/order counts changed")
    fail = collections.Counter()
    for state in states:
        for flag in ("expired", "quota_exhausted"):
            fail[flag] += int(state[flag])
        fail["invalid_order_status"] += int(not state["order_completed"])
        fail["mismatched_order_key_or_billing_email"] += int(not state["identity_links_match"])
        fail["missing_product_or_download_metadata"] += int(not state["product_and_metadata_valid"])
    return {
        "gate": "HISTORICAL_WOOCOMMERCE_PRIVATE_ENTITLEMENT_AUDIT_PASS",
        "source": "PINNED_2026_11_07_SQL_BACKUP",
        "snapshotRows": len(permissions),
        "uniqueBillingEmails": len(emails),
        "ordersWithPermissions": len(by_order),
        "distinctProducts": len({x["product_id"] for x in permissions}),
        "uniqueDownloadFileIds": len({x["download_id"] for x in permissions}),
        "distinctProductFilePairs": len({(x["product_id"], x["download_id"]) for x in permissions}),
        "manuallyReviewableRows": sum(x["eligible_for_manual_review"] for x in states),
        "ordersWithManuallyReviewableRows": sum(any(x) for x in by_order.values()),
        "expiredRows": fail["expired"],
        "quotaExhaustedRows": fail["quota_exhausted"],
        "crossLinkFailureCounts": {
            "orderStatus": fail["invalid_order_status"],
            "billingEmailOrOrderKey": fail["mismatched_order_key_or_billing_email"],
            "productOrFileMetadata": fail["missing_product_or_download_metadata"],
        },
        "buyerRecordsExported": 0,
        "physicalMediaVerifiedByThisTool": False,
        "deliveryAuthorizedByThisTool": False,
        "warning": "Date/quota eligibility is not proof of legal entitlement or identity. An operator must confirm mailbox control, terms, media rights and approved delivery.",
        "asOfAssumedSiteLocalTime": at.isoformat(timespec="seconds"),
    }


def lookup(data: dict, at: dt.datetime, order_number: str, billing_email: str) -> dict:
    if not re.fullmatch(r"[0-9]{1,20}", order_number):
        return {"result": "NOT_VERIFIED", "deliveryAuthorized": False}
    normalized = billing_email.strip().casefold()
    if not re.fullmatch(r"[^@\s]{1,160}@[^@\s]{1,160}", normalized):
        return {"result": "NOT_VERIFIED", "deliveryAuthorized": False}
    posts, meta, permissions = build_index(data)
    matched = [
        row for row in permissions
        if row["order_id"] == order_number
        and (row["user_email"] or "").strip().casefold() == normalized
        and (meta.get(order_number, {}).get("_billing_email") or "").strip().casefold() == normalized
    ]
    # Deliberately give the same failure response for wrong order or email.
    if not matched:
        return {"result": "NOT_VERIFIED", "deliveryAuthorized": False}
    states = [permission_state(row, posts, meta, at) for row in matched]
    if not all(state["identity_links_match"] for state in states):
        return {"result": "NOT_VERIFIED", "deliveryAuthorized": False}
    return {
        "result": "ARCHIVED_ORDER_MATCHED_FOR_HUMAN_REVIEW",
        "orderStatus": "completed" if all(s["order_completed"] for s in states) else "not_completed",
        "grantRows": len(matched),
        "usableByDateAndQuotaAndMetadata": sum(s["eligible_for_manual_review"] for s in states),
        "expired": sum(s["expired"] for s in states),
        "quotaExhausted": sum(s["quota_exhausted"] for s in states),
        "distinctProductCount": len({row["product_id"] for row in matched}),
        "productIdsForPrivateOperatorOnly": sorted({row["product_id"] for row in matched}, key=int),
        "emailOrOrderIdEchoed": False,
        "filePathsOrDownloadTokensDisclosed": False,
        "deliveryAuthorized": False,
        "nextAction": "Verify control of the original billing mailbox through a separate communication; review transaction, rights and the proposed protected delivery channel. Do not expose WooCommerce media paths.",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Offline WooCommerce purchase-history verifier; read-only and no buyer-list exports.")
    parser.add_argument("--source", required=True, type=Path, help="Private gzipped mysqldump, never the webroot")
    parser.add_argument("--sha256", default=CANONICAL_BACKUP_SHA256, help="Independently confirmed SQL backup SHA-256")
    parser.add_argument("--as-of", default=None, help="Site-local YYYY-MM-DDTHH:MM:SS time for expiry check")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--audit", action="store_true", help="Aggregate count only; no PII")
    mode.add_argument("--lookup", action="store_true", help="Interactive operator lookup; prompts never accepted as argv")
    args = parser.parse_args()
    if args.as_of:
        at = dt.datetime.strptime(args.as_of, "%Y-%m-%dT%H:%M:%S")
    else:
        # WooCommerce legacy expiry fields may be site-local; review near-boundary grants.
        at = dt.datetime.now()
    try:
        source = verified_source(args.source, args.sha256)
        rows = parse_dump(source)
        if args.audit:
            result = audit(rows, at)
        else:
            if not sys.stdin.isatty():
                raise RuntimeError("Private lookup requires a local interactive terminal; no argv/stdin batch PII")
            order_number = getpass.getpass("Historical order number (hidden): ")
            billing_email = getpass.getpass("Original billing email (hidden): ")
            result = lookup(rows, at, order_number, billing_email)
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return 0 if result.get("result") != "NOT_VERIFIED" else 3
    except Exception as exc:
        # Do not echo raw exception details: SQL parsing errors may include source fields.
        print(json.dumps({"gate": "ENTITLEMENT_AUDIT_FAILED_CLOSED",
                          "errorClass": type(exc).__name__,
                          "buyerDataPrinted": False}), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
