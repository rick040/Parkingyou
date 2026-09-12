# Legacy behaviour: the map and the Aeroparker price layer

Source: the rendered HTML of `parkingyou.nl/nl/parkeren/location=101/city=3`, supplied
by the repository owner. This is the first direct evidence of how the current
site works; the live host is unreachable from the build environment, so
everything here comes from that single page.

Purpose: separate **what the current site does that is worth keeping** from
**how it does it, which we are replacing**. The behaviour is the requirement.
The vendor choices are not.

## Part 1: the Aeroparker price layer

### What the old site does

Prices are fetched in the browser, one request per location, after the map
renders. From the page's own inline script:

```js
$.post( root + "tool-ajax_actions/price-aeroparker=1?v=2",
  { csrf_token: csrf, date_start: dateStart, date_end: dateEnd, location: aeroparkerId },
  function (returnData) { ... })
```

Each location card in the DOM carries three data attributes:

| Attribute | Meaning |
| --- | --- |
| `data-location-id` | The CMS location id, used as the key for markers and tooltips |
| `data-price` | The **Aeroparker product id**, despite the name |
| `data-location-price-from` | An editorially maintained fallback "vanaf" price |

The response is a bare string, and the page decides what it means by inspection:

```js
const priceFound = (returnData && returnData != '' && returnData != '-1'
                    && !returnData.includes('error')) ? true : false;
const finalPrice = (priceFound) ? returnData
                 : ((priceFrom) ? 'va €' + priceFrom : false);
```

So there are four outcomes: a real price, the sentinel `-1`, an empty string, or
a string containing `error`. Three of the four mean failure and all three are
handled by falling back to the editorial "vanaf" price and dimming the marker
and the list item.

Dates are sent as `DD-MM-YYYY HH:MM` (`'01-01-1970 01:00'`), which is neither
the API's ISO 8601 nor the booking link's US `MM-DD-YYYY`. Three date formats in
one system.

### What is right about it, and must be kept

**The editorial fallback price is the correct design and we keep it.** This is
independent confirmation of the conclusion in `docs/AEROPARKER-AUDIT.md`: a
location page must never depend on a live Aeroparker call to render a price.
The old site already knows this and already has the fallback field. Our content
model's `vanafPrijs` plus `syncStatus` is the same idea with a sync behind it
instead of a per-request call.

**Dimming rather than hiding** an unpriced location is also right. The garage
still exists and still ranks; suppressing it would be worse than showing it
without a live price.

### What is wrong about it, and must not be carried over

**One HTTP request per location, from the browser, on every page view.** A city
page for Eindhoven has 16 locations, so 16 round trips through the site's own
backend into Aeroparker before any price appears. This is the single biggest
reason the current site cannot hit Core Web Vitals on a midrange Android over
4G, and it puts Aeroparker in the critical path of every page view. The brief's
nightly sync exists precisely to kill this.

**Failure is detected by string matching.** `returnData.includes('error')` means
a product legitimately named something containing "error" would be treated as a
failure, and a malformed success would be treated as a price. Phase 3's
zod-validated client replaces this with a typed discriminated result.

**`-1` is an undocumented sentinel.** It appears nowhere in the 210-page
Aeroparker specification. It is the old middleware's invention, which means
there is a translation layer between the site and Aeroparker whose behaviour is
not documented anywhere. We are not reusing it.

**Prices are computed for a window the visitor has not chosen.** When no dates
are set, the page asks for `01-01-1970 01:00` to `01-01-1970 02:00`, the Unix
epoch. Whatever Aeroparker returns for a one-hour window in 1970 is what gets
shown as the price. This is almost certainly why prices come back as `-1` so
often that an editorial fallback was needed in the first place.

### What we build instead

1. Nightly sync writes `vanafPrijs` per location into Postgres. Pages render
   from that, server-side, with zero third-party calls in the request path.
2. When a visitor picks real dates, one request for the whole result set, not
   one per location, and only then.
3. A typed result: `{ status: 'ok', price }` or `{ status: 'fallback', vanafPrijs, reason }`.
   No string sniffing.
4. The dimmed state stays, driven by the typed result.

## Part 2: the map

### What the old site does

Google Maps JS API with the `places` library. The key facts worth porting:

| Behaviour | Detail from the page |
| --- | --- |
| Default view | Eindhoven `51.44058, 5.46256`, zoom 15 |
| City focus | `map.setCenter()` per selected city, e.g. `51.43781, 5.48417` |
| Gestures | `gestureHandling: "greedy"`, so one finger pans on mobile |
| Chrome | Fullscreen, map type and Street View controls all disabled |
| Styling | Every POI category hidden except a muted generic POI label in `#909090` |
| Markers | Custom SVG, `map-location.svg` when priced, `map-location-grey.svg` when not, 50×50 |
| Price labels | An InfoWindow per marker containing `<div class="mapPrice">`, `disableAutoPan: true`, `shouldFocus: false` |
| Detail popups | A second InfoWindow per marker, content rewritten in place when the price arrives |
| Search | Places Autocomplete, `types: ["geocode","establishment"]`, `componentRestrictions: { country: 'NL' }`, `strictBounds: true`, bounds from geocoding the city name |
| Submit | Autocomplete selection writes lat/lng into hidden inputs and auto-submits after 100 ms |

The interaction design here is good and I am keeping essentially all of it. A
price floating over each pin is the right primitive for a parking map: it lets
someone compare 16 garages at a glance without tapping anything.

