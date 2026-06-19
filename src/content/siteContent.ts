export type Language = "bg" | "en";

type NavItem = {
  label: string;
  href: string;
};

type TextSection = {
  id: string;
  eyebrow: string;
  heading: string;
  paragraphs: string[];
};

type Card = {
  title: string;
  description: string;
  cta?: string;
  href?: string;
};

type SiteCopy = {
  lang: Language;
  htmlLang: string;
  alternateLang: Language;
  alternateHref: string;
  meta: {
    title: string;
    description: string;
  };
  nav: NavItem[];
  hero: {
    eyebrow: string;
    title: string;
    text: string;
    positioning: string[];
    finalLine: string;
    primaryCta: string;
    secondaryCta: string;
    campaignLabel: string;
  };
  core: TextSection;
  vision: TextSection;
  mission: TextSection & {
    directions: string[];
    closing: string[];
  };
  listening: TextSection;
  foundation: TextSection & {
    subheading: string;
    responsibilities: string[];
  };
  campaign: TextSection;
  allyWays: {
    id: string;
    eyebrow: string;
    heading: string;
    intro: string;
    cards: Card[];
  };
  artisticIdentity: TextSection & {
    disclaimer: string;
  };
  programs: {
    id: string;
    eyebrow: string;
    heading: string;
    intro: string;
    cards: Card[];
  };
  archive: TextSection;
  support: {
    id: string;
    eyebrow: string;
    heading: string;
    intro: string;
    formNote: string;
    form: {
      firstName: string;
      lastName: string;
      email: string;
      languagePreference: string;
      helpType: string;
      message: string;
      privacy: string;
      submit: string;
      options: string[];
    };
    expertiseHeading: string;
    expertiseText: string;
    bankHeading: string;
    bankText: string;
    bankLabels: {
      beneficiary: string;
      iban: string;
      bic: string;
      bank: string;
      currency: string;
      reference: string;
    };
    paymentPlaceholderHeading: string;
    paymentPlaceholder: string;
    patronHeading: string;
    patronText: string;
  };
  contact: {
    id: string;
    eyebrow: string;
    heading: string;
    lines: string[];
  };
  footer: {
    orchestraName: string;
    orchestraLine: string;
    foundationName: string;
    foundationLine: string;
    legalLines: string[];
    motto: string;
  };
};

export const foundationData = {
  bg: {
    name: "Фондация 432 Херца",
    legalForm: "Фондация",
    status: "Юридическо лице с нестопанска цел в обществена полза",
    eikLabel: "ЕИК",
    eik: "204925949",
    registrationYear: "2018",
    city: "София, България",
    email: "info@432hz-foundation.com"
  },
  en: {
    name: "Foundation 432 Hertz",
    legalForm: "Foundation",
    status: "Public-benefit non-profit legal entity",
    eikLabel: "UIC/EIK",
    eik: "204925949",
    registrationYear: "2018",
    city: "Sofia, Bulgaria",
    email: "info@432hz-foundation.com"
  }
} as const;

export const bankTransfer = {
  beneficiaryBg: "432 Херца Фондация",
  beneficiaryEn: "432 Hertz Foundation",
  iban: "BG35FINV91501017138101",
  bic: "FINVBGSF",
  bankBg: "Първа Инвестиционна Банка",
  bankEn: "First Investment Bank, Bulgaria, Sofia",
  currency: "EUR",
  paymentReferenceBg: "Дарение",
  paymentReferenceEn: "Donation"
} as const;

const sharedAnchors = {
  orchestra: "#orchestra",
  foundation: "#foundation",
  identity: "#artistic-identity",
  programs: "#programs",
  archive: "#archive",
  support: "#support",
  contact: "#contact"
};

