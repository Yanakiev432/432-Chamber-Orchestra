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

type SupportLevel = {
  title: string;
  amount: string;
  description: string;
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
  firstOutput: TextSection & {
    items: string[];
  };
  vision: TextSection;
  mission: TextSection & {
    directions: string[];
    closing: string[];
  };
  listening: TextSection;
  founder: TextSection & {
    role: string;
    name: string;
    photo: {
      src: string;
      width: number;
      height: number;
      alt: string;
    };
  };
  foundation: TextSection & {
    subheading: string;
    responsibilities: string[];
    accountability: {
      heading: string;
      text: string;
      items: string[];
    };
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
    fundraising: {
      preview: {
        heading: string;
        intro: string;
        formatHeading: string;
        formatItems: string[];
        outputsHeading: string;
        outputItems: string[];
        facts: { label: string; value: string }[];
      };
      useOfFunds: {
        heading: string;
        intro: string;
        label: string;
        items: string[];
      };
      returnProgramme: {
        heading: string;
        paragraphs: string[];
        programmeHeading: string;
        programmeItems: string[];
        supportHeading: string;
        supportItems: string[];
        confirmationNote: string;
        archiveNote: string;
      };
      fundingTarget: {
        heading: string;
        intro: string;
        breakdownHeading: string;
        breakdownItems: string[];
        disciplineNote: string;
        items: {
          title: string;
          amount: string;
          description: string;
        }[];
      };
      supportLevels: {
        heading: string;
        items: SupportLevel[];
        ctas: {
          sponsor: string;
          bank: string;
          listening: string;
        };
      };
      patronPathway: {
        heading: string;
        intro: string;
        items: string[];
        askLabel: string;
        askText: string;
        cta: string;
        briefCta: string;
        mailSubject: string;
        briefSubject: string;
      };
    };
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
    links: NavItem[];
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
      title: "Камерен оркестър 432 | Струнна музика и записи в Bandcamp",
      description:
        "Камерен оркестър 432 е независим струнен оркестър от София. Слушайте и купете архивни записи в Bandcamp и подкрепете неговото завръщане."
    },
    nav: [
      { label: "Оркестър", href: sharedAnchors.orchestra },
      { label: "Фондация", href: sharedAnchors.foundation },
      { label: "Артистична идентичност", href: sharedAnchors.identity },
      { label: "Програми", href: sharedAnchors.programs },
      { label: "Записи", href: "/bg/recordings/" },
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
    firstOutput: {
      id: "first-documented-output",
      eyebrow: "Първа фаза",
      heading: "Първият документиран резултат",
      paragraphs: [
        "Завръщането започва с фокусиран камерен preview формат — не като изолирано събитие, а като първата видима стъпка на работеща артистична структура."
      ],
      items: [
        "камерен preview",
        "записан откъс",
        "публична архивна страница",
        "кратък отчет",
        "ясна следваща стъпка към по-голяма струнно-оркестрова фаза"
      ]
    },
    vision: {
      id: "vision",
      eyebrow: "Визия",
      heading: "Устойчива независима струнна платформа",
      paragraphs: [
        "432 Chamber Orchestra съществува, за да изгради устойчива независима струнно-оркестрова платформа със седалище в София.",
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
        "Музикална памет и пренебрегван репертоар",
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
    founder: {
      id: "founder",
      eyebrow: "Хора",
      heading: "Основател",
      role: "Founder",
      name: "д-р Иван К. Янакиев",
      photo: {
        src: "/archive/photos/656785796_26236839085965093_6169334625520283925_n.jpg",
        width: 2048,
        height: 1425,
        alt: "Диригентът на 432 Chamber Orchestra"
      },
      paragraphs: [
        "д-р Иван К. Янакиев е основател на 432 Chamber Orchestra.",
        "Работата му съчетава диригентска практика, струнно-оркестрова дисциплина, изследване, документация и дългосрочната задача да бъде изградена слушателска общност около сериозен струнен звук.",
        "Той е доктор и е свързан с Института по механика към БАН. По-ранният му академичен и артистичен път включва работа, свързана с Института за изследване на изкуствата към БАН и предишната история на 432 Chamber Orchestra.",
        "Завръщането не се представя като лична история на завръщане, а като възстановяване на артистично тяло, архив и отчетна структура около оркестъра."
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
      ],
      accountability: {
        heading: "Обещание за отчетност",
        text: "Подкрепата трябва да води до определен артистичен резултат.",
        items: [
          "определен обхват на проекта",
          "ясна бюджетна линия или цел на подкрепата",
          "документация на артистичната работа",
          "архивна или проектна страница, когато е приложимо",
          "кратък отчет към подкрепилите и партньорите"
        ]
      }
    },
    campaign: {
      id: "campaign",
      eyebrow: "Кампания",
      heading: "Първият звук отново",
      paragraphs: [
        "„Първият звук отново“ е първата мобилизационна кампания за завръщането на 432 Chamber Orchestra.",
        "Целта ѝ не е да определя цялата мисия на оркестъра. Целта ѝ е да създаде първата документирана стъпка на рестарта: работен формат, запис, архивна страница и ясен път към следващата оркестрова фаза.",
        "Кампанията започва със слушателска общност.",
        "От тази общност хората могат да помогнат по три начина: с време/експертиза, със средства или с глас.",
        "Първата практическа цел е да се отворят първите три сериозни разговора с компании, домакини или патрони, които биха могли да подкрепят първата документирана стъпка и следващата оркестрова фаза.",
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
            "Подкрепете първия запис, хонорар на музикант, нова обработка, първа документирана стъпка или архивна документация. Подкрепата трябва да води до конкретен документиран резултат.",
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
        "Формата за слушателския кръг се свързва. До активирането ѝ пишете на info@432hz-foundation.com с тема „Слушателски кръг“.",
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
      fundraising: {
        preview: {
          heading: "Първа документирана стъпка",
          intro:
            "Първата готова за подкрепа стъпка е компактна, документирана работна фаза, която трябва да произведе повече от едно събитие.",
          formatHeading: "Работен формат",
          formatItems: [
            "компактен струнен формат или фокусирана работна сесия",
            "музика, репетиционна работа и кратко контекстуално въведение",
            "30-80 поканени слушатели според пространството",
            "подходящо за компания, частен домакин, галерия, фондация или културно пространство"
          ],
          outputsHeading: "Очаквани резултати",
          outputItems: [
            "жив документиран първи формат",
            "записан откъс, ако бюджетът позволява",
            "фото документация",
            "архивна/проектна страница",
            "кратък отчет към подкрепилите",
            "ясна следваща стъпка към по-голямата оркестрова фаза"
          ],
          facts: [
            { label: "Дата", value: "предстои уточняване" },
            { label: "Място", value: "предстои уточняване" },
            { label: "Програма", value: "предстои уточняване" }
          ]
        },
        useOfFunds: {
          heading: "Как ще се използва подкрепата",
          intro:
            "Първата фаза трябва да финансира определена артистична работа, а не неясна дейност.",
          label: "Ориентировъчно използване на средствата",
          items: [
            "хонорари за музиканти",
            "репетиционно време",
            "зала или домакинска логистика",
            "аудио запис и обработка",
            "фото/видео документация",
            "програмен текст и превод",
            "архивна/проектна страница",
            "администрация, счетоводство и отчетност"
          ]
        },
        returnProgramme: {
          heading: "Първа програма за завръщане на целия оркестър",
          paragraphs: [
            "По-голямата фаза на завръщането е замислена като програма за цял струнен оркестър с продължителност 60+ минути.",
            "Това още не е потвърдено концертно обявление. Това е работна репертоарна рамка за първото съществено оркестрово завръщане на 432 Chamber Orchestra.",
            "Програмата трябва да представи сериозна артистична теза: съвременен български звук, класическа солистична форма, английска струнно-оркестрова дисциплина и българска модерна камерна памет, поставени в контекста на възстановено струнно-оркестрово тяло."
          ],
          programmeHeading: "Работна репертоарна рамка",
          programmeItems: [
            "Георги Арнаудов — Gates of Dream II",
            "Йозеф Хайдн — Концерт за виолончело в до мажор; солист: предстои покана / предстои потвърждение",
            "Едуард Елгар — Сюита „Свети Павел“",
            "Любомир Пипков — Струнен квартет №1; оркестров формат / статус на обработка: предстои уточняване"
          ],
          supportHeading: "Подкрепата може да помогне за",
          supportItems: [
            "покана към силен солист",
            "музикантски хонорари",
            "репетиционна работа",
            "подготовка на партитури и обработки, където е необходимо",
            "запис и обработка",
            "фото/видео документация",
            "архивна/проектна страница",
            "кратък отчет след проекта"
          ],
          confirmationNote:
            "Финална програма, ред, продължителност, място, дата, състав, солист, права и статус на обработките предстоят да бъдат потвърдени.",
          archiveNote:
            "Архивна бележка: Gates of Dream II присъства в документираната по-ранна дейност на 432 Chamber Orchestra."
        },
        fundingTarget: {
          heading: "Цел за финансиране",
          intro:
            "Завръщането трябва да бъде финансирано като определен артистичен резултат, а не като неясен апел.",
          breakdownHeading: "Какво включва професионалната цел",
          breakdownItems: [
            "13 инструменталисти",
            "покана към солист",
            "диригент / артистична подготовка",
            "концертмайстор и водаческа отговорност",
            "оркестров мениджър / нототекар / production assistant",
            "репетиционна работа",
            "зала и продукционна логистика",
            "права, лицензиране, партитури и обработки",
            "професионален аудиозапис, монтаж и мастеринг",
            "multi-camera видео документация",
            "фотография",
            "PR стратегия и медийна работа",
            "дизайн, copywriting, превод, програмен текст",
            "платена реклама, когато е уместно",
            "афиши, печат и разпространение",
            "уеб/архивна страница и отчет след проекта",
            "договори, счетоводство, администрация",
            "резерв"
          ],
          disciplineNote:
            "Проектът не трябва да се бюджетира като „един концерт“. Той трябва да се бюджетира като документирана артистична продукция: репетиции, изпълнение, права, запис, документация, PR, архив и отчетност.",
          items: [
            {
              title: "Минимална първа фаза",
              amount: "30 000 EUR",
              description:
                "Покрива пестелива, но професионална документирана стъпка на завръщането, с ограничена документация и ограничен PR. Въпреки това трябва да пази музикантските хонорари, основната репетиционна работа, необходимите проверки за права/лицензиране, базов запис, архивна страница и отчетност."
            },
            {
              title: "Професионална цел",
              amount: "55 000 EUR",
              description:
                "Покрива препоръчителната 60+ минутна програма за цял струнен оркестър с покана към солист, коректни музикантски хонорари, репетиционна работа, подготовка на партитури/обработки, права/лицензиране, професионален аудиозапис, multi-camera документация, фотография, PR, архивна/проектна страница, администрация и отчетност."
            },
            {
              title: "Пълна фаза на завръщане",
              amount: "90 000 EUR",
              description:
                "Покрива по-силна публична продукция с разширена документация, по-силна PR/медийна кампания, по-високо ниво на условия за солист, по-сериозни условия за зала, по-силна постпродукция, по-широка публична видимост и по-силна институционална отчетност."
            }
          ]
        },
        supportLevels: {
          heading: "Ориентировъчни нива на подкрепа",
          items: [
            { title: "Патрон на музикантски хонорар", amount: "500–1 000 EUR", description: "Подкрепя коректни музикантски хонорари и репетиционна работа." },
            { title: "Патрон на запис", amount: "1 500–3 500 EUR", description: "Подкрепя аудиозапис, монтаж, мастеринг и архивна подготовка." },
            { title: "Патрон на покана към солист", amount: "3 000–5 000 EUR", description: "Подкрепя поканата и условията за солист, който предстои да бъде потвърден." },
            { title: "Патрон на партитури и права", amount: "2 000–4 000 EUR", description: "Подкрепя партитури, обработки, права и лицензиране, където е необходимо." },
            { title: "Партньор за пълна документация", amount: "7 500–12 000 EUR", description: "Подкрепя професионален запис, видео документация, фотография и архивна страница." },
            { title: "Основен концертен партньор", amount: "15 000–25 000 EUR", description: "Подкрепя съществена част от продукцията, репетициите, комуникацията и документацията." },
            { title: "Основен патрон на завръщането", amount: "50 000–55 000 EUR", description: "Подкрепя професионалната цел и препоръчителната 60+ минутна програма за цял струнен оркестър." },
            { title: "Партньор на пълната фаза на завръщането", amount: "85 000–90 000 EUR", description: "Подкрепя пълната фаза на завръщане с по-силна продукция, документация, видимост и отчетност." }
          ],
          ctas: {
            sponsor: "Заявете разговор за партньорство",
            bank: "Използвайте банков превод",
            listening: "Влезте в слушателския кръг"
          }
        },
        patronPathway: {
          heading: "За компании и патрони",
          intro:
            "Най-полезната първа стъпка не е поставяне на лого. Тя е сериозен разговор за определен културен резултат.",
          items: [
            "домакинство на първа документирана стъпка",
            "подкрепа за първия запис",
            "финансиране на музикантски хонорари",
            "предоставяне на подходящо пространство",
            "свързване с един релевантен човек, който взема решения",
            "подкрепа за документация и архив"
          ],
          askLabel: "Първа конкретна молба",
          askText: "Отворете 20-минутен разговор за първата документирана стъпка.",
          cta: "Заявете разговор за партньорство",
          briefCta: "Вижте спонсорското резюме",
          mailSubject: "Разговор за първата документирана стъпка",
          briefSubject: "Заявка за спонсорско резюме"
        }
      },
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
        "За компании, домакини и патрони: първата практическа цел е да се отворят сериозни разговори за документиран първи резултат и следваща оркестрова фаза."
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
      links: [
        { label: "Поверителност", href: "/bg/privacy/" },
        { label: "Политика за дарения", href: "/bg/donation-policy/" },
        { label: "Преса / Медии", href: "/bg/press/" },
        { label: "Спонсорско резюме", href: "/bg/sponsor-brief/" }
      ],
      motto: "Независим · Документиран · Отчетен"
    }
  },
  en: {
    lang: "en",
    htmlLang: "en",
    alternateLang: "bg",
    alternateHref: "/bg/",
    meta: {
      title: "432 Chamber Orchestra | String Music & Bandcamp Recordings",
      description:
        "432 Chamber Orchestra is an independent string orchestra from Sofia. Listen to and buy archival recordings on Bandcamp and support its return."
    },
    nav: [
      { label: "Orchestra", href: sharedAnchors.orchestra },
      { label: "Foundation", href: sharedAnchors.foundation },
      { label: "Artistic Identity", href: sharedAnchors.identity },
      { label: "Programs", href: sharedAnchors.programs },
      { label: "Recordings", href: "/en/recordings/" },
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
    firstOutput: {
      id: "first-documented-output",
      eyebrow: "First phase",
      heading: "The first documented output",
      paragraphs: [
        "The restart begins with a focused chamber preview — not as an isolated event, but as the first visible step of a working artistic structure."
      ],
      items: [
        "a chamber preview",
        "a recorded excerpt",
        "a public archive page",
        "a short report",
        "a clear next step toward the larger string-orchestra phase"
      ]
    },
    vision: {
      id: "vision",
      eyebrow: "Vision",
      heading: "A sustainable independent string platform",
      paragraphs: [
        "432 Chamber Orchestra exists to build a sustainable independent string-orchestra platform based in Sofia.",
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
        "Musical memory and neglected repertoire",
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
    founder: {
      id: "founder",
      eyebrow: "People",
      heading: "Founder",
      role: "Founder",
      name: "Ivan K. Yanakiev, PhD",
      photo: {
        src: "/archive/photos/656785796_26236839085965093_6169334625520283925_n.jpg",
        width: 2048,
        height: 1425,
        alt: "Conductor of 432 Chamber Orchestra"
      },
      paragraphs: [
        "Ivan K. Yanakiev, PhD is the founder of 432 Chamber Orchestra.",
        "His work brings together conducting, string-orchestra discipline, research, documentation, and the long-term task of rebuilding a listening community around serious string sound.",
        "He holds a PhD and is associated with the BAS Institute of Mechanics. His earlier academic and artistic background includes work connected with the BAS Institute of Art Studies and the previous history of 432 Chamber Orchestra.",
        "The restart is not presented as a personal comeback story, but as the rebuilding of an artistic body, archive, and accountable structure around the orchestra."
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
      responsibilities: ["Artistic production", "Legal and financial structure", "Archive and documentation", "Community and patronage"],
      accountability: {
        heading: "Accountability promise",
        text: "Support should lead to a defined artistic result.",
        items: [
          "a defined project scope",
          "a clear budget line or support purpose",
          "documentation of the artistic work",
          "an archive or project page where appropriate",
          "a short post-project report for supporters and partners"
        ]
      }
    },
    campaign: {
      id: "campaign",
      eyebrow: "Campaign",
      heading: "The First Sound Again",
      paragraphs: [
        "The First Sound Again is the first mobilisation campaign for the return of 432 Chamber Orchestra.",
        "Its purpose is not to define the orchestra’s entire mission. Its purpose is to create the first documented step of the restart: a working format, a recording, an archive page, and a clear path toward the next orchestral phase.",
        "The campaign begins with a listening community.",
        "From that community, people can help in three ways: time/expertise, money, or voice.",
        "The first practical goal is to open the first three serious conversations with companies, hosts, or patrons who could support the first documented step and the next orchestral phase.",
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
            "Support the first recording, a musician’s fee, a new arrangement, a first documented step, or archive documentation. Support should lead to a specific documented result.",
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
        "The Listening Circle form is being connected. Until activation, write to info@432hz-foundation.com with “Listening Circle” in the subject.",
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
      fundraising: {
        preview: {
          heading: "First documented step",
          intro:
            "The first sponsor-ready step is a compact documented working phase designed to produce more than one event.",
          formatHeading: "Working format",
          formatItems: [
            "compact string format or focused working session",
            "music, rehearsal work, and short contextual introduction",
            "30-80 invited listeners, depending on the room",
            "suitable for a company, private host, gallery, foundation, or cultural space"
          ],
          outputsHeading: "Expected outputs",
          outputItems: [
            "live documented first format",
            "recorded excerpt if the budget allows",
            "photo documentation",
            "archive/project page",
            "short report to supporters",
            "clear next step toward the larger orchestral phase"
          ],
          facts: [
            { label: "Date", value: "to be confirmed" },
            { label: "Venue", value: "to be confirmed" },
            { label: "Programme", value: "to be confirmed" }
          ]
        },
        useOfFunds: {
          heading: "How support will be used",
          intro:
            "The first phase should fund defined artistic work, not vague activity.",
          label: "Indicative use of funds",
          items: [
            "musician fees",
            "rehearsal time",
            "venue or host logistics",
            "audio recording and editing",
            "photo/video documentation",
            "programme note and translation",
            "archive/project page",
            "administration, accounting, and reporting"
          ]
        },
        returnProgramme: {
          heading: "Full orchestra return programme",
          paragraphs: [
            "The larger return phase is conceived as a full string-orchestra programme of 60+ minutes.",
            "This is not a confirmed concert announcement yet. It is a working programme frame for the first substantial orchestral return of 432 Chamber Orchestra.",
            "The programme should make a serious artistic argument: Bulgarian contemporary sound, classical solo form, English string-orchestra discipline, and Bulgarian modern chamber memory brought into the context of a restored string-orchestra body."
          ],
          programmeHeading: "Working programme frame",
          programmeItems: [
            "Gheorghi Arnaoudov — Gates of Dream II",
            "Joseph Haydn — Cello Concerto in C major; soloist to be invited / to be confirmed",
            "Edward Elgar — St Paul’s Suite",
            "Lyubomir Pipkov — String Quartet No. 1; orchestral format / arrangement status to be confirmed"
          ],
          supportHeading: "Support may help fund",
          supportItems: [
            "invitation of a strong soloist",
            "musician fees",
            "rehearsal work",
            "score and arrangement preparation where needed",
            "recording and editing",
            "photo/video documentation",
            "archive/project page",
            "short post-project report"
          ],
          confirmationNote:
            "Final programme, order, duration, venue, date, instrumentation, soloist, rights, and arrangement status remain to be confirmed.",
          archiveNote:
            "Archive note: Gates of Dream II appears in the documented earlier activity of 432 Chamber Orchestra."
        },
        fundingTarget: {
          heading: "Funding target",
          intro:
            "The return should be funded as a defined artistic output, not as a vague appeal.",
          breakdownHeading: "What the professional target includes",
          breakdownItems: [
            "13 instrumentalists",
            "soloist invitation",
            "conductor / artistic preparation",
            "concertmaster and section responsibility",
            "orchestra manager / librarian / production assistant",
            "rehearsal work",
            "venue and production logistics",
            "rights, licensing, scores, and arrangements",
            "professional audio recording, editing, and mastering",
            "multi-camera video documentation",
            "photography",
            "PR strategy and media outreach",
            "design, copywriting, translation, programme note",
            "paid promotion where appropriate",
            "posters, print, and distribution",
            "website/archive page and post-project report",
            "contracts, accounting, administration",
            "contingency"
          ],
          disciplineNote:
            "The project should not be budgeted as “a concert”. It should be budgeted as a documented artistic production: rehearsal, performance, rights, recording, documentation, PR, archive, and reporting.",
          items: [
            {
              title: "Minimum first phase",
              amount: "30,000 EUR",
              description:
                "Covers a lean but professional documented return step, with constrained documentation and limited PR. It should still protect musician fees, core rehearsal work, essential rights/licensing checks, basic recording, archive page, and reporting."
            },
            {
              title: "Professional target",
              amount: "55,000 EUR",
              description:
                "Covers the recommended 60+ minute full string-orchestra return programme with soloist invitation, fair musician fees, rehearsal work, score/arrangement preparation, rights/licensing, professional audio, multi-camera documentation, photography, PR, archive/project page, administration, and reporting."
            },
            {
              title: "Full return phase",
              amount: "90,000 EUR",
              description:
                "Covers a stronger public production with extended documentation, stronger PR/media campaign, higher-level soloist conditions, larger venue conditions, stronger post-production, broader campaign visibility, and stronger institutional reporting."
            }
          ]
        },
        supportLevels: {
          heading: "Indicative support levels",
          items: [
            { title: "Musician Fee Patron", amount: "500–1,000 EUR", description: "Supports fair musician fees and rehearsal work." },
            { title: "Recording Patron", amount: "1,500–3,500 EUR", description: "Supports audio recording, editing, mastering, and archive preparation." },
            { title: "Soloist Invitation Patron", amount: "3,000–5,000 EUR", description: "Supports soloist invitation and conditions; the soloist remains to be confirmed." },
            { title: "Score & Rights Patron", amount: "2,000–4,000 EUR", description: "Supports scores, arrangements, rights, and licensing where needed." },
            { title: "Full Documentation Partner", amount: "7,500–12,000 EUR", description: "Supports professional audio, video documentation, photography, and archive page." },
            { title: "Principal Concert Partner", amount: "15,000–25,000 EUR", description: "Supports a substantial part of production, rehearsals, communication, and documentation." },
            { title: "Founding Return Patron", amount: "50,000–55,000 EUR", description: "Supports the professional target and the recommended 60+ minute full string-orchestra programme." },
            { title: "Full Return Partner", amount: "85,000–90,000 EUR", description: "Supports the full return phase with stronger production, documentation, visibility, and reporting." }
          ],
          ctas: {
            sponsor: "Request a sponsor conversation",
            bank: "Use bank transfer",
            listening: "Join the Listening Circle"
          }
        },
        patronPathway: {
          heading: "For companies and patrons",
          intro:
            "The most useful first step is not a logo placement. It is a serious conversation about a defined cultural result.",
          items: [
            "hosting a first documented step",
            "supporting the first recording",
            "funding musician fees",
            "offering a suitable space",
            "introducing one relevant decision-maker",
            "supporting documentation and archive work"
          ],
          askLabel: "First ask",
          askText: "Open a 20-minute conversation about the first documented step.",
          cta: "Request a sponsor conversation",
          briefCta: "View sponsor brief",
          mailSubject: "Sponsor conversation for the first documented step",
          briefSubject: "Sponsor brief request"
        }
      },
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
        "For companies, hosts, and patrons: the first practical goal is to open serious conversations around a documented first result and the next orchestral phase."
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
      links: [
        { label: "Privacy", href: "/en/privacy/" },
        { label: "Donation policy", href: "/en/donation-policy/" },
        { label: "Press / Media", href: "/en/press/" },
        { label: "Sponsor brief", href: "/en/sponsor-brief/" }
      ],
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

export const campaignLandingContent = {
  bg: {
    lang: "bg" as const,
    alternateLang: "en" as const,
    alternateHref: "/en/first-sound/",
    canonicalHref: "/bg/first-sound/",
    meta: {
      title: "Първият звук отново · 432 Chamber Orchestra",
      description:
        "Влезте в първия слушателски кръг около 432 Chamber Orchestra: независим струнен оркестър със седалище в София, който изгражда записи, архив, документация и следваща стъпка."
    },
    hero: {
      eyebrow: "Кампания · Първият звук отново",
      headline: "Живата музика не трябва да изчезва след една вечер.",
      subheadline:
        "432 Chamber Orchestra изгражда слушателска общност около струнен звук, който оставя следа: записи, партитури, архив, документация и следваща стъпка.",
      primaryCta: "Влезте в слушателския кръг",
      secondaryCta: "Подкрепете първия звук"
    },
    mainCopy: [
      "432 Chamber Orchestra не търси еднократна публика. Той изгражда слушателска общност.",
      "Не концерт за отчет. Не участие за exposure. Не култура като фон.",
      "Оркестърът се завръща чрез дисциплинирана последователност от работни и оркестрови стъпки: слушателски кръг, първи документиран формат, запис, архив, отчет и следваща оркестрова фаза.",
      "Първата форма на подкрепа е вниманието. Влезте в слушателския кръг, ако вярвате, че независимата класическа музика трябва да бъде чута, документирана и съхранена."
    ],
    goal: {
      heading: "Първи слушателски кръг",
      text: "Цел: 100 души, които искат да следят, слушат и подкрепят завръщането на 432 Chamber Orchestra.",
      counterNote: "Броячът ще бъде активиран след свързване на формата."
    },
    form: {
      heading: "Влезте в първия слушателски кръг",
      firstName: "Име",
      lastName: "Фамилия",
      email: "Имейл",
      languagePreference: "Предпочитан език",
      helpType: "Как бихте искали да помогнете?",
      message: "Кратко съобщение",
      privacy:
        "Съгласявам се да получавам имейли от Фондация 432 Херца / 432 Chamber Orchestra относно слушателския кръг, концерти, записи, архив, кампании и възможности за подкрепа. Мога да се отпиша по всяко време.",
      submit: "Влизам в слушателския кръг",
      inactiveNote:
        "Формата за слушателския кръг се свързва. До активирането ѝ пишете на info@432hz-foundation.com с тема „Слушателски кръг“.",
      options: [
        "Само да следя",
        "С време/експертиза",
        "Със средства",
        "С глас/препоръка",
        "Мога да предложа компания, домакин или патрон"
      ]
    },
    afterSignup: {
      heading: "Благодарим. Вече сте част от първия слушателски кръг.",
      copy: "Следващата стъпка е проста: чуйте първия откъс и започнете от слушането.",
      cta: "Чуйте първия звук",
      noAudio: "Първият откъс ще бъде добавен след подготовка на официалния материал."
    }
  },
  en: {
    lang: "en" as const,
    alternateLang: "bg" as const,
    alternateHref: "/bg/first-sound/",
    canonicalHref: "/en/first-sound/",
    meta: {
      title: "The First Sound Again · 432 Chamber Orchestra",
      description:
        "Join the first Listening Circle around 432 Chamber Orchestra: an independent string orchestra based in Sofia, building recordings, archive, documentation, and a next step."
    },
    hero: {
      eyebrow: "Campaign · The First Sound Again",
      headline: "Live music should not disappear after one evening.",
      subheadline:
        "432 Chamber Orchestra is building a listening community around string sound that leaves a trace: recordings, scores, archive, documentation, and a next step.",
      primaryCta: "Join the Listening Circle",
      secondaryCta: "Support the First Sound"
    },
    mainCopy: [
      "432 Chamber Orchestra does not seek a one-time audience. It builds a listening community.",
      "Not a concert for a report. Not performance for exposure. Not culture as background.",
      "The orchestra is returning through a disciplined sequence of working and orchestral steps: listening circle, first documented format, recording, archive, report, and the next orchestral phase.",
      "The first form of support is attention. Join the Listening Circle if you believe independent classical music should be heard, documented, and preserved."
    ],
    goal: {
      heading: "First Listening Circle",
      text: "Goal: 100 people who want to follow, listen to, and support the return of 432 Chamber Orchestra.",
      counterNote: "The counter will be activated after the form is connected."
    },
    form: {
      heading: "Join the First Listening Circle",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      languagePreference: "Preferred language",
      helpType: "How would you like to help?",
      message: "Short message",
      privacy:
        "I agree to receive emails from Foundation 432 Hertz / 432 Chamber Orchestra about the Listening Circle, concerts, recordings, archive, campaigns, and ways to support the work. I can unsubscribe at any time.",
      submit: "Join the Listening Circle",
      inactiveNote:
        "The Listening Circle form is being connected. Until activation, write to info@432hz-foundation.com with “Listening Circle” in the subject.",
      options: [
        "Follow only",
        "Time / Expertise",
        "Money",
        "Voice / Recommendation",
        "I can suggest a company, host, or patron"
      ]
    },
    afterSignup: {
      heading: "Thank you. You are now part of the first Listening Circle.",
      copy: "The next step is simple: hear the first excerpt and begin with listening.",
      cta: "Listen to the First Sound",
      noAudio: "The first excerpt will be added after the official material is prepared."
    }
  }
} as const;

export type CampaignLandingCopy = (typeof campaignLandingContent)[Language];
