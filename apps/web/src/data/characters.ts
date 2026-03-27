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
