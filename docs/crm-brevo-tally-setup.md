# CRM Brevo / Tally Setup

This static Astro website is CRM-ready, but it does not send email directly and does not contain backend automation.

Brevo is the main CRM/email automation system. Tally is used for specialist external forms. Google Sheets is the master prospect database and backup. Make or Google Apps Script may be added later as an automation bridge.

## Security Rules

- Never commit SMTP passwords, Brevo API keys, client secrets, or private credentials.
- Never put SMTP credentials in `PUBLIC_` variables.
- The static Astro frontend cannot safely send SMTP email directly.
- SMTP is server-side only and may be used later by internal automation outside this static site.

Safe public variables for this site:

```env
PUBLIC_BREVO_LISTENING_FORM_URL=
PUBLIC_BREVO_LISTENING_FORM_ACTION=
PUBLIC_TALLY_EXPERTISE_URL=
PUBLIC_TALLY_HOST_SUGGESTION_URL=
PUBLIC_TALLY_SPONSOR_REFERRAL_URL=
PUBLIC_CONTACT_EMAIL=info@432hz-foundation.com
```

Server-side placeholders only:

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_LOGIN=
BREVO_SMTP_PASSWORD=
BREVO_API_KEY=
```

## 1. Brevo Lists

Create these lists in Brevo:

1. `01 Listening Circle`
2. `02 Sponsor Prospects`
3. `03 Donors / Patrons`
4. `04 Time & Expertise`
5. `05 Hosts / Venues`
6. `06 Media`
7. `07 Do Not Contact`

## 2. Brevo Contact Attributes

Create or confirm these contact attributes:

- `LANGUAGE`
- `HELP_TYPE`
- `SOURCE`
- `LEAD_TYPE`
- `SECTOR`
- `FIT_SCORE`
- `CONSENT_SOURCE`
- `CONSENT_DATE`
- `NEXT_ACTION`
- `NOTES`

## 3. Listening Circle Form

Create a Brevo form for `01 Listening Circle`.

Use these environment variables:

- Hosted Brevo form URL: `PUBLIC_BREVO_LISTENING_FORM_URL`
- Direct form action endpoint, if Brevo provides one suitable for static HTML posting: `PUBLIC_BREVO_LISTENING_FORM_ACTION`

Behavior:

- If `PUBLIC_BREVO_LISTENING_FORM_ACTION` is configured, the on-page form posts directly with `method="post"`.
- If only `PUBLIC_BREVO_LISTENING_FORM_URL` is configured, the Listening Circle CTA opens the hosted Brevo form in a new tab.
- If neither is configured, the site shows a calm CRM setup note and a mailto fallback.

Do not add a fake success message in the frontend.

## 4. Tally Forms

Create Tally forms for these pathways:

- Expertise form -> `PUBLIC_TALLY_EXPERTISE_URL`
- Host/company suggestion form -> `PUBLIC_TALLY_HOST_SUGGESTION_URL`
- Sponsor referral form -> `PUBLIC_TALLY_SPONSOR_REFERRAL_URL`

When a URL exists, the website renders an external CTA link with `target="_blank"` and `rel="noopener noreferrer"`.

When a URL is missing, the website keeps a quiet institutional note and a mailto fallback to `info@432hz-foundation.com`.

## 5. Google Sheets Backup Tabs

Create a master CRM backup sheet with these tabs:

1. `01 Prospects`
2. `02 Listening Circle Export`
3. `03 Sponsor Pipeline`
4. `04 Expertise Offers`
5. `05 Host Suggestions`
6. `06 Media List`
7. `07 Donors`
8. `08 Follow-up Calendar`
9. `09 Do Not Contact`

## 6. Brevo Automation Skeleton

Suggested first Listening Circle automation:

- Day 0: welcome / first action taken
- Day 1: motivation question
- Day 3: what 432 is building
- Day 5: suggest host/company
- Day 7: support / sponsor brief

Keep automation consent-based. Do not add hidden tracking without consent.

## 7. SMTP Warning

Brevo SMTP settings are for future server-side or internal automation only.

- SMTP host placeholder: `smtp-relay.brevo.com`
- Port placeholder: `587`
- Login and password must remain private.
- Do not commit the real login or password.
- Do not use SMTP from browser JavaScript.
- Do not expose SMTP credentials through `PUBLIC_` variables.

