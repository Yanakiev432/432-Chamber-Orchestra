# Bandcamp purchase visibility — implementation checkpoint (2026-11-04)

Scope: Astro 432 Chamber Orchestra staging site, branch `agent/bandcamp-seo-conversion-20261104`.

## Delivered in this branch
- Point the Listening Circle hero button to the actual `#listening-circle-form-support_bg` / `#listening-circle-form-support_en` signup form, instead of the generic `#support` heading.
- Make the primary hero action lead to the official Bandcamp catalogue.
- Add a short recording purchase section directly below the hero with two verified album links.
- Add BG/EN navigation to `#recordings`; clarify purchase wording on Bandcamp cards.
- List the 2017 `432 Hz Quartet Music` album, previously missing from the curated audio archive.
- Update the home-page BG/EN SEO title/description and identify the entity as `MusicGroup` with official profile references.
- Keep current colours, logos, and typography. Visual harmonisation with the Foundation is a separate later phase.

## Release and safety gates
1. `pnpm run typecheck` and `pnpm run build`.
2. Confirm all catalog and release URLs open and the destination permits purchase.
3. Run desktop/mobile QA (menu, keyboard, anchors, external link).
4. Check published site root and trailing-slash settings; canonical and sitemap depend on `PUBLIC_SITE_URL`.
5. Before replacing existing WordPress, preserve a complete backup of files, database, uploads, checkout and product URLs, and map redirects for indexed routes.
6. Do not deploy this branch or replace the legacy WordPress store without explicit approval.
7. After deployment, instrument clicks and verify Search Console, Bandcamp attribution, and completed sales.

## Known limitations
- The public WordPress site is not changed by this code branch.
- There is no Bandcamp API write access in this workflow; the profile biography, errors, and prices must be amended in the Bandcamp admin.
- No claim is made that a Bandcamp click equals a purchase.
