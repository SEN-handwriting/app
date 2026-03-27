import { db } from "../src/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type LanguageSeed = {
  id: string;
  code: string;
  name: string;
  script: string;
};

type CourseSeed = {
  id: string;
  languageId: string;
  level: number;
  title: string;
  description?: string;
};

type CharacterSeed = {
  id: string;
  languageId: string;
  courseId: string;
  label: string;
  audioText: string;
  svgPaths: string[];
  strokeCount?: number;
  meanings?: string[];
  romaji?: string[];
  readings?: { kana?: string[]; onyomi?: string[]; kunyomi?: string[] };
  jlpt?: string;
  courseLevel: number;
};

// ─── Données ──────────────────────────────────────────────────────────────────

const LANGUAGES: LanguageSeed[] = [
  { id: "lang-ja", code: "ja-JP", name: "Japonais",  script: "Hiragana"    },
  { id: "lang-ru", code: "ru-RU", name: "Russe",     script: "Cyrillique"  },
];

const COURSES: CourseSeed[] = [
  {
    id:          "course-ja-1",
    languageId:  "lang-ja",
    level:       1,
    title:       "Voyelles — あいうえお",
    description: "Les 5 voyelles de base de l'Hiragana",
  },
  {
    id:          "course-ru-1",
    languageId:  "lang-ru",
    level:       1,
    title:       "Voyelles — А О У И Э Е Ю Я",
    description: "Les voyelles cyrilliques essentielles",
  },
  {
    id:          "course-ru-2",
    languageId:  "lang-ru",
    level:       2,
    title:       "Consonnes fréquentes — Н Т М К Л П С Р Б В",
    description: "Les consonnes cyrilliques les plus utilisées",
  },
];

