// Entry point: reads incoming texts from the Gmail inbox and replies to each one.
// Texts arrive as emails, either forwarded by Google Voice or through a carrier's
// email-to-text gateway. The services that answer them live in their own files:
// minyanim.js, zmanim.js and directory.js.

const GOOGLE_VOICE_DOMAIN = "@txt.voice.google.com"
const TEXT_GATEWAY_EMAIL_MAP = {
  'mypixmessages.com': 'vtext.com'
}
// Each one-minute trigger fires at its own second within the minute, so several of
// them check the inbox several times a minute. See installTriggers.
// An idle check measures about 1 second, and a free account allows 90 minutes of
// trigger run time a day: 2 a minute is about 50 minutes, 3 would be over.
const CHECKS_PER_MINUTE = 2

function checkInbox() {
  // Most checks find nothing new, and trigger run time is capped per day, so the
  // empty case does a single Gmail call and nothing else.
  if (GmailApp.getInboxUnreadCount() === 0) {
    return;
  }
  // Runs can overlap now that there are several triggers; a second one must not
  // answer a text the first is already handling.
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(0)) {
    return;
  }
  try {
    let handledAny = false;
    GmailApp.search("in:inbox is:unread").forEach(thread => {
      // Google Voice keeps every text from one phone in a single thread, alongside
      // the replies already sent. Each unread message in the inbox is its own
      // request, so two texts sent close together both get answered.
      thread.getMessages().filter(msg => msg.isInInbox() && msg.isUnread() && !msg.isInTrash()).forEach(msg => {
        try {
          const input = (isGoogleVoice(msg) ? googleVoiceText(msg) : gatewayText(msg)).trim();
          if (input === "linetest" && isGoogleVoice(msg)) {
            sendLineBreakTest(msg);
          } else {
            const replies = repliesFor(input);
            if (!replies) {
              // Not a request: mark it read so later checks don't look at it again.
              msg.markRead();
              return;
            }
            replies.forEach(reply => sendMail(msg, reply));
          }
          // Only this message is trashed: trashing the whole thread would also
          // discard a text that arrived while this one was being answered.
          msg.moveToTrash();
          handledAny = true;
        } catch (e) {
          // One bad message must not stop the rest of the inbox from being answered.
          Logger.log(`Failed to handle message ${msg.getId()}: ${e}`);
        }
      });
    });
    if (handledAny) {
      // Clear out the sent replies, leaving any newly arrived text in place.
      GmailApp.search("in:sent").forEach(thread => {
        thread.getMessages().filter(msg => !msg.isInInbox() && !msg.isInTrash()).forEach(msg => msg.moveToTrash());
      });
    }
  } finally {
    lock.releaseLock();
  }
}

// Returns the list of reply texts for a message, or null if it isn't a request
// any service recognises (the thread is then left alone).
function repliesFor(input) {
  if (input.startsWith("dir")) {
    return directoryReplies(input);
  }
  if (input.startsWith("zman")) {
    return zmanimReplies(input);
  }
  return minyanimReplies(input);
}

// Temporary: texting "linetest" sends the same three lines back in several email
// formats, each labelled with a letter, to find which one Google Voice delivers
// with its line breaks intact. Remove once the reply format is settled.
function sendLineBreakTest(msg) {
  const lines = letter => [1, 2, 3].map(n => `${letter}${n}`);
  msg.reply(lines("A").join("\n"));
  msg.reply(lines("B").join("\r\n"));
  msg.reply(lines("C").join("\n\n"));
  msg.reply(lines("D").join("\u2028"));
  msg.reply(lines("E").join("\n"), {htmlBody: lines("E").map(l => `<div>${l}</div>`).join("")});
  msg.reply(lines("F").join("\n"), {htmlBody: lines("F").join("<br>")});
  msg.reply(lines("G").join("\n"), {htmlBody: lines("G").map(l => `<p>${l}</p>`).join("")});
  msg.reply("", {htmlBody: lines("H").join("<br>")});
  msg.reply(lines("I").join(" \n"));
}

// Run once from the editor after deploying: replaces this project's triggers with
// CHECKS_PER_MINUTE one-minute triggers on checkInbox.
function installTriggers() {
  ScriptApp.getProjectTriggers().forEach(trigger => ScriptApp.deleteTrigger(trigger));
  for (let i = 0; i < CHECKS_PER_MINUTE; i++) {
    ScriptApp.newTrigger("checkInbox").timeBased().everyMinutes(1).create();
  }
}

// The trigger created before the services were merged still calls this name.
// Safe to delete once installTriggers has been run.
function minyanZmanUpdate() {
  checkInbox();
}

// Logs the replies a text would get, without sending anything.
function dryRun(input = "now") {
  const replies = repliesFor(input.toLowerCase().trim());
  (replies || ["(not recognised: no reply would be sent)"]).forEach(reply => Logger.log(reply));
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

function gatewayText(msg) {
  const _msgSubject = msg.getSubject().toLowerCase();
  const msgSubject = _msgSubject.includes("no subject") ? null : _msgSubject;
  const msgData = msg.getAttachments().map(attachment => attachment.getDataAsString()).join("").toLowerCase();
  const msgBodyRaw = msg.getPlainBody().toLowerCase().trim();
  const msgBody = msgBodyRaw.includes("multimedia messag") ? "" : msgBodyRaw;
  return msgBody || msgSubject || msgData;
}

// Google Voice forwards each incoming text as an email from a per-sender
// @txt.voice.google.com address; replying to that email sends a text back.
function isGoogleVoice(msg) {
  return msg.getFrom().toLowerCase().includes(GOOGLE_VOICE_DOMAIN);
}

// The forwarded email wraps the text in Google Voice links and a footer, so the
// text is the first line that isn't part of that boilerplate.
function googleVoiceText(msg) {
  const boilerplate = ["voice.google.com", "to respond to this text message", "your account", "help center", "help forum", "this email was sent", "google llc"];
  const line = msg.getPlainBody().toLowerCase().split("\n")
    .map(l => l.trim())
    .find(l => l && !boilerplate.some(b => l.includes(b)));
  return line || "";
}

function sendMail(msg, body) {
  if (isGoogleVoice(msg)) {
    // Google Voice runs the lines of a plain-text reply together, so the reply also
    // carries an HTML version with one block per line, the way Gmail itself sends it.
    const htmlBody = body.trim().split("\n")
      .map(line => `<div>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") || "<br>"}</div>`)
      .join("");
    msg.reply(body.trim(), {htmlBody});
    return;
  }
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
