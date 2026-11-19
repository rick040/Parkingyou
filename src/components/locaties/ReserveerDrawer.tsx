"use client";

import { useEffect, useRef, useState } from "react";
import { PyButton } from "@/components/py/Button";
import { Icon } from "@/components/py/Icon";
import {
  controleerVenster,
  standaardVenster,
  type Boekingsvenster,
} from "@/lib/aeroparker/boekingslink";
import type { LocatieMetPrijs } from "@/lib/prijs";
import { formatteerBedrag } from "@/lib/prijs";

interface ReserveerDrawerProps {
  readonly item: LocatieMetPrijs;
  readonly onSluit: () => void;
}

const STAPPEN = ["Datum & tijd", "Controleren", "Reserveren"] as const;

/**
 * The reservation flow, ported from legacy-prototype/ReservationWizard.jsx.
 *
 * One deliberate and important change. The prototype's step 3 collects a
 * licence plate, a name and an email address, and step 4 shows a confirmation,
 * which means this codebase would be taking the booking. Two reasons it does
 * not do that:
 *
 *   - the project constraint is explicit that Aeroparker is the system of
 *     record and is never written to from here;
 *   - a licence plate is personal data under the AVG, and a marketing site that
 *     collects one needs a lawful basis, a processor agreement and a retention
 *     policy it has no reason to have.
 *
 * So the flow stops at the handover: pick a location, pick a window, check it,
 * and continue in Aeroparker with everything prefilled. The customer enters
 * their details once, in the system that actually holds the booking.
 *
 * The seam is src/lib/aeroparker/boekingslink.ts. When the Phase 3 sync starts
 * populating `boekingUrl` per product, this component needs no change.
 */
