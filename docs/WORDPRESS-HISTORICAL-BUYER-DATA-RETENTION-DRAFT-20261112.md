# 432 Chamber Orchestra — WooCommerce historical buyer data retention and support policy
**Draft for controller and accountant approval — 12 November 2026; NOT operational authorization.**

## 1. Scope and data minimization

This policy applies to the historical WordPress 5.9.20 / WooCommerce 7.0.2 database and encrypted archives on Everest, Lenovo and OneDrive after the public store migrates to independent Astro/Bandcamp. It is not a privacy notice for future Bandcamp purchases, and does not make 432 Foundation or any other entity the presumed legal controller.

Verified data inventory: **116** SQL tables, **188** historical download-permission records, permissions for **12** historic orders, **19** products and **26** distinct download identifiers. The archived order table contains additional order statuses; those records must not be assumed paid merely because they exist. There is no authorized export of names, emails, IP addresses, addresses, order keys or paid-media paths to the public Astro site or GitHub.

## 2. Legal baseline checked 12 November 2026

- **Bulgarian Accounting Act, Article 12(1)**: accounting registers and financial statements and audit/tax inspection materials have a **10-year** retention period, counted from 1 January after the accounting period; *other accounting information carriers* have a **three-year** category. **Do not assume all WooCommerce tables or every invoice fall under one universal period.** Official source: https://justice.government.bg/home/normdoc/2136697598.
- **Bulgarian VAT Act, Article 121**: certain issued/received tax documents must be preserved until **five years after expiry of the limitation period of the associated public obligation**. The controller's tax/VAT status and obligation-specific dates determine whether and how this applies. Current text reference: https://lex.caselaw.bg/n/zdds/chl-121/.
- **GDPR Regulation (EU) 2016/679**, Articles 5(1)(c/e), 6, 13–17 and 32: purpose limitation, data minimization, storage limitation, a lawful basis, documented transparency and protection of personal data; deletion can be restricted where lawful retention remains necessary. Source: https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/.
- Independent data-protection authority guidance: GDPR itself does not prescribe one universal period for every class of personal data. Source: https://www.dataprotection.ie/en/faqs/responsibilities-data-controllers/how-long-should-personal-data-be-held-meet-obligations-imposed-gdpr.

**Compliance review is mandatory** before approving a cutoff schedule or deleting historic customer data. The operator must verify the specific legal entity/controller, VAT status, invoice/payment practices, applicable accounting years and any still-open contractual rights/disputes.

## 3. Proposed retention register — categories, not invented statutory periods

| Data category | Proposed purpose and restricted treatment | Retention trigger/owner decision |
| --- | --- | --- |
| Accounting and tax evidence (invoices, sales summaries, payment reconciliation, transaction corrections) | Preserve the *minimum required originals* in a separately access-controlled accounting archive; keep integrity and export ability | Accountant categorizes each record under the relevant statute and sets an **actual per-year deletion eligibility date** |
| Order, grant and paid-file entitlement evidence | Keep only fields needed to verify original purchaser and original product/file license for unresolved claims (order identifier, original email, product/download identifiers, relevant grant quota and expiry); no automatic new grant | Controller approves a documented claim/contractual basis and a review/expiry process; disputes and legal holds override automatic deletion |
| Registered accounts and site login artefacts | Do **not** transfer passwords, password hashes, sessions, auth cookies, reset tokens or unnecessary profile data to Astro | Delete/disable during authorized retirement **after** necessary lawful archives and reversibility are proven |
| Contact, shipping, marketing and analytics metadata | Separate marketing consent, technical traffic, unneeded addresses/phone/IP/cookies from accounting documents; do not preserve the whole live database as a routine service store | Record lawful purpose, owner, stop event and retention/deletion date **per category**; no open-ended storage |
| Customer support requests and release decisions | Minimal access-controlled log: ticket identifier, evidence flags, operator, approved reason, delivered content identifier, link expiry and revocation; no password/card data | Controller sets proportionate period related to complaints and legal evidence; anonymize/delete on the approved schedule |
| Security access logs and backup audit receipts | Keep minimized incident evidence; avoid permanent raw logs containing buyer PII | Security retention schedule and incident/legal-hold exceptions; independently approved |
| Encrypted disaster-recovery copies with historical PII | Restrict key custody; allowlist readers; record each copy and verified deletion; ensure retention restrictions cover **backups** too | Controller signs an archival retention window and verified deletion plan, with restoration isolation until then |
| Approved public editorial pages and 15 audio excerpts | Public static content only; no orders, original paid masters or account material | Editorial/IP policy, separate from retention of buyer records |

## 4. Human-only historical purchase service procedure

1. The public Astro former-store notice directs requests to the approved support mailbox; never provide a customer self-service query for archival order data until a separate authenticated portal passes security review.
2. Privileged operator uses the isolated, offline WooCommerce index, never a public website query. Verify order status, original billing email + order key, original grant, download quota/expiry, refund/dispute status, payment and distribution rights. Confirmation of an email address **alone** is not sufficient.
3. Require confirmation that the requester controls the original purchase contact method through an approved communication channel. Handle mismatch, refund, expired grant or missing paid-master hash with manual refusal/hold/escalation.
4. If authorized, retrieve a SHA-256-matched original recording from encrypted restricted media and deliver only via a **short-lived, individually scoped, revocable** transfer mechanism. Never publish direct original WooCommerce files or URLs in Astro.
5. Record an auditable decision without copying credentials, full SQL, keys or media into chat, GitHub, public analytics or email attachments.
6. Provide a consistent privacy subject-request process (access, erasure and correction) that distinguishes erasable records from those that must be retained for a documented statutory or legal-claims basis.

**Technical evidence:** `scripts/historical_entitlement_offline.py` synthetic test suite passed **11/11** under Ubuntu/POSIX, including private SQL file-permission checks. This does not itself establish real buyer identity or grant new rights.

## 5. Approvals required

- [ ] Identify legal data controller, organization and authorized historical-claims operator.
- [ ] Accountant/legal review each statutory accounting/VAT record class, tax years and final destruction eligibility dates.
- [ ] Approve archived purchase rights policy, including expiry, depleted quota, incomplete orders, refunds and disputes.
- [ ] Approve secure customer transfer method, rights verification, response process and incident logging.
- [ ] Approve GDPR customer notice, subject-request channel and exact data-category retention schedule.
- [ ] Establish independent backup/key escrow and evidence of restore and rollback.
- [ ] Owner signs the final record-class deletion plan, authorizes only then future deletions, and separately authorizes WordPress cutover.

**Current canonical gates must remain FALSE:** `oldCustomersFulfillmentDecisionApproved`, `privacyRetentionAndDeletionPolicyApproved`, `finalWrittenOwnerApproval`. No production data migration, deletion or customer disclosure authorized by this draft.
