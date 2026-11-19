"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PyButton } from "@/components/py/Button";
import { Icon } from "@/components/py/Icon";
import type { Stad } from "@/lib/content/types";
import type { LocatieMetPrijs } from "@/lib/prijs";
import { formatteerBedrag } from "@/lib/prijs";
import { ReserveerDrawer } from "./ReserveerDrawer";

const ParkeerKaart = dynamic(
  () => import("@/components/ParkeerKaart").then((mod) => mod.ParkeerKaart),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse bg-py-paper" aria-hidden="true" />
    ),
  },
);

interface LocatiesOverzichtProps {
  readonly steden: readonly Stad[];
  readonly locaties: readonly LocatieMetPrijs[];
  /** Centre of the Netherlands, for the unfiltered view. */
  readonly middelpunt: { readonly lat: number; readonly lng: number };
}

/**
 * Every location on one interactive map, with a city filter and a search box.
 *
 * This is the page the old site's `/nl/parkeren` search does, rebuilt: pick a
 * city, see the garages, pick one, book. The difference is that the old site
 * fetched a price per garage from the browser on every view; here the prices
 * come from the nightly snapshot and the page needs no third-party call to
 * render.
 */
export function LocatiesOverzicht({
  steden,
  locaties,
  middelpunt,
}: LocatiesOverzichtProps) {
  const [stadSlug, setStadSlug] = useState<string | null>(null);
  const [zoek, setZoek] = useState("");
  const [actieveSlug, setActieveSlug] = useState<string | null>(null);
  const [reserveerSlug, setReserveerSlug] = useState<string | null>(null);

  const zichtbaar = useMemo(() => {
    const term = zoek.trim().toLowerCase();
    return locaties.filter(({ locatie }) => {
      if (stadSlug !== null && locatie.stad !== stadSlug) return false;
      if (term === "") return true;
      return (
        locatie.naam.toLowerCase().includes(term) ||
        locatie.adres.plaats.toLowerCase().includes(term) ||
        locatie.intro.toLowerCase().includes(term)
      );
    });
  }, [locaties, stadSlug, zoek]);

  const gekozenStad = steden.find((s) => s.slug === stadSlug);
  const kaartMiddelpunt = gekozenStad?.coordinaten ?? middelpunt;
  const teReserveren = zichtbaar.find(
    (item) => item.locatie.slug === reserveerSlug,
  );

  return (
    <>
      <div className="py-locaties-filters">
        <label className="py-locaties-zoek">
          <Icon name="search" size={18} />
          <input
            type="search"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoek op garage of plaats"
            aria-label="Zoek een parkeerlocatie"
          />
        </label>

        <div className="py-locaties-steden" role="group" aria-label="Filter op stad">
          <button
            type="button"
            className={stadSlug === null ? "is-active" : ""}
            aria-pressed={stadSlug === null}
            onClick={() => setStadSlug(null)}
          >
            Alle steden
          </button>
          {steden.map((stad) => (
            <button
              type="button"
              key={stad.slug}
              className={stadSlug === stad.slug ? "is-active" : ""}
              aria-pressed={stadSlug === stad.slug}
              onClick={() => setStadSlug(stad.slug)}
            >
              {stad.naam}
            </button>
          ))}
        </div>
      </div>

      <p className="py-locaties-telling" role="status">
        {zichtbaar.length === 0
          ? "Geen locaties gevonden. Pas je zoekopdracht aan."
          : `${zichtbaar.length} ${zichtbaar.length === 1 ? "locatie" : "locaties"}`}
      </p>

      <div className="py-locaties-layout">
        <div className="py-locaties-kaart">
          {zichtbaar.length > 0 ? (
            <ParkeerKaart
              key={stadSlug ?? "alle"}
              middelpunt={kaartMiddelpunt}
              locaties={zichtbaar}
              actieveSlug={actieveSlug}
              onSelecteer={setActieveSlug}
            />
          ) : null}
        </div>

        <ul className="py-locaties-lijst">
          {zichtbaar.map(({ locatie, prijs }) => (
            <li key={`${locatie.stad}/${locatie.slug}`}>
              <article
                className={`py-locatie-rij ${
                  actieveSlug === locatie.slug ? "is-active" : ""
                }`}
                onMouseEnter={() => setActieveSlug(locatie.slug)}
                onFocusCapture={() => setActieveSlug(locatie.slug)}
              >
                <div className="py-locatie-rij__info">
                  <h3>
                    <Link href={`/parkeren/${locatie.stad}/${locatie.slug}`}>
                      {locatie.naam}
                    </Link>
                  </h3>
                  <span className="py-locatie-rij__plaats">
                    <Icon name="pin" size={14} /> {locatie.adres.plaats}
                    {locatie.uren.open247 ? " · 24/7 open" : ""}
                  </span>
                  <p>{locatie.intro}</p>
                </div>

                <div className="py-locatie-rij__actie">
                  {prijs.soort === "onbekend" ? (
                    <span className="py-locatie-rij__geenprijs">
                      Prijs op aanvraag
                    </span>
                  ) : (
                    <span className="py-locatie-rij__prijs">
                      <small>vanaf</small>
                      <strong className={prijs.gedimd ? "is-gedimd" : ""}>
                        {formatteerBedrag(prijs.bedrag, prijs.valuta)}
                      </strong>
                    </span>
                  )}
                  <PyButton
                    onClick={() => setReserveerSlug(locatie.slug)}
                    variant="primary"
                  >
                    Reserveer
                  </PyButton>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>

      {teReserveren === undefined ? null : (
        <ReserveerDrawer
          item={teReserveren}
          onSluit={() => setReserveerSlug(null)}
        />
      )}
    </>
  );
}
