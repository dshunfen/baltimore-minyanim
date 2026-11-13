# baltimore-minyanim

A free text-message service for looking up minyan times and zmanim in Baltimore,
meant for people with basic (non-smart) phones.

## How it works

Text **(877) 471-3475** and the service replies with the times you asked for.
It only ever sends a message in reply to one you send: there are no
subscriptions, reminders or marketing messages, so there is nothing to opt out of.
Standard message rates from your carrier may apply.

| Text | Reply |
|---|---|
| `now` | The next minyanim from the current time |
| `6am`, `2:45 PM`, `315pm` | Minyanim today from that time |
| `tomorrow 6pm` | Minyanim tomorrow from that time |
| `6am 10` | Same, with 10 results instead of the default 7 |
| `zman` or `zmanim` | Today's zmanim for Baltimore (21209) |
| `zmanim tomorrow 21209` | Zmanim for another day or zip code |
| `help` | A short list of these commands |

Example reply to `6am`:

```
Shomrei 6:00 AM
Eichenstein 6:15 AM
Heinemann 6:20 AM
```

## How it's built

- `scripts/scrape-bjl.js` runs daily as a GitHub Action and saves the minyan
  listings from Baltimore Jewish Life into `cache/`.
- `twilio/functions/sms.protected.js` is a Twilio Function that receives each
  incoming text, reads the cache (or Hebcal, for zmanim) and replies.
- `minyanim.js` is the earlier Google Apps Script version, which answered through
  a carrier email-to-text gateway.

## Contact

Questions or problems: open an issue on this repository.
