import type { PrijsResultaat } from "@/lib/prijs";
import { formatteerBedrag } from "@/lib/prijs";

interface TariefBlokProps {
  readonly prijs: PrijsResultaat;
  readonly locatieNaam: string;
}

/** Dutch date, for "laatst bijgewerkt op ...". */
function formatteerDatum(iso: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

/**
 * The tariff and the booking call to action.
 *
 * The rule from docs/AEROPARKER-AUDIT.md, made visible: a superseded or removed
 * Aeroparker product must never take this page down and must never show a wrong
 * price. So the three states are all renderable, and none of them is an empty
 * block.
 *
 * The price is always "vanaf". The website renders from a nightly snapshot, so
 * by definition the number can be up to a day old; the binding price is the one
 * Aeroparker itself shows after the deep link. Saying "vanaf" is not hedging,
 * it is the only honest claim this page can make.
 */
export function TariefBlok({ prijs, locatieNaam }: TariefBlokProps) {
  return (
    <section
      className="mt-6 rounded-py border border-py-line bg-py-paper p-4 sm:p-5"
      aria-label="Tarief en reserveren"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {prijs.soort === "onbekend" ? (
            <p className="m-0 text-xl font-bold text-py-text">
              Prijs op aanvraag
            </p>
          ) : (
            <>
              <span className="block text-sm text-py-muted">Parkeren vanaf</span>
              <span
                className={[
                  "block text-3xl font-bold leading-tight",
                  prijs.gedimd ? "text-py-muted" : "text-py-blue",
                ].join(" ")}
              >
                {formatteerBedrag(prijs.bedrag, prijs.valuta)}
              </span>
              <span className="mt-1 block text-xs text-py-muted">
                Bijgewerkt op {formatteerDatum(prijs.laatsteSync)}. Het definitieve
                tarief zie je bij het reserveren.
              </span>
            </>
          )}
        </div>

        {/*
          The CTA is never disabled by a sync failure. Aeroparker is the system
          of record and can still take the booking even when our snapshot is
          stale, so blocking the button would cost a sale for our problem.

          {{TODO-NL: deep link naar Aeroparker koppelen, zie docs/BOOKING-LINKS.md in fase 3}}
        */}
        <a
          href="#reserveren"
          className="inline-block rounded-py bg-py-orange px-5 py-3 text-base font-bold text-white no-underline hover:brightness-95"
          aria-label={`Reserveer een plek bij ${locatieNaam}`}
        >
          Reserveer een plek
        </a>
      </div>

      {prijs.soort === "laatst-bekend" || prijs.soort === "onbekend" ? (
        <p
          className="mt-4 mb-0 rounded-py border border-py-line bg-py-surface p-3 text-sm text-py-muted"
          role="status"
        >
          {prijs.reden}
        </p>
      ) : null}
    </section>
  );
}
