import locatiesData from "../../../content/locaties.json";
import stedenData from "../../../content/steden.json";
import type { Locatie, Stad } from "./types";

/**
 * Phase 1 content source: typed mock JSON. No CMS, no database.
 *
 * In Phase 2 these functions keep their signatures and their bodies become
 * Payload queries, so nothing that consumes them has to change.
 */

const steden: readonly Stad[] = stedenData as readonly Stad[];
const locaties: readonly Locatie[] = locatiesData as readonly Locatie[];

export function alleSteden(): readonly Stad[] {
  return steden;
}

export function stadBySlug(slug: string): Stad | undefined {
  return steden.find((stad) => stad.slug === slug);
}

export function alleLocaties(): readonly Locatie[] {
  return locaties;
}

/**
 * Locations in a city.
 *
 * This is a query, not a hand-maintained list, which is what makes the IA's
 * "no orphans" rule mechanical: a new location appears on its city page the
 * moment it is published, without an editor remembering to link it.
 */
export function locatiesInStad(stadSlug: string): readonly Locatie[] {
  return locaties.filter((locatie) => locatie.stad === stadSlug);
}

/** Slugs are unique per city, not globally, so both parts are required. */
export function locatieBySlug(
  stadSlug: string,
  locatieSlug: string,
): Locatie | undefined {
  return locaties.find(
    (locatie) => locatie.stad === stadSlug && locatie.slug === locatieSlug,
  );
}

export type { Locatie, Stad };
