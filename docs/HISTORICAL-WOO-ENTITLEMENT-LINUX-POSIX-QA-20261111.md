# Historical WooCommerce entitlement — full Linux/POSIX regression (11 November 2026)

**PASS: 11 tests, 0 failures, 0 skips.** No live WordPress/WooCommerce changes.

The offline operator tool in `scripts/historical_entitlement_offline.py` was tested using `tests/test_historical_entitlement_offline.py` with the Python runtime in WSL2 Ubuntu 24.04. This avoids the single skipped POSIX filesystem-permission test on Windows.

The 11 tests cover: a valid historical grant; exhausted download quota; expired grant; cancelled order; mismatched billing email; mismatched order key; missing product/download metadata; product not marked downloadable; protected nondisclosure in order lookup; rejection of a SQL source in a public webroot; and rejection of a private SQL source that is group-readable on Linux.

The test runner reported **Ran 11 tests**, **OK**, exit code **0**. All test orders/emails were synthetic, no customer data was read or printed, and no audio was released.

Historical snapshots: the operator code remains pinned to its previous validated SQL dump from 7 November. A separate actual 11 November MariaDB restore confirmed 188 permission rows and 12 orders with permissions; it did not mean new real-customer operator lookups were performed.

**Not authorized:** buyer self-service, expired/quota-exhausted rights expansion, downloads, customer account migration, payment/refund operations or live public endpoints.

**Canonical cutover policy flags remain false:** `oldCustomersFulfillmentDecisionApproved`, `privacyRetentionAndDeletionPolicyApproved`, and `finalWrittenOwnerApproval`.
