import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LocatieDetailKaart } from "@/components/LocatieDetailKaart";
import { TariefBlok } from "@/components/TariefBlok";
import {
  alleLocaties,
  locatieBySlug,
  locatiesInStad,
  stadBySlug,
} from "@/lib/content";
import type { Voorziening } from "@/lib/content/types";
import { bepaalPrijs } from "@/lib/prijs";

interface LocatiePageProps {
  readonly params: Promise<{ readonly stad: string; readonly locatie: string }>;
}

const VOORZIENING_LABEL: Readonly<Record<Voorziening, string>> = {
  laadpunt: "Laadpunt voor elektrische auto's",
  camerabewaking: "Camerabewaking",
  overdekt: "Overdekt parkeren",
  invalidenplaats: "Invalidenparkeerplaats",
  fietsenstalling: "Fietsenstalling",
  kentekenherkenning: "Kentekenherkenning",
};

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
 * The location page: the reference template for the whole site.
 *
 * Everything that matters to someone deciding where to leave their car is on
 * this page and above the fold on a phone: what it costs, whether it is open,
 * how to get in, and how to book.
 */
export default async function LocatiePage({ params }: LocatiePageProps) {
  const { stad: stadSlug, locatie: locatieSlug } = await params;
  const locatie = locatieBySlug(stadSlug, locatieSlug);
  const stad = stadBySlug(stadSlug);
  if (locatie === undefined || stad === undefined) notFound();

  const prijs = bepaalPrijs(locatie.aeroparker);
  const buren = locatiesInStad(stadSlug).filter(
    (andere) => andere.slug !== locatie.slug,
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <nav aria-label="Kruimelpad" className="mb-4 text-sm text-py-muted">
        <Link href="/" className="text-py-blue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/parkeren/${stad.slug}`} className="text-py-blue">
          {stad.naam}
        </Link>
        <span className="mx-2">/</span>
        <span>{locatie.naam}</span>
      </nav>

      <h1 className="m-0 text-2xl font-bold text-py-text sm:text-3xl">
        {locatie.naam}
      </h1>
      <p className="mt-2 mb-0 text-py-muted">{locatie.intro}</p>
      <p className="mt-1 mb-0 text-sm text-py-muted">
        {locatie.adres.straat} {locatie.adres.huisnummer}, {locatie.adres.plaats}
      </p>

      <TariefBlok prijs={prijs} locatieNaam={locatie.naam} />

      <section className="mt-8">
        <h2 className="m-0 text-lg font-bold text-py-text">Openingstijden</h2>
        {locatie.is24Uur ? (
          <p className="mt-2 mb-0 text-py-ok">
            Deze garage is dag en nacht open, ook op feestdagen.
          </p>
        ) : locatie.openingstijden.length === 0 ? (
          <p className="mt-2 mb-0 text-py-muted">
            {`{{TODO-NL: openingstijden ${locatie.naam} invullen}}`}
          </p>
        ) : (
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            {locatie.openingstijden.map((tijd) => (
              <div key={tijd.dag} className="contents">
                <dt className="text-py-muted">{tijd.dag}</dt>
                <dd className="m-0">
                  {tijd.van} tot {tijd.tot}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section className="mt-8">
        <h2 className="m-0 text-lg font-bold text-py-text">Naar binnen en naar buiten</h2>
        <h3 className="mt-4 mb-1 text-base font-bold text-py-text">Inrijden</h3>
        <p className="m-0 text-py-muted">{locatie.inrit}</p>
        <h3 className="mt-4 mb-1 text-base font-bold text-py-text">Uitrijden</h3>
        <p className="m-0 text-py-muted">{locatie.uitrit}</p>
      </section>

      {locatie.voorzieningen.length > 0 ? (
        <section className="mt-8">
          <h2 className="m-0 text-lg font-bold text-py-text">Voorzieningen</h2>
          <ul className="mt-2 flex list-none flex-wrap gap-2 p-0">
            {locatie.voorzieningen.map((voorziening) => (
              <li
                key={voorziening}
                className="rounded-py bg-py-paper px-3 py-2 text-sm text-py-text"
              >
                {VOORZIENING_LABEL[voorziening]}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="m-0 text-lg font-bold text-py-text">Route en bereikbaarheid</h2>
        <p className="mt-2 mb-4 text-py-muted">{locatie.route}</p>
        <div className="h-[300px] overflow-hidden rounded-py border border-py-line sm:h-[380px]">
          <LocatieDetailKaart locatie={locatie} prijs={prijs} />
        </div>
      </section>

      {buren.length > 0 ? (
        <section className="mt-10">
          <h2 className="m-0 text-lg font-bold text-py-text">
            Andere garages in {stad.naam}
          </h2>
          <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
            {buren.map((buur) => (
              <li key={buur.slug}>
                <Link
                  href={`/parkeren/${stad.slug}/${buur.slug}`}
                  className="inline-block rounded-py border border-py-line px-3 py-2 text-sm text-py-blue no-underline hover:border-py-blue"
                >
                  {buur.naam}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
