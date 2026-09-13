/**
 * Map configuration.
 *
 * The legacy site uses the Google Maps JS API with an API key in the page
 * source. That is excluded here on two grounds: the project constraints rule
 * out Google Maps, and every tile request sends the visitor's IP and viewport
 * to a United States service, against the EU data residency requirement.
 *
 * PDOK is the Dutch Kadaster's open geo platform. It needs no API key, has no
 * per-view cost, and is EU-hosted. Its attribution is a licence condition, so
 * ATTRIBUTIE below is not optional decoration.
 */

/**
 * BRT Achtergrondkaart, raster WMTS.
 *
 * Raster rather than vector on purpose for the first iteration: one fewer
 * moving part, and a vector style adds a style JSON whose schema we would also
 * have to pin. Switching to PDOK vector tiles later is a change to this file
 * only.
 *
 * Overridable so a preview can be pointed at a different tile source without a
 * code change.
 */
export const TEGEL_URL =
  process.env.NEXT_PUBLIC_KAART_TEGELS ??
  "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png";

export const ATTRIBUTIE =
  '&copy; <a href="https://www.kadaster.nl" target="_blank" rel="noopener">Kadaster</a> / PDOK';

export const TEGEL_GROOTTE = 256;
export const MAX_ZOOM = 19;

/** Matches the legacy default view so the map feels familiar. */
export const STANDAARD_ZOOM = 14;

/**
 * One finger pans the map on a phone, as on the legacy site
 * (`gestureHandling: "greedy"`). MapLibre calls this cooperative gestures, and
 * leaving it off is the equivalent of greedy.
 */
export const COOPERATIEVE_GEBAREN = false;
