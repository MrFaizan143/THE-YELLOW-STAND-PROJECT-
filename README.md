# TYS 2026 Engine

A lightweight, zero-dependency fan app for **The Yellow Stand** — CSK's unofficial hub.

## Project Structure

```
tys-2026/
├── index.html              # Single HTML entry point
└── src/
    ├── css/
    │   └── main.css        # All styles, themed via CSS custom properties
    ├── data/
    │   └── team.js         # ★ THE DATABASE — edit this to update fixtures/squad
    └── js/
        ├── render.js       # View layer — builds DOM from DATA
        ├── router.js       # Client-side page navigation
        ├── countdown.js    # Live countdown timer
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

## Deployment (CDN)

The project ships ready-to-deploy configs for both major edge networks.

### Vercel Edge
Push the repo and import it as a **Static Site** in the Vercel dashboard (no framework preset, no build command).  
`vercel.json` sets long-lived cache headers for assets and security headers for all routes.

```bash
npx vercel --prod
```

### Cloudflare Pages
Connect the repo in the **Cloudflare Pages** dashboard (no build command, output directory `.`).  
`_headers` applies the same cache strategy and security headers at the edge.

#### Cache strategy at a glance

| Path          | Cache-Control                                   | Rationale                              |
|---------------|-------------------------------------------------|----------------------------------------|
| `src/css/*`   | `public, max-age=31536000, immutable`           | Styles don't change between deploys    |
| `src/js/*`    | `public, max-age=31536000, immutable`           | Scripts don't change between deploys   |
| `src/data/*`  | `public, max-age=3600, stale-while-revalidate`  | Data may change; serves stale quickly  |
| `index.html`  | `public, max-age=0, must-revalidate`            | Always fetch latest HTML on each visit |

> **Cache busting:** when you update a CSS or JS file, rename it with a version suffix  
> (e.g. `main.v2.css`) or rely on Vercel/Cloudflare's built-in asset fingerprinting so  
> the browser picks up the new file despite the long TTL.

## How to Update Data

All app content lives in **`src/data/team.js`**. Edit the `DATA` object:

- **`DATA.nextMatch`** — countdown target date + label shown on Hub
- **`DATA.fixtures`** — match schedule shown on Map page
- **`DATA.squad`** — players grouped by category on Pride page
- **`DATA.staff`** — support staff shown on Pride page

No other files need to change for content updates.

## Architecture Notes

| Module | Responsibility |
|---|---|
| `team.js` | Data only — no logic |
| `render.js` | DOM construction — no routing or timers |
| `router.js` | Navigation — lazy-renders pages on first visit |
| `countdown.js` | Timer only — reads `DATA.nextMatch.date` |
| `app.js` | Wires everything together on `DOMContentLoaded` |
