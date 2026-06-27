export type PhotoArchiveCategory = "conductor" | "oldQuartet" | "wholeOrchestraConcert";

export type PhotoArchiveItem = {
  filename: string;
  src: string;
  width: number;
  height: number;
  category: PhotoArchiveCategory;
  alt: {
    en: string;
    bg: string;
  };
  caption: {
    en: string;
    bg: string;
  };
};

const conductorText = {
  alt: {
    en: "Conductor of 432 Chamber Orchestra",
    bg: "Диригентът на 432 Chamber Orchestra"
  },
  caption: {
    en: "Conductor of 432 Chamber Orchestra",
    bg: "Диригентът на 432 Chamber Orchestra"
  }
};

const oldQuartetText = {
  alt: {
    en: "Old quartet formation of 432 Chamber Orchestra",
    bg: "Стара квартетна формация на 432 Chamber Orchestra"
  },
  caption: {
    en: "Old quartet formation of 432 Chamber Orchestra",
    bg: "Стара квартетна формация на 432 Chamber Orchestra"
  }
};

const wholeOrchestraText = {
  alt: {
    en: "432 Chamber Orchestra legacy concert photo",
    bg: "Архивна концертна снимка на 432 Chamber Orchestra"
  },
  caption: {
    en: "Legacy concert photo of 432 Chamber Orchestra",
    bg: "Архивна концертна снимка на 432 Chamber Orchestra"
  }
};

const photo = (
  filename: string,
  width: number,
  height: number,
  category: PhotoArchiveCategory,
  text: Pick<PhotoArchiveItem, "alt" | "caption">
): PhotoArchiveItem => ({
  filename,
  src: `/archive/photos/${filename}`,
  width,
  height,
  category,
  alt: text.alt,
  caption: text.caption
});

export const photoArchive: PhotoArchiveItem[] = [
  photo("95909082_2987898917952438_2967887277017006080_n.jpg", 2048, 1365, "wholeOrchestraConcert", wholeOrchestraText),
  photo("655455302_26236839445965057_7444690092106440956_n.jpg", 2048, 1325, "wholeOrchestraConcert", wholeOrchestraText),
  photo("655508192_26236824589299876_5705732827598277532_n.jpg", 780, 478, "wholeOrchestraConcert", wholeOrchestraText),
  photo("656245078_26249685294680472_2006015205848097261_n.jpg", 2048, 1125, "oldQuartet", oldQuartetText),
  photo("656785796_26236839085965093_6169334625520283925_n.jpg", 2048, 1425, "conductor", conductorText),
  photo("656847674_26236839372631731_8365722018291505197_n.jpg", 2048, 1487, "wholeOrchestraConcert", wholeOrchestraText)
];

export const homepagePhotoPreview = photoArchive;

export const photoArchiveCategories: {
  key: PhotoArchiveCategory;
  label: {
    en: string;
    bg: string;
  };
}[] = [
  { key: "conductor", label: { en: "Conductor", bg: "Диригент" } },
  { key: "oldQuartet", label: { en: "Old quartet formation", bg: "Стара квартетна формация" } },
  { key: "wholeOrchestraConcert", label: { en: "Whole orchestra concert", bg: "Концерт на целия оркестър" } }
];

export const photoArchivePageCopy = {
  en: {
    title: "Photo archive",
    intro: [
      "Selected archival photographs from the earlier life of 432 Chamber Orchestra. These images document the conductor, quartet formation, and concert activity of the whole orchestra.",
      "The archive is presented as historical evidence and public memory. It does not replace the need for new documentation in the current restart phase."
    ]
  },
  bg: {
    title: "Фотоархив",
    intro: [
      "Избрани архивни фотографии от предишния живот на 432 Chamber Orchestra. Тези изображения документират диригента, квартетната формация и концертната дейност на целия оркестър.",
      "Архивът е представен като историческо свидетелство и публична памет. Той не заменя нуждата от нова документация в настоящата фаза на завръщане."
    ]
  }
} as const;
