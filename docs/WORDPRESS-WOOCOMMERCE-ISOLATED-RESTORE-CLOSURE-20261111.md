# WordPress / WooCommerce — verified isolated recovery closure (11 November 2026)

**Result: FULL FILES + DATABASE + PHP CLI BOOTSTRAP PASS. Production migration remains BLOCKED.**

This is a dated update to the canonical retirement plan. The 7–9 November checkpoints remain historical snapshots of what was verified at that time; those earlier statements must not be interpreted as today's recovery status.

## Verified actual recovery

- Eleven encrypted CMS archival file volumes from the 4 November backup were SHA-256 checked and streamed directly to a protected gocryptfs filesystem in WSL2 Ubuntu 24.04 on Lenovo. No plaintext WordPress tar archive, private media, or customer-containing SQL was written onto the Windows C: filesystem.
- The isolated file restore recovered **30,642 files**, **3,883 directories** and **6,576,778,451 bytes** of original member data.
- A separately encrypted 11 November increment was applied to the recovered WordPress tree: **71 files**.
- The new 11 November SQL snapshot was imported into an isolated MariaDB 10.11: **116 tables**, **188 historical WooCommerce download-permission rows**, **12 orders with these permissions**.
- Both **WordPress 5.9.20 core** and **WooCommerce 7.0.2** passed **PHP CLI bootstrap tests** after the original WordPress Multisite network host was translated to `127.0.0.1` in the **disposable cloned database only**. The production database and original host mappings were not modified.
- Linux process networking was isolated; MariaDB TCP networking disabled; the temporary gocryptfs recovery key was ephemeral. The database and encrypted scratch were unmounted and removed after completion.
- The Microsoft OneDrive Files On-Demand client was also tested by dehydrating and rehydrating the 20-file primary V2 recovery set and comparing SHA-256; this is **not** the same as a second account/cloud-provider download.

**Private, sanitized recovery evidence SHA-256:** `7fe1d297370a0de724851aac1098716a17f6d337646e32736a187c9998a9efa1` (source file `432-WOO-ISOLATED-WSL-PHP-LOOPBACK-20261111.json` on Lenovo).
**Cloud rehydration evidence SHA-256:** `79140ea5fea982b8f4b30553a8358b0356aadb2f123f953665c8b5aeb3dbfd29`.
**Machine-readable summary:** `docs/wordpress-woocommerce-runtime-restore-20261111.json`.

## Scope and outstanding proof

This **does not** establish a full authenticated browser/HTTP rehearsal of WooCommerce, historical buyer login, paid-download access or refund/customer-support operations. It does not prove that real production files can be moved and rolled back safely on the shared hosting, or that the final state after the last transaction has been archived.

The **12 remaining fail-closed migration checks** as of this update are: final media capture, buyer fulfillment policy, privacy retention/deletion policy, review of all legacy URLs, protected-file denylist, production TLS/static acceptance, real rollback rehearsal, written owner authorization, nested-site isolation acceptance, independent custody of the portable PFX password, second backup in an independent failure domain, and post-order-cutoff final snapshot.

**The publicly served main domain remains WordPress/WooCommerce.** Neither its files/database nor those of `432hz-foundation.com` and `432project.432hz-orchestra.com` were modified during these tests. No payment, deletion, DNS change, .htaccess replacement, or production cutover was performed.

Do not infer a cutover go-ahead from the successful restore. The canonical `retirement:report` must pass while `retirement:cutover:gate` remains blocked until the remaining conditions have actual receipts and written sign-off.
