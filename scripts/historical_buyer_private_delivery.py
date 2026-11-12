#!/usr/bin/env python3
"""Private, operator-mediated historic WooCommerce file handoff (NOT deployed).

No customer account, payment, or WordPress integration. The exact original
permission is checked by scripts/historical_entitlement_offline.py first.
No delivery is possible without separately prepared owner policy + manual
verification approval; both must be private, SHA-tied, and unexpired.

The optional HTTP server binds LOOPBACK ONLY. It is a reference prototype,
NOT a production web server, reverse proxy, or replacement for customer QA.
"""
from __future__ import annotations

import argparse
import contextlib
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import stat
import sys
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from shutil import copyfileobj

POLICY_GATE = "432_HISTORICAL_BUYER_POLICY_OWNER_APPROVED"
APPROVAL_GATE = "432_HISTORICAL_ORDER_MANUALLY_VERIFIED_AND_REISSUE_APPROVED"
MAX_TTL = 3600
MAX_POLICY_AGE = 30 * 86400
MAX_APPROVAL_AGE = 48 * 3600
TOKEN_PATTERN = re.compile(r"^[A-Za-z0-9_-]{43}$")
TICKET_PATTERN = re.compile(r"^[A-Za-z0-9_-]{16,64}$")
HEX64 = re.compile(r"^[a-f0-9]{64}$")
CHUNK = 1024 * 1024


class Closed(Exception):
    """Security policy refuses the requested action."""


def require(value: bool, message: str) -> None:
    if not value:
        raise Closed(message)


def private_directory(folder: Path) -> Path:
    folder = folder.absolute()
    require(folder.is_dir() and not folder.is_symlink(), "PRIVATE_DIRECTORY_MISSING")
    resolved = folder.resolve(strict=True)
    require(not {"public_html", "htdocs", "www", "dist", "public"}.intersection(resolved.parts),
            "PRIVATE_DIRECTORY_IN_PUBLIC_ROOT")
    if os.name == "posix":
        require((os.lstat(resolved).st_mode & 0o077) == 0,
                "PRIVATE_DIRECTORY_PERMISSIONS_TOO_OPEN")
    return resolved


def private_json(path: Path) -> tuple[dict, str]:
    require(path.is_file() and not path.is_symlink(), "PRIVATE_PROOF_FILE_MISSING")
    require(not {"public_html", "htdocs", "www", "dist", "public"}.intersection(path.resolve().parts),
            "PRIVATE_PROOF_IN_PUBLIC_ROOT")
    if os.name == "posix":
        require((os.lstat(path).st_mode & 0o077) == 0, "PROOF_PERMISSIONS_TOO_OPEN")
    raw = path.read_bytes()
    require(len(raw) <= 32768, "PROOF_TOO_LARGE")
    data = json.loads(raw)
    require(isinstance(data, dict), "PROOF_JSON_MUST_BE_OBJECT")
    return data, hashlib.sha256(raw).hexdigest()


def hash_stream(fileobj) -> str:
    digest = hashlib.sha256()
    for chunk in iter(lambda: fileobj.read(CHUNK), b""):
        digest.update(chunk)
    return digest.hexdigest()


def media_file(root: Path, relative: str, expected_hash: str) -> Path:
    require(isinstance(relative, str) and 0 < len(relative) <= 240,
            "BAD_MEDIA_REFERENCE")
    require(not relative.startswith(("/", "\\")) and "\\" not in relative,
            "UNSAFE_MEDIA_PATH")
    segments = relative.split("/")
    require(all(x not in ("", ".", "..") for x in segments), "TRAVERSAL_IN_MEDIA_PATH")
    require(relative.lower().endswith((".wav", ".mp3")), "MEDIA_EXTENSION_NOT_ALLOWED")
    require(bool(HEX64.fullmatch(expected_hash)), "MEDIA_SHA256_INVALID")
    root = private_directory(root)
    path = root.joinpath(*segments)
    pointer = root
    for segment in segments:
        pointer = pointer / segment
        require(not pointer.is_symlink(), "MEDIA_SYMLINK_FORBIDDEN")
    require(path.is_file(), "MEDIA_NOT_PRESENT")
    require(os.path.commonpath([str(root), str(path.resolve())]) == str(root),
            "MEDIA_ESCAPES_PRIVATE_ROOT")
    if os.name == "posix":
        require((os.lstat(path).st_mode & 0o077) == 0,
                "MEDIA_FILE_NOT_PRIVATE")
    with path.open("rb") as media:
        require(hash_stream(media) == expected_hash, "MEDIA_SHA256_NOT_MATCHED")
    return path


