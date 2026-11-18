// Minyan times, read from the cache the daily GitHub scrape keeps up to date.

const DEFAULT_PAGESIZE = 7
const MINYANIM_HELP = [
  "Supply a start time for minyanim (and optional result size).\nExamples: \"now\", \"tomorrow 6pm\", \"6am 10\", \"2:45 PM\", \"315pm\"",
  "Or, send \"zman/zmanim\" and \"today/tomorrow\" (optional) and \"21209\" (optional)",
]
const SHUL_MAP = {
  'Adath Yeshurun Mogen Abraham': "Adas Yeshurun",
  'Agudah of Greenspring / Adath Yeshurun Mogen Abraham': "Schuchatowitz",
  'Agudath Israel of Baltimore': "Heinemann",
  'Aish Kodesh (Ranchleigh)': "Aish Kodesh",
  'Anshei Walker Mincha Minyan 23 Walker Ave 3rd Floor Conference Room': "Anshei Walker",
  'Arugas HaBosem (Rabbi Taub\'s)': "Taub",
  'B2B Mobile Auction': "B2B",
  'Bais Haknesses Ohr HaChaim': "Weiss",
  'Bais Hamedrash and Mesivta of Baltimore': "Mesivta",
  'Bais Lubavitch': "Bais Lub.",
  'Bais Medrash of Ranchleigh': "Naiman Ranch.",
  'Bais Medrash of Summit Park (Bais Dovid)': "Bais Dovid",
  'Beit Yaakov': "BY",
  'Beth Abraham': "Beth Abraham",
  'Beth Tfiloh Congregation': "BT",
  'Big Al @ The Knish Shop Party room': "Knish",
  'Bnai Jacob Shaarei Zion Congregation': "BJSZ",
  'Chabad Israeli Center of Baltimore': "Chabad Israeli",
  'Chabad Lubavitch of Downtown Baltimore': "Chabad Downtown",
  'Chabad of Park Heights (Clarks Lane)': "Chabad PH",
  'Cheder Chabad': "Cheder Chabad",
  'Chofetz Chaim Congregation at Talmudical Academy': "TA",
  'Community Kollel Tiferes Moshe Aryeh': "Comm. Kollel",
  'Darchei Tzedek': "Darchei",
  'DC Dental Mincha Minyan --1133 Greenwood Road 21208': "DC Dental",
  'Derech Chaim': 'Gross',
  'Etz Chaim Ford Lane': "Etz Chaim PV",
  'Etz Chaim of Owings Mills': "Etz Chaim OM",
  'Ezras Israel': "Ezras",
  'Greenspring Sephardic Center': "Sephardic Center",
  'Hat Box': "Hat Box",
  'Johns Hopkins Bikur Cholim room (Blalick 175)': "JHU Bikur",
  'Johns Hopkins Bikur Cholim room (Blalick 175) Rabbi Zev Gopin': "JHU Bikur",
  'Johns Hopkins University Hillel': "JHU Hillel",
  'JROC': "JROC",
  'KD Gold& Coin Exchange': "Kaylah",
  'Kedushas Yisrael': "Kedushas",
  'Kehilas Bnei Yeshiva': "Meister",
  'Kehillas Meor HaTorah': "Meor",
  'Kehilath B\'nai Torah': "Seidemann",
  'Khal Ahavas Yisroel Tzemach Tzedek': "Tzemach",
  'Khal Bais Nosson 2901 Taney (corner Taney & Baywood)': "Bais Nosson",
  'Knish Shop': "Knish",
  'Kol Torah': "Berger",
  'Kollel Nachlas Yosef 2324 Smith Ave': "Nachlas Yosef",
  'Kollel of Greenspring 6504 Greenspring Ave': "Kollel Greenspring",
  'Kollel Ruach Chaim 6229 Greenspring Ave': "Ruach Chaim",
  'Lev Shlomo/CBMI': "Lev Shlomo",
  'Levindale': "Levindale",
  'Machzikei Torah (Sternhill\'s)': "Sternhill",
  'Magen David Sephardic Congregation': "Magen David",
  'Market Maven': "Market Maven",
  'Mercaz Torah U\'Tefillah': "Eichenstein",
  'Mercaz Torah U\'Tefillah (Ezras Nashim (Kollel ))': "Eichenstein",
  'Mercaz Torah U\'Tefillah (Kollel Minyan Ezras Nashim)': "Eichenstein",
  'Mesivta Kesser Torah': "Kesser Torah",
  'Mesivta N\'eimus Hatorah': "Neimus",
  'Mesivta Shaarei Chaim (Community Kollel )': "Shaarei Chaim",
  'Mevakshei Torah': "Millrod",
  'Milk & Honey Bistro 1777 Reisterstown RD': "Milk Honey",
  'Moses Montefiore - Anshe Emunah Greengate Jewish Center': "Montefiore",
  'Nachal Chaim': "Nachal",
  'Ner Israel Rabbinical College': "Ner",
  'Ner Tamid Greenspring Valley Synagogue': "Motzen",
  'Neuberger, Quinn, Gielen, Rubin & Gibber, P.A. DOWNTOWN Mincha Minyan 1 South St #27, Baltimore, MD 21202': "NQGRG",
  'Ohel Moshe': "Teichman",
  'Ohel Yakov': "Ohel Yakov",
  'Ohr Hamizrach [Sefaradi]': "Ohr Hamizrach",
  'Ohr Simcha': "Ohr Simcha",
  'Ohr Yisrael': "Ohr Yisroel",
  'Shaarei Tfiloh Congregation': "Shaarei",
  'Shearith Israel Congregation/ Glen Avenue Shul': "Glen Ave.",
  'Shomrei Emunah Congregation': "Shomrei",
  'Shomrei Mishmeres': "Mishmeres",
  'Shteibel of Greenspring': "Shteibel",
  'Sinai Hospital': "Sinai",
  'Star K Mincha Minyan': "Star K",
  'Suburban Orthodox Congregation Toras Chaim': "Silber",
  'The Adas: Chofetz Chaim Adas Bnei Israel': "Adas",
  'The Shul at the Lubavitch Center': "Lubavitch Center",
  'Tiferes Yisroel': "Goldberger",
  'Tov Pizza Mincha Minyan': "Tov Pizza",
  'Yeshiva Gedola of Greater Washington': "YGW",
  'Yeshiva Tiferes Hatorah': "Tiferes Hatorah",
  // Names used by BJL's current minyanim listings (since November 2026).
  'Agudah of Greenspring': "Schuchatowitz",
  'Ahavas Chaim': "Ahavas Chaim",
  'Ahavat Shalom': "Ahavat Shalom",
  'Aish Kodesh': "Aish Kodesh",
  'Anshei Walker (Mincha Minyan)': "Anshei Walker",
  'Arugas HaBosem (Rabbi Taubs)': "Taub",
  'Attorney Big Al, The Law Office of Richard Klein': "Big Al",
  'BH and Mesivta of Baltimore (Dirshu Minyan)': "Mesivta Dirshu",
  'Bais Hamedrash and Mesivta of Baltimore (Dirshu Minyan)': "Mesivta Dirshu",
  'Baltimore Auto Supply': "Balt. Auto Supply",
  'Beth Abranham Congregation Tzeirah Anash': "Tzeirei Anash",
  'Beth Isaac Adath Israel': "Beth Isaac",
  'Chabad Israeli Center': "Chabad Israeli",
  'Chabad of Park Heights': "Chabad PH",
  'Commerce Center East': "Commerce Ctr East",
  'Cong Beth Abraham Hertzberg\'s': "Beth Abraham",
  'Congregation Ohel Levi Yitzchok (Bais Lubavitch)': "Bais Lub.",
  'HealthSource Distributors': "HealthSource",
  'Hesed Le Avraham Congregation': "Hesed Le Avraham",
  'Kehillas Ohr Yisrael of Baltimore': "Ohr Yisroel",
  'Kehillas Shaarei Avodah': "Shaarei Avodah",
  'Khal Ahavas Yisroel Tzemach Tzedek (KAYTT)': "Tzemach",
  'Khal Bais Nosson': "Bais Nosson",
  'Kollel Nachlas Yosef': "Nachlas Yosef",
  'Kollel Ruach Chaim': "Ruach Chaim",
  'Kollel of Greenspring': "Kollel Greenspring",
  'Machzikei Torah (Sternhills)': "Sternhill",
  'Mercaz Torah U\'Tefillah (Eichenstein\'s)': "Eichenstein",
  'Mesivta Shaarei Chaim': "Shaarei Chaim",
  'Milk & Honey Bistro': "Milk Honey",
  'Moses Montefiore Anshe Emunah Hebrew Congregation (MMAE)': "Montefiore",
  'Ner Israel Rabbinical College (Mechina)': "Ner Mechina",
  'Ner Tamid': "Motzen",
  'Ohr Hamizrach Congregation Sephardic synagogue': "Ohr Hamizrach",
  'Ohr Hatorah': "Ohr Hatorah",
  'Ohr Yisroel': "Ohr Yisroel",
  'Owings Mills Area': "Owings Mills",
  'Pikesville Beis Medrash': "Pikesville BM",
  'Pikesville Jewish Congregation': "PJC",
  'Reischer Minyan (Business Days)': "Reischer",
  'Shearith Israel Congregation (Glen Avenue Shul)': "Glen Ave.",
  'Shomrei Mishmeres Hakodesh': "Mishmeres",
  'Snider Law Firm (Business Days)': "Snider Law",
  'Star K': "Star K",
  'Talmudical Academy': "TA",
  'The Knish Shop Party Room (Business Days)': "Knish",
  'The New Shul': "New Shul",
  'The Young Anash Shul - Tzeirei Anash': "Young Anash",
  'Tov Pizza': "Tov Pizza",
  'Tzeirah Anash': "Tzeirei Anash",
  'wealcatch insurance': "Wealcatch"
}

