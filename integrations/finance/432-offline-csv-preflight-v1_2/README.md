# 432 Chamber Orchestra — Digital Revenue CSV Preflight v1.3

**Scope:** local, offline, read-only evidence checks for G1 Bandcamp, G5 Patreon and G8 monthly finance controls. The package contains **no real client, patron, order, payout or bank data**. There is no web request, email read, token, secret, user tracking or paid API.

## Inputs and execution

Python 3.10+ standard library only. Run in a directory containing all four `.py` files:

```powershell
python -m unittest discover -v
python .\reconcile_bandcamp_2026.py --raw C:\private\bandcamp\raw.csv --out C:\private\bandcamp\sanitized.json
python .\reconcile_patreon_2026.py --payouts C:\private\patreon\monthly.csv --earnings C:\private\patreon\earnings.csv --transactions C:\private\patreon\members.csv --out C:\private\patreon\sanitized.json
```

The source CSV files may contain personally identifying data. **Store them only in a private local directory, never in a public repository, Notion page, or chat.** Outputs contain monthly/currency aggregates and input SHA-256 hashes but no buyer/member identifiers, item names or source file paths. Check file-source authenticity separately; matching header names is *not* proof of an official export.

## Hard accounting invariants

- Bandcamp Raw Data is **item-level**, not order-level. One order may have multiple item rows. Sales, refunds/reversals and payout entries remain separate. Seller tax, marketplace tax and platform fees need independent review. Use official Revenue Summary and Payout Statement for final reconciliation. Historical Standard Payments and Enhanced Payments flows differ.
- Patreon reports use **Pacific Time** and distinguish successful-transaction earnings, finalized earnings and payouts. Do not equate an initiated payout with a cleared bank deposit; amounts and currencies must be reconciled independently. Payout fees are negative; `(gross payout + payout fees) = amount sent` within rounding tolerance.
- The parser rejects **ambiguous comma-formatted amounts**, including `1,23`: silently dropping a decimal comma would multiply an amount by 100. Conventional grouped values like `1,234.56` are accepted. Required earnings/payout amounts and paid digital sale subtotals cannot silently default to zero.
- A missing success/finalization date or amount is **unknown**, not zero or inferred from another stage; unmatched report periods emit warnings. Member transaction success/finalization months absent from the corresponding summary reports are explicitly listed as **unmatched coverage** instead of disappearing from output.
- Internal whitespace in numeric fields such as `1 23` is rejected, including Unicode whitespace; stripping it could silently turn malformed input into a different monetary amount.
- Bandcamp identical sale-item identities within one order are rejected to prevent an overlapping export doubling sales; separate items in one order and the same item in different orders remain distinct. Exact duplicate Patreon member-transaction rows are also rejected (the check is held as a transient SHA-256 digest, not raw member identifiers). Ambiguous or absent transaction IDs require manual review; the tool cannot prove source completeness or identify every partial overlap.
- Negative subtotal/fan contribution/tax on a *sale* row is rejected for a reversal classification check. UTC timestamps including the Bandcamp API example `04 Jan 2021 23:22:11 GMT` are recognized; explicit ISO timezone offsets are normalized to UTC.
- Each input CSV is schema-checked, SHA-256 hashed, UTF-8 BOM compatible and limited to 150 MiB per file. No real customer data is bundled.

## Evidence and restrictions

Synthetic-only test baseline: **56 PASS / 0 FAIL** with Python 3.13.5; no actual official CSV has been imported or reconciled. The scripts cannot prove identity, completeness, provenance, settlement or net profit. Bandcamp/Patreon payout-account and bank confirmation remain **OPEN**. No authorization to change prices, subscriptions, publish, withdraw money, contact supporters or advertise.

Official sources:
- https://get.bandcamp.help/en/articles/15263368-reading-your-raw-data-sales-report
- https://get.bandcamp.help/en/articles/15263083-which-sales-report-should-i-use
- https://support.patreon.com/hc/en-us/articles/50300672671245-Downloading-your-earnings-and-payout-reports
