# Deployment

This website is a static Astro site. The production build creates files in `dist/` that can be uploaded to shared hosting, including Apache hosting with `public_html/`.

## Requirements

- Node.js
- pnpm

## Install

```bash
pnpm install
```

## Local Development

```bash
pnpm run dev
```

## Typecheck

```bash
pnpm run typecheck
```

## Build

```bash
pnpm run build
```

## Output Folder

```txt
dist/
```

## Upload To Shared Hosting

Upload the contents of `dist/` to `public_html/`.

Do not upload:

- `src/`
- `node_modules/`
- `.git/`
- config files unless explicitly needed by the host

## Backup First

Before replacing an existing website:

- download all files from the existing hosting;
- export the WordPress/MySQL database if present;
- save `wp-content/uploads`;
- save `wp-config.php`;
- keep a dated backup folder.

## Replacement

After backup:

- clear or archive the old `public_html` contents;
- upload the contents of `dist/`;
- verify all routes.

## Verify Routes

- `/`
- `/bg/`
- `/en/`
- `/bg/first-sound/`
- `/en/first-sound/`

## Forms

Forms require `PUBLIC_FORMS_ENDPOINT` to be configured at build time. Until that is configured, the forms remain visible but do not pretend to submit.

## Future Integrations

The `.env.example` file reserves placeholders for:

- Mailchimp
- Donorbox
- Stripe Payment Link
- PayPal

Do not add fake values. Use only verified official integration URLs.

## Bank Transfer

Bank transfer data is already displayed as static public information in the Support section. It does not require a backend or payment processor.
