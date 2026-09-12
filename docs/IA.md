# Information architecture and URL structure

Scope: the marketing website only. The customer-facing PWA is a separate project
and nothing here describes it.

All URL paths and slugs are Dutch, per the project language rule. This document
is English.

## The idea in one paragraph

Three page types carry the search traffic: the city page, the location page and
the POI page. Everything else supports them. A city page answers "parkeren
Amsterdam". A location page answers "Parking Plantage" and converts. A POI page
answers "parkeren bij Artis" and hands the visitor to the location that serves
it. The internal linking exists to make sure every one of those pages is reachable
in two clicks from the homepage and that no POI page is an island.

## URL structure

```
/                                          home
/locaties                                  all locations, filterable
/parkeren/{stad}                           city page
/parkeren/{stad}/{locatie}                 location detail
/parkeren-bij/{poi}                        POI landing page
/abonnementen                              subscriptions
/parkingpass                               ParkingPass
/zakelijk                                  business overview
/zakelijk/{onderwerp}                      business sub-page
/veelgestelde-vragen                       FAQ
/nieuws                                    news index
/nieuws/{slug}                             news article
/over-ons                                  about
/over-ons/team                             team
/contact                                   contact
/klantenservice                            support hub
/werken-bij                                careers
/algemene-voorwaarden                      terms
/privacybeleid                             privacy
/cookiebeleid                              cookies
```

Rules that apply to every path:

- Lower case, hyphen separated, no trailing slash, no file extension.
- No language prefix. The site is Dutch at the root. See open question 1.
- No numeric ids anywhere in a URL. The old site put `id=35` and `cid=1` in the
  path; that is what made every page have several addresses.
- No state in the path. Filters, sorting and pagination are query strings, and
  every query-string variant canonicalises to the clean path.
- A slug is permanent. Changing one means adding a redirect, which is why the
  `medium` confidence slugs in the URL inventory need a human answer before
  Phase 1 freezes them.

### Why `/parkeren/{stad}` and not `/locaties/{stad}`

The money query is "parkeren amsterdam", not "locaties amsterdam". Putting the
head term in the path costs nothing and matches how people search. `/locaties`
survives as the filterable overview of all 37, which is a different job: it
serves the visitor who does not yet know which city, and it is the parent for
nobody.

Rejected: keeping `/locaties/{stad}` to match the old structure. The old URLs
are being redirected regardless, so there is no continuity to preserve, and one
of the two Eindhoven city slugs has to die anyway.

### Why `/parkeren-bij/{poi}` is a separate namespace

A POI page is "parkeren bij restaurant X", and the POI is not a city and not a
location. Giving it its own namespace means a POI slug can never collide with a
city slug, which matters because business users will create POI pages without
thinking about the routing. `/parkeren-bij/artis` cannot accidentally shadow
`/parkeren/artis`.

Rejected: `/parkeren/{stad}/parkeren-bij-{poi}`. It nests the POI under a single
city, and some POIs are served by locations in more than one city. It also makes
the URL long for no gain.

Rejected: `/lp/{slug}`, the old site's pattern. "lp" means nothing to a visitor
or to a search engine, and on the old site it was already being used for things
that are not landing pages at all.

### Location slugs drop the "parking-" prefix

`/parkeren/amsterdam/plantage`, not `/parkeren/amsterdam/parking-plantage`. The
word "parkeren" is already in the path and "parking" is English. The garage is
branded "Parking Plantage" and the page title and H1 will say exactly that; the
slug does not have to repeat it.

## The hierarchy

```
home
├── /locaties  (all 37, filter by city, map view)
├── /parkeren/{stad}                    ← one per city or region
│   └── /parkeren/{stad}/{locatie}      ← one per car park
├── /parkeren-bij/{poi}                 ← many, each pointing at 1..n locations
├── /abonnementen
├── /parkingpass
├── /zakelijk
│   └── /zakelijk/{onderwerp}
├── /nieuws
│   └── /nieuws/{slug}
├── /veelgestelde-vragen
└── /over-ons, /contact, /klantenservice, /werken-bij, legal pages
```

Breadcrumbs follow this tree exactly, and `BreadcrumbList` structured data in
Phase 4 is generated from it rather than hand-written per template.

A POI page's breadcrumb is `Home › Parkeren › {Stad} › Parkeren bij {POI}`, using
the city of its primary location. The POI is not physically a child of the city
in the URL, and that is fine: the breadcrumb describes the topical hierarchy, and
Google accepts a breadcrumb trail that does not mirror the path.

