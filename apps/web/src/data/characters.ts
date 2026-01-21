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

export const characters: Character[] = [
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
    // Paths OFFICIELS de KanjiVG pour あ (U+3042) - kvg:StrokePaths_03042
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
    strokeCount: 2,
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
    strokeCount: 2,
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
    strokeCount: 3,
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