export const siteContent: Record<Language, SiteCopy> = {
  bg: {
    lang: "bg",
    htmlLang: "bg",
    alternateLang: "en",
    alternateHref: "/en/",
    meta: {
      title: "432 Chamber Orchestra · Независим струнен оркестър в София",
      description:
        "432 Chamber Orchestra е независим струнен оркестър в София, който изгражда слушателска общност около класически репертоар, нови струнни преображения, записи, архив и отчетен патронат."
    },
    nav: [
      { label: "Оркестър", href: sharedAnchors.orchestra },
      { label: "Фондация", href: sharedAnchors.foundation },
      { label: "Артистична идентичност", href: sharedAnchors.identity },
      { label: "Програми", href: sharedAnchors.programs },
      { label: "Концерти / Архив", href: sharedAnchors.archive },
      { label: "Подкрепа", href: sharedAnchors.support },
      { label: "Контакт", href: sharedAnchors.contact }
    ],
    hero: {
      eyebrow: "Независим струнен оркестър · София",
      title: "432 Chamber Orchestra",
      text:
        "432 Chamber Orchestra се завръща като независим струнен оркестър със сериозна артистична мисия: да изгради слушателска общност около струнен звук, който оставя следа.",
      positioning: ["Не концерт за отчет.", "Не участие за exposure.", "Не култура като фон."],
      finalLine:
        "Жив струнен оркестър — с класическа дисциплина, камерна яснота, записи, архив и общност, която следва работата отвъд една вечер.",
      primaryCta: "Влезте в слушателския кръг",
      secondaryCta: "Подкрепете първия звук",
      campaignLabel: "Кампания: Първият звук отново"
    },
    core: {
      id: "orchestra",
      eyebrow: "Позициониране",
      heading: "Артистично тяло и структура за памет",
      paragraphs: [
        "432 Chamber Orchestra е артистичното тяло: независим струнен оркестър, създаден около дисциплина, камерна яснота и дългосрочна работа.",
        "Фондация 432 Херца е юридическата, организационната, финансовата и отчетната структура зад оркестъра.",
        "Този сайт прави ясно разграничение между художествената работа и структурата, която я подкрепя, документира и съхранява."
      ]
    },
    vision: {
      id: "vision",
      eyebrow: "Визия",
      heading: "Устойчива независима струнна платформа",
      paragraphs: [
        "432 Chamber Orchestra съществува, за да изгради устойчива независима струнно-оркестрова платформа в България.",
        "Оркестърът създава съсредоточено пространство за слушане: пространство, в което струнният оркестър не е фон или украса, а живо артистично тяло, способно да носи памет, форма, тишина, напрежение, красота и духовна дълбочина.",
        "Дългосрочната визия е да се изпълнява стандартният струнен репертоар, да се създават нови струнни версии на вокални и хорови произведения, да се поръчва нова музика и работата да се документира чрез записи, партитури и публичен архив — извън логиката на случайните проекти и институционалната зависимост."
      ]
    },
    mission: {
      id: "mission",
      eyebrow: "Мисия",
      heading: "Работа, която оставя следа",
      paragraphs: [
        "432 Chamber Orchestra изпълнява, развива, записва и съхранява сериозна музика за струнен оркестър и камерни струнни формации.",
        "Оркестърът не съществува само за да прави концерти. Той съществува, за да създава корпус от работа.",
        "Всеки проект трябва да оставя следа: изпълнение, запис, партитура или обработка, архивна страница, слушателска общност и ясна следваща стъпка."
      ],
      directions: [
        "Класически струнно-оркестров репертоар",
        "Българска и европейска музикална памет",
        "Хорови и вокални преображения",
        "Източното песнопение като артистична линия",
        "Нова музика и млади автори",
        "Запис и публичен архив"
      ],
      closing: [
        "432 Chamber Orchestra не търси еднократна публика. Той изгражда слушателска общност.",
        "Не концерт за отчет. Не участие за exposure. Не култура като фон. Струнен звук, който оставя следа."
      ]
    },
    listening: {
      id: "listening-circle",
      eyebrow: "Слушателска общност",
      heading: "Хора, които чуват по-дълбоко",
      paragraphs: [
        "432 Chamber Orchestra не търси пасивна публика. Той изгражда слушателска общност.",
        "Слушателят не е само човек, който присъства на концерт. Слушателят е човек, който постепенно развива внимание, памет, критерий и жива връзка със звука.",
        "Във време, в което културният опит често е разпокъсан от екрани, институционални етикети и дигитален шум, 432 Chamber Orchestra работи за възстановяване на непосредствения досег с живата музика: камерни preview формати, бележки за слушане, контекст към репертоара, записи, архив и разговори около самата работа.",
        "Целта не е музиката да бъде обяснена до сухота. Целта е хората да започнат да чуват по-дълбоко."
      ]
    },
    foundation: {
      id: "foundation",
      eyebrow: "Структура",
      heading: "Фондация 432 Херца",
      subheading: "Юридическата и организационната структура зад 432 Chamber Orchestra.",
      paragraphs: [
        "Фондация 432 Херца е юридическото лице, което стои зад работата на 432 Chamber Orchestra.",
        "Ролята ѝ е да осигурява организационната рамка за концерти, записи, поръчки, договори, дарения, отчетност, архив, образователна дейност и дългосрочна културна приемственост.",
        "Фондацията съществува, за да не остане оркестърът личен проект или поредица от изолирани концерти. Тя създава структурата, чрез която артистичната работа може да бъде подкрепяна, документирана и съхранявана."
      ],
      responsibilities: [
        "Артистична продукция",
        "Юридическа и финансова рамка",
        "Архив и документация",
        "Общност и патронат"
      ]
    },
    campaign: {
      id: "campaign",
      eyebrow: "Кампания",
      heading: "Първият звук отново",
      paragraphs: [
        "„Първият звук отново“ е първата мобилизационна кампания за завръщането на 432 Chamber Orchestra.",
        "Целта ѝ не е да определя цялата мисия на оркестъра. Целта ѝ е да създаде първата документирана стъпка на рестарта: камерен preview формат, запис, архивна страница и ясен път към следващата оркестрова фаза.",
        "Кампанията започва със слушателска общност.",
        "От тази общност хората могат да помогнат по три начина: с време/експертиза, със средства или с глас.",
        "Първата практическа цел е да се отворят първите три сериозни разговора с компании, домакини или патрони, които биха могли да подкрепят камерния preview формат.",
        "Кампанията е мост, не крайна цел."
      ]
    },
    allyWays: {
      id: "ally-ways",
      eyebrow: "Съюзници",
      heading: "Три начина да помогнете",
      intro:
        "Не всеки съюзник помага по един и същи начин. Някои дават време и експертиза. Други дават средства. Трети дават глас и доверие. И трите са важни.",
      cards: [
        {
          title: "Дайте време/експертиза",
          description:
            "Помогнете с професионални умения, които могат да изградят проекта: маркетинг, дизайн, комуникации, фотография, видео, звук, уеб разработка, copywriting, превод, PR, събитийна организация, правна или счетоводна експертиза, партньорства, fundraising или връзки с подходящи компании и домакини.",
          cta: "Предложете експертиза",
          href: "#support"
        },
        {
          title: "Дайте средства",
          description:
            "Подкрепете първия запис, хонорар на музикант, нова обработка, камерен preview формат или архивна документация. Подкрепата трябва да води до конкретен документиран резултат.",
          cta: "Подкрепете първия звук",
          href: "#support"
        },
        {
          title: "Дайте глас",
          description:
            "Препратете проекта към един подходящ човек, дайте кратка препоръка или помогнете оркестърът да достигне до хора, които разбират сериозния културен труд.",
          cta: "Препратете проекта",
          href: "mailto:info@432hz-foundation.com"
        }
      ]
    },
    artisticIdentity: {
      id: "artistic-identity",
      eyebrow: "Артистична идентичност",
      heading: "Не честота сама по себе си, а дисциплиниран струнен звук",
      paragraphs: [
        "Артистичната идентичност на 432 Chamber Orchestra се изгражда върху дисциплиниран струнен звук, класически репертоар, нови струнни преображения на вокална и хорова музика, източното песнопение като една артистична линия, съвременни поръчки и публична документация.",
        "A=432 е част от акустичния и естетическия избор на оркестъра, но не е заместител на художествена мисъл, репертоар, работа и отговорност."
      ],
      disclaimer:
        "432 Chamber Orchestra третира A=432 като естетически и акустичен избор. Не правим научни, медицински, терапевтични или лечебни твърдения относно честотата."
    },
    programs: {
      id: "programs",
      eyebrow: "Програми",
      heading: "Формати за първата работеща фаза",
      intro:
        "Първата версия на сайта очертава програми като работни направления, без да измисля дати, записи или партньорства.",
      cards: [
        { title: "Слушателски кръг", description: "Общност около внимателно слушане, контекст, разговори и следване на работата във времето." },
        { title: "Камерен preview формат", description: "Малък, фокусиран формат за първата документирана стъпка на рестарта." },
        { title: "Запис и архив", description: "Документиране на работата чрез записи, партитури, бележки и публични архивни страници." },
        { title: "Оркестрово завръщане", description: "Път към по-голяма струнно-оркестрова фаза, изградена върху реална общност и структура." },
        { title: "Корпоративни и патронски формати", description: "Сериозни разговори с компании, домакини и патрони, които разбират културна отговорност." }
      ]
    },
    archive: {
      id: "archive",
      eyebrow: "Концерти / Архив",
      heading: "Публична памет, не изолирани събития",
      paragraphs: [
        "Архивът ще събира минали и бъдещи концерти, програми, записи, фотографии, партитури, отчети и проектни страници.",
        "432 Chamber Orchestra не третира концертите като изолирани събития. Всеки проект трябва да стане част от публична памет."
      ]
    },
    support: {
      id: "support",
      eyebrow: "Подкрепа",
      heading: "Влезте в слушателския кръг",
      intro:
        "Първата покана е за слушателска общност. Подкрепата със средства е важна, но не води сайта и не замества вниманието към работата.",
      formNote:
        "Формата е подготвена за бъдеща интеграция. Онлайн изпращането още не е активно. За контакт използвайте info@432hz-foundation.com.",
      form: {
        firstName: "Име",
        lastName: "Фамилия",
        email: "Имейл",
        languagePreference: "Предпочитан език",
        helpType: "Как бихте искали да помогнете?",
        message: "Съобщение",
        privacy: "Съгласен/съгласна съм Фондация 432 Херца да използва тези данни единствено за контакт относно проекта.",
        submit: "Изпращане не е активно",
        options: [
          "Влизам в слушателския кръг",
          "Давам време / експертиза",
          "Давам средства",
          "Давам глас",
          "Предлагам компания или домакин",
          "Само новини"
        ]
      },
      expertiseHeading: "Време / експертиза",
      expertiseText:
        "Ако можете да помогнете с професионални умения, връзки, домакинство или сериозен разговор, пишете директно на фондацията.",
      bankHeading: "Банков превод",
      bankText:
        "Можете да подкрепите дейността на Фондация 432 Херца чрез банков превод. Моля използвайте посоченото основание.",
      bankLabels: {
        beneficiary: "Титуляр",
        iban: "IBAN",
        bic: "BIC / SWIFT",
        bank: "Банка",
        currency: "Валута",
        reference: "Основание"
      },
      paymentPlaceholderHeading: "Бъдещи официални начини за подкрепа",
      paymentPlaceholder:
        "Картови плащания и други официални начини за подкрепа ще бъдат добавени след потвърждение. Засега можете да оставите имейл или да използвате банков превод.",
      patronHeading: "Компании и патрони",
      patronText:
        "За компании, домакини и патрони: първата практическа цел е да се отворят сериозни разговори за камерен preview формат и документиран резултат."
    },
    contact: {
      id: "contact",
      eyebrow: "Контакт",
      heading: "Официален контакт",
      lines: ["Фондация 432 Херца", "ЕИК: 204925949", "София, България", "info@432hz-foundation.com"]
    },
    footer: {
      orchestraName: "432 Chamber Orchestra",
      orchestraLine: "Независим струнен оркестър · София",
      foundationName: "Фондация 432 Херца",
      foundationLine: "Юридическа и организационна структура зад оркестъра.",
      legalLines: ["ЮЛНЦ в обществена полза", "ЕИК: 204925949", "София, България", "info@432hz-foundation.com"],
      motto: "Независим · Документиран · Отчетен"
    }
  },
  en: {
    lang: "en",
    htmlLang: "en",
    alternateLang: "bg",
    alternateHref: "/bg/",
    meta: {
      title: "432 Chamber Orchestra · Independent String Orchestra in Sofia",
      description:
        "432 Chamber Orchestra is an independent string orchestra in Sofia building a listening community around classical repertoire, new string transformations, recordings, archive, and accountable patronage."
    },
    nav: [
      { label: "Orchestra", href: sharedAnchors.orchestra },
      { label: "Foundation", href: sharedAnchors.foundation },
      { label: "Artistic Identity", href: sharedAnchors.identity },
      { label: "Programs", href: sharedAnchors.programs },
      { label: "Concerts / Archive", href: sharedAnchors.archive },
      { label: "Support", href: sharedAnchors.support },
      { label: "Contact", href: sharedAnchors.contact }
    ],
    hero: {
      eyebrow: "Independent String Orchestra · Sofia",
      title: "432 Chamber Orchestra",
      text:
        "432 Chamber Orchestra is returning as an independent string orchestra with a serious artistic mission: to build a listening community around string sound that leaves a trace.",
      positioning: ["Not a concert for a report.", "Not performance for exposure.", "Not culture as background."],
      finalLine:
        "A living string orchestra — with classical discipline, chamber clarity, recordings, archive, and a community that follows the work beyond one evening.",
      primaryCta: "Join the Listening Circle",
      secondaryCta: "Support the First Sound",
      campaignLabel: "Campaign: The First Sound Again"
    },
    core: {
      id: "orchestra",
      eyebrow: "Positioning",
      heading: "Artistic body and structure for memory",
      paragraphs: [
        "432 Chamber Orchestra is the artistic body: an independent string orchestra built around discipline, chamber clarity, and long-term work.",
        "Foundation 432 Hertz is the legal, organisational, financial, and reporting structure behind the orchestra.",
        "This site clearly distinguishes the artistic work from the structure that supports, documents, and preserves it."
      ]
    },
    vision: {
      id: "vision",
      eyebrow: "Vision",
      heading: "A sustainable independent string platform",
      paragraphs: [
        "432 Chamber Orchestra exists to build a sustainable independent string-orchestra platform in Bulgaria.",
        "The orchestra creates a focused space for listening: one in which the string orchestra is not treated as background or decoration, but as a living artistic body capable of carrying memory, form, silence, tension, beauty, and spiritual depth.",
        "The long-term vision is to perform the standard string repertoire, develop new string versions of vocal and choral works, commission new music, and document the work through recordings, scores, and public archive — outside the logic of occasional projects and institutional dependency."
      ]
    },
    mission: {
      id: "mission",
      eyebrow: "Mission",
      heading: "Work that leaves a trace",
      paragraphs: [
        "432 Chamber Orchestra performs, develops, records, and preserves serious music for string orchestra and chamber string formations.",
        "The orchestra does not exist only to perform concerts. It exists to create a body of work.",
        "Every project should leave a trace: a performance, a recording, a score or arrangement, an archive page, a community of listeners, and a clear next step."
      ],
      directions: [
        "Classical string-orchestra repertoire",
        "Bulgarian and European musical memory",
        "Choral and vocal transfigurations",
        "Eastern chant as an artistic line",
        "New music and young authors",
        "Recording and public archive"
      ],
      closing: [
        "432 Chamber Orchestra does not seek a one-time audience. It builds a listening community.",
        "Not a concert for a report. Not performance for exposure. Not culture as background. String sound that leaves a trace."
      ]
    },
    listening: {
      id: "listening-circle",
      eyebrow: "Listening Community",
      heading: "People who hear more deeply",
      paragraphs: [
        "432 Chamber Orchestra does not seek a passive audience. It builds a listening community.",
        "A listener is not only someone who attends a concert. A listener is someone who gradually develops attention, memory, criteria, and a living relationship with sound.",
        "In a time when cultural experience is often fragmented by screens, institutional labels, and digital noise, 432 Chamber Orchestra works to restore direct contact with live music: chamber previews, listening notes, repertoire context, recordings, archive, and conversations around the work.",
        "The goal is not to explain music until it becomes dry. The goal is to help people hear more deeply."
      ]
    },
    foundation: {
      id: "foundation",
      eyebrow: "Structure",
      heading: "Foundation 432 Hertz",
      subheading: "The legal and organisational structure behind 432 Chamber Orchestra.",
      paragraphs: [
        "Foundation 432 Hertz is the legal entity that supports the work of 432 Chamber Orchestra.",
        "Its role is to provide the organisational framework for concerts, recordings, commissions, contracts, donations, reporting, archive, educational activity, and long-term cultural continuity.",
        "The foundation exists so that the orchestra does not remain a one-person project or a sequence of isolated concerts. It creates the structure through which artistic work can be supported, documented, and preserved."
      ],
      responsibilities: ["Artistic production", "Legal and financial structure", "Archive and documentation", "Community and patronage"]
    },
    campaign: {
      id: "campaign",
      eyebrow: "Campaign",
      heading: "The First Sound Again",
      paragraphs: [
        "The First Sound Again is the first mobilisation campaign for the return of 432 Chamber Orchestra.",
        "Its purpose is not to define the orchestra’s entire mission. Its purpose is to create the first documented step of the restart: a chamber preview, a recording, an archive page, and a clear path toward the next orchestral phase.",
        "The campaign begins with a listening community.",
        "From that community, people can help in three ways: time/expertise, money, or voice.",
        "The first practical goal is to open the first three serious conversations with companies, hosts, or patrons who could support the chamber preview.",
        "The campaign is a bridge, not the destination."
      ]
    },
    allyWays: {
      id: "ally-ways",
      eyebrow: "Allies",
      heading: "Three ways to help",
      intro:
        "Not every ally helps in the same way. Some give time and expertise. Some give money. Some give voice and credibility. All three matter.",
      cards: [
        {
          title: "Give Time / Expertise",
          description:
            "Help with professional skills that can build the project: marketing, design, communications, photography, video, sound, web development, copywriting, translation, PR, event organisation, legal or accounting expertise, partnerships, fundraising, or introductions to suitable companies and hosts.",
          cta: "Offer expertise",
          href: "#support"
        },
        {
          title: "Give Money",
          description:
            "Support the first recording, a musician’s fee, a new arrangement, a chamber preview, or archive documentation. Support should lead to a specific documented result.",
          cta: "Support the First Sound",
          href: "#support"
        },
        {
          title: "Give Voice",
          description:
            "Forward the project to one relevant person, give a short endorsement, or help the orchestra reach people who understand serious cultural work.",
          cta: "Forward the project",
          href: "mailto:info@432hz-foundation.com"
        }
      ]
    },
    artisticIdentity: {
      id: "artistic-identity",
      eyebrow: "Artistic Identity",
      heading: "Not frequency alone, but disciplined string sound",
      paragraphs: [
        "The artistic identity of 432 Chamber Orchestra is built on disciplined string sound, classical repertoire, new string transformations of vocal and choral music, Eastern chant as one artistic line, contemporary commissions, and public documentation.",
        "A=432 is part of the orchestra’s acoustic and aesthetic choice, but it is not a substitute for artistic thought, repertoire, work, and accountability."
      ],
      disclaimer:
        "432 Chamber Orchestra treats A=432 as an aesthetic and acoustic choice. We make no scientific, medical, therapeutic, or healing claims regarding frequency."
    },
    programs: {
      id: "programs",
      eyebrow: "Programs",
      heading: "Formats for the first working phase",
      intro:
        "The first version of the site frames programs as working directions, without inventing dates, recordings, or partnerships.",
      cards: [
        { title: "Listening Circle", description: "A community around attentive listening, context, conversation, and following the work over time." },
        { title: "Chamber Preview", description: "A small, focused format for the first documented step of the restart." },
        { title: "Recording & Archive", description: "Documenting the work through recordings, scores, notes, and public archive pages." },
        { title: "Full Orchestra Return", description: "A path toward a larger string-orchestra phase built on real community and structure." },
        { title: "Corporate and Patron Formats", description: "Serious conversations with companies, hosts, and patrons who understand cultural responsibility." }
      ]
    },
    archive: {
      id: "archive",
      eyebrow: "Concerts / Archive",
      heading: "Public memory, not isolated events",
      paragraphs: [
        "The archive will collect past and future concerts, programmes, recordings, photographs, scores, reports, and project pages.",
        "432 Chamber Orchestra does not treat concerts as isolated events. Each project should become part of a public memory."
      ]
    },
    support: {
      id: "support",
      eyebrow: "Support",
      heading: "Join the Listening Circle",
      intro:
        "The first invitation is to a listening community. Financial support matters, but it does not lead the site or replace attention to the work.",
      formNote:
        "The form is prepared for future integration. Online submission is not active yet. Please use info@432hz-foundation.com for contact.",
      form: {
        firstName: "First name",
        lastName: "Last name",
        email: "Email",
        languagePreference: "Language preference",
        helpType: "How would you like to help?",
        message: "Message",
        privacy: "I agree that Foundation 432 Hertz may use this information only to contact me about the project.",
        submit: "Submission not active",
        options: [
          "Join the Listening Circle",
          "Give Time / Expertise",
          "Give Money",
          "Give Voice",
          "Suggest a company or host",
          "Updates only"
        ]
      },
      expertiseHeading: "Time / Expertise",
      expertiseText:
        "If you can help with professional skills, introductions, hosting, or a serious conversation, write directly to the foundation.",
      bankHeading: "Bank transfer",
      bankText:
        "You can support the work of Foundation 432 Hertz by bank transfer. Please use the payment reference below.",
      bankLabels: {
        beneficiary: "Beneficiary",
        iban: "IBAN",
        bic: "BIC / SWIFT",
        bank: "Bank",
        currency: "Currency",
        reference: "Payment reference"
      },
      paymentPlaceholderHeading: "Future official support options",
      paymentPlaceholder:
        "Card payments and other official support options will be added after confirmation. For now, you can leave your email or use bank transfer.",
      patronHeading: "Companies and patrons",
      patronText:
        "For companies, hosts, and patrons: the first practical goal is to open serious conversations around a chamber preview format and a documented result."
    },
    contact: {
      id: "contact",
      eyebrow: "Contact",
      heading: "Official contact",
      lines: ["Foundation 432 Hertz", "UIC/EIK: 204925949", "Sofia, Bulgaria", "info@432hz-foundation.com"]
    },
    footer: {
      orchestraName: "432 Chamber Orchestra",
      orchestraLine: "Independent String Orchestra · Sofia",
      foundationName: "Foundation 432 Hertz",
      foundationLine: "Legal and organisational structure behind the orchestra.",
      legalLines: ["Public-benefit non-profit legal entity", "UIC/EIK: 204925949", "Sofia, Bulgaria", "info@432hz-foundation.com"],
      motto: "Independent · Documented · Accountable"
    }
  }
};

export function getBankRows(lang: Language) {
  const labels = siteContent[lang].support.bankLabels;
  return [
    {
      label: labels.beneficiary,
      value: lang === "bg" ? bankTransfer.beneficiaryBg : bankTransfer.beneficiaryEn
    },
    { label: labels.iban, value: bankTransfer.iban, copy: true },
    { label: labels.bic, value: bankTransfer.bic, copy: true },
    { label: labels.bank, value: lang === "bg" ? bankTransfer.bankBg : bankTransfer.bankEn },
    { label: labels.currency, value: bankTransfer.currency },
    {
      label: labels.reference,
      value: lang === "bg" ? bankTransfer.paymentReferenceBg : bankTransfer.paymentReferenceEn
    }
  ];
}
