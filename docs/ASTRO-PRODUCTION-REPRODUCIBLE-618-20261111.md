# 432 — reproducible Astro production release and safe packaging (11 November 2026)

**Outcome: full local production build PASS, 618/618 independently pinned public asset bytes PASS, private ZIP creation and re-read PASS. Production cutover remains BLOCKED.**

## Root-cause audit

The Astro build writes **623** files into local `dist/`. Five are deliberately **excluded from public deployments**:

1. `.htaccess` — generic fallback rules, **not** the hosting-specific protected Apache V4 candidate.
2. `brand/source/README.txt` — source branding documentation.
3. `brand/foundation/source/432_hertz_foundation_brand_assets_v2/README.md`.
4. `brand/foundation/source/432_hertz_foundation_brand_assets_v2/docs/naming_rules.md`.
5. `brand/foundation/source/432_hertz_foundation_brand_assets_v2/web/FoundationLogo.astro`.

These files were already excluded from the independently audited **618-file** Everest package dated 7 November. No historic public leak through that private package has been established. **Never upload raw `dist/`**. Do not install the generic `dist/.htaccess` as a main-domain replacement. Only the separate owner-reviewed, private, host-specific V4 Apache configuration is a candidate, and only after explicit cutover authorization.

## Fixed gate

`scripts/validate-production-release-candidate.mjs` previously asserted (incorrectly, after 11 November's full recovery) that the isolated full WordPress restore was incomplete. It now checks:

- The full WordPress/WooCommerce encrypted recovery receipt shows a successful isolated filesystem, MariaDB and PHP boot and completed scratch cleanup.
- `dist/` has exactly 623 files; exactly five named files are withheld.
- All **618 allowed assets** are hashed by a **bounded 1 MiB reader** and sorted into the canonical `path<TAB>sha256<LF>` manifest. Its digest must equal **`d5f5137b22fa67870eab5ffabc5aa5c0819696286535bd0a86c2c30980b0c965`**, independently verified against the Everest private staging ZIP.
- 394 HTML pages; 384 indexable sitemap entries; nine historical-commerce notices marked noindex.
- 15 precisely approved audio files (11 public demo excerpts and four verified old excerpts), zero unreviewed audio assets, no active references to old WordPress media on the main domain.
- All ordinary retirement release conditions, including explicit written owner approval, still remain blocked.

## Actual full build

The standalone local command `node scripts/build-production-candidate.mjs` ran successfully with the intended production origin and preview mode disabled. It exercised all the existing production QA stages, including:

- WordPress public-route parity: 146 historical routes and 46 product routes;
- Static website link scan: **16,993 href/src references**, **zero failures**;
- Sitemap and canonical SEO: **384 sitemap URLs**;
- Production asset allowlist: **623 generated → 618 allowed → five withheld**, with exactly pinned full content hashes.

**Terminal gate:** `ASTRO_PRODUCTION_CANDIDATE_ALL_GATES_PASS`.

## New fail-closed packaging utility

The new `scripts/package-approved-astro-release-20261111.py` checks the **exact** pinned manifest, rejects any new source/config file or unrecognized extension, forbids symlinks and name collisions, and creates a ZIP outside the repository and all public document roots. It verifies **every included ZIP entry** by independently rereading and hashing it, then saves a sanitized JSON receipt.

- Default (dry run): `python scripts/package-approved-astro-release-20261111.py`.
- Actual private archive creation: `python scripts/package-approved-astro-release-20261111.py --execute --private-output <EXISTING_PRIVATE_432_QA_DIRECTORY>`.
- **Refuses overwrite**, including the tested second invocation which returned exit code 3 and left the first archive intact.
- Valid private output: `432-astro-main-domain-approved-618-20261111.zip`.
- ZIP size: **129,500,993 bytes**.
- ZIP SHA-256: `0d61a113da31cc2a8dcf1a891d6f9f20224e7ab49bda31f72bd8e1e5ec156274`.
- Extracted asset manifest SHA-256: **`d5f5137b22fa67870eab5ffabc5aa5c0819696286535bd0a86c2c30980b0c965`**.
- This ZIP's whole-file SHA is distinct from the old staged ZIP because of archive-compression/metadata differences; the **member names and contents are identical**.

## Release limitations

**This is not a license to perform a production cutover.** The static package and local Apache fixture do not prove the actual SuperHosting virtualhost rewrite behavior or paid-media isolation after modifying the shared-host configuration. WordPress checkout, historical buyer support, independent PFX password escrow, a second independent durable backup and the final freeze-time snapshot remain unresolved.

No production domain, WordPress/WooCommerce database, DNS, .htaccess, nested Foundation or Project application, buyer record or source-media permission was modified by the production-candidate build and packaging tests.
