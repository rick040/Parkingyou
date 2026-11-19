# ParkingYou marketing website

The greenfield replacement for parkingyou.nl. Marketing website only; the
customer-facing PWA is a separate project and is not built here.

Aeroparker stays the system of record for bookings, products, inventory and
pricing. This codebase reads from it and deep links into it, and never writes
to it.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # production build
npm run start        # serve the production build
```

Screenshots at the 390px reference width:

```bash
npm run build && npm run start -- -p 3111
node scripts/screenshots.mjs http://127.0.0.1:3111 screenshots
```

## Where things are

| Path | What |
| --- | --- |
| `content/*.json` | Phase 1 content, typed mock data. No CMS yet. |
| `src/lib/content/` | Typed loaders. In Phase 2 the bodies become Payload queries and the signatures do not change. |
| `src/lib/prijs.ts` | The typed price result that replaces the legacy string-sniffing. |
| `src/lib/kaart-config.ts` | Map tiles and attribution. One file to switch tile source. |
| `src/components/ParkeerKaart.tsx` | MapLibre map with price markers. |
| `public/brand/`, `public/pictogrammen/` | Logos and pictograms from the brand repository, see below. |
| `src/fonts/` | Ubuntu, the brand typeface, self-hosted under the Ubuntu Font Licence. |
| `src/lib/aeroparker/` | The booking deep-link builder: the only way this codebase hands a customer to Aeroparker. |
| `docs/` | Phase 0 planning documents and the legacy behaviour analysis. |
| `legacy-prototype/` | The pre-rebuild static prototype, kept for reference. Not built, not deployed. |

## Brand assets

Logos, pictograms, colours and the typeface come from
[rick040/py-assets](https://github.com/rick040/PY-ASSETS), which is the extract
of the ParkingYou huisstijlhandboek (Wayfinding & inrichting parkeervoorziening
v1.0, 09-2025). `src/lib/brand-tokens.json` is a copy of that repository's
`tokens.json` so every colour in `globals.css` can be traced to a handbook page
without leaving this repo.

Brand colours are the handbook's 1.3 values and are not to be eyeballed:

| Token | Hex | Name |
| --- | --- | --- |
| `--color-py-blue` | `#1A3580` | PY-Blauw |
| `--color-py-aqua` | `#32B9CD` | PY-Aqua |
| `--color-py-orange` | `#F08300` | PY-Oranje |
| `--color-py-grijs` | `#AEAEAE` | PY-Grijs |
| `--color-py-zwart` | `#1D1D1B` | PY-Zwart |

Not shipped from that repository, on purpose: the payment marks, the RVV road
signs and the escape-route symbols. The brand repo tags them `third-party` and
says to source the official files. Shipping Mastercard or Maestro artwork out of
a handbook extract is a trademark problem.

## Language rule

Code, comments, commit messages and documentation are English. All user-facing
copy, UI labels, URL paths, slugs and CMS field labels are Dutch.

Unknown facts are marked `{{TODO-NL: what is missing}}` so they are greppable:

```bash
grep -rn "TODO-NL" content src
```

## Current state

Phase 0 is complete and approved. This is the first slice of Phase 1: the city
page, the location page, and the map and price layer that the stakeholder asked
to see first. The remaining Phase 1 templates (POI, abonnementen, zakelijk, FAQ,
nieuws, contact) are not built yet.

Two decisions are still open and are recorded in `docs/IA.md`:

1. Whether the site keeps an English version. Built Dutch-only for now.
2. Two location slugs where the old site's slug and page title disagree.
