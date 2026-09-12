"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";
import type { Locatie } from "@/lib/content/types";
import type { PrijsResultaat } from "@/lib/prijs";

const ParkeerKaart = dynamic(
  () => import("./ParkeerKaart").then((mod) => mod.ParkeerKaart),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-py-paper" aria-hidden="true" />
    ),
  },
);

interface LocatieDetailKaartProps {
  readonly locatie: Locatie;
  readonly prijs: PrijsResultaat;
}

/**
 * A single-pin map on the location page, reusing the city map component so the
 * marker treatment cannot drift between the two views.
 */
export function LocatieDetailKaart({ locatie, prijs }: LocatieDetailKaartProps) {
  const negeerSelectie = useCallback(() => {}, []);

  return (
    <ParkeerKaart
      middelpunt={locatie.coordinaten}
      locaties={[{ locatie, prijs }]}
      actieveSlug={locatie.slug}
      onSelecteer={negeerSelectie}
    />
  );
}
