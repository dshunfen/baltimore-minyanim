import { writeFileSync, mkdirSync } from 'node:fs';

const ABBREVS = ['SH', 'MI', 'MM', 'MA'];
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const NAMED_ENTITIES = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

function stripTags(s) {
  return decodeEntities(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function parseTimeMinutes(s) {
  const m = s.toLowerCase().match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/);
  if (!m) return Number.POSITIVE_INFINITY;
  const [, h, mn, ampm] = m;
  return (Number(h) % 12) * 60 + Number(mn || 0) + (ampm === 'pm' ? 720 : 0);
}

async function scrape(day) {
  const extra = day === 'tomorrow' ? '&direction=next' : '';
  const all = [];
  for (const abbrev of ABBREVS) {
    const url = `https://baltimorejewishlife.com/minyanim/shacharis.php?minyanType=${abbrev}${extra}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`${abbrev} ${day}: HTTP ${res.status}`);
    const html = await res.text();
    const container = html.match(/<div id="listing-container">([\s\S]*?)<div id="ad">/);
    if (!container) {
      console.warn(`${abbrev} ${day}: no listing-container found`);
      continue;
    }
    const ulRegex = /<ul[^>]*>([\s\S]*?)<\/ul>/g;
    let ulMatch;
    while ((ulMatch = ulRegex.exec(container[1])) !== null) {
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/g;
      const lis = [];
      let liMatch;
      while ((liMatch = liRegex.exec(ulMatch[1])) !== null) lis.push(liMatch[1]);
      if (lis.length < 2) continue;
      const shul = stripTags(lis[0]);
      const time = stripTags(lis[1]);
      if (shul && time) all.push([shul, time]);
    }
  }
  return all.sort(([, a], [, b]) => parseTimeMinutes(a) - parseTimeMinutes(b));
}

async function main() {
  mkdirSync('cache', { recursive: true });
  for (const day of ['today', 'tomorrow']) {
    const data = await scrape(day);
    const path = `cache/${day}.json`;
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
    console.log(`${path}: ${data.length} entries`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
