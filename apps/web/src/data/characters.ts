export interface Character {
  id: string;
  label: string;
  lang: string;
  audioText: string;
  svgPaths: string[];
  strokeCount?: number;
  meanings?: string[];
  romaji?: string[];
  readings?: {
    kana?: string[];
    onyomi?: string[];
    kunyomi?: string[];
  };
  jlpt?: string;
  courseLevel: number;
}

// ─── Japonais - Hiragana ─────────────────────────────────────────────────────
// Paths source: KanjiVG (https://kanjivg.tagaini.net) — licence CC BY-SA 3.0
// Viewbox: 0 0 109 109

const hiragana: Character[] = [
  {
    id: "hiragana-あ",
    label: "あ",
    lang: "ja-JP",
    audioText: "あ",
    strokeCount: 3,
    meanings: ["hiragana a"],
    romaji: ["a"],
    readings: { kana: ["あ"] },
    jlpt: "N5",
    courseLevel: 1,
    svgPaths: [
      "M31.01,33c0.88,0.88,2.75,1.82,5.25,1.75c8.62-0.25,20-2.12,29.5-4.25c1.51-0.34,4.62-0.88,6.62-0.5",
      "M49.76,17.62c0.88,1,1.82,3.26,1.38,5.25c-3.75,16.75-6.25,38.13-5.13,53.63c0.41,5.7,1.88,10.88,3.38,13.62",
      "M65.63,44.12c0.75,1.12,1.16,4.39,0.5,6.12c-4.62,12.26-11.24,23.76-25.37,35.76c-6.86,5.83-15.88,3.75-16.25-8.38c-0.34-10.87,13.38-23.12,32.38-26.74c12.42-2.37,27,1.38,30.5,12.75c4.05,13.18-3.76,26.37-20.88,30.49",
    ],
  },
  {
    id: "hiragana-い",
    label: "い",
    lang: "ja-JP",
    audioText: "い",
    strokeCount: 2,
    meanings: ["hiragana i"],
    romaji: ["i"],
    readings: { kana: ["い"] },
    jlpt: "N5",
    courseLevel: 1,
    svgPaths: [
      "M38.75,17.88c0.75,0.37,1.88,2,1.88,2.87c0,2.75-0.25,46.5-0.25,62.5c0,3.75,0.62,5.12,4.12,5.12c3.12,0,4.25-0.75,4.88-2.62c0.5-1.5,1-4.5,1.38-6.5",
      "M70.12,16c0.88,0.5,2.12,2.25,2.12,3.38c0,2.62-0.25,67.25-0.25,70.5c0,10.25-4.88,3.12-7.12,1",
    ],
  },
  {
    id: "hiragana-う",
    label: "う",
    lang: "ja-JP",
    audioText: "う",
    strokeCount: 3,
    meanings: ["hiragana u"],
    romaji: ["u"],
    readings: { kana: ["う"] },
    jlpt: "N5",
    courseLevel: 1,
    svgPaths: [
      "M30.88,27.12c1.75,0.5,3.62,0.62,5.5,0.37c7.12-1,18.5-2.88,27.12-4.12c1.88-0.25,3.75-0.5,5.62-0.25",
      "M48.88,28.88c0.75,0.75,1.12,2.12,1,3.38c-0.62,6.75-3.88,24.88-11.88,36.62c-1.88,2.75-3.5,2.5-5.12-0.25c-1.12-1.88-2-4.38-2.88-7",
      "M50.25,47.12c2.88,0.62,16.38,11.12,24,19.38c1.88,2,3.5,3.88,5.5,4.88",
    ],
  },
  {
    id: "hiragana-え",
    label: "え",
    lang: "ja-JP",
    audioText: "え",
    strokeCount: 4,
    meanings: ["hiragana e"],
    romaji: ["e"],
    readings: { kana: ["え"] },
    jlpt: "N5",
    courseLevel: 1,
    svgPaths: [
      "M26.12,40.88c1.88,0.5,4.5,0.62,6.38,0.37c10-1.25,26.38-3.5,37.25-4.12c2.12-0.12,4.25-0.25,6.38,0.25",
      "M42.88,17.62c1,1,1.5,2.38,1.5,4c0,1.88-0.12,36.75-0.12,54.75c0,3.25,0,5.88,0,7.62",
      "M44.25,40c-6.5,12.25-17.88,24.25-29.88,30.62",
      "M48.5,45.38c5.62,3.5,21.25,15.62,28.25,21.5c1.88,1.62,4.25,3.12,6.38,3.75",
    ],
  },
  {
    id: "hiragana-お",
    label: "お",
    lang: "ja-JP",
    audioText: "お",
    strokeCount: 4,
    meanings: ["hiragana o"],
    romaji: ["o"],
    readings: { kana: ["お"] },
    jlpt: "N5",
    courseLevel: 1,
    svgPaths: [
      "M24.75,28.25c2,0.62,4.75,0.75,6.88,0.5c8.62-1,23-3.12,32.62-3.88c2.12-0.16,4.25-0.25,6.38,0.25",
      "M42.25,31c0.88,0.88,1.25,2.25,1.25,3.5c0,1.25-0.12,28.75-0.12,40.88",
      "M23.25,75.62c2.12,0.62,5,0.75,7.12,0.5c11-1.25,29.5-3.5,43.38-4.25c2.25-0.12,4.5-0.25,6.75,0.25",
      "M43.88,53.88c6.5,0,24,16.25,31.38,22.38c2,1.62,4.5,3.25,6.88,3.88",
    ],
  },
];

