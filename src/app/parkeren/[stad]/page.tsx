import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StadOverzicht } from "@/components/StadOverzicht";
import { alleSteden, locatiesInStad, stadBySlug } from "@/lib/content";
import { metPrijzen } from "@/lib/prijs";

interface StadPageProps {
  readonly params: Promise<{ readonly stad: string }>;
}

export function generateStaticParams(): Array<{ stad: string }> {
  return alleSteden().map((stad) => ({ stad: stad.slug }));
}

export async function generateMetadata({
  params,
}: StadPageProps): Promise<Metadata> {
  const { stad: slug } = await params;
  const stad = stadBySlug(slug);
  if (stad === undefined) return {};

  return {
    title: `Parkeren in ${stad.naam}`,
    description: stad.intro,
    alternates: { canonical: `/parkeren/${stad.slug}` },
  };
}

export default async function StadPage({ params }: StadPageProps) {
  const { stad: slug } = await params;
  const stad = stadBySlug(slug);
  if (stad === undefined) notFound();

  const locaties = metPrijzen(locatiesInStad(stad.slug));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Kruimelpad" className="mb-4 text-sm text-py-muted">
        <Link href="/" className="text-py-blue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>Parkeren in {stad.naam}</span>
      </nav>

      <h1 className="m-0 text-2xl font-bold text-py-text sm:text-3xl">
        Parkeren in {stad.naam}
      </h1>
      <p className="mt-2 mb-6 max-w-2xl text-py-muted">{stad.intro}</p>

      {locaties.length === 0 ? (
        <p className="rounded-py bg-py-paper p-4 text-py-muted">
          Er staan nog geen locaties in {stad.naam} op de site.
        </p>
      ) : (
        <StadOverzicht stad={stad} locaties={locaties} />
      )}

      <section className="mt-10">
        <h2 className="m-0 text-lg font-bold text-py-text">Parkeren in andere steden</h2>
        <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
          {alleSteden()
            .filter((andere) => andere.slug !== stad.slug)
            .map((andere) => (
              <li key={andere.slug}>
                <Link
                  href={`/parkeren/${andere.slug}`}
                  className="inline-block rounded-py border border-py-line px-3 py-2 text-sm text-py-blue no-underline hover:border-py-blue"
                >
                  {andere.naam}
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