### What has to change, and why

**Google Maps is excluded by the project constraints**, and the brief specifies
MapLibre GL with Protomaps or PDOK tiles. That is not a preference, it is the
data-residency requirement: every tile request to `maps.googleapis.com` sends
the visitor's IP and viewport to Google, and the page as it stands also loads
`maps.gstatic.com` and `fonts.googleapis.com`. PDOK is run by the Dutch
Kadaster, is EU-hosted, needs no API key and has no per-view cost.

The one capability with no drop-in replacement is **Places Autocomplete**. The
substitute is the **PDOK Locatieserver** free-text suggest and lookup service,
which covers Dutch addresses, place names and POIs from the BAG and NWB. It is
Dutch government infrastructure, so it is both EU-resident and better at Dutch
addresses than Google is. It needs no dependency, just `fetch`.

`strictBounds` per city has no equivalent and does not need one: Locatieserver
takes a centre point and sorts by distance, which gives the same practical
result without hard-clipping a search that happens to sit just outside a city
boundary.

**Marker labels are DOM, not InfoWindows.** MapLibre has no InfoWindow, and it
does not need one. A price label is a `Marker` with a custom HTML element, which
is cheaper than Google's InfoWindow, stylable with our own tokens and reachable
by keyboard. The old site's two-InfoWindows-per-marker approach, where the
content string is rewritten with `.replace()` when the price arrives, is
replaced by React state.

**Pinch zoom must work.** The current page sets
`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`.
`maximum-scale=1` blocks pinch zoom across the whole site and fails WCAG 2.2
success criterion 1.4.4. We drop it. `greedy` gesture handling on the map
itself is kept, because that is about the map, not the page.

## Part 3: facts this page corrects in the Phase 0 documents

The city list in the page footer and the search form is authoritative and
contradicts what I inferred from indexed URLs.

| City | cid | Status in my Phase 0 inventory |
| --- | --- | --- |
| Amsterdam | 1 | correct |
| Eindhoven | 3 | correct |
| Rotterdam | 5 | correct |
| Tilburg | 7 | correct |
| Regio Zuid-Holland | 9 | correct |
| **Den Haag** | **11** | **missing entirely** |
| Regio Gelderland | 13 | present but cid unknown; now confirmed |
| Utrecht | 15 | correct |
| **Heerhugowaard** | **17** | **missing entirely** |
| Zoetermeer | 19 | correct |
| **Almere** | **21** | **missing entirely** |

Eleven cities and regions, not the eight I found. cids are odd numbers only,
which suggests the old CMS allocates ids in pairs, probably one per language.

Other corrections:

- `/nl/klantenservice` does not exist. It is `/nl/over/klantenservice`.
- `/nl/over/nieuwsbriefabonnement` exists and was missing.
- `/nl/parkeren/book-only=1` is the primary "Direct reserveren" call to action
  in both the desktop header and the mobile menu. It is the highest-intent URL
  on the site and it was missing from the inventory.
- The language switcher preserves the current path, so **every** page has an
  `/en/` twin, not just the ones that happen to be indexed. This roughly doubles
  the redirect map and makes open question 1 more consequential, not less.

All of these are now in `docs/URL-INVENTORY.csv`.

## Part 4: confirmed, the site is also the PWA

The page carries a web app manifest, Apple touch icons, 28 iOS splash screen
variants, `apple-mobile-web-app-capable`, and hand-rolled install prompts for
both iOS and Android including a version check for iOS 26.

The service worker registration is **commented out**:

```js
/*
if('serviceWorker' in navigator) { ... navigator.serviceWorker.register(swUrl) ... }
*/
```

So it is a PWA in metadata and install prompt only; there is no offline layer
active. That is worth knowing for whoever builds the real PWA, and it is
evidence that the marketing site and the app being one codebase has not actually
bought much.

None of this comes into this repository. The brief is explicit that the PWA is a
separate project, and this is a good example of why: 28 splash screen `<link>`
tags on a marketing page cost bytes on every page view and serve nobody looking
for a parking space.

## Part 5: the third-party stack, and the data residency problem

Loaded by that single page:

| Service | Host | Data residency |
| --- | --- | --- |
| Google Tag Manager | googletagmanager.com | US |
| Google Analytics 4 | googletagmanager.com | US |
| Google Ads conversion | googletagmanager.com | US |
| Microsoft Clarity | clarity.ms | US, and it is a session recorder |
| Google reCAPTCHA v3 | google.com/recaptcha | US |
| Google Maps + tiles | googleapis.com, gstatic.com | US |
| Google Fonts | fonts.googleapis.com | US |
| Cookiebot | cookiebot.com | EU |

Cookiebot is doing consent management correctly and is the one EU service in the
list. Everything it gates is American.

Microsoft Clarity deserves specific attention: it is a session replay tool,
which records what a visitor does on the page. Under the AVG that is a higher
bar than analytics, and the brief requires no personal data leaving the EU.

Phase 4 replaces the analytics layer with Plausible or Umami, self-hosted or
EU-hosted, cookieless by default. Google Fonts get self-hosted, which is faster
anyway. reCAPTCHA, if a form still needs bot protection, becomes a self-hosted
alternative such as Altcha or a honeypot plus rate limiting. This is now a
larger Phase 4 task than the brief implies and `docs/PRIVACY.md` will have to
document the removal, not just the new setup.
