# Aeroparker API audit

Status: complete for the read-only surface this website needs. Two items are
unanswerable from the specification alone and need ParkingYou or Aeroparker to
confirm them; both are listed under "Open questions" and neither blocks Phase 1.

## Source of this audit

The prompt said the API documentation would be in `/docs/aeroparker/`. That
directory did not exist in this repository. The specification was found instead
in the owner's Google Drive:

- `AeroParker API Technical Specification v.1.42 Draft.pdf`
- 210 pages, 3,131,647 bytes, last modified 2026-09-10
- Drive file id `1-4mWnG3xAlRf83vEGja38KFbrWuLu2vI`

Every statement below is taken from that document. Page numbers refer to the
PDF. Nothing here is inferred from a live call: no Aeroparker endpoint was
contacted, and no credentials exist in this repository.

Note the document is labelled **Draft** and is written for airports, not for
urban parking. It talks about terminals, airlines and flights throughout.
ParkingYou is 37 urban car parks, so a large part of the API surface is
irrelevant to us, and some of the vocabulary maps awkwardly onto our domain.

## Transport and shape

- One endpoint. Every request is an HTTP POST of an XML document to the same
  URL; the action is chosen by the root element name, not by the path (p15).
- Responses are XML. The response root element is normally the request name
  with `RS` instead of `RQ`, for example `ParkingAvailabilityRQ` →
  `ParkingAvailabilityRS`.
- JSON is supported for `ParkingProductPricing` only (p16). Every other call is
  XML in, XML out.
- XML namespace on every document: `http://api.aeroparker.com`.
- The API is stateless. There is no session token; authentication happens on
  every request (p15).

## Authentication

Two mechanisms, both carrying the same username and password:

1. A `<Credentials>` element inside the request body (p15).
2. HTTP Basic, `Authorization: Basic base64(username:password)` (p17). When this
   is used the `Credentials` element may be omitted.

There is a third path, AWS Cognito access tokens, for integrators attached to an
Aeroparker Cognito user pool (p152). We should not use it: it adds an AWS
dependency for no benefit on a read-only server-side integration.

**The constraint that shapes everything:** "a set of login credentials grants
access to one airport. If you need to make bookings for multiple airports then
you will need multiple sets of login credentials" (p15).

If "airport" maps to "site" and each ParkingYou city or car park is its own
site, we need one credential pair per site and the nightly sync is a loop over N
credential sets, not one call. This is open question 1.

## Endpoints relevant to a read-only marketing website

We need four. Everything else in the specification either writes to Aeroparker
or serves the barrier and back-office systems, and is out of scope by the
project's own constraint.

| Request | Returns | What we use it for |
| --- | --- | --- |
| `ParkingProductsRQ` | All currently enabled parking products for the site: id, name, features, description, terms, logo, map (p37) | The canonical list of live product ids. Detecting products that have disappeared. |
| `ParkingProductPricingRQ` | Per product, a price / rollup price / saving for a given entry and exit, or for a lead time and a set of durations. Optional `SummaryOnly` returns lowest, highest, largest and smallest saving only (p144-148) | Nightly tariff sync. The "vanaf" price on city, location and POI pages. |
| `ParkingAvailabilityRQ` | `ParkingProductQuote` list: product, **car park (id, name, lat, lng, MapsPOI)**, price, `BookingURL`, sold-out block, capacity counters (p38-42) | The only call that maps a product to a car park, and the only source of the canonical `BookingURL`. |
| `SubscriptionAvailabilityRQ` | `SubscriptionQuote` list: subscription product, price, booking fee, period type, minimum term, and the set of car parks it covers (p163-165) | The abonnementen page. |

Three consequences worth stating plainly:

- **`ParkingProductsRQ` has no price and no car park.** It returns product
  metadata only. So a product cannot be attached to a location from that call
  alone; the product-to-car-park edge exists only in `ParkingAvailabilityRS`
  and `SubscriptionAvailabilityRS`. The nightly sync therefore has to make an
  availability call per site with a representative window purely to learn the
  mapping.
- **`ParkingProductPricingRQ` also has no car park.** It is keyed on product id
  only, so the pricing sync depends on a mapping the pricing call itself cannot
  give us.
- **`ParkingAvailabilityRQ` requires an arrival date/time**, and
  `ReturnDateTime` "should be supplied for parking availability to indicate
  length of stay" (p18). There is no "give me everything" mode. Every sync run
  has to choose a window, and the answer is only true for that window.

## Data freshness

The specification says nothing about caching, freshness or staleness. There is
no `Cache-Control` guidance, no ETag, no "last updated" field on products, and
no webhook or push mechanism of any kind. Confirmed by searching the full
210-page text: zero occurrences of "rate limit", "throttle" or "cache".

What we do get is `ParkingAvailabilityRS/@Timestamp` and
`ParkingProductPricingRS/@Timestamp`, the server time the response was built.
That is the only freshness signal in the protocol, and it describes the
response, not the underlying data.

Practical reading for our design:

- Prices and availability are computed per request against a date window. They
  are live values, not a slowly changing catalogue.
