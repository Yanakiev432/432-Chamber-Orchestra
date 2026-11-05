# Deployment Checklist

## Build Commands

```bash
pnpm install
pnpm run typecheck
pnpm run build
```

## Files To Upload

Upload the contents of `dist/` to `public_html/`, including:

- `index.html`
- `bg/`
- `en/`
- `_astro/`
- `favicon.svg`
- `.htaccess`

## Files Not To Upload

Do not upload:

- `src/`
- `node_modules/`
- `.git/`
- `.env`
- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.json`
- `astro.config.mjs`
- `tailwind.config.mjs`
- `postcss.config.mjs`

## Backup Checklist For Old Site

Before replacing the existing site:

- download all current hosting files;
- export any existing WordPress/MySQL database;
- save `wp-content/uploads` if WordPress exists;
- save `wp-config.php` if WordPress exists;
- keep a dated local backup folder;
- do not delete the old site until the static upload is verified.

## Post-Upload URLs To Test

- `/`
- `/bg/`
- `/en/`
- `/bg/first-sound/`
- `/en/first-sound/`
- `/favicon.svg`
- one file under `/_astro/`

## Rollback Instructions

If the static upload fails:

1. Clear or archive the failed `public_html/` upload.
2. Restore the backed-up files to `public_html/`.
3. Restore the database only if the previous site required it.
4. Recheck the old homepage and admin/login route if applicable.
5. Keep the failed static upload separately for inspection.
