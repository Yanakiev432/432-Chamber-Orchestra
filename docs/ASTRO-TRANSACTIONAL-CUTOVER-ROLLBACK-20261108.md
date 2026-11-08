# Astro/WordPress transactional cutover and rollback rehearsal — 8 November 2026

**Outcome: simulated rollback PASS; actual production cutover still BLOCKED.**

An isolated fixture was built at Everest **outside any web document root**, using all 618 hash-pinned production Astro assets, copied only as hardlinks from the private staged release. The simulated WordPress core consisted exclusively of harmless dummy files in `wp-admin`, `wp-content`, `wp-includes`, a dummy `index.php`, and the previous real (public) `.htaccess`, `robots.txt`, and `sitemap.xml`. Additional protected-site marker files represented the two nested sites, plus `old`, `wordpress`, `cgi-bin`, and `.well-known`.

## Rehearsed sequence

1. Confirm pre-cutover immutable Astro package: **618 files**, **616 new paths** and **two existing paths**, `robots.txt` and `sitemap.xml`. Confirm the live original WordPress root `.htaccess` and `index.php` SHA-256 hashes before any action.
2. Stage 616 static files while the *mock* WordPress core remains present.
3. Park mock `wp-admin`, `wp-content`, `wp-includes`, root `index.php` and old `.htaccess` onto the same filesystem into a private rollback parking directory.
4. Park the previous two overlapping text files, link the corresponding new Astro files, and install the tested Apache V4 static configuration. Check the Astro localized pages, exact 618-source inode matches, and unchanged nested-site sentinels.
5. Roll back: remove only the 618 known original static inode links, restore both overwritten text files, restore the parked WordPress directories, `index.php` and original `.htaccess`.
6. Verify every one of the 13 original mock files has the same SHA-256 and the parking directory is empty; verify all 618 Astro source inode identities are unchanged and the actual production WordPress root files still have their original hashes.

**PASS:** 618 files staged and removed, 616 new names and two collision paths handled, 13 baseline mock files recovered byte-for-byte, six protected mock subdirectories unchanged, and production untouched. Private evidence SHA-256: `23a43060882f151380d1a816bbc15d33be22fe609907d06bfcbe86031daf267f`. Temporary simulation files were removed.

## What this does not establish

It does **not** show that moving the 30,000+ real WordPress files, an active SQL database, plugins, media, PHP handlers, or the genuine cPanel Apache configuration can be successfully rolled back. It does **not** authorize or perform a production cutover, nor certify historical purchase fulfilment. Live-site maintenance window, in-flight checkout closure, new purchases after the last SQL archive, off-host encrypted recovery, final HTTPS/cache/redirect/cookie testing, and direct Apache production acceptance remain separate requirements.

A guarded final workflow should **only** be designed for execution after explicit owner approval, refreshed off-host backups and a buyer rights policy. Never move or overwrite the two separately hosted nested applications.

## Independent static-bundle parity after additional source changes

A full clean 8 November main-domain Astro build from Git commit `b0faaa26b95be819eaa82dac707126aa4625721d` passed the entire canonical chain including the new fail-closed active-link scanner. It reported **zero** active references to the retired orchestra WordPress origin (two references to public external PDFs hosted at `artstudies.bg` are unrelated to the orchestra WordPress). All **618 allowlisted** output assets were hashed independently on Lenovo; the sorted UTF-8 `path<TAB>sha256<LF>` manifest SHA-256 **exactly matched** the original 618-file private Everton staged release: `d5f5137b22fa67870eab5ffabc5aa5c0819696286535bd0a86c2c30980b0c965`. There is no need to re-upload a new release package for these validation-only changes. Combined private evidence receipt SHA-256: `55af03805fd6e52ac0ddb21b82dbc70db68fd87fe52d6a86347307592699fd78`.