// Paths source Hiragana : KanjiVG (https://kanjivg.tagaini.net) — CC BY-SA 3.0
// Paths Cyrillique : dessinés manuellement, viewBox 0 0 109 109
const CHARACTERS: CharacterSeed[] = [
  // ── Hiragana — Cours 1 (voyelles) ──────────────────────────────────────────
  {
    id: "hiragana-あ", languageId: "lang-ja", courseId: "course-ja-1",
    label: "あ", audioText: "あ", strokeCount: 3, jlpt: "N5", courseLevel: 1,
    meanings: ["hiragana a"], romaji: ["a"], readings: { kana: ["あ"] },
    svgPaths: [
      "M31.01,33c0.88,0.88,2.75,1.82,5.25,1.75c8.62-0.25,20-2.12,29.5-4.25c1.51-0.34,4.62-0.88,6.62-0.5",
      "M49.76,17.62c0.88,1,1.82,3.26,1.38,5.25c-3.75,16.75-6.25,38.13-5.13,53.63c0.41,5.7,1.88,10.88,3.38,13.62",
      "M65.63,44.12c0.75,1.12,1.16,4.39,0.5,6.12c-4.62,12.26-11.24,23.76-25.37,35.76c-6.86,5.83-15.88,3.75-16.25-8.38c-0.34-10.87,13.38-23.12,32.38-26.74c12.42-2.37,27,1.38,30.5,12.75c4.05,13.18-3.76,26.37-20.88,30.49",
    ],
  },
  {
    id: "hiragana-い", languageId: "lang-ja", courseId: "course-ja-1",
    label: "い", audioText: "い", strokeCount: 2, jlpt: "N5", courseLevel: 1,
    meanings: ["hiragana i"], romaji: ["i"], readings: { kana: ["い"] },
    svgPaths: [
      "M38.75,17.88c0.75,0.37,1.88,2,1.88,2.87c0,2.75-0.25,46.5-0.25,62.5c0,3.75,0.62,5.12,4.12,5.12c3.12,0,4.25-0.75,4.88-2.62c0.5-1.5,1-4.5,1.38-6.5",
      "M70.12,16c0.88,0.5,2.12,2.25,2.12,3.38c0,2.62-0.25,67.25-0.25,70.5c0,10.25-4.88,3.12-7.12,1",
    ],
  },
  {
    id: "hiragana-う", languageId: "lang-ja", courseId: "course-ja-1",
    label: "う", audioText: "う", strokeCount: 3, jlpt: "N5", courseLevel: 1,
    meanings: ["hiragana u"], romaji: ["u"], readings: { kana: ["う"] },
    svgPaths: [
      "M30.88,27.12c1.75,0.5,3.62,0.62,5.5,0.37c7.12-1,18.5-2.88,27.12-4.12c1.88-0.25,3.75-0.5,5.62-0.25",
      "M48.88,28.88c0.75,0.75,1.12,2.12,1,3.38c-0.62,6.75-3.88,24.88-11.88,36.62c-1.88,2.75-3.5,2.5-5.12-0.25c-1.12-1.88-2-4.38-2.88-7",
      "M50.25,47.12c2.88,0.62,16.38,11.12,24,19.38c1.88,2,3.5,3.88,5.5,4.88",
    ],
  },
  {
    id: "hiragana-え", languageId: "lang-ja", courseId: "course-ja-1",
    label: "え", audioText: "え", strokeCount: 4, jlpt: "N5", courseLevel: 1,
    meanings: ["hiragana e"], romaji: ["e"], readings: { kana: ["え"] },
    svgPaths: [
      "M26.12,40.88c1.88,0.5,4.5,0.62,6.38,0.37c10-1.25,26.38-3.5,37.25-4.12c2.12-0.12,4.25-0.25,6.38,0.25",
      "M42.88,17.62c1,1,1.5,2.38,1.5,4c0,1.88-0.12,36.75-0.12,54.75c0,3.25,0,5.88,0,7.62",
      "M44.25,40c-6.5,12.25-17.88,24.25-29.88,30.62",
      "M48.5,45.38c5.62,3.5,21.25,15.62,28.25,21.5c1.88,1.62,4.25,3.12,6.38,3.75",
    ],
  },
  {
    id: "hiragana-お", languageId: "lang-ja", courseId: "course-ja-1",
    label: "お", audioText: "お", strokeCount: 4, jlpt: "N5", courseLevel: 1,
    meanings: ["hiragana o"], romaji: ["o"], readings: { kana: ["お"] },
    svgPaths: [
      "M24.75,28.25c2,0.62,4.75,0.75,6.88,0.5c8.62-1,23-3.12,32.62-3.88c2.12-0.16,4.25-0.25,6.38,0.25",
      "M42.25,31c0.88,0.88,1.25,2.25,1.25,3.5c0,1.25-0.12,28.75-0.12,40.88",
      "M23.25,75.62c2.12,0.62,5,0.75,7.12,0.5c11-1.25,29.5-3.5,43.38-4.25c2.25-0.12,4.5-0.25,6.75,0.25",
      "M43.88,53.88c6.5,0,24,16.25,31.38,22.38c2,1.62,4.5,3.25,6.88,3.88",
    ],
  },

  // ── Cyrillique — Cours 1 (voyelles) ────────────────────────────────────────
  {
    id: "cyrillic-А", languageId: "lang-ru", courseId: "course-ru-1",
    label: "А", audioText: "А", strokeCount: 3, courseLevel: 1,
    meanings: ["voyelle a"], romaji: ["a"],
    svgPaths: ["M55,18L25,90", "M55,18L85,90", "M36,56L74,56"],
  },
  {
    id: "cyrillic-О", languageId: "lang-ru", courseId: "course-ru-1",
    label: "О", audioText: "О", strokeCount: 1, courseLevel: 1,
    meanings: ["voyelle o"], romaji: ["o"],
    svgPaths: ["M54.5,18c-21,0,-36,16.5,-36,36.5c0,20,15,36.5,36,36.5c21,0,36.5,-16.5,36.5,-36.5c0,-20,-15.5,-36.5,-36.5,-36.5"],
  },
  {
    id: "cyrillic-У", languageId: "lang-ru", courseId: "course-ru-1",
    label: "У", audioText: "У", strokeCount: 2, courseLevel: 1,
    meanings: ["voyelle ou"], romaji: ["ou"],
    svgPaths: ["M25,22L55,60", "M85,22L55,60L55,90"],
  },
  {
    id: "cyrillic-И", languageId: "lang-ru", courseId: "course-ru-1",
    label: "И", audioText: "И", strokeCount: 3, courseLevel: 1,
    meanings: ["voyelle i"], romaji: ["i"],
    svgPaths: ["M25,20L25,90", "M85,20L85,90", "M85,20L25,90"],
  },
  {
    id: "cyrillic-Э", languageId: "lang-ru", courseId: "course-ru-1",
    label: "Э", audioText: "Э", strokeCount: 2, courseLevel: 1,
    meanings: ["voyelle é"], romaji: ["é"],
    svgPaths: ["M27,35c0,-18,56,-18,56,20c0,37,-56,37,-56,20", "M42,55L82,55"],
  },
  {
    id: "cyrillic-Е", languageId: "lang-ru", courseId: "course-ru-1",
    label: "Е", audioText: "Е", strokeCount: 4, courseLevel: 1,
    meanings: ["voyelle yé"], romaji: ["yé"],
    svgPaths: ["M28,20L28,90", "M28,20L80,20", "M28,55L72,55", "M28,90L80,90"],
  },
  {
    id: "cyrillic-Ю", languageId: "lang-ru", courseId: "course-ru-1",
    label: "Ю", audioText: "Ю", strokeCount: 3, courseLevel: 1,
    meanings: ["voyelle you"], romaji: ["you"],
    svgPaths: [
      "M22,20L22,90",
      "M22,55L40,55",
      "M65,30c-13.8,0,-25,11.2,-25,25c0,13.8,11.2,25,25,25c13.8,0,25,-11.2,25,-25c0,-13.8,-11.2,-25,-25,-25",
    ],
  },
  {
    id: "cyrillic-Я", languageId: "lang-ru", courseId: "course-ru-1",
    label: "Я", audioText: "Я", strokeCount: 3, courseLevel: 1,
    meanings: ["voyelle ya"], romaji: ["ya"],
    svgPaths: ["M25,20L25,90", "M25,20c30,0,55,0,55,18c0,15,-25,20,-55,20", "M25,58L75,90"],
  },

  // ── Cyrillique — Cours 2 (consonnes fréquentes) ─────────────────────────────
  {
    id: "cyrillic-Н", languageId: "lang-ru", courseId: "course-ru-2",
    label: "Н", audioText: "Н", strokeCount: 3, courseLevel: 2,
    meanings: ["consonne n"], romaji: ["n"],
    svgPaths: ["M25,20L25,90", "M85,20L85,90", "M25,55L85,55"],
  },
  {
    id: "cyrillic-Т", languageId: "lang-ru", courseId: "course-ru-2",
    label: "Т", audioText: "Т", strokeCount: 2, courseLevel: 2,
    meanings: ["consonne t"], romaji: ["t"],
    svgPaths: ["M20,22L89,22", "M54.5,22L54.5,90"],
  },
  {
    id: "cyrillic-М", languageId: "lang-ru", courseId: "course-ru-2",
    label: "М", audioText: "М", strokeCount: 3, courseLevel: 2,
    meanings: ["consonne m"], romaji: ["m"],
    svgPaths: ["M20,90L20,20", "M20,20L54.5,60L89,20", "M89,20L89,90"],
  },
  {
    id: "cyrillic-К", languageId: "lang-ru", courseId: "course-ru-2",
    label: "К", audioText: "К", strokeCount: 3, courseLevel: 2,
    meanings: ["consonne k"], romaji: ["k"],
    svgPaths: ["M25,20L25,90", "M25,55L80,20", "M25,55L80,90"],
  },
  {
    id: "cyrillic-Л", languageId: "lang-ru", courseId: "course-ru-2",
    label: "Л", audioText: "Л", strokeCount: 2, courseLevel: 2,
    meanings: ["consonne l"], romaji: ["l"],
    svgPaths: ["M22,20L85,20L85,90", "M22,20L35,90"],
  },
  {
    id: "cyrillic-П", languageId: "lang-ru", courseId: "course-ru-2",
    label: "П", audioText: "П", strokeCount: 3, courseLevel: 2,
    meanings: ["consonne p"], romaji: ["p"],
    svgPaths: ["M25,22L85,22", "M25,22L25,90", "M85,22L85,90"],
  },
  {
    id: "cyrillic-С", languageId: "lang-ru", courseId: "course-ru-2",
    label: "С", audioText: "С", strokeCount: 1, courseLevel: 2,
    meanings: ["consonne s"], romaji: ["s"],
    svgPaths: ["M82,35c0,-18,-60,-18,-60,20c0,36,60,36,60,20"],
  },
  {
    id: "cyrillic-Р", languageId: "lang-ru", courseId: "course-ru-2",
    label: "Р", audioText: "Р", strokeCount: 2, courseLevel: 2,
    meanings: ["consonne r"], romaji: ["r"],
    svgPaths: ["M25,20L25,90", "M25,20c30,0,55,0,55,18c0,15,-25,20,-55,20"],
  },
  {
    id: "cyrillic-Б", languageId: "lang-ru", courseId: "course-ru-2",
    label: "Б", audioText: "Б", strokeCount: 2, courseLevel: 2,
    meanings: ["consonne b"], romaji: ["b"],
    svgPaths: ["M80,20L25,20L25,90", "M25,55c10,0,50,-5,50,18c0,20,-28,18,-50,18"],
  },
  {
    id: "cyrillic-В", languageId: "lang-ru", courseId: "course-ru-2",
    label: "В", audioText: "В", strokeCount: 3, courseLevel: 2,
    meanings: ["consonne v"], romaji: ["v"],
    svgPaths: [
      "M25,20L25,90",
      "M25,20c30,0,50,0,50,18c0,13,-20,17,-50,20",
      "M25,58c30,0,55,2,55,17c0,17,-25,15,-55,15",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`  ${msg}`);
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seedLanguages() {
  console.log("\n🌐 Languages...");
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
  console.log("\n📚 Courses...");
  for (const course of COURSES) {
    await db.course.upsert({
      where:  { id: course.id },
      update: { title: course.title, description: course.description },
      create: course,
    });
    log(`✓ ${course.title}`);
  }
}

async function seedCharacters() {
  console.log("\n✍️  Characters...");
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

async function main() {
  console.log("🌱 Seeding database...");

  await seedLanguages();
  await seedCourses();
  await seedCharacters();

  console.log(`\n✅ Done — ${LANGUAGES.length} languages, ${COURSES.length} courses, ${CHARACTERS.length} characters.\n`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