## Internal linking

The rule: **every page links down to its children, up to its parent, and sideways
to its siblings. A page with no inbound internal link is a bug.**

| From | Links to | Why |
| --- | --- | --- |
| Home | The cities with the most locations, plus 3 featured locations, plus `/locaties` | Distributes authority into the city layer immediately |
| `/locaties` | Every one of the 37 locations, grouped by city, each city name linking to its city page | The hub that guarantees no location is orphaned |
| City | Every location in that city; every POI page whose primary location is in that city; the abonnementen page filtered to that city; sibling cities | The city page is the authority hub for its cluster |
| Location | Its city (breadcrumb and inline); the other locations in the same city; every POI page that names this location; related news articles tagged with this location | Sideways links keep visitors in the cluster instead of back to search |
| POI | Its primary location, prominently and above the fold; any secondary locations; its city | The POI page exists to hand the visitor onward; this link is the conversion |
| News article | Any location or city it is tagged with | Turns news into internal links rather than a dead end |
| FAQ | The location or city an answer is about, where the answer is specific | |

Two mechanical guarantees, enforced in Phase 4 by a test, not by discipline:

1. **The POI back-link is automatic.** A POI page names one primary location and
   any number of secondary ones. The location template renders a "Parkeren bij"
   block built by querying POIs that reference it. Neither side is hand-linked,
   so neither side can rot when an editor forgets.
2. **No orphans.** A build-time check walks every published page and asserts it
   has at least one inbound internal link from another published page. A new POI
   page is reachable from its city page the moment it is published, because the
   city page queries rather than lists.

### Where a business user can create an orphan, and why they cannot

The hard requirement is that a non-technical user adds a location, a POI page or
an FAQ item and sees it live within a minute. That is also the easiest way to
create an orphan. The defence is that no listing is a hand-maintained list:

- A new location appears on its city page and on `/locaties` because both query
  by city.
- A new POI page appears on its primary location's page and on that location's
  city page because both query by relationship.
- A new FAQ item appears on `/veelgestelde-vragen` and, if it is tagged to a
  location, in that location's FAQ block.

The only field that can break this is the relationship field, so in the CMS it is
required, not optional. See `docs/CONTENT-MODEL.md`.

## Pagination, filtering and canonicals

- `/locaties?stad=amsterdam` renders a filtered view and canonicalises to
  `/parkeren/amsterdam`. The filter is a convenience; the city page is the
  document.
- `/nieuws?pagina=2` is `noindex, follow`. The articles are indexed; page 2 of an
  index is not a document anyone searches for.
- Any query string that is not a known parameter is stripped by the canonical.
  This is what stops the old site's problem recurring.

## What changes for the visitor

The old site makes you go Home → Parkeren → pick a city in a widget → pick a
location. Four steps, and the intermediate states are indexable URLs. The new
structure is Home → city → location, two steps, with the location page reachable
directly from search because it has a stable, descriptive URL.

## Open questions

**1. Does the site keep an English version?** The old site serves `/nl/` and
`/en/` and both are indexed; `/en/abonnementen`, `/en/locaties` and many English
location pages rank today. The phase brief specifies `hreflang nl-NL` only,
which implies Dutch only. Dropping English means 301-ing every `/en/` URL to its
Dutch equivalent and accepting the loss of whatever English traffic exists.

This is the one decision in Phase 0 that is expensive to undo: it changes the
routing (whether `[locale]` exists as a route segment), the content model (whether
every field is localised) and roughly half the redirect map. Retrofitting
localisation onto a single-locale Payload schema is a migration; building a
single-locale site on a localisation-ready schema is nearly free.

**My recommendation: build Dutch only, but make it the decision rather than the
default.** Check Search Console for `/en/` traffic first. If English is more than
a few percent of clicks, we localise from the start.

Working assumption if unanswered: Dutch only, no locale segment, and I will note
in Phase 1 exactly which files would change if that is reversed.

**2. Are "regio-zuid-holland" and "regio-gelderland" cities or something else?**
The old site mixes real cities (Amsterdam, Eindhoven) with regions covering
several towns (Ypenburg, Rijswijk, Schiedam under one region page). A region page
cannot rank for "parkeren Rijswijk" as well as a Rijswijk page could.

The content model treats a city as a place with a name and a slug, so a region is
representable today and can be split into real city pages later without a schema
change. That is the cheap path: ship regions as they are in Phase 1, and revisit
with keyword data before Phase 4.
