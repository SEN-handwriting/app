/**
 * generate-cyrillic-paths.js
 *
 * Extracts real SVG glyph paths from Noto Sans (Cyrillic) via opentype.js.
 * Outputs ru-font-upper.json and ru-font-lower.json in packages/database/data/.
 *
 * Usage:
 *   cd C:\wamp64\www\app
 *   bun install opentype.js   (first time only)
 *   node scripts/generate-cyrillic-paths.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const FONT_URL = 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
const FONT_PATH = path.join(__dirname, 'NotoSans-Regular.ttf');
const OUT_DIR = path.join(__dirname, '..', 'packages', 'database', 'data');

const VIEWBOX = 109;
const PADDING = 10; // px margin inside viewbox

// ─── Character lists ──────────────────────────────────────────────────────────

const UPPER = [
  { id: 'cyrillic-a',          label: 'А', meanings: ['voyelle a'],   romaji: ['a'],     courseId: 'course-ru-char-1', courseLevel: 1 },
  { id: 'cyrillic-o',          label: 'О', meanings: ['voyelle o'],   romaji: ['o'],     courseId: 'course-ru-char-1', courseLevel: 1 },
  { id: 'cyrillic-u',          label: 'У', meanings: ['voyelle ou'],  romaji: ['ou'],    courseId: 'course-ru-char-1', courseLevel: 1 },
  { id: 'cyrillic-i',          label: 'И', meanings: ['voyelle i'],   romaji: ['i'],     courseId: 'course-ru-char-1', courseLevel: 1 },
  { id: 'cyrillic-e',          label: 'Э', meanings: ['voyelle é'],   romaji: ['é'],     courseId: 'course-ru-char-1', courseLevel: 1 },
  { id: 'cyrillic-ye',         label: 'Е', meanings: ['voyelle yé'],  romaji: ['yé'],    courseId: 'course-ru-char-1', courseLevel: 1 },
  { id: 'cyrillic-yu',         label: 'Ю', meanings: ['voyelle you'], romaji: ['you'],   courseId: 'course-ru-char-1', courseLevel: 1 },
  { id: 'cyrillic-ya',         label: 'Я', meanings: ['voyelle ya'],  romaji: ['ya'],    courseId: 'course-ru-char-1', courseLevel: 1 },
  { id: 'cyrillic-n',          label: 'Н', meanings: ['consonne n'],  romaji: ['n'],     courseId: 'course-ru-char-2', courseLevel: 2 },
  { id: 'cyrillic-t',          label: 'Т', meanings: ['consonne t'],  romaji: ['t'],     courseId: 'course-ru-char-2', courseLevel: 2 },
  { id: 'cyrillic-m',          label: 'М', meanings: ['consonne m'],  romaji: ['m'],     courseId: 'course-ru-char-2', courseLevel: 2 },
  { id: 'cyrillic-k',          label: 'К', meanings: ['consonne k'],  romaji: ['k'],     courseId: 'course-ru-char-2', courseLevel: 2 },
  { id: 'cyrillic-l',          label: 'Л', meanings: ['consonne l'],  romaji: ['l'],     courseId: 'course-ru-char-2', courseLevel: 2 },
  { id: 'cyrillic-p',          label: 'П', meanings: ['consonne p'],  romaji: ['p'],     courseId: 'course-ru-char-2', courseLevel: 2 },
  { id: 'cyrillic-s',          label: 'С', meanings: ['consonne s'],  romaji: ['s'],     courseId: 'course-ru-char-2', courseLevel: 2 },
  { id: 'cyrillic-r',          label: 'Р', meanings: ['consonne r'],  romaji: ['r'],     courseId: 'course-ru-char-2', courseLevel: 2 },
  { id: 'cyrillic-b',          label: 'Б', meanings: ['consonne b'],  romaji: ['b'],     courseId: 'course-ru-char-2', courseLevel: 2 },
  { id: 'cyrillic-v',          label: 'В', meanings: ['consonne v'],  romaji: ['v'],     courseId: 'course-ru-char-2', courseLevel: 2 },
  { id: 'cyrillic-g',          label: 'Г', meanings: ['consonne g'],  romaji: ['g'],     courseId: 'course-ru-char-3', courseLevel: 3 },
  { id: 'cyrillic-d',          label: 'Д', meanings: ['consonne d'],  romaji: ['d'],     courseId: 'course-ru-char-3', courseLevel: 3 },
  { id: 'cyrillic-z',          label: 'З', meanings: ['consonne z'],  romaji: ['z'],     courseId: 'course-ru-char-3', courseLevel: 3 },
  { id: 'cyrillic-j',          label: 'Й', meanings: ['consonne y'],  romaji: ['y'],     courseId: 'course-ru-char-3', courseLevel: 3 },
  { id: 'cyrillic-f',          label: 'Ф', meanings: ['consonne f'],  romaji: ['f'],     courseId: 'course-ru-char-3', courseLevel: 3 },
  { id: 'cyrillic-kh',         label: 'Х', meanings: ['consonne kh'], romaji: ['kh'],    courseId: 'course-ru-char-3', courseLevel: 3 },
  { id: 'cyrillic-zh',         label: 'Ж', meanings: ['consonne zh'], romaji: ['zh'],    courseId: 'course-ru-char-4', courseLevel: 4 },
  { id: 'cyrillic-ts',         label: 'Ц', meanings: ['consonne ts'], romaji: ['ts'],    courseId: 'course-ru-char-4', courseLevel: 4 },
  { id: 'cyrillic-ch',         label: 'Ч', meanings: ['consonne tch'],romaji: ['tch'],   courseId: 'course-ru-char-4', courseLevel: 4 },
  { id: 'cyrillic-sh',         label: 'Ш', meanings: ['consonne ch'], romaji: ['ch'],    courseId: 'course-ru-char-4', courseLevel: 4 },
  { id: 'cyrillic-shch',       label: 'Щ', meanings: ['consonne chtch'],romaji:['chtch'],courseId: 'course-ru-char-5', courseLevel: 5 },
  { id: 'cyrillic-hard-sign',  label: 'Ъ', meanings: ['signe dur'],   romaji: ['ʺ'],    courseId: 'course-ru-char-5', courseLevel: 5 },
  { id: 'cyrillic-yeru',       label: 'Ы', meanings: ['voyelle y'],   romaji: ['y'],     courseId: 'course-ru-char-5', courseLevel: 5 },
  { id: 'cyrillic-soft-sign',  label: 'Ь', meanings: ['signe mou'],   romaji: ['ʹ'],    courseId: 'course-ru-char-5', courseLevel: 5 },
  { id: 'cyrillic-yo',         label: 'Ё', meanings: ['voyelle yo'],  romaji: ['yo'],    courseId: 'course-ru-char-5', courseLevel: 5 },
];

const LOWER = [
  { id: 'cyrillic-a-lower',          label: 'а', meanings: ['voyelle a'],   romaji: ['a'],     courseId: 'course-ru-char-6',  courseLevel: 6  },
  { id: 'cyrillic-o-lower',          label: 'о', meanings: ['voyelle o'],   romaji: ['o'],     courseId: 'course-ru-char-6',  courseLevel: 6  },
  { id: 'cyrillic-u-lower',          label: 'у', meanings: ['voyelle ou'],  romaji: ['ou'],    courseId: 'course-ru-char-6',  courseLevel: 6  },
  { id: 'cyrillic-i-lower',          label: 'и', meanings: ['voyelle i'],   romaji: ['i'],     courseId: 'course-ru-char-6',  courseLevel: 6  },
  { id: 'cyrillic-e-lower',          label: 'э', meanings: ['voyelle é'],   romaji: ['é'],     courseId: 'course-ru-char-6',  courseLevel: 6  },
  { id: 'cyrillic-ye-lower',         label: 'е', meanings: ['voyelle yé'],  romaji: ['yé'],    courseId: 'course-ru-char-6',  courseLevel: 6  },
  { id: 'cyrillic-yu-lower',         label: 'ю', meanings: ['voyelle you'], romaji: ['you'],   courseId: 'course-ru-char-6',  courseLevel: 6  },
  { id: 'cyrillic-ya-lower',         label: 'я', meanings: ['voyelle ya'],  romaji: ['ya'],    courseId: 'course-ru-char-6',  courseLevel: 6  },
  { id: 'cyrillic-n-lower',          label: 'н', meanings: ['consonne n'],  romaji: ['n'],     courseId: 'course-ru-char-7',  courseLevel: 7  },
  { id: 'cyrillic-t-lower',          label: 'т', meanings: ['consonne t'],  romaji: ['t'],     courseId: 'course-ru-char-7',  courseLevel: 7  },
  { id: 'cyrillic-m-lower',          label: 'м', meanings: ['consonne m'],  romaji: ['m'],     courseId: 'course-ru-char-7',  courseLevel: 7  },
  { id: 'cyrillic-k-lower',          label: 'к', meanings: ['consonne k'],  romaji: ['k'],     courseId: 'course-ru-char-7',  courseLevel: 7  },
  { id: 'cyrillic-l-lower',          label: 'л', meanings: ['consonne l'],  romaji: ['l'],     courseId: 'course-ru-char-7',  courseLevel: 7  },
  { id: 'cyrillic-p-lower',          label: 'п', meanings: ['consonne p'],  romaji: ['p'],     courseId: 'course-ru-char-7',  courseLevel: 7  },
  { id: 'cyrillic-s-lower',          label: 'с', meanings: ['consonne s'],  romaji: ['s'],     courseId: 'course-ru-char-7',  courseLevel: 7  },
  { id: 'cyrillic-r-lower',          label: 'р', meanings: ['consonne r'],  romaji: ['r'],     courseId: 'course-ru-char-7',  courseLevel: 7  },
  { id: 'cyrillic-b-lower',          label: 'б', meanings: ['consonne b'],  romaji: ['b'],     courseId: 'course-ru-char-7',  courseLevel: 7  },
  { id: 'cyrillic-v-lower',          label: 'в', meanings: ['consonne v'],  romaji: ['v'],     courseId: 'course-ru-char-7',  courseLevel: 7  },
  { id: 'cyrillic-g-lower',          label: 'г', meanings: ['consonne g'],  romaji: ['g'],     courseId: 'course-ru-char-8',  courseLevel: 8  },
  { id: 'cyrillic-d-lower',          label: 'д', meanings: ['consonne d'],  romaji: ['d'],     courseId: 'course-ru-char-8',  courseLevel: 8  },
  { id: 'cyrillic-z-lower',          label: 'з', meanings: ['consonne z'],  romaji: ['z'],     courseId: 'course-ru-char-8',  courseLevel: 8  },
  { id: 'cyrillic-j-lower',          label: 'й', meanings: ['consonne y'],  romaji: ['y'],     courseId: 'course-ru-char-8',  courseLevel: 8  },
  { id: 'cyrillic-f-lower',          label: 'ф', meanings: ['consonne f'],  romaji: ['f'],     courseId: 'course-ru-char-8',  courseLevel: 8  },
  { id: 'cyrillic-kh-lower',         label: 'х', meanings: ['consonne kh'], romaji: ['kh'],    courseId: 'course-ru-char-8',  courseLevel: 8  },
  { id: 'cyrillic-zh-lower',         label: 'ж', meanings: ['consonne zh'], romaji: ['zh'],    courseId: 'course-ru-char-9',  courseLevel: 9  },
  { id: 'cyrillic-ts-lower',         label: 'ц', meanings: ['consonne ts'], romaji: ['ts'],    courseId: 'course-ru-char-9',  courseLevel: 9  },
  { id: 'cyrillic-ch-lower',         label: 'ч', meanings: ['consonne tch'],romaji: ['tch'],   courseId: 'course-ru-char-9',  courseLevel: 9  },
  { id: 'cyrillic-sh-lower',         label: 'ш', meanings: ['consonne ch'], romaji: ['ch'],    courseId: 'course-ru-char-9',  courseLevel: 9  },
  { id: 'cyrillic-shch-lower',       label: 'щ', meanings: ['consonne chtch'],romaji:['chtch'],courseId: 'course-ru-char-10', courseLevel: 10 },
  { id: 'cyrillic-hard-sign-lower',  label: 'ъ', meanings: ['signe dur'],   romaji: ['ʺ'],    courseId: 'course-ru-char-10', courseLevel: 10 },
  { id: 'cyrillic-yeru-lower',       label: 'ы', meanings: ['voyelle y'],   romaji: ['y'],     courseId: 'course-ru-char-10', courseLevel: 10 },
  { id: 'cyrillic-soft-sign-lower',  label: 'ь', meanings: ['signe mou'],   romaji: ['ʹ'],    courseId: 'course-ru-char-10', courseLevel: 10 },
  { id: 'cyrillic-yo-lower',         label: 'ё', meanings: ['voyelle yo'],  romaji: ['yo'],    courseId: 'course-ru-char-10', courseLevel: 10 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fetchFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return resolve(fetchFile(res.headers.location, dest));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

function r(n) { return Math.round(n * 10) / 10; }

/**
 * Extracts all glyph contours scaled to the 109×109 viewbox.
 * Returns [{order, d}] — one entry per contour (sub-path).
 */
