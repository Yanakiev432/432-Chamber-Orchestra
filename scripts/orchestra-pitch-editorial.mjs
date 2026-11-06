// Editorial policy: 432 Chamber Orchestra no longer uses "open fifths and fourths"
// as part of its present artistic identity. Historical source snapshots remain untouched.
// Keep this override at the WordPress-to-Astro import boundary to prevent regressions.
const revisions = new Map([
  [78, {
    expected: "/en/about/",
    paragraphs: new Map([
      [0, {
        was: "open fifths",
        now: "432 Chamber Orchestra is a string ensemble of 13 players and a conductor. Founded as an experiment in concert pitch and musical temperament, it retained a¹ = 432 Hz as its reference pitch while leaving intonation to the musicians’ ears, technique and ensemble listening."
      }]
    ])
  }],
  [80, {
    expected: "/bg/относно/",
    paragraphs: new Map([
      [0, {
        was: "отворени квинти",
        now: "Камерен оркестър 432 е струнен ансамбъл от 13 инструменталисти и диригент. Създаден като експеримент с концертния строй и музикалната темперация, той запазва a¹ = 432 Hz като референтна височина, а интонацията се изгражда чрез слуха, майсторството и ансамбловото взаимодействие на музикантите."
      }]
    ])
  }],
  [85, {
    expected: "/en/about/432-chamber-orchestra/",
    paragraphs: new Map([
      [3, {
        was: "open” fifth",
        now: "The orchestra was founded to explore concert pitch and tuning systems. Its lasting musical choice is a¹ = 432 Hz as the reference pitch; intonation and interval relationships are shaped by the musicians through attentive ensemble listening, without a prescribed temperament."
      }],
      [5, {
        was: "open fifths",
        now: "Studio recording of 432 Chamber Orchestra at concert pitch a¹ = 432 Hz — Edvard Grieg, Holberg Suite:"
      }],
      [8, {
        was: "“open fifths”",
        now: "Concert pitch and musical perception became subjects of Ivan Yanakiev's later research at the Institute of Art Studies of the Bulgarian Academy of Sciences. Listening comparisons explored different reference pitches, including a¹ = 432 Hz and a¹ = 440 Hz."
      }]
    ])
  }],
  [87, {
    expected: "/bg/относно/камерен-оркестър-432/",
    paragraphs: new Map([
      [3, {
        was: "отворените квинти",
        now: "Камерен оркестър 432 е създаден като експеримент с концертния строй и музикалната темперация. Впоследствие a¹ = 432 Hz остава постоянният му концертен строй, а интонацията и интервалните отношения се изграждат чрез слуха, майсторството и ансамбловото взаимодействие на инструменталистите, без предварително наложена единна темперация. През 2014 г. акад. Васил Казанджиев отбелязва, че въпреки малкия състав оркестърът звучи като голям струнен оркестър."
      }],
      [4, {
        was: "отворени квинти",
        now: "Студиен запис на Камерен оркестър 432 в концертен строй a¹ = 432 Hz — Едвард Григ, „Холберг сюита“:"
      }],
      [7, {
        was: "„отворени квинти“",
        now: "В по-късните си научни изследвания Иван Янакиев разглежда музикалното възприятие при различни концертни строеве, включително a¹ = 432 Hz и a¹ = 440 Hz. Тези сравнения са част от научната работа и не предполагат единодушно предпочитание към определена референтна височина."
      }]
    ])
  }],
  [93, {
    expected: "/en/about/ivan-yanakiev/",
    paragraphs: new Map([
      [1, {
        was: "“open fifth”",
        now: "Conductor Ivan Yanakiev (born in Sofia in 1987) holds an MA in orchestral conducting from the National Academy of Music in Sofia. He began doctoral research at the Institute of Art Studies of the Bulgarian Academy of Sciences in July 2014. His subsequent research explored concert pitch, musical temperament and the perception of music."
      }]
    ])
  }],
  [95, {
    expected: "/bg/относно/иван-янакиев/",
    paragraphs: new Map([
      [7, {
        was: "отворените квинти",
        now: "От юли 2014 г. до юни 2017 г. Иван Янакиев е редовен докторант в Института за изследване на изкуствата при БАН с научен ръководител проф. д.изк. Милена Божикова. Дисертационното му изследване разглежда концертния строй, музикалните темперации и възприятието на музиката."
      }]
    ])
  }],
  [150, {
    expected: "/bg/относно/ла-432-hz-концертен-строй/",
    paragraphs: new Map([
      [26, {
        was: "темперация с отворени квинти",
        now: "За любознателни\nКонцертният строй определя референтната честота на тона a¹, например a¹ = 432 Hz или a¹ = 440 Hz. Темперацията определя отношенията между тоновете в дадена звукова система. Една и съща темперация може да се използва при различни концертни строеве; изборът на референтна височина сам по себе си не определя темперацията или интонацията на изпълнителите."
      }]
    ])
  }]
]);

export function applyOrchestraEditorial(record) {
  const policy = revisions.get(record.id);
  if (!policy) return record;
  // WordPress post IDs and taxonomy term IDs can overlap. Match both ID and route.
  if (policy.expected !== record.path) return record;
  for (const [index, revision] of policy.paragraphs) {
    const old = record.paragraphs[index];
    if (typeof old !== "string" || !old.includes(revision.was)) {
      throw new Error("ORCHESTRA_EDITORIAL_SOURCE_DRIFT_" + record.id + "_" + index);
    }
    record.paragraphs[index] = revision.now;
  }
  return record;
}

export const revisedOrchestraArchiveRecords = [...revisions].map(([id, revision]) => ({id, path:revision.expected}));
export const revisedOrchestraArchiveParagraphCount = [...revisions.values()]
  .reduce((total, value) => total + value.paragraphs.size, 0);
