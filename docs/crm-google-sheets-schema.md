# CRM Google Sheets Schema

Google Sheets is the master prospect database and backup for Brevo and Tally activity.

## 01 Prospects Columns

- Company / Person
- Sector
- Website
- Contact person
- Role
- Email
- Phone
- LinkedIn
- Warm intro via
- Cultural fit
- Decision access
- Financial capacity
- Reputational safety
- Useful beyond money
- Fit score
- Pathway
- First ask
- Status
- Next action
- Next action date
- Last contact date
- Source
- Notes
- Do not contact?

## Fit Score Rule

Score five criteria from 1 to 5:

- Cultural fit
- Decision access
- Financial capacity
- Reputational safety
- Useful beyond money

Maximum score: 25.

- `20-25`: first priority
- `15-19`: good prospect
- `10-14`: nurture
- Under `10`: ignore for now

Keep `07 Do Not Contact` separate and respect it before any outreach.

## Local Setup Automation

Generate the CSV templates locally from the project root:

```bash
pnpm run crm:sheets:templates
```

The script writes files to `generated/crm-sheets/`:

- `01-prospects.csv`
- `02-listening-circle-export.csv`
- `03-sponsor-pipeline.csv`
- `04-expertise-offers.csv`
- `05-host-suggestions.csv`
- `06-media-list.csv`
- `07-donors.csv`
- `08-follow-up-calendar.csv`
- `09-do-not-contact.csv`

Import these files into Google Sheets as separate tabs. Add dropdown validation and protected ranges manually if useful.

Use:

```bash
pnpm run crm:check
```

to confirm local CRM environment variables are present and that no server-side Brevo/SMTP secrets have been exposed in frontend or public code.