- Nothing tells us when a price last changed, so a nightly pull cannot be
  incremental. Every run is a full re-read of the products we care about.
- Because the site renders from our own Postgres copy and never calls Aeroparker
  during a page render, the number on a page is by definition up to 24 hours
  old. That is acceptable for a "vanaf €x" indication and is not acceptable as a
  quoted price. Phase 1 copy must say "vanaf" and the real price must only ever
  be shown by Aeroparker itself, after the deep link.

## Rate limits

None documented. No limit, no quota, no `429`, no backoff guidance, nothing.

Absence of a documented limit is not absence of a limit. Treat it as unknown and
build as if a limit exists: one request at a time per site, a small delay
between requests, exponential backoff with jitter on failure, and a hard cap on
requests per sync run that is logged. A nightly full sync across 37 locations is
a few hundred requests, which is small; the risk is a retry storm turning that
into thousands. The cap is what prevents it. This is open question 2.

## Error handling, and why it is the main integration hazard

Errors do **not** come back as HTTP error statuses. From p189:

> Errors are returned as elements in the expected response type, eg.
> `ParkingAvailabilityRS` from a `ParkingAvailabilityRQ`, but it will not
> contain any optional elements.

So a failed call is an HTTP 200 carrying a well-formed document of the expected
type, with every optional element missing and an `<Error Code="..."
Message="..."/>` element present.

This is exactly the shape that fails silently. A parser that treats absent
optional fields as "no products available" will render an empty, wrong page and
report success. The client must check for `Error` **before** it looks at
anything else, and must treat "no error element and no products" as a distinct,
loud condition rather than as an empty list.

Full error code table (p191-192):

| Code | Name |
| --- | --- |
| 20 | Reservation not found |
| 21 | Reservation type not recognised |
| 101 | Invalid credentials |
| 102 | Invalid request |
| 103 | Invalid data |
| 104 | Invalid required element |
| 105 | Invalid payment details |
| 106 | Invalid customer details |
| 109 | Invalid availability window |
| 111 | Invalid passenger quantity |
| 112 | Invalid passenger details |
| 113 | Invalid cancellation waiver |
| 201 | Product not available |
| 202 | Product quote invalid |
| 203 | Upgrade maximum redemption reached |
| 301-316 | Booking, cancel, amend, payment and tokenization errors |
| 501 | Contact not found |
| 502 | Contact booking mismatch |
| 503 | Promotion unavailable |
| 900 | Not yet supported |
| 999 | Internal error |

The ones a read-only sync will actually meet are 101, 102, 103, 104, 109, 201,
202, 900 and 999. Of these, **201 Product not available** is the dangerous one,
because it is indistinguishable at the protocol level from "this product is
retired" and from "this product is full on the date you asked about".

## Known failure modes

### 1. Superseded and removed product ids

The specification's own words: `ParkingProductsRQ` "is used to obtain a list of
products that are **currently enabled**" (p37). There is no tombstone, no
`Retired` flag, no `ValidUntil`. When Aeroparker supersedes a product, its id
simply stops appearing in the list, and calls naming that id start returning
error 201 or an empty quote set.

That means a product id stored in our database has three possible states and the
API distinguishes none of them:

| Reality | What we observe |
| --- | --- |
| Product retired and replaced by a new id | id absent from `ParkingProductsRS`; 201 on pricing |
| Product temporarily sold out | present in list; `SoldOut` block in `Appearance` (p42), or 201 |
| Product fine, our window is wrong | 201 |

Design consequence, to be built in Phase 3:

- The sync never deletes. A product that vanishes is marked
  `status = "vermist"` with `laatstGezienOp`, and its last known good price and
  `BookingURL` stay on the page.
- A location page never renders from a product row alone. It renders from the
  last known good snapshot, and the snapshot carries its own age.
- Disappearance is a content problem, not a page failure: flag it in the admin
  and alert, never 500 and never blank the tariff block.
- Because `ParkingProductsRQ` returns the full enabled set, the diff between two
  nightly runs is what detects a supersession. Store each run's id set.

### 2. `ParkingProductId` filtering

`AvailabilityWindow/ParkingProductId` exists in the `AvailabilityWindow` example
and in the data type table on p18, where its description is literally cut off
mid-sentence at the page break:

> `AvailabilityWindow/ParkingProductId` — No — This is used to filter the
> availability request to only include the specified

The sentence never resumes on p19. Worse, the field does **not** appear at all
in the "Example Request Notes – Parking Availability" table on p39, nor in the
`ParkingAvailabilityRQ` example on the same page. So the one documented way to
scope an availability call to a single product is, in the vendor's own current
draft, undefined behaviour.

There is a second, better-specified filter on a different call:
`ParkingAvailabilityUpdateRQ` takes the availability window `Key` plus a
`ParkingProductQuotes/ParkingProductQuote/ParkingProduct/@ID`, and "If not
included all products contained within the availability window previously
provided will be returned" (p44). That is a two-call sequence and it is properly
documented.

And a third on pricing: `ParkingProductPricingRQ/Products` is a space-separated
list of ids, and "if not included pricings for all parking products associated
with the affiliate will be returned" (p145).