@contextlib.contextmanager
def ledger_lock(state: Path):
    root = private_directory(state)
    lock = root / ".delivery.lock"
    fd = os.open(str(lock), os.O_RDWR | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0), 0o600)
    try:
        if os.name == "posix":
            require((os.fstat(fd).st_mode & 0o077) == 0, "LEDGER_LOCK_PERMISSIONS")
        fcntl.flock(fd, fcntl.LOCK_EX)
        yield root
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def load_ledger(folder: Path) -> list[dict]:
    path = folder / "delivery-ledger.json"
    if not path.exists():
        return []
    data, _ = private_json(path)
    require(data.get("schemaVersion") == 1 and isinstance(data.get("items"), list),
            "LEDGER_SCHEMA_CHANGED")
    require(len(data["items"]) <= 10000, "LEDGER_TOO_LARGE")
    return data["items"]


def save_ledger(folder: Path, items: list[dict]) -> None:
    dest = folder / "delivery-ledger.json"
    temp = folder / (".ledger-tmp-" + secrets.token_hex(16))
    body = json.dumps({"schemaVersion": 1, "items": items},
                      ensure_ascii=True, sort_keys=True, separators=(",", ":")).encode("utf-8")
    fd = os.open(str(temp), os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "wb") as file:
            file.write(body)
            file.flush()
            os.fsync(file.fileno())
        os.replace(str(temp), str(dest))
    finally:
        if temp.exists():
            temp.unlink()


def approved_inputs(policy_path: Path, approval_path: Path, now: int) -> tuple[dict, dict, str, str]:
    policy, psha = private_json(policy_path)
    approval, asha = private_json(approval_path)
    require(policy.get("gate") == POLICY_GATE and policy.get("ownerApproved") is True,
            "OWNER_POLICY_NOT_APPROVED")
    require(policy.get("accountantRetentionReviewed") is True
            and policy.get("humanReissueProcessApproved") is True
            and policy.get("protectedDeliveryMechanismApproved") is True,
            "OWNER_POLICY_INCOMPLETE")
    require(isinstance(policy.get("reviewedAtEpoch"), int)
            and now - MAX_POLICY_AGE <= policy["reviewedAtEpoch"] <= now,
            "OWNER_POLICY_STALE")
    require(isinstance(policy.get("expiresAtEpoch"), int)
            and now < policy["expiresAtEpoch"] <= now + MAX_POLICY_AGE,
            "OWNER_POLICY_EXPIRED")
    require(approval.get("gate") == APPROVAL_GATE, "PURCHASE_REVIEW_NOT_APPROVED")
    require(all(approval.get(key) is True for key in (
        "ownerAuthorizedThisSpecificReissue",
        "operatorVerifiedOriginalOrder",
        "originalCompletedPaymentVerified",
        "originalMailboxControlVerified",
        "originalGrantCurrentAndNotExhausted",
        "sourceRightsConfirmed",
        "noUnresolvedRefundOrDispute",
        "privateMediaHashIndependentlyVerified"
    )), "PURCHASE_RIGHTS_NOT_VERIFIED")
    require(isinstance(approval.get("reviewedAtEpoch"), int)
            and now - MAX_APPROVAL_AGE <= approval["reviewedAtEpoch"] <= now,
            "PURCHASE_REVIEW_STALE")
    ticket = approval.get("ticketId")
    require(isinstance(ticket, str) and bool(TICKET_PATTERN.fullmatch(ticket)),
            "TICKET_MUST_BE_OPAQUE")
    require(isinstance(approval.get("mediaRelativePath"), str)
            and isinstance(approval.get("mediaSha256"), str),
            "APPROVAL_MISSING_MEDIA_PROOF")
    return policy, approval, psha, asha


