# 432 — Independent backup, offline PFX password escrow, and owner recovery actions
**Prepared 12 November 2026. NOT COMPLETE. NO CUTOVER AUTHORIZED.**

## Verified starting point

- 13 RSA-CMS encrypted full archive items, 11 of them WordPress TAR.GZ volumes from 4 November 2026.
- RSA-3072 password-protected PFX file on Lenovo and verified byte-for-byte in OneDrive; local certificate remains in Windows certificate store.
- Two additional encrypted preliminary 11 November 2026 snapshots (SQL and WordPress `wp-content` delta); **neither is the final post-checkout-freeze archival snapshot**.
- Existing cloud OneDrive set includes 20 recovery files; the 11 November supplementary set is separate. A **23-item portable recovery set** is now prepared including the minimum essential supplement and manifests, totalling **5,650,548,844 bytes** (about 5.26 GiB). Files are already present in the private Lenovo QA directory.
- iCloud Drive on Lenovo is running but **not confirmed synchronized**. Two canary files checked 12 November were both provider-flagged as unsynced. Avoid copying the entire set into iCloud until it passes a separate-device readback.
- A full actual isolated restore from the encrypted archives (30,642 files, 116 SQL tables, WordPress/WooCommerce PHP CLI) already passed on 11 November; the escrow/second-provider requirements remain independent.

## One-time owner action A: independently protect the PFX password

**Do this directly on the physical Lenovo in a trusted local interactive Windows session, not through ChatGPT, RA Core, screen sharing, a transcript, clipboard synchronization, email or a GitHub issue.**

The private, locally stored helper is:

`C:\Users\User\Documents\432-Orchestra-Security-QA\WordPress-Recovery-Rekey-20261110\OWNER-432-PFX-OFF-DEVICE-ESCROW-20261112.ps1`

From a local Windows PowerShell desktop (the owner-only helper uses Windows PowerShell 5.1 GUI because this Lenovo does not expose the project's canonical `pwsh` 7.6 runtime), choose its **`-ShowOwnerSecret`** mode. It checks the SHA-256 pinned PFX, unlocks the existing local DPAPI secret and shows the random PFX password **only in a modal desktop window**. Nothing is written to command output, cloud, clipboard automatically, or disk. The owner should preserve the exact 64-character value in an independently controlled **off-Lenovo** secure password manager or another appropriately secured physical medium.

Do not save it in the same OneDrive folder as the encrypted PFX. Do not share the password in this conversation.

Once the independent copy is secured, use the **`-VerifyOwnerCopy`** mode in the local PowerShell terminal. It prompts for the stored value with hidden input, opens the real encrypted PFX, checks its certificate thumbprint, requires a human attestation, and produces a sanitized JSON receipt locally. It does **not** print or save the password. This is *owner self-attestation on Lenovo*, **not** proof of recovery on another computer.

The canonical `portableBackupKeyEscrowVerified` gate remains false until owner confirmation and an independently controlled recovery path have actually been verified.

## One-time owner action B: physical second copy and complete SHA-256 readback

Attach an external USB/SD storage device **independent of Lenovo's internal disk** with at least 7 GiB free space. Prefer an encrypted external SSD held off-site.

The private offline backup manifest is:

`432-OFFDEVICE-23-ENCRYPTED-RECOVERY-ITEMS-20261112.json`

SHA-256:
`5076f391adce0803be5944d078bad9fbd9789b6a0bc43ed1e3779a0dc51f97d9`

The private copy-and-verify script is:

`COPY-VERIFY-432-RECOVERY-TO-INDEPENDENT-USB-20261112.ps1`

After connecting the device, identify its actual letter (e.g., `E:`). Run the script locally with `-DriveLetter E -CopyAndVerify`. It checks the disk physical bus type (USB/SD), refuses C:, network shares, nonexternal devices, insufficient space, file overwrites and unknown file names, verifies the 23 source SHA-256 hashes, copies only encrypted archive/PFX and recovery metadata, then reopens and hashes **all 23 destination files**. It writes a sanitized local receipt only after a full successful check.

The deliberate negative test with `-DriveLetter D -CopyAndVerify` while no D: drive was connected **failed closed**; no copy or success receipt was created. A real external-device readback is **not yet done**. Store the verified external device away from Lenovo, record its custody, and perform a separate recovery drill using the owner-held PFX password before any retirement.

Neither the private script nor the 23-item archive is to be uploaded into the Git repository or published through Astro.

## Policies and release

`docs/WORDPRESS-HISTORICAL-BUYER-DATA-RETENTION-DRAFT-20261112.md` separates statutory accounting/tax evidence from buyer-entitlement records, account/login artifacts, support cases, technical logs and encrypted backups. It is **not approved** and requires accountant/controller review under Accounting Act Article 12, VAT Act Article 121 and GDPR.

The live WordPress/WooCommerce must remain available until the other explicit gates are satisfied: approved legacy URL dispositions, paid-media access tests, nested virtual-host isolation, real production rollback, TLS smoke tests, legal buyer policy, written owner cutover approval, and a **new** final backup after order intake ends.

**Status:** RSA-3072 encrypted PFX copied to OneDrive PASS; primary OneDrive provider readback PASS; 23-item second-device manifest PASS; two owner scripts AST parser PASS; iCloud canaries FAIL; independent PFX escrow PENDING; USB second copy PENDING; live domain cutover NOT APPROVED.
