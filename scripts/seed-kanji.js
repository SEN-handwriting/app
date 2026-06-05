/**
 * Fetches KanjiVG stroke paths for all Japanese word kanji
 * and upserts them into the Character table.
 *
 * Usage (from repo root):
 *   node scripts/seed-kanji.js
 *
 * Requires DATABASE_URL in packages/database/.env
 */

const https = require('https');
const path  = require('path');
const fs    = require('fs');

// ── Load .env from packages/database ─────────────────────────────────────────
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

// ── Kanji metadata ────────────────────────────────────────────────────────────
const KANJI = [
  // Cours 1 — Nature & éléments
  { char: '水', id: 'kanji-mizu', kana: 'みず',  romaji: 'mizu',   meaning: 'eau',         jlpt: 'N5' },
  { char: '山', id: 'kanji-yama', kana: 'やま',  romaji: 'yama',   meaning: 'montagne',    jlpt: 'N5' },
  { char: '川', id: 'kanji-kawa', kana: 'かわ',  romaji: 'kawa',   meaning: 'rivière',     jlpt: 'N5' },
  { char: '花', id: 'kanji-hana', kana: 'はな',  romaji: 'hana',   meaning: 'fleur',       jlpt: 'N5' },
  { char: '月', id: 'kanji-tsuki',kana: 'つき',  romaji: 'tsuki',  meaning: 'lune / mois', jlpt: 'N5' },
  { char: '星', id: 'kanji-hoshi',kana: 'ほし',  romaji: 'hoshi',  meaning: 'étoile',      jlpt: 'N4' },
  { char: '海', id: 'kanji-umi',  kana: 'うみ',  romaji: 'umi',    meaning: 'mer',         jlpt: 'N4' },
  { char: '雨', id: 'kanji-ame',  kana: 'あめ',  romaji: 'ame',    meaning: 'pluie',       jlpt: 'N5' },
  { char: '火', id: 'kanji-hi',   kana: 'ひ',    romaji: 'hi',     meaning: 'feu',         jlpt: 'N5' },
  { char: '木', id: 'kanji-ki',   kana: 'き',    romaji: 'ki',     meaning: 'arbre / bois',jlpt: 'N5' },
  // Cours 2 — Animaux & couleurs
  { char: '犬', id: 'kanji-inu',   kana: 'いぬ',  romaji: 'inu',   meaning: 'chien',       jlpt: 'N5' },
  { char: '猫', id: 'kanji-neko',  kana: 'ねこ',  romaji: 'neko',  meaning: 'chat',        jlpt: 'N4' },
  { char: '鳥', id: 'kanji-tori',  kana: 'とり',  romaji: 'tori',  meaning: 'oiseau',      jlpt: 'N4' },
  { char: '魚', id: 'kanji-sakana',kana: 'さかな',romaji: 'sakana',meaning: 'poisson',     jlpt: 'N4' },
  { char: '青', id: 'kanji-ao',    kana: 'あお',  romaji: 'ao',    meaning: 'bleu / vert', jlpt: 'N5' },
  { char: '赤', id: 'kanji-aka',   kana: 'あか',  romaji: 'aka',   meaning: 'rouge',       jlpt: 'N5' },
  { char: '白', id: 'kanji-shiro', kana: 'しろ',  romaji: 'shiro', meaning: 'blanc',       jlpt: 'N5' },
  { char: '黒', id: 'kanji-kuro',  kana: 'くろ',  romaji: 'kuro',  meaning: 'noir',        jlpt: 'N5' },
  { char: '空', id: 'kanji-sora',  kana: 'そら',  romaji: 'sora',  meaning: 'ciel / vide', jlpt: 'N5' },
  { char: '風', id: 'kanji-kaze',  kana: 'かぜ',  romaji: 'kaze',  meaning: 'vent',        jlpt: 'N3' },
];

// ── KanjiVG fetch ─────────────────────────────────────────────────────────────
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location)
        return resolve(fetchUrl(res.headers.location));
      if (res.statusCode !== 200)
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
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

async function fetchKanjiPaths(char) {
  const hex = char.codePointAt(0).toString(16).padStart(4, '0');
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
  const svg = await fetchUrl(url);
  return extractPaths(svg);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🈳  Importing kanji into Character table...\n');

  for (const k of KANJI) {
    process.stdout.write(`  Fetching KanjiVG for ${k.char} (${k.romaji})... `);
    let svgPaths;
    try {
      svgPaths = await fetchKanjiPaths(k.char);
      process.stdout.write(`${svgPaths.length} paths\n`);
    } catch (err) {
      console.warn(`  ⚠️  Failed: ${err.message} — skipping`);
      continue;
    }

    if (!svgPaths.length) {
      console.warn(`  ⚠️  No paths found for ${k.char} — skipping`);
      continue;
    }

    await db.character.upsert({
      where: { id: k.id },
      create: {
        id:          k.id,
        languageId:  'lang-ja',
        label:       k.char,
        audioText:   k.kana,
        svgPaths:    JSON.stringify(svgPaths),
        strokeCount: svgPaths.length,
        meanings:    JSON.stringify([k.meaning]),
        romaji:      JSON.stringify([k.romaji]),
        readings:    JSON.stringify({ kana: [k.kana] }),
        jlpt:        k.jlpt,
        courseLevel: 1,
      },
      update: {
        svgPaths:    JSON.stringify(svgPaths),
        strokeCount: svgPaths.length,
        meanings:    JSON.stringify([k.meaning]),
        romaji:      JSON.stringify([k.romaji]),
        readings:    JSON.stringify({ kana: [k.kana] }),
        jlpt:        k.jlpt,
      },
    });
    console.log(`  ✓ ${k.char} inséré`);
  }

  console.log(`\n✅ ${KANJI.length} kanji importés.\n`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
