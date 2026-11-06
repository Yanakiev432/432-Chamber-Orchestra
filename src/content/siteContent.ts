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
        "Камерен оркестър 432 — история, репертоар, концертни записи и изследвания върху музикалния строй. Независим струнен състав от София."
    },
    nav: [
      { label: "Оркестър", href: sharedAnchors.orchestra },
      { label: "История", href: "/bg/относно/камерен-оркестър-432/" },
      { label: "Снимки", href: "/bg/archive/" },
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
        "Камерен оркестър 432 изпълнява струнния репертоар в концертен строй a¹ = 432 Hz. Със звученето си представяме акустичните особености на този строй и даваме възможност на слушателите да открият как възприемат и преживяват музиката при него. Елате и чуйте сами.",
      positioning: ["Камерна прецизност", "Историческа осведоменост", "Внимание към звученето"],
      finalLine:
        "Концерти, звукозаписи и архивни свидетелства за последователно музикално търсене.",
      primaryCta: "Присъединете се към слушателската общност",
      secondaryCta: "Подкрепете първия звук",
      campaignLabel: "Кампания: Първият звук отново"
    },
    core: {
      id: "orchestra",
      eyebrow: "История",
      heading: "История на оркестъра",
      paragraphs: [
        "Камерен оркестър 432 възниква в София като независим струнен състав. Още в първите години от дейността му концертният строй a¹ = 432 Hz е предмет на изпълнителски опити, свързани с интерпретацията на музикални произведения.",
        "На 18 май 2015 г. съставът изнася дебютния си концерт в Първо студио на Българското национално радио. Следва отличието в категория „Дебют“ на „Музикант на годината 2015“. На 13 юли 2017 г. в Големия салон на БАН е представена програмата „Български съвременници в 432 Hz“, за която Милена Божикова публикува рецензия във вестник „Дума“.",
        "Защитената през 2020 г. дисертация на Иван Янакиев разглежда впоследствие част от натрупания опит в по-широка научна перспектива: история на концертния строй, модели на музикални темперации и изследвания на слуховото възприятие. Оркестровата дейност предхожда този труд и не произтича от него.",
        "Концертните програми, рецензиите, фотографиите и записите образуват документалния архив на състава."
      ]
    },
    firstOutput: {
      id: "first-documented-output",
      eyebrow: "Първа фаза",
      heading: "Следващият концертен етап",
      paragraphs: [
        "Подготвя се камерна програма като начало на следващия концертен период. Изпълнението и съпътстващите го материали ще бъдат представени след потвърждаване на програмата и организационните условия."
      ],
      items: [
        "камерно изпълнение",
        "записан откъс",
        "публична архивна страница",
        "кратък отчет",
        "подготовка на следваща програма за разширен състав"
      ]
    },
    vision: {
      id: "vision",
      eyebrow: "Визия",
      heading: "Художествени перспективи",
      paragraphs: [
        "Камерен оркестър 432 работи за продължителното присъствие на независим струнен състав в музикалния живот на София.",
        "В основата на художествения му подход стоят вниманието към партитурата, съотношението между отделните гласове и нюансите на ансамбловото звучене. Камерният състав позволява непосредствен диалог между изпълнителите и прозрачност на музикалната фактура.",
        "Предвиждат се програми от класическия и съвременния струнен репертоар, нови версии на вокални и хорови произведения за струнен състав, както и сътрудничество с композитори. Записите и архивната документация са съществена част от тази работа."
      ]
    },
    mission: {
      id: "mission",
      eyebrow: "Мисия",
      heading: "Изпълнителска дейност",
      paragraphs: [
        "Дейността на оркестъра обхваща подготовката и изпълнението на произведения за струнен оркестър и камерни ансамбли, създаването на записи и съхраняването на концертна документация.",
        "Важна част от замисъла е приемствеността между отделните програми: интерпретационният опит от едно изпълнение да намира продължение в следващото.",
        "Когато е възможно, концертите се съпровождат от звукозапис, програмни бележки, партитури или обработки и достъпни архивни материали."
      ],
      directions: [
        "Класически струнно-оркестров репертоар",
        "Музикална памет и пренебрегван репертоар",
        "Струнни обработки на вокална и хорова музика",
        "Източноправославна певческа традиция и камерна интерпретация",
        "Нова музика и млади автори",
        "Запис и публичен архив"
      ],
      closing: [
        "Оркестърът поддържа връзка с публиката и извън концертната зала чрез записи, архив и срещи, посветени на музиката.",
        "В центъра на тази дейност остават музикалното произведение и отговорността към неговото изпълнение."
      ]
    },
    listening: {
      id: "listening-circle",
      eyebrow: "Слушателска общност",
      heading: "Слушане и музикален диалог",
      paragraphs: [
        "Контактът с публиката е естествено продължение на концертната дейност.",
        "Програмните бележки, историческият контекст и възможността за повторно слушане на записи предлагат различни пътища към по-задълбочено познаване на репертоара.",
        "Предвиждат се камерни срещи с музика, представяния на произведения и разговори за интерпретацията, съпътствани от подбрани записи и архивни материали.",
        "Тези форми допълват непосредственото възприятие на музиката, без да го заместват."
      ]
    },
    founder: {
      id: "founder",
      eyebrow: "Хора",
      heading: "Основател",
      role: "Founder",
      name: "Иван Янакиев",
      photo: {
        src: "/archive/photos/656785796_26236839085965093_6169334625520283925_n.jpg",
        width: 2048,
        height: 1425,
        alt: "Диригентът на 432 Chamber Orchestra"
      },
      paragraphs: [
        "Иван Янакиев е основател на 432 Chamber Orchestra.",
        "Диригентската му работа е свързана с интерпретацията на струнния репертоар и с акустичните и музикално-теоретичните въпроси, които възникват в изпълнителската практика.",
        "Работи в Института по механика на БАН. Научните му занимания са свързани с музикалната теория и изследването на музикалния звук; през 2020 г. защитава дисертация за концертния строй, музикалните темперации и възприятието на музиката.",
        "Оркестърът е създаден преди защитата на дисертацията. Неговата история е засвидетелствана от концертни програми, записи и публикации от предходните години."
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
        "„Първият звук отново“ е инициатива в подкрепа на следващия концертен период на Камерен оркестър 432.",
        "Инициативата предвижда подготовка на камерно представяне, звукозаписна документация и публикуване на материалите в архива на оркестъра.",
        "Поканата е отправена към слушатели, културни институции и частни дарители.",
        "Подкрепата може да бъде финансова, организационна или професионална.",
        "Първата практическа цел е да се отворят първите три сериозни разговора с компании, домакини или патрони, които биха могли да подкрепят първата документирана стъпка и следващата оркестрова фаза.",
        "Конкретната програма и датите ще бъдат обявени след тяхното потвърждаване."
      ]
    },
    allyWays: {
      id: "ally-ways",
      eyebrow: "Съюзници",
      heading: "Три начина да помогнете",
      intro:
        "За осъществяването на следващите проекти са необходими сътрудничество, организационна подкрепа и средства.",
      cards: [
        {
          title: "Професионално съдействие",
          description:
            "Търси се съдействие за звукозапис, фотография, комуникация, превод, организация на събития, правни и счетоводни въпроси и връзки с културни партньори.",
          cta: "Предложете експертиза",
          href: "#support"
        },
        {
          title: "Дарителска подкрепа",
          description:
            "Даренията могат да подпомогнат репетициите, музикантските възнаграждения, изработването на обработки, звукозаписа и съхраняването на архива.",
          cta: "Подкрепете първия звук",
          href: "#support"
        },
        {
          title: "Съдействие за партньорства",
          description:
            "Съдействие за установяване на контакт с концертни зали, институции и потенциални партньори.",
          cta: "Препратете проекта",
          href: "mailto:info@432hz-foundation.com"
        }
      ]
    },
    artisticIdentity: {
      id: "artistic-identity",
      eyebrow: "Акустична концепция",
      heading: "Концертен строй, темперация и интонация",
      paragraphs: [
        "Първоначалната експериментална идея на оркестъра включва концертния строй и музикалната темперация. С развитието на художествената концепция a¹ = 432 Hz остава постоянният концертен строй на състава.",
        "Интонацията и интервалните отношения се изграждат чрез слуха, майсторството и ансамбловото взаимодействие на инструменталистите, без предварително наложена единна темперация. Научната работа от 2020 г. разглежда тези въпроси отделно от изпълнителската практика на оркестъра.",
        "Участниците в някои експерименти описват осезаеми различия между a¹ = 432 Hz и a¹ = 440 Hz, но не показват единодушно предпочитание."
      ],
      disclaimer: "Не се твърдят универсални медицински, терапевтични или лечебни свойства на 432 Hz."
    },
    programs: {
      id: "programs",
      eyebrow: "Програми",
      heading: "Художествени направления",
      intro:
        "Представените направления очертават бъдещата работа на състава. Конкретните програми и дати ще се публикуват след потвърждение.",
      cards: [
        { title: "Слушателски кръг", description: "Общност около внимателно слушане, контекст, разговори и следване на работата във времето." },
        { title: "Камерен preview формат", description: "Камерна програма с ограничен състав, подходяща за концертно представяне и запис." },
        { title: "Запис и архив", description: "Документиране на работата чрез записи, партитури, бележки и публични архивни страници." },
        { title: "Оркестрово завръщане", description: "Подготовка на програма за пълен струнно-оркестров състав." },
        { title: "Корпоративни и патронски формати", description: "Партньорства с културни организации и дарители в подкрепа на концертната дейност." }
      ]
    },
    archive: {
      id: "archive",
      eyebrow: "Концерти / Архив",
      heading: "Концертен архив",
      paragraphs: [
        "Архивът ще събира минали и бъдещи концерти, програми, записи, фотографии, партитури, отчети и проектни страници.",
        "Тук се представят и съхраняват свидетелства за изпълнителската история на оркестъра."
      ]
    },
    support: {
      id: "support",
      eyebrow: "Подкрепа",
      heading: "Присъединете се към слушателската общност",
      intro:
        "Можете да получавате известия за предстоящи програми и нови записи или да се свържете с фондацията във връзка с подкрепа за нейната дейност.",
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
            "Предвижда се камерно представяне, придружено от звукозаписна и фотографска документация. Програмата, датата и мястото предстои да бъдат уточнени.",
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
            "Средствата се предвиждат за подготовката, изпълнението и документирането на концертната програма.",
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
          heading: "Концерт на оркестъра",
          paragraphs: [
            "Предвижда се концерт на оркестъра с програма с продължителност над 60 минути.",
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
            "Представените суми са ориентировъчни бюджети за различен мащаб на концертна и звукозаписна дейност.",
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
            "Бюджетът включва не само публичното изпълнение, но и репетиции, музикантски хонорари, права, записи, архивиране и отчетност.",
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
                "Покрива предвидения концерт на оркестъра с програма над 60 минути с покана към солист, коректни музикантски хонорари, репетиционна работа, подготовка на партитури/обработки, права/лицензиране, професионален аудиозапис, multi-camera документация, фотография, PR, архивна/проектна страница, администрация и отчетност."
            },
            {
              title: "Разширен концертен проект",
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
            { title: "Основен патрон на завръщането", amount: "50 000–55 000 EUR", description: "Подкрепя професионалната цел и предвидения концерт на оркестъра с програма над 60 минути." },
            { title: "Партньор на разширения концертен проект", amount: "85 000–90 000 EUR", description: "Подкрепя разширения концертен проект с по-силна продукция, документация, видимост и отчетност." }
          ],
          ctas: {
            sponsor: "Заявете разговор за партньорство",
            bank: "Използвайте банков превод",
            listening: "Присъединете се към слушателската общност"
          }
        },
        patronPathway: {
          heading: "За компании и патрони",
          intro:
            "Партньорствата се обсъждат според художествената програма, необходимите ресурси и възможностите за съдействие.",
          items: [
            "домакинство на първа документирана стъпка",
            "подкрепа за първия запис",
            "финансиране на музикантски хонорари",
            "предоставяне на подходящо пространство",
            "свързване с един релевантен човек, който взема решения",
            "подкрепа за документация и архив"
          ],
          askLabel: "Първа конкретна молба",
          askText: "Свържете се с фондацията за обсъждане на възможно партньорство.",
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
        "Фондацията приема предложения за подкрепа на предстоящи концертни програми, записи и архивни дейности."
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
      motto: "Независим · Изискан · Разпознаваем"
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
        "432 Chamber Orchestra, Sofia: its history, repertoire, concert recordings and research into musical pitch and tuning."
    },
    nav: [
      { label: "Orchestra", href: sharedAnchors.orchestra },
      { label: "History", href: "/en/about/432-chamber-orchestra/" },
      { label: "Photos", href: "/en/archive/" },
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
        "432 Chamber Orchestra performs the string repertoire at concert pitch a¹ = 432 Hz. Through our performances, we present the acoustic characteristics of this pitch and invite listeners to discover how they hear and experience the music. Come and listen for yourself.",
      positioning: ["Chamber precision", "Historical perspective", "Attentive musicianship"],
      finalLine:
        "Concerts, recordings and archival testimony to a sustained musical enquiry.",
      primaryCta: "Join the listening community",
      secondaryCta: "Support the First Sound",
      campaignLabel: "Campaign: The First Sound Again"
    },
    core: {
      id: "orchestra",
      eyebrow: "History",
      heading: "History of the orchestra",
      paragraphs: [
        "432 Chamber Orchestra was established in Sofia as an independent string ensemble. From its early years, the musicians explored the concert pitch a¹ = 432 Hz through the interpretation of individual musical works.",
        "The ensemble made its debut on 18 May 2015 in Studio 1 of Bulgarian National Radio and subsequently received the Debut distinction at Musician of the Year 2015. On 13 July 2017, it presented Bulgarian Contemporaries at 432 Hz in the Great Hall of the Bulgarian Academy of Sciences; the concert was reviewed by Milena Bozhikova in Duma.",
        "Ivan Yanakiev's dissertation, defended in 2020, subsequently placed aspects of this experience in a broader scholarly context: the history of concert pitch, models of musical temperament, and studies of auditory perception. The orchestra's activity preceded the dissertation and did not arise from it.",
        "Concert programmes, reviews, photographs and recordings constitute the documentary record of the ensemble."
      ]
    },
    firstOutput: {
      id: "first-documented-output",
      eyebrow: "First phase",
      heading: "The next concert programme",
      paragraphs: [
        "A new chamber programme is in preparation as the opening stage of the ensemble's next concert period. Performance and accompanying documentation will be presented once the programme and arrangements are confirmed."
      ],
      items: [
        "a chamber performance",
        "a recorded excerpt",
        "a public archive page",
        "a short report",
        "preparation of a subsequent programme for an expanded ensemble"
      ]
    },
    vision: {
      id: "vision",
      eyebrow: "Vision",
      heading: "Artistic perspectives",
      paragraphs: [
        "432 Chamber Orchestra is committed to the continued presence of an independent string ensemble in Sofia's musical life.",
        "Its artistic approach rests upon fidelity to the score, the relationships among instrumental lines, and the finer distinctions of ensemble sonority. Chamber forces allow for direct exchange among musicians and particular clarity of texture.",
        "Future work envisages programmes drawn from the classical and contemporary string repertoire, new arrangements of vocal and choral music, and collaborations with composers. Recordings and archival documentation form an integral part of this activity."
      ]
    },
    mission: {
      id: "mission",
      eyebrow: "Mission",
      heading: "Performance and repertoire",
      paragraphs: [
        "The orchestra's work encompasses the preparation and performance of music for string orchestra and smaller ensembles, together with recordings and the preservation of concert materials.",
        "Continuity between programmes is an important part of this conception: interpretative insights developed in one performance may inform those that follow.",
        "Where practicable, performances are accompanied by recordings, programme notes, scores or arrangements, and accessible archival materials."
      ],
      directions: [
        "Classical string-orchestra repertoire",
        "Musical memory and neglected repertoire",
        "String arrangements of vocal and choral music",
        "Eastern Orthodox chant and chamber interpretation",
        "New music and young authors",
        "Recording and public archive"
      ],
      closing: [
        "The orchestra remains in contact with its audience beyond the concert hall through recordings, archival materials and musical discussions.",
        "The musical work and the responsibility of its interpretation remain at the heart of this activity."
      ]
    },
    listening: {
      id: "listening-circle",
      eyebrow: "Listening Community",
      heading: "Listening and musical dialogue",
      paragraphs: [
        "Engagement with listeners is a natural continuation of the orchestra's concert life.",
        "Programme notes, historical context and opportunities to revisit recordings offer different approaches to a closer understanding of the repertoire.",
        "Chamber performances, introductions to works and discussions of interpretation are envisaged, supported by selected recordings and archival materials.",
        "These activities are intended to complement, rather than displace, the immediate experience of music."
      ]
    },
    founder: {
      id: "founder",
      eyebrow: "People",
      heading: "Founder",
      role: "Founder",
      name: "Ivan Yanakiev",
      photo: {
        src: "/archive/photos/656785796_26236839085965093_6169334625520283925_n.jpg",
        width: 2048,
        height: 1425,
        alt: "Conductor of 432 Chamber Orchestra"
      },
      paragraphs: [
        "Ivan Yanakiev is the founder of 432 Chamber Orchestra.",
        "His conducting centres on the interpretation of string repertoire and on the acoustic and theoretical questions arising from musical performance.",
        "He works at the Institute of Mechanics of the Bulgarian Academy of Sciences. His research addresses music theory and musical acoustics; in 2020 he defended a dissertation on concert pitch, musical temperament and music perception.",
        "The orchestra was founded before the dissertation was completed. Its earlier history is documented through concert programmes, recordings and contemporary publications."
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
        "The First Sound Again is an initiative supporting the next concert period of 432 Chamber Orchestra.",
        "The initiative envisages the preparation of a chamber performance, its audio documentation and the publication of related materials in the orchestra's archive.",
        "The invitation extends to listeners, cultural institutions and private supporters.",
        "Support may take the form of financial, organisational or professional assistance.",
        "The first practical goal is to open the first three serious conversations with companies, hosts, or patrons who could support the first documented step and the next orchestral phase.",
        "Programme details and dates will be published when confirmed."
      ]
    },
    allyWays: {
      id: "ally-ways",
      eyebrow: "Allies",
      heading: "Three ways to help",
      intro:
        "The preparation of future projects calls for collaboration, organisational assistance and financial support.",
      cards: [
        {
          title: "Professional assistance",
          description:
            "Assistance is welcome with sound recording, photography, communications, translation, event organisation, legal and accounting matters, and introductions to cultural partners.",
          cta: "Offer expertise",
          href: "#support"
        },
        {
          title: "Donations",
          description:
            "Donations may assist with rehearsals, musicians' remuneration, new arrangements, recordings and the preservation of the archive.",
          cta: "Support the First Sound",
          href: "#support"
        },
        {
          title: "Partnership introductions",
          description:
            "Introductions to concert venues, institutions and prospective partners are welcome.",
          cta: "Forward the project",
          href: "mailto:info@432hz-foundation.com"
        }
      ]
    },
    artisticIdentity: {
      id: "artistic-identity",
      eyebrow: "Acoustic concept",
      heading: "Concert pitch, temperament and intonation",
      paragraphs: [
        "The orchestra began as an experiment in concert pitch and musical temperament. As its artistic approach developed, a¹ = 432 Hz remained its consistent reference pitch.",
        "Intonation and interval relationships are shaped by the musicians’ ears, technique and ensemble listening, rather than by a single prescribed temperament. The 2020 research examines related questions separately from the orchestra’s performance practice.",
        "Participants in some experiments reported perceptible differences between a¹ = 432 Hz and a¹ = 440 Hz, but not a unanimous preference."
      ],
      disclaimer: "No universal medical, therapeutic or healing properties of 432 Hz are claimed."
    },
    programs: {
      id: "programs",
      eyebrow: "Programs",
      heading: "Artistic directions",
      intro:
        "These directions describe the ensemble's intended work. Specific programmes and dates will be published once confirmed.",
      cards: [
        { title: "Listening Circle", description: "A community around attentive listening, context, conversation, and following the work over time." },
        { title: "Chamber Preview", description: "A chamber programme for a smaller ensemble, suitable for concert performance and recording." },
        { title: "Recording & Archive", description: "Documenting the work through recordings, scores, notes, and public archive pages." },
        { title: "Orchestra concert", description: "Preparation of a concert programme for the orchestra." },
        { title: "Corporate and Patron Formats", description: "Partnerships with cultural organisations and supporters of concert activity." }
      ]
    },
    archive: {
      id: "archive",
      eyebrow: "Concerts / Archive",
      heading: "Concert archive",
      paragraphs: [
        "The archive will collect past and future concerts, programmes, recordings, photographs, scores, reports, and project pages.",
        "This archive preserves and presents material documenting the orchestra's performing history."
      ]
    },
    support: {
      id: "support",
      eyebrow: "Support",
      heading: "Join the listening community",
      intro:
        "Visitors may receive information about forthcoming programmes and recordings, or contact the foundation regarding support for its activities.",
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
          "Join the listening community",
          "Professional assistance",
          "Donations",
          "Partnership introductions",
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
            "Funds are intended for the preparation, performance and documentation of the concert programme.",
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
          heading: "Orchestra concert",
          paragraphs: [
            "An orchestra concert with a programme lasting more than 60 minutes is envisaged.",
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
                "Covers the proposed orchestra concert programme of more than 60 minutes with soloist invitation, fair musician fees, rehearsal work, score/arrangement preparation, rights/licensing, professional audio, multi-camera documentation, photography, PR, archive/project page, administration, and reporting."
            },
            {
              title: "Extended concert project",
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
            { title: "Founding Return Patron", amount: "50,000–55,000 EUR", description: "Supports the professional target and the proposed orchestra concert programme of more than 60 minutes." },
            { title: "Extended Concert Partner", amount: "85,000–90,000 EUR", description: "Supports the extended concert project with stronger production, documentation, visibility, and reporting." }
          ],
          ctas: {
            sponsor: "Request a sponsor conversation",
            bank: "Use bank transfer",
            listening: "Join the listening community"
          }
        },
        patronPathway: {
          heading: "For companies and patrons",
          intro:
            "Partnerships are considered in relation to the artistic programme, required resources and the forms of support available.",
          items: [
            "hosting a first documented step",
            "supporting the first recording",
            "funding musician fees",
            "offering a suitable space",
            "introducing one relevant decision-maker",
            "supporting documentation and archive work"
          ],
          askLabel: "First ask",
          askText: "Contact the foundation to discuss a possible partnership.",
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
      motto: "Independent · Refined · Remarkable"
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
      primaryCta: "Присъединете се към слушателската общност",
      secondaryCta: "Подкрепете първия звук"
    },
    mainCopy: [
      "Оркестърът поддържа връзка с публиката и извън концертната зала чрез записи, архив и срещи, посветени на музиката.",
      "Камерна прецизност Историческа осведоменост Внимание към звученето",
      "Оркестърът се завръща чрез дисциплинирана последователност от работни и оркестрови стъпки: слушателски кръг, първи документиран формат, запис, архив, отчет и следваща оркестрова фаза.",
      "Първата форма на подкрепа е вниманието. Присъединете се към слушателската общност, ако вярвате, че независимата класическа музика трябва да бъде чута, документирана и съхранена."
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
      primaryCta: "Join the listening community",
      secondaryCta: "Support the First Sound"
    },
    mainCopy: [
      "The orchestra remains in contact with its audience beyond the concert hall through recordings, archival materials and musical discussions.",
      "Chamber precision Historical perspective Attentive musicianship",
      "The orchestra is returning through a disciplined sequence of working and orchestral steps: listening circle, first documented format, recording, archive, report, and the next orchestral phase.",
      "The first form of support is attention. Join the listening community if you believe independent classical music should be heard, documented, and preserved."
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
      submit: "Join the listening community",
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
