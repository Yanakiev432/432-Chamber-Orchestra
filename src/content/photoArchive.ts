export type PhotoArchiveCategory = "conductor" | "quartet" | "orchestraConcert";

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

const quartetText = {
  alt: {
    en: "Quartet",
    bg: "Квартет"
  },
  caption: {
    en: "Quartet",
    bg: "Квартет"
  }
};

const orchestraConcertText = {
  alt: {
    en: "Orchestra concert",
    bg: "Концерт на оркестъра"
  },
  caption: {
    en: "Orchestra concert",
    bg: "Концерт на оркестъра"
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

const galleryPhoto = (
  filename: string,
  width: number,
  height: number,
  category: PhotoArchiveCategory,
  text: Pick<PhotoArchiveItem, "alt" | "caption">
): PhotoArchiveItem => ({
  ...photo(filename, width, height, category, text),
  src: "/orchestra/photos/" + filename
});
export const photoArchive: PhotoArchiveItem[] = [
  photo("95909082_2987898917952438_2967887277017006080_n.jpg", 2048, 1365, "orchestraConcert", orchestraConcertText),
  photo("655455302_26236839445965057_7444690092106440956_n.jpg", 2048, 1325, "orchestraConcert", orchestraConcertText),
  photo("655508192_26236824589299876_5705732827598277532_n.jpg", 780, 478, "orchestraConcert", orchestraConcertText),
  photo("656245078_26249685294680472_2006015205848097261_n.jpg", 2048, 1125, "quartet", quartetText),
  photo("656785796_26236839085965093_6169334625520283925_n.jpg", 2048, 1425, "conductor", conductorText),
  photo("656847674_26236839372631731_8365722018291505197_n.jpg", 2048, 1487, "orchestraConcert", orchestraConcertText),
  galleryPhoto("cropped-VBAL6560-1.jpg", 1800, 1080, "orchestraConcert", orchestraConcertText),
  galleryPhoto("VBAL6537-1.jpg", 1800, 1200, "orchestraConcert", orchestraConcertText),
  galleryPhoto("VBAL6538-1.jpg", 1800, 1200, "conductor", conductorText),
  galleryPhoto("VBAL6569.jpg", 1800, 1181, "quartet", quartetText),
  galleryPhoto("VBAL6572.jpg", 1800, 1200, "orchestraConcert", orchestraConcertText),
  galleryPhoto("VBAL6574.jpg", 1800, 1200, "orchestraConcert", orchestraConcertText),
  galleryPhoto("VBAL6575.jpg", 1800, 1200, "orchestraConcert", orchestraConcertText),
  galleryPhoto("VBAL6581.jpg", 1800, 1200, "conductor", conductorText),
];

export const homepagePhotoPreview = photoArchive.filter((photo) => photo.src.startsWith("/orchestra/photos/")).slice(0, 8);

export const photoArchiveCategories: {
  key: PhotoArchiveCategory;
  label: {
    en: string;
    bg: string;
  };
}[] = [
  { key: "conductor", label: { en: "Conductor", bg: "Диригент" } },
  { key: "quartet", label: { en: "Quartet", bg: "Квартет" } },
  { key: "orchestraConcert", label: { en: "Orchestra concert", bg: "Концерт на оркестъра" } }
];

export const photoArchivePageCopy = {
  en: {
    title: "Photo archive",
    intro: [
      "Selected photographs from the 432 Chamber Orchestra archive: conductor, quartet and orchestra concert.",
      "Concert photographs from the orchestra's archive document its musical activity."
    ]
  },
  bg: {
    title: "Фотоархив",
    intro: [
      "Подбрани фотографии от архива на 432 Chamber Orchestra: диригент, квартет и концерт на оркестъра.",
      "Концертните фотографии са част от архива на оркестъра и свидетелстват за неговата дейност."
    ]
  }
} as const;
