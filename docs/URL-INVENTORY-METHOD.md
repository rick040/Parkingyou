# URL inventory: method, coverage and what is still missing

Annex to `docs/URL-INVENTORY.csv`. Read this before anyone treats that file as
complete, because it is not, and the reason matters.

## What I could not do

The phase brief said to crawl parkingyou.nl. **I could not.** This session runs
behind an egress proxy that refuses the host:

```
$ curl -sS -m 30 -o robots.txt -w "HTTP %{http_code}\n" https://www.parkingyou.nl/robots.txt
curl: (56) CONNECT tunnel failed, response 403
HTTP 000

[agent-proxy] parkingyou.nl:443 — connect_rejected
(the egress proxy denied the CONNECT (organization policy) or could not reach the destination)
```

The same host is blocked through the fetch tool:

```
{"error_type":"EGRESS_BLOCKED","domain":"parkingyou.nl",
 "message":"Access to parkingyou.nl is blocked by the network egress proxy."}
```

So `robots.txt`, `sitemap.xml`, live status codes and the real page inventory
were all unreachable. No crawl happened and the CSV does not pretend one did.

## What I did instead

I enumerated the URLs a search engine has actually indexed, using nine
site-scoped searches across the sections of the site (locations, cities, news,
business, products, legal, support). That produces the subset of URLs that are
indexed and therefore the subset that carries ranking value, which is the subset
that matters most for a redirect map. It does not produce URLs that exist but
rank for nothing, and it does not produce the long tail.

74 distinct URLs across 26 page types. Treat that as a representative sample of
the shapes, not as the population.

## What the sample proves about the old site

Four structural problems, each visible in the data and each a reason the
redirect map cannot be a hand-written list:

**1. One page has several URLs.** Amsterdam Parking B2 is indexed at both
`/nl/locaties/amsterdam/amsterdam-parking-b2/id=67` and
`/nl/locaties/amsterdam-parking-b2/id=67`. Tilburg Spoorzone P1 is indexed at
`/locaties/parking-spoorzone-p1-tilburg/id=3` with no language prefix and no
city segment at all. The city segment and the language prefix are both optional
in practice.

**2. One city has several slugs.** Eindhoven locations are indexed under both
`/nl/locaties/eindhoven/` and `/nl/locaties/parkeren-eindhoven/`. Two city pages
competing for the same query is split authority, and it is why `parkeren-eindhoven`
gets a 301 rather than a canonical tag.

**3. The site is a crawl trap.** Visited sections accumulate as path segments:

```
/nl/producten/klantenservice/werken-bij-parkingyou/producten
/nl/klantenservice/nieuws/producten/werken-bij-parkingyou/klantenservice/team
```

Both are indexed. The URL space is unbounded, which means crawl budget is being
spent on permutations instead of on the 37 location pages that earn money. This
alone justifies the rebuild.

**4. State is encoded as path segments, not query strings.**
`/nl/parkeren/location=7/city=3`, `/nl/strippenkaarten/location=5/credits=25`,
`/nl/news/klantenservice/p=3`, `/nl/language=en`, and the `id=` and `cid=`
suffixes throughout. A `?`-based parameter can be handled with a canonical tag
and Search Console parameter rules. A path segment cannot: every combination is
a distinct document. The `/nl/language=en` page is the worst of them, because it
is indexed and its title still says **Voordeligparkeren.nl**, the pre-rebrand
domain.

## The redirect map has to be rules, not rows

Because of points 1, 3 and 4, a redirect table with one row per known URL will
miss more than it catches. Phase 4 implements ordered pattern rules, with the
CSV as the test corpus rather than as the implementation:

1. Exact matches first, from the CSV, for every page whose new slug differs from
   a mechanical transformation.
2. `^/(nl/)?locaties/([^/]+)/([^/]+)/id=\d+$` → `/parkeren/{city}/{slug}`.
3. `^/(nl/)?locaties/([^/]+)/id=\d+$` → resolve the location by its old id and
   redirect to its full path. Needs an `oudeId` field on the location, which is
   why `docs/CONTENT-MODEL.md` has one.
4. `^/(nl/)?locaties/([^/]+)/cid=\d+$` → `/parkeren/{city}`.
5. `^/(nl/)?nieuws/([^/]+)/id=\d+$` → resolve by old id, same as 3.
6. Anything matching a known section segment more than twice, the crawl trap, →
   the section root.
7. `^/(nl|en)/` with no other rule → strip the prefix and re-resolve once.
8. Everything else → a 410 for known-dead patterns, a 404 otherwise. Never a
   blanket redirect to the homepage: it is a soft 404 to Google and it passes no
   value.

Rule 3 and rule 5 are the reason the content model stores the old numeric id.
Without it, roughly a third of the indexed URLs cannot be resolved at all.

## What must happen before Phase 4 implements this

The CSV is the starting corpus, not the finished map. Before the redirect work,
somebody with access has to export:

1. **Google Search Console**, Pages report, last 16 months, all indexed URLs
   plus their clicks and impressions. This is the authoritative list and it is
   the only source that says which URLs are worth protecting.
2. **The current sitemap.xml**, if the proprietary CMS emits one.
3. **Server access logs**, 90 days, for URLs that receive traffic but rank for
   nothing, including inbound links from partners.
4. **The 37 live location records** from the old CMS, so every location has its
   old id, old slug, city and trading name confirmed rather than inferred.

I can produce the complete map in an hour once those four exports exist. Without
them, any claim that the redirect map is complete would be false.

## Accuracy caveats on the rows themselves

- Every `old_url` in the CSV is written with the `/nl/` prefix, but several were
  observed in the index with `/en/`. Both resolve to the same page on the old
  site. The redirect rules strip the prefix, so this does not change behaviour;
  it does mean the CSV under-counts by roughly a factor of two.
- `proposed_new_url` is empty where the old URL has no equivalent on the new
  site, for example the crawl-trap and parameter URLs. Those rows still have a
  `redirect_target`, which is what the 301 rule needs.
- Slugs marked `medium` confidence are ones where the old slug and the page
  title disagree, for example `parking-onyx` titled "Parking Victoriapark". A
  slug is permanent, so these need a human answer, not a guess.
