/**
 * Fetches KanjiVG stroke paths for all 46 katakana characters,
 * creates the katakana courses, and upserts characters into the DB.
 *
 * Usage (from repo root):
 *   node scripts/seed-katakana.js
 *
 * Requires DATABASE_URL in packages/database/.env
 */

const https = require('https');
const path  = require('path');
const fs    = require('fs');

// ── Load .env ─────────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', 'packages', 'database', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
  }
}

const { PrismaClient } = require(
  path.join(__dirname, '..', 'packages', 'database', 'generated', 'prisma')
);
const db = new PrismaClient();

// ── Cours katakana ────────────────────────────────────────────────────────────
const COURSES = [
  { id: 'course-ja-char-11', level: 11, title: 'Katakana — Voyelles ア イ ウ エ オ',  description: 'Les 5 voyelles katakana', prerequisiteId: 'course-ja-char-10' },
  { id: 'course-ja-char-12', level: 12, title: 'Katakana — Série K カ キ ク ケ コ',   description: 'Syllabes katakana rangée K', prerequisiteId: 'course-ja-char-11' },
  { id: 'course-ja-char-13', level: 13, title: 'Katakana — Série S サ シ ス セ ソ',   description: 'Syllabes katakana rangée S', prerequisiteId: 'course-ja-char-12' },
  { id: 'course-ja-char-14', level: 14, title: 'Katakana — Série T タ チ ツ テ ト',   description: 'Syllabes katakana rangée T', prerequisiteId: 'course-ja-char-13' },
  { id: 'course-ja-char-15', level: 15, title: 'Katakana — Série N ナ ニ ヌ ネ ノ',   description: 'Syllabes katakana rangée N', prerequisiteId: 'course-ja-char-14' },
  { id: 'course-ja-char-16', level: 16, title: 'Katakana — Série H ハ ヒ フ ヘ ホ',   description: 'Syllabes katakana rangée H', prerequisiteId: 'course-ja-char-15' },
  { id: 'course-ja-char-17', level: 17, title: 'Katakana — Série M マ ミ ム メ モ',   description: 'Syllabes katakana rangée M', prerequisiteId: 'course-ja-char-16' },
  { id: 'course-ja-char-18', level: 18, title: 'Katakana — Série Y ヤ ユ ヨ',         description: 'Syllabes katakana rangée Y', prerequisiteId: 'course-ja-char-17' },
  { id: 'course-ja-char-19', level: 19, title: 'Katakana — Série R ラ リ ル レ ロ',   description: 'Syllabes katakana rangée R', prerequisiteId: 'course-ja-char-18' },
  { id: 'course-ja-char-20', level: 20, title: 'Katakana — Série W ワ ヲ ン',          description: 'Syllabes katakana finales',  prerequisiteId: 'course-ja-char-19' },
];

