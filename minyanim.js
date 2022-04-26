const DEFAULT_PAGESIZE = 8
const SHUL_MAP = {
  'Adath Yeshurun Mogen Abraham': "Adas Yeshurun",
  'Agudah of Greenspring / Adath Yeshurun Mogen Abraham': "Schukatowitz",
  'Agudath Israel of Baltimore': "Heinemann",
  'Aish Kodesh (Ranchleigh)': "Aish Kodesh",
  'Arugas HaBosem (Rabbi Taub\'s)': "Taub",
  'B2B Mobile Auction': "B2B",
  'Bais Haknesses Ohr HaChaim': "Weiss",
  'Bais Hamedrash and Mesivta of Baltimore': "Mesivta",
  'Bais Lubavitch': "Bais Lub.",
  'Bais Medrash of Ranchleigh': "Naiman Ranch.",
  'Beit Yaakov': "BY",
  'Beth Tfiloh Congregation': "BT",
  'Big Al @ The Knish Shop Party room': "Knish",
  'Bnai Jacob Shaarei Zion Congregation': "Hauer",
  'Chabad Israeli Center of Baltimore': "Chabad Israeli",
  'Chabad Lubavitch of Downtown Baltimore': "Chabad Downtown",
  'Chabad of Park Heights (Clarks Lane)': "Chabad PH",
  'Cheder Chabad': "Cheder Chabad",
  'Chofetz Chaim Congregation at Talmudical Academy': "TA",
  'Community Kollel Tiferes Moshe Aryeh': "Comm. Kollel",
  'Darchei Tzedek': "Darchei",
  'DC Dental Mincha Minyan --1133 Greenwood Road 21208': "DC Dental",
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
  'Kehillas Meor HaTorah': "Meor",
  'Khal Ahavas Yisroel/ Tzemach Tzedek': "Tzemach",
  'Khal Bais Nosson 2901 Taney (corner Taney & Baywood)': "Bais Nosson",
  'Knish Shop': "Knish",
  'Kol Torah': "Berger",
  'Lev Shlomo/CBMI': "Lev Shlomo",
  'Levindale': "Levindale",
  'Machzikei Torah (Sternhill\'s)': "Sternhill",
  'Magen David Sephardic Congregation': "Magen David",
  'Market Maven': "Market Maven",
  'Mercaz Torah U\'Tefillah': "Eichenstein",
  'Mesivta Kesser Torah': "Kesser Torah",
  'Mesivta N\'eimus Hatorah': "Neimus",
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
  'Ohr Yisroel': "Ohr Yisroel",
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
  'Yeshiva Tiferes Hatorah': "Tiferes Hatorah"
  }


function minyanUpdate() {
  const inbox = GmailApp.getInboxThreads();
  inbox.forEach(m => {
    try {
      const msgs = m.getMessages();
      const firstMsg = msgs[0];
      const firstMsgBody = firstMsg.getPlainBody().trim();
      const [inputTime, pagesize] = getDateAndPagesize(firstMsgBody);

      if(firstMsgBody.toLowerCase() === "help") {
        sendMail(firstMsg, "Supply the start time for minyanim (and optional result size) you'd like.\nExamples: \"now\", \"6am 10\" or \"2PM\"");
        m.moveToTrash();
        return;
      }

      if(!inputTime) {
        return;
      }

      const time = firstMsgBody && firstMsgBody.toLowerCase() !== "now" ? inputTime : new Date();

      const minyanList = fetchMinyanim();
      const replies = chunkReplies(minyanList, time, pagesize);

      if(replies.length) {
        replies.forEach(reply => sendMail(firstMsg, reply));
      } else {
        sendMail(firstMsg, `There are no tefilah times today past ${shortTime(time)}`);
      }
    } finally {
      m.moveToTrash();
    }
  });
}

function fetchMinyanim() {
  let tefilahAbbrev = ["SH", "MI","MM", "MA"];
  const minyanimList = tefilahAbbrev.flatMap(abbrev => {
    const url = `https://baltimorejewishlife.com/minyanim/shacharis.php?minyanType=${abbrev}`;
    const xml = UrlFetchApp.fetch(url).getContentText();
    const body = xml.match(/(?<minyandiv><div id="listing-container">[\s\S]*?)<div id="ad">/);
    const document = XmlService.parse(body.groups.minyandiv);
    const root = document.getRootElement();

    const minyanElements = root.getChildren('ul');
    const minyanim = minyanElements.map(minyanElement => {
      const minyanElemChildren = minyanElement.getChildren('li');
      const shul = minyanElemChildren[0].getChildText('div').trim();
      const [time, _] = getDateAndPagesize(minyanElemChildren[1].getText().trim());
      return [shul, time];
    });
    return minyanim;
  }).sort(([shulA, timeA], [shulB, timeB]) => timeA - timeB);
  return minyanimList;
}

function chunkReplies(minyanList, startTime, pagesize) {
  let chunkCount = 0;
  let replies = [];
  let replyBuffer = "";
  minyanList = minyanList
    .filter(([_, time]) => time >= startTime)
    .map(([shul, time]) => [SHUL_MAP[shul], shortTime(time)])
    .filter(([shul, _]) => shul)
    .slice(0, pagesize);
  for(let [shul, time] of minyanList) {
    replyBuffer += `${shul} ${time}\n`;
    if(chunkCount + shul.length + time.length + 2 < 119) {
      chunkCount += shul.length + time.length + 2;
    } else {
      replies.push(replyBuffer.slice());
      replyBuffer = "";
      chunkCount = 0;
    }
  }
  if(replyBuffer) {
    replies.push(replyBuffer.slice());
  }
  return replies;
}

function getDateAndPagesize(input) {
  let time;
  let _pagesize = DEFAULT_PAGESIZE;
  try {
    time = new Date()
    const {hours, minutes, meridiem, pagesize} = input.match(/(?<hours>\d*):?(?<minutes>\d*)?\s*(?<meridiem>[a-zA-Z]*)?\s*(?<pagesize>\d*)/).groups
    _pagesize = pagesize;
    const PM = meridiem.toLowerCase() === 'pm';
    const hoursFull = (+hours % 12) + (PM ? 12 : 0);
    time.setHours(hoursFull);
    time.setMinutes(minutes ? minutes : 0);
    time.setSeconds(0,0);
  } finally {
    return [time, _pagesize];
  }
}

function sendMail(msg, body) {
  GmailApp.sendEmail(msg.getFrom(), null, body);
}

function shortTime(date) {
  return date.toLocaleTimeString('en-US', {timeStyle: "short"});
}
