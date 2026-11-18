# baltimore-minyanim

A free text-message service for looking up minyan times and zmanim in Baltimore,
meant for people with basic (non-smart) phones.

## How it works

Text the service's number and it replies with the times you asked for.
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
| `dir seven mile market` | Address, phone and hours for a business |
| `dir list pizza` | The top three matching businesses |
| `help` | A short list of these commands |

Example reply to `6am`:

```
Shomrei 6:00 AM
Eichenstein 6:15 AM
Heinemann 6:20 AM
```

## How it's built

- `scripts/scrape-bjl.js` runs daily as a GitHub Action and saves the minyan
  listings from Baltimore Jewish Life's minyanim API into `cache/`.
- `gas/` is the Google Apps Script project that answers the texts. It reads them
  from a Gmail inbox, where Google Voice forwards them, and replies by email, which
  Google Voice sends back as a text:
  - `inbox.js` reads the inbox, picks the service for each text and sends replies.
  - `minyanim.js`, `zmanim.js` and `directory.js` are the three services.
  - Deploy with `clasp push` from the repo root.

## Contact

Questions or problems: open an issue on this repository.
