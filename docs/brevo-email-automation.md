# Brevo Email Automation

Principle: **One email = one job = one CTA.**

Create separate Bulgarian and English workflows selected by the `LANGUAGE` contact attribute. Do not activate either workflow until sender authentication, consent capture, unsubscribe handling, and test contacts are verified.

## Day 0 - Listen to the First Sound

**BG**

- Purpose: Welcome the new listener and establish attention as the first form of support.
- Key message: The orchestra is returning through a documented chamber preview, recording, and archive.
- CTA: `Чуйте първия звук` only after an official recording URL exists.
- Segment: New BG Listening Circle contacts.
- Trigger: Contact added to `01 Listening Circle` with `LANGUAGE=bg`.

**EN**

- Purpose: Welcome the new listener and establish attention as the first form of support.
- Key message: The orchestra is returning through a documented chamber preview, recording, and archive.
- CTA: `Listen to the First Sound` only after an official recording URL exists.
- Segment: New EN Listening Circle contacts.
- Trigger: Contact added to `01 Listening Circle` with `LANGUAGE=en`.

## Day 1 - Answer one question: why did you join?

**BG**

- Purpose: Learn the listener's motivation.
- Key message: A short personal answer helps shape relevant communication.
- CTA: `Отговорете с едно изречение`.
- Segment: BG contacts who received Day 0.
- Trigger: One day after workflow entry.

**EN**

- Purpose: Learn the listener's motivation.
- Key message: A short personal answer helps shape relevant communication.
- CTA: `Reply in one sentence`.
- Segment: EN contacts who received Day 0.
- Trigger: One day after workflow entry.

## Day 3 - Read why 432 is returning

**BG**

- Purpose: Explain the artistic and organisational return without frequency claims.
- Key message: Independent classical work needs continuity, documentation, and a listening community.
- CTA: `Прочетете защо 432 се завръща`.
- Segment: Active BG Listening Circle contacts.
- Trigger: Three days after workflow entry.

**EN**

- Purpose: Explain the artistic and organisational return without frequency claims.
- Key message: Independent classical work needs continuity, documentation, and a listening community.
- CTA: `Read why 432 is returning`.
- Segment: Active EN Listening Circle contacts.
- Trigger: Three days after workflow entry.

## Day 5 - Suggest one host, company, or patron

**BG**

- Purpose: Open one contextual introduction.
- Key message: A relevant contact can be more valuable than a broad share.
- CTA: `Предложете един контакт`.
- Segment: BG contacts, especially `HELP_TYPE=suggest_company_host_patron` or `voice_recommendation`.
- Trigger: Five days after workflow entry.

**EN**

- Purpose: Open one contextual introduction.
- Key message: One relevant contact can be more valuable than a broad share.
- CTA: `Suggest one contact`.
- Segment: EN contacts, especially `HELP_TYPE=suggest_company_host_patron` or `voice_recommendation`.
- Trigger: Five days after workflow entry.

## Day 7 - Support the first recording

**BG**

- Purpose: Present financial support only after trust and context.
- Key message: Support contributes to a specific documented result: chamber preview, recording, and archive page.
- CTA: `Подкрепете първия запис`.
- Segment: Consenting BG contacts; optionally prioritise `HELP_TYPE=money`.
- Trigger: Seven days after workflow entry.

**EN**

- Purpose: Present financial support only after trust and context.
- Key message: Support contributes to a specific documented result: chamber preview, recording, and archive page.
- CTA: `Support the first recording`.
- Segment: Consenting EN contacts; optionally prioritise `HELP_TYPE=money`.
- Trigger: Seven days after workflow entry.

Do not publish a payment CTA until an official payment destination has been verified. Bank transfer details remain on the website Support section.
