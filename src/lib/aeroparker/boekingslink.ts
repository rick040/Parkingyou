import type { AeroparkerSync } from "../content/types";

/**
 * Building the booking deep link.
 *
 * This is the ONLY way this codebase hands a customer to Aeroparker, and it is
 * read-only by construction: a link, not a write. Aeroparker stays the system
 * of record for bookings, products, inventory and pricing.
 *
 * Two rules from docs/AEROPARKER-AUDIT.md shape this file.
 *
 * 1. Prefer the `BookingURL` the API itself returns on each
 *    `ParkingProductQuote`. It is the vendor's own link and it already carries
 *    the right site code and API key. Only build one ourselves when that field
 *    is absent, which the specification allows.
 *
 * 2. The dates in that URL are MM-DD-YYYY, United States order, while every
 *    other date in the API is ISO 8601. `10-31-2019` is 31 October. A Dutch
 *    developer writing `31-10-2019` produces a wrong date or an error, which is
 *    why formatting lives here and nowhere else.
 */

/** The window a visitor picked, in the site's own terms. */
export interface Boekingsvenster {
  /** ISO date, yyyy-mm-dd, as an <input type="date"> gives it. */
  readonly aankomstDatum: string;
  /** 24-hour HH:MM. */
  readonly aankomstTijd: string;
  readonly vertrekDatum: string;
  readonly vertrekTijd: string;
}

export type BoekingslinkResultaat =
  | { readonly soort: "link"; readonly url: string }
  | { readonly soort: "niet-beschikbaar"; readonly reden: string };

/** MM-DD-YYYY, the format the Aeroparker booking URL expects. */
export function naarAeroparkerDatum(isoDatum: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDatum);
  if (m === null) return null;
  const [, jaar, maand, dag] = m;
  if (jaar === undefined || maand === undefined || dag === undefined) return null;
  return `${maand}-${dag}-${jaar}`;
}

/**
 * The base URL and API key are configuration, never literals.
 *
 * The key is a credential: it appears in the query string of every booking URL
 * and it must not be committed. It is only read on the server; the page hands
 * the finished URL to the browser.
 */
function basisConfig(): { basis: string; apiKey: string } | null {
  const basis = process.env.AEROPARKER_BOOKING_BASIS;
  const apiKey = process.env.AEROPARKER_API_KEY;
  if (basis === undefined || apiKey === undefined) return null;
  return { basis, apiKey };
}

/**
 * Resolve the link for a location and a chosen window.
 *
 * Returns a typed "not available" rather than a broken URL when the
 * integration is not configured yet, so the UI can say so plainly instead of
 * sending someone to a 404.
 */
export function bouwBoekingslink(
  sync: AeroparkerSync,
  venster: Boekingsvenster,
): BoekingslinkResultaat {
  const product = sync.producten[0];

  // Path 1, preferred: the URL Aeroparker returned for this product.
  if (product?.boekingUrl != null && product.boekingUrl !== "") {
    return { soort: "link", url: product.boekingUrl };
  }

  // Path 2: build one. Only possible with configuration and a real product id.
  const config = basisConfig();
  if (config === null) {
    return {
      soort: "niet-beschikbaar",
      reden:
        "De koppeling met het reserveringssysteem is nog niet ingesteld voor deze locatie.",
    };
  }

  const pid = product?.productId;
  if (pid === undefined || pid.startsWith("{{")) {
    return {
      soort: "niet-beschikbaar",
      reden:
        "Voor deze locatie is nog geen parkeerproduct gekoppeld, dus we kunnen je nog niet doorsturen.",
    };
  }

  const entryDate = naarAeroparkerDatum(venster.aankomstDatum);
  const exitDate = naarAeroparkerDatum(venster.vertrekDatum);
  if (entryDate === null || exitDate === null) {
    return { soort: "niet-beschikbaar", reden: "De gekozen datum klopt niet." };
  }

  const params = new URLSearchParams({
    // -1 is the no-terminal sentinel. ParkingYou is urban parking; the API is
    // written for airports and expects a terminal id on every request.
    terminalid: "-1",
    parkingDetailsSubmitted: "1",
    progressToNextStep: "1",
    selectProductSubmitted: "1",
    entryDate,
    exitDate,
    entryTime: venster.aankomstTijd,
    exitTime: venster.vertrekTijd,
    pid,
    apiKey: config.apiKey,
  });

  return {
    soort: "link",
    url: `${config.basis.replace(/\/$/, "")}/${sync.site}/Parking?${params.toString()}`,
  };
}

/** A sane default window: tomorrow, 09:00 to 17:00. */
export function standaardVenster(vandaag: Date = new Date()): Boekingsvenster {
  const morgen = new Date(vandaag);
  morgen.setDate(morgen.getDate() + 1);
  const iso = morgen.toISOString().slice(0, 10);
  return {
    aankomstDatum: iso,
    aankomstTijd: "09:00",
    vertrekDatum: iso,
    vertrekTijd: "17:00",
  };
}

/** Does the window make sense? Returns a Dutch message, or null when it does. */
export function controleerVenster(venster: Boekingsvenster): string | null {
  const start = Date.parse(`${venster.aankomstDatum}T${venster.aankomstTijd}`);
  const eind = Date.parse(`${venster.vertrekDatum}T${venster.vertrekTijd}`);
  if (Number.isNaN(start) || Number.isNaN(eind)) {
    return "Vul een geldige datum en tijd in.";
  }
  if (eind <= start) {
    return "De eindtijd moet na de starttijd liggen.";
  }
  return null;
}
