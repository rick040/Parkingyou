import Link from "next/link";
import type { LocatieMetPrijs } from "@/lib/prijs";
import { formatteerBedrag } from "@/lib/prijs";

interface LocatieKaartjeProps {
  readonly item: LocatieMetPrijs;
  readonly actief: boolean;
  readonly onHover: () => void;
}

/**
 * One location in the city list.
 *
 * The dimmed treatment mirrors the map marker and comes from the same typed
 * result, so the two can never disagree. On the legacy site the list and the
 * marker are dimmed by two separate jQuery calls against two separate copies of
 * the response.
 */
export function LocatieKaartje({ item, actief, onHover }: LocatieKaartjeProps) {
  const { locatie, prijs } = item;

  return (
    <article
      onMouseEnter={onHover}
      onFocusCapture={onHover}
      className={[
        "rounded-py border bg-py-surface p-4 transition-colors",
        actief ? "border-py-orange" : "border-py-line",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="m-0 text-base font-bold text-py-text">
            <Link
              href={`/parkeren/${locatie.stad}/${locatie.slug}`}
              className="no-underline hover:underline"
            >
              {locatie.naam}
            </Link>
          </h3>
          <p className="mt-1 mb-0 text-sm text-py-muted">{locatie.intro}</p>
        </div>

        <div className="shrink-0 text-right">
          {prijs.soort === "onbekend" ? (
            <span className="text-sm font-medium text-py-muted">
              Prijs op aanvraag
            </span>
          ) : (
            <>
              <span className="block text-xs text-py-muted">vanaf</span>
              <span
                className={[
                  "block text-lg font-bold leading-tight",
                  prijs.gedimd ? "text-py-muted" : "text-py-blue",
                ].join(" ")}
              >
                {formatteerBedrag(prijs.bedrag, prijs.valuta)}
              </span>
            </>
          )}
        </div>
      </div>

      {locatie.uren.open247 ? (
        <p className="mt-3 mb-0 text-sm text-py-ok">Dag en nacht open</p>
      ) : null}

      {/*
        The failure path, visible rather than hidden. A superseded Aeroparker
        product must never blank the tariff or take the page down; it shows the
        last known price and says so.
      */}
      {prijs.soort === "laatst-bekend" || prijs.soort === "onbekend" ? (
        <p className="mt-3 mb-0 rounded-py bg-py-paper p-3 text-sm text-py-muted">
          {prijs.reden}
        </p>
      ) : null}
    </article>
  );
}
