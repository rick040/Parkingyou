"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { Stad } from "@/lib/content/types";
import type { LocatieMetPrijs } from "@/lib/prijs";
import { LocatieKaartje } from "./LocatieKaartje";

/*
 * The map is client-only. It touches window during construction, and there is
 * nothing useful to server-render for a canvas.
 */
const ParkeerKaart = dynamic(
  () => import("./ParkeerKaart").then((mod) => mod.ParkeerKaart),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-py-paper" aria-hidden="true" />
    ),
  },
);

interface StadOverzichtProps {
  readonly stad: Stad;
  readonly locaties: readonly LocatieMetPrijs[];
}

export function StadOverzicht({ stad, locaties }: StadOverzichtProps) {
  const [actieveSlug, setActieveSlug] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6 lg:flex-row-reverse lg:items-start">
      <div className="h-[320px] w-full overflow-hidden rounded-py border border-py-line sm:h-[420px] lg:sticky lg:top-6 lg:h-[560px] lg:w-1/2">
        <ParkeerKaart
          middelpunt={stad.coordinaten}
          locaties={locaties}
          actieveSlug={actieveSlug}
          onSelecteer={setActieveSlug}
        />
      </div>

      <ul className="flex w-full list-none flex-col gap-3 p-0 lg:w-1/2">
        {locaties.map((item) => (
          <li key={item.locatie.slug}>
            <LocatieKaartje
              item={item}
              actief={item.locatie.slug === actieveSlug}
              onHover={() => setActieveSlug(item.locatie.slug)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