// ── Katakana metadata ─────────────────────────────────────────────────────────
const KATAKANA = [
  // Cours 11 — Voyelles
  { char: 'ア', id: 'katakana-a',   courseId: 'course-ja-char-11', courseLevel: 11, romaji: 'a',   kana: 'あ' },
  { char: 'イ', id: 'katakana-i',   courseId: 'course-ja-char-11', courseLevel: 11, romaji: 'i',   kana: 'い' },
  { char: 'ウ', id: 'katakana-u',   courseId: 'course-ja-char-11', courseLevel: 11, romaji: 'u',   kana: 'う' },
  { char: 'エ', id: 'katakana-e',   courseId: 'course-ja-char-11', courseLevel: 11, romaji: 'e',   kana: 'え' },
  { char: 'オ', id: 'katakana-o',   courseId: 'course-ja-char-11', courseLevel: 11, romaji: 'o',   kana: 'お' },
  // Cours 12 — K
  { char: 'カ', id: 'katakana-ka',  courseId: 'course-ja-char-12', courseLevel: 12, romaji: 'ka',  kana: 'か' },
  { char: 'キ', id: 'katakana-ki',  courseId: 'course-ja-char-12', courseLevel: 12, romaji: 'ki',  kana: 'き' },
  { char: 'ク', id: 'katakana-ku',  courseId: 'course-ja-char-12', courseLevel: 12, romaji: 'ku',  kana: 'く' },
  { char: 'ケ', id: 'katakana-ke',  courseId: 'course-ja-char-12', courseLevel: 12, romaji: 'ke',  kana: 'け' },
  { char: 'コ', id: 'katakana-ko',  courseId: 'course-ja-char-12', courseLevel: 12, romaji: 'ko',  kana: 'こ' },
  // Cours 13 — S
  { char: 'サ', id: 'katakana-sa',  courseId: 'course-ja-char-13', courseLevel: 13, romaji: 'sa',  kana: 'さ' },
  { char: 'シ', id: 'katakana-shi', courseId: 'course-ja-char-13', courseLevel: 13, romaji: 'shi', kana: 'し' },
  { char: 'ス', id: 'katakana-su',  courseId: 'course-ja-char-13', courseLevel: 13, romaji: 'su',  kana: 'す' },
  { char: 'セ', id: 'katakana-se',  courseId: 'course-ja-char-13', courseLevel: 13, romaji: 'se',  kana: 'せ' },
  { char: 'ソ', id: 'katakana-so',  courseId: 'course-ja-char-13', courseLevel: 13, romaji: 'so',  kana: 'そ' },
  // Cours 14 — T
  { char: 'タ', id: 'katakana-ta',  courseId: 'course-ja-char-14', courseLevel: 14, romaji: 'ta',  kana: 'た' },
  { char: 'チ', id: 'katakana-chi', courseId: 'course-ja-char-14', courseLevel: 14, romaji: 'chi', kana: 'ち' },
  { char: 'ツ', id: 'katakana-tsu', courseId: 'course-ja-char-14', courseLevel: 14, romaji: 'tsu', kana: 'つ' },
  { char: 'テ', id: 'katakana-te',  courseId: 'course-ja-char-14', courseLevel: 14, romaji: 'te',  kana: 'て' },
  { char: 'ト', id: 'katakana-to',  courseId: 'course-ja-char-14', courseLevel: 14, romaji: 'to',  kana: 'と' },
  // Cours 15 — N
  { char: 'ナ', id: 'katakana-na',  courseId: 'course-ja-char-15', courseLevel: 15, romaji: 'na',  kana: 'な' },
  { char: 'ニ', id: 'katakana-ni',  courseId: 'course-ja-char-15', courseLevel: 15, romaji: 'ni',  kana: 'に' },
  { char: 'ヌ', id: 'katakana-nu',  courseId: 'course-ja-char-15', courseLevel: 15, romaji: 'nu',  kana: 'ぬ' },
  { char: 'ネ', id: 'katakana-ne',  courseId: 'course-ja-char-15', courseLevel: 15, romaji: 'ne',  kana: 'ね' },
  { char: 'ノ', id: 'katakana-no',  courseId: 'course-ja-char-15', courseLevel: 15, romaji: 'no',  kana: 'の' },
  // Cours 16 — H
  { char: 'ハ', id: 'katakana-ha',  courseId: 'course-ja-char-16', courseLevel: 16, romaji: 'ha',  kana: 'は' },
  { char: 'ヒ', id: 'katakana-hi',  courseId: 'course-ja-char-16', courseLevel: 16, romaji: 'hi',  kana: 'ひ' },
  { char: 'フ', id: 'katakana-fu',  courseId: 'course-ja-char-16', courseLevel: 16, romaji: 'fu',  kana: 'ふ' },
  { char: 'ヘ', id: 'katakana-he',  courseId: 'course-ja-char-16', courseLevel: 16, romaji: 'he',  kana: 'へ' },
  { char: 'ホ', id: 'katakana-ho',  courseId: 'course-ja-char-16', courseLevel: 16, romaji: 'ho',  kana: 'ほ' },
  // Cours 17 — M
  { char: 'マ', id: 'katakana-ma',  courseId: 'course-ja-char-17', courseLevel: 17, romaji: 'ma',  kana: 'ま' },
  { char: 'ミ', id: 'katakana-mi',  courseId: 'course-ja-char-17', courseLevel: 17, romaji: 'mi',  kana: 'み' },
  { char: 'ム', id: 'katakana-mu',  courseId: 'course-ja-char-17', courseLevel: 17, romaji: 'mu',  kana: 'む' },
  { char: 'メ', id: 'katakana-me',  courseId: 'course-ja-char-17', courseLevel: 17, romaji: 'me',  kana: 'め' },
  { char: 'モ', id: 'katakana-mo',  courseId: 'course-ja-char-17', courseLevel: 17, romaji: 'mo',  kana: 'も' },
  // Cours 18 — Y
  { char: 'ヤ', id: 'katakana-ya',  courseId: 'course-ja-char-18', courseLevel: 18, romaji: 'ya',  kana: 'や' },
  { char: 'ユ', id: 'katakana-yu',  courseId: 'course-ja-char-18', courseLevel: 18, romaji: 'yu',  kana: 'ゆ' },
  { char: 'ヨ', id: 'katakana-yo',  courseId: 'course-ja-char-18', courseLevel: 18, romaji: 'yo',  kana: 'よ' },
  // Cours 19 — R
  { char: 'ラ', id: 'katakana-ra',  courseId: 'course-ja-char-19', courseLevel: 19, romaji: 'ra',  kana: 'ら' },
  { char: 'リ', id: 'katakana-ri',  courseId: 'course-ja-char-19', courseLevel: 19, romaji: 'ri',  kana: 'り' },
  { char: 'ル', id: 'katakana-ru',  courseId: 'course-ja-char-19', courseLevel: 19, romaji: 'ru',  kana: 'る' },
  { char: 'レ', id: 'katakana-re',  courseId: 'course-ja-char-19', courseLevel: 19, romaji: 're',  kana: 'れ' },
  { char: 'ロ', id: 'katakana-ro',  courseId: 'course-ja-char-19', courseLevel: 19, romaji: 'ro',  kana: 'ろ' },
  // Cours 20 — W
  { char: 'ワ', id: 'katakana-wa',  courseId: 'course-ja-char-20', courseLevel: 20, romaji: 'wa',  kana: 'わ' },
  { char: 'ヲ', id: 'katakana-wo',  courseId: 'course-ja-char-20', courseLevel: 20, romaji: 'wo',  kana: 'を' },
  { char: 'ン', id: 'katakana-n',   courseId: 'course-ja-char-20', courseLevel: 20, romaji: 'n',   kana: 'ん' },
];

