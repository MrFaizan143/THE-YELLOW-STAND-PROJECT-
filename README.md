# TYS 2026 Engine

A lightweight, zero-dependency fan app for **The Yellow Stand** — CSK's unofficial hub.

## Project Structure

```
tys-2026/
├── index.html              # Single HTML entry point
├── sw.js                   # Service worker (PWA offline support)
├── manifest.json           # PWA manifest
├── icons/                  # App icons
└── src/
    ├── css/
    │   ├── main.css        # Stylesheet entry point (imports below)
    │   ├── tokens.css      # Design tokens (colors, spacing, typography)
    │   ├── base.css        # Reset, body defaults, keyframes
    │   └── components.css  # UI component library
    ├── data/
    │   └── team.js         # ★ THE DATABASE — edit this to update fixtures/squad
    └── js/
        ├── results.js      # Match result tracker (W/L/NR, localStorage)
        ├── render.js       # View layer — builds DOM from DATA
        ├── router.js       # Client-side page navigation
        ├── countdown.js    # Live countdown timer
        ├── profile.js      # Fan jersey profile (localStorage)
        └── app.js          # Entry point — bootstraps all modules
```

## How to Run

No build step needed. Just open `index.html` in a browser, or serve via any static file server:

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .
```

## How to Update Data

All app content lives in **`src/data/team.js`**. Edit the `DATA` object:

- **`DATA.nextMatch`** — countdown target date + label shown on Hub
- **`DATA.fixtures`** — match schedule shown on Map page (include `iso` field for auto-detection of next match)
- **`DATA.squad`** — players grouped by category on Pride page
- **`DATA.staff`** — support staff shown on Pride page

No other files need to change for content updates.

### API keys (optional)
- A built-in empty config stub ships with the app. To enable live scores, set `window.TYS_CONFIG = { CRICAPI_KEY: '...', RAPIDAPI_KEY: '...' }` in `index.html` (before `src/js/app.js`) or a local script tag you keep out of version control.

## Features

| Feature | Description |
|---|---|
| **Countdown** | Live timer to the next CSK match on the Hub page |
| **Season Record** | W-L tally shown on Hub, auto-updated as you log results |
| **Match Schedule** | Full 14-game fixture list with venue & broadcast info |
| **Next Match Badge** | Auto-highlights the upcoming fixture in the schedule |
| **Result Tracking** | Tap `+` on any fixture to cycle W → L → NR → clear |
| **Squad & Staff** | Full squad by role + coaching staff on the Pride page |
| **Fan Profile** | Custom jersey (name, number), favourite player & win streak |
| **PWA** | Installable, works offline via service worker |

## Architecture Notes

| Module | Responsibility |
|---|---|
| `team.js` | Data only — no logic |
| `results.js` | W/L/NR persistence and next-fixture detection |
| `render.js` | DOM construction — no routing or timers |
| `router.js` | Navigation — lazy-renders pages on first visit |
| `countdown.js` | Timer only — reads `DATA.nextMatch.date` |
| `profile.js` | Fan jersey + preferences — reads/writes localStorage |
| `app.js` | Wires everything together on `DOMContentLoaded` |