function minyanimReplies(input) {
  if (input === "help") {
    return MINYANIM_HELP;
  }
  let day = "today";
  let time;
  let pagesize = DEFAULT_PAGESIZE;
  if (input === "now") {
    time = new Date();
  } else {
    const [inputDay, inputTime, inputPagesize] = parseDateTime(input);
    if (!inputTime) {
      return null;
    }
    day = inputDay;
    time = inputTime;
    if (inputPagesize) {
      pagesize = inputPagesize;
    }
  }
  const replies = filterAndChunkReplies(getMinyanim(day), time, pagesize);
  return replies.length ? replies : [`There are no tefilah times ${day} past ${shortTime(time)}`];
}

const MINYAN_CACHE_URL_PREFIX = "https://raw.githubusercontent.com/dshunfen/baltimore-minyanim/main/cache";

function fetchBJLMinyanim(file) {
  const url = `${MINYAN_CACHE_URL_PREFIX}/${file}.json`;
  const res = UrlFetchApp.fetch(url).getContentText();
  return JSON.parse(res)
    .map(([shul, timeStr]) => {
      const [, time] = parseDateTime(timeStr.toLowerCase());
      return [shul, time];
    })
    .filter(([_, time]) => time);
}

// The scrape Action is scheduled overnight but often lands mid-morning. Until it does,
// today.json still holds yesterday's list and tomorrow.json holds today's — which gets
// day-specific times wrong (e.g. earlier Mon/Thu shacharis for leining). meta.json says
// which date each file really holds, so pick the file matching the day being asked for.
function cacheFileForDay(day) {
  const dt = new Date();
  if (day === "tomorrow") {
    dt.setDate(dt.getDate() + 1);
  }
  const wanted = Utilities.formatDate(dt, "America/New_York", "yyyy-MM-dd");
  try {
    const meta = JSON.parse(UrlFetchApp.fetch(`${MINYAN_CACHE_URL_PREFIX}/meta.json`).getContentText());
    return ["today", "tomorrow"].find(file => meta[file] === wanted) || day;
  } catch (e) {
    return day;
  }
}

