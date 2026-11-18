// Business directory lookups, answered from the Google Places API.
// Needs a PLACES_API_KEY script property (Project Settings > Script properties).

const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:searchText"
const PLACES_FIELD_MASK = [
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.regularOpeningHours",
].join(",")
// Searches favour places near Pikesville (21208); results farther out can still
// appear when nothing nearby matches.
const BALTIMORE_BIAS = {
  circle: {
    center: { latitude: 39.3743, longitude: -76.7225 },
    radius: 10000,
  },
}

const DAY_LABELS = ["Su", "M", "T", "W", "Th", "F", "Sa"]


// Every failure is texted back, so a broken lookup explains itself to the sender.
function directoryReplies(input) {
  if (!PropertiesService.getScriptProperties().getProperty("PLACES_API_KEY")) {
    return ["Directory is not set up: PLACES_API_KEY is missing from this project"]
  }
  try {
    return [handleDirInput(input)]
  } catch (e) {
    Logger.log(`Directory lookup error: ${e}`)
    return [e instanceof PlacesApiError ? e.message : `Directory lookup failed: ${e.message}`]
  }
}


function handleDirInput(input) {
  const stripped = input.replace(/^dir\s*/, "").trim()

  if (!stripped || stripped === "help") {
    return "Send: dir <name>. Add 'list' for multiple results, e.g. dir list pizza"
  }

  if (stripped.startsWith("list")) {
    const query = stripped.replace(/^list\s*/, "").trim()
    if (!query) return "Send: dir list <name>. e.g. dir list pizza"
    const places = lookupPlaces(query, 3)
    return formatListReply(places, query)
  }

  const places = lookupPlaces(stripped, 1)
  return formatReply(places[0], stripped)
}


function lookupPlaces(query, topN) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("PLACES_API_KEY")
  if (!apiKey) throw new Error("PLACES_API_KEY script property is not set")

  const response = UrlFetchApp.fetch(PLACES_ENDPOINT, {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACES_FIELD_MASK,
    },
    payload: JSON.stringify({
      textQuery: query,
      locationBias: BALTIMORE_BIAS,
      pageSize: topN,
    }),
  })

  const code = response.getResponseCode()
  if (code < 200 || code >= 300) {
    const text = response.getContentText()
    Logger.log(`Places API ${code}: ${text}`)
    let status = ""
    try { status = JSON.parse(text).error.status || "" } catch (e) {}
    throw new PlacesApiError(`Directory lookup failed (${code}${status ? " " + status : ""})`)
  }
  const body = JSON.parse(response.getContentText())
  return body.places || []
}


class PlacesApiError extends Error {}


function formatReply(place, query) {
  if (!place) return `No results for: ${query}`

  const lines = []
  const name = place.displayName && place.displayName.text
  if (name) lines.push(name)

  const address = trimAddress(place.formattedAddress)
  if (address) lines.push(address)

  const phone = place.nationalPhoneNumber || place.internationalPhoneNumber
  if (phone) lines.push(phone)

  const hours = formatHours(place.regularOpeningHours)
  if (hours.length) lines.push(...hours)

  return lines.join("\n")
}


function formatListReply(places, query) {
  if (!places.length) return `No results for: ${query}`
  return places.map((p, i) => {
    const name = (p.displayName && p.displayName.text) || "(no name)"
    const addr = trimAddress(p.formattedAddress)
    return `${i + 1}. ${name}${addr ? `\n   ${addr}` : ""}`
  }).join("\n")
}


function trimAddress(formatted) {
  if (!formatted) return ""
  return formatted.replace(/,\s*[A-Z]{2}\s*\d{5}.*$/, "").replace(/,\s*USA$/i, "").trim()
}


function formatHours(regularOpeningHours) {
  if (!regularOpeningHours || !regularOpeningHours.periods) return []
  const periods = regularOpeningHours.periods

  if (periods.length === 1 && !periods[0].close) return ["Open 24/7"]

  const byDay = {}
  periods.forEach(p => {
    if (!p.open) return
    const day = p.open.day
    const openStr = shortClock(p.open.hour, p.open.minute || 0)
    const closeStr = p.close ? shortClock(p.close.hour, p.close.minute || 0) : "24h"
    const key = p.close ? `${openStr}-${closeStr}` : "24h"
    if (!byDay[day]) byDay[day] = key
  })

  const out = []
  let runStart = null
  let runKey = null
  for (let d = 0; d <= 7; d++) {
    const key = d < 7 ? byDay[d] : null
    if (key === runKey && key !== undefined && key !== null) continue
    if (runKey) {
      const label = runStart === d - 1
        ? DAY_LABELS[runStart]
        : `${DAY_LABELS[runStart]}-${DAY_LABELS[d - 1]}`
      out.push(`${label} ${runKey}`)
    }
    runKey = key || null
    runStart = key ? d : null
  }
  return out
}


function shortClock(hour, minute) {
  const meridiem = hour < 12 ? "a" : "p"
  let h = hour % 12
  if (h === 0) h = 12
  return minute ? `${h}:${String(minute).padStart(2, "0")}${meridiem}` : `${h}${meridiem}`
}
