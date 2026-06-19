# 432 Chamber Orchestra

Bilingual static website for 432 Chamber Orchestra and Foundation 432 Hertz.

## Stack

- Astro
- TypeScript
- Tailwind CSS
- Static output to `dist/`

## Routes

- `/bg/` Bulgarian, default language
- `/en/` English
- `/` static redirect/fallback page to `/bg/`

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run typecheck
npm run build
```

The production output is generated in `dist/` and can be uploaded to shared hosting / `public_html`.

## Integrations

External integrations are configured only through environment variables. See `.env.example`.
