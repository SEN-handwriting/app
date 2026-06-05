import { db } from "../src/client";
import ruPrintUpper from '../data/ru-print-upper.json';
import ruPrintLower from '../data/ru-print-lower.json';

// ─── Types ────────────────────────────────────────────────────────────────────

type LanguageSeed = { id: string; code: string; name: string; script: string };
type CourseSeed   = { id: string; languageId: string; type: string; level: number; title: string; description?: string; prerequisiteId?: string };
type CharSeed     = {
  id: string; languageId: string; courseId: string;
  label: string; audioText: string; svgPaths: string[];
  strokeCount?: number; meanings?: string[]; romaji?: string[];
  readings?: { kana?: string[]; onyomi?: string[]; kunyomi?: string[] };
  jlpt?: string; courseLevel: number;
};

// ─── Langues ──────────────────────────────────────────────────────────────────

const LANGUAGES: LanguageSeed[] = [
  { id: "lang-ja", code: "ja-JP", name: "Japonais", script: "Hiragana"   },
  { id: "lang-ru", code: "ru-RU", name: "Russe",    script: "Cyrillique" },
];

// ─── Cours ────────────────────────────────────────────────────────────────────
// type = "character" | "word" | "phrase"

const COURSES: CourseSeed[] = [
  // ── Hiragana — Caractères ──────────────────────────────────────────────────
  { id: "course-ja-char-1",  languageId: "lang-ja", type: "character", level: 1,  title: "Voyelles — あいうえお",  description: "Les 5 voyelles de base de l'Hiragana" },
  { id: "course-ja-char-2",  languageId: "lang-ja", type: "character", level: 2,  title: "Série K — かきくけこ",   description: "Syllabes de la rangée K" },
  { id: "course-ja-char-3",  languageId: "lang-ja", type: "character", level: 3,  title: "Série S — さしすせそ",   description: "Syllabes de la rangée S" },
  { id: "course-ja-char-4",  languageId: "lang-ja", type: "character", level: 4,  title: "Série T — たちつてと",   description: "Syllabes de la rangée T" },
  { id: "course-ja-char-5",  languageId: "lang-ja", type: "character", level: 5,  title: "Série N — なにぬねの",   description: "Syllabes de la rangée N" },
  { id: "course-ja-char-6",  languageId: "lang-ja", type: "character", level: 6,  title: "Série H — はひふへほ",   description: "Syllabes de la rangée H" },
  { id: "course-ja-char-7",  languageId: "lang-ja", type: "character", level: 7,  title: "Série M — まみむめも",   description: "Syllabes de la rangée M" },
  { id: "course-ja-char-8",  languageId: "lang-ja", type: "character", level: 8,  title: "Série Y — やゆよ",       description: "Syllabes de la rangée Y" },
  { id: "course-ja-char-9",  languageId: "lang-ja", type: "character", level: 9,  title: "Série R — らりるれろ",   description: "Syllabes de la rangée R" },
  { id: "course-ja-char-10", languageId: "lang-ja", type: "character", level: 10, title: "Série W — わをん",        description: "Syllabes finales わをん" },

  // ── Cyrillique — Majuscules (1-5) ─────────────────────────────────────────
  { id: "course-ru-char-1", languageId: "lang-ru", type: "character", level: 1, title: "Majuscules — Voyelles А О У И Э Е Ю Я",       description: "Les 8 voyelles cyrilliques en lettres majuscules" },
  { id: "course-ru-char-2", languageId: "lang-ru", type: "character", level: 2, title: "Majuscules — Consonnes I Н Т М К Л П С Р Б В", description: "10 consonnes cyrilliques courantes en majuscules" },
  { id: "course-ru-char-3", languageId: "lang-ru", type: "character", level: 3, title: "Majuscules — Consonnes II Г Д З Й Ф Х",        description: "6 consonnes cyrilliques fréquentes en majuscules" },
  { id: "course-ru-char-4", languageId: "lang-ru", type: "character", level: 4, title: "Majuscules — Consonnes III Ж Ц Ч Ш",           description: "4 consonnes cyrilliques complexes en majuscules" },
  { id: "course-ru-char-5", languageId: "lang-ru", type: "character", level: 5, title: "Majuscules — Signes spéciaux Щ Ъ Ы Ь Ё",       description: "Les 5 caractères spéciaux en majuscules" },

  // ── Cyrillique — Minuscules (6-10) ────────────────────────────────────────
  { id: "course-ru-char-6",  languageId: "lang-ru", type: "character", level: 6,  title: "Minuscules — Voyelles а о у и э е ю я",       description: "Les 8 voyelles cyrilliques en lettres minuscules" },
  { id: "course-ru-char-7",  languageId: "lang-ru", type: "character", level: 7,  title: "Minuscules — Consonnes I н т м к л п с р б в", description: "10 consonnes cyrilliques courantes en minuscules" },
  { id: "course-ru-char-8",  languageId: "lang-ru", type: "character", level: 8,  title: "Minuscules — Consonnes II г д з й ф х",        description: "6 consonnes cyrilliques fréquentes en minuscules" },
  { id: "course-ru-char-9",  languageId: "lang-ru", type: "character", level: 9,  title: "Minuscules — Consonnes III ж ц ч ш",           description: "4 consonnes cyrilliques complexes en minuscules" },
  { id: "course-ru-char-10", languageId: "lang-ru", type: "character", level: 10, title: "Minuscules — Signes spéciaux щ ъ ы ь ё",       description: "Les 5 caractères spéciaux en minuscules" },

  // ── Mots — Japonais ───────────────────────────────────────────────────────
  // Débloqué après les 3 premières séries hiragana (あ→そ — 15 caractères)
  { id: "course-ja-word-1", languageId: "lang-ja", type: "word", level: 1, title: "Mots — Nature & Éléments",  description: "Kanji de base : eau, feu, arbre, montagne…", prerequisiteId: "course-ja-char-3" },
  // Débloqué après les 7 premières séries (あ→も — 35 caractères)
  { id: "course-ja-word-2", languageId: "lang-ja", type: "word", level: 2, title: "Mots — Animaux & Couleurs", description: "Kanji : chien, chat, oiseau, bleu, rouge…",    prerequisiteId: "course-ja-char-7" },

  // ── Mots — Russe (majuscules d'abord, puis minuscules) ────────────────────
  // Débloqué après les 3 premiers cours majuscules (voyelles + 2 séries consonnes)
  { id: "course-ru-word-1", languageId: "lang-ru", type: "word", level: 1, title: "Mots Majuscules — Famille & Quotidien", description: "Mots courants en lettres capitales", prerequisiteId: "course-ru-char-3" },
  // Débloqué après tous les cours majuscules (5/5)
  { id: "course-ru-word-2", languageId: "lang-ru", type: "word", level: 2, title: "Mots Majuscules — Nature & Nourriture",  description: "Nature et nourriture en lettres capitales", prerequisiteId: "course-ru-char-5" },
  // Débloqué après les 3 premiers cours minuscules
  { id: "course-ru-word-3", languageId: "lang-ru", type: "word", level: 3, title: "Mots Minuscules — Famille & Quotidien", description: "Les mêmes mots en lettres minuscules", prerequisiteId: "course-ru-char-8" },
  // Débloqué après tous les cours minuscules (10/10)
  { id: "course-ru-word-4", languageId: "lang-ru", type: "word", level: 4, title: "Mots Minuscules — Nature & Nourriture",  description: "Nature et nourriture en lettres minuscules", prerequisiteId: "course-ru-char-10" },

  // ── Phrases — Japonais ────────────────────────────────────────────────────
  { id: "course-ja-phrase-1", languageId: "lang-ja", type: "phrase", level: 1, title: "Phrases — Salutations", description: "Expressions de base pour saluer et remercier", prerequisiteId: "course-ja-char-5" },
  { id: "course-ja-phrase-2", languageId: "lang-ja", type: "phrase", level: 2, title: "Phrases — Présentation", description: "Se présenter et engager une conversation simple", prerequisiteId: "course-ja-char-10" },

  // ── Phrases — Russe ───────────────────────────────────────────────────────
  { id: "course-ru-phrase-1", languageId: "lang-ru", type: "phrase", level: 1, title: "Phrases — Salutations", description: "Expressions essentielles pour saluer et répondre", prerequisiteId: "course-ru-char-5" },
  { id: "course-ru-phrase-2", languageId: "lang-ru", type: "phrase", level: 2, title: "Phrases — Présentation", description: "Se présenter et gérer les situations courantes", prerequisiteId: "course-ru-char-10" },
];

// ─── Cursive path lookup maps ─────────────────────────────────────────────────

const printUpperPathMap = new Map<string, string[]>(
  ruPrintUpper.characters.map((c) => [c.id, c.strokes.map((s) => s.d)])
);
const printUpperStrokeCountMap = new Map<string, number>(
  ruPrintUpper.characters.map((c) => [c.id, c.strokeCount])
);

const printLowerPathMap = new Map<string, string[]>(
  ruPrintLower.characters.map((c) => [c.id, c.strokes.map((s) => s.d)])
);
const printLowerStrokeCountMap = new Map<string, number>(
  ruPrintLower.characters.map((c) => [c.id, c.strokeCount])
);

// ─── Caractères ───────────────────────────────────────────────────────────────
// Hiragana paths : KanjiVG (https://kanjivg.tagaini.net) — CC BY-SA 3.0 — viewBox 0 0 109 109
// Cyrillique paths : ru-cursive.json — viewBox 0 0 109 109

