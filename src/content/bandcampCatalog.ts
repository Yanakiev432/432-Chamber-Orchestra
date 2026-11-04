// Public catalogue checked against the artist's Bandcamp release/track pages, 2026-11-04.
// Counts are track positions within releases (not unique compositions or product SKUs).
// Preserve Bandcamp URL slugs, including historic spellings, rather than guessing corrections.
export const bandcampCatalog = [
  { id: "mozart-notturni", title: "Wolfgang Amadeus Mozart — Six Notturni (Canzonetti)", year: 2019, trackCount: 6, kind: "album", url: "https://432orchestra.bandcamp.com/album/wolfgang-amadeus-mozart-six-notturni-canzonetti" },
  { id: "quartet-part-2", title: "432 Hz Quartet Music — Part 2", year: 2019, trackCount: 7, kind: "album", url: "https://432orchestra.bandcamp.com/album/432-hz-quartet-music-part-2" },
  { id: "christmas-live", title: "Have Yourself a 432 Hz Christmas — Live Concert", year: 2018, trackCount: 12, kind: "album", url: "https://432orchestra.bandcamp.com/album/have-yourself-a-432-hz-christmas-live-concert" },
  { id: "mozart-kv136", title: "Mozart — Divertimento in D, KV 136 (rehearsal recording)", year: 2017, trackCount: 1, kind: "track", url: "https://432orchestra.bandcamp.com/track/432-chamber-orchestra-w-a-mozart-divertimento-in-d-dur-kv-136-yanakiev-recording-from-rehearsal" },
  { id: "vivaldi-rehearsal", title: "Vivaldi — Concerto alla rustica, RV 151 (rehearsal recording)", year: 2017, trackCount: 3, kind: "album", url: "https://432orchestra.bandcamp.com/album/432-chamber-orchestra-antonio-vivaldi-concerto-alla-ristica-in-g-rv-151-432-hz-yanakiev-recording-from-rehearsal" },
  { id: "quartet-original", title: "432 Hz Quartet Music", year: 2017, trackCount: 16, kind: "album", url: "https://432orchestra.bandcamp.com/album/432-hz-quartet-music" },
  { id: "bizet-carmen", title: "Bizet — Entr'acte from Carmen Suite (432 Hz)", year: 2016, trackCount: 1, kind: "track", url: "https://432orchestra.bandcamp.com/track/g-bizet-entracte-suite-carmen-432-hz" },
  { id: "satie-gymnopedie", title: "Erik Satie — Gymnopédie No. 1 (432 Hz)", year: 2016, trackCount: 1, kind: "track", url: "https://432orchestra.bandcamp.com/track/e-satie-gymnopedie-no-1-432-hz" },
  { id: "schubert-moment", title: "Schubert — Moment musical No. 3 (432 Hz)", year: 2016, trackCount: 1, kind: "track", url: "https://432orchestra.bandcamp.com/track/fr-schubert-moment-musicaux-no-3-d-780-432-hz" },
  { id: "bach-air", title: "J. S. Bach — Air from Orchestral Suite No. 3 (432 Hz)", year: 2016, trackCount: 1, kind: "track", url: "https://432orchestra.bandcamp.com/track/j-s-bach-2-air-orchestral-suite-no-3-432-hz" },
  { id: "elgar-elegy", title: "Edward Elgar — Elegy for Strings, Op. 58 (432 Hz)", year: 2013, trackCount: 1, kind: "track", url: "https://432orchestra.bandcamp.com/track/edward-elgar-elegy-for-strings-op-58-432-hz" },
  { id: "vivaldi-demo", title: "Vivaldi — Concerto alla rustica, RV 151 (2013 demo)", year: 2013, trackCount: 3, kind: "album", url: "https://432orchestra.bandcamp.com/album/demo-vivaldi-antonio-concerto-in-g-alla-rustica-rv-151-432-hz-demo" }
] as const;

export const bandcampCatalogTrackCount = bandcampCatalog.reduce((sum, release) => sum + release.trackCount, 0);
export const bandcampCatalogueUrl = "https://432orchestra.bandcamp.com/music";
