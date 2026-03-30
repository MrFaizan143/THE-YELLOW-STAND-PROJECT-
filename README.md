# The Yellow Stand — TYS 2026

A lightweight, zero-dependency **CSK fan hub** PWA for IPL 2026. No build step, no framework — pure HTML, CSS, and vanilla JS.

---

## Pages at a Glance

| Tab | Page ID | What's on it |
|---|---|---|
| **Hub** | `h` | Countdown to next match, live score card, last result, next venue, match highlights carousel |
| **Pride** | `p` | CSK legacy & title history, management panel, full squad with career IPL stats |
| **News** | `n` | Live news via ESPN Cricinfo RSS feed + post-match reports |
| **Schedule** | `s` | Full IPL 2026 fixture list, head-to-head records vs CSK, league standings |
| **Fan** | `f` | Quiz, poll, match predictions, toss tracker, match journal, fantasy tips, fan profile |
| **Live** | `l` | Live scores for all ongoing matches (cricapi.com), filterable by format |

---

## Project Structure

```
THE-YELLOW-STAND-PROJECT-/
├── index.html              # Single HTML entry point — all pages live here as <section> elements
├── sw.js                   # Service worker: cache-first shell, stale-while-revalidate fonts
├── manifest.json           # PWA manifest (icons, theme colour, display mode)
├── icons/                  # App icons (192×192, 512×512, Apple touch icon)
└── src/
    ├── css/
    │   ├── main.css        # Entry point — @imports the three layers below
    │   ├── tokens.css      # Design tokens: colors, typography scale, spacing
    │   ├── base.css        # CSS reset, body defaults, keyframe animations
    │   └── components.css  # Full UI component library (cards, nav, modals…)
    ├── data/
    │   └── team.js         # ★ THE DATABASE — all fixtures, squad, and content live here
    └── js/
        ├── icons.js        # Inline SVG icon renderer (replaces [data-lucide] placeholders)
        ├── api.js          # CricAPI + RapidAPI wrappers with shared cache
        ├── render.js       # View layer — builds all DOM from DATA (46 KB, ~15 functions)
        ├── router.js       # Client-side page router — lazy-renders on first visit
        ├── schedule.js     # Schedule page: date/team filters, view toggle, live highlight
        ├── countdown.js    # Hub countdown timer — auto-detects next fixture from DATA
        ├── profile.js      # Fan page: 7 widgets (profile, poll, predictions, quiz, toss, journal, fantasy tips)
        ├── news.js         # News page: live RSS fetch + category filter + static fallback
        ├── live.js         # Live Match Centre: real-time scores, format filter, pin widget
        └── app.js          # Bootstrap — wires all modules on DOMContentLoaded
```

---

## How to Run

No build step needed. Open `index.html` in any browser, or run a local static server:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

---

## How to Update Data

**Everything lives in `src/data/team.js`** — edit the `DATA` object:

| Key | What to update |
|---|---|
| `DATA.nextMatch` | Countdown target (date, opponent, venue, pitch note) |
| `DATA.lastResult` | Most recent match result (updated after each game) |
| `DATA.fixtures` | CSK's 14-match schedule — include `iso` field for auto-detection |
| `DATA.iplSchedule` | Full 74-match IPL schedule shown on the Schedule page |
| `DATA.squad` | Players grouped by category (Batters, Keepers, All-Rounders, Bowlers) |
| `DATA.playerDetails` | Per-player details: jersey, age, role, bat/bowl style, IPL career stats |
| `DATA.staff` | Support staff `[role, name]` pairs |
| `DATA.management` | Ownership, coaching panel, and support staff for the Pride page |
| `DATA.standings` | IPL points table (team, P/W/L/NR/Pts/NRR/form) |
| `DATA.h2h` | All-time H2H records vs each opponent |
| `DATA.venueInfo` | Stadium lat/lng for directions links |
| `DATA.venuePitchData` | Pitch type, avg first-innings score, conditions note |
| `DATA.poll` | Weekly fan poll question + options (change `id` to reset votes) |
| `DATA.postMatchReports` | Add an entry after each CSK game (result, scores, headline) |
| `DATA.legacy` | Title history + all-time franchise records |
| `DATA.quiz` | Cricket trivia questions (used by the Fan page quiz) |
| `DATA.fantasyTips` | Per-fixture fantasy pick guide (captains, must-picks, avoid list) |
| `DATA.news` | Static news fallback shown when live RSS fetch fails |

---

## API Keys (optional)

Live scores and full IPL fixtures require two free API keys:

```html
<!-- In index.html, before src/js/app.js — keep this out of version control -->
<script>
  window.TYS_CONFIG = {
    CRICAPI_KEY:  'your-cricapi-key',   // cricapi.com — 100 free calls/day
    RAPIDAPI_KEY: 'your-rapidapi-key'   // optional, for extended fixture data
  };
</script>
```

Without keys the app works fine — it falls back to static data from `team.js`.

---

## Full Feature List

