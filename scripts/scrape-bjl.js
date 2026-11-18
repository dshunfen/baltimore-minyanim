import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';

// BJL lists no minyanim on Shabbos/Yom Tov, so a scrape on those days returns a
// near-empty page. Never clobber a good cache with such a result — keep the last
// known-good day instead. Real days have 100+ entries; this floor is well clear of that.
const MIN_ENTRIES = 20;

// BJL's minyanim page is drawn from this API: one request per tefilah for a given
// date returns the minyanim that apply that day, with holiday schedules chosen by
// the flags from its zmanim endpoint.
const API = 'https://baltimorejewishlife.com/wp-json/minyan-times/v1';
const CITY = 'Baltimore';
// BJL calculates sunrise and sunset for 21209.
const ZMANIM_LOCATION = { lat: 39.3716, lng: -76.6744 };
const TYPES = ['Shacharis', 'Mincha', 'Mincha/Maariv', 'Maariv'];
const HOLIDAY_FLAGS = [
  'IsAsaraBiteves', 'IsCholHamoed', 'IsErevPesach', 'IsErevShabbos', 'IsErevTishaBav',
  'IsErevYomKipper', 'IsErevYomTov', 'IsFastDay', 'IsRoshChodesh', 'IsShabbos',
  'IsShivaAsarBitammuz', 'IsTaanisEsther', 'IsTishaBav', 'IsTuBeshvat', 'IsTzomGedalia',
  'IsYomKipper', 'IsYomTov', 'IsBHB', 'IsSlichosBeforeRH', 'IsSlichosAfterRH', 'IsChanuka',
];
// How a minyan set relative to the sun is anchored (the API's "formula" codes).
const FORMULA = { BEFORE_SUNSET: 1, AFTER_SUNSET: 2, BEFORE_SUNRISE: 3, AFTER_SUNRISE: 4, MIDDAY: 5 };
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://baltimorejewishlife.com/minyanim/',
};

async function getJson(path, params) {
  const url = `${API}${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  return `${h % 12 || 12}:${String(minutes % 60).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

// The API gives zmanim as local clock times in an ISO string, so the hour and
// minute are read straight from the text.
function clockMinutes(iso) {
  const [, h, m] = iso.match(/T(\d{2}):(\d{2})/);
  return Number(h) * 60 + Number(m);
}

function minyanMinutes(minyan, zman) {
  if (minyan.isCustom !== '1') return clockMinutes(`T${minyan.time}`);
  const offset = Number(minyan.minutes);
  switch (Number(minyan.formula)) {
    case FORMULA.BEFORE_SUNSET: return clockMinutes(zman.SunsetDefault) - offset;
    case FORMULA.AFTER_SUNSET: return clockMinutes(zman.SunsetDefault) + offset;
    case FORMULA.BEFORE_SUNRISE: return clockMinutes(zman.SunriseDefault) - offset;
    case FORMULA.AFTER_SUNRISE: return clockMinutes(zman.SunriseDefault) + offset;
    case FORMULA.MIDDAY: return clockMinutes(zman.MinchaStrict);
    default: return null;
  }
}

async function scrape(day) {
  const date = cacheDate(day);
  const { Time, Zman } = await getJson('/zManim/gps', { date, ...ZMANIM_LOCATION });
  const holidays = Object.fromEntries(HOLIDAY_FLAGS.map((flag) => [`holidays[${flag}]`, Boolean(Time[flag])]));
  const all = new Map();
  for (const type of TYPES) {
    const minyanim = await getJson('/times', {
      city: CITY, day: Time.Weekday, nusach: '', sortBy: 'time', rabbi: '', shul: '',
      date: date.replaceAll('-', '/'), type, teacher: '', ...holidays,
    });
    for (const minyan of minyanim) {
      const minutes = minyanMinutes(minyan, Zman);
      if (minutes === null || Number.isNaN(minutes)) continue;
      // A shul listed under two tefilos at the same time is one line in the cache.
      all.set(`${minyan.location}|${minutes}`, [minyan.location, minutes]);
    }
  }
  return [...all.values()]
    .sort(([, a], [, b]) => a - b)
    .map(([shul, minutes]) => [shul, formatMinutes(minutes)]);
}

// The date (in Baltimore) that a scrape of `day` describes, as YYYY-MM-DD.
function cacheDate(day) {
  const dt = new Date();
  if (day === 'tomorrow') dt.setDate(dt.getDate() + 1);
  return dt.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

async function main() {
  mkdirSync('cache', { recursive: true });
  // meta.json records which date each cache file actually holds. The scheduled run
  // often lands hours late, and until it does today.json is still yesterday's list —
  // the reader uses this to pick the file that really matches the day it wants.
  const metaPath = 'cache/meta.json';
  const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : {};
  for (const day of ['today', 'tomorrow']) {
    const data = await scrape(day);
    const path = `cache/${day}.json`;
    if (data.length < MIN_ENTRIES) {
      const prev = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')).length : 0;
      console.warn(`${path}: only ${data.length} entries (likely Shabbos/Yom Tov or scrape failure) — keeping previous cache of ${prev}`);
      continue;
    }
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
    meta[day] = cacheDate(day);
    console.log(`${path}: ${data.length} entries`);
  }
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
