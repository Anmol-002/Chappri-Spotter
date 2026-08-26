# Chappri Spotter™

**We have analyzed the city. The results are concerning.**

A satirical, crowd-sourced map of Delhi NCR where every area is represented by a
character, every score is fictional, and every escalation is started by the user.
Take the map seriously. Take the data completely unseriously.

## Run it

```bash
npm install
npm start
# http://localhost:4173
```

No API keys, no build step. Leaflet is vendored into `public/vendor`,
so the only third-party network call at runtime is the OpenStreetMap tile layer.
Posts, votes and fights are stored on this Node server so everyone on the same
URL sees the same city.

## Browser smoke test

`npm run smoke` opens two tabs in your local Chrome (via `puppeteer-core`) and
checks the whole loop: the map-only shell, tapping an area to read its posts, the
filter narrowing characters, a live fight the second tab can watch, and a photo
report landing as evidence in an area. `node tools/shots.mjs` writes screenshots
of each state to `/tmp/chappri`.

## The product rules

1. **The map is the whole app.** There is no navigation and there are no
   dashboards. Everything happens on the map or in the sheet that slides over it.
2. **Nothing interrupts the user.** No timers open modals, no random popups. The
   header ticker rotates text, and the only things that appear on their own are
   fights other people started.
3. **Every area is a character.** Each area renders a goblin whose identity comes
   from its dominant index and whose animation comes from its band — a calm bob at
   the bottom, full-body vibration in Final Boss territory.
4. **Fights are adjacency-only, user-started, and happen on the map.** You pick a
   neighbour, the dialog closes, and the two characters throw hands at the border
   while everyone else with the app open watches it from above.
5. **A filter removes everything else.** Pick `BADDIES` and only baddie
   characters and baddie posts remain, over that layer's density colours.
6. **Reporting is a deliberate two-step.** Press report, then tap the map. The pin
   is draggable, the dialog resolves which area it falls into, and submitting shows
   exactly which index moved and by how much.
7. **Locations, never people.** Photos are pixelated on-device and never uploaded;
   ChappriVision™ output is nonsense by construction.

## Layout

```
server.mjs            static file server + shared world API
world-store.mjs       in-memory city + JSON file (+ optional JSONBin)
public/index.html     app shell
public/style.css      all styling
public/chars/*.png    the eight residents
public/vendor/        Leaflet 1.9.4
public/js/
  data.js             areas, categories, layers, bands, levels, copy
  world.js            shared city seed + how a post/vote/fight is applied
  state.js            single source of truth + derived scores + adjacency graph
  sync.js             fetch the live city + push events + listen for other users
  map.js              Leaflet panes, characters, heat blobs, pin mode, fights
  report.js           report flow + ChappriVision™
  battles.js          neighbour picker that hands the fight to the map
  panels.js           live feed, area dossier, sighting popup, legend
  share.js            canvas share card
  ui.js               toasts and small helpers
  main.js             wiring, live activity, ticker
tools/smoke-v3.mjs    two-tab browser smoke test
tools/shots.mjs       screenshots of every state
tools/cutout.mjs      asset helper: flood-fills a flat background to transparency
```

### Where data lives

There are two buckets:

1. **The shared city** — territories, posts, votes and fights. This is stored on
   the server in `data/world.json` and served at `GET /api/world`. When someone
   reports, votes or starts a fight, the browser `POST`s `/api/event` and every
   other open client is notified over Server-Sent Events (`GET /api/live`). That
   is how person B sees what person A posted, including on another phone.
2. **Your agent** — XP, achievements, NSFW toggle, which posts you voted on.
   This stays in **this browser's** `localStorage` under `chappri-spotter-v4`.
   `RESET MY AGENT` wipes only that. It does not delete the public map.

Photos are still pixelated on-device and the image is **not** uploaded; only the
text verdict rides along with a post.

Same-browser extra tabs still get a `BroadcastChannel` ping so a fight appears
immediately. Other people on the live URL get the same fight over `/api/live`.

Optional durable backup (survives free-host restarts): create a bin at
[jsonbin.io](https://jsonbin.io), then set `JSONBIN_BIN_ID` and `JSONBIN_API_KEY`.

### How scores work

Areas store eight indices. The headline **vibe index** is derived, never stored,
so any report immediately changes the map, the bands, the character's mood and the
city threat level:

```
vibe = clamp(mean(chaos, aura, baddie, reels, fashion, gym, traffic) * 1.06 - npc * 0.14)
```

A report adds `3 + intensity * 3` to its category's index. Confirmations add 2,
doubts subtract 3, and battle winners gain 1 on each index they won.

### Adjacency

Neighbours are the closest areas within 11 km (max 5), symmetrised, plus a
hand-written `EXTRA_LINKS` list for places that are neighbours in spirit but not
by straight-line distance. New sectors discovered by users join the graph
automatically. Your agent lives in `localStorage` under `chappri-spotter-v4`.
`RESET MY AGENT` at the bottom of the sidebar clears only that.

## Deploy for free (Render)

GitHub Pages / Netlify / Cloudflare Pages can host the `public/` folder, but they
have **no Node server**, so users would not share posts. Use a free Node host.

1. Push this repo to GitHub.
2. Open [Render](https://render.com), sign in with GitHub, **New → Web Service**,
   pick the repo.
3. Settings:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
4. Deploy. Render gives you a URL like `https://chappri-spotter.onrender.com`.
   Share that. Everyone hitting it reads and writes the same city.

Free Render instances sleep after ~15 minutes of no traffic. The disk is
ephemeral, so the city can reset to the seeded map on a cold start. To keep posts
across sleeps, add a free [JSONBin](https://jsonbin.io) and in Render →
Environment set:

```
JSONBIN_BIN_ID=your_bin_id
JSONBIN_API_KEY=your_master_key
```

Railway and Fly.io work the same way (`npm start`, `PORT` is already read). Do
not use GitHub Pages if you want a shared live map.

## Not built yet

Real accounts, server-side moderation, cities beyond NCR, sponsored layers and
business analytics. The map is already multi-user; identity is still anonymous.
