# Apache-only static cutover — 40-case isolated rehearsal (7 November 2026)

**Release status: NOT APPROVED. No production `.htaccess`, WordPress files, nested sites, databases or DNS settings were modified.**

A private, derived Apache candidate is stored outside the document root on Everest:
`/home/hzorche/ra-core-deploy-staging/432-main-domain-astro-apache-v4-inheritance-tested-20261107.txt`.
SHA-256 `8fbb14f21ec3df1444f8203508181008e81f69f9b382b6b41370d902139142ae`.
This is intentionally not committed to GitHub because it preserves hosting-specific PHP handler and security directives from the current main-domain configuration. The untouched live main-domain `.htaccess` SHA-256 remains
`add4747dda78b4663a4db7deb815243754b0ab7f884c1ca265a439dc216e06cb`.

## Real issue discovered and resolved in the proposal

An initial test with Apache 2.4 and three separate SSL virtual hosts passed 31 of 32 scenarios but failed to prevent access to the nested project site's physical directory through the **main orchestra hostname**. The nested WordPress `.htaccess` replaced its parent's `mod_rewrite` rules. The V4 candidate adds `RewriteOptions InheritDownBefore` to make parent protections run before nested-site rules. This option is part of Apache 2.4 (2.4.8+) and is documented in the official Apache mod_rewrite RewriteOptions reference:
https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html#rewriteoptions

V4 passed **40/40** HTTP/HTTPS scenarios on an isolated local **Apache 2.4.69** image, and the exact tested `.htaccess` SHA-256 matches the private candidate. Cases include:
- Astro root and localized static paths, unknown path returning 404;
- all legacy `wp-admin`, `wp-content`, `wp-json`, `wp-includes` and PHP endpoints returning 403 on the main hostname;
- dummy examples of both formerly public priced-download media and private WooCommerce masters returning 403;
- query-based legacy checkout/download/WP-API requests returning 403;
- main-domain physical paths pointing into the foundation or separate WordPress project returning 403;
- both other sites continuing to serve their own content, PHP, and project uploads through their own hostnames;
- preserved HTTP-to-HTTPS redirects and expected `www` behavior.

**Important:** This is an isolated representative Apache test, not a real production Apache virtualhost acceptance test. The deployed Apache server only advertises `Server: Apache`; its exact version is not visible through this shared-host SSH profile. Under Apache's official guidance, nested `.htaccess` directives can override parent rewrite rules:
https://httpd.apache.org/docs/2.4/howto/htaccess.html

## Reproduce the security regression test

The runner is `scripts/qa-apache-main-domain-cutover.mjs`. It accepts a local copy of the **exact V4 candidate**, verifies its SHA-256 and the available local `php:8.4-apache` Docker image, creates a no-network/no-log ephemeral Apache container with three virtualhosts, executes all 40 status probes, then stops and deletes only its own temporary container.

On Lenovo, set `ORCHESTRA_APACHE_CANDIDATE_FILE` to the downloaded V4 candidate text path, then run `pnpm apache:cutover:qa`. The runner never connects to or modifies Everest.

## Hard blockers still open

1. Owner-approved alternative delivery/retention solution for **188 historical WooCommerce download permissions**; the old public-priced media paths must become inaccessible after cutover without eliminating legitimate customer rights.
2. Durable encrypted off-host archive and independent restoration of the whole WordPress runtime; the DB-only 116-table restore has passed, not a whole-site runtime restore.
3. Exact file-move/rollback manifest and cPanel/Apache virtualhost acceptance on the actual host; the verified Astro candidate has 618 files, of which two destination paths already exist.
4. Final explicit approval of production changes, including the treatment of the two separately hosted nested domains.

**Do not apply the proposed file while WooCommerce is still the production purchase/download system.** The candidate intentionally disables its API, PHP and direct-media routes on the main domain.
