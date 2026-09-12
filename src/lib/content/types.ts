/**
 * Content types for the marketing website.
 *
 * Field names are the Dutch ones from docs/CONTENT-MODEL.md, deliberately, so
 * the Phase 2 Payload seed script is a read and a write rather than a
 * translation layer.
 *
 * Every type is split the same way the content model is:
 *   - editorial fields, written by a business user;
 *   - `AeroparkerSync`, written only by the nightly sync and read-only in the
 *     admin;
 *   - system fields such as `oudeId`, which the redirect map needs.
 */

/** Aeroparker is the system of record. Nothing here is ever written back. */
export type SyncStatus = "ok" | "verouderd" | "vermist" | "fout";

/**
 * One parking product as the nightly sync last saw it.
 *
 * `boekingUrl` is Aeroparker's own `ParkingProductQuote/BookingURL`. We prefer
 * the URL the API returns over building one ourselves, because the field is
 * optional and its date format is MM-DD-YYYY while the rest of the API is
 * ISO 8601. See docs/AEROPARKER-AUDIT.md.
 */
export interface AeroparkerProduct {
  /** Aeroparker `ParkingProduct/@ID`, unique only within a site. */
  readonly productId: string;
  readonly naam: string;
  readonly vanafPrijs: number;
  readonly valuta: string;
  /** True when Aeroparker returned a `SoldOut` block for this product. */
  readonly uitverkocht: boolean;
  readonly boekingUrl: string | null;
}

export interface AeroparkerSync {
  /**
   * Which credential set owns this car park. One Aeroparker credential pair
   * grants access to one site, so a bare id is not unique across ParkingYou.
   * Always key on (site, carParkId).
   */
  readonly site: string;
  readonly carParkId: string;
  readonly producten: readonly AeroparkerProduct[];
  /** Lowest product price. Only ever rendered with the word "vanaf". */
  readonly vanafPrijs: number | null;
  readonly laatsteSync: string;
  readonly syncStatus: SyncStatus;
  /** Dutch explanation shown to an editor when the status is not ok. */
  readonly syncMelding: string | null;
}

export interface Openingstijd {
  readonly dag: string;
  readonly van: string;
  readonly tot: string;
}

export interface Adres {
  readonly straat: string;
  readonly huisnummer: string;
  readonly postcode: string;
  readonly plaats: string;
}

export interface Coordinaat {
  readonly lat: number;
  readonly lng: number;
}

export type Voorziening =
  | "laadpunt"
  | "camerabewaking"
  | "overdekt"
  | "invalidenplaats"
  | "fietsenstalling"
  | "kentekenherkenning";

export interface Locatie {
  readonly slug: string;
  readonly stad: string;
  readonly naam: string;
  readonly intro: string;
  readonly adres: Adres;
  /**
   * The editorial pin, which is where we send a visitor. Aeroparker's own
   * CarPark latitude and longitude describe the barrier, which is sometimes
   * round the back of the building, so the two are kept apart on purpose.
   */
  readonly coordinaten: Coordinaat;
  readonly is24Uur: boolean;
  readonly openingstijden: readonly Openingstijd[];
  readonly voorzieningen: readonly Voorziening[];
  readonly maximaleHoogte: number | null;
  readonly aantalPlaatsen: number | null;
  readonly inrit: string;
  readonly uitrit: string;
  readonly route: string;
  readonly aeroparker: AeroparkerSync;
  /** Old CMS `id=`. A third of the redirect map cannot resolve without it. */
  readonly oudeId: number;
}

export interface Stad {
  readonly slug: string;
  readonly naam: string;
  readonly intro: string;
  readonly isRegio: boolean;
  /** Map centring only; this is not a location. */
  readonly coordinaten: Coordinaat;
  /** Old CMS `cid=`, confirmed from the live site footer. */
  readonly oudeCid: number;
}
