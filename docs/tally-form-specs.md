# Tally Form Specifications

These forms are external integration targets. Create and verify them manually before adding their public URLs to `.env`.

## 1. Host / company / patron suggestion

**BG title:** Предложете компания, домакин или патрон  
**EN title:** Suggest a company, host, or patron  
**Destination tab:** `05 Host Suggestions`  
**Future Brevo list/tag:** `05 Hosts / Venues`, tag `host_suggestion`

| Field | BG label | EN label | Type | Required |
| --- | --- | --- | --- | --- |
| Referrer name | Вашето име | Your name | Short text | Yes |
| Referrer email | Вашият имейл | Your email | Email | Yes |
| Contact name | Име на контакт | Contact name | Short text | Yes |
| Organisation | Компания / организация | Company / organisation | Short text | No |
| Contact context | Как познавате този контакт? | How do you know this contact? | Long text | Yes |
| Why relevant | Защо е подходящ? | Why could they be relevant? | Long text | Yes |
| Permission | Можем ли да споменем името ви? | May we mention your name? | Yes/no | Yes |
| Language | Предпочитан език | Preferred language | Select BG/EN | Yes |
| Consent | Съгласие за контакт | Contact consent | Checkbox | Yes |

**BG thank-you:** Благодарим. Всяко предложение ще бъде прегледано лично преди контакт.  
**EN thank-you:** Thank you. Every suggestion will be reviewed personally before contact.

## 2. Expertise offer

**BG title:** Предложете време/експертиза  
**EN title:** Offer time / expertise  
**Destination tab:** `04 Expertise Offers`  
**Future Brevo list/tag:** `04 Time & Expertise`, tag `expertise_offer`

| Field | BG label | EN label | Type | Required |
| --- | --- | --- | --- | --- |
| First name | Име | First name | Short text | Yes |
| Last name | Фамилия | Last name | Short text | No |
| Email | Имейл | Email | Email | Yes |
| Expertise | Област на експертиза | Area of expertise | Multi-select | Yes |
| Offer | Как бихте помогнали? | How could you help? | Long text | Yes |
| Availability | Ориентировъчна наличност | Approximate availability | Select | No |
| Portfolio | Портфолио / профил | Portfolio / profile | URL | No |
| Language | Предпочитан език | Preferred language | Select BG/EN | Yes |
| Consent | Съгласие за контакт | Contact consent | Checkbox | Yes |

**BG thank-you:** Благодарим. Ще прегледаме предложението и ще се свържем при ясна следваща стъпка.  
**EN thank-you:** Thank you. We will review the offer and get in touch when there is a clear next step.

## 3. Sponsor referral

**BG title:** Свържете ни с правилния човек  
**EN title:** Connect us with the right person  
**Destination tab:** `03 Sponsor Pipeline`  
**Future Brevo list/tag:** `02 Sponsor Prospects`, tag `warm_referral`

| Field | BG label | EN label | Type | Required |
| --- | --- | --- | --- | --- |
| Referrer | Вашето име | Your name | Short text | Yes |
| Referrer email | Вашият имейл | Your email | Email | Yes |
| Person | Лице за контакт | Contact person | Short text | Yes |
| Organisation | Компания / организация | Company / organisation | Short text | Yes |
| Role | Роля / длъжност | Role / title | Short text | No |
| Relationship | Вашата връзка с контакта | Your relationship to the contact | Long text | Yes |
| Introduction | Можете ли да направите представяне? | Can you make an introduction? | Yes/no | Yes |
| Context | Контекст за разговора | Context for the conversation | Long text | Yes |
| Consent | Съгласие за контакт | Contact consent | Checkbox | Yes |

**BG thank-you:** Благодарим. Ще подготвим кратък контекст и няма да изпращаме масови съобщения.  
**EN thank-you:** Thank you. We will prepare concise context and will not send mass outreach.
