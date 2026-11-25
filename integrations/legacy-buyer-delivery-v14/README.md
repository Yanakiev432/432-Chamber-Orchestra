# Legacy buyer delivery — PHP staging core v14

**Not deployable as a public endpoint.** PHP 8.4 + PDO SQLite; independent of WordPress. All tests use fictional credentials and synthetic bytes. No real entitlement or audio is in Git.

## Verified 2026-11-25
Everest PHP 8.4.28: 36 PASS / 0 FAIL, including a real file-backed two-connection SQLite lock, failed-session-insert rollback, final-quota contention, byte ranges, token digest, expiry, revocation and tampered media. Test invocation: php buyer-core.test.php (private CLI; not inside a document root).

Read-only historical aggregate: 188 grants, 188 hex32 download IDs and standard order keys, no duplicate product/download/order/email tuple, 6 unlimited, 123 positive remaining, 59 exhausted, 183 without expiry. The v13 audited eligibility count is 124 across 8 orders. No individual data was copied.

## Remaining release gates
1. Review parity against exact WooCommerce normalization, UID generation, case, original access expiry including timezone/day semantics, enabled file state, order/refund/cancellation and current quota; reconcile all 188 permissions and actual media map. Do not interpret historical eligibility as approval.
2. Owner-approved retention/access policy, authenticated private migration/export, HMAC secret held outside Git/webroot, preserve counters and legal rights; no plaintext order keys/email in replacement DB. Reconcile changes after order/download freeze.
3. Choose and test HTTP adapter with explicit user confirmation (GET never consumes), CSRF/session binding, throttling, generic errors, HTTPS, private data paths, no sensitive URL logging/analytics/referrer, secure cache headers, exact host routing, and browser Range/resume behavior. The core is not an HTTP service; the 60 minute session is a candidate rule, not a contract.
4. File verification currently hashes media per open; measure large-file latency and resource use; consider safe immutable verified vault design. Confirm paths match actual private vault names; SQLite local filesystem/locking and backup permissions must be verified.
5. Real hosting integration and rollback with synthetic data; owner-approved controlled real buyer test; independent encrypted recovery backup and key custody. No old-site shutdown until gates close.

No production changes, customer downloads, migration of real grants, or deletion in this phase.
