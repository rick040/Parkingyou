# Content model

The collections, fields and relationships for Payload CMS 3 on Postgres.
Implemented in Phase 2; agreed here so Phase 1's mock JSON has the same shape and
migrates without rework.

This document is English. Every `label` and `admin.description` shown here is
Dutch, because those are what the business user reads.

## The rule that governs everything

Every field belongs to exactly one of three groups, and the group decides who may
touch it:

| Group | Written by | In the admin |
| --- | --- | --- |
| **Redactioneel** | The business user | Editable |
| **Gesynchroniseerd** | The nightly Aeroparker sync | Read-only, shown with the last sync time |
| **Systeem** | The application | Hidden or read-only |

Aeroparker is the system of record for bookings, products, inventory and pricing.
Nothing in this codebase writes to it. Every `Gesynchroniseerd` field is therefore
read-only in the admin, and the admin says so in Dutch rather than just greying
the input out, so the user understands why a price cannot be corrected here.

A field is never both. When the business needs to override a synced value, that
is a separate editorial field plus an explicit "gebruik eigen tekst" toggle, so
the override survives the next sync and is visible as an override.

## Collections

### `steden` (cities)

The parent of the location cluster. Also covers the two region pages, per IA open
question 2.

| Field | Type | Group | Dutch label | Notes |
| --- | --- | --- | --- | --- |
| `naam` | text, required | Redactioneel | Naam | "Amsterdam" |
| `slug` | text, required, unique, indexed | Redactioneel | URL | Generated from naam, editable once, warns on change |
| `intro` | richText | Redactioneel | Introductietekst | Above the location list |
| `tekst` | richText | Redactioneel | Uitgebreide tekst | Below the list, the SEO body |
| `provincie` | select | Redactioneel | Provincie | |
| `coordinaten` | point | Redactioneel | Middelpunt op de kaart | Map centring, not a location |
| `hero` | upload → media | Redactioneel | Hoofdafbeelding | |
| `seo` | group | Redactioneel | SEO | See shared SEO group |
| `isRegio` | checkbox | Redactioneel | Dit is een regio, geen stad | Changes the H1 phrasing |
| `oudeCid` | number, indexed | Systeem | Oud CMS nummer | Resolves `cid=1` redirects |
| `status` | select: concept/gepubliceerd | Systeem | Status | |

### `locaties` (locations)

The reference template and the most important collection. 37 rows today.

**Redactioneel**

| Field | Type | Dutch label | Notes |
| --- | --- | --- | --- |
| `naam` | text, required | Naam | "Parking Plantage" |
| `slug` | text, required, indexed | URL | Unique per city, not globally |
| `stad` | relationship → steden, required | Stad | Required, so a location cannot be orphaned |
| `adres` | group | Adres | straat, huisnummer, postcode, plaats |
| `coordinaten` | point, required | Locatie op de kaart | Editorial, not the Aeroparker one. See note below |
| `intro` | textarea, required | Korte omschrijving | Used in listings and meta description |
| `omschrijving` | richText | Uitgebreide omschrijving | |
| `fotos` | array of upload → media | Foto's | alt text required per photo |
| `openingstijden` | array | Openingstijden | dag, van, tot, gesloten, opmerking |
| `is24Uur` | checkbox | 24 uur per dag open | Hides the hours table |
| `inrit` | richText | Inrijden | How to get in. Barrier, plate recognition, ticket |
| `uitrit` | richText | Uitrijden | |
| `route` | richText | Route en bereikbaarheid | |
| `ovBereikbaarheid` | richText | Met openbaar vervoer | |
| `voorzieningen` | select, hasMany | Voorzieningen | laadpunt, camerabewaking, overdekt, invalidenplaats, fietsenstalling |
| `maximaleHoogte` | number | Maximale doorrijhoogte in meters | A real reason people bounce |
| `aantalPlaatsen` | number | Aantal parkeerplaatsen | |
| `faqItems` | relationship → faq, hasMany | Veelgestelde vragen | The location's FAQ block |
| `seo` | group | SEO | |
| `status` | select | Status | concept / gepubliceerd |

**Gesynchroniseerd, read-only**

| Field | Type | Dutch label | Source |
| --- | --- | --- | --- |
| `aeroparkerSite` | text | Aeroparker site | Which credential set owns this car park. See audit open question 1 |
| `aeroparkerCarParkId` | text | Aeroparker parkeer-ID | `CarPark/@ID`. Stored as `(site, id)`, never a bare id |
| `aeroparkerCoordinaten` | point | Coördinaten volgens Aeroparker | `CarPark/@Latitude` and `@Longitude` |
| `producten` | array | Parkeerproducten | Per product: id, naam, vanafPrijs, valuta, rollupPrijs, besparing, uitverkocht, boekingUrl |
| `vanafPrijs` | number | Vanafprijs | Lowest product price. Always rendered as "vanaf" |
| `laatsteSync` | date | Laatst bijgewerkt | |
| `syncStatus` | select | Synchronisatiestatus | ok / verouderd / vermist / fout |
| `syncMelding` | textarea | Melding | Dutch explanation shown to the editor when status is not ok |

