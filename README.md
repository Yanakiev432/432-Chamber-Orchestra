# 432 Chamber Orchestra

Bilingual static website for 432 Chamber Orchestra and Foundation 432 Hertz.

The site presents 432 Chamber Orchestra as an independent string orchestra based in Sofia, with Foundation 432 Hertz as the legal and organisational structure behind the work.

## Stack

- Astro
- TypeScript
- Tailwind CSS
- Static output to `dist/`

## Routes

- `/` static redirect/fallback to `/bg/`
- `/bg/` Bulgarian home page
- `/en/` English home page
- `/bg/first-sound/` Bulgarian campaign landing page
- `/en/first-sound/` English campaign landing page

## Local Commands

```bash
pnpm install
pnpm run dev
pnpm run typecheck
pnpm run build
```

## Deployment

The production build is generated in:

```txt
dist/
```

Upload the contents of `dist/` to shared hosting / `public_html/`. The website is static: no backend, CMS, or server runtime is required.

Before replacing an old website, make a full backup of hosting files and any existing WordPress/MySQL database. See `DEPLOYMENT.md`.

## CRM / automation readiness

The website remains fully static. Listening Circle forms are ready to submit through a public Brevo form action or a generic external endpoint, while specialist pathways can link to Tally forms.

Brevo, Tally, Google Sheets, and payment placeholders are controlled only through public environment variables listed in `.env.example`. No backend, API secrets, or private CRM data are included in the website.

If no endpoint or Tally URL is configured, the relevant form or link stays inactive and displays an honest email fallback. Sponsor pipeline structure, form specifications, email automation, and the Google Sheets reminder starter are documented in `docs/`.
