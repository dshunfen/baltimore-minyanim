const MINYAN_FILE_PREFIX = "minyanim"
const ZMANIM_FILE_PREFIX = "zmanim"
const DEFAULT_PAGESIZE = 7
const TEXT_GATEWAY_EMAIL_MAP = {
  'mypixmessages.com': 'vtext.com'
}
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
  'Yeshiva Tiferes Hatorah': "Tiferes Hatorah"
}


function minyanZmanUpdate() {
  const inbox = GmailApp.getInboxThreads();
  if(inbox.length === 0) {
    return;
  }
  const [todayMinyanList, tomorrowMinyanList] = [getMinyanim('today'), getMinyanim('tomorrow')];
  const [todayZmanimList, tomorrowZmanimList] = [getZmanim('today', 21209), getZmanim('tomorrow', 21209)]
  inbox.forEach(m => {
    let handled = false;
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
      let hebDate;
      let pagesize = DEFAULT_PAGESIZE;
      let returnList = todayMinyanList;
      let day = "today";
      if(input === "help") {
        sendMail(firstMsg, "Supply a start time for minyanim (and optional result size).\nExamples: \"now\", \"tomorrow 6pm\", \"6am 10\", \"2:45 PM\", \"315pm\"");
        sendMail(firstMsg, "Or, send \"zman/zmanim\" and \"today/tomorrow\" (optional) and \"21209\" (optional)");
        handled = true;
      } else if(input === "now") {
        time = new Date();
      } else if(isZmanRequest) {
        returnList = todayZmanimList
        pagesize = 20
        time = new Date()
        hebDate = fetchHebcalDate(day)
        const inputMatch = input.match(/(?<zmanim>zman|zmanim)\s(?<day>today|tomorrow)?\s(?<zipcode>\d{5})?/);
        if(inputMatch) {
          const {zmanim, day, zipcode} = inputMatch.groups;
          if(day === "tomorrow") {
            returnList = tomorrowZmanimList
            time.setDate(time.getDate() + 1)
          }
          if(zipcode && zipcode !== "21209") {
            const [todaySpecificZmanimList, tomorrowSpecificZmanimList] = [getZmanim('today', zipcode), getZmanim('tomorrow', zipcode)];
            returnList = todaySpecificZmanimList
            if(day === "tomorrow") {
              returnList = tomorrowSpecificZmanimList
              time.setDate(time.getDate() + 1)
            }
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
        const replies = filterAndChunkReplies(returnList, time, pagesize, !isZmanRequest, hebDate);

        if(replies.length) {
          replies.forEach(reply => sendMail(firstMsg, reply));
        } else {
          sendMail(firstMsg, `There are no tefilah times ${day} past ${shortTime(time)}`);
        }
        handled = true;
      }
    } finally {
      if(handled) {
        m.moveToTrash();
        GmailApp.search("in:sent").forEach(m => m.moveToTrash())
      }
    }
  });
}

function dryRun(input = "now") {
  input = input.toLowerCase().trim();
  const isZmanRequest = input.startsWith("zman");

  let time;
  let hebDate;
  let pagesize = DEFAULT_PAGESIZE;
  let returnList = getMinyanim('today');
  let day = "today";

  if(input === "now") {
    time = new Date();
  } else if(isZmanRequest) {
    returnList = getZmanim('today', 21209);
    pagesize = 20;
    time = new Date();
    hebDate = fetchHebcalDate(day);
    const inputMatch = input.match(/(?<zmanim>zman|zmanim)\s(?<day>today|tomorrow)?\s(?<zipcode>\d{5})?/);
    if(inputMatch) {
      const {day: matchedDay, zipcode} = inputMatch.groups;
      const zip = zipcode || 21209;
      if(matchedDay === "tomorrow") {
        returnList = getZmanim('tomorrow', zip);
        time.setDate(time.getDate() + 1);
        day = "tomorrow";
      } else if(zipcode && zipcode !== "21209") {
        returnList = getZmanim('today', zip);
      }
    }
    time.setHours(0, 0, 0, 0);
  } else {
    const [_day, inputTime, inputPagesize] = parseDateTime(input, day);
    if(_day === "tomorrow") {
      time = new Date();
      time.setDate(time.getDate() + 1);
      day = _day;
      returnList = getMinyanim('tomorrow');
    }
    if(inputTime) time = inputTime;
    if(inputPagesize) pagesize = inputPagesize;
  }

  if(time && pagesize) {
    const replies = filterAndChunkReplies(returnList, time, pagesize, !isZmanRequest, hebDate);
    if(replies.length) {
      replies.forEach(reply => Logger.log(reply));
    } else {
      Logger.log(`There are no tefilah times ${day} past ${shortTime(time)}`);
    }
  }
}

const MINYAN_CACHE_URL_PREFIX = "https://raw.githubusercontent.com/dshunfen/baltimore-minyanim/main/cache";

function fetchBJLMinyanim(day) {
  const url = `${MINYAN_CACHE_URL_PREFIX}/${day}.json`;
  const res = UrlFetchApp.fetch(url).getContentText();
  return JSON.parse(res)
    .map(([shul, timeStr]) => {
      const [, time] = parseDateTime(timeStr.toLowerCase());
      return [shul, time];
    })
    .filter(([_, time]) => time);
}

function getMinyanim(day) {
  const minyanFileName = `${MINYAN_FILE_PREFIX}-${day}.json`;
  const minyanFiles = DriveApp.getFilesByName(minyanFileName);
  // Trust today's Drive cache only once the upstream BJL scrape has refreshed.
  // The GitHub Action runs ~3:49am ET; a Drive file built before then holds
  // yesterday's schedule and would be locked in for the whole day.
  let safeUpdateHour = new Date();
  safeUpdateHour.setHours(5,0,0,0);

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
  // An empty list means a bad upstream cache (e.g. a Shabbos scrape). Don't serve
  // or persist it — refetch, and only cache a non-empty result.
  if(!minyanList || !minyanList.length) {
    minyanList = fetchBJLMinyanim(day);
    if (day === "tomorrow") {
      minyanList.map(([shul, time]) => {
        time.setDate(time.getDate() + 1);
        return [shul, time];})
    }
    if(minyanList.length) {
      DriveApp.createFile(minyanFileName, JSON.stringify(minyanList));
    }
  }
  return minyanList;
}

function getZmanim(day, zipCode) {
  const zmanimFileName = `${ZMANIM_FILE_PREFIX}-${zipCode}-${day}.json`;
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
    zmanimList = fetchHebcalZmanim(day, zipCode);
    if (day === "tomorrow") {
      zmanimList.map(([name, time]) => {
        time.setDate(time.getDate() + 1);
        return [name, time];})
    }
    DriveApp.createFile(zmanimFileName, JSON.stringify(zmanimList));
  }
  return zmanimList;
}

