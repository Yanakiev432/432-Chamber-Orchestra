# 432 Chamber Orchestra — Historical WooCommerce buyer-service implementation (12 November 2026)

**Status: private core + complete paid-media vault COMPLETE. Public delivery DEPLOYMENT BLOCKED pending approved buyer policy.**

## What was actually built

1. **Private copy of all paid masters:** Everest now has a separate non-webroot vault with **26 of 26** original WooCommerce media files (**2,180,093,616 bytes**). Each copy was SHA-256 matched against the live original; originals remained unchanged. The folder is mode **0700** and private media files **0600**, with opaque generated names.
2. **Private file mapping:** A protected internal map connects original WordPress media paths with the private copied files. The mapping is SHA-256 pinned; **no media paths or names were exported into this repo**.
3. **Product/file grant catalog:** A private, SHA-256-pinned catalog matches **80 downloadable file references**, **46 products** and **26 historical download IDs** to the private vault. The catalog is an *operator aid*, not a purchaser permission table. It contains no buyer PII.
4. **Private one-use handoff engine:** `scripts/historical_buyer_private_delivery.py` can issue one-use, 256-bit token-based downloads after an independently prepared, private owner policy and a *specific manually approved purchase*. It checks that the selected product ID + WooCommerce download ID correspond exactly to the selected SHA-256-pinned private media file, and refuses unapproved/expired/revoked/mismatched requests. The token has a maximum **60-minute** lifetime; used/revoked token secrets are deleted. The state ledger stores a SHA-256 of tokens, not raw tokens.
5. **Isolated reference delivery:** The example Python HTTP server binds exclusively to `127.0.0.1`, with disabled access logging of bearer token URLs, `no-store` and one-time claim. It is **not running**, not publicly deployed, and is **not an internet-ready production web server**.
6. **New synthetic tests:** **15/15 PASS** under WSL Ubuntu 24.04, including wrong-product/file rejection, absent owner policy, missing catalog, expired/quota-exhausted denial, file tampering, symlink avoidance, revocation, one-time reuse and complete loopback transfer using fictional media. No customer information or real audio was loaded into tests.

## Actual security boundaries

- All original files in the live webroot are still behind the new targeted Apache denial and must stay protected; the private vault is separate.
- The private vault is **on the same shared host as WordPress**, so it is not an independent disaster-recovery backup. The independent encrypted off-device copy and separate PFX-password custody gates remain mandatory.
- The source package requires **supported Linux Python 3.10+** for the annotated handoff module. Everest's existing `python3` is **3.6** and must **not** be used for an internet-facing service. Runtime selection, TLS ingress, access-logging restrictions, throttling/abuse control, and deployment security are unresolved.
- JSON flags saying “ownerApproved” are **operator attestations**, not cryptographic proof of actual owner identity. They must only be issued by the authorized operator under an adopted policy. Until approved, **no real grants may be issued**.
- The historic offline purchase verifier `scripts/historical_entitlement_offline.py` remains independent. Its real buyer/order result must be reviewed by the operator before a specific file authorization is created. A buyer email match alone is insufficient; the private file catalog never creates an entitlement.
- Any real licensed audio handoff requires original mailbox-control proof, completed and non-refunded purchase, valid original file grant including quota/expiry and confirmation of redistribution rights. Expired/quota-exhausted grants and disputes remain on **manual hold**.
- No original file content, source path, private catalog, order key, customer email, PFX key or raw bearer token is placed in GitHub, the public site or this document.

## Concrete next actions

1. **Owner and accountant:** approve buyer service rules and retention, identify the historic data controller and authorized operator. Until this is done the state remains `CUSTOMER-P1=WAIT_OWNER_ACCOUNTANT_POLICY_AND_MANUAL_OPERATOR`.
2. **Implementation:** select a supported, private service runtime; provide secure, restricted access to the 26-file vault. Verify access without placing plaintext media in any static `Astro/dist` folder.
3. **Operator:** connect an authorized historic order lookup to the exact product/download pair and approve a test request; then verify one actual, controlled customer entitlement end-to-end, with a revocable, expiring handoff. No automatic entitlement expansion.
4. **Cutover:** retain a private operator route for old purchases, not a new public WooCommerce payment engine. Proceed only after independent key escrow, secondary backup, approved URL routing and full rollback.

**No production WordPress code, database, orders or original media were modified during this phase.** The private copy was created on Everest outside the public webroot. All 12 production retirement gates remain fail-closed.
