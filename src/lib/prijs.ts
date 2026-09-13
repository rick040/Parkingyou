import type { AeroparkerSync, Locatie } from "./content/types";

/**
 * The price a location page shows, and why.
 *
 * This replaces the legacy site's approach, which fetched a price per location
 * from the browser and then decided what the response meant by inspecting the
 * string:
 *
 *   const priceFound = (returnData && returnData != '' && returnData != '-1'
 *                       && !returnData.includes('error')) ? true : false;
 *
 * That has two failure modes. A product legitimately containing the word
 * "error" in its name reads as a failure, and any malformed success reads as a
 * price. See docs/LEGACY-BEHAVIOUR.md.
 *
 * Here the result is a discriminated union, so every caller has to handle the
 * fallback case and the compiler says so.
 */
export type PrijsResultaat =
  | {
      readonly soort: "vanaf";
      readonly bedrag: number;
      readonly valuta: string;
      /** The sync that produced this, so the UI can show how old it is. */
      readonly laatsteSync: string;
      readonly gedimd: false;
    }
  | {
      readonly soort: "laatst-bekend";
      readonly bedrag: number;
      readonly valuta: string;
      readonly laatsteSync: string;
      /** Dutch, because it is shown to a visitor as well as to an editor. */
      readonly reden: string;
      readonly gedimd: true;
    }
  | {
      readonly soort: "onbekend";
      readonly reden: string;
      readonly gedimd: true;
    };

/**
 * Resolve what to show for a location.
 *
 * The rule from docs/AEROPARKER-AUDIT.md: a broken or superseded product id
 * must never take a page down and must never show a wrong price. So a missing
 * product falls back to the last known good value, clearly labelled, rather
 * than blanking the tariff block.
 */
export function bepaalPrijs(sync: AeroparkerSync): PrijsResultaat {
  const valuta = sync.producten[0]?.valuta ?? "EUR";

  if (sync.vanafPrijs === null) {
    return {
      soort: "onbekend",
      reden:
        sync.syncMelding ??
        "We konden de prijs niet ophalen. Bekijk het actuele tarief bij het reserveren.",
      gedimd: true,
    };
  }

  if (sync.syncStatus === "ok") {
    return {
      soort: "vanaf",
      bedrag: sync.vanafPrijs,
      valuta,
      laatsteSync: sync.laatsteSync,
      gedimd: false,
    };
  }

  return {
    soort: "laatst-bekend",
    bedrag: sync.vanafPrijs,
    valuta,
    laatsteSync: sync.laatsteSync,
    reden:
      sync.syncMelding ??
      "Dit is de laatst bekende prijs. Het actuele tarief zie je bij het reserveren.",
    gedimd: true,
  };
}

/** Dutch formatting: a comma for the decimal separator, and a non-breaking space. */
export function formatteerBedrag(bedrag: number, valuta: string): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: valuta,
    minimumFractionDigits: 2,
  }).format(bedrag);
}

/** The short label that sits on a map marker. Kept tight; space is scarce. */
export function markerLabel(resultaat: PrijsResultaat): string {
  if (resultaat.soort === "onbekend") {
    return "Prijs op aanvraag";
  }
  return `vanaf ${formatteerBedrag(resultaat.bedrag, resultaat.valuta)}`;
}

export interface LocatieMetPrijs {
  readonly locatie: Locatie;
  readonly prijs: PrijsResultaat;
}

export function metPrijzen(
  locaties: readonly Locatie[],
): readonly LocatieMetPrijs[] {
  return locaties.map((locatie) => ({
    locatie,
    prijs: bepaalPrijs(locatie.aeroparker),
  }));
}