function getMinyanim(day) {
  // Read straight from the GitHub cache each time. It's CDN-backed and refreshed
  // daily by the scrape Action, so a per-request fetch is cheap and always current.
  // A Drive-side cache used to live here but was the source of day-behind staleness:
  // it could lock in a pre-refresh (or prior-day) snapshot for the rest of the day.
  const minyanList = fetchBJLMinyanim(cacheFileForDay(day));
  if (day === "tomorrow") {
    minyanList.forEach(([, time]) => time.setDate(time.getDate() + 1));
  }
  return minyanList;
}

function parseDateTime(input) {
  let time;
  let _day = "today";
  let _pagesize;
  const inputMatch = input.match(/(?<day>tomorrow)?\s*(?<hours>0?[1-9]|1[0-2]):?(?<minutes>[0-5]\d)?\s?(?<meridiem>am|pm)\s*(?<pagesize>\d*)/)
  if(inputMatch) {
    const {day, hours, minutes, meridiem, pagesize} = inputMatch.groups;
    _pagesize = pagesize;
    const PM = meridiem === 'pm';
    const hoursFull = (+hours % 12) + (PM ? 12 : 0);
    time = new Date()
    time.setHours(hoursFull, minutes ? minutes : 0, 0, 0);
    if (day === "tomorrow") {
      time.setDate(time.getDate() + 1);
      _day = day;
    }
  }
  return [_day, time, _pagesize];
}
