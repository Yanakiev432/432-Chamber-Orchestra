# 432 Chamber Orchestra — BACKUP-P2, complete 26-item Google Drive recovery transport

**As of 15 November 2026, 16:30 Europe/Sofia — source and transport prepared; owner OAuth required; NO recovery archive uploaded to the second provider.**

## Correct complete scope

- **23** SHA-256-pinned portable recovery items from the private 12 November manifest, total **5,650,548,844 bytes**.
- **2** newer CMS-encrypted archive files dated 13 November (SQL and changed WordPress content), **3,643,938 bytes** combined.
- **1** associated private non-secret checkpoint receipt, **1,208 bytes**.
- **26** distinct source filenames total, **5,654,193,990 bytes**. All exist as regular private files in the Lenovo QA folder and have matched expected sizes. The complete 23-item source manifest SHA-256 is `5076f391adce0803be5944d078bad9fbd9789b6a0bc43ed1e3779a0dc51f97d9`.

The earlier 20-item plan **must not be used** as the completion criterion. The private canonical 26-file union manifest is `432-GDRIVE-SECOND-INDEPENDENT-26FILE-UNION-MANIFEST-20261115.json` (SHA-256 `79fd8ea9908ad3ca281e06bd379caba2b5c7b2c9af37fb4c6524a0eda5d60de5`). This file contains original archive filenames and source paths; it remains private on Lenovo, **not in GitHub**.

## Runnable transport (Lenovo only)

Portable `rclone v1.76.0` is present and pinned by SHA-256. The private 26-item uploader `TRANSFER-432-ENCRYPTED-26-TO-GDRIVE-20261115.py` has SHA-256 `356e471a508d28408e4c8731246969f07bb5e8232d85ef0c1ac6e45f0c9b485f`. Its read-only local preflight completed successfully on 15 November: correct 26-item manifest, correct rclone binary, expected byte total, at least 6.2 GB available on Lenovo, no second local 5.65 GB copy needed.

Transfer destination is the private Google Drive folder [432-Orchestra-Encrypted-Disaster-Recovery-20261114](https://drive.google.com/drive/folders/1gMGcKervBB0fDcwdFTjJIOM5Y6Yki6Km). Google Drive currently lists only the 60-byte harmless canary; **none of the 26 genuine recovery files has been uploaded**.

The owner-only one-time authorization launcher is `CONNECT-432-GDRIVE-OWNER-OAUTH-26-20261115.cmd` (SHA-256 `e3372835616141993674d49b1e5505b6ece9142920abf8443380cc62da0eb73b`), located under the private Lenovo QA directory `Documents\432-Orchestra-Security-QA\WordPress-Recovery-Rekey-20261110`. It invokes official rclone OAuth in a local interactive terminal; it cannot obtain authentication from the connected ChatGPT Google Drive app. The user must consent in the Google browser sign-in. OAuth credentials, client secrets and PFX password must never be entered into ChatGPT or stored in GitHub.

After owner OAuth, use the private uploader `--mode upload` to copy the **exact 26 named files**, without deleting or overwriting existing remote files. The separate `--mode verify` must **independently download and byte-compare all 26 cloud objects**, check local pinned SHA-256, and write a private receipt before any backup gate can be marked complete. Real transfer and cloud readback are **still pending**. A full restore test and PFX password escrow on a device other than Lenovo remain separate requirements.

## Cutover constraints

No external USB/SD disk was detected at 16:32 Europe/Sofia. RA Core is online and can execute Python on Lenovo, but the independent OAuth config file is absent. RA Core's existing-browser path to Google Drive is unavailable under the Windows Chromium account-lockout protection; do not bypass that protection.

No WooCommerce orders were stopped, no final post-freeze backup was captured, and no live WordPress, Apache, DNS, customer grants, or protected neighboring site changed. **The 12 canonical cutover blockers remain unresolved.**
