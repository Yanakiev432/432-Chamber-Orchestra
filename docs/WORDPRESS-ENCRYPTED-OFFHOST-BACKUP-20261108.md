# WordPress/WooCommerce — encrypted off-host backup checkpoint (8 November 2026)

**Checkpoint: ONE ENCRYPTED OFF-HOST FILE COPY COMPLETED. Production retirement NOT approved.**

The original WordPress/WooCommerce site at `432hz-orchestra.com` remains live and unchanged. An 11-part full file archive from **4 November 2026**, the later **7 November SQL snapshot**, and a **7 November incremental/configuration archive** have been encrypted at the Everest source and transferred to Lenovo. No protected media or uncompressed SQL was written to Lenovo's unencrypted C: volume.

## Verified evidence

| Check | Actual result |
|---|---|
| Original file archive | 11 parts, 5,645,511,107 compressed bytes |
| Encrypted file archive now on Lenovo | **11/11 parts**, 5,651,030,680 bytes |
| Encrypted transport integrity | SHA-256 of **all 11** complete ciphertext volumes matches each Everest source manifest |
| Ciphertext packaging | CMS EnvelopedData, AES-256-CBC to RSA-3072 public certificate |
| Original multi-part `tar.gz` streaming read | **PASS** on Everest, all 11 original parts joined logically without extraction |
| Archive entries | **34,525** (30,642 regular files, 3,883 directories) |
| Plain-file bytes declared by archive headers | 6,576,778,451 |
| Unsafe `../` or absolute tar member paths | **0** |
| Required data classes | WordPress core, `wp-config.php`, plugins, themes, uploads and `woocommerce_uploads` all observed in the source archive |
| SQL CMS archive | Transferred encrypted; independently decrypted in memory and original source SHA-256 matched |
| Incremental/config CMS archive | Transferred encrypted; independently decrypted in memory and original source SHA-256 matched |
| Source archive raw media full extraction | **NOT performed** |
| Full encrypted media volume decryption on Lenovo | **PASS** — all 11 source volumes restored in bounded memory with the Windows certificate; each original SHA-256 matched |
| Independent portable PFX recovery-secret custody | **NOT completed** |
| Redundant second copy in another physical or cloud failure domain | **NOT completed** |
| Final backup after WooCommerce order intake ends | **NOT completed** |

The original tar stream was read in a guarded read-only session and no customer data, original paid-file URL or sensitive media filename was printed. An earlier three-file source-server restore drill and MariaDB 116-table isolated restore had passed separately; neither proves restoration from **all** locally encrypted file volumes.

Evidence: private Everest source receipt SHA-256
`ba07dd13146e8cd95bc022a4fa269e9ad7a8b9859f31c93f5080910429143fd1`;
Lenovo ciphertext and SQL/PFX audit receipt SHA-256
`df6368d41b118380405f275abf0f12a186f1b03c9d2ff1fb417944c0a9a19809`.
Only these nonsensitive receipt **hashes** are committed to Git. The receipts, CMS ciphertext, encrypted PFX and DPAPI secret are not tracked.

## Owner-held recovery materials

Local protected backup directory:
`C:\Users\User\Documents\432-Orchestra-Security-QA\WordPress-Backup-20261108`.

The owner has an **encrypted PFX** containing the archive recipient key. The password is currently stored in a Windows DPAPI-protected file bound to the Lenovo Windows user profile. The certificate in the Windows CurrentUser store is also local. **Neither the DPAPI file nor the certificate store is a portable recovery password backup.**

Required before retiring WordPress:

1. Copy the encrypted PFX and **a separate user-held recovery password** into independently protected media or an appropriate password manager; never paste passwords or private keys into GitHub, ChatGPT, diagnostics or backup manifests.
2. Make and verify a **second encrypted off-host archive** in an independent storage/failure domain. One copy on a single laptop is not adequate protection against theft, physical failure, ransomware or account loss.
3. **The local-ciphertext-to-archive streaming recovery drill PASSED for all 11 volumes**, including exact source SHA-256, gzip traversal and TAR member checks. What remains is a controlled extraction and complete WordPress/PHP + SQL runtime restore in an isolated encrypted environment. Do not extract paid media or SQL onto unencrypted C:.
4. Stop new WooCommerce checkout/order intake only in an owner-approved cutover window; make a **fresh final SQL, media-delta and order/permission export** after the final transaction, encrypt off source, then test recovery again.
5. Independently confirm historical purchaser fulfilment and data retention requirements before disabling `wp-admin`, WooCommerce or the old secure download system.

## Critical interpretation

The truthful status is **off-host encrypted copy: PASS**. It is **not** equivalent to “disaster recovery fully certified,” “all ciphertext can be decrypted and restored,” or “approved to delete WordPress.” All unresolved conditions remain required by the fail-closed retirement gate. The host's production `.htaccess`, databases, nested sites and WordPress core remain untouched.

## 9 November — full local encrypted archive reconstruction independently verified

The earlier `ASN1 value too large` failure was a limitation of Windows `EnvelopedCms.Decode`, **not the CMS backup**. A private, source-SHA-pinned C# streaming CMS decryptor using the installed Windows certificate recovered all eleven encrypted file volumes on Lenovo. A bounded in-memory producer/consumer channel then concatenated all 11 original compressed byte streams directly into `GZipStream` and a strict TAR header parser, checking the gzip footer, TAR checksums and path safety without extracting a file. Result: **PASS** — 11 volumes, **5,645,511,107** compressed source bytes, **38,754** TAR headers (including **4,229** metadata headers), **30,642** files, **3,883** directories, **6,576,778,451** declared plain-file bytes, **zero** unsafe paths. Exact parity with the independent source-side archive inspection.

The private Lenovo receipt is not in GitHub. Receipt SHA-256: `4fd227f9e0c5c57831efd4f0a86627e40ad4cb0155300de39a26c75237b740bd`. The original CMS verifier source SHA-256 is `40a4e4c86ef9f3b906570b55b496490f204ffb00f2dc62a8479239e9cca07b94`, and the private TAR scanner source SHA-256 is `684ac6cc94dc2e4bdc1e3e31eaebb6a4cdc5378cd1279b550ec60fe36ee0ace4`. Both files are in the private Lenovo security QA folder, not on the website or in a public repository.

**Still open:** independently stored PFX password and key, verified redundant cloud/offsite copy, actual isolated application filesystem/SQL restore and fresh final export after order intake closes. The current iCloud Drive sync process exists on Lenovo, but available cloud quota and server-side upload completion are **unverified**; do not mark it as a second backup.