// ─── Russe - Cyrillique ───────────────────────────────────────────────────────
// Paths dessinés en coordonnées SVG 0 0 109 109

const cyrillic: Character[] = [
  // ── Niveau 1 : Voyelles ──
  {
    id: "cyrillic-А",
    label: "А",
    lang: "ru-RU",
    audioText: "А",
    strokeCount: 3,
    meanings: ["voyelle a"],
    romaji: ["a"],
    courseLevel: 1,
    svgPaths: [
      "M55,18L25,90",
      "M55,18L85,90",
      "M36,56L74,56",
    ],
  },
  {
    id: "cyrillic-О",
    label: "О",
    lang: "ru-RU",
    audioText: "О",
    strokeCount: 1,
    meanings: ["voyelle o"],
    romaji: ["o"],
    courseLevel: 1,
    svgPaths: [
      "M54.5,18c-21,0,-36,16.5,-36,36.5c0,20,15,36.5,36,36.5c21,0,36.5,-16.5,36.5,-36.5c0,-20,-15.5,-36.5,-36.5,-36.5",
    ],
  },
  {
    id: "cyrillic-У",
    label: "У",
    lang: "ru-RU",
    audioText: "У",
    strokeCount: 2,
    meanings: ["voyelle ou"],
    romaji: ["ou"],
    courseLevel: 1,
    svgPaths: [
      "M25,22L55,60",
      "M85,22L55,60L55,90",
    ],
  },
  {
    id: "cyrillic-И",
    label: "И",
    lang: "ru-RU",
    audioText: "И",
    strokeCount: 3,
    meanings: ["voyelle i"],
    romaji: ["i"],
    courseLevel: 1,
    svgPaths: [
      "M25,20L25,90",
      "M85,20L85,90",
      "M85,20L25,90",
    ],
  },
  {
    id: "cyrillic-Э",
    label: "Э",
    lang: "ru-RU",
    audioText: "Э",
    strokeCount: 2,
    meanings: ["voyelle é"],
    romaji: ["é"],
    courseLevel: 1,
    svgPaths: [
      "M27,35c0,-18,56,-18,56,20c0,37,-56,37,-56,20",
      "M42,55L82,55",
    ],
  },
  {
    id: "cyrillic-Е",
    label: "Е",
    lang: "ru-RU",
    audioText: "Е",
    strokeCount: 4,
    meanings: ["voyelle yé"],
    romaji: ["yé"],
    courseLevel: 1,
    svgPaths: [
      "M28,20L28,90",
      "M28,20L80,20",
      "M28,55L72,55",
      "M28,90L80,90",
    ],
  },
  {
    id: "cyrillic-Ю",
    label: "Ю",
    lang: "ru-RU",
    audioText: "Ю",
    strokeCount: 3,
    meanings: ["voyelle you"],
    romaji: ["you"],
    courseLevel: 1,
    svgPaths: [
      "M22,20L22,90",
      "M22,55L40,55",
      "M65,30c-13.8,0,-25,11.2,-25,25c0,13.8,11.2,25,25,25c13.8,0,25,-11.2,25,-25c0,-13.8,-11.2,-25,-25,-25",
    ],
  },
  {
    id: "cyrillic-Я",
    label: "Я",
    lang: "ru-RU",
    audioText: "Я",
    strokeCount: 3,
    meanings: ["voyelle ya"],
    romaji: ["ya"],
    courseLevel: 1,
    svgPaths: [
      "M25,20L25,90",
      "M25,20c30,0,55,0,55,18c0,15,-25,20,-55,20",
      "M25,58L75,90",
    ],
  },

  // ── Niveau 2 : Consonnes fréquentes ──
  {
    id: "cyrillic-Н",
    label: "Н",
    lang: "ru-RU",
    audioText: "Н",
    strokeCount: 3,
    meanings: ["consonne n"],
    romaji: ["n"],
    courseLevel: 2,
    svgPaths: [
      "M25,20L25,90",
      "M85,20L85,90",
      "M25,55L85,55",
    ],
  },
  {
    id: "cyrillic-Т",
    label: "Т",
    lang: "ru-RU",
    audioText: "Т",
    strokeCount: 2,
    meanings: ["consonne t"],
    romaji: ["t"],
    courseLevel: 2,
    svgPaths: [
      "M20,22L89,22",
      "M54.5,22L54.5,90",
    ],
  },
  {
    id: "cyrillic-М",
    label: "М",
    lang: "ru-RU",
    audioText: "М",
    strokeCount: 3,
    meanings: ["consonne m"],
    romaji: ["m"],
    courseLevel: 2,
    svgPaths: [
      "M20,90L20,20",
      "M20,20L54.5,60L89,20",
      "M89,20L89,90",
    ],
  },
  {
    id: "cyrillic-К",
    label: "К",
    lang: "ru-RU",
    audioText: "К",
    strokeCount: 3,
    meanings: ["consonne k"],
    romaji: ["k"],
    courseLevel: 2,
    svgPaths: [
      "M25,20L25,90",
      "M25,55L80,20",
      "M25,55L80,90",
    ],
  },
  {
    id: "cyrillic-Л",
    label: "Л",
    lang: "ru-RU",
    audioText: "Л",
    strokeCount: 2,
    meanings: ["consonne l"],
    romaji: ["l"],
    courseLevel: 2,
    svgPaths: [
      "M22,20L85,20L85,90",
      "M22,20L35,90",
    ],
  },
  {
    id: "cyrillic-П",
    label: "П",
    lang: "ru-RU",
    audioText: "П",
    strokeCount: 3,
    meanings: ["consonne p"],
    romaji: ["p"],
    courseLevel: 2,
    svgPaths: [
      "M25,22L85,22",
      "M25,22L25,90",
      "M85,22L85,90",
    ],
  },
  {
    id: "cyrillic-С",
    label: "С",
    lang: "ru-RU",
    audioText: "С",
    strokeCount: 1,
    meanings: ["consonne s"],
    romaji: ["s"],
    courseLevel: 2,
    svgPaths: [
      "M82,35c0,-18,-60,-18,-60,20c0,36,60,36,60,20",
    ],
  },
  {
    id: "cyrillic-Р",
    label: "Р",
    lang: "ru-RU",
    audioText: "Р",
    strokeCount: 2,
    meanings: ["consonne r"],
    romaji: ["r"],
    courseLevel: 2,
    svgPaths: [
      "M25,20L25,90",
      "M25,20c30,0,55,0,55,18c0,15,-25,20,-55,20",
    ],
  },
  {
    id: "cyrillic-Б",
    label: "Б",
    lang: "ru-RU",
    audioText: "Б",
    strokeCount: 2,
    meanings: ["consonne b"],
    romaji: ["b"],
    courseLevel: 2,
    svgPaths: [
      "M80,20L25,20L25,90",
      "M25,55c10,0,50,-5,50,18c0,20,-28,18,-50,18",
    ],
  },
  {
    id: "cyrillic-В",
    label: "В",
    lang: "ru-RU",
    audioText: "В",
    strokeCount: 3,
    meanings: ["consonne v"],
    romaji: ["v"],
    courseLevel: 2,
    svgPaths: [
      "M25,20L25,90",
      "M25,20c30,0,50,0,50,18c0,13,-20,17,-50,20",
      "M25,58c30,0,55,2,55,17c0,17,-25,15,-55,15",
    ],
  },
];

export const characters: Character[] = [...hiragana, ...cyrillic];