const CHARACTERS: CharSeed[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // HIRAGANA — Cours 1 : Voyelles あいうえお
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "hiragana-a", languageId: "lang-ja", courseId: "course-ja-char-1",
    label: "あ", audioText: "あ", strokeCount: 3, jlpt: "N5", courseLevel: 1,
    meanings: ["hiragana a"], romaji: ["a"], readings: { kana: ["あ"] },
    svgPaths: [
      "M31.01,33c0.88,0.88,2.75,1.82,5.25,1.75c8.62-0.25,20-2.12,29.5-4.25c1.51-0.34,4.62-0.88,6.62-0.5",
      "M49.76,17.62c0.88,1,1.82,3.26,1.38,5.25c-3.75,16.75-6.25,38.13-5.13,53.63c0.41,5.7,1.88,10.88,3.38,13.62",
      "M65.63,44.12c0.75,1.12,1.16,4.39,0.5,6.12c-4.62,12.26-11.24,23.76-25.37,35.76c-6.86,5.83-15.88,3.75-16.25-8.38c-0.34-10.87,13.38-23.12,32.38-26.74c12.42-2.37,27,1.38,30.5,12.75c4.05,13.18-3.76,26.37-20.88,30.49",
    ],
  },
  {
    id: "hiragana-i", languageId: "lang-ja", courseId: "course-ja-char-1",
    label: "い", audioText: "い", strokeCount: 2, jlpt: "N5", courseLevel: 1,
    meanings: ["hiragana i"], romaji: ["i"], readings: { kana: ["い"] },
    svgPaths: [
      "M38.75,17.88c0.75,0.37,1.88,2,1.88,2.87c0,2.75-0.25,46.5-0.25,62.5c0,3.75,0.62,5.12,4.12,5.12c3.12,0,4.25-0.75,4.88-2.62c0.5-1.5,1-4.5,1.38-6.5",
      "M70.12,16c0.88,0.5,2.12,2.25,2.12,3.38c0,2.62-0.25,67.25-0.25,70.5c0,10.25-4.88,3.12-7.12,1",
    ],
  },
  {
    id: "hiragana-u", languageId: "lang-ja", courseId: "course-ja-char-1",
    label: "う", audioText: "う", strokeCount: 2, jlpt: "N5", courseLevel: 1,
    meanings: ["hiragana u"], romaji: ["u"], readings: { kana: ["う"] },
    svgPaths: [
      "M42,15.5c5.62,2.12,9.62,3,12.88,3c8.27,0,8,1.12-0.38,5.5",
      "M33,42.38c2.12,1.12,4.12,2.88,8.5,1.38c4.38-1.5,12.75-7.12,18.5-7c5.75,0.12,10.25,5,10.25,18c0,15.49-8.25,30.24-24.37,41.24",
    ],
  },
  {
    id: "hiragana-e", languageId: "lang-ja", courseId: "course-ja-char-1",
    label: "え", audioText: "え", strokeCount: 2, jlpt: "N5", courseLevel: 1,
    meanings: ["hiragana e"], romaji: ["e"], readings: { kana: ["え"] },
    svgPaths: [
      "M40.52,13.25c5.62,2.12,10,3,14.12,3c8.27,0,8,1.12-0.38,5.5",
      "M32.52,45.12c1.88,1.25,4.5,1.75,7.38,0.62c3.29-1.29,17-7.88,21.25-9.88c4.25-2,8.32,0.04,4.38,4.62c-12.26,14.27-27.26,31.52-39.51,44.4c-3.26,3.42-0.58,3.54,1.5,1.37c13.5-14.12,18.12-20.12,23.62-20.12c7.13,0,3.5,16.75,6.75,22.38c3.25,5.63,19.12,3.75,26.12,2.12",
    ],
  },
  {
    id: "hiragana-o", languageId: "lang-ja", courseId: "course-ja-char-1",
    label: "お", audioText: "お", strokeCount: 3, jlpt: "N5", courseLevel: 1,
    meanings: ["hiragana o"], romaji: ["o"], readings: { kana: ["お"] },
    svgPaths: [
      "M22.88,35.12c1.38,1,3.62,2.38,6,2.12c2.38-0.26,19.62-5.12,21.12-5.74c1.5-0.62,4-1.25,5.88-2",
      "M41.5,16.12c2.25,1,3.59,4.39,3.12,7.38c-2.5,16.12-3.37,45.53-2.25,58.38c0.75,8.62-0.64,10.45-7.12,7.12c-5.13-2.62-13.75-8-13.75-12.38c0-7.5,24.38-23.62,44.75-23.62c17.25,0,25,8.25,25,17.25c0,8.25-9.38,18.88-26.75,21",
      "M73,22.12c5.38,2.62,8.88,5.88,10.62,8.25c2.27,3.08,0.38,4.5-1.12,5",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HIRAGANA — Cours 2 : Série K かきくけこ
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "hiragana-ka", languageId: "lang-ja", courseId: "course-ja-char-2",
    label: "か", audioText: "か", strokeCount: 3, jlpt: "N5", courseLevel: 2,
    meanings: ["hiragana ka"], romaji: ["ka"], readings: { kana: ["か"] },
    svgPaths: [
      "M24.62,38.62c1.88,1.62,4.65,2.33,8.62,1c25.5-8.5,29.5-4.13,29.5,7.62c0,9.38-1.24,17.46-4.25,25.25c-7.62,19.76-10.87,17.39-16.12,10.89",
      "M48.5,17.5c1,1.38,1.29,4.7,0.5,7.12c-5,15.25-18.02,40.93-19.62,43.88c-3.12,5.75-6.38,11.88-9.38,16.25",
      "M77.37,31.62c7.5,6.88,13.25,15.75,15,24.88",
    ],
  },
  {
    id: "hiragana-ki", languageId: "lang-ja", courseId: "course-ja-char-2",
    label: "き", audioText: "き", strokeCount: 4, jlpt: "N5", courseLevel: 2,
    meanings: ["hiragana ki"], romaji: ["ki"], readings: { kana: ["き"] },
    svgPaths: [
      "M30.5,30.25c1.88,0.75,4.64,1.06,5.88,0.88c6.75-1,22.25-4.5,26.5-6c2.17-0.76,3.5-1.25,4.88-2.12",
      "M36.25,48.7c2.01,0.85,4.97,1.2,6.29,0.99c7.23-1.13,23.82-5.09,28.37-6.79c2.32-0.86,3.75-1.41,5.22-2.4",
      "M42,14.12c1.5,0.88,3.13,2.94,4,5.12c5.5,13.76,16,29.26,26.37,40.76c7.64,8.47,9.12,9.38-6,3.88",
      "M33.75,83.25c10.62,9.75,27.25,8.62,38.12,5",
    ],
  },
  {
    id: "hiragana-ku", languageId: "lang-ja", courseId: "course-ja-char-2",
    label: "く", audioText: "く", strokeCount: 1, jlpt: "N5", courseLevel: 2,
    meanings: ["hiragana ku"], romaji: ["ku"], readings: { kana: ["く"] },
    svgPaths: [
      "M60.66,15c0.5,1.62,0.35,5.44-1,7.38c-6.75,9.62-14.3,19.08-18.62,24.5c-4,5-3.79,7.03-0.88,11c5.5,7.5,12.75,18.75,17.62,27.25c1.48,2.59,2.75,4.75,4.5,8.62",
    ],
  },
  {
    id: "hiragana-ke", languageId: "lang-ja", courseId: "course-ja-char-2",
    label: "け", audioText: "け", strokeCount: 3, jlpt: "N5", courseLevel: 2,
    meanings: ["hiragana ke"], romaji: ["ke"], readings: { kana: ["け"] },
    svgPaths: [
      "M24.67,19.75c1.25,1.5,2.62,3.75,2.12,6.38c-3,15.88-6.5,29.5-4.88,44.62c2.02,18.84,2.25,4.75,6.75-3.5",
      "M53.67,38.62c2.12,1.38,4.28,1.89,6.88,1.5c8.25-1.25,15.39-2.57,20.62-4c2.76-0.74,5.26-1.12,6.88-1.12",
      "M71.67,14.38c2.13,1.37,2.88,3.35,2.88,5.12c0,11.62,0.12,20.38,0.12,30.12c0,20.75-0.62,30.88-12.5,42.25",
    ],
  },
  {
    id: "hiragana-ko", languageId: "lang-ja", courseId: "course-ja-char-2",
    label: "こ", audioText: "こ", strokeCount: 2, jlpt: "N5", courseLevel: 2,
    meanings: ["hiragana ko"], romaji: ["ko"], readings: { kana: ["こ"] },
    svgPaths: [
      "M34.75,26.75c1.12,0.88,2.91,2.01,6,1.5c7.62-1.25,14.11-2.56,22.38-2.62c15.5-0.12,5.88,5-5.75,9",
      "M30,68.12c2.25,14.5,15.26,17.96,31,16.75c6.5-0.5,11.88-1.25,17.62-2.88",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HIRAGANA — Cours 3 : Série S さしすせそ
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "hiragana-sa", languageId: "lang-ja", courseId: "course-ja-char-3",
    label: "さ", audioText: "さ", strokeCount: 3, jlpt: "N5", courseLevel: 3,
    meanings: ["hiragana sa"], romaji: ["sa"], readings: { kana: ["さ"] },
    svgPaths: [
      "M27,38.9c2.42,1.33,5.38,1.47,8.32,1.06c8.79-1.24,28.67-7.76,34.15-10.43c2.79-1.36,3.78-1.91,6.28-3.53",
      "M41.5,13.88c1.5,0.88,3.63,2.94,4.5,5.12c5.5,13.75,15.25,27.62,26.87,39.5c7.98,8.15,6.38,10-6,3.12",
      "M35.25,80.5c4.5,11.75,20.88,12.5,38.38,7.5",
    ],
  },
  {
    id: "hiragana-shi", languageId: "lang-ja", courseId: "course-ja-char-3",
    label: "し", audioText: "し", strokeCount: 1, jlpt: "N5", courseLevel: 3,
    meanings: ["hiragana shi"], romaji: ["shi"], readings: { kana: ["し"] },
    svgPaths: [
      "M39.12,17.5c1.25,3.12,0.93,6.74,0.38,10.25c-2.12,13.5-3,26.5-3,39.12c0,27.38,19.88,30.12,45.5,17.25",
    ],
  },
  {
    id: "hiragana-su", languageId: "lang-ja", courseId: "course-ja-char-3",
    label: "す", audioText: "す", strokeCount: 2, jlpt: "N5", courseLevel: 3,
    meanings: ["hiragana su"], romaji: ["su"], readings: { kana: ["す"] },
    svgPaths: [
      "M15.5,37.12c2.88,2.12,6.94,1.51,12.75,0.25c16.12-3.5,36.14-5.38,46.62-6.5c7-0.75,11.88-0.62,17.75,0.12",
      "M57.62,13.38c2,1.5,2.75,3.25,2.75,5.88c0,10.38,0,35.12,0,40.75c0,14.62-15.62,16.38-15.62,1.75c0-14.25,18-14.12,18,6.38c0,13.25-7.75,21.5-16,28.38",
    ],
  },
  {
    id: "hiragana-se", languageId: "lang-ja", courseId: "course-ja-char-3",
    label: "せ", audioText: "せ", strokeCount: 3, jlpt: "N5", courseLevel: 3,
    meanings: ["hiragana se"], romaji: ["se"], readings: { kana: ["せ"] },
    svgPaths: [
      "M16.5,49.93c2.88,2.42,6.86,1.57,12.75,0.53c19-3.34,33-5.72,47.12-7.64c6.99-0.95,11.88-1.21,17.75-0.36",
      "M69.74,17.75c2,1.5,2.75,3.25,2.75,5.88c0,10.38,0,17.88,0,23.5c0,25.62-5.75,23.25-11.88,19",
      "M35.62,26.25c2,1.5,2.75,3.25,2.75,5.88c0,10.38,0,28.38,0,34c0,14.5,6.38,19.55,20.14,19.55c10.24,0,13.74,0.07,22.61-1.68",
    ],
  },
  {
    id: "hiragana-so", languageId: "lang-ja", courseId: "course-ja-char-3",
    label: "そ", audioText: "そ", strokeCount: 1, jlpt: "N5", courseLevel: 3,
    meanings: ["hiragana so"], romaji: ["so"], readings: { kana: ["そ"] },
    svgPaths: [
      "M38.4,22c1.88,1.25,4.98,1.05,7.5,0.38c6.5-1.75,13.25-3.75,19.38-5.38c4.63-1.23,7.18,2.06,3.62,5.25c-12.12,10.87-31.14,24.4-40,30.25c-6.25,4.12-5.88,5.75,1.38,3.88c17.08-4.42,35.96-8.68,50.12-10.38c9.38-1.12,9.62,0.12,0.5,1.38c-15.82,2.17-34.38,14.25-34.38,26.5c0,12.88,11.62,20.38,31.5,16.62",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HIRAGANA — Cours 4 : Série T たちつてと
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "hiragana-ta", languageId: "lang-ja", courseId: "course-ja-char-4",
    label: "た", audioText: "た", strokeCount: 4, jlpt: "N5", courseLevel: 4,
    meanings: ["hiragana ta"], romaji: ["ta"], readings: { kana: ["た"] },
    svgPaths: [
      "M24.38,35.38c1.38,0.62,3.88,1.51,6.38,1.12c6.5-1,16.25-2.88,24.88-4.75c2.64-0.57,5.38-1.5,7.62-2.38",
      "M45,16.88c0.75,1.25,0.87,3.62,0.38,5.25c-6.35,20.94-12.75,36.37-18.88,52.37c-1.36,3.56-4.75,11.75-6,14.62",
      "M56.38,53.25c12.38-2.75,18.25-3.7,23.62-3.12c15.12,1.62-1.12,2.25-4.25,4.88",
      "M54.13,82.25c4.38,7,14.25,8.12,34.5,5.62",
    ],
  },
  {
    id: "hiragana-chi", languageId: "lang-ja", courseId: "course-ja-char-4",
    label: "ち", audioText: "ち", strokeCount: 2, jlpt: "N5", courseLevel: 4,
    meanings: ["hiragana chi"], romaji: ["chi"], readings: { kana: ["ち"] },
    svgPaths: [
      "M24.5,32.62c1.38,0.62,3.88,1.51,6.38,1.12c6.5-1,18.25-4.12,26.88-6c2.64-0.57,5.38-1.5,7.62-2.38",
      "M45.62,15.62c0.75,1.25,0.71,3.58,0.38,5.25c-3,15-4.25,22.59-8.38,38.62c-3.25,12.62-5.38,11.12,3.62,4.38c8.29-6.21,19.75-9.5,28.5-9.5c8.62,0,14.58,5.88,14.5,14.5c-0.12,13.5-16.5,20.62-29.88,23.25",
    ],
  },
  {
    id: "hiragana-tsu", languageId: "lang-ja", courseId: "course-ja-char-4",
    label: "つ", audioText: "つ", strokeCount: 1, jlpt: "N5", courseLevel: 4,
    meanings: ["hiragana tsu"], romaji: ["tsu"], readings: { kana: ["つ"] },
    svgPaths: [
      "M14,44.75c1.88,1.62,4.68,2.09,8.12,0.62c17.88-7.62,30-11.12,44.88-10.88c12.56,0.21,22.98,7.17,22.87,19.17c-0.18,18.77-24.75,28.71-45.01,32.08",
    ],
  },
  {
    id: "hiragana-te", languageId: "lang-ja", courseId: "course-ja-char-4",
    label: "て", audioText: "て", strokeCount: 1, jlpt: "N5", courseLevel: 4,
    meanings: ["hiragana te"], romaji: ["te"], readings: { kana: ["て"] },
    svgPaths: [
      "M20.5,26.38c1.87,1.62,4.42,1.97,8.12,1.37c21.75-3.5,33-5.12,50.12-8.38c12.34-2.34,13-0.88,0.38,1.38c-17.89,3.19-33.78,19.12-33.78,37.62c0,20.5,17.91,30.25,35.16,30.25",
    ],
  },
  {
    id: "hiragana-to", languageId: "lang-ja", courseId: "course-ja-char-4",
    label: "と", audioText: "と", strokeCount: 2, jlpt: "N5", courseLevel: 4,
    meanings: ["hiragana to"], romaji: ["to"], readings: { kana: ["と"] },
    svgPaths: [
      "M35.5,18.38c1.74,0.74,3.62,2.62,4.12,5.37c0.5,2.75,4.75,25,5.38,28.12",
      "M78.12,25.5c0.25,1.88,0.04,4.09-2.25,5.75c-6.37,4.63-13.22,8.49-22.75,15.25c-12.88,9.12-21.62,18.38-21.62,27.5c0,10.12,8.5,13.88,26.88,13.88c6.25,0,14.75-0.12,21.62-1.25",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HIRAGANA — Cours 5 : Série N なにぬねの
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "hiragana-na", languageId: "lang-ja", courseId: "course-ja-char-5",
    label: "な", audioText: "な", strokeCount: 4, jlpt: "N5", courseLevel: 5,
    meanings: ["hiragana na"], romaji: ["na"], readings: { kana: ["な"] },
    svgPaths: [
      "M22.88,28.96c1.18,0.58,3.3,1.1,5.47,1.05c5.53-0.13,10.9-0.98,16.52-2.42c4.82-1.23,9.13-3.12,11.38-4.22",
      "M42.99,14c0.63,0.89,0.56,2.52,0.31,3.72c-2.96,14.16-7.95,26.56-14.25,37.87c-2.05,3.69-4.25,7.24-6.55,10.65",
      "M72.26,23.25c6.88,2.5,12.62,5.62,14.75,9.5c4.06,7.41-0.25,3.38-3.5,3.88",
      "M68.88,44.62c-1,1.88-2.14,5.24-1.88,8.25c0.62,7,1.5,13.12,1.5,20.62c0,20-27.88,19.75-27.88,9.38c0-5.62,8.25-8.25,13.88-8.25c8.75,0,21.5,3.25,29.75,11.5",
    ],
  },
  {
    id: "hiragana-ni", languageId: "lang-ja", courseId: "course-ja-char-5",
    label: "に", audioText: "に", strokeCount: 3, jlpt: "N5", courseLevel: 5,
    meanings: ["hiragana ni"], romaji: ["ni"], readings: { kana: ["に"] },
    svgPaths: [
      "M24.53,22.75c1.25,1.5,1.62,3.75,1.12,6.38c-3,15.88-9,32.5-7.38,47.62c2.02,18.84,4.5,5.75,8.5-3.5",
      "M53.2,30.64c0.96,0.79,2.44,1.58,5.1,1.35c6.98-0.61,15.01-3.3,22.04-3.36c13.19-0.11,1.5,3.75-8.39,7.35",
      "M52.53,68c1.76,12.92,11.92,16.01,24.23,14.93c5.08-0.45,8.9-0.8,14.27-2.06",
    ],
  },
  {
    id: "hiragana-nu", languageId: "lang-ja", courseId: "course-ja-char-5",
    label: "ぬ", audioText: "ぬ", strokeCount: 2, jlpt: "N5", courseLevel: 5,
    meanings: ["hiragana nu"], romaji: ["nu"], readings: { kana: ["ぬ"] },
    svgPaths: [
      "M25.38,28.5c2,1.38,2.97,3.23,3.38,5.88c1.87,12.18,4.12,23.92,8.54,34.67c1.79,4.36,3.96,8.33,6.84,12.46",
      "M57.12,19.25c0.88,2.12,1.06,3.79,0.62,5.88c-3.12,15-13.14,39.81-18.12,48.62c-11.87,21-20.62,1.25-20.62-4.5c0-22.63,43.75-44.25,62.36-29.59c7.66,6.03,9.8,14.58,9.14,23.34c-2,26.75-32.88,28.38-32.88,16.88c0-9.38,17.38-7.12,27.12-1.12c3.1,1.91,7.25,5.25,9.5,7.5",
    ],
  },
  {
    id: "hiragana-ne", languageId: "lang-ja", courseId: "course-ja-char-5",
    label: "ね", audioText: "ね", strokeCount: 2, jlpt: "N5", courseLevel: 5,
    meanings: ["hiragana ne"], romaji: ["ne"], readings: { kana: ["ね"] },
    svgPaths: [
      "M33.29,14.5c1.62,1.62,2.1,3.21,1.88,5.88c-1.03,11.93-2.06,31.66-2.53,53.12c-0.1,4.62-0.18,9.31-0.22,14",
      "M17.16,37.88c1.62,0.88,3.25,1.38,5.62,0.75c2.14-0.56,7.8-2.31,12.37-4.03c6.26-2.35,6.88-1.47,3.12,3.63c-5.56,7.53-13.02,17.38-18.48,26.77c-5.6,9.62-3.45,8.3,2,3c19.12-18.62,38.5-39.12,54.12-39.12c11.38,0,12.88,11.25,12.88,32.5c0,28.62-30.18,24.88-30.18,16.26c0-9.63,18.73-7.82,28.06-1.88c2.75,1.75,5.88,4.88,7.5,6.75",
    ],
  },
  {
    id: "hiragana-no", languageId: "lang-ja", courseId: "course-ja-char-5",
    label: "の", audioText: "の", strokeCount: 1, jlpt: "N5", courseLevel: 5,
    meanings: ["hiragana no"], romaji: ["no"], readings: { kana: ["の"] },
    svgPaths: [
      "M53.82,28.62c1,1.5,1.34,4.12,0.88,6.62c-1.75,9.5-6.89,25-10.75,33.12c-9.63,20.26-16.55,14.74-24.38-1.98c-9.13-19.5,23.5-48.88,50.63-40.38c32.38,10.15,28,54.62-4.75,60.88",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HIRAGANA — Cours 6 : Série H はひふへほ
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "hiragana-ha", languageId: "lang-ja", courseId: "course-ja-char-6",
    label: "は", audioText: "は", strokeCount: 3, jlpt: "N5", courseLevel: 6,
    meanings: ["hiragana ha"], romaji: ["ha"], readings: { kana: ["は"] },
    svgPaths: [
      "M24.51,18c1.25,1.5,2.15,4,1.62,6.62c-3.5,17.62-6.98,36.4-4,54.88c2.5,15.5,1.12,2,5.62-6.25",
      "M49.64,37.89c2.41,1.57,4.85,2.16,7.8,1.71c9.36-1.43,17.46-2.94,23.4-4.57c3.12-0.86,5.96-1.29,7.8-1.29",
      "M69.77,16.5c2.25,2.12,2.88,4.12,2.88,6.5c0,2.38,1.5,38.62,1.5,48c0,22.5-30.62,19.62-30.62,10.5c0-9.75,23.88-5.62,29.5-2.88c5.62,2.74,11.98,8.26,13.36,9.38",
    ],
  },
  {
    id: "hiragana-hi", languageId: "lang-ja", courseId: "course-ja-char-6",
    label: "ひ", audioText: "ひ", strokeCount: 1, jlpt: "N5", courseLevel: 6,
    meanings: ["hiragana hi"], romaji: ["hi"], readings: { kana: ["ひ"] },
    svgPaths: [
      "M20,25.12c1.25,0.88,3.75,2.25,6.5,1.38c2.75-0.87,7.31-2.38,11.38-4.5c6-3.12,8.42-1.01,4.25,4c-27.13,32.62-23.76,58.5-1.52,62.88c18.07,3.56,37.63-16.38,35.63-56.51c-0.72-14.5-0.17-14.78,4.12-1.75c3.76,11.38,10.26,20.76,16.14,26.5",
    ],
  },
  {
    id: "hiragana-fu", languageId: "lang-ja", courseId: "course-ja-char-6",
    label: "ふ", audioText: "ふ", strokeCount: 4, jlpt: "N5", courseLevel: 6,
    meanings: ["hiragana fu"], romaji: ["fu"], readings: { kana: ["ふ"] },
    svgPaths: [
      "M42.63,15.62c3.62,3.38,7.5,5.38,12.74,6.13c9.59,1.37,3.5,3.38-1.88,6.12",
      "M43.63,46.88c1.88,4.62,7.5,9.41,14.25,17.5c10.62,12.74,0.49,30-19.13,21.62",
      "M16.5,73.38c0.75,4,1.88,8.12,5,10.12c1.16,0.74,0.12-3.38,13.25-9.12",
      "M80.13,61.88c5.12,3.38,10.28,7.49,11.38,8.88c6.75,8.5-0.25,4.62-4.62,7.12",
    ],
  },
  {
    id: "hiragana-he", languageId: "lang-ja", courseId: "course-ja-char-6",
    label: "へ", audioText: "へ", strokeCount: 1, jlpt: "N5", courseLevel: 6,
    meanings: ["hiragana he"], romaji: ["he"], readings: { kana: ["へ"] },
    svgPaths: [
      "M15,48.75c2.25,1.62,4.67,1.96,7-0.38c3.62-3.62,7.46-6.54,11.25-10.5c5.5-5.75,8.48-4.75,13.12-0.88c12.12,10.12,30.38,25.12,33.38,27.38c3,2.26,12.37,10.38,13.87,11.63",
    ],
  },
  {
    id: "hiragana-ho", languageId: "lang-ja", courseId: "course-ja-char-6",
    label: "ほ", audioText: "ほ", strokeCount: 4, jlpt: "N5", courseLevel: 6,
    meanings: ["hiragana ho"], romaji: ["ho"], readings: { kana: ["ほ"] },
    svgPaths: [
      "M24.51,18.75c1.25,1.5,2.15,4,1.62,6.62c-3.5,17.63-6.98,37.4-4,55.88c2.5,15.5,1.12,2,5.62-6.25",
      "M53.08,21.13c1.9,1.28,3.82,1.76,6.14,1.4c7.36-1.17,13.73-2.4,18.41-3.73c2.46-0.7,4.69-1.05,6.13-1.05",
      "M53.83,44.3c2.21,1.44,4.46,1.98,7.16,1.57c8.59-1.31,15.78-2.44,21.23-3.94c2.87-0.79,5.72-1.18,7.41-1.18",
      "M72.51,23c1.38,1.62,1.62,4.12,1.62,6.5c0,2.38,2,35.12,2,44.5c0,17.5-29.88,17.12-29.88,8c0-9.75,21.38-7.88,29.5-2.88c5.33,3.28,12,8.25,13.38,9.38",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HIRAGANA — Cours 7 : Série M まみむめも
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "hiragana-ma", languageId: "lang-ja", courseId: "course-ja-char-7",
    label: "ま", audioText: "ま", strokeCount: 3, jlpt: "N5", courseLevel: 7,
    meanings: ["hiragana ma"], romaji: ["ma"], readings: { kana: ["ま"] },
    svgPaths: [
      "M29.83,32.28c2.2,1.15,4.43,1.5,7.14,1.26c11.54-1.04,25.94-3.12,34.66-4.85c2.87-0.57,5.45-0.44,7.13-0.44",
      "M33.83,51.84c2.45,1.61,4.94,1.72,7.94,1.26c9.52-1.46,17.87-3.1,27.03-5.16c3.22-0.72,6.34-1.32,8.21-1.32",
      "M55.81,14c1.52,1.8,1.8,4.57,1.8,7.19c0,2.63,0.46,43.88,0.46,54.25c0,21.3-30.07,19.96-30.07,9.86c0-10.79,25.88-9.93,38.57-3.18c6.12,3.25,11.55,6.38,14.8,9.13",
    ],
  },
  {
    id: "hiragana-mi", languageId: "lang-ja", courseId: "course-ja-char-7",
    label: "み", audioText: "み", strokeCount: 2, jlpt: "N5", courseLevel: 7,
    meanings: ["hiragana mi"], romaji: ["mi"], readings: { kana: ["み"] },
    svgPaths: [
      "M32.5,26c1.88,1.75,4.06,1.7,6.88,1.25c3.88-0.62,7.62-1.75,11.88-3.12c4.26-1.37,6.25-0.12,4.5,5.12c-1.75,5.24-6.66,17.39-12,30.12c-13.63,32.51-29.26,29.26-29.26,18.63c0-14.25,20.48-15.36,33-13.5c18.5,2.75,30,6.62,44.38,14.25",
      "M79.38,54.75c0.75,2.38,0.49,4.37,0,6.25c-2.12,8.12-7.5,25-22.12,33.75",
    ],
  },
  {
    id: "hiragana-mu", languageId: "lang-ja", courseId: "course-ja-char-7",
    label: "む", audioText: "む", strokeCount: 3, jlpt: "N5", courseLevel: 7,
    meanings: ["hiragana mu"], romaji: ["mu"], readings: { kana: ["む"] },
    svgPaths: [
      "M19.59,31.65c2.1,1.55,4.24,1.66,6.81,1.21c8.17-1.41,15.33-2.98,23.19-4.96c2.76-0.69,5.44-1.27,7.05-1.27",
      "M37.02,15.5c1.62,1.25,2.31,2.88,2.12,5.25c-0.88,11.12-1.5,20.75-4,34.88c-3.61,20.44-19.25,16.99-18.62,7.37c0.5-7.74,6.25-12.86,12.62-13.5c5-0.5,14.28,1.93,5.88,15c-12.62,19.62-11.42,24.51,5.11,25.54c10.98,0.68,19.26,0.72,28.49-0.92c14.15-2.5,7.4-2.63,7.4-11.13",
      "M78.52,36.25c6.88,3.12,11.71,5.95,14.88,10.12c6.25,8.25-1.38,3.62-4.5,4.5",
    ],
  },
  {
    id: "hiragana-me", languageId: "lang-ja", courseId: "course-ja-char-7",
    label: "め", audioText: "め", strokeCount: 2, jlpt: "N5", courseLevel: 7,
    meanings: ["hiragana me"], romaji: ["me"], readings: { kana: ["め"] },
    svgPaths: [
      "M27.48,31.75c1.75,1,2.41,3.09,2.5,5.25c0.5,11.62,2.75,23.5,7.25,31.38c1.39,2.44,5.38,8.5,7.25,10.38",
      "M59.6,19.38c1,1.5,1.35,4.12,0.88,6.62c-2.75,14.62-13.62,37.75-20.1,47.24c-12.28,17.14-16.78,13.14-22.28,0.64c-5.38-15.38,26.4-42.18,53.42-35.28c29.08,8.27,23.96,46.02-7.98,50.15",
    ],
  },
  {
    id: "hiragana-mo", languageId: "lang-ja", courseId: "course-ja-char-7",
    label: "も", audioText: "も", strokeCount: 3, jlpt: "N5", courseLevel: 7,
    meanings: ["hiragana mo"], romaji: ["mo"], readings: { kana: ["も"] },
    svgPaths: [
      "M49.17,14.75c1.88,1.88,1.86,4.52,1.12,8c-3,14.25-5,26.62-7,42.12c-2.55,19.73-0.75,29.88,17,29.86c20.25-0.02,28.63-13.11,20.01-35.73",
      "M26.54,34.62c1.12,0.88,2.87,2.21,6,2c11.12-0.75,20-2.12,27.74-3.46c3.88-0.67,5.88-1.17,8.88-1.04",
      "M26.42,53.38c-1.5,4,1,6.75,7.75,6.75c8.75,0,17.62-1,22.88-1.88c2.01-0.33,5.38-1,7.5-1.75",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HIRAGANA — Cours 8 : Série Y やゆよ
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "hiragana-ya", languageId: "lang-ja", courseId: "course-ja-char-8",
    label: "や", audioText: "や", strokeCount: 3, jlpt: "N5", courseLevel: 8,
    meanings: ["hiragana ya"], romaji: ["ya"], readings: { kana: ["や"] },
    svgPaths: [
      "M18,49.38c1.88,1.62,5.25,2.5,8.62,0.88c18.51-8.88,35.76-19.38,50.83-19.26c9.02,0.14,16.01,4.13,15.93,12.29c0,8.33-10.88,16.58-24.5,17.83",
      "M47.13,15.88c5.12,0.88,10.41,4.05,11.5,6.62c2.12,5-1,2.38-2.88,2.62",
      "M30,24.38c2.38,1.88,3.28,2.87,3.88,5.25c2.62,10.5,11.12,41.12,14.75,52.5c0.65,2.04,1.88,6.25,2.88,9.38",
    ],
  },
  {
    id: "hiragana-yu", languageId: "lang-ja", courseId: "course-ja-char-8",
    label: "ゆ", audioText: "ゆ", strokeCount: 2, jlpt: "N5", courseLevel: 8,
    meanings: ["hiragana yu"], romaji: ["yu"], readings: { kana: ["ゆ"] },
    svgPaths: [
      "M21.05,25.38c1.38,1.5,2.02,4.13,1.5,6.25c-2.88,11.75-4,22.25-2.12,35c2.77,18.85,1.12,3.88,3.25-1.5c9-22.75,27.24-34.5,44.38-34.5c16.88,0,21.88,11.38,21.88,20.25c0,27.38-30.88,29.62-43,16.75",
      "M58.42,16.75c2.62,1.75,3.17,3.13,3.5,7.12c0.88,10.5,1.4,18.72,1.62,29.38c0.5,24-6.25,32-12.38,39.25",
    ],
  },
  {
    id: "hiragana-yo", languageId: "lang-ja", courseId: "course-ja-char-8",
    label: "よ", audioText: "よ", strokeCount: 2, jlpt: "N5", courseLevel: 8,
    meanings: ["hiragana yo"], romaji: ["yo"], readings: { kana: ["よ"] },
    svgPaths: [
      "M58.24,35.38c7.5-1.28,13.74-2.63,18.5-4.1c2.5-0.77,4.77-1.15,6.25-1.15",
      "M54.62,13.88c2.25,2.12,2.98,4.13,2.88,6.5c-0.75,17-0.12,34.88,1.39,53.5c1.88,23.07-34.89,20.88-34.89,11.5c0-12,26.25-8,35.98-4.12c8.1,3.23,11.52,4.88,18.52,10.38",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HIRAGANA — Cours 9 : Série R らりるれろ
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "hiragana-ra", languageId: "lang-ja", courseId: "course-ja-char-9",
    label: "ら", audioText: "ら", strokeCount: 2, jlpt: "N5", courseLevel: 9,
    meanings: ["hiragana ra"], romaji: ["ra"], readings: { kana: ["ら"] },
    svgPaths: [
      "M35.33,15c3.75,3,9.22,4.41,16.5,4.25c11.12-0.25-0.25,2.38-1.25,3.5",
      "M35.83,35.75c-2.14,4.34-2.79,8.67-3.11,13.24c-0.42,5.84-0.31,12.05-2.14,19.13c-3.16,12.27,1.49,4.77,3,3.5c11.88-10,21.7-12.67,32.61-12.49c9.21,0.15,16.85,5.19,16.76,13.88c-0.12,13.6-14.24,21.49-32.49,22.49",
    ],
  },
  {
    id: "hiragana-ri", languageId: "lang-ja", courseId: "course-ja-char-9",
    label: "り", audioText: "り", strokeCount: 2, jlpt: "N5", courseLevel: 9,
    meanings: ["hiragana ri"], romaji: ["ri"], readings: { kana: ["り"] },
    svgPaths: [
      "M38.75,25.25c1.25,1.5,2.24,4.03,1.62,6.62c-2.88,12.13-6.29,29.65-4.25,42.38c2,12.5,1.75-0.75,5.62-6.25",
      "M69.37,18.75c2.25,2.12,2.88,4.12,2.88,6.5c0,2.38,0,26.38,0,35.75c0,16.5-5,25.75-12.62,33.12",
    ],
  },
  {
    id: "hiragana-ru", languageId: "lang-ja", courseId: "course-ja-char-9",
    label: "る", audioText: "る", strokeCount: 1, jlpt: "N5", courseLevel: 9,
    meanings: ["hiragana ru"], romaji: ["ru"], readings: { kana: ["る"] },
    svgPaths: [
      "M34.31,20.38c1.75,1.25,4.62,2.62,8.5,1.5c3.88-1.12,9.62-2.5,15.62-4.62c6-2.12,7.5-0.12,4.38,4.25c-3.12,4.37-18.89,24.62-27.75,34c-8.5,9-13.09,11.89,0.75,3.25c15.62-9.75,43-10.88,43,13.38c0,22.5-40.88,24.5-40.88,12.62c0-11.25,18.12-8.75,24.38-0.38",
    ],
  },
  {
    id: "hiragana-re", languageId: "lang-ja", courseId: "course-ja-char-9",
    label: "れ", audioText: "れ", strokeCount: 2, jlpt: "N5", courseLevel: 9,
    meanings: ["hiragana re"], romaji: ["re"], readings: { kana: ["れ"] },
    svgPaths: [
      "M34.48,13c1.5,1.38,2.83,3.74,2.5,6.38c-0.5,4-2.75,44.5-2.75,52.88c0,8.38,0.12,16.62,0.12,19.5",
      "M16.98,40.75c2.12,1.38,3.74,1.46,7.5,0c4.5-1.75,6.55-2.66,13-5.5c4.25-1.88,4.4,0.24,2.5,3.5c-5.25,9-10.5,16.75-18.88,27.62c-7.55,9.81-6.93,12.85,3.25,3.12c14-13.38,20.34-19.76,33.88-32.5c6.38-6,19.39-12.09,18.14,0.88c-1.02,10.63-1.89,22.13-2.29,30.75c-1.02,21.71,11.53,18,20.15,8.63",
    ],
  },
  {
    id: "hiragana-ro", languageId: "lang-ja", courseId: "course-ja-char-9",
    label: "ろ", audioText: "ろ", strokeCount: 1, jlpt: "N5", courseLevel: 9,
    meanings: ["hiragana ro"], romaji: ["ro"], readings: { kana: ["ろ"] },
    svgPaths: [
      "M36.95,21.88c1.5,2,4.62,3.62,8.5,2.5c3.88-1.12,8.12-2.25,14.12-4.38c6-2.13,6.53-0.1,3.38,4.25c-7.88,10.88-18,22.75-27.5,35.25c-7.49,9.86-10.68,11.32,2.88,2.25c17.38-11.62,46.62-14,46.62,8.12c0,15.62-16,22.5-32.12,25.12",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HIRAGANA — Cours 10 : Série W わをん
  // ════════════════════════════════════════════════════════════════════════════

  {
    id: "hiragana-wa", languageId: "lang-ja", courseId: "course-ja-char-10",
    label: "わ", audioText: "わ", strokeCount: 2, jlpt: "N5", courseLevel: 10,
    meanings: ["hiragana wa"], romaji: ["wa"], readings: { kana: ["わ"] },
    svgPaths: [
      "M38.53,14.75c1.5,1.38,2.22,3.73,2,6.38c-1,11.87-2.75,44.49-2.75,52.87c0,8.38-0.62,16.62-0.62,19.5",
      "M17.53,40.75c2.12,1.38,3.68,1.3,7.5,0c5.88-2,9.8-3.16,16.25-6c4.25-1.88,6.12,0,2.75,4c-6.72,7.96-13,16.5-22.12,27.88c-7.75,9.66-7.54,12.21,3,2.88c21.88-19.38,49.75-35.62,63.5-21c14.36,15.27,1.62,36.62-23.38,42.62",
    ],
  },
  {
    id: "hiragana-wo", languageId: "lang-ja", courseId: "course-ja-char-10",
    label: "を", audioText: "を", strokeCount: 3, jlpt: "N5", courseLevel: 10,
    meanings: ["hiragana wo"], romaji: ["wo"], readings: { kana: ["を"] },
    svgPaths: [
      "M28.56,27.87c1.62,1.13,3.17,1.64,6.01,1.12c10.86-1.99,16.74-3.37,24.71-4.72c3.64-0.62,5.65-0.93,8.4-0.75",
      "M49.93,14.38c0.75,1,1.48,3.22,0.38,5.62c-4.62,10.12-10,20.75-17.12,30.25c-9.25,12.33-9.25,11.19,2.12,2.5c9-6.88,23.75-12.12,22.88,19.88",
      "M83.06,39.88c0.62,1.75,0,4-3,5.75c-3,1.75-49.62,24.16-44.75,38.25c3.28,9.48,17.93,9.12,29.98,7.75c4.48-0.51,9.15-1.12,12.4-1.75",
    ],
  },
  {
    id: "hiragana-n", languageId: "lang-ja", courseId: "course-ja-char-10",
    label: "ん", audioText: "ん", strokeCount: 1, jlpt: "N5", courseLevel: 10,
    meanings: ["hiragana n"], romaji: ["n"], readings: { kana: ["ん"] },
    svgPaths: [
      "M56.35,16.5c0.75,1.75,1.13,5.83-0.38,8.25c-7,11.25-27.22,43.47-33.88,54.37c-9,14.75-7.62,16.25,1.5,1.25c17.86-29.36,32-23.76,32-6.75c0,25,19,26.5,34.25-5",
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // CYRILLIQUE — Cours 1 : Voyelles А О У И Э Е Ю Я
  // ════════════════════════════════════════════════════════════════════════════

  { id: "cyrillic-a",  languageId: "lang-ru", courseId: "course-ru-char-1", label: "А", audioText: "А", strokeCount: printUpperStrokeCountMap.get("cyrillic-a")  ?? 3, courseLevel: 1, meanings: ["voyelle a"],   romaji: ["a"],   svgPaths: printUpperPathMap.get("cyrillic-a")  ?? ["M54,22 L26,88","M54,22 L82,88","M36,60 L72,60"] },
  { id: "cyrillic-o",  languageId: "lang-ru", courseId: "course-ru-char-1", label: "О", audioText: "О", strokeCount: printUpperStrokeCountMap.get("cyrillic-o")  ?? 1, courseLevel: 1, meanings: ["voyelle o"],   romaji: ["o"],   svgPaths: printUpperPathMap.get("cyrillic-o")  ?? ["M54,20 C74,20 88,36 88,55 C88,74 74,90 54,90 C34,90 20,74 20,55 C20,36 34,20 54,20"] },
  { id: "cyrillic-u",  languageId: "lang-ru", courseId: "course-ru-char-1", label: "У", audioText: "У", strokeCount: printUpperStrokeCountMap.get("cyrillic-u")  ?? 2, courseLevel: 1, meanings: ["voyelle ou"],  romaji: ["ou"],  svgPaths: printUpperPathMap.get("cyrillic-u")  ?? ["M24,22 L54,55","M84,22 L54,55 C50,68 40,82 32,92"] },
  { id: "cyrillic-i",  languageId: "lang-ru", courseId: "course-ru-char-1", label: "И", audioText: "И", strokeCount: printUpperStrokeCountMap.get("cyrillic-i")  ?? 3, courseLevel: 1, meanings: ["voyelle i"],   romaji: ["i"],   svgPaths: printUpperPathMap.get("cyrillic-i")  ?? ["M26,22 L26,88","M82,22 L82,88","M82,22 L26,88"] },
  { id: "cyrillic-e",  languageId: "lang-ru", courseId: "course-ru-char-1", label: "Э", audioText: "Э", strokeCount: printUpperStrokeCountMap.get("cyrillic-e")  ?? 2, courseLevel: 1, meanings: ["voyelle é"],   romaji: ["é"],   svgPaths: printUpperPathMap.get("cyrillic-e")  ?? ["M28,32 C28,18 86,18 86,55 C86,92 28,92 28,78","M86,55 L50,55"] },
  { id: "cyrillic-ye", languageId: "lang-ru", courseId: "course-ru-char-1", label: "Е", audioText: "Е", strokeCount: printUpperStrokeCountMap.get("cyrillic-ye") ?? 3, courseLevel: 1, meanings: ["voyelle yé"],  romaji: ["yé"],  svgPaths: printUpperPathMap.get("cyrillic-ye") ?? ["M82,22 L25,22 L25,88","M25,55 L70,55","M25,88 L82,88"] },
  { id: "cyrillic-yu", languageId: "lang-ru", courseId: "course-ru-char-1", label: "Ю", audioText: "Ю", strokeCount: printUpperStrokeCountMap.get("cyrillic-yu") ?? 3, courseLevel: 1, meanings: ["voyelle you"], romaji: ["you"], svgPaths: printUpperPathMap.get("cyrillic-yu") ?? ["M22,22 L22,88","M22,55 L40,55","M40,22 C60,22 80,36 80,55 C80,74 60,88 40,88"] },
  { id: "cyrillic-ya", languageId: "lang-ru", courseId: "course-ru-char-1", label: "Я", audioText: "Я", strokeCount: printUpperStrokeCountMap.get("cyrillic-ya") ?? 3, courseLevel: 1, meanings: ["voyelle ya"],  romaji: ["ya"],  svgPaths: printUpperPathMap.get("cyrillic-ya") ?? ["M80,22 L80,88","M80,22 C80,22 20,22 20,44 C20,58 54,60 80,58","M80,58 L24,88"] },

  // ════════════════════════════════════════════════════════════════════════════
  // CYRILLIQUE — Cours 2 : Consonnes I — Н Т М К Л П С Р Б В
  // ════════════════════════════════════════════════════════════════════════════

  { id: "cyrillic-n",  languageId: "lang-ru", courseId: "course-ru-char-2", label: "Н", audioText: "Н", strokeCount: printUpperStrokeCountMap.get("cyrillic-n")  ?? 3, courseLevel: 2, meanings: ["consonne n"], romaji: ["n"], svgPaths: printUpperPathMap.get("cyrillic-n")  ?? ["M28,22 L28,88","M82,22 L82,88","M28,55 L82,55"] },
  { id: "cyrillic-t",  languageId: "lang-ru", courseId: "course-ru-char-2", label: "Т", audioText: "Т", strokeCount: printUpperStrokeCountMap.get("cyrillic-t")  ?? 2, courseLevel: 2, meanings: ["consonne t"], romaji: ["t"], svgPaths: printUpperPathMap.get("cyrillic-t")  ?? ["M18,22 L90,22","M54,22 L54,88"] },
  { id: "cyrillic-m",  languageId: "lang-ru", courseId: "course-ru-char-2", label: "М", audioText: "М", strokeCount: printUpperStrokeCountMap.get("cyrillic-m")  ?? 3, courseLevel: 2, meanings: ["consonne m"], romaji: ["m"], svgPaths: printUpperPathMap.get("cyrillic-m")  ?? ["M22,88 L22,22","M22,22 L54,60 L86,22","M86,22 L86,88"] },
  { id: "cyrillic-k",  languageId: "lang-ru", courseId: "course-ru-char-2", label: "К", audioText: "К", strokeCount: printUpperStrokeCountMap.get("cyrillic-k")  ?? 3, courseLevel: 2, meanings: ["consonne k"], romaji: ["k"], svgPaths: printUpperPathMap.get("cyrillic-k")  ?? ["M28,22 L28,88","M28,52 L82,22","M28,52 L82,88"] },
  { id: "cyrillic-l",  languageId: "lang-ru", courseId: "course-ru-char-2", label: "Л", audioText: "Л", strokeCount: printUpperStrokeCountMap.get("cyrillic-l")  ?? 2, courseLevel: 2, meanings: ["consonne l"], romaji: ["l"], svgPaths: printUpperPathMap.get("cyrillic-l")  ?? ["M84,22 C60,22 34,26 26,88","M84,22 L84,88"] },
  { id: "cyrillic-p",  languageId: "lang-ru", courseId: "course-ru-char-2", label: "П", audioText: "П", strokeCount: printUpperStrokeCountMap.get("cyrillic-p")  ?? 3, courseLevel: 2, meanings: ["consonne p"], romaji: ["p"], svgPaths: printUpperPathMap.get("cyrillic-p")  ?? ["M25,22 L84,22","M25,22 L25,88","M84,22 L84,88"] },
  { id: "cyrillic-s",  languageId: "lang-ru", courseId: "course-ru-char-2", label: "С", audioText: "С", strokeCount: printUpperStrokeCountMap.get("cyrillic-s")  ?? 1, courseLevel: 2, meanings: ["consonne s"], romaji: ["s"], svgPaths: printUpperPathMap.get("cyrillic-s")  ?? ["M84,32 C84,20 22,20 22,55 C22,90 84,90 84,78"] },
  { id: "cyrillic-r",  languageId: "lang-ru", courseId: "course-ru-char-2", label: "Р", audioText: "Р", strokeCount: printUpperStrokeCountMap.get("cyrillic-r")  ?? 2, courseLevel: 2, meanings: ["consonne r"], romaji: ["r"], svgPaths: printUpperPathMap.get("cyrillic-r")  ?? ["M28,22 L28,88","M28,22 C52,20 82,26 82,44 C82,60 52,62 28,60"] },
  { id: "cyrillic-b",  languageId: "lang-ru", courseId: "course-ru-char-2", label: "Б", audioText: "Б", strokeCount: printUpperStrokeCountMap.get("cyrillic-b")  ?? 2, courseLevel: 2, meanings: ["consonne b"], romaji: ["b"], svgPaths: printUpperPathMap.get("cyrillic-b")  ?? ["M82,22 L25,22 L25,56","M25,53 C30,48 82,50 82,68 C82,88 55,90 25,88"] },
  { id: "cyrillic-v",  languageId: "lang-ru", courseId: "course-ru-char-2", label: "В", audioText: "В", strokeCount: printUpperStrokeCountMap.get("cyrillic-v")  ?? 3, courseLevel: 2, meanings: ["consonne v"], romaji: ["v"], svgPaths: printUpperPathMap.get("cyrillic-v")  ?? ["M28,22 L28,88","M28,22 C52,20 80,26 80,40 C80,55 52,56 28,55","M28,55 C52,53 84,60 84,74 C84,88 52,90 28,88"] },

  // ════════════════════════════════════════════════════════════════════════════
  // CYRILLIQUE — Cours 3 : Consonnes II — Г Д З Й Ф Х
  // ════════════════════════════════════════════════════════════════════════════

  { id: "cyrillic-g",   languageId: "lang-ru", courseId: "course-ru-char-3", label: "Г", audioText: "Г", strokeCount: printUpperStrokeCountMap.get("cyrillic-g")   ?? 2, courseLevel: 3, meanings: ["consonne g"],  romaji: ["g"],  svgPaths: printUpperPathMap.get("cyrillic-g")   ?? ["M25,22 L84,22","M25,22 L25,88"] },
  { id: "cyrillic-d",   languageId: "lang-ru", courseId: "course-ru-char-3", label: "Д", audioText: "Д", strokeCount: printUpperStrokeCountMap.get("cyrillic-d")   ?? 3, courseLevel: 3, meanings: ["consonne d"],  romaji: ["d"],  svgPaths: printUpperPathMap.get("cyrillic-d")   ?? ["M28,22 L28,88 L18,98","M28,22 L80,22 L80,88 L90,98","M18,88 L90,88"] },
  { id: "cyrillic-z",   languageId: "lang-ru", courseId: "course-ru-char-3", label: "З", audioText: "З", strokeCount: printUpperStrokeCountMap.get("cyrillic-z")   ?? 2, courseLevel: 3, meanings: ["consonne z"],  romaji: ["z"],  svgPaths: printUpperPathMap.get("cyrillic-z")   ?? ["M26,32 C26,18 84,18 84,42 C84,55 48,57 48,57","M48,57 C84,57 84,72 84,82 C84,96 26,96 26,80"] },
  { id: "cyrillic-j",   languageId: "lang-ru", courseId: "course-ru-char-3", label: "Й", audioText: "Й", strokeCount: printUpperStrokeCountMap.get("cyrillic-j")   ?? 4, courseLevel: 3, meanings: ["consonne y"],  romaji: ["y"],  svgPaths: printUpperPathMap.get("cyrillic-j")   ?? ["M26,22 L26,88","M82,22 L82,88","M82,22 L26,88","M36,12 C36,4 74,4 74,12"] },
  { id: "cyrillic-f",   languageId: "lang-ru", courseId: "course-ru-char-3", label: "Ф", audioText: "Ф", strokeCount: printUpperStrokeCountMap.get("cyrillic-f")   ?? 2, courseLevel: 3, meanings: ["consonne f"],  romaji: ["f"],  svgPaths: printUpperPathMap.get("cyrillic-f")   ?? ["M54,18 L54,92","M54,30 C34,30 20,42 20,55 C20,68 34,80 54,80 C74,80 88,68 88,55 C88,42 74,30 54,30"] },
  { id: "cyrillic-kh",  languageId: "lang-ru", courseId: "course-ru-char-3", label: "Х", audioText: "Х", strokeCount: printUpperStrokeCountMap.get("cyrillic-kh")  ?? 2, courseLevel: 3, meanings: ["consonne kh"], romaji: ["kh"], svgPaths: printUpperPathMap.get("cyrillic-kh")  ?? ["M22,22 L86,88","M86,22 L22,88"] },

  // ════════════════════════════════════════════════════════════════════════════
  // CYRILLIQUE — Cours 4 : Consonnes III complexes — Ж Ц Ч Ш
  // ════════════════════════════════════════════════════════════════════════════

  { id: "cyrillic-zh",  languageId: "lang-ru", courseId: "course-ru-char-4", label: "Ж", audioText: "Ж", strokeCount: printUpperStrokeCountMap.get("cyrillic-zh")  ?? 3, courseLevel: 4, meanings: ["consonne zh"],  romaji: ["zh"],  svgPaths: printUpperPathMap.get("cyrillic-zh")  ?? ["M54,22 L54,88","M22,22 L54,42 L22,88","M86,22 L54,42 L86,88"] },
  { id: "cyrillic-ts",  languageId: "lang-ru", courseId: "course-ru-char-4", label: "Ц", audioText: "Ц", strokeCount: printUpperStrokeCountMap.get("cyrillic-ts")  ?? 3, courseLevel: 4, meanings: ["consonne ts"],  romaji: ["ts"],  svgPaths: printUpperPathMap.get("cyrillic-ts")  ?? ["M25,22 L84,22","M25,22 L25,88","M84,22 L84,88 L92,96"] },
  { id: "cyrillic-ch",  languageId: "lang-ru", courseId: "course-ru-char-4", label: "Ч", audioText: "Ч", strokeCount: printUpperStrokeCountMap.get("cyrillic-ch")  ?? 2, courseLevel: 4, meanings: ["consonne tch"], romaji: ["tch"], svgPaths: printUpperPathMap.get("cyrillic-ch")  ?? ["M26,22 C26,42 50,56 80,56","M80,22 L80,88"] },
  { id: "cyrillic-sh",  languageId: "lang-ru", courseId: "course-ru-char-4", label: "Ш", audioText: "Ш", strokeCount: printUpperStrokeCountMap.get("cyrillic-sh")  ?? 4, courseLevel: 4, meanings: ["consonne ch"],  romaji: ["ch"],  svgPaths: printUpperPathMap.get("cyrillic-sh")  ?? ["M22,22 L86,22","M22,22 L22,88","M54,22 L54,88","M86,22 L86,88"] },

  // ════════════════════════════════════════════════════════════════════════════
  // CYRILLIQUE — Cours 5 : Signes spéciaux — Щ Ъ Ы Ь Ё
  // ════════════════════════════════════════════════════════════════════════════

  { id: "cyrillic-shch",      languageId: "lang-ru", courseId: "course-ru-char-5", label: "Щ", audioText: "Щ", strokeCount: printUpperStrokeCountMap.get("cyrillic-shch")      ?? 4, courseLevel: 5, meanings: ["consonne chtch"], romaji: ["chtch"], svgPaths: printUpperPathMap.get("cyrillic-shch")      ?? ["M22,22 L82,22","M22,22 L22,88","M52,22 L52,88","M82,22 L82,88 L90,96"] },
  { id: "cyrillic-hard-sign", languageId: "lang-ru", courseId: "course-ru-char-5", label: "Ъ", audioText: "Ъ", strokeCount: printUpperStrokeCountMap.get("cyrillic-hard-sign") ?? 3, courseLevel: 5, meanings: ["signe dur"],     romaji: ["ʺ"],     svgPaths: printUpperPathMap.get("cyrillic-hard-sign") ?? ["M22,22 L44,22","M44,22 L44,88","M44,55 C44,55 84,55 84,70 C84,88 58,90 44,88"] },
  { id: "cyrillic-yeru",      languageId: "lang-ru", courseId: "course-ru-char-5", label: "Ы", audioText: "Ы", strokeCount: printUpperStrokeCountMap.get("cyrillic-yeru")      ?? 3, courseLevel: 5, meanings: ["voyelle y"],     romaji: ["y"],     svgPaths: printUpperPathMap.get("cyrillic-yeru")      ?? ["M26,22 L26,88","M26,55 C26,55 66,55 66,70 C66,88 44,90 26,88","M78,22 L78,88"] },
  { id: "cyrillic-soft-sign", languageId: "lang-ru", courseId: "course-ru-char-5", label: "Ь", audioText: "Ь", strokeCount: printUpperStrokeCountMap.get("cyrillic-soft-sign") ?? 2, courseLevel: 5, meanings: ["signe mou"],     romaji: ["ʹ"],     svgPaths: printUpperPathMap.get("cyrillic-soft-sign") ?? ["M28,22 L28,88","M28,55 C28,55 82,55 82,70 C82,88 55,90 28,88"] },
  { id: "cyrillic-yo",        languageId: "lang-ru", courseId: "course-ru-char-5", label: "Ё", audioText: "Ё", strokeCount: printUpperStrokeCountMap.get("cyrillic-yo")        ?? 5, courseLevel: 5, meanings: ["voyelle yo"],    romaji: ["yo"],    svgPaths: printUpperPathMap.get("cyrillic-yo")        ?? ["M82,22 L25,22 L25,88","M25,55 L70,55","M25,88 L82,88","M38,10 L38,15","M62,10 L62,15"] },

  // ════════════════════════════════════════════════════════════════════════════
  // CYRILLIQUE MINUSCULES — Cours 6 : Voyelles а о у и э е ю я
  // ════════════════════════════════════════════════════════════════════════════

  { id: "cyrillic-a-lower",  languageId: "lang-ru", courseId: "course-ru-char-6", label: "а", audioText: "а", strokeCount: printLowerStrokeCountMap.get("cyrillic-a-lower")  ?? 2, courseLevel: 6, meanings: ["voyelle a"],   romaji: ["a"],   svgPaths: printLowerPathMap.get("cyrillic-a-lower")  ?? ["M68,44 C68,30 52,24 40,28 C24,32 18,48 18,60 C18,72 28,82 44,82 C60,82 68,74 68,62 L68,44","M68,44 L68,82"] },
  { id: "cyrillic-o-lower",  languageId: "lang-ru", courseId: "course-ru-char-6", label: "о", audioText: "о", strokeCount: printLowerStrokeCountMap.get("cyrillic-o-lower")  ?? 1, courseLevel: 6, meanings: ["voyelle o"],   romaji: ["o"],   svgPaths: printLowerPathMap.get("cyrillic-o-lower")  ?? ["M54,28 C74,28 86,42 86,57 C86,72 74,86 54,86 C34,86 22,72 22,57 C22,42 34,28 54,28"] },
  { id: "cyrillic-u-lower",  languageId: "lang-ru", courseId: "course-ru-char-6", label: "у", audioText: "у", strokeCount: printLowerStrokeCountMap.get("cyrillic-u-lower")  ?? 2, courseLevel: 6, meanings: ["voyelle ou"],  romaji: ["ou"],  svgPaths: printLowerPathMap.get("cyrillic-u-lower")  ?? ["M26,32 L54,57","M82,32 L54,57 C50,70 40,84 30,96"] },
  { id: "cyrillic-i-lower",  languageId: "lang-ru", courseId: "course-ru-char-6", label: "и", audioText: "и", strokeCount: printLowerStrokeCountMap.get("cyrillic-i-lower")  ?? 3, courseLevel: 6, meanings: ["voyelle i"],   romaji: ["i"],   svgPaths: printLowerPathMap.get("cyrillic-i-lower")  ?? ["M26,32 L26,82","M82,32 L82,82","M82,32 L26,82"] },
  { id: "cyrillic-e-lower",  languageId: "lang-ru", courseId: "course-ru-char-6", label: "э", audioText: "э", strokeCount: printLowerStrokeCountMap.get("cyrillic-e-lower")  ?? 2, courseLevel: 6, meanings: ["voyelle é"],   romaji: ["é"],   svgPaths: printLowerPathMap.get("cyrillic-e-lower")  ?? ["M28,42 C28,28 86,28 86,57 C86,86 28,86 28,72","M86,57 L50,57"] },
  { id: "cyrillic-ye-lower", languageId: "lang-ru", courseId: "course-ru-char-6", label: "е", audioText: "е", strokeCount: printLowerStrokeCountMap.get("cyrillic-ye-lower") ?? 3, courseLevel: 6, meanings: ["voyelle yé"],  romaji: ["yé"],  svgPaths: printLowerPathMap.get("cyrillic-ye-lower") ?? ["M80,32 L26,32 L26,82","M26,57 L68,57","M26,82 L80,82"] },
  { id: "cyrillic-yu-lower", languageId: "lang-ru", courseId: "course-ru-char-6", label: "ю", audioText: "ю", strokeCount: printLowerStrokeCountMap.get("cyrillic-yu-lower") ?? 3, courseLevel: 6, meanings: ["voyelle you"], romaji: ["you"], svgPaths: printLowerPathMap.get("cyrillic-yu-lower") ?? ["M22,32 L22,82","M22,57 L40,57","M40,32 C60,32 80,44 80,57 C80,70 60,82 40,82"] },
  { id: "cyrillic-ya-lower", languageId: "lang-ru", courseId: "course-ru-char-6", label: "я", audioText: "я", strokeCount: printLowerStrokeCountMap.get("cyrillic-ya-lower") ?? 3, courseLevel: 6, meanings: ["voyelle ya"],  romaji: ["ya"],  svgPaths: printLowerPathMap.get("cyrillic-ya-lower") ?? ["M80,32 L80,82","M80,32 C80,32 22,32 22,50 C22,62 54,64 80,62","M80,62 L26,82"] },

  // ════════════════════════════════════════════════════════════════════════════
  // CYRILLIQUE MINUSCULES — Cours 7 : Consonnes I н т м к л п с р б в
  // ════════════════════════════════════════════════════════════════════════════

  { id: "cyrillic-n-lower",  languageId: "lang-ru", courseId: "course-ru-char-7", label: "н", audioText: "н", strokeCount: printLowerStrokeCountMap.get("cyrillic-n-lower")  ?? 3, courseLevel: 7, meanings: ["consonne n"], romaji: ["n"], svgPaths: printLowerPathMap.get("cyrillic-n-lower")  ?? ["M28,32 L28,82","M82,32 L82,82","M28,57 L82,57"] },
  { id: "cyrillic-t-lower",  languageId: "lang-ru", courseId: "course-ru-char-7", label: "т", audioText: "т", strokeCount: printLowerStrokeCountMap.get("cyrillic-t-lower")  ?? 2, courseLevel: 7, meanings: ["consonne t"], romaji: ["t"], svgPaths: printLowerPathMap.get("cyrillic-t-lower")  ?? ["M20,40 L88,40","M54,40 L54,82"] },
  { id: "cyrillic-m-lower",  languageId: "lang-ru", courseId: "course-ru-char-7", label: "м", audioText: "м", strokeCount: printLowerStrokeCountMap.get("cyrillic-m-lower")  ?? 3, courseLevel: 7, meanings: ["consonne m"], romaji: ["m"], svgPaths: printLowerPathMap.get("cyrillic-m-lower")  ?? ["M22,82 L22,32","M22,32 L54,60 L86,32","M86,32 L86,82"] },
  { id: "cyrillic-k-lower",  languageId: "lang-ru", courseId: "course-ru-char-7", label: "к", audioText: "к", strokeCount: printLowerStrokeCountMap.get("cyrillic-k-lower")  ?? 3, courseLevel: 7, meanings: ["consonne k"], romaji: ["k"], svgPaths: printLowerPathMap.get("cyrillic-k-lower")  ?? ["M28,32 L28,82","M28,57 L78,32","M28,57 L78,82"] },
  { id: "cyrillic-l-lower",  languageId: "lang-ru", courseId: "course-ru-char-7", label: "л", audioText: "л", strokeCount: printLowerStrokeCountMap.get("cyrillic-l-lower")  ?? 2, courseLevel: 7, meanings: ["consonne l"], romaji: ["l"], svgPaths: printLowerPathMap.get("cyrillic-l-lower")  ?? ["M84,32 C60,32 34,36 26,82","M84,32 L84,82"] },
  { id: "cyrillic-p-lower",  languageId: "lang-ru", courseId: "course-ru-char-7", label: "п", audioText: "п", strokeCount: printLowerStrokeCountMap.get("cyrillic-p-lower")  ?? 3, courseLevel: 7, meanings: ["consonne p"], romaji: ["p"], svgPaths: printLowerPathMap.get("cyrillic-p-lower")  ?? ["M25,32 L84,32","M25,32 L25,82","M84,32 L84,82"] },
  { id: "cyrillic-s-lower",  languageId: "lang-ru", courseId: "course-ru-char-7", label: "с", audioText: "с", strokeCount: printLowerStrokeCountMap.get("cyrillic-s-lower")  ?? 1, courseLevel: 7, meanings: ["consonne s"], romaji: ["s"], svgPaths: printLowerPathMap.get("cyrillic-s-lower")  ?? ["M80,42 C80,28 22,28 22,57 C22,86 80,86 80,72"] },
  { id: "cyrillic-r-lower",  languageId: "lang-ru", courseId: "course-ru-char-7", label: "р", audioText: "р", strokeCount: printLowerStrokeCountMap.get("cyrillic-r-lower")  ?? 2, courseLevel: 7, meanings: ["consonne r"], romaji: ["r"], svgPaths: printLowerPathMap.get("cyrillic-r-lower")  ?? ["M28,32 L28,96","M28,32 C52,28 78,36 78,54 C78,68 52,72 28,68"] },
  { id: "cyrillic-b-lower",  languageId: "lang-ru", courseId: "course-ru-char-7", label: "б", audioText: "б", strokeCount: printLowerStrokeCountMap.get("cyrillic-b-lower")  ?? 2, courseLevel: 7, meanings: ["consonne b"], romaji: ["b"], svgPaths: printLowerPathMap.get("cyrillic-b-lower")  ?? ["M80,30 L30,30","M30,30 C18,30 16,48 16,62 C16,76 28,88 46,88 C62,88 74,76 74,62 C74,48 62,38 46,38 C32,38 18,46 18,62"] },
  { id: "cyrillic-v-lower",  languageId: "lang-ru", courseId: "course-ru-char-7", label: "в", audioText: "в", strokeCount: printLowerStrokeCountMap.get("cyrillic-v-lower")  ?? 3, courseLevel: 7, meanings: ["consonne v"], romaji: ["v"], svgPaths: printLowerPathMap.get("cyrillic-v-lower")  ?? ["M28,32 L28,82","M28,32 C48,30 72,36 72,48 C72,58 48,60 28,58","M28,58 C48,56 76,62 76,72 C76,82 48,84 28,82"] },

  // ════════════════════════════════════════════════════════════════════════════
  // CYRILLIQUE MINUSCULES — Cours 8 : Consonnes II г д з й ф х
  // ════════════════════════════════════════════════════════════════════════════

  { id: "cyrillic-g-lower",  languageId: "lang-ru", courseId: "course-ru-char-8", label: "г", audioText: "г", strokeCount: printLowerStrokeCountMap.get("cyrillic-g-lower")  ?? 1, courseLevel: 8, meanings: ["consonne g"],  romaji: ["g"],  svgPaths: printLowerPathMap.get("cyrillic-g-lower")  ?? ["M78,32 L26,32 L26,82"] },
  { id: "cyrillic-d-lower",  languageId: "lang-ru", courseId: "course-ru-char-8", label: "д", audioText: "д", strokeCount: printLowerStrokeCountMap.get("cyrillic-d-lower")  ?? 3, courseLevel: 8, meanings: ["consonne d"],  romaji: ["d"],  svgPaths: printLowerPathMap.get("cyrillic-d-lower")  ?? ["M30,32 L30,82 L20,96","M30,32 L78,32 L78,82 L88,96","M20,82 L88,82"] },
  { id: "cyrillic-z-lower",  languageId: "lang-ru", courseId: "course-ru-char-8", label: "з", audioText: "з", strokeCount: printLowerStrokeCountMap.get("cyrillic-z-lower")  ?? 2, courseLevel: 8, meanings: ["consonne z"],  romaji: ["z"],  svgPaths: printLowerPathMap.get("cyrillic-z-lower")  ?? ["M26,42 C26,28 82,28 82,52 C82,58 52,62 52,62","M52,62 C82,62 82,74 82,82 C82,96 26,96 26,78"] },
  { id: "cyrillic-j-lower",  languageId: "lang-ru", courseId: "course-ru-char-8", label: "й", audioText: "й", strokeCount: printLowerStrokeCountMap.get("cyrillic-j-lower")  ?? 4, courseLevel: 8, meanings: ["consonne y"],  romaji: ["y"],  svgPaths: printLowerPathMap.get("cyrillic-j-lower")  ?? ["M26,32 L26,82","M82,32 L82,82","M82,32 L26,82","M36,18 C36,10 74,10 74,18"] },
  { id: "cyrillic-f-lower",  languageId: "lang-ru", courseId: "course-ru-char-8", label: "ф", audioText: "ф", strokeCount: printLowerStrokeCountMap.get("cyrillic-f-lower")  ?? 2, courseLevel: 8, meanings: ["consonne f"],  romaji: ["f"],  svgPaths: printLowerPathMap.get("cyrillic-f-lower")  ?? ["M54,18 L54,96","M54,34 C34,34 20,46 20,59 C20,72 34,82 54,82 C74,82 88,72 88,59 C88,46 74,34 54,34"] },
  { id: "cyrillic-kh-lower", languageId: "lang-ru", courseId: "course-ru-char-8", label: "х", audioText: "х", strokeCount: printLowerStrokeCountMap.get("cyrillic-kh-lower") ?? 2, courseLevel: 8, meanings: ["consonne kh"], romaji: ["kh"], svgPaths: printLowerPathMap.get("cyrillic-kh-lower") ?? ["M24,32 L84,82","M84,32 L24,82"] },

  // ════════════════════════════════════════════════════════════════════════════
  // CYRILLIQUE MINUSCULES — Cours 9 : Consonnes III ж ц ч ш
  // ════════════════════════════════════════════════════════════════════════════

  { id: "cyrillic-zh-lower",   languageId: "lang-ru", courseId: "course-ru-char-9", label: "ж", audioText: "ж", strokeCount: printLowerStrokeCountMap.get("cyrillic-zh-lower")   ?? 3, courseLevel: 9, meanings: ["consonne zh"],  romaji: ["zh"],  svgPaths: printLowerPathMap.get("cyrillic-zh-lower")   ?? ["M54,32 L54,82","M22,32 L54,57 L22,82","M86,32 L54,57 L86,82"] },
  { id: "cyrillic-ts-lower",   languageId: "lang-ru", courseId: "course-ru-char-9", label: "ц", audioText: "ц", strokeCount: printLowerStrokeCountMap.get("cyrillic-ts-lower")   ?? 3, courseLevel: 9, meanings: ["consonne ts"],  romaji: ["ts"],  svgPaths: printLowerPathMap.get("cyrillic-ts-lower")   ?? ["M25,32 L82,32","M25,32 L25,82","M82,32 L82,82 L90,96"] },
  { id: "cyrillic-ch-lower",   languageId: "lang-ru", courseId: "course-ru-char-9", label: "ч", audioText: "ч", strokeCount: printLowerStrokeCountMap.get("cyrillic-ch-lower")   ?? 2, courseLevel: 9, meanings: ["consonne tch"], romaji: ["tch"], svgPaths: printLowerPathMap.get("cyrillic-ch-lower")   ?? ["M26,32 C26,52 50,60 80,60","M80,32 L80,82"] },
  { id: "cyrillic-sh-lower",   languageId: "lang-ru", courseId: "course-ru-char-9", label: "ш", audioText: "ш", strokeCount: printLowerStrokeCountMap.get("cyrillic-sh-lower")   ?? 4, courseLevel: 9, meanings: ["consonne ch"],  romaji: ["ch"],  svgPaths: printLowerPathMap.get("cyrillic-sh-lower")   ?? ["M22,32 L86,32","M22,32 L22,82","M54,32 L54,82","M86,32 L86,82"] },

  // ════════════════════════════════════════════════════════════════════════════
  // CYRILLIQUE MINUSCULES — Cours 10 : Signes spéciaux щ ъ ы ь ё
  // ════════════════════════════════════════════════════════════════════════════

  { id: "cyrillic-shch-lower",      languageId: "lang-ru", courseId: "course-ru-char-10", label: "щ", audioText: "щ", strokeCount: printLowerStrokeCountMap.get("cyrillic-shch-lower")      ?? 4, courseLevel: 10, meanings: ["consonne chtch"], romaji: ["chtch"], svgPaths: printLowerPathMap.get("cyrillic-shch-lower")      ?? ["M22,32 L82,32","M22,32 L22,82","M52,32 L52,82","M82,32 L82,82 L90,96"] },
  { id: "cyrillic-hard-sign-lower",  languageId: "lang-ru", courseId: "course-ru-char-10", label: "ъ", audioText: "ъ", strokeCount: printLowerStrokeCountMap.get("cyrillic-hard-sign-lower")  ?? 3, courseLevel: 10, meanings: ["signe dur"],     romaji: ["ʺ"],     svgPaths: printLowerPathMap.get("cyrillic-hard-sign-lower")  ?? ["M22,32 L44,32","M44,32 L44,82","M44,57 C44,57 82,57 82,70 C82,82 58,84 44,82"] },
  { id: "cyrillic-yeru-lower",       languageId: "lang-ru", courseId: "course-ru-char-10", label: "ы", audioText: "ы", strokeCount: printLowerStrokeCountMap.get("cyrillic-yeru-lower")       ?? 3, courseLevel: 10, meanings: ["voyelle y"],     romaji: ["y"],     svgPaths: printLowerPathMap.get("cyrillic-yeru-lower")       ?? ["M26,32 L26,82","M26,57 C26,57 64,57 64,70 C64,82 44,84 26,82","M78,32 L78,82"] },
  { id: "cyrillic-soft-sign-lower",  languageId: "lang-ru", courseId: "course-ru-char-10", label: "ь", audioText: "ь", strokeCount: printLowerStrokeCountMap.get("cyrillic-soft-sign-lower")  ?? 2, courseLevel: 10, meanings: ["signe mou"],     romaji: ["ʹ"],     svgPaths: printLowerPathMap.get("cyrillic-soft-sign-lower")  ?? ["M28,32 L28,82","M28,57 C28,57 80,57 80,70 C80,82 55,84 28,82"] },
  { id: "cyrillic-yo-lower",         languageId: "lang-ru", courseId: "course-ru-char-10", label: "ё", audioText: "ё", strokeCount: printLowerStrokeCountMap.get("cyrillic-yo-lower")         ?? 5, courseLevel: 10, meanings: ["voyelle yo"],    romaji: ["yo"],    svgPaths: printLowerPathMap.get("cyrillic-yo-lower")         ?? ["M80,32 L26,32 L26,82","M26,57 L68,57","M26,82 L80,82","M38,18 L38,22","M62,18 L62,22"] },
];

// ─── Mots ─────────────────────────────────────────────────────────────────────

type WordSeed = {
  id: string; languageId: string; courseId: string;
  text: string; kana?: string; reading?: string;
  meaning: string; audioText?: string; courseLevel: number;
  etymology?: string; components?: string;
};

const WORDS: WordSeed[] = [
  // ── Japonais — Cours 1 : Nature & éléments (kanji) ───────────────────────
  {
    id: "ja-word-mizu", languageId: "lang-ja", courseId: "course-ja-word-1",
    text: "水", kana: "みず", reading: "mizu", meaning: "eau", audioText: "みず", courseLevel: 1,
    etymology: "Pictogramme de l'eau qui s'écoule entre des rochers — trois courants ondulés.",
    components: JSON.stringify([{ char: "水", meaning: "eau (radical 氵 en composition)" }]),
  },
  {
    id: "ja-word-yama", languageId: "lang-ja", courseId: "course-ja-word-1",
    text: "山", kana: "やま", reading: "yama", meaning: "montagne", audioText: "やま", courseLevel: 1,
    etymology: "Trois pics montagneux vus de face, le central plus haut.",
    components: JSON.stringify([{ char: "山", meaning: "montagne (radical)" }]),
  },
  {
    id: "ja-word-kawa", languageId: "lang-ja", courseId: "course-ja-word-1",
    text: "川", kana: "かわ", reading: "kawa", meaning: "rivière", audioText: "かわ", courseLevel: 1,
    etymology: "Trois courants parallèles qui représentent l'eau qui coule.",
    components: JSON.stringify([{ char: "川", meaning: "rivière (radical)" }]),
  },
  {
    id: "ja-word-hana", languageId: "lang-ja", courseId: "course-ja-word-1",
    text: "花", kana: "はな", reading: "hana", meaning: "fleur", audioText: "はな", courseLevel: 1,
    etymology: "艹 (herbe) + 化 (transformation) — la plante qui se transforme en beauté.",
    components: JSON.stringify([{ char: "艹", meaning: "herbe (radical)" }, { char: "化", meaning: "transformation" }]),
  },
  {
    id: "ja-word-tsuki", languageId: "lang-ja", courseId: "course-ja-word-1",
    text: "月", kana: "つき", reading: "tsuki", meaning: "lune / mois", audioText: "つき", courseLevel: 1,
    etymology: "Représente le croissant de lune. Sert aussi à compter les mois.",
    components: JSON.stringify([{ char: "月", meaning: "lune / mois (radical)" }]),
  },
  {
    id: "ja-word-hoshi", languageId: "lang-ja", courseId: "course-ja-word-1",
    text: "星", kana: "ほし", reading: "hoshi", meaning: "étoile", audioText: "ほし", courseLevel: 1,
    etymology: "日 (soleil / lumière) + 生 (naître) — corps céleste qui émet de la lumière.",
    components: JSON.stringify([{ char: "日", meaning: "soleil / lumière" }, { char: "生", meaning: "naître / vivre" }]),
  },
  {
    id: "ja-word-umi", languageId: "lang-ja", courseId: "course-ja-word-1",
    text: "海", kana: "うみ", reading: "umi", meaning: "mer", audioText: "うみ", courseLevel: 1,
    etymology: "氵(eau) + 母 (mère) — les eaux de la mère, source originelle de la vie.",
    components: JSON.stringify([{ char: "氵", meaning: "eau (radical)" }, { char: "母", meaning: "mère" }]),
  },
  {
    id: "ja-word-ame", languageId: "lang-ja", courseId: "course-ja-word-1",
    text: "雨", kana: "あめ", reading: "ame", meaning: "pluie", audioText: "あめ", courseLevel: 1,
    etymology: "Un nuage (上) d'où tombent des gouttes d'eau (les traits intérieurs). Radical météo.",
    components: JSON.stringify([{ char: "雨", meaning: "pluie (radical météo — 雪 neige, 雷 tonnerre)" }]),
  },
  {
    id: "ja-word-hi", languageId: "lang-ja", courseId: "course-ja-word-1",
    text: "火", kana: "ひ", reading: "hi", meaning: "feu", audioText: "ひ", courseLevel: 1,
    etymology: "Deux flammes qui s'élèvent de chaque côté d'un foyer central.",
    components: JSON.stringify([{ char: "火", meaning: "feu (radical 灬 en bas de composition)" }]),
  },
  {
    id: "ja-word-ki", languageId: "lang-ja", courseId: "course-ja-word-1",
    text: "木", kana: "き", reading: "ki", meaning: "arbre / bois", audioText: "き", courseLevel: 1,
    etymology: "Tronc vertical avec branches en haut et racines en bas — l'arbre dans sa totalité.",
    components: JSON.stringify([{ char: "木", meaning: "arbre / bois (radical)" }]),
  },

  // ── Japonais — Cours 2 : Animaux & couleurs (kanji) ──────────────────────
  {
    id: "ja-word-inu", languageId: "lang-ja", courseId: "course-ja-word-2",
    text: "犬", kana: "いぬ", reading: "inu", meaning: "chien", audioText: "いぬ", courseLevel: 2,
    etymology: "大 (grand / homme debout) avec un petit trait — l'animal compagnon de l'homme.",
    components: JSON.stringify([{ char: "大", meaning: "grand / homme debout" }, { char: "丶", meaning: "petit trait distinctif" }]),
  },
  {
    id: "ja-word-neko", languageId: "lang-ja", courseId: "course-ja-word-2",
    text: "猫", kana: "ねこ", reading: "neko", meaning: "chat", audioText: "ねこ", courseLevel: 2,
    etymology: "犭 (animal) + 苗 (semis / plant cultivé) — l'animal qui garde les champs des rongeurs.",
    components: JSON.stringify([{ char: "犭", meaning: "animal (radical)" }, { char: "苗", meaning: "plant, semis" }]),
  },
  {
    id: "ja-word-tori", languageId: "lang-ja", courseId: "course-ja-word-2",
    text: "鳥", kana: "とり", reading: "tori", meaning: "oiseau", audioText: "とり", courseLevel: 2,
    etymology: "Silhouette détaillée d'un oiseau avec tête, corps et longue queue.",
    components: JSON.stringify([{ char: "鳥", meaning: "oiseau (radical)" }]),
  },
  {
    id: "ja-word-sakana", languageId: "lang-ja", courseId: "course-ja-word-2",
    text: "魚", kana: "さかな", reading: "sakana", meaning: "poisson", audioText: "さかな", courseLevel: 2,
    etymology: "Silhouette d'un poisson vue de côté : tête, corps, et queue en 灬.",
    components: JSON.stringify([{ char: "魚", meaning: "poisson (radical)" }]),
  },
  {
    id: "ja-word-ao", languageId: "lang-ja", courseId: "course-ja-word-2",
    text: "青", kana: "あお", reading: "ao", meaning: "bleu / vert", audioText: "あお", courseLevel: 2,
    etymology: "生 (pousser / vivre) + 井 (puits) — la couleur de la végétation fraîche au bord de l'eau.",
    components: JSON.stringify([{ char: "生", meaning: "pousser / vivre" }, { char: "井", meaning: "puits / source" }]),
  },
  {
    id: "ja-word-aka", languageId: "lang-ja", courseId: "course-ja-word-2",
    text: "赤", kana: "あか", reading: "aka", meaning: "rouge", audioText: "あか", courseLevel: 2,
    etymology: "大 (personne) + 火 (feu) — la couleur du feu et du sang.",
    components: JSON.stringify([{ char: "大", meaning: "personne / grand" }, { char: "火", meaning: "feu" }]),
  },
  {
    id: "ja-word-shiro", languageId: "lang-ja", courseId: "course-ja-word-2",
    text: "白", kana: "しろ", reading: "shiro", meaning: "blanc", audioText: "しろ", courseLevel: 2,
    etymology: "日 (soleil) avec une marque lumineuse en haut — la pureté de la première lumière du jour.",
    components: JSON.stringify([{ char: "日", meaning: "soleil" }, { char: "丿", meaning: "rayon de lumière" }]),
  },
  {
    id: "ja-word-kuro", languageId: "lang-ja", courseId: "course-ja-word-2",
    text: "黒", kana: "くろ", reading: "kuro", meaning: "noir", audioText: "くろ", courseLevel: 2,
    etymology: "里 (village / champ) + 炎 (flammes) → suie de fumée, couleur de la nuit.",
    components: JSON.stringify([{ char: "里", meaning: "village / champ" }, { char: "灬", meaning: "flammes (bas)" }]),
  },
  {
    id: "ja-word-sora", languageId: "lang-ja", courseId: "course-ja-word-2",
    text: "空", kana: "そら", reading: "sora", meaning: "ciel / vide", audioText: "そら", courseLevel: 2,
    etymology: "穴 (grotte / vide) + 工 (travail / structure) — l'espace vide et infini au-dessus de nous.",
    components: JSON.stringify([{ char: "穴", meaning: "trou / vide" }, { char: "工", meaning: "structure / travail" }]),
  },
  {
    id: "ja-word-kaze", languageId: "lang-ja", courseId: "course-ja-word-2",
    text: "風", kana: "かぜ", reading: "kaze", meaning: "vent", audioText: "かぜ", courseLevel: 2,
    etymology: "凡 (voile de bateau) dans une enveloppe — la force naturelle invisible qui gonfle les voiles.",
    components: JSON.stringify([{ char: "几", meaning: "enveloppe / contenant" }, { char: "虫", meaning: "insecte (phonétique)" }]),
  },

  // ── Russe — Cours 1 : Famille (MAJUSCULES) ───────────────────────────────
  { id: "ru-word-mama",  languageId: "lang-ru", courseId: "course-ru-word-1", text: "МАМА",  reading: "mama",  meaning: "maman",        audioText: "мама",  courseLevel: 1 },
  { id: "ru-word-papa",  languageId: "lang-ru", courseId: "course-ru-word-1", text: "ПАПА",  reading: "papa",  meaning: "papa",         audioText: "папа",  courseLevel: 1 },
  { id: "ru-word-dom",   languageId: "lang-ru", courseId: "course-ru-word-1", text: "ДОМ",   reading: "dom",   meaning: "maison",       audioText: "дом",   courseLevel: 1 },
  { id: "ru-word-da",    languageId: "lang-ru", courseId: "course-ru-word-1", text: "ДА",    reading: "da",    meaning: "oui",          audioText: "да",    courseLevel: 1 },
  { id: "ru-word-nyet",  languageId: "lang-ru", courseId: "course-ru-word-1", text: "НЕТ",   reading: "nyet",  meaning: "non",          audioText: "нет",   courseLevel: 1 },
  { id: "ru-word-drug",  languageId: "lang-ru", courseId: "course-ru-word-1", text: "ДРУГ",  reading: "drug",  meaning: "ami",          audioText: "друг",  courseLevel: 1 },
  { id: "ru-word-mir",   languageId: "lang-ru", courseId: "course-ru-word-1", text: "МИР",   reading: "mir",   meaning: "monde / paix", audioText: "мир",   courseLevel: 1 },
  { id: "ru-word-kot",   languageId: "lang-ru", courseId: "course-ru-word-1", text: "КОТ",   reading: "kot",   meaning: "chat (mâle)",  audioText: "кот",   courseLevel: 1 },

  // ── Russe — Cours 2 : Nature (MAJUSCULES) ─────────────────────────────────
  { id: "ru-word-voda",  languageId: "lang-ru", courseId: "course-ru-word-2", text: "ВОДА",  reading: "voda",  meaning: "eau",          audioText: "вода",  courseLevel: 2 },
  { id: "ru-word-khleb", languageId: "lang-ru", courseId: "course-ru-word-2", text: "ХЛЕБ",  reading: "khleb", meaning: "pain",         audioText: "хлеб",  courseLevel: 2 },
  { id: "ru-word-les",   languageId: "lang-ru", courseId: "course-ru-word-2", text: "ЛЕС",   reading: "les",   meaning: "forêt",        audioText: "лес",   courseLevel: 2 },
  { id: "ru-word-more",  languageId: "lang-ru", courseId: "course-ru-word-2", text: "МОРЕ",  reading: "morye", meaning: "mer",          audioText: "море",  courseLevel: 2 },
  { id: "ru-word-gora",  languageId: "lang-ru", courseId: "course-ru-word-2", text: "ГОРА",  reading: "gora",  meaning: "montagne",     audioText: "гора",  courseLevel: 2 },
  { id: "ru-word-reka",  languageId: "lang-ru", courseId: "course-ru-word-2", text: "РЕКА",  reading: "reka",  meaning: "rivière",      audioText: "река",  courseLevel: 2 },
  { id: "ru-word-ryba",  languageId: "lang-ru", courseId: "course-ru-word-2", text: "РЫБА",  reading: "ryba",  meaning: "poisson",      audioText: "рыба",  courseLevel: 2 },
  { id: "ru-word-moloko",languageId: "lang-ru", courseId: "course-ru-word-2", text: "МОЛОКО",reading: "moloko",meaning: "lait",         audioText: "молоко",courseLevel: 2 },

  // ── Russe — Cours 3 : Famille (minuscules) ────────────────────────────────
  { id: "ru-word-mama-l",  languageId: "lang-ru", courseId: "course-ru-word-3", text: "мама",  reading: "mama",  meaning: "maman",        audioText: "мама",  courseLevel: 3 },
  { id: "ru-word-papa-l",  languageId: "lang-ru", courseId: "course-ru-word-3", text: "папа",  reading: "papa",  meaning: "papa",         audioText: "папа",  courseLevel: 3 },
  { id: "ru-word-dom-l",   languageId: "lang-ru", courseId: "course-ru-word-3", text: "дом",   reading: "dom",   meaning: "maison",       audioText: "дом",   courseLevel: 3 },
  { id: "ru-word-da-l",    languageId: "lang-ru", courseId: "course-ru-word-3", text: "да",    reading: "da",    meaning: "oui",          audioText: "да",    courseLevel: 3 },
  { id: "ru-word-nyet-l",  languageId: "lang-ru", courseId: "course-ru-word-3", text: "нет",   reading: "nyet",  meaning: "non",          audioText: "нет",   courseLevel: 3 },
  { id: "ru-word-drug-l",  languageId: "lang-ru", courseId: "course-ru-word-3", text: "друг",  reading: "drug",  meaning: "ami",          audioText: "друг",  courseLevel: 3 },
  { id: "ru-word-mir-l",   languageId: "lang-ru", courseId: "course-ru-word-3", text: "мир",   reading: "mir",   meaning: "monde / paix", audioText: "мир",   courseLevel: 3 },
  { id: "ru-word-kot-l",   languageId: "lang-ru", courseId: "course-ru-word-3", text: "кот",   reading: "kot",   meaning: "chat (mâle)",  audioText: "кот",   courseLevel: 3 },

  // ── Russe — Cours 4 : Nature (minuscules) ─────────────────────────────────
  { id: "ru-word-voda-l",  languageId: "lang-ru", courseId: "course-ru-word-4", text: "вода",  reading: "voda",  meaning: "eau",          audioText: "вода",  courseLevel: 4 },
  { id: "ru-word-khleb-l", languageId: "lang-ru", courseId: "course-ru-word-4", text: "хлеб",  reading: "khleb", meaning: "pain",         audioText: "хлеб",  courseLevel: 4 },
  { id: "ru-word-les-l",   languageId: "lang-ru", courseId: "course-ru-word-4", text: "лес",   reading: "les",   meaning: "forêt",        audioText: "лес",   courseLevel: 4 },
  { id: "ru-word-more-l",  languageId: "lang-ru", courseId: "course-ru-word-4", text: "море",  reading: "morye", meaning: "mer",          audioText: "море",  courseLevel: 4 },
  { id: "ru-word-gora-l",  languageId: "lang-ru", courseId: "course-ru-word-4", text: "гора",  reading: "gora",  meaning: "montagne",     audioText: "гора",  courseLevel: 4 },
  { id: "ru-word-reka-l",  languageId: "lang-ru", courseId: "course-ru-word-4", text: "река",  reading: "reka",  meaning: "rivière",      audioText: "река",  courseLevel: 4 },
  { id: "ru-word-ryba-l",  languageId: "lang-ru", courseId: "course-ru-word-4", text: "рыба",  reading: "ryba",  meaning: "poisson",      audioText: "рыба",  courseLevel: 4 },
  { id: "ru-word-moloko-l",languageId: "lang-ru", courseId: "course-ru-word-4", text: "молоко",reading: "moloko",meaning: "lait",         audioText: "молоко",courseLevel: 4 },
];

// ─── Phrases ──────────────────────────────────────────────────────────────────

type PhraseSeed = { id: string; languageId: string; courseId: string; text: string; reading?: string; translation: string; audioText?: string; courseLevel: number };

const PHRASES: PhraseSeed[] = [
  // ── Japonais — Cours 1 : Salutations ──────────────────────────────────────
  { id: "ja-phrase-ohayou",    languageId: "lang-ja", courseId: "course-ja-phrase-1", text: "おはようございます",      reading: "Ohayou gozaimasu",     translation: "Bonjour (le matin)",          audioText: "おはようございます",     courseLevel: 1 },
  { id: "ja-phrase-konnichiwa",languageId: "lang-ja", courseId: "course-ja-phrase-1", text: "こんにちは",              reading: "Konnichiwa",            translation: "Bonjour (l'après-midi)",      audioText: "こんにちは",             courseLevel: 1 },
  { id: "ja-phrase-konbanwa",  languageId: "lang-ja", courseId: "course-ja-phrase-1", text: "こんばんは",              reading: "Konbanwa",              translation: "Bonsoir",                     audioText: "こんばんは",             courseLevel: 1 },
  { id: "ja-phrase-arigatou",  languageId: "lang-ja", courseId: "course-ja-phrase-1", text: "ありがとうございます",     reading: "Arigatou gozaimasu",   translation: "Merci beaucoup",              audioText: "ありがとうございます",   courseLevel: 1 },
  { id: "ja-phrase-sumimasen", languageId: "lang-ja", courseId: "course-ja-phrase-1", text: "すみません",              reading: "Sumimasen",             translation: "Excusez-moi",                 audioText: "すみません",             courseLevel: 1 },
  { id: "ja-phrase-hai",       languageId: "lang-ja", courseId: "course-ja-phrase-1", text: "はい",                    reading: "Hai",                   translation: "Oui",                         audioText: "はい",                   courseLevel: 1 },
  { id: "ja-phrase-iie",       languageId: "lang-ja", courseId: "course-ja-phrase-1", text: "いいえ",                  reading: "Iie",                   translation: "Non",                         audioText: "いいえ",                 courseLevel: 1 },
  { id: "ja-phrase-douzo",     languageId: "lang-ja", courseId: "course-ja-phrase-1", text: "どうぞ",                  reading: "Douzo",                 translation: "Je vous en prie / Voilà",     audioText: "どうぞ",                 courseLevel: 1 },
  { id: "ja-phrase-gomennasai",languageId: "lang-ja", courseId: "course-ja-phrase-1", text: "ごめんなさい",             reading: "Gomennasai",            translation: "Pardon / Désolé(e)",          audioText: "ごめんなさい",           courseLevel: 1 },
  { id: "ja-phrase-sayounara", languageId: "lang-ja", courseId: "course-ja-phrase-1", text: "さようなら",              reading: "Sayounara",             translation: "Au revoir",                   audioText: "さようなら",             courseLevel: 1 },

  // ── Japonais — Cours 2 : Présentation ────────────────────────────────────
  { id: "ja-phrase-ogenki",    languageId: "lang-ja", courseId: "course-ja-phrase-2", text: "おげんきですか？",         reading: "Ogenki desu ka?",       translation: "Comment allez-vous ?",        audioText: "おげんきですか",         courseLevel: 2 },
  { id: "ja-phrase-genki",     languageId: "lang-ja", courseId: "course-ja-phrase-2", text: "はい、げんきです",         reading: "Hai, genki desu",       translation: "Oui, je vais bien",           audioText: "はい、げんきです",       courseLevel: 2 },
  { id: "ja-phrase-namae",     languageId: "lang-ja", courseId: "course-ja-phrase-2", text: "おなまえは？",             reading: "Onamae wa?",            translation: "Quel est votre nom ?",        audioText: "おなまえは",             courseLevel: 2 },
  { id: "ja-phrase-watashi",   languageId: "lang-ja", courseId: "course-ja-phrase-2", text: "わたしは がくせい です",   reading: "Watashi wa gakusei desu",translation: "Je suis étudiant(e)",        audioText: "わたしは がくせい です", courseLevel: 2 },
  { id: "ja-phrase-wakarimasu",languageId: "lang-ja", courseId: "course-ja-phrase-2", text: "わかります",              reading: "Wakarimasu",            translation: "Je comprends",                audioText: "わかります",             courseLevel: 2 },
  { id: "ja-phrase-wakarimasen",languageId: "lang-ja",courseId: "course-ja-phrase-2", text: "わかりません",             reading: "Wakarimasen",           translation: "Je ne comprends pas",         audioText: "わかりません",           courseLevel: 2 },
  { id: "ja-phrase-nihongo",   languageId: "lang-ja", courseId: "course-ja-phrase-2", text: "にほんごを べんきょう します", reading: "Nihongo wo benkyou shimasu", translation: "J'étudie le japonais",  audioText: "にほんごを べんきょう します", courseLevel: 2 },
  { id: "ja-phrase-dokoから",  languageId: "lang-ja", courseId: "course-ja-phrase-2", text: "どこから きましたか？",    reading: "Doko kara kimashita ka?", translation: "D'où venez-vous ?",          audioText: "どこから きましたか",    courseLevel: 2 },
  { id: "ja-phrase-mou-ichido",languageId: "lang-ja", courseId: "course-ja-phrase-2", text: "もう いちど おねがいします", reading: "Mou ichido onegaishimasu", translation: "Une fois de plus, s'il vous plaît", audioText: "もう いちど おねがいします", courseLevel: 2 },
  { id: "ja-phrase-tasukete",  languageId: "lang-ja", courseId: "course-ja-phrase-2", text: "たすけてください！",       reading: "Tasukete kudasai!",     translation: "Au secours !",                audioText: "たすけてください",       courseLevel: 2 },

  // ── Russe — Cours 1 : Salutations ─────────────────────────────────────────
  { id: "ru-phrase-privet",    languageId: "lang-ru", courseId: "course-ru-phrase-1", text: "Привет!",                  reading: "Privet!",               translation: "Salut !",                     audioText: "Привет",                 courseLevel: 1 },
  { id: "ru-phrase-zdravstvuy",languageId: "lang-ru", courseId: "course-ru-phrase-1", text: "Здравствуйте!",            reading: "Zdravstvuyte!",         translation: "Bonjour ! (formel)",          audioText: "Здравствуйте",           courseLevel: 1 },
  { id: "ru-phrase-dobroe",    languageId: "lang-ru", courseId: "course-ru-phrase-1", text: "Доброе утро!",             reading: "Dobroye utro!",         translation: "Bonjour (le matin) !",        audioText: "Доброе утро",            courseLevel: 1 },
  { id: "ru-phrase-dobryj",    languageId: "lang-ru", courseId: "course-ru-phrase-1", text: "Добрый день!",             reading: "Dobryy den'!",          translation: "Bonjour (l'après-midi) !",    audioText: "Добрый день",            courseLevel: 1 },
  { id: "ru-phrase-dobryy-vech",languageId:"lang-ru", courseId: "course-ru-phrase-1", text: "Добрый вечер!",            reading: "Dobryy vecher!",        translation: "Bonsoir !",                   audioText: "Добрый вечер",           courseLevel: 1 },
  { id: "ru-phrase-spasibo",   languageId: "lang-ru", courseId: "course-ru-phrase-1", text: "Спасибо!",                 reading: "Spasibo!",              translation: "Merci !",                     audioText: "Спасибо",                courseLevel: 1 },
  { id: "ru-phrase-pozhaluysta",languageId:"lang-ru", courseId: "course-ru-phrase-1", text: "Пожалуйста!",              reading: "Pozhaluysta!",          translation: "S'il vous plaît / De rien !", audioText: "Пожалуйста",             courseLevel: 1 },
  { id: "ru-phrase-izvinite",  languageId: "lang-ru", courseId: "course-ru-phrase-1", text: "Извините!",                reading: "Izvinite!",             translation: "Excusez-moi !",               audioText: "Извините",               courseLevel: 1 },
  { id: "ru-phrase-do-svidania",languageId:"lang-ru", courseId: "course-ru-phrase-1", text: "До свидания!",             reading: "Do svidaniya!",         translation: "Au revoir !",                 audioText: "До свидания",            courseLevel: 1 },
  { id: "ru-phrase-khorosho",  languageId: "lang-ru", courseId: "course-ru-phrase-1", text: "Хорошо!",                  reading: "Khorosho!",             translation: "Bien ! / D'accord !",         audioText: "Хорошо",                 courseLevel: 1 },

  // ── Russe — Cours 2 : Présentation ───────────────────────────────────────
  { id: "ru-phrase-kak-dela",  languageId: "lang-ru", courseId: "course-ru-phrase-2", text: "Как дела?",                reading: "Kak dela?",             translation: "Comment vas-tu ?",            audioText: "Как дела",               courseLevel: 2 },
  { id: "ru-phrase-vsyo-khor", languageId: "lang-ru", courseId: "course-ru-phrase-2", text: "Всё хорошо, спасибо!",     reading: "Vsyo khorosho, spasibo!", translation: "Tout va bien, merci !",     audioText: "Всё хорошо, спасибо",    courseLevel: 2 },
  { id: "ru-phrase-menya-zovut",languageId:"lang-ru", courseId: "course-ru-phrase-2", text: "Меня зовут...",            reading: "Menya zovut...",        translation: "Je m'appelle...",             audioText: "Меня зовут",             courseLevel: 2 },
  { id: "ru-phrase-otkuda",    languageId: "lang-ru", courseId: "course-ru-phrase-2", text: "Откуда вы?",               reading: "Otkuda vy?",            translation: "D'où venez-vous ?",           audioText: "Откуда вы",              courseLevel: 2 },
  { id: "ru-phrase-ya-ne-pon", languageId: "lang-ru", courseId: "course-ru-phrase-2", text: "Я не понимаю",             reading: "Ya ne ponimayu",        translation: "Je ne comprends pas",         audioText: "Я не понимаю",           courseLevel: 2 },
  { id: "ru-phrase-povtorite", languageId: "lang-ru", courseId: "course-ru-phrase-2", text: "Повторите, пожалуйста",    reading: "Povtorite, pozhaluysta", translation: "Répétez s'il vous plaît",    audioText: "Повторите пожалуйста",   courseLevel: 2 },
  { id: "ru-phrase-gde-tualet",languageId: "lang-ru", courseId: "course-ru-phrase-2", text: "Где туалет?",              reading: "Gde tualet?",           translation: "Où sont les toilettes ?",     audioText: "Где туалет",             courseLevel: 2 },
  { id: "ru-phrase-skolko",    languageId: "lang-ru", courseId: "course-ru-phrase-2", text: "Сколько стоит?",           reading: "Skolko stoit?",         translation: "Combien ça coûte ?",          audioText: "Сколько стоит",          courseLevel: 2 },
  { id: "ru-phrase-ya-lyublyu",languageId: "lang-ru", courseId: "course-ru-phrase-2", text: "Я люблю тебя",             reading: "Ya lyublyu tebya",      translation: "Je t'aime",                   audioText: "Я люблю тебя",           courseLevel: 2 },
  { id: "ru-phrase-pomogite",  languageId: "lang-ru", courseId: "course-ru-phrase-2", text: "Помогите!",                reading: "Pomogite!",             translation: "Aidez-moi !",                 audioText: "Помогите",               courseLevel: 2 },
];

// ─── KanjiVG helpers ──────────────────────────────────────────────────────────

function extractSvgPaths(svg: string): string[] {
  const paths: string[] = [];
  const re = /<path[^>]*\sd\s*=\s*"([^"]+)"[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svg)) !== null) if (m[1]) paths.push(m[1]);
  return paths;
}

async function fetchKanjiVGPaths(char: string): Promise<string[]> {
  const hex = char.codePointAt(0)!.toString(16).padStart(5, '0');
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const svg = await res.text();
  return extractSvgPaths(svg);
}

// ─── Kanji data ───────────────────────────────────────────────────────────────

const KANJI_COURSES = [
  { id: 'course-ja-kanji-1', level: 21, title: 'Kanji — Nature & Éléments',  description: '水 山 川 花 月 星 海 雨 火 木', prerequisiteId: 'course-ja-char-10' },
  { id: 'course-ja-kanji-2', level: 22, title: 'Kanji — Animaux & Couleurs', description: '犬 猫 鳥 魚 青 赤 白 黒 空 風', prerequisiteId: 'course-ja-kanji-1' },
];

const KANJI_LIST = [
  { char: '水', id: 'kanji-mizu',  courseId: 'course-ja-kanji-1', courseLevel: 21, romaji: 'mizu',   kana: 'みず',   meaning: 'eau',          jlpt: 'N5' },
  { char: '山', id: 'kanji-yama',  courseId: 'course-ja-kanji-1', courseLevel: 21, romaji: 'yama',   kana: 'やま',   meaning: 'montagne',     jlpt: 'N5' },
  { char: '川', id: 'kanji-kawa',  courseId: 'course-ja-kanji-1', courseLevel: 21, romaji: 'kawa',   kana: 'かわ',   meaning: 'rivière',      jlpt: 'N5' },
  { char: '花', id: 'kanji-hana',  courseId: 'course-ja-kanji-1', courseLevel: 21, romaji: 'hana',   kana: 'はな',   meaning: 'fleur',        jlpt: 'N5' },
  { char: '月', id: 'kanji-tsuki', courseId: 'course-ja-kanji-1', courseLevel: 21, romaji: 'tsuki',  kana: 'つき',   meaning: 'lune / mois',  jlpt: 'N5' },
  { char: '星', id: 'kanji-hoshi', courseId: 'course-ja-kanji-1', courseLevel: 21, romaji: 'hoshi',  kana: 'ほし',   meaning: 'étoile',       jlpt: 'N4' },
  { char: '海', id: 'kanji-umi',   courseId: 'course-ja-kanji-1', courseLevel: 21, romaji: 'umi',    kana: 'うみ',   meaning: 'mer',          jlpt: 'N4' },
  { char: '雨', id: 'kanji-ame',   courseId: 'course-ja-kanji-1', courseLevel: 21, romaji: 'ame',    kana: 'あめ',   meaning: 'pluie',        jlpt: 'N5' },
  { char: '火', id: 'kanji-hi',    courseId: 'course-ja-kanji-1', courseLevel: 21, romaji: 'hi',     kana: 'ひ',     meaning: 'feu',          jlpt: 'N5' },
  { char: '木', id: 'kanji-ki',    courseId: 'course-ja-kanji-1', courseLevel: 21, romaji: 'ki',     kana: 'き',     meaning: 'arbre / bois', jlpt: 'N5' },
  { char: '犬', id: 'kanji-inu',   courseId: 'course-ja-kanji-2', courseLevel: 22, romaji: 'inu',    kana: 'いぬ',   meaning: 'chien',        jlpt: 'N5' },
  { char: '猫', id: 'kanji-neko',  courseId: 'course-ja-kanji-2', courseLevel: 22, romaji: 'neko',   kana: 'ねこ',   meaning: 'chat',         jlpt: 'N4' },
  { char: '鳥', id: 'kanji-tori',  courseId: 'course-ja-kanji-2', courseLevel: 22, romaji: 'tori',   kana: 'とり',   meaning: 'oiseau',       jlpt: 'N4' },
  { char: '魚', id: 'kanji-sakana',courseId: 'course-ja-kanji-2', courseLevel: 22, romaji: 'sakana', kana: 'さかな', meaning: 'poisson',      jlpt: 'N4' },
  { char: '青', id: 'kanji-ao',    courseId: 'course-ja-kanji-2', courseLevel: 22, romaji: 'ao',     kana: 'あお',   meaning: 'bleu / vert',  jlpt: 'N5' },
  { char: '赤', id: 'kanji-aka',   courseId: 'course-ja-kanji-2', courseLevel: 22, romaji: 'aka',    kana: 'あか',   meaning: 'rouge',        jlpt: 'N5' },
  { char: '白', id: 'kanji-shiro', courseId: 'course-ja-kanji-2', courseLevel: 22, romaji: 'shiro',  kana: 'しろ',   meaning: 'blanc',        jlpt: 'N5' },
  { char: '黒', id: 'kanji-kuro',  courseId: 'course-ja-kanji-2', courseLevel: 22, romaji: 'kuro',   kana: 'くろ',   meaning: 'noir',         jlpt: 'N5' },
  { char: '空', id: 'kanji-sora',  courseId: 'course-ja-kanji-2', courseLevel: 22, romaji: 'sora',   kana: 'そら',   meaning: 'ciel / vide',  jlpt: 'N5' },
  { char: '風', id: 'kanji-kaze',  courseId: 'course-ja-kanji-2', courseLevel: 22, romaji: 'kaze',   kana: 'かぜ',   meaning: 'vent',         jlpt: 'N3' },
];

// ─── Katakana data ────────────────────────────────────────────────────────────

const KATAKANA_COURSES = [
  { id: 'course-ja-char-11', level: 11, title: 'Katakana — Voyelles ア イ ウ エ オ',  description: 'Les 5 voyelles katakana',     prerequisiteId: 'course-ja-char-10' },
  { id: 'course-ja-char-12', level: 12, title: 'Katakana — Série K カ キ ク ケ コ',   description: 'Syllabes katakana rangée K',  prerequisiteId: 'course-ja-char-11' },
  { id: 'course-ja-char-13', level: 13, title: 'Katakana — Série S サ シ ス セ ソ',   description: 'Syllabes katakana rangée S',  prerequisiteId: 'course-ja-char-12' },
  { id: 'course-ja-char-14', level: 14, title: 'Katakana — Série T タ チ ツ テ ト',   description: 'Syllabes katakana rangée T',  prerequisiteId: 'course-ja-char-13' },
  { id: 'course-ja-char-15', level: 15, title: 'Katakana — Série N ナ ニ ヌ ネ ノ',   description: 'Syllabes katakana rangée N',  prerequisiteId: 'course-ja-char-14' },
  { id: 'course-ja-char-16', level: 16, title: 'Katakana — Série H ハ ヒ フ ヘ ホ',   description: 'Syllabes katakana rangée H',  prerequisiteId: 'course-ja-char-15' },
  { id: 'course-ja-char-17', level: 17, title: 'Katakana — Série M マ ミ ム メ モ',   description: 'Syllabes katakana rangée M',  prerequisiteId: 'course-ja-char-16' },
  { id: 'course-ja-char-18', level: 18, title: 'Katakana — Série Y ヤ ユ ヨ',         description: 'Syllabes katakana rangée Y',  prerequisiteId: 'course-ja-char-17' },
  { id: 'course-ja-char-19', level: 19, title: 'Katakana — Série R ラ リ ル レ ロ',   description: 'Syllabes katakana rangée R',  prerequisiteId: 'course-ja-char-18' },
  { id: 'course-ja-char-20', level: 20, title: 'Katakana — Série W ワ ヲ ン',          description: 'Syllabes katakana finales',   prerequisiteId: 'course-ja-char-19' },
];

const KATAKANA_LIST = [
  { char: 'ア', id: 'katakana-a',   courseId: 'course-ja-char-11', courseLevel: 11, romaji: 'a',   kana: 'あ' },
  { char: 'イ', id: 'katakana-i',   courseId: 'course-ja-char-11', courseLevel: 11, romaji: 'i',   kana: 'い' },
  { char: 'ウ', id: 'katakana-u',   courseId: 'course-ja-char-11', courseLevel: 11, romaji: 'u',   kana: 'う' },
  { char: 'エ', id: 'katakana-e',   courseId: 'course-ja-char-11', courseLevel: 11, romaji: 'e',   kana: 'え' },
  { char: 'オ', id: 'katakana-o',   courseId: 'course-ja-char-11', courseLevel: 11, romaji: 'o',   kana: 'お' },
  { char: 'カ', id: 'katakana-ka',  courseId: 'course-ja-char-12', courseLevel: 12, romaji: 'ka',  kana: 'か' },
  { char: 'キ', id: 'katakana-ki',  courseId: 'course-ja-char-12', courseLevel: 12, romaji: 'ki',  kana: 'き' },
  { char: 'ク', id: 'katakana-ku',  courseId: 'course-ja-char-12', courseLevel: 12, romaji: 'ku',  kana: 'く' },
  { char: 'ケ', id: 'katakana-ke',  courseId: 'course-ja-char-12', courseLevel: 12, romaji: 'ke',  kana: 'け' },
  { char: 'コ', id: 'katakana-ko',  courseId: 'course-ja-char-12', courseLevel: 12, romaji: 'ko',  kana: 'こ' },
  { char: 'サ', id: 'katakana-sa',  courseId: 'course-ja-char-13', courseLevel: 13, romaji: 'sa',  kana: 'さ' },
  { char: 'シ', id: 'katakana-shi', courseId: 'course-ja-char-13', courseLevel: 13, romaji: 'shi', kana: 'し' },
  { char: 'ス', id: 'katakana-su',  courseId: 'course-ja-char-13', courseLevel: 13, romaji: 'su',  kana: 'す' },
  { char: 'セ', id: 'katakana-se',  courseId: 'course-ja-char-13', courseLevel: 13, romaji: 'se',  kana: 'せ' },
  { char: 'ソ', id: 'katakana-so',  courseId: 'course-ja-char-13', courseLevel: 13, romaji: 'so',  kana: 'そ' },
  { char: 'タ', id: 'katakana-ta',  courseId: 'course-ja-char-14', courseLevel: 14, romaji: 'ta',  kana: 'た' },
  { char: 'チ', id: 'katakana-chi', courseId: 'course-ja-char-14', courseLevel: 14, romaji: 'chi', kana: 'ち' },
  { char: 'ツ', id: 'katakana-tsu', courseId: 'course-ja-char-14', courseLevel: 14, romaji: 'tsu', kana: 'つ' },
  { char: 'テ', id: 'katakana-te',  courseId: 'course-ja-char-14', courseLevel: 14, romaji: 'te',  kana: 'て' },
  { char: 'ト', id: 'katakana-to',  courseId: 'course-ja-char-14', courseLevel: 14, romaji: 'to',  kana: 'と' },
  { char: 'ナ', id: 'katakana-na',  courseId: 'course-ja-char-15', courseLevel: 15, romaji: 'na',  kana: 'な' },
  { char: 'ニ', id: 'katakana-ni',  courseId: 'course-ja-char-15', courseLevel: 15, romaji: 'ni',  kana: 'に' },
  { char: 'ヌ', id: 'katakana-nu',  courseId: 'course-ja-char-15', courseLevel: 15, romaji: 'nu',  kana: 'ぬ' },
  { char: 'ネ', id: 'katakana-ne',  courseId: 'course-ja-char-15', courseLevel: 15, romaji: 'ne',  kana: 'ね' },
  { char: 'ノ', id: 'katakana-no',  courseId: 'course-ja-char-15', courseLevel: 15, romaji: 'no',  kana: 'の' },
  { char: 'ハ', id: 'katakana-ha',  courseId: 'course-ja-char-16', courseLevel: 16, romaji: 'ha',  kana: 'は' },
  { char: 'ヒ', id: 'katakana-hi',  courseId: 'course-ja-char-16', courseLevel: 16, romaji: 'hi',  kana: 'ひ' },
  { char: 'フ', id: 'katakana-fu',  courseId: 'course-ja-char-16', courseLevel: 16, romaji: 'fu',  kana: 'ふ' },
  { char: 'ヘ', id: 'katakana-he',  courseId: 'course-ja-char-16', courseLevel: 16, romaji: 'he',  kana: 'へ' },
  { char: 'ホ', id: 'katakana-ho',  courseId: 'course-ja-char-16', courseLevel: 16, romaji: 'ho',  kana: 'ほ' },
  { char: 'マ', id: 'katakana-ma',  courseId: 'course-ja-char-17', courseLevel: 17, romaji: 'ma',  kana: 'ま' },
  { char: 'ミ', id: 'katakana-mi',  courseId: 'course-ja-char-17', courseLevel: 17, romaji: 'mi',  kana: 'み' },
  { char: 'ム', id: 'katakana-mu',  courseId: 'course-ja-char-17', courseLevel: 17, romaji: 'mu',  kana: 'む' },
  { char: 'メ', id: 'katakana-me',  courseId: 'course-ja-char-17', courseLevel: 17, romaji: 'me',  kana: 'め' },
  { char: 'モ', id: 'katakana-mo',  courseId: 'course-ja-char-17', courseLevel: 17, romaji: 'mo',  kana: 'も' },
  { char: 'ヤ', id: 'katakana-ya',  courseId: 'course-ja-char-18', courseLevel: 18, romaji: 'ya',  kana: 'や' },
  { char: 'ユ', id: 'katakana-yu',  courseId: 'course-ja-char-18', courseLevel: 18, romaji: 'yu',  kana: 'ゆ' },
  { char: 'ヨ', id: 'katakana-yo',  courseId: 'course-ja-char-18', courseLevel: 18, romaji: 'yo',  kana: 'よ' },
  { char: 'ラ', id: 'katakana-ra',  courseId: 'course-ja-char-19', courseLevel: 19, romaji: 'ra',  kana: 'ら' },
  { char: 'リ', id: 'katakana-ri',  courseId: 'course-ja-char-19', courseLevel: 19, romaji: 'ri',  kana: 'り' },
  { char: 'ル', id: 'katakana-ru',  courseId: 'course-ja-char-19', courseLevel: 19, romaji: 'ru',  kana: 'る' },
  { char: 'レ', id: 'katakana-re',  courseId: 'course-ja-char-19', courseLevel: 19, romaji: 're',  kana: 'れ' },
  { char: 'ロ', id: 'katakana-ro',  courseId: 'course-ja-char-19', courseLevel: 19, romaji: 'ro',  kana: 'ろ' },
  { char: 'ワ', id: 'katakana-wa',  courseId: 'course-ja-char-20', courseLevel: 20, romaji: 'wa',  kana: 'わ' },
  { char: 'ヲ', id: 'katakana-wo',  courseId: 'course-ja-char-20', courseLevel: 20, romaji: 'wo',  kana: 'を' },
  { char: 'ン', id: 'katakana-n',   courseId: 'course-ja-char-20', courseLevel: 20, romaji: 'n',   kana: 'ん' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) { process.stdout.write(`  ${msg}\n`); }

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seedLanguages() {
  process.stdout.write("\n🌐 Languages...\n");
  for (const lang of LANGUAGES) {
    await db.language.upsert({
      where:  { id: lang.id },
      update: { name: lang.name, script: lang.script },
      create: lang,
    });
    log(`✓ ${lang.name} (${lang.code})`);
  }
}

async function seedCourses() {
  process.stdout.write("\n📚 Courses...\n");
  for (const course of COURSES) {
    await db.course.upsert({
      where:  { id: course.id },
      update: { title: course.title, description: course.description, type: course.type, prerequisiteId: course.prerequisiteId ?? null },
      create: course,
    });
    log(`✓ ${course.title}`);
  }
}

async function seedCharacters() {
  process.stdout.write("\n✍️  Characters...\n");
  for (const char of CHARACTERS) {
    const { svgPaths, meanings, romaji, readings, ...rest } = char;
    await db.character.upsert({
      where:  { id: char.id },
      update: {
        svgPaths: JSON.stringify(svgPaths),
        meanings: meanings ? JSON.stringify(meanings) : null,
        romaji:   romaji   ? JSON.stringify(romaji)   : null,
        readings: readings ? JSON.stringify(readings) : null,
      },
      create: {
        ...rest,
        svgPaths: JSON.stringify(svgPaths),
        meanings: meanings ? JSON.stringify(meanings) : null,
        romaji:   romaji   ? JSON.stringify(romaji)   : null,
        readings: readings ? JSON.stringify(readings) : null,
      },
    });
    log(`✓ ${char.label}  (${char.id})`);
  }
}

async function seedWords() {
  process.stdout.write("\n📖 Words...\n");
  for (const word of WORDS) {
    await db.word.upsert({
      where:  { id: word.id },
      update: { text: word.text, kana: word.kana ?? null, reading: word.reading ?? null, meaning: word.meaning, etymology: word.etymology ?? null, components: word.components ?? null },
      create: word,
    });
    log(`✓ ${word.text}  (${word.meaning})`);
  }
}

async function seedPhrases() {
  process.stdout.write("\n💬 Phrases...\n");
  for (const phrase of PHRASES) {
    await db.phrase.upsert({
      where:  { id: phrase.id },
      update: { text: phrase.text, reading: phrase.reading ?? null, translation: phrase.translation },
      create: phrase,
    });
    log(`✓ ${phrase.text}  (${phrase.translation})`);
  }
}

async function seedKanji() {
  process.stdout.write("\n🈳  Kanji (KanjiVG)...\n");

  // Créer les cours kanji
  for (const course of KANJI_COURSES) {
    await db.course.upsert({
      where:  { id: course.id },
      create: { id: course.id, languageId: 'lang-ja', type: 'character', level: course.level, title: course.title, description: course.description, prerequisiteId: course.prerequisiteId ?? null },
      update: { title: course.title, description: course.description, prerequisiteId: course.prerequisiteId ?? null },
    });
    log(`✓ ${course.title}`);
  }

  let ok = 0, skip = 0;
  for (const k of KANJI_LIST) {
    process.stdout.write(`  ${k.char} ${k.romaji}... `);
    let svgPaths: string[];
    try {
      svgPaths = await fetchKanjiVGPaths(k.char);
      process.stdout.write(`${svgPaths.length} paths\n`);
    } catch (err) {
      process.stdout.write(`⚠️  ${err instanceof Error ? err.message : String(err)}\n`);
      skip++;
      continue;
    }
    if (!svgPaths.length) { process.stdout.write(`⚠️  no paths — skip\n`); skip++; continue; }
    await db.character.upsert({
      where:  { id: k.id },
      create: {
        id: k.id, languageId: 'lang-ja', courseId: k.courseId, label: k.char, audioText: k.kana,
        svgPaths: JSON.stringify(svgPaths), strokeCount: svgPaths.length,
        meanings: JSON.stringify([k.meaning]), romaji: JSON.stringify([k.romaji]),
        readings: JSON.stringify({ kana: [k.kana] }), jlpt: k.jlpt, courseLevel: k.courseLevel,
      },
      update: {
        courseId: k.courseId, courseLevel: k.courseLevel,
        svgPaths: JSON.stringify(svgPaths), strokeCount: svgPaths.length,
        meanings: JSON.stringify([k.meaning]), romaji: JSON.stringify([k.romaji]),
        readings: JSON.stringify({ kana: [k.kana] }), jlpt: k.jlpt,
      },
    });
    ok++;
  }
  log(`${ok} kanji insérés, ${skip} ignorés`);
}

async function seedKatakana() {
  process.stdout.write("\n🈶  Katakana (KanjiVG)...\n");

  for (const course of KATAKANA_COURSES) {
    await db.course.upsert({
      where:  { id: course.id },
      create: { id: course.id, languageId: 'lang-ja', type: 'character', level: course.level, title: course.title, description: course.description, prerequisiteId: course.prerequisiteId ?? null },
      update: { title: course.title, description: course.description, prerequisiteId: course.prerequisiteId ?? null },
    });
    log(`✓ ${course.title}`);
  }

  let ok = 0, skip = 0;
  for (const k of KATAKANA_LIST) {
    process.stdout.write(`  ${k.char} ${k.romaji}... `);
    let svgPaths: string[];
    try {
      svgPaths = await fetchKanjiVGPaths(k.char);
      process.stdout.write(`${svgPaths.length} paths\n`);
    } catch (err) {
      process.stdout.write(`⚠️  ${err instanceof Error ? err.message : String(err)}\n`);
      skip++;
      continue;
    }
    if (!svgPaths.length) { process.stdout.write(`⚠️  no paths — skip\n`); skip++; continue; }
    await db.character.upsert({
      where:  { id: k.id },
      create: {
        id: k.id, languageId: 'lang-ja', courseId: k.courseId, label: k.char, audioText: k.char,
        svgPaths: JSON.stringify(svgPaths), strokeCount: svgPaths.length,
        meanings: JSON.stringify([`katakana ${k.romaji}`]), romaji: JSON.stringify([k.romaji]),
        readings: JSON.stringify({ kana: [k.kana] }), jlpt: 'N5', courseLevel: k.courseLevel,
      },
      update: { svgPaths: JSON.stringify(svgPaths), strokeCount: svgPaths.length, courseId: k.courseId },
    });
    ok++;
  }
  log(`${ok} katakana insérés, ${skip} ignorés`);
}

async function main() {
  process.stdout.write("🌱 Seeding Sen database...\n");
  await seedLanguages();
  await seedCourses();
  await seedCharacters();
  await seedWords();
  await seedPhrases();
  await seedKanji();
  await seedKatakana();
  process.stdout.write(
    `\n✅ Done — ${LANGUAGES.length} languages, ${COURSES.length + KATAKANA_COURSES.length} courses, ${CHARACTERS.length + KANJI_LIST.length + KATAKANA_LIST.length} characters (incl. kanji & katakana), ${WORDS.length} words, ${PHRASES.length} phrases.\n\n`,
  );
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