def issue(state: Path, media_root: Path, policy_path: Path, approval_path: Path,
          ttl: int, now: int | None = None, catalog_path: Path | None = None) -> Path:
    now = int(now if now is not None else time.time())
    require(isinstance(ttl, int) and 0 < ttl <= MAX_TTL, "TTL_LONGER_THAN_ONE_HOUR")
    _, approval, policy_hash, approval_hash = approved_inputs(policy_path, approval_path, now)
    require(catalog_path is not None, "PRIVATE_MEDIA_CATALOG_REQUIRED")
    catalog, catalog_hash = private_json(catalog_path)
    require(catalog.get("gate") == "432_WOO_80_PRODUCT_DOWNLOAD_LINKS_JOINED_TO_26_PRIVATE_MEDIA"
            and catalog.get("privateCatalogOnly") is True
            and isinstance(catalog.get("catalogEntries"), list),
            "PRIVATE_CATALOG_NOT_VERIFIED")
    product_id = approval.get("productId")
    download_id = approval.get("downloadId")
    require(isinstance(product_id, int) and product_id > 0
            and isinstance(download_id, str) and bool(re.fullmatch("[a-f0-9]{32}", download_id)),
            "APPROVED_PRODUCT_OR_DOWNLOAD_ID_INVALID")
    matches = [item for item in catalog["catalogEntries"]
               if item.get("productId") == product_id and item.get("downloadId") == download_id]
    require(len(matches) == 1, "APPROVED_GRANT_NOT_IN_PRIVATE_MEDIA_CATALOG")
    item = matches[0]
    require(item.get("privateFilename") == approval["mediaRelativePath"]
            and item.get("sha256") == approval["mediaSha256"],
            "APPROVED_FILE_DOES_NOT_MATCH_ORIGINAL_PRODUCT_GRANT")
    media = media_file(media_root, approval["mediaRelativePath"], approval["mediaSha256"])
    with ledger_lock(state) as folder:
        rows = load_ledger(folder)
        require(not any(x.get("ticketHash") == hashlib.sha256(approval["ticketId"].encode()).hexdigest()
                        for x in rows), "TICKET_ALREADY_HANDLED")
        token = secrets.token_urlsafe(32)
        require(bool(TOKEN_PATTERN.fullmatch(token)), "TOKEN_ENTROPY_INVALID")
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        grant_id = secrets.token_hex(16)
        token_file = folder / ("token-" + grant_id + ".secret")
        fd = os.open(str(token_file), os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        try:
            with os.fdopen(fd, "w", encoding="ascii") as f:
                f.write(token + "\n")
                f.flush()
                os.fsync(f.fileno())
            rows.append({
                "id": grant_id, "tokenHash": token_hash,
                "ticketHash": hashlib.sha256(approval["ticketId"].encode()).hexdigest(),
                "policyReceiptSha256": policy_hash, "approvalReceiptSha256": approval_hash,
                "privateMediaCatalogSha256": catalog_hash,
                "productId": product_id, "downloadIdHash": hashlib.sha256(download_id.encode()).hexdigest(),
                "mediaRelativePath": approval["mediaRelativePath"],
                "mediaSha256": approval["mediaSha256"], "status": "ISSUED",
                "issuedAtEpoch": now, "expiresAtEpoch": now + ttl,
                "redeemedAtEpoch": None
            })
            save_ledger(folder, rows)
        except Exception:
            token_file.unlink(missing_ok=True)
            raise
    return token_file


def revoke(state: Path, grant_id: str) -> bool:
    require(isinstance(grant_id, str) and bool(re.fullmatch("[a-f0-9]{32}", grant_id)),
            "INVALID_GRANT_ID")
    with ledger_lock(state) as folder:
        rows = load_ledger(folder)
        match = [x for x in rows if x["id"] == grant_id]
        require(len(match) == 1, "GRANT_NOT_FOUND")
        require(match[0]["status"] == "ISSUED", "GRANT_NOT_REVOCABLE")
        match[0]["status"] = "REVOKED"
        save_ledger(folder, rows)
        # Retire the bearer-token file as soon as it cannot be redeemed.
        (folder / ("token-" + grant_id + ".secret")).unlink(missing_ok=True)
        return True


def claim(state: Path, media_root: Path, token: str, now: int | None = None):
    """Atomically consume one grant and return an open, SHA-verified media descriptor.

    One-time use: failures during client transfer do NOT reinstate the token.
    No anonymous direct access to the underlying media path is permitted.
    """
    require(isinstance(token, str) and bool(TOKEN_PATTERN.fullmatch(token)),
            "TOKEN_MALFORMED")
    now = int(now if now is not None else time.time())
    check = hashlib.sha256(token.encode()).hexdigest()
    with ledger_lock(state) as folder:
        rows = load_ledger(folder)
        match = [x for x in rows if secrets.compare_digest(x.get("tokenHash", ""), check)]
        require(len(match) == 1, "TOKEN_NOT_FOUND")
        record = match[0]
        require(record["status"] == "ISSUED", "TOKEN_ALREADY_USED_OR_REVOKED")
        require(now < record["expiresAtEpoch"], "TOKEN_EXPIRED")
        media = media_file(media_root, record["mediaRelativePath"], record["mediaSha256"])
        fd = os.open(str(media), os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
        try:
            require(stat.S_ISREG(os.fstat(fd).st_mode), "MEDIA_DESCRIPTOR_NOT_REGULAR")
            with os.fdopen(os.dup(fd), "rb") as probe:
                require(hash_stream(probe) == record["mediaSha256"], "MEDIA_CHANGED_AT_REDEMPTION")
            # dup() shares the same kernel file offset. Rewind before serving.
            require(os.lseek(fd, 0, os.SEEK_SET) == 0, "MEDIA_REWIND_FAILED")
            record["status"] = "REDEEMED"
            record["redeemedAtEpoch"] = now
            save_ledger(folder, rows)
            # Neither used tokens nor their plaintext should survive in the vault.
            (folder / ("token-" + record["id"] + ".secret")).unlink(missing_ok=True)
            return os.fdopen(fd, "rb")
        except Exception:
            os.close(fd)
            raise


class LocalOnlyDownloadServer(HTTPServer):
    allow_reuse_address = False


def make_handler(state: Path, media_root: Path):
    class Handler(BaseHTTPRequestHandler):
        server_version = "432-private-claim-prototype"
        sys_version = ""

        def log_message(self, format, *args):
            # HTTP path contains a bearer token. Never put it in access logs.
            pass

        def do_GET(self):
            # Deliberately loopback-only even with proxy headers.
            if self.client_address[0] not in ("127.0.0.1", "::1"):
                return self._deny()
            # No query strings or ambiguous encoded paths.
            match = re.fullmatch(r"/d/([A-Za-z0-9_-]{43})", self.path)
            if not match:
                return self._deny()
            try:
                descriptor = claim(state, media_root, match.group(1))
            except Exception:
                return self._deny()
            with descriptor:
                self.send_response(200)
                self.send_header("Content-Type", "application/octet-stream")
                self.send_header("Content-Disposition", 'attachment; filename="licensed-audio.bin"')
                self.send_header("Content-Length", str(os.fstat(descriptor.fileno()).st_size))
                self.send_header("Cache-Control", "private, no-store, max-age=0")
                self.send_header("Referrer-Policy", "no-referrer")
                self.send_header("X-Content-Type-Options", "nosniff")
                self.send_header("Content-Security-Policy", "default-src 'none'")
                self.end_headers()
                copyfileobj(descriptor, self.wfile, CHUNK)

        def do_HEAD(self):
            return self._deny()

        def _deny(self):
            self.send_response(404)
            self.send_header("Cache-Control", "private, no-store")
            self.send_header("Content-Length", "0")
            self.end_headers()

    return Handler


def main() -> int:
    parser = argparse.ArgumentParser(description="Owner-policy-gated, private, one-use historical audio handoff")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--issue", action="store_true")
    mode.add_argument("--revoke", action="store_true")
    mode.add_argument("--serve-loopback", action="store_true")
    parser.add_argument("--state-dir", type=Path, required=True)
    parser.add_argument("--media-root", type=Path)
    parser.add_argument("--policy", type=Path)
    parser.add_argument("--approval", type=Path)
    parser.add_argument("--catalog", type=Path, help="Private 80-to-26 WooCommerce product/download-to-media map")
    parser.add_argument("--ttl", type=int, default=1800)
    parser.add_argument("--grant-id")
    parser.add_argument("--port", type=int, default=0)
    args = parser.parse_args()
    try:
        require(os.name == "posix", "PRIVATE_SERVICE_REQUIRES_LINUX_POSIX")
        if args.issue:
            require(all((args.media_root, args.policy, args.approval, args.catalog)),
                    "PRIVATE_CATALOG_MEDIA_AND_TWO_APPROVALS_REQUIRED")
            target = issue(args.state_dir, args.media_root, args.policy, args.approval,
                           args.ttl, catalog_path=args.catalog)
            print(json.dumps({
                "gate": "HISTORIC_BUYER_SINGLE_USE_TOKEN_CREATED_IN_PRIVATE_FILE",
                "privateTokenFile": str(target),
                "tokenPrinted": False, "productionWebsiteModified": False
            }))
        elif args.revoke:
            require(args.grant_id is not None, "GRANT_ID_REQUIRED")
            revoke(args.state_dir, args.grant_id)
            print(json.dumps({"gate": "PRIVATE_GRANT_REVOKED", "tokenPrinted": False}))
        else:
            require(args.media_root is not None, "MEDIA_ROOT_REQUIRED")
            require(1024 <= args.port <= 65535, "FIXED_LOCAL_TEST_PORT_REQUIRED")
            private_directory(args.state_dir)
            private_directory(args.media_root)
            handler = make_handler(args.state_dir, args.media_root)
            server = LocalOnlyDownloadServer(("127.0.0.1", args.port), handler)
            print(json.dumps({"gate": "LOCAL_LOOPBACK_REFERENCE_SERVER_STARTED",
                              "bind": "127.0.0.1", "port": args.port, "production": False}), flush=True)
            server.serve_forever()
        return 0
    except Exception as exc:
        # No exception detail: OS errors may contain private file paths.
        print(json.dumps({"gate": "HISTORICAL_BUYER_DELIVERY_FAILED_CLOSED",
                          "errorClass": type(exc).__name__,
                          "buyerDataOrTokenPrinted": False}), file=sys.stderr)
        return 3


if __name__ == "__main__":
    raise SystemExit(main())