**Systeem**

| Field | Type | Notes |
| --- | --- | --- |
| `oudeId` | number, indexed | The old CMS `id=`. Without it a third of the redirect map cannot resolve. See `docs/URL-INVENTORY-METHOD.md` |
| `oudeSlugs` | array of text | Every historic slug, so a slug change never 404s |

Note on the two coordinate fields: Aeroparker's `CarPark` latitude and longitude
describe the barrier, which is sometimes round the back. The pin a visitor
navigates to is an editorial decision. The editorial field wins on the map; the
synced one is kept for reconciliation and is shown to the editor when the two
disagree by more than 100 metres.

### `poiPaginas` (POI landing pages)

"Parkeren bij restaurant X". The collection the business user will touch most.

| Field | Type | Group | Dutch label | Notes |
| --- | --- | --- | --- | --- |
| `poiNaam` | text, required | Redactioneel | Naam van de bestemming | "Artis" |
| `titel` | text, required | Redactioneel | Paginatitel | "Parkeren bij Artis" |
| `slug` | text, required, unique, indexed | Redactioneel | URL | Under `/parkeren-bij/` |
| `primaireLocatie` | relationship → locaties, **required** | Redactioneel | Dichtstbijzijnde parkeergarage | Required is the anti-orphan guarantee |
| `extraLocaties` | relationship → locaties, hasMany | Redactioneel | Andere geschikte garages | |
| `loopafstand` | number | Redactioneel | Loopafstand in minuten | |
| `intro` | textarea, required | Redactioneel | Korte omschrijving | |
| `tekst` | richText | Redactioneel | Uitgebreide tekst | |
| `coordinaten` | point | Redactioneel | Locatie van de bestemming | Shown on the map next to the garage |
| `hero` | upload → media | Redactioneel | Hoofdafbeelding | |
| `faqItems` | relationship → faq, hasMany | Redactioneel | Veelgestelde vragen | |
| `seo` | group | Redactioneel | SEO | |
| `status` | select | Systeem | Status | |
| `oudeSlugs` | array of text | Systeem | | |

`primaireLocatie` being required is the single most important constraint in this
document. It is what makes the IA's "no orphans" guarantee mechanical rather than
aspirational: a POI page cannot be saved without a parent, and the parent
location and its city both render the back-link by query.

### `faq`

| Field | Type | Group | Dutch label | Notes |
| --- | --- | --- | --- | --- |
| `vraag` | text, required | Redactioneel | Vraag | |
| `antwoord` | richText, required | Redactioneel | Antwoord | |
| `categorie` | relationship → faqCategorieen | Redactioneel | Categorie | |
| `locaties` | relationship → locaties, hasMany | Redactioneel | Geldt voor deze locaties | Empty means it is general |
| `volgorde` | number | Redactioneel | Volgorde | |
| `status` | select | Systeem | Status | |

An FAQ item is a row, not a block inside a page, so the same answer appears on
`/veelgestelde-vragen`, on its locations and in `FAQPage` structured data without
being written three times.

### `faqCategorieen`

`naam`, `slug`, `volgorde`. Small, but it is what keeps a 60-item FAQ navigable.

### `nieuws`

| Field | Type | Group | Dutch label |
| --- | --- | --- | --- |
| `titel` | text, required | Redactioneel | Titel |
| `slug` | text, required, unique, indexed | Redactioneel | URL |
| `publicatiedatum` | date, required | Redactioneel | Publicatiedatum |
| `samenvatting` | textarea, required | Redactioneel | Samenvatting |
| `inhoud` | richText, required | Redactioneel | Inhoud |
| `hero` | upload → media | Redactioneel | Hoofdafbeelding |
| `gerelateerdeLocaties` | relationship → locaties, hasMany | Redactioneel | Gerelateerde locaties |
| `gerelateerdeSteden` | relationship → steden, hasMany | Redactioneel | Gerelateerde steden |
| `auteur` | text | Redactioneel | Auteur |
| `seo` | group | Redactioneel | SEO |
| `oudeId` | number, indexed | Systeem | |

The two relationship fields are what turn news from a dead end into internal
links, per the IA linking table.

### `paginas` (generic pages)

For `/zakelijk`, `/zakelijk/{onderwerp}`, `/over-ons`, `/contact`,
`/klantenservice`, `/werken-bij` and the legal pages. A `titel`, `slug`,
`bovenliggendePagina` self-relationship for the `/zakelijk/{onderwerp}` nesting,
a `blokken` block field, `seo` and `status`.

Blocks: `tekst`, `tekstMetAfbeelding`, `uspRij`, `faqBlok`, `locatieUitgelicht`,
`contactformulier`, `citaat`, `cta`. Deliberately few. A large block library is
how a CMS becomes a page builder nobody can use consistently.

### `abonnementen` and `parkingpass`

