export const mediaArchiveCopy = {
  bg: {
    eyebrow: "Архив",
    heading: "Слушайте архива",
    intro: [
      "Завръщането не започва от нищото. 432 Chamber Orchestra има архивни записи, репетиционни откъси, квартетни записи и документирани репертоарни следи.",
      "Тези материали са представени като архивно свидетелство: не като завършен актуален каталог, а като доказателство за предишна работа и мост към първия нов документиран резултат."
    ],
    soundcloudHeading: "SoundCloud слушателски архив",
    soundcloudText: [
      "Основният архив за слушане е в SoundCloud. Той включва сравнителните материали A=440 / A=432, Холберг сюитата, записи от концерти и репетиционни откъси от предишния живот на 432 Chamber Orchestra.",
      "Тези записи са представени като архивно свидетелство: начин да се чуе предишната работа на оркестъра преди първия нов документиран резултат."
    ],
    bandcampHeading: "Bandcamp архив и покупки",
    bandcampText:
      "Bandcamp архивът запазва избрани издания като албумни страници. Когато е налично, Bandcamp позволява на слушателите да подкрепят архива чрез покупка на записи.",
    photosHeading: "Архивни снимки",
    photosText:
      "Избрани архивни фотографии от предишната дейност на 432 Chamber Orchestra. Тези изображения подкрепят доверието и паметта, без да заменят нуждата от нова документация.",
    viewFullPhotoArchive: "Вижте пълния фотоархив",
    openBandcamp: "Отворете Bandcamp архива",
    openSoundCloud: "Отворете SoundCloud архива",
    listenOnBandcamp: "Слушайте в Bandcamp",
    listenOnSoundCloud: "Слушайте в SoundCloud",
    sourceLabel: "Източник",
    featuredLabel: "Водещ Bandcamp запис",
    comparisonTitle: "Сравнение за слушане: A=440 / A=432",
    comparisonNote:
      "Това сравнение е представено като архивна слушателска референция. То не представлява научно, медицинско, терапевтично или лечебно твърдение.",
    holbergLabel: "Водещ архивен запис",
    holbergHeading: "Водещ архивен запис: Холберг сюита",
    holbergText:
      "Suite Aus Holberg's Zeit, Op. 40 от Едвард Григ е централният водещ запис в SoundCloud архива. Той дава на посетителите пряк пример за дисциплинирания струнен звук и историческата репертоарна работа на оркестъра."
  },
  en: {
    eyebrow: "Archive",
    heading: "Listen to the archive",
    intro: [
      "The restart does not begin from nothing. 432 Chamber Orchestra has legacy recordings, rehearsal excerpts, quartet recordings, and documented repertoire traces.",
      "These materials are presented as archive evidence: not as a finished current catalogue, but as proof of previous work and as a bridge toward the first new documented output."
    ],
    soundcloudHeading: "SoundCloud listening archive",
    soundcloudText: [
      "The primary listening archive is on SoundCloud. It includes the A=440 / A=432 comparison material, the Holberg Suite, concert recordings, and rehearsal excerpts from the earlier life of 432 Chamber Orchestra.",
      "These recordings are presented as legacy evidence: a way to hear the orchestra's previous work before the first new documented output."
    ],
    bandcampHeading: "Bandcamp archive and purchases",
    bandcampText:
      "The Bandcamp archive preserves selected releases as album pages. Where available, Bandcamp also allows listeners to support the archive by purchasing recordings.",
    photosHeading: "Legacy photo archive",
    photosText:
      "Selected archival photographs from previous activity of 432 Chamber Orchestra. These images should support credibility and memory without replacing the need for new documentation.",
    viewFullPhotoArchive: "View full photo archive",
    openBandcamp: "Open full Bandcamp archive",
    openSoundCloud: "Open SoundCloud archive",
    listenOnBandcamp: "Listen on Bandcamp",
    listenOnSoundCloud: "Listen on SoundCloud",
    sourceLabel: "Source",
    featuredLabel: "Featured Bandcamp recording",
    comparisonTitle: "A=440 / A=432 listening comparison",
    comparisonNote:
      "This comparison is presented as an archive listening reference. It is not a scientific, medical, therapeutic, or healing claim.",
    holbergLabel: "Featured legacy recording",
    holbergHeading: "Featured legacy recording: Holberg Suite",
    holbergText:
      "Edvard Grieg's Suite Aus Holberg's Zeit, Op. 40 is the central featured recording in the SoundCloud archive. It gives visitors a direct example of the orchestra's disciplined string sound and historical repertoire work."
  }
} as const;