function fetchHebcalZmanim(day, zipString) {
  const dt = new Date()
  dt.setHours(0, 0, 0, 0)
  if(day === "tomorrow") {
    dt.setDate(dt.getDate() + 1)
  }
  const dateString = dt.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  const url = `https://www.hebcal.com/zmanim?cfg=json&zip=${zipString}&date=${dateString}`
  const res = UrlFetchApp.fetch(url).getContentText();
  const json = JSON.parse(res).times
  const times = Object.fromEntries(Object.entries(json).map(([key, datetime]) => [key,new Date(datetime)]));
  const zmanim = [
    ["Chatzos", times.chatzotNight],
    ["Alos", times.alotHaShachar],
    ["Yakir", times.misheyakir],
    ["Netz", times.sunrise],
    ["Shema M\"A", times.sofZmanShmaMGA],
    ["Shema", times.sofZmanShma],
    ["Tefilla M\"A", times.sofZmanTfillaMGA],
    ["Tefilla", times.sofZmanTfilla],
    ["Chatzos", times.chatzot],
    ["Mincha", times.minchaGedola],
    ["Shkia", times.sunset],
    ["Tzeis", times.tzeit85deg],
    ["Leil72", times.tzeit72min],
  ].map(([name, time]) => ([name, new Date(time)]))
  return zmanim
}

function fetchHebcalDate(day) {
  const dt = new Date()
  dt.setHours(0, 0, 0, 0)
  if(day === "tomorrow") {
    dt.setDate(dt.getDate() + 1)
  }
  const dateString = dt.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  const url = `https://www.hebcal.com/converter?cfg=json&date=${dateString}&g2h=1&strict=1`
  const res = UrlFetchApp.fetch(url).getContentText();
  const json = JSON.parse(res)
  const hebDate = `${json.hd} ${json.hm}, ${json.hy}`
  return hebDate
}

function filterAndChunkReplies(sourceList, startTime, pagesize, useShulMap=true, prefix="") {
  let chunkCount = 0;
  let replies = [];
  let replyBuffer = "";
  if (prefix) {
    replyBuffer += `${prefix}\n`
  }
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
  const recipient = getNewRecipientAddress(msg.getFrom())
  GmailApp.sendEmail(recipient, null, body)
}

function getNewRecipientAddress(email) {
  const [localPart, domain] = email.split('@');
  const newDomain = TEXT_GATEWAY_EMAIL_MAP[domain];
  return newDomain ? `${localPart}@${newDomain}` : email;
}

function shortTime(date) {
  return date.toLocaleTimeString('en-US', {timeStyle: "short"});
}
