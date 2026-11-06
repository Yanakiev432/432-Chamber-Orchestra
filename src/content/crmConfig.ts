import type { Language } from "./siteContent";

const contactEmail = import.meta.env.PUBLIC_CONTACT_EMAIL || "info@432hz-foundation.com";
const listeningFormUrl = import.meta.env.PUBLIC_BREVO_LISTENING_FORM_URL || "";
const listeningFormAction = import.meta.env.PUBLIC_BREVO_LISTENING_FORM_ACTION || "";
const expertiseUrl = import.meta.env.PUBLIC_TALLY_EXPERTISE_URL || "";
const hostSuggestionUrl = import.meta.env.PUBLIC_TALLY_HOST_SUGGESTION_URL || "";
const sponsorReferralUrl = import.meta.env.PUBLIC_TALLY_SPONSOR_REFERRAL_URL || "";

export const crmConfig = {
  contactEmail,
  brevo: {
    listeningFormUrl,
    listeningFormAction,
    isListeningFormConfigured: Boolean(listeningFormUrl || listeningFormAction)
  },
  tally: {
    expertiseUrl,
    hostSuggestionUrl,
    sponsorReferralUrl,
    isExpertiseConfigured: Boolean(expertiseUrl),
    isHostSuggestionConfigured: Boolean(hostSuggestionUrl),
    isSponsorReferralConfigured: Boolean(sponsorReferralUrl)
  },
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
    externalStatus: "Формата за слушателския кръг е свързана към външна страница за записване.",
    inactiveStatus:
      "Формата за слушателския кръг се свързва. До активирането ѝ пишете на info@432hz-foundation.com с тема „Слушателски кръг“.",
    emailCta: "Пишете за слушателския кръг",
    externalCta: "Отворете формата",
    emailSubject: "Слушателски кръг",
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
    externalStatus: "The Listening Circle form is connected through an external signup page.",
    inactiveStatus:
      "The Listening Circle form is being connected. Until activation, write to info@432hz-foundation.com with “Listening Circle” in the subject.",
    emailCta: "Write about the Listening Circle",
    externalCta: "Open the form",
    emailSubject: "Listening Circle",
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
      fallbackButton: "Предложете експертиза",
      fallbackSubject: "Предложение за експертиза",
      fallback:
        "До свързване на външната форма можете да изпратите предложение за експертиза по имейл."
    },
    host: {
      heading: "Предложете компания, домакин или патрон",
      text:
        "Ако познавате компания, фондация, частен домакин, културно пространство или човек, който би разбрал проекта, предложете един контакт. Това е една от най-ценните форми на подкрепа.",
      button: "Предложете контакт",
      fallbackButton: "Предложете компания или домакин",
      fallbackSubject: "Предложение за компания или домакин",
      fallback:
        "До свързване на външната форма можете да изпратите предложение по имейл."
    },
    sponsor: {
      heading: "Представете оркестъра на подходящ партньор",
      text:
        "Първата практическа цел на оркестъра е да започне между три и пет съдържателни разговора с компании, домакини или патрони за следващия камерен концертен етап.",
      button: "Предложете контакт",
      fallbackButton: "Предложете контакт за оркестъра",
      fallbackSubject: "Въведение към 432 Chamber Orchestra",
      fallback:
        "До свързване на външната форма можете да изпратите въведение по имейл."
    }
  },
  en: {
    expertise: {
      heading: "Offer time / expertise",
      text:
        "432 needs more than money. The project needs marketing, design, PR, photography, video, sound, web development, copywriting, translation, legal, accounting, event and fundraising expertise.",
      button: "Offer expertise",
      fallbackButton: "Offer expertise",
      fallbackSubject: "Expertise offer",
      fallback:
        "Until the external form is connected, you can send an expertise offer by email."
    },
    host: {
      heading: "Suggest a company, host, or patron",
      text:
        "If you know a company, foundation, private host, cultural space, or person who could understand the project, suggest one contact. This is one of the most valuable forms of support.",
      button: "Suggest a contact",
      fallbackButton: "Suggest a company or host",
      fallbackSubject: "Host or company suggestion",
      fallback:
        "Until the external form is connected, you can send a host or company suggestion by email."
    },
    sponsor: {
      heading: "Introduce the orchestra to a potential partner",
      text:
        "The orchestra’s immediate goal is to begin three to five substantive conversations with companies, hosts or patrons about its next chamber programme.",
      button: "Make an introduction",
      fallbackButton: "Make an introduction",
      fallbackSubject: "Introduction for 432 Chamber Orchestra",
      fallback:
        "Until the external form is connected, you can make an introduction by email."
    }
  }
} as const satisfies Record<Language, unknown>;
