// Zmanim for a zip code, from Hebcal, cached per day in Drive.

const ZMANIM_FILE_PREFIX = "zmanim"
const DEFAULT_ZIP = "21209"

function zmanimReplies(input) {
  const day = input.includes("tomorrow") ? "tomorrow" : "today";
  const zip = (input.match(/\b\d{5}\b/) || [DEFAULT_ZIP])[0];
  const startOfDay = new Date();
  if (day === "tomorrow") {
    startOfDay.setDate(startOfDay.getDate() + 1);
  }
  startOfDay.setHours(0, 0, 0, 0);
  return filterAndChunkReplies(getZmanim(day, zip), startOfDay, 20, false, fetchHebcalDate(day));
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