Both are a single page with editorial copy plus a synced product table.

| Field | Group | Source |
| --- | --- | --- |
| `titel`, `intro`, `tekst`, `voorwaarden`, `seo` | Redactioneel | |
| `producten` | Gesynchroniseerd | `SubscriptionAvailabilityRS`: id, naam, prijs, boekingskosten, periodeType, minimumTermijn |
| `geldigOpLocaties` | Gesynchroniseerd | `SubscriptionQuote/CarParks`, mapped to `locaties` by `aeroparkerCarParkId` |

ParkingPass has no equivalent Aeroparker endpoint in the specification, so its
product table is editorial until Aeroparker tells us otherwise. Flagged rather
than guessed.

### `redirects`

`van`, `naar`, `type` (301/410), `actief`, `opmerking`. Editable by admins only.
This is the escape hatch for the redirects the pattern rules do not cover, and
for slug changes an editor makes later. The pattern rules from
`docs/URL-INVENTORY-METHOD.md` run first; this collection runs after them.

### `media`

`alt` is **required**. Not optional, not defaulted. An image without alt text is
an accessibility failure and a missed keyword, and the only moment anyone will
ever write it is at upload.

Also: `bijschrift`, `credit`, and Payload's generated sizes. Stored in EU
S3-compatible object storage from Phase 2, served through `next/image` as AVIF
and WebP.

## Shared field group: `seo`

Used by every collection that has a URL.

| Field | Dutch label | Notes |
| --- | --- | --- |
| `titel` | SEO-titel | Falls back to the page title. Counter warns past 60 characters |
| `omschrijving` | SEO-omschrijving | Falls back to `intro`. Counter warns past 155 |
| `afbeelding` | Deelafbeelding | Falls back to `hero`, then to a generated OG image |
| `geenIndex` | Niet laten indexeren door Google | Default off, with a warning when switched on |

Fallbacks matter: a business user who fills in nothing must still get a correct
title, description and OG image. Empty SEO fields are the normal case, not an
error state.

## Globals

- `navigatie`: main menu, footer columns, both as link arrays that can point at a
  collection document or an external URL.
- `siteInstellingen`: company details, phone, email, social links, default OG
  image, the Aeroparker sync status banner.
- `meldingen`: an optional site-wide notice bar, with a start and end date.

## Relationship summary

```
steden 1 ──── n locaties
locaties 1 ──── n poiPaginas        (via poiPaginas.primaireLocatie, required)
locaties n ──── n poiPaginas        (via poiPaginas.extraLocaties)
locaties n ──── n faq               (via faq.locaties)
locaties n ──── n nieuws            (via nieuws.gerelateerdeLocaties)
steden   n ──── n nieuws            (via nieuws.gerelateerdeSteden)
faqCategorieen 1 ──── n faq
paginas 1 ──── n paginas            (self, one level only)
```

## Roles and access

Two roles, per the phase brief.

| | `redacteur` | `beheerder` |
| --- | --- | --- |
| locaties, poiPaginas, faq, nieuws, paginas | create, read, update, publish | same |
| Delete anything | no | yes |
| steden | read only | full |
| redirects | no access | full |
| Globals: navigatie, siteInstellingen | read only | full |
| Users | no | full |
| Every `Gesynchroniseerd` field | read only | read only |

A `redacteur` cannot delete, cannot restructure the city layer and cannot break
the navigation. Those are the three actions that do damage a non-technical user
cannot undo. Everything they need for the daily job, adding a location, a POI
page, an FAQ item and a news article, they can do without an admin.

`Gesynchroniseerd` is read-only for both roles, including admins. An admin who
can hand-edit a synced price will, and then the next sync will silently overwrite
it and nobody will know why the number changed.

## Publishing and revalidation

Payload drafts and versions on `locaties`, `poiPaginas`, `nieuws` and `paginas`.
Publishing fires an `afterChange` hook that revalidates exactly the affected
paths and their parents:

| Published | Revalidated |
| --- | --- |
| A location | its own path, its city page, `/locaties`, every POI page referencing it, `/` if featured |
| A POI page | its own path, its primary location, its city page |
| An FAQ item | `/veelgestelde-vragen` and every location it is tagged to |
| A news article | its own path, `/nieuws`, its related locations and cities |
| A city | its own path, `/locaties`, every location in it |

Not a blanket purge. A full revalidation on every save is how a 60-second
publish target turns into a two-minute one at 37 locations.

## What Phase 1 has to match

The mock JSON in `/content/*.json` uses these field names exactly, including the
Dutch ones, so the Phase 2 seed script is a read and a write rather than a
translation layer. Three files to start: `steden.json`, `locaties.json`,
`poiPaginas.json`, plus `faq.json` and `nieuws.json`.

`Gesynchroniseerd` fields are present in the mock data with realistic values and a
`laatsteSync` timestamp, so the templates are built against the shape the sync
will actually produce, including the `syncStatus: "vermist"` case that Phase 3
has to render without breaking the page.
