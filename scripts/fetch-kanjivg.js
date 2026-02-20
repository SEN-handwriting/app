const https = require('https');
const fs = require('fs');
const path = require('path');

function codepointHex(ch) {
  const code = ch.codePointAt(0);
  if (!code) throw new Error('Invalid character');
  return code.toString(16).toUpperCase().padStart(4, '0');
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        return resolve(fetchUrl(res.headers.location));
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractPaths(svg) {
  // Very small parser: extract <path ... d="..." ... /> in order
  const paths = [];
  // match both single and double quotes, and handle newlines
  const re = /<path[^>]*\sd\s*=\s*"([^"]+)"[^>]*>/gi;
  let m;
  while ((m = re.exec(svg)) !== null) {
    paths.push(m[1]);
  }
  // some files use single quotes
  if (!paths.length) {
    const re2 = /<path[^>]*\sd\s*=\s*'([^']+)'[^>]*>/gi;
    while ((m = re2.exec(svg)) !== null) {
      paths.push(m[1]);
    }
  }
  return paths;
}

async function main() {
  const ch = process.argv[2];
  if (!ch) {
    console.error('Usage: node scripts/fetch-kanjivg.js <character>');
    process.exit(2);
  }

  const hex = codepointHex(ch).toLowerCase();
  // KanjiVG repository raw path pattern
  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
  console.log(`Fetching KanjiVG for '${ch}' -> ${hex} from ${url}`);
  try {
    const svg = await fetchUrl(url);
    const paths = extractPaths(svg);
    if (!paths.length) {
      console.warn('No <path d="..."> found in SVG — saving raw svg anyway');
    }
    const outDir = path.join(__dirname, '..', 'apps', 'web', 'src', 'data', 'kanjivg');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${hex}.json`);
    const payload = { kanji: ch, code: hex, url, paths, svg: svg };
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`Saved ${outPath} with ${paths.length} paths`);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