| Feature | Module | Description |
|---|---|---|
| **Countdown** | `countdown.js` | Live D:H:M:S timer, auto-detects next fixture, urgent colour at <1 h |
| **Live Score (Hub)** | `app.js` | Polls cricapi.com every 90 s; backs off to 5 min after 3 misses |
| **Highlights Carousel** | `app.js` | Last 3 results + next 5 upcoming as scrollable media cards |
| **Last Result Card** | `render.js` | Shows most recent match result from `DATA.lastResult` |
| **Next Venue Card** | `render.js` | Auto-detects upcoming fixture and shows venue + pitch note |
| **Share Button** | `app.js` | Web Share API with clipboard fallback |
| **Dark / Light Theme** | `app.js` | Persisted in localStorage; respects OS preference on first load |
| **Legacy & Titles** | `render.js` | All 5 IPL title cards + all-time franchise records |
| **Management Panel** | `render.js` | Ownership, coaching staff, and support staff cards |
| **Squad Grid** | `render.js` | Players by category, tap to expand IPL career stats with mini bar charts |
| **Player Search** | `render.js` | Real-time search filters squad by name |
| **Post-Match Reports** | `render.js` | Match report cards with result pill, scores, headline, highlights chips |
| **Live News Feed** | `news.js` | ESPN Cricinfo RSS via rss2json.com; 1-hour sessionStorage cache |
| **News Category Filter** | `news.js` | All / 🦁 CSK / 🏏 IPL / 🌐 Others tabs |
| **IPL Full Schedule** | `render.js` + `schedule.js` | All 74 matches with team badges, local time, date/team filter chips |
| **Calendar Export** | `render.js` | .ics download + Google Calendar deep-link per fixture |
| **Venue Directions** | `render.js` | Google Maps directions link per fixture |
| **Head-to-Head Records** | `render.js` | CSK's all-time W-L vs each opponent with win-% bar |
| **Standings Table** | `render.js` | Points table, playoff zone highlight, form chips |
| **Cricket Quiz** | `profile.js` | 10 random trivia questions, instant feedback, medal result screen |
| **Fan Poll** | `profile.js` | Vote once per poll ID; results shown as animated percentage bars |
| **Match Predictions** | `profile.js` | Predict W/L for each fixture before it starts; locked once live |
| **Toss Tracker** | `profile.js` | Record toss won/lost + bat/field choice; summary stats |
| **Match Journal** | `profile.js` | 280-char notes per match; auto-saved with 600 ms debounce |
| **Fantasy Tips** | `profile.js` | Per-match captain, must-picks, differentials, avoid list |
| **Fan Profile / Jersey** | `profile.js` | Custom name + number jersey, favourite player info panel |
| **Live Match Centre** | `live.js` | All live matches, format filter (T20/ODI/Test/Women/IPL), scorecard expand |
| **Pin Live Score** | `live.js` | Floating widget persists across page navigation |
| **FanCode Stream Link** | `live.js` | Deep-link to FanCode per live match |
| **PWA Install** | `sw.js` | Installable on Android/iOS; works fully offline after first load |
| **SW Update Banner** | `app.js` | Non-intrusive banner when a new service worker version is waiting |
| **Toast Notifications** | `app.js` | Global `Toast.show()` for info / warn / error messages |

---

## Architecture Notes

| Module | Size | Responsibility |
|---|---|---|
| `src/data/team.js` | data | Single source of truth — no logic |
| `src/js/icons.js` | ~4 KB | Inline SVG registry; `Icons.init(root)` replaces `[data-lucide]` |
| `src/js/api.js` | ~8 KB | `CricketAPI.*` — fetches live scores + fixtures; 60-s shared cache |
| `src/js/render.js` | ~46 KB | Pure view layer — builds DOM from DATA; no routing or timers |
| `src/js/router.js` | ~2 KB | Shows/hides pages; lazy-renders content on first visit |
| `src/js/schedule.js` | ~20 KB | Date/team filter chips, view toggle, live match highlight |
| `src/js/countdown.js` | ~4 KB | 1-second interval timer reading `DATA.fixtures` |
| `src/js/profile.js` | ~40 KB | 7 IIFE modules: FanProfile, FanPoll, FanPredictions, CricketQuiz, TossTracker, MatchJournal, FantasyTips |
| `src/js/news.js` | ~14 KB | RSS fetch + cache + category filter + DOM construction |
| `src/js/live.js` | ~38 KB | Live score polling, format filter, pin widget, scorecard expand |
| `src/js/app.js` | ~12 KB | Bootstrap, theme toggle, Hub live polling, carousel, share, SW |
| `src/css/tokens.css` | tokens | Colors, typography scale, spacing — edit here to retheme |
| `src/css/components.css` | styles | All UI components — cards, nav, badges, skeletons, toasts… |
| `sw.js` | PWA | Cache-first for shell assets; stale-while-revalidate for fonts |

---

## Design Tokens (quick reference)

| Token | Value | Purpose |
|---|---|---|
| `--color-bg` | `#060608` | Page background (dark mode) |
| `--color-yellow` | `#F5B800` | CSK brand accent |
| `--color-border` | `#1A1A1E` | Card / component borders |
| Font | Plus Jakarta Sans 200/400/800 + Space Mono | Body + monospace |
| Card radius | `16px+` | All card corners |

Light mode overrides `--color-yellow` to `#7A5900` for WCAG AA contrast.
