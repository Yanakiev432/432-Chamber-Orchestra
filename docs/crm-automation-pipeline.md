# CRM Automation Pipeline

## Operating model

```txt
Website visitor
-> Listening Circle signup
-> Brevo contact, list, and segment
-> 5-email welcome journey
-> Help-type classification
-> Relevant donor, expertise, host, sponsor, or listener action
-> CRM deal when a qualified relationship exists
```

The first form of support is attention. Donation does not lead the journey. The campaign is **The First Sound Again**, and its first support product is the **First Chamber Preview + first recording + archive page**.

## Recommended stack

- **Brevo:** CRM, contacts, segmentation, email automation, and deals.
- **Tally:** specialist forms for host suggestions, expertise offers, and sponsor referrals.
- **Google Sheets:** master prospect database, operational view, and backup.
- **Make or Google Apps Script:** automation bridge for notifications, reminders, and controlled data movement.

No private API key belongs in the static website. Public form actions and URLs are configured through environment variables.

## Brevo lists

1. `01 Listening Circle`
2. `02 Sponsor Prospects`
3. `03 Donors / Patrons`
4. `04 Time & Expertise`
5. `05 Hosts / Venues`
6. `06 Media`
7. `07 Do Not Contact`

## Contact attributes

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

`NOTES`, internal qualification, and negotiation details remain private and are never rendered by the website.

## Sponsor pipeline stages

1. `Research`
2. `Qualified`
3. `Warm intro requested`
4. `Intro sent`
5. `Meeting requested`
6. `Meeting booked`
7. `Proposal / budget sent`
8. `Negotiation`
9. `Won`
10. `Lost`
11. `Nurture`

## Google Sheets tabs

1. `01 Prospects`
2. `02 Listening Circle Export`
3. `03 Sponsor Pipeline`
4. `04 Expertise Offers`
5. `05 Host Suggestions`
6. `06 Media List`
7. `07 Donors`
8. `08 Follow-up Calendar`
9. `09 Do Not Contact`

## Fit score

Score each criterion from 1 to 5:

- Cultural fit
- Decision access
- Financial capacity
- Reputational safety
- Useful beyond money

```txt
20-25 = First priority
15-19 = Good prospect
10-14 = Nurture
under 10 = Ignore for now
```

## Recommended automations

### New Listening Circle signup

- Create or update the Brevo contact.
- Add `01 Listening Circle`.
- Store language, help type, source, and consent evidence.
- Start the language-appropriate welcome journey.

### Help-type split

- `follow_only`: remain in the Listening Circle nurture path.
- `time_expertise`: add `04 Time & Expertise` and request a Tally expertise form.
- `money`: add donor context without presenting an unverified payment flow.
- `voice_recommendation`: ask for one contextual recommendation.
- `suggest_company_host_patron`: request the host or sponsor referral form.

### Host suggestion notification

- Add a row to `05 Host Suggestions`.
- Notify the foundation inbox.
- Create a manually reviewed prospect only when the referral is relevant.

### Expertise offer notification

- Add a row to `04 Expertise Offers`.
- Notify the foundation inbox.
- Assign an owner and next action manually.

### Daily next-action reminder

- Read `03 Sponsor Pipeline`.
- Find actions due today.
- Send one internal summary to `info@432hz-foundation.com`.

## Outreach warning

Do not mass-automate cold sponsor email. Sponsor outreach should remain personal, short, contextual, and manually approved. The system may automate reminders, segmentation, notes, consent records, and welcome emails, but not serious sponsor negotiation.
