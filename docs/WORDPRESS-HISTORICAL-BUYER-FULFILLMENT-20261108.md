# Historical WooCommerce buyers — offline fulfilment procedure (8 November 2026)

**Decision required from owner before production retirement.** The goal is a standalone Astro site without live WordPress or WooCommerce, while retaining an evidence-backed route to handle legitimate historical purchasers privately.

## Verified archived records, privacy-safe

Read-only parsing of the pinned 7 November private SQL dump identified **188 permission rows, 12 distinct historical billing email addresses, 12 distinct referenced orders, 19 published downloadable products, 26 distinct download-file IDs and 36 distinct product/download-file pairs**. Each of the **12 referenced orders is marked `wc-completed`** in the archive. All 188 permission rows match both the archived order billing email and WooCommerce order key; every product/download-file pair appears in the stored `_downloadable_files` metadata. No source emails, order keys, media paths, or download identifiers are committed.

On 8 November 2026, **124 permission rows across 8 orders** have both an unexpired date and remaining quota and pass the archived cross-link requirements. **59 rows have zero downloads remaining**, **5 have expired**, and **6 have unlimited download count**. The other 4 orders have no remaining usable permission rows under those narrow criteria. A permission-row count is **not** a customer count, and expired/depleted records must **not automatically be treated as extinguishing contractual rights**. Dates are compared against an assumed site-local clock and require manual review if near their boundary.

The original media integrity check previously verified the 26 distinct protected original files against their independent manifest. This is separate from the proof that individual per-product file IDs exist in metadata. It is **not proof of current distribution rights**.

## Offline operator-only verifier

`scripts/historical_entitlement_offline.py` is a read-only Python standard-library tool that reads the **SHA-256-pinned** original compressed SQL backup, checks order status, billing-email and order-key consistency, published/downloadable product, file ID in product metadata, expiry and remaining download quota. It does not write customer records, export mailing lists, send email, or generate public download URLs.

From a **private server terminal or protected offline machine** with the independently checked SQL snapshot:

```bash
python3 scripts/historical_entitlement_offline.py \
  --source /home/hzorche/ra-core-deploy-staging/432-retirement-readiness-20261107/wordpress-db-before-retirement-20261107.sql.gz \
  --as-of 2026-11-08T13:12:00 --audit
```

For a specific private customer-support case, run the same command with `--lookup` instead of `--audit`; the tool asks for the **original order number** and **billing email** through a hidden TTY prompt. Never place customer details in shell command-line arguments, GitHub issues, chatbot messages or logs. An email/order match is **not proof of mailbox ownership**: the owner or authorized representative must conduct an independent email-control check and verify the agreement and applicable rights before any delivery.

The CLI returns only a bounded summary and internally uses archived order/product IDs for private operator reconciliation. It has no sending endpoint, no web interface, no token generation and no ability to expose the paid original file paths.

Run the synthetic, no-PII regressions with:

```bash
python3 -m unittest discover -s tests -p 'test_historical_entitlement_offline.py' -v
```

## Proposed human-reviewed service after WooCommerce retirement

1. Keep a durable **encrypted backup outside Superhosting**, including the SQL and original protected files, with key custody and a successful restore drill; keep protected masters inaccessible to anonymous HTTP.
2. Publish an ordinary contact email or form on Astro explaining that purchasers of historical recordings can request help. Do not advertise automatic download access until such an access system is actually operational.
3. Operator confirms control of the original billing email via a separate email reply, confirms order details through the offline verifier, and checks terms, product availability and permitted delivery rights.
4. For an approved case, prepare **only the individually entitled files** using a private workstation, encrypt or use a restricted short-lived transfer controlled by the owner, and communicate through the verified address. No anonymous folder of original master recordings, permanent shared public URL or old WooCommerce direct source link.
5. Log only the minimum support event identifier, outcome and retention deadline in private storage. Do not use a historical buyer list for marketing without a separate valid legal basis.
6. Obtain a qualified local accounting/privacy assessment on retention of receipts, invoices and account personal data before deleting the retired WooCommerce database.

**Until the owner approves this human-reviewed fulfilment process, the production cutover remains blocked.** Do not remove the live customer service while it remains the only verified fulfilment mechanism.
