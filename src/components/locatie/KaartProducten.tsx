"use client";

import { useState } from "react";
import { PyButton } from "@/components/py/Button";
import { PySectionIntro } from "@/components/py/Chrome";
import { Icon } from "@/components/py/Icon";

const STRIPPEN: ReadonlyArray<readonly [string, string]> = [
  ["10", "10x parkeren – € 22"],
  ["25", "25x parkeren – € 48"],
];

const WAARDES: readonly string[] = ["25", "50", "100", "200"];

interface KaartProductenProps {
  readonly locatieNaam: string;
  readonly strippenkaart: boolean;
  readonly waardekaart: boolean;
}

/**
 * Strippenkaart and Waardekaart ordering, ported from the prototype.
 *
 * Both forms are inert on submit for now: they show the confirmation state and
 * nothing leaves the browser. Aeroparker is the system of record and this
 * codebase never writes to it, so wiring these up is a deep link or a Phase 3
 * decision, not something to fake here.
 */
export function KaartProducten({
  locatieNaam,
  strippenkaart,
  waardekaart,
}: KaartProductenProps) {
  const [stripAantal, setStripAantal] = useState<string>("10");
  const [stripKlaar, setStripKlaar] = useState(false);
  const [waardeBedrag, setWaardeBedrag] = useState<string>("50");
  const [waardeKlaar, setWaardeKlaar] = useState(false);

  if (!strippenkaart && !waardekaart) return null;

  return (
    <section className="py-section py-section--paper">
      <div className="py-container">
        <PySectionIntro
          titleBefore="Voordelig "
          titleEmphasis="vaker parkeren"
          titleAfter=" hier."
        >
          {`Bestel een strippenkaart of waardekaart specifiek voor ${locatieNaam} en bespaar op elk bezoek.`}
        </PySectionIntro>

        <div className="py-product-cards-row">
          {strippenkaart ? (
            <div className="py-product-card py-product-card--strips">
              <div className="py-product-card__header">
                <span>
                  <Icon name="ticket" size={22} />
                </span>
                <h3>Strippenkaart</h3>
                <p>
                  {`Kies 10 of 25 parkeeracties voor ${locatieNaam}. Ontvang de code per e-mail en reserveer wanneer het jou uitkomt.`}
                </p>
              </div>
              {stripKlaar ? (
                <div className="py-inline-success">
                  <Icon name="check" size={20} />
                  <span>Bestelling ontvangen. Code volgt per e-mail.</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setStripKlaar(true);
                  }}
                >
                  <div className="py-pass-toggle py-pass-toggle--light">
                    {STRIPPEN.map(([waarde, label]) => (
                      <button
                        type="button"
                        key={waarde}
                        className={stripAantal === waarde ? "is-active" : ""}
                        aria-pressed={stripAantal === waarde}
                        onClick={() => setStripAantal(waarde)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <label className="py-inline-label">
                    E-mail
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="jij@voorbeeld.nl"
                    />
                  </label>
                  <PyButton type="submit" variant="primary">
                    Bestel strippenkaart
                  </PyButton>
                </form>
              )}
            </div>
          ) : null}

          {waardekaart ? (
            <div className="py-product-card py-product-card--waarde">
              <div className="py-product-card__header">
                <span>
                  <Icon name="wallet" size={22} />
                </span>
                <h3>Waardekaart</h3>
                <p>
                  {`Laad een tegoed op en gebruik het voor alle bezoeken aan ${locatieNaam}. Ideaal voor zakelijk gebruik en frequente bezoekers.`}
                </p>
              </div>
              {waardeKlaar ? (
                <div className="py-inline-success">
                  <Icon name="check" size={20} />
                  <span>
                    Waardekaart aangemaakt. Inloggegevens volgen per e-mail.
                  </span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setWaardeKlaar(true);
                  }}
                >
                  <div className="py-waarde-options">
                    {WAARDES.map((waarde) => (
                      <button
                        type="button"
                        key={waarde}
                        className={waardeBedrag === waarde ? "is-active" : ""}
                        aria-pressed={waardeBedrag === waarde}
                        onClick={() => setWaardeBedrag(waarde)}
                      >
                        € {waarde}
                      </button>
                    ))}
                  </div>
                  <label className="py-inline-label">
                    E-mail
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="jij@voorbeeld.nl"
                    />
                  </label>
                  <PyButton type="submit" variant="primary">
                    Laad waardekaart op
                  </PyButton>
                </form>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
