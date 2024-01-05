const MINYAN_FILE_PREFIX = "minyanim"
const ZMANIM_FILE_PREFIX = "zmanim"
const DEFAULT_PAGESIZE = 7
const SHUL_MAP = {
  'Adath Yeshurun Mogen Abraham': "Adas Yeshurun",
  'Agudah of Greenspring / Adath Yeshurun Mogen Abraham': "Schuchatowitz",
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


function minyanZmanUpdate() {
  const inbox = GmailApp.getInboxThreads();
  if(inbox.length === 0) {
    return;
  }
  const [todayMinyanList, tomorrowMinyanList] = [getMinyanim('today'), getMinyanim('tomorrow')];
  const [todayZmanimList, tomorrowZmanimList] = [getZmanim('today'), getZmanim('tomorrow')]
  inbox.forEach(m => {
    try {
      const msgs = m.getMessages();
      const firstMsg = msgs[0];
      const _msgSubject = firstMsg.getSubject().toLowerCase();
      const msgSubject = _msgSubject.includes("no subject") ? null : _msgSubject;
      const msgData = firstMsg.getAttachments().map(attachment => attachment.getDataAsString()).join("").toLowerCase();
      const msgBodyRaw = firstMsg.getPlainBody().toLowerCase().trim();
      const msgBody = msgBodyRaw.includes("multimedia messag") ? "" : msgBodyRaw;
      const input = msgBody || msgSubject || msgData;
      const isZmanRequest = input.startsWith("zman")

      let time;
      let pagesize = DEFAULT_PAGESIZE;
      let returnList = todayMinyanList;
      let day = "today";
      if(input === "help") {
        sendMail(firstMsg, "Supply a start time for minyanim (and optional result size).\nExamples: \"now\", \"tomorrow 6pm\", \"6am 10\", \"2:45 PM\", \"315pm\". Or, send \"zman/zmanim\" and \"today/tomorrow\"");
      } else if(input === "now") {
        time = new Date();
      } else if(isZmanRequest) {
        returnList = todayZmanimList
        pagesize = 20
        time = new Date()
        const inputMatch = input.match(/(?<zmanim>zman|zmanim)\s(?<day>today|tomorrow)?/)
        if(inputMatch) {
          const {zmanim, day} = inputMatch.groups;
          if(day === "tomorrow") {
            returnList = tomorrowZmanimList
            time.setDate(time.getDate() + 1)
          }
        }
        time.setHours(0, 0, 0, 0)
      } else {
        const [_day, inputTime, inputPagesize] = parseDateTime(input, day);
        if(_day === "tomorrow") {
          let _time = new Date();
          _time.setDate(_time.getDate() + 1);
          time = _time;
          day = _day;
          returnList = tomorrowMinyanList;
        }
        if(inputTime) {
          time = inputTime;
        }
        if(inputPagesize) {
          pagesize = inputPagesize;
        }
      }

      if(time && pagesize) {
        const replies = filterAndChunkReplies(returnList, time, pagesize, !isZmanRequest);

        if(replies.length) {
          replies.forEach(reply => sendMail(firstMsg, reply));
        } else {
          sendMail(firstMsg, `There are no tefilah times ${day} past ${shortTime(time)}`);
        }
      }
    } finally {
      m.moveToTrash();
      GmailApp.search("in:sent").forEach(m => m.moveToTrash())
    }
  });
}

function fetchBJLMinyanim(day) {
  let tefilahAbbrev = ["SH", "MI","MM", "MA"];
  let extraArgs = "";
  if(day === 'tomorrow') {
    extraArgs = "&direction=next";
  }
  const minyanimList = tefilahAbbrev.flatMap(abbrev => {
    const url = `https://baltimorejewishlife.com/minyanim/shacharis.php?minyanType=${abbrev}${extraArgs}`;
    const xml = UrlFetchApp.fetch(url).getContentText();
    const body = xml.match(/(?<minyandiv><div id="listing-container">[\s\S]*?)<div id="ad">/);
    const document = XmlService.parse(body.groups.minyandiv);
    const root = document.getRootElement();

    const minyanElements = root.getChildren('ul');
    const minyanim = minyanElements.map(minyanElement => {
      const minyanElemChildren = minyanElement.getChildren('li');
      const shul = minyanElemChildren[0].getChildText('div').trim();
      const [_, time, __] = parseDateTime(minyanElemChildren[1].getText().trim(), day);
      return [shul, time];
    });
    return minyanim;
  }).sort(([shulA, timeA], [shulB, timeB]) => timeA - timeB);
  return minyanimList;
}

function getMinyanim(day) {
  const minyanFileName = `${MINYAN_FILE_PREFIX}-${day}.json`;
  const minyanFiles = DriveApp.getFilesByName(minyanFileName);
  let safeUpdateHour = new Date();
  safeUpdateHour.setHours(3,0,0,0);

  let minyanList;
  while(minyanFiles.hasNext()) {
    const minyanFile = minyanFiles.next();
    if(minyanFile.getDateCreated() >= safeUpdateHour) {
      minyanList = JSON.parse(minyanFile.getBlob().getDataAsString())
        .map(([shul, time]) => [shul, new Date(time)]);
    } else {
      minyanFile.setTrashed(true);
    }
  }
  if(!minyanList) {
    minyanList = fetchBJLMinyanim(day);
    if (day === "tomorrow") {
      minyanList.map(([shul, time]) => {
        time.setDate(time.getDate() + 1);
        return [shul, time];})
    }
    DriveApp.createFile(minyanFileName, JSON.stringify(minyanList));
  }
  return minyanList;
}

function getZmanim(day) {
  const zmanimFileName = `${ZMANIM_FILE_PREFIX}-${day}.json`;
  const zmanimFiles = DriveApp.getFilesByName(zmanimFileName);
  let safeUpdateHour = new Date();
  safeUpdateHour.setHours(3,0,0,0);

  let zmanimList;
  while(zmanimFiles.hasNext()) {
    const minyanFile = zmanimFiles.next();
    if(minyanFile.getDateCreated() >= safeUpdateHour) {
      zmanimList = JSON.parse(minyanFile.getBlob().getDataAsString())
        .map(([name, time]) => [name, new Date(time)]);
    } else {
      minyanFile.setTrashed(true);
    }
  }
  if(!zmanimList) {
    zmanimList = fetchHebcalZmanim(day);
    if (day === "tomorrow") {
      zmanimList.map(([name, time]) => {
        time.setDate(time.getDate() + 1);
        return [name, time];})
    }
    DriveApp.createFile(zmanimFileName, JSON.stringify(zmanimList));
  }
  return zmanimList;
}

function fetchHebcalZmanim(day) {
  const dt = new Date()
  dt.setHours(0, 0, 0, 0)
  if(day === "tomorrow") {
    dt.setDate(dt.getDate() + 1)
  }
  const dateString = dt.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  const url = `https://www.hebcal.com/zmanim?cfg=json&zip=21209&date=${dateString}`
  const res = UrlFetchApp.fetch(url).getContentText();
  const json = JSON.parse(res).times
  const times = Object.fromEntries(Object.entries(json).map(([key, datetime]) => [key,new Date(datetime)]));
  const zmanim = [
    ["Chatzos", times.chatzotNight],
    ["Alos", times.alotHaShachar],
    ["Yakir", times.misheyakir],
    ["Netz", times.sunrise],
    ["Shema", `${times.sofZmanShma}/${times.sofZmanShmaMGA}`],
    ["Tefilla", `${times.sofZmanTfillaMGA}/${times.sofZmanTfilla}`],
    ["Chatzos", times.chatzot],
    ["Mincha", times.minchaGedola],
    ["Shkia", times.sunset],
    ["Tzeis", times.tzeit85deg],
    ["Leil72", times.tzeit72min],
  ].map(([name, time]) => ([name, new Date(time)]))
  return zmanim
}

function filterAndChunkReplies(sourceList, startTime, pagesize, useShulMap=true) {
  let chunkCount = 0;
  let replies = [];
  let replyBuffer = "";
  const timesList = sourceList
    .filter(([_, time]) => time >= startTime)
    .map(([key, time]) => {
      const t = shortTime(time)
      if(useShulMap) {
        return [SHUL_MAP[key], t]
      }
      return [key, t]
    })
    .filter(([key, _]) => key)
    .slice(0, pagesize);
  for(let [key, time] of timesList) {
    replyBuffer += `${key} ${time}\n`;
    if(chunkCount + key.length + time.length + 2 < 119) {
      chunkCount += key.length + time.length + 2;
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

function sendMail(msg, body) {
  GmailApp.sendEmail(msg.getFrom(), null, body);
}

function shortTime(date) {
  return date.toLocaleTimeString('en-US', {timeStyle: "short"});
}
