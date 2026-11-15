# 432 Chamber Orchestra — BACKUP-P2: reconciliation of recovery sets (15 Nov 2026)

**Status: RECONCILIATION COMPLETE; independent second-provider recovery copy NOT COMPLETE. No WordPress cutover authorization.**

## Why the 20-file Google Drive transfer is not the entire current recovery set

The source documents distinguish **three scopes**. They must not be conflated:

| Scope | Verified source facts | Status |
| --- | --- | --- |
| Core OneDrive recovery set, rekey V2 | **20 files; 5,647,581,099 bytes**, including 13 encrypted archive volumes and 7 recovery/support items | 20/20 source names and sizes and earlier OneDrive provider sync verified; a 60-byte non-sensitive canary was copied to the independent Google Drive folder, but **0/20 real encrypted files** there |
| Portable owner recovery set (12 Nov) | **23 files; 5,650,548,844 bytes**, incorporating the essential later preliminary checkpoint(s) and supporting manifest(s) as documented in `docs/WORDPRESS-INDEPENDENT-BACKUP-OWNER-ACTIONS-20261112.md` | Private 23-item source manifest prepared on Lenovo; actual second-provider physical/cloud upload and full independent readback not verified |
| Additional pre-freeze checkpoint (13 Nov) | Two new CMS ciphertexts: SQL **2,624,977 bytes** and `wp-content` delta **1,018,961 bytes**, total **3,643,938 bytes**, plus a private JSON receipt | Copied from Everest to Lenovo with SHA-256 verified; **not yet independently stored on the second provider** |

The 20-file source is therefore **3 items / 2,967,745 bytes smaller** than the dated 23-file portable set. These numbers follow from the two published receipts; they do not independently identify the three extra private filenames. Do **not** reconstruct these names or their hashes from guesses. Use the exact private `432-OFFDEVICE-23-ENCRYPTED-RECOVERY-ITEMS-20261112.json` manifest as the authority.

The 13 November SQL and media-delta checkpoint is **newer** than the 12 November portable set and must also be transferred and verified. After new transactions, the ultimate owner-authorized post-freeze snapshot will supersede the pre-freeze checkpoint as the cutover boundary; none of these sets is a substitute for that final frozen snapshot.

## Correct BACKUP-P2 completion criteria

1. Obtain one-time owner OAuth for the local `rclone` process through the Lenovo screen; never extract connector/app tokens, PFX passwords or credentials into chat or Git.
2. Copy and independently download-verify the existing 20 core encrypted archive/support files from OneDrive into the private owner-only Google Drive recovery folder. The existing 20-file transfer script verifies SHA-256, uses `--immutable` and does not delete source objects.
3. Identify **the three remaining items** from the *actual private 23-file manifest*, check their original SHA-256 and ensure they are uploaded and independently read back. In case of duplicates, reconcile by exact basename + SHA-256, not estimated size.
4. Upload **both 13 Nov ciphertexts** and the associated private capture receipt, and read back the ciphertext content independently. Never upload any plaintext SQL, customer database export, paid original recording or unencrypted key.
5. Produce a union manifest listing each complete recovery file exactly once (name, size, SHA-256, source snapshot date, Google file ID where available, readback status), as **private** evidence outside Git. The safe/public receipt should contain only counts, hashes of the private receipt, evidence timestamps and a strict false/true completion decision.
6. Only after completion and independent restore proof may `secondIndependentBackupCopyVerified` be considered for an update. **`portableBackupKeyEscrowVerified` remains a separate FALSE gate** until the owner's password is independently stored outside Lenovo and recovery is verified.
7. After an authorized checkout freeze, capture and separately independently archive the new final SQL/files snapshot; the `finalFreshBackupAfterOrdersStopped` gate remains FALSE until then.

## What is actually blocked as of 15 Nov

On 15 Nov the Lenovo RA Core requests are queued but **unclaimed**; Remote Desktop Commander independently reports Yanakiev-Lenovo **Offline**. Consequently a new OAuth connection cannot be observed or completed via these remote tools and no full Google Drive transfer has been started. The connected Google Drive folder was checked and contains only the 60-byte canary. This is a runtime/connectivity blocker, not a completed recovery operation.

No server files were deleted or modified, no checkout/orders were stopped, and no live WordPress-to-Astro migration was authorized.

## Source evidence

- `docs/WORDPRESS-INDEPENDENT-BACKUP-OWNER-ACTIONS-20261112.md` — 23-item portable set, original and supplementary archives, owner key escrow.
- `docs/WORDPRESS-SECOND-INDEPENDENT-GDRIVE-TRANSPORT-20261114.md` — only 20 source files and Google Drive canary.
- `docs/WORDPRESS-PREFREEZE-CMS-CHECKPOINT-20261113.md` — two later cipher blobs and off-Everest readback.
- `docs/wordpress-cutover-action-plan-20261112.json` — all canonical cutover gates still pending.

**No secret, ciphertext, private path inventory or customer PII belongs in this repository note.**
