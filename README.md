# TYS 2026 Engine

A lightweight, zero-dependency fan app for **The Yellow Stand** — CSK's unofficial hub.

## Project Structure

```
tys-2026/
├── index.html              # Hub page — countdown to next match
├── schedule.html           # Map page — pre-rendered fixture list
├── squad.html              # Pride page — pre-rendered squad & staff
├── robots.txt              # Crawler instructions
├── sitemap.xml             # XML sitemap for search engines
└── src/
    ├── css/
    │   └── main.css        # All styles, themed via CSS custom properties
    ├── data/
    │   └── team.js         # ★ THE DATABASE — edit this to update fixtures/squad
    └── js/
        ├── render.js       # View layer — builds DOM from DATA (legacy SPA helper)
        ├── router.js       # Client-side page navigation (legacy SPA helper)
        ├── countdown.js    # Live countdown timer
        └── app.js          # Entry point — bootstraps Hub page modules
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
- **`DATA.fixtures`** — match schedule shown on Map page
- **`DATA.squad`** — players grouped by category on Pride page
- **`DATA.staff`** — support staff shown on Pride page

After editing `team.js`, copy the updated data into the pre-rendered HTML in `schedule.html` and `squad.html` to keep them in sync.

## Architecture Notes

| Module | Responsibility |
|---|---|
| `index.html` | Hub page — static HTML with countdown |
| `schedule.html` | Map page — pre-rendered fixtures, Google-indexable |
| `squad.html` | Pride page — pre-rendered squad, Google-indexable |
| `team.js` | Data only — no logic |
| `countdown.js` | Timer only — reads `DATA.nextMatch.date` |
| `app.js` | Wires Hub page modules on `DOMContentLoaded` |

## SEO

Each page includes:
- Unique `<title>` and `<meta name="description">`
- `<link rel="canonical">` URL
- Open Graph and Twitter Card meta tags
- JSON-LD structured data (SportsTeam / SportsEvent schemas)
- `robots.txt` allowing all crawlers
- `sitemap.xml` listing all three pages