function extractContours(opentype, font, char) {
  const glyph = font.charToGlyph(char);
  if (!glyph || glyph.index === 0) return null;

  // Render at 100 units so bounding box is easy to work with
  const glyphPath = glyph.getPath(0, 0, 100);
  const bb = glyphPath.getBoundingBox();
  if (bb.x1 === bb.x2 || bb.y1 === bb.y2) return null;

  const glyphW = bb.x2 - bb.x1;
  const glyphH = bb.y2 - bb.y1;
  const targetSize = VIEWBOX - 2 * PADDING;
  const scale = Math.min(targetSize / glyphW, targetSize / glyphH);

  // Center in viewbox; flip y (font: y-up, SVG: y-down)
  const tx = PADDING + (targetSize - glyphW * scale) / 2 - bb.x1 * scale;
  const ty = PADDING + (targetSize - glyphH * scale) / 2 + bb.y2 * scale;

  // Transform each command
  const tx_ = (x) => r(x * scale + tx);
  const ty_ = (y) => r(-y * scale + ty);

  // Build contours by splitting on M
  const contours = [];
  let current = '';

  for (const cmd of glyphPath.commands) {
    switch (cmd.type) {
      case 'M':
        if (current) contours.push(current.trim());
        current = `M${tx_(cmd.x)},${ty_(cmd.y)}`;
        break;
      case 'L':
        current += ` L${tx_(cmd.x)},${ty_(cmd.y)}`;
        break;
      case 'C':
        current += ` C${tx_(cmd.x1)},${ty_(cmd.y1)} ${tx_(cmd.x2)},${ty_(cmd.y2)} ${tx_(cmd.x)},${ty_(cmd.y)}`;
        break;
      case 'Q':
        current += ` Q${tx_(cmd.x1)},${ty_(cmd.y1)} ${tx_(cmd.x)},${ty_(cmd.y)}`;
        break;
      case 'Z':
        current += ' Z';
        break;
    }
  }
  if (current) contours.push(current.trim());

  return contours
    .filter(d => d.length > 5) // skip empty/trivial
    .map((d, i) => ({ order: i + 1, d }));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Check opentype.js
  let opentype;
  try {
    opentype = require('opentype.js');
  } catch {
    console.error('opentype.js not found. Install it first:');
    console.error('  bun add opentype.js   OR   npm install opentype.js');
    process.exit(1);
  }

  // 2. Download font
  if (!fs.existsSync(FONT_PATH)) {
    console.log('Downloading Noto Sans Regular...');
    await fetchFile(FONT_URL, FONT_PATH);
    console.log(`Font saved to ${FONT_PATH}`);
  } else {
    console.log('Font already cached.');
  }

  // 3. Load font
  console.log('Loading font...');
  const buf = fs.readFileSync(FONT_PATH);
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const font = opentype.parse(arrayBuffer);
  console.log('Font loaded.');

  // 4. Process characters
  function processChars(chars) {
    return chars.map(({ id, label, meanings, romaji, courseId, courseLevel }) => {
      const contours = extractContours(opentype, font, label);
      if (!contours || contours.length === 0) {
        console.warn(`  ⚠️  No path for ${label} (${id})`);
        return null;
      }
      console.log(`  ✓ ${label} (${id}) — ${contours.length} contour(s)`);
      return { id, label, strokeCount: contours.length, strokes: contours };
    }).filter(Boolean);
  }

  console.log('\nProcessing uppercase (33)...');
  const upperChars = processChars(UPPER);

  console.log('\nProcessing lowercase (33)...');
  const lowerChars = processChars(LOWER);

  // 5. Write JSON
  const upperJson = {
    lang: 'ru-RU',
    style: 'font',
    version: '2.0',
    source: 'Noto Sans Regular (Google, OFL)',
    note: 'Glyph outlines extracted from Noto Sans. ViewBox 0 0 109 109. Each contour is one stroke.',
    characters: upperChars,
  };

  const lowerJson = {
    lang: 'ru-RU',
    style: 'font',
    version: '2.0',
    source: 'Noto Sans Regular (Google, OFL)',
    note: 'Glyph outlines extracted from Noto Sans. ViewBox 0 0 109 109. Each contour is one stroke.',
    characters: lowerChars,
  };

  const upperPath = path.join(OUT_DIR, 'ru-font-upper.json');
  const lowerPath = path.join(OUT_DIR, 'ru-font-lower.json');

  fs.writeFileSync(upperPath, JSON.stringify(upperJson, null, 2), 'utf8');
  fs.writeFileSync(lowerPath, JSON.stringify(lowerJson, null, 2), 'utf8');

  console.log(`\n✅ Written: ${upperPath}`);
  console.log(`✅ Written: ${lowerPath}`);
  console.log(`\nUpper: ${upperChars.length}/33 characters`);
  console.log(`Lower: ${lowerChars.length}/33 characters`);
  console.log('\nNext step: update seed.ts to import ru-font-upper.json and ru-font-lower.json');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
