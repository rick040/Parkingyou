"use client";

import { useState } from "react";
import { Icon } from "@/components/py/Icon";
import { PyButton } from "@/components/py/Button";
import type { Locatie } from "@/lib/content/types";

type TabId = "tarieven" | "faciliteiten" | "openingstijden" | "pois";

const TABS: ReadonlyArray<{ readonly id: TabId; readonly label: string }> = [
  { id: "tarieven", label: "Tarieven" },
  { id: "faciliteiten", label: "Faciliteiten" },
  { id: "openingstijden", label: "Openingstijden" },
  { id: "pois", label: "POI's & omgeving" },
];

/** The prototype's PYFacilityIcon, matching on the Dutch facility label. */
function FaciliteitIcon({ naam }: { readonly naam: string }) {
  if (naam.startsWith("Laadpalen")) return <Icon name="ev" size={18} />;
  if (naam.startsWith("Lift")) return <Icon name="elevator" size={18} />;
  if (naam.startsWith("Camera")) return <Icon name="camera" size={18} />;
  if (naam.startsWith("Bewaking")) return <Icon name="shield" size={18} />;
  if (naam.startsWith("Fiets")) return <Icon name="bicycle" size={18} />;
  if (naam.startsWith("Toilet")) return <Icon name="info" size={18} />;
  if (naam.includes("OV") || naam.includes("loket")) return <Icon name="map" size={18} />;
  return <Icon name="check" size={18} />;
}

interface LocatieTabsProps {
  readonly locatie: Locatie;
  /** Rendered into the POI tab, so the map stays a server-chosen component. */
  readonly kaart: React.ReactNode;
}

export function LocatieTabs({ locatie, kaart }: LocatieTabsProps) {
  const [actief, setActief] = useState<TabId>("tarieven");
  const { aeroparker, uren, adres } = locatie;

  return (
    <section className="py-detail-tabs-section">
      <div className="py-container">
        <nav className="py-detail-tabs" aria-label="Informatie over deze locatie">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={actief === tab.id ? "is-active" : ""}
              aria-current={actief === tab.id ? "true" : undefined}
              onClick={() => setActief(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {actief === "tarieven" ? (
          <div className="py-tab-content">
            <div className="py-detail-two-col">
              <div>
                <h3>Tarieven overzicht</h3>
                <table className="py-tariff-table">
                  <tbody>
                    {aeroparker.tarieven.map((t) => (
                      <tr key={t.label}>
                        <td>{t.label}</td>
                        <td>
                          <strong>€ {t.prijs}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="py-tariff-note">
                  Tarieven zijn inclusief BTW. Vroegboekkorting geldt bij
                  reservering minimaal 24u van tevoren.
                </p>
                {/*
                  Aeroparker is the system of record for pricing, and this page
                  renders from a nightly snapshot. When that snapshot is stale
                  the visitor is told, rather than shown a number we cannot
                  stand behind. See docs/AEROPARKER-AUDIT.md.
                */}
                {aeroparker.syncStatus !== "ok" && aeroparker.syncMelding !== null ? (
                  <p className="py-tariff-note" role="status">
                    {aeroparker.syncMelding}
                  </p>
                ) : null}
              </div>
              <div>
                <h3>Betaalmogelijkheden</h3>
                <div className="py-payment-grid">
                  {locatie.betaalmogelijkheden.map((methode) => (
                    <span key={methode} className="py-payment-badge">
                      <Icon name="card" size={16} />
                      {methode}
                    </span>
                  ))}
                </div>
                <div className="py-pricing-tip">
                  <Icon name="trending" size={18} color="#ee7d2c" />
                  <div>
                    <strong>Bespaar tot 33%</strong>
                    <p>
                      Reserveer vooraf en profiteer van vroegboekkortingen en
                      gereserveerde dagprijzen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {actief === "faciliteiten" ? (
          <div className="py-tab-content">
            <div className="py-detail-two-col">
              <div>
                <h3>Aanwezige faciliteiten</h3>
                <div className="py-facility-grid">
                  {locatie.faciliteiten.map((f) => (
                    <div key={f} className="py-facility-item">
                      <span className="py-facility-icon">
                        <FaciliteitIcon naam={f} />
                      </span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3>Toegang &amp; type</h3>
                <div className="py-access-info">
                  <div>
                    <span>Type locatie</span>
                    <strong>{locatie.soort}</strong>
                  </div>
                  <div>
                    <span>Maximale voertuighoogte</span>
                    <strong>
                      {locatie.maximaleDoorrijhoogte ?? "Niet opgegeven"}
                    </strong>
                  </div>
                  <div>
                    <span>Beschikbare plekken</span>
                    <strong>
                      {locatie.aantalPlaatsen === null
                        ? "Niet opgegeven"
                        : `${locatie.aantalPlaatsen} (indicatief)`}
                    </strong>
                  </div>
                  <div>
                    <span>Kentekentoegang</span>
                    <strong>
                      {locatie.reserveerbaar
                        ? "Ja, bij reservering"
                        : "Niet beschikbaar"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {actief === "openingstijden" ? (
          <div className="py-tab-content">
            <div className="py-detail-two-col">
              <div>
                <h3>Openingstijden</h3>
                {uren.open247 ? (
                  <div className="py-247-badge">
                    <Icon name="check" size={20} />
                    <div>
                      <strong>24/7 geopend</strong>
                      <p>
                        Deze locatie is altijd toegankelijk, ook op feestdagen.
                      </p>
                    </div>
                  </div>
                ) : (
                  <table className="py-hours-table">
                    <tbody>
                      <tr>
                        <td>Maandag – Vrijdag</td>
                        <td>
                          <strong>{uren.doordeweeks ?? "Onbekend"}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td>Zaterdag</td>
                        <td>
                          <strong>{uren.zaterdag ?? "Onbekend"}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td>Zondag</td>
                        <td>
                          <strong>{uren.zondag ?? "Onbekend"}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
              <div>
                <h3>Service &amp; bereikbaarheid</h3>
                <div className="py-access-info">
                  <div>
                    <span>Telefonische service</span>
                    <strong>24/7 bereikbaar</strong>
                  </div>
                  <div>
                    <span>Adres</span>
                    <strong>
                      {adres.straat} {adres.huisnummer}, {adres.plaats}
                    </strong>
                  </div>
                  <div>
                    <span>Loopafstand centrum</span>
                    <strong>{locatie.loopafstand}</strong>
                  </div>
                </div>
                <div className="py-contact-cta">
                  <PyButton href="tel:0854011647" variant="outline" icon="phone">
                    085 4011647
                  </PyButton>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {actief === "pois" ? (
          <div className="py-tab-content">
            <h3>Bezienswaardigheden &amp; POI&apos;s in de buurt</h3>
            <div className="py-poi-grid">
              {locatie.pois.map((poi) => (
                <div key={poi.naam} className="py-poi-card">
                  <span className="py-poi-icon">
                    <Icon name="pin" size={20} />
                  </span>
                  <div>
                    <strong>{poi.naam}</strong>
                    <span>{poi.soort}</span>
                    <span className="py-poi-distance">
                      <Icon name="clock" size={14} /> {poi.afstand}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/*
              The prototype shows a decorative SVG here with the note that the
              live route map arrives in production. This is that map: MapLibre
              on PDOK tiles, not the prototype's placeholder.
            */}
            <div className="py-detail-map-card" style={{ marginTop: 32 }}>
              <div className="py-detail-map-card__kaart">{kaart}</div>
              <p>
                De kaart toont deze locatie en de looproute naar de
                bezienswaardigheden hierboven.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
