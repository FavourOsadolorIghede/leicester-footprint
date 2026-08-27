# Leicester Footprint

A privacy-first personal **carbon footprint tracker for Leicester**. Log travel,
energy and shopping; get an estimated CO₂e breakdown; and find greener local
alternatives that also save money.

> **Estimates, not accounting.** Every figure uses published UK average emission
> factors. The app is a proof-of-concept assessment tool, in the spirit of
> ISO 14040 lifecycle assessment — it is deliberately transparent about its
> assumptions and never overclaims.

## Why this exists

This started as a 5-person Climate Innovation Lab prototype ("Leicester Footprint
Tracker"). This repository is a **ground-up rewrite**: fully standalone, no
backend, no account, no vendor lock-in. It replaces the original low-code
platform's database/auth with a local data layer, adds a real design system,
code-splitting, unit tests for the methodology, and an installable PWA mode.

## Features

| Area | What it does |
| --- | --- |
| **Dashboard** | CO₂e by category (travel / energy / food) with week / month / year views, an 8-week trend chart, category breakdown, and personalised "top 3" recommendations. |
| **Track** | Manual travel logging (mode + distance, quick presets, per-mode impact tips) and energy readings (kWh, or a "£ spent → kWh" estimator). GPS **trip auto-detection** (walking / cycling / vehicle by speed) when installed as an app. |
| **Receipts** | In-browser OCR (Tesseract.js) + a heuristic line-item parser that strips totals, VAT, card/payment lines, survey URLs and transaction IDs, scores each item's confidence, and lets you review and categorise before saving. |
| **Products** | Barcode lookup via the [Open Food Facts](https://world.openfoodfacts.org) API with a manual fallback, a basket and a saved-items list. |
| **Leicester** | A curated directory of 20+ local markets, repair cafés, refill shops, transport options and advice services, searchable by name, tag or benefit. |
| **Groups** | On-device household / workplace / society leaderboards with weekly green challenges and shareable join codes. |
| **Settings** | Weekly target, data export / import (JSON), and a type-`CLEAR`-to-confirm wipe. |

Plus: light / dark / system themes with no flash of the wrong theme, an animated
hero, a mobile bottom-tab layout with safe-area handling, pull-to-refresh, and a
zoom lock that only applies in installed-app mode (never in a normal browser tab).

## Tech

- **Vite** + **React 18** + **React Router**
- **Tailwind CSS** with a shadcn-style CSS-variable design system
- **IndexedDB** (via [`idb`](https://github.com/jakearchibald/idb)) for all user data; `localStorage` only for preferences
- **Recharts**, **Framer Motion**, **Tesseract.js**, **lucide-react**
- **Vitest** for the methodology unit tests

## Privacy

There is no server. Everything you log is stored in **your browser, on your
device**. The only network requests the app makes are:

1. Google Fonts (the Inter typeface).
2. Open Food Facts — only when you look up a barcode.

Receipt OCR runs entirely on-device. Clearing your browser data erases everything.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build → dist/
npm run preview  # serve the production build
npm test         # run the methodology unit tests
npm run lint
```

Deploy `dist/` to any static host (GitHub Pages, Netlify, Vercel, Cloudflare
Pages). No environment variables, no build secrets.

## Methodology

See the in-app **Learn** page for the full factor tables and sources. In short:

- **Travel** — `distance (km) × per-passenger-km factor` (UK Government GHG
  conversion factors, well-to-wheel, average occupancy).
- **Energy** — `electricity kWh × 0.207 + gas kWh × 0.182` (UK grid average +
  gas combustion).
- **Food** — `mass (kg) × cradle-to-retail lifecycle factor`; where only a price
  is known, mass is implied at roughly £3.20/kg.

The travel, energy and food factor sets, the receipt-parser rules and the
trip-classification thresholds all live in [`src/domain/`](src/domain) and are
covered by unit tests.

## Project layout

```
src/
  domain/       emissionFactors, leicesterPlaces, receiptParser, tripDetection, challenges (+ tests)
  lib/          db (IndexedDB), hooks, theme, format, environment, utils
  components/   AppLayout, AnimatedWaves, ThemeToggle, common, ui/ (design-system primitives)
  pages/        Landing, Dashboard, Track, Receipts, Products, Leicester, Groups, Learn, Settings
```

## License

MIT — see [LICENSE](LICENSE).
