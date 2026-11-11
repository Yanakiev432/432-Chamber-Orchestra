# Historical WooCommerce buyer service — controlled draft (11 November 2026)

**DRAFT / NOT APPROVED — no live customer operation or entitlement expansion authorized.**

## Purpose and known data

After the public WordPress/WooCommerce checkout is retired, the 46 static historical product pages and nine static former-store notices cannot authenticate purchasers or issue purchased downloads. Preserve private old order data and protected audio separately. The historical snapshot has 188 download permission rows across 12 associated orders, 19 products with permissions, and 26 distinct download identifiers. An offline metadata review identified 124 rows covering eight orders potentially suitable for operator assessment. This does **not** mean the other permissions can be deleted or that the 124 must automatically be serviced; some permissions expired or exhausted their available download count.

The archive contains customer personal information. Never export it into GitHub, Astro build output, public dashboards, ChatGPT, analytics or this policy document. The full 26 source media files and any direct downloadable URLs must remain in restricted storage.

## Proposed request and verification

1. Direct former purchasers to `info@432hz-foundation.com` from the static help notices. Collect only the information necessary to find the order and contact the claimant. Do not solicit passwords, card details, government ID scans or archive encryption keys.
2. Authorized operator looks up the original purchase in the offline, access-controlled WooCommerce archive. Confirm order completion/payment state, original billing email and order key, product and original file grant, time/quota limits, and any limitations in the original sale or content license. A matching email alone is not sufficient proof of purchase.
3. If any field conflicts, entitlement has expired/exhausted its originally defined limits, the purchase is incomplete, or distribution rights are uncertain, hold the request for a documented human decision. Do not grant new unlimited rights merely because the original platform was removed.
4. Where the owner authorizes reissue, verify the original master media hash against the private 26-file manifest. Deliver through a protected, expiring, individually scoped download link, using an access-controlled service. Do not publish permanent links or include the original paid files in Astro.
5. Keep only minimal records of the request, evidence checked, decision, issued file and expiration. Define retention periods, access controls, revocation, subject-access and deletion handling after applicable legal/privacy review.

## Required owner decisions before a real cutover

- Identify who will operate buyer support and who can access encrypted archives.
- Approve the scope of reissue: expired or exhausted grants, incomplete orders, partial refunds, and disputed purchase rights.
- Approve the secure transfer mechanism, audit-log retention and deletion schedule, service response policy and privacy wording.
- Confirm the owner can independently recover the PFX password outside Lenovo.
- Establish end-to-end testing without sharing real buyer data in development logs.

**Current canonical gate:** `oldCustomersFulfillmentDecisionApproved=false`. This draft does not change that state.
