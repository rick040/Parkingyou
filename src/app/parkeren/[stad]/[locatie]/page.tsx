import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KaartProducten } from "@/components/locatie/KaartProducten";
import { LocatieTabs } from "@/components/locatie/LocatieTabs";
import { LocatieDetailKaart } from "@/components/LocatieDetailKaart";
import { PyButton } from "@/components/py/Button";
import { PyLocationTypeBadge, PyPriceBlob, PySectionIntro } from "@/components/py/Chrome";
import { Icon } from "@/components/py/Icon";
import {
  alleLocaties,
  evenementenBijLocatie,
  locatieBySlug,
  stadBySlug,
} from "@/lib/content";
import { bepaalPrijs } from "@/lib/prijs";

interface LocatiePageProps {
  readonly params: Promise<{ readonly stad: string; readonly locatie: string }>;
}

export function generateStaticParams(): Array<{ stad: string; locatie: string }> {
  return alleLocaties().map((locatie) => ({
    stad: locatie.stad,
    locatie: locatie.slug,
  }));
}

export async function generateMetadata({
  params,
}: LocatiePageProps): Promise<Metadata> {
  const { stad: stadSlug, locatie: locatieSlug } = await params;
  const locatie = locatieBySlug(stadSlug, locatieSlug);
  if (locatie === undefined) return {};

  return {
    title: locatie.naam,
    description: locatie.intro,
    alternates: { canonical: `/parkeren/${stadSlug}/${locatieSlug}` },
  };
}

/**
 * The location page, built to match the rebranding prototype's garage detail
 * page. Markup and class names follow legacy-prototype/Garages.jsx so the
 * ported stylesheet in src/styles/prototype.css applies unchanged.
 *
 * What differs from the prototype, deliberately:
 *   - the price blob and the tariff table read from the Aeroparker snapshot
 *     rather than from a static object, and a stale snapshot says so;
 *   - the POI tab shows a real MapLibre map instead of the decorative SVG;
 *   - hash routes become the real Dutch URLs from docs/IA.md.
 */
export default async function LocatiePage({ params }: LocatiePageProps) {
  const { stad: stadSlug, locatie: locatieSlug } = await params;
  const locatie = locatieBySlug(stadSlug, locatieSlug);
  const stad = stadBySlug(stadSlug);
  if (locatie === undefined || stad === undefined) notFound();

  const prijs = bepaalPrijs(locatie.aeroparker);
  const evenementen = evenementenBijLocatie(locatie.slug);

  return (
    <main>
      <section className="py-detail-hero">
        <div className="py-container py-detail-hero__grid">
          <div>
            <Link href={`/parkeren/${stad.slug}`} className="py-back-link">
              ← Alle locaties
            </Link>
            <div className="py-detail-hero__meta">
              <PyLocationTypeBadge type={locatie.soort} />
              {locatie.beoordeling === null ? null : (
                <span className="py-detail-hero__rating">
                  <Icon name="star" size={15} color="#ee7d2c" />{" "}
                  {locatie.beoordeling}
                </span>
              )}
            </div>
            <h1>{locatie.naam}</h1>
            <p>{locatie.intro}</p>
            <div className="py-detail-quick-facts">
              {locatie.aantalPlaatsen === null ? null : (
                <span>
                  <Icon name="car" size={16} /> {locatie.aantalPlaatsen} plekken
                </span>
              )}
              <span>
                <Icon name="clock" size={16} />{" "}
                {locatie.uren.open247 ? "24/7 open" : "Beperkte openingstijden"}
              </span>
              <span>
                <Icon name="pin" size={16} /> {locatie.loopafstand}
              </span>
              {locatie.maximaleDoorrijhoogte === null ? null : (
                <span>
                  <Icon name="trending" size={16} /> Max.{" "}
                  {locatie.maximaleDoorrijhoogte}
                </span>
              )}
            </div>
            <div className="py-detail-actions">
              {/* {{TODO-NL: deep link naar Aeroparker koppelen, zie docs/BOOKING-LINKS.md in fase 3}} */}
              <PyButton href="/locaties" variant="primary">
                Reserveer nu
              </PyButton>
              <PyButton href="/locaties" variant="aqua" icon="car">
                Snel boeken
              </PyButton>
              <PyButton href="/klantenservice" variant="outline" icon="phone">
                Vraag hulp
              </PyButton>
            </div>
          </div>
          <div className="py-detail-media">
            {/* {{TODO-NL: echte foto van deze locatie, nu nog een stockbeeld}} */}
            <Image
              src={locatie.afbeelding}
              alt={`Parkeren bij ${locatie.naam}`}
              width={1200}
              height={900}
              priority
              sizes="(max-width: 900px) 100vw, 560px"
            />
            {prijs.soort === "onbekend" || locatie.aeroparker.dagprijs === null ? null : (
              <PyPriceBlob
                price={locatie.aeroparker.dagprijs}
                unit="per dag"
                tone="orange"
              />
            )}
          </div>
        </div>
      </section>

      <LocatieTabs
        locatie={locatie}
        kaart={<LocatieDetailKaart locatie={locatie} prijs={prijs} />}
      />

      <KaartProducten
        locatieNaam={locatie.naam}
        strippenkaart={locatie.strippenkaart}
        waardekaart={locatie.waardekaart}
      />

      {evenementen.length > 0 ? (
        <section className="py-section">
          <div className="py-container">
            <PySectionIntro
              titleBefore="Evenementen "
              titleEmphasis="nabij"
              titleAfter=" deze locatie."
            >
              Reserveer al je parkeertickets voor aankomende evenementen in de
              buurt.
            </PySectionIntro>
            <div className="py-event-strip">
              {evenementen.map((evenement) => (
                <Link
                  key={evenement.slug}
                  href={`/evenementen/${evenement.slug}`}
                  className="py-event-mini-card"
                >
                  <Image
                    src={evenement.afbeelding}
                    alt={evenement.naam}
                    width={400}
                    height={300}
                    sizes="120px"
                  />
                  <div>
                    <span
                      className={`py-event-type py-event-type--${evenement.kleur}`}
                    >
                      {evenement.soort}
                    </span>
                    <strong>{evenement.naam}</strong>
                    <small>
                      <Icon name="calendar" size={13} /> {evenement.datums}
                    </small>
                    <small>Vanaf € {evenement.vanafPrijs}</small>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
