import type { Language } from "./siteContent";

export const crmConfig = {
  helpTypes: [
    "follow_only",
    "time_expertise",
    "money",
    "voice_recommendation",
    "suggest_company_host_patron"
  ],
  leadTypes: ["listener", "donor", "sponsor", "host", "media", "expert"],
  sourceValues: [
    "website_home_bg",
    "website_home_en",
    "first_sound_bg",
    "first_sound_en",
    "support_bg",
    "support_en",
    "manual_import",
    "referral"
  ],
  crmFields: [
    "FIRSTNAME",
    "LASTNAME",
    "EMAIL",
    "LANGUAGE",
    "HELP_TYPE",
    "LEAD_TYPE",
    "SOURCE",
    "SECTOR",
    "FIT_SCORE",
    "CONSENT_SOURCE",
    "CONSENT_DATE",
    "NEXT_ACTION",
    "NOTES"
  ]
} as const;

export type FormSource = (typeof crmConfig.sourceValues)[number];

export const listeningCircleCopy = {
  bg: {
    heading: "Влезте в слушателския кръг",
    firstName: "Име",
    lastName: "Фамилия",
    email: "Имейл",
    language: "Предпочитан език",
    helpType: "Как бихте искали да помогнете?",
    message: "Кратко съобщение",
    privacy:
      "Съгласявам се да получавам имейли от Фондация 432 Херца / 432 Chamber Orchestra относно слушателския кръг, концерти, записи, архив, кампании и възможности за подкрепа. Мога да се отпиша по всяко време.",
    submit: "Влизам в слушателския кръг",
    activeStatus: "Формата ще бъде изпратена към конфигурираната CRM интеграция.",
    inactiveStatus:
      "Формата е подготвена за CRM свързване. До активиране можете да пишете на info@432hz-foundation.com.",
    options: [
      { value: "follow_only", label: "Само да следя" },
      { value: "time_expertise", label: "С време/експертиза" },
      { value: "money", label: "Със средства" },
      { value: "voice_recommendation", label: "С глас/препоръка" },
      {
        value: "suggest_company_host_patron",
        label: "Мога да предложа компания, домакин или патрон"
      }
    ]
  },
  en: {
    heading: "Join the Listening Circle",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    language: "Preferred language",
    helpType: "How would you like to help?",
    message: "Short message",
    privacy:
      "I agree to receive emails from Foundation 432 Hertz / 432 Chamber Orchestra about the Listening Circle, concerts, recordings, archive, campaigns, and ways to support the work. I can unsubscribe at any time.",
    submit: "Join the Listening Circle",
    activeStatus: "The form will submit to the configured CRM integration.",
    inactiveStatus:
      "The form is prepared for CRM integration. Until activation, you can write to info@432hz-foundation.com.",
    options: [
      { value: "follow_only", label: "Follow only" },
      { value: "time_expertise", label: "Time / Expertise" },
      { value: "money", label: "Money" },
      { value: "voice_recommendation", label: "Voice / Recommendation" },
      {
        value: "suggest_company_host_patron",
        label: "I can suggest a company, host, or patron"
      }
    ]
  }
} as const satisfies Record<Language, unknown>;

export const pathwayCopy = {
  bg: {
    expertise: {
      heading: "Предложете време/експертиза",
      text:
        "432 има нужда не само от средства. Нужни са маркетинг, дизайн, PR, фотография, видео, звук, уеб разработка, copywriting, превод, правна, счетоводна, събитийна и fundraising експертиза.",
      button: "Предложете експертиза",
      fallback:
        "Формата за експертиза ще бъде активирана скоро. Засега пишете на info@432hz-foundation.com."
    },
    host: {
      heading: "Предложете компания, домакин или патрон",
      text:
        "Ако познавате компания, фондация, частен домакин, културно пространство или човек, който би разбрал проекта, предложете един контакт. Това е една от най-ценните форми на подкрепа.",
      button: "Предложете контакт",
      fallback:
        "Формата за предложения ще бъде активирана скоро. Засега пишете на info@432hz-foundation.com."
    },
    sponsor: {
      heading: "Свържете ни с правилния човек",
      text:
        "Първата практическа цел е да отворим 3-5 сериозни разговора с компании, домакини или патрони, които могат да подкрепят първия камерен preview формат.",
      button: "Свържете ни",
      fallback:
        "Формата за представяне ще бъде активирана скоро. Засега пишете на info@432hz-foundation.com."
    }
  },
  en: {
    expertise: {
      heading: "Offer time / expertise",
      text:
        "432 needs more than money. The project needs marketing, design, PR, photography, video, sound, web development, copywriting, translation, legal, accounting, event and fundraising expertise.",
      button: "Offer expertise",
      fallback:
        "The expertise form will be activated soon. For now, write to info@432hz-foundation.com."
    },
    host: {
      heading: "Suggest a company, host, or patron",
      text:
        "If you know a company, foundation, private host, cultural space, or person who could understand the project, suggest one contact. This is one of the most valuable forms of support.",
      button: "Suggest a contact",
      fallback:
        "The suggestion form will be activated soon. For now, write to info@432hz-foundation.com."
    },
    sponsor: {
      heading: "Connect us with the right person",
      text:
        "The first practical goal is to open 3-5 serious conversations with companies, hosts, or patrons who could support the first chamber preview.",
      button: "Make an introduction",
      fallback:
        "The introduction form will be activated soon. For now, write to info@432hz-foundation.com."
    }
  }
} as const satisfies Record<Language, unknown>;