Design consequence: **do not use `AvailabilityWindow/ParkingProductId`.** Fetch
the unfiltered availability response and filter in our own code, where the
behaviour is ours and testable. Use `ParkingProductPricingRQ/Products` for
pricing, which is the one filter the document actually defines.

### 3. Two field names the specification contradicts itself on

Both will silently produce `undefined` in a naive parser:

- `CarPark/@Logitude` in the data type table on p25, against `Longitude=` in
  every example (p24, p40, p42, p44, p164). Accept both; prefer `Longitude`.
- `Price/@Original Value` with a space in the table on p25, against
  `OriginalValue=` in every example. Accept both; prefer `OriginalValue`.

A zod schema that fails loudly, as Phase 3 requires, will catch these on the
first run rather than after launch. That is the point of validating.

### 4. The response root element is not reliable

The `ParkingProductsRQ` section on p37-38 shows the **response** wrapped in
`<ParkingProductsRQ>`, not `ParkingProductsRS`. The same section's request
example is missing the closing `>` of its own root tag. Whether this is a
documentation error or the real behaviour is unknown, so the parser must not key
on the root element name. Key on the payload shape instead.

### 5. Airport vocabulary leaking into an urban product

`Terminal` is optional and "can be omitted if the source airport only has one
terminal or if the customer does not know their terminal" (p18). Both
the Basic-auth example (p17) and the `BookingURL` example (p19) use `-1`, which
appears to be the "no terminal" sentinel. Confirm with Aeroparker rather than
assume; sending a wrong terminal id returns 109.

### 6. Smart quotes in the specification's examples

Several examples use typographic quotes, for example `AveragePricePerDay=”10.00”`
(p19, p42) and `<Bundle Id=123>` without quotes at all. These are transcription
errors in the document. They matter only as a warning: do not copy XML out of
this PDF into code or fixtures without normalising it.

## The booking deep link

`ParkingProductQuote/BookingURL` is returned per quote and is the link we send
customers to. Verbatim from p19:

```
https://api.aeroparker.com/book/ABZ/Parking?terminalid=-1&parkingDetailsSubmitted=1
&progressToNextStep=1&entryDate=10-31-2019&exitDate=01-30-2020&entryTime=13:00
&exitTime=10:00&pid=140&selectProductSubmitted=1&apiKey=9d28e9a7-...
```

Observations that will drive `docs/BOOKING-LINKS.md` in Phase 3:

- `entryDate` and `exitDate` are **MM-DD-YYYY**, United States order, while
  every other date in the API is ISO 8601. `10-31-2019` is 31 October. A Dutch
  developer writing `31-10-2019` produces either a wrong date or an error.
- `pid` is the parking product id, `terminalid=-1` the no-terminal sentinel.
- `apiKey` is a UUID embedded in the query string. It is returned by the API and
  must be treated as a credential: never committed, never in a fixture, never in
  a screenshot.
- The path carries a site code (`ABZ` in the example). This is more evidence for
  open question 1.
- A localhost variant appears in the document's link index
  (`http://localhost:8080/Shop/ABZ/Parking?...`), which means the same URL is
  built by string concatenation in Aeroparker. Prefer the `BookingURL` the API
  returns over constructing our own, and fall back to construction only when the
  field is absent, since it is optional (p19).

There is also a post-confirmation redirect (p16): Aeroparker can send the
customer back to a URL of ours carrying `apiKey`, `reference`, `created`,
`carPark`, `status` and a hex SHA-512 `hash` of
`{api-key}:{booking-reference}:{created}:{car-park}:{shared-secret}`. `status`
is one of `Paid`, `Cancel`, `error`. Out of scope for the marketing site, but
worth recording because it is the one place Aeroparker would send personal data
back to us, and that has AVG consequences the PWA project will have to handle.

## Data we will and will not store

Read-only means read-only, but it does not mean we may copy everything.

Store: product id, product name, features, description, terms, logo URI, map
URI, car park id, name, latitude, longitude, prices, savings, sold-out state,
`BookingURL`, response timestamps.

Never store: anything from `CustomerDetails`, `VehicleDetails` (licence plates
are personal data under the AVG), `PaymentDetails`, `InvoiceDetails`,
`LoyaltyDetails`, or any booking reference. The marketing website has no lawful
basis to hold any of it, and the endpoints that return it are all outside our
four.

## Open questions

**1. How many credential sets does ParkingYou have, and what is a "site"?**
The answer decides whether the nightly sync is one loop or thirty-seven, whether
car park ids are globally unique or unique per site, and whether the site code
in `BookingURL` varies per location. Needed before Phase 3. Working assumption
until answered: several sites, car park ids unique only within a site, so every
stored Aeroparker key is `(site, id)` and never a bare id. That assumption is
cheap if wrong and expensive to retrofit if omitted.

**2. Is there a rate limit, and is there a non-production environment?**
The document references `sim.aeroparker.com` for the admin language manager,
which suggests a simulator environment exists. Developing a sync against
production, with no documented limit, is the kind of thing that gets an IP
blocked. Needed before Phase 3.

Neither question blocks Phase 1, which uses typed mock data only.
