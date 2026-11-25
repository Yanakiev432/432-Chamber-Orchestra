# V17 — isolated multi-purchase HTTP sessions, 2026-11-25

## Evidence
Actual synthetic loopback PHP 8.4 / SQLite HTTP QA on Everest. Regression run: v14 36/36, v15 30/30, v16 26/26; initial v17 failed at cookie-count assertion. Python 3.6 cookie parser treated SameSite attributes incorrectly; corrected test parser to accept only scoped cookie name/value pairs and Max-Age=0 deletions. Corrected v17: 38/38. Extended final v17: 40/40 including actual client disconnect after 65536 bytes and HTTP 206 resume without additional quota. Full synthetic transfer 277513728 bytes, exact SHA-256, 4.724 seconds loopback. No real customer data, audio or rights used. 132 final passing assertions across four suites; suites run in this batch, not one single invocation after harness correction.

## Candidate adapter
Use buyer-http-adapter-v17.php instead of v16 for future staging. Keep v16 only for regression. Distinct challenge and download cookies keyed by 128-bit truncated SHA-256 selector of an independent random 256-bit token. The selector is not sufficient for access. No raw token in URL; scoped cookie and exact selector verification are required. Two independent purchase flows, cross-cookie swap rejection, full and range transfer, expiry cleanup and rate denial were tested with a manually managed HTTP cookie jar.

Bounded cleanup on accepted legacy link requests removes expired challenges and sessions and old throttle windows, up to 200 rows per table. Preserves grants, media and credentials. It is not scheduled maintenance yet. Candidate rate limits: 30 legacy requests, 90 confirmation requests, 120 file requests per IP per 5 minutes, and 60 file requests per session per 5 minutes. The rate-denial test seeds the current session counter rather than sending 60 large-file requests.

Run from this directory on private Linux staging:
- php buyer-core.test.php
- php buyer-v15.test.php
- python3 buyer-http-v16.test.py /path/to/php8.4
- python3 buyer-http-v17.test.py /path/to/php8.4

## Release gates
Actual browser TLS cookie enforcement, host access-log redaction, routing and staging ingress remain open. Scoped cookies can accumulate and must be checked against browser cookie and server header limits; two logical concurrent purchase sessions were tested, not parallel socket load. Per-request media hashing remains, and rate limits alone do not bound global concurrent transfers. Verify shared-host resource limits, retention and scheduled cleanup, crash recovery and backup. Verify exact legacy normalization, refunds, file enabled state, final freeze and private entitlement import. No production route, changes to real grants or cutover in this package. Never commit real media, credentials, customer records or private infrastructure configuration.