export const audioArchive = {
  bandcampProfile: "https://432orchestra.bandcamp.com/",
  soundcloudProfile: "https://soundcloud.com/ivan-yanakiev",
  soundcloud: {
    profileUrl: "https://soundcloud.com/ivan-yanakiev",
    featured: {
      title: "Edvard Grieg - Suite Aus Holberg's Zeit, Op. 40",
      titleBg: "Едвард Григ - Suite Aus Holberg's Zeit, Op. 40",
      label: "Featured legacy recording",
      labelBg: "Водещ архивен запис",
      type: "playlist",
      url: "https://soundcloud.com/ivan-yanakiev/sets/grieg-edward-suite-aus-holbergs-zeit-op-40-432-chamber-orchestra-yanakiev"
    },
    comparison: {
      title: "A=440 / A=432 listening comparison",
      titleBg: "Сравнение за слушане: A=440 / A=432",
      type: "playlist",
      url: "https://soundcloud.com/ivan-yanakiev/sets/440-vs-432-432-research-project",
      note: {
        en: "This comparison is presented as an archive listening reference. It is not a scientific, medical, therapeutic, or healing claim.",
        bg: "Това сравнение е представено като архивна слушателска референция. То не представлява научно, медицинско, терапевтично или лечебно твърдение."
      }
    }
  },
  featuredBandcamp: {
    title: "Wolfgang Amadeus Mozart - Six Notturni (Canzonetti)",
    url: "https://432orchestra.bandcamp.com/album/wolfgang-amadeus-mozart-six-notturni-canzonetti",
    type: "album",
    year: "2019",
    releaseDate: "December 11, 2019",
    description: "Wolfgang Amadeus Mozart - Sechs Canzonetti (Notturni). Arrangement for string trio and trio singers.",
    credits: "432 Chamber Orchestra Trio; Stefani Krasteva - Sopran; Elitsa Zheleva - Soprano; Valentin Ivanov - Tenor; Ivan K. Yanakiev - Conductor.",
    tracks: [
      { title: "Wolfgang Amadeus Mozart - Sechs Notturni - 1. Due pupille amabili", duration: "01:07" },
      { title: "Wolfgang Amadeus Mozart - Sechs Notturni - 2. Se lontan ben mio tu sei", duration: "01:29" },
      { title: "Wolfgang Amadeus Mozart - Sechs Notturni - 3. Ecco quel fiero", duration: "01:47" },
      { title: "Wolfgang Amadeus Mozart - Sechs Notturni - 4. Mi lagnero tacendo", duration: "03:10" },
      { title: "Wolfgang Amadeus Mozart - Sechs Notturni - 5. Piu non si trovano", duration: "02:40" },
      { title: "Wolfgang Amadeus Mozart - Sechs Notturni - 6. Luci care, luci belle", duration: "01:37" }
    ]
  },
  bandcamp: [
    {
      title: "432 Hz Quartet Music part 2",
      url: "https://432orchestra.bandcamp.com/album/432-hz-quartet-music-part-2",
      type: "album",
      year: "2019",
      description: "Legacy quartet archive recording."
    },
    {
      title: "Have yourself a 432 Hz Christmas - Live Concert",
      url: "https://432orchestra.bandcamp.com/album/have-yourself-a-432-hz-christmas-live-concert",
      type: "album",
      year: "2018",
      description: "Legacy live concert archive release."
    },
    {
      title: "W. A. Mozart - Divertimento in D dur KV 136 - Recording from rehearsal",
      url: "https://432orchestra.bandcamp.com/album/432-chamber-orchestra-w-a-mozart-divertimento-in-d-dur-kv-136-yanakiev-recording-from-rehearsal",
      type: "album",
      year: "2017",
      description: "Legacy rehearsal recording."
    },
    {
      title: "Antonio Vivaldi - Concerto Alla Rustica in G RV 151 - Recording from rehearsal",
      url: "https://432orchestra.bandcamp.com/album/432-chamber-orchestra-antonio-vivaldi-concerto-alla-ristica-in-g-rv-151-432-hz-yanakiev-recording-from-rehearsal",
      type: "album",
      year: "2017",
      description: "Legacy rehearsal recording."
    },
    {
      title: "J. S. Bach - Air, Orchestral Suite No. 3",
      url: "https://432orchestra.bandcamp.com/track/j-s-bach-2-air-orchestral-suite-no-3-432-hz",
      type: "track",
      year: "2016",
      description: "Legacy archive track."
    }
  ]
} as const;