export function ReserveerDrawer({ item, onSluit }: ReserveerDrawerProps) {
  const { locatie, prijs } = item;
  const [stap, setStap] = useState(0);
  const [venster, setVenster] = useState<Boekingsvenster>(() => standaardVenster());
  const [link, setLink] = useState<
    { soort: "laden" } | { soort: "link"; url: string } | { soort: "fout"; reden: string } | null
  >(null);
  const sluitRef = useRef<HTMLButtonElement | null>(null);

  const fout = controleerVenster(venster);

  // Focus the close button on open, and close on Escape. A drawer that traps
  // someone with no keyboard way out is worse than no drawer.
  useEffect(() => {
    sluitRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSluit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSluit]);

  function zet<K extends keyof Boekingsvenster>(
    sleutel: K,
    waarde: Boekingsvenster[K],
  ) {
    setVenster((v) => ({ ...v, [sleutel]: waarde }));
  }

  async function vraagLink() {
    setStap(2);
    setLink({ soort: "laden" });
    try {
      const res = await fetch("/api/boekingslink", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          stad: locatie.stad,
          locatie: locatie.slug,
          venster,
        }),
      });
      const data: unknown = await res.json();
      if (
        typeof data === "object" &&
        data !== null &&
        "soort" in data &&
        (data as { soort: unknown }).soort === "link" &&
        "url" in data &&
        typeof (data as { url: unknown }).url === "string"
      ) {
        setLink({ soort: "link", url: (data as { url: string }).url });
        return;
      }
      const reden =
        typeof data === "object" && data !== null && "reden" in data &&
        typeof (data as { reden: unknown }).reden === "string"
          ? (data as { reden: string }).reden
          : "We konden je niet doorsturen naar het reserveringssysteem.";
      setLink({ soort: "fout", reden });
    } catch {
      setLink({
        soort: "fout",
        reden: "We konden het reserveringssysteem nu niet bereiken. Probeer het zo nog eens.",
      });
    }
  }

  return (
    <div className="py-drawer-overlay" onClick={onSluit} role="presentation">
      <aside
        className="py-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Reserveren bij ${locatie.naam}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="py-drawer__kop">
          <div>
            <small>Reserveren bij</small>
            <strong>{locatie.naam}</strong>
            <span>{locatie.adres.plaats}</span>
          </div>
          <button
            type="button"
            ref={sluitRef}
            className="py-drawer__sluit"
            onClick={onSluit}
            aria-label="Sluiten"
          >
            <Icon name="x" size={22} />
          </button>
        </header>

        <ol className="py-drawer__stappen">
          {STAPPEN.map((label, i) => (
            <li
              key={label}
              className={[i === stap ? "is-active" : "", i < stap ? "is-done" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <span>{i < stap ? <Icon name="check" size={13} /> : i + 1}</span>
              {label}
            </li>
          ))}
        </ol>

        <div className="py-drawer__inhoud">
          {stap === 0 ? (
            <fieldset>
              <legend>Wanneer wil je parkeren?</legend>
              <div className="py-drawer__velden">
                <label>
                  Aankomst
                  <input
                    type="date"
                    value={venster.aankomstDatum}
                    onChange={(e) => zet("aankomstDatum", e.target.value)}
                  />
                </label>
                <label>
                  Tijd
                  <input
                    type="time"
                    value={venster.aankomstTijd}
                    onChange={(e) => zet("aankomstTijd", e.target.value)}
                  />
                </label>
                <label>
                  Vertrek
                  <input
                    type="date"
                    value={venster.vertrekDatum}
                    onChange={(e) => zet("vertrekDatum", e.target.value)}
                  />
                </label>
                <label>
                  Tijd
                  <input
                    type="time"
                    value={venster.vertrekTijd}
                    onChange={(e) => zet("vertrekTijd", e.target.value)}
                  />
                </label>
              </div>
              {fout === null ? null : (
                <p className="py-drawer__fout" role="alert">
                  {fout}
                </p>
              )}
            </fieldset>
          ) : null}

          {stap === 1 ? (
            <div className="py-drawer__overzicht">
              <dl>
                <div>
                  <dt>Locatie</dt>
                  <dd>{locatie.naam}</dd>
                </div>
                <div>
                  <dt>Aankomst</dt>
                  <dd>
                    {venster.aankomstDatum} om {venster.aankomstTijd}
                  </dd>
                </div>
                <div>
                  <dt>Vertrek</dt>
                  <dd>
                    {venster.vertrekDatum} om {venster.vertrekTijd}
                  </dd>
                </div>
                <div>
                  <dt>Indicatie</dt>
                  <dd>
                    {prijs.soort === "onbekend"
                      ? "Prijs op aanvraag"
                      : `vanaf ${formatteerBedrag(prijs.bedrag, prijs.valuta)}`}
                  </dd>
                </div>
              </dl>
              <p className="py-drawer__note">
                Je rondt de reservering af en betaalt in ons reserveringssysteem.
                Daar zie je ook het definitieve tarief.
              </p>
            </div>
          ) : null}

          {stap === 2 ? (
            <div className="py-drawer__afronden">
              {link === null || link.soort === "laden" ? (
                <p role="status">Een moment, we zetten je reservering klaar.</p>
              ) : link.soort === "link" ? (
                <>
                  <p>
                    Alles staat klaar. Je gaat verder in ons reserveringssysteem,
                    met je datum en tijd al ingevuld.
                  </p>
                  <PyButton href={link.url} variant="primary">
                    Verder naar reserveren
                  </PyButton>
                </>
              ) : (
                <>
                  <p role="alert" className="py-drawer__fout">
                    {link.reden}
                  </p>
                  <PyButton href="/klantenservice" variant="outline" icon="phone">
                    Neem contact op
                  </PyButton>
                </>
              )}
            </div>
          ) : null}
        </div>

        <footer className="py-drawer__voet">
          <button
            type="button"
            className="py-drawer__terug"
            onClick={() => setStap((s) => Math.max(0, s - 1))}
            disabled={stap === 0}
          >
            Terug
          </button>
          {stap === 0 ? (
            <PyButton onClick={() => setStap(1)} variant="primary" {...(fout !== null ? { disabled: true } : {})}>
              Verder
            </PyButton>
          ) : null}
          {stap === 1 ? (
            <PyButton onClick={() => void vraagLink()} variant="primary">
              Naar reserveren
            </PyButton>
          ) : null}
        </footer>
      </aside>
    </div>
  );
}