// ── KanjiVG fetch ─────────────────────────────────────────────────────────────
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return resolve(fetchUrl(res.headers.location));
      if (res.statusCode !== 200)
        return reject(new Error(`HTTP ${res.statusCode}`));
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractPaths(svg) {
  const paths = [];
  const re = /<path[^>]*\sd\s*=\s*"([^"]+)"[^>]*>/gi;
  let m;
  while ((m = re.exec(svg)) !== null) paths.push(m[1]);
  return paths;
}

async function fetchPaths(char) {
  const hex = char.codePointAt(0).toString(16).padStart(4, '0');
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
  const svg = await fetchUrl(url);
  return extractPaths(svg);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🈳  Seeding katakana courses and characters...\n');

  // 1. Upsert courses
  console.log('📚 Creating courses...');
  for (const course of COURSES) {
    await db.course.upsert({
      where: { id: course.id },
      create: {
        id:             course.id,
        languageId:     'lang-ja',
        type:           'character',
        level:          course.level,
        title:          course.title,
        description:    course.description,
        prerequisiteId: course.prerequisiteId,
      },
      update: {
        title:          course.title,
        description:    course.description,
        prerequisiteId: course.prerequisiteId,
      },
    });
    console.log(`  ✓ ${course.title}`);
  }

  // 2. Fetch + upsert characters
  console.log('\n✍️  Fetching KanjiVG and inserting characters...');
  let ok = 0, skip = 0;
  for (const k of KATAKANA) {
    process.stdout.write(`  ${k.char} (${k.romaji})... `);
    let svgPaths;
    try {
      svgPaths = await fetchPaths(k.char);
      process.stdout.write(`${svgPaths.length} paths\n`);
    } catch (err) {
      console.warn(`⚠️  Failed: ${err.message}`);
      skip++;
      continue;
    }
    if (!svgPaths.length) {
      console.warn(`⚠️  No paths`);
      skip++;
      continue;
    }

    await db.character.upsert({
      where: { id: k.id },
      create: {
        id:          k.id,
        languageId:  'lang-ja',
        courseId:    k.courseId,
        label:       k.char,
        audioText:   k.char,
        svgPaths:    JSON.stringify(svgPaths),
        strokeCount: svgPaths.length,
        meanings:    JSON.stringify([`katakana ${k.romaji}`]),
        romaji:      JSON.stringify([k.romaji]),
        readings:    JSON.stringify({ kana: [k.kana] }),
        jlpt:        'N5',
        courseLevel: k.courseLevel,
      },
      update: {
        svgPaths:    JSON.stringify(svgPaths),
        strokeCount: svgPaths.length,
        courseId:    k.courseId,
      },
    });
    ok++;
  }

  console.log(`\n✅ Done — ${ok} katakana insérés, ${skip} ignorés.\n`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
