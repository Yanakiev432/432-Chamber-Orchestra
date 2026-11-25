# Legacy buyer delivery v15 — staging acceptance, 2026-11-25

## Scope and evidence
30 new synthetic tests passed on Everest PHP 8.4.28, in addition to the prior 36 core tests. Tests used in-memory SQLite and a private 10-byte fixture, not real purchasers. No real data copied or written. The modules implement import of an operator-verified normalized manifest, strict legacy query parsing, browser-bound expiring challenges, atomic consumption on explicit confirmation, session-resumable range descriptors and a candidate per-IP throttle. GET does not consume download quota. No endpoint is exposed.

Read-only live reconciliation: 188/188 Woo permissions map to 80 catalog relations; 26/26 unique private files pass size/mode checks, 26 distinct hashes. 129 grants have positive or unlimited quota; 124 also pass UTC expiry-day check. No invalid dates or missing relations. WordPress sets the default PHP timezone UTC and installed Woo checks expiry against midnight; the candidate expiry conversion preserves validity through the recorded UTC day. Prior v13 order and metadata eligibility predicates still require final freeze reconciliation. No individual rows or credentials exported.

## Run
Private CLI: php buyer-core.test.php ; php buyer-v15.test.php

## Outstanding mandatory gates
- This is a transport-neutral flow, NOT an HTTP adapter or a production service. Implement and test exact HTTPS host, path, origin/method enforcement, browser-bound Secure HttpOnly SameSite cookies, clean redirects, CSRF, streamed bounded responses, generic error mapping, no sensitive logging (including host access logs of historic URLs), rate cleanup and abuse limits. Verify real HTTP 200/206/416 and large WAV transfer.
- Confirm actual Woo email normalization (including literal plus handling, case and Unicode), exact product file enabled state, all final order/refund/permission predicates and historical link variants. The parser deliberately rejects duplicate/ambiguous or unknown fields. Normalized snapshot input must be verified by an authenticated operator; do not trust a client-provided enabled flag.
- Import only after approved access/retention policy and final freeze, private DB mode, separate key custody and exact snapshot/vault hashes. New tokens must never be in Git, URLs, logs or analytics. No live grant consumption to test.
- The 60-minute session, 10-minute challenge, 30 requests/5min rate default and explicit confirmation are candidate decisions. Review concurrent downloads, interrupted transfer, expiry and recovery with actual clients.
- File hash is currently recomputed at open; benchmark large files and verify immutable vault/DB private path, host limitations, backups, restore and cutover. No release until approved buyer acceptance and rollback.
