# V16 HTTP adapter staging — 2026-11-25

## Verified
PHP 8.4.28 on Everest, actual loopback HTTP server, synthetic SQLite state and disposable synthetic bytes. Four PHP lint checks passed. First run: 24/24 HTTP assertions, 32 MiB. Revised run: 26/26 HTTP assertions, 277513728 bytes, exact full-file SHA-256, 2.609 s loopback transfer. No real grants or recordings were used. Prior v14 and v15 suites had 36 and 30 passes respectively; they were not rerun in this batch.

Run on a compatible private Linux staging machine from this directory:
`python3 buyer-http-v16.test.py /path/to/php8.4`
Requires PHP PDO SQLite and permission for a local loopback server and temporary synthetic file of 277513728 bytes. The test removes its temporary directory. It uses an HTTP client with explicit cookie handling: Secure/HttpOnly/SameSite attributes were checked, not browser-enforced under TLS.

## Important limitations
- No production route, deployment or HTTPS acceptance. The browser test environment denied loopback navigation; no attempt to bypass that policy. Initial credential-bearing redirect uses no-referrer; clean confirmation uses same-origin to avoid suppressing same-origin POST Origin. Browser acceptance remains mandatory.
- Single current browser download cookie and challenge cookie; simultaneous independent purchases in one browser may conflict. Review before release.
- Production gate requires explicit releaseApproved and legacyQueryLoggingVerifiedSafe attestations; these are not proof of host log configuration. Inspect actual host access/error/proxy logs and reject release until safe.
- Exact legacy normalization, refunds/file-enabled state, retention/cleanup, abuse protection for repeated file opens, current vault hashes, private configuration/key custody, independent recovery and final freeze reconciliation remain open.
- Each media open still recomputes SHA-256. The synthetic loopback timing does not establish Internet throughput, concurrency, shared-host limits or real-audio service performance.
- No customer data, secret, backup or paid audio in Git. Public repository contains code and synthetic acceptance only.

Do not merge or deploy until independently approved acceptance. The legacy WordPress/WooCommerce installation remains active.
