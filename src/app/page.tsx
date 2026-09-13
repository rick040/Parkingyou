import Link from "next/link";
import { alleLocaties, alleSteden } from "@/lib/content";

export default function HomePage() {
  const steden = alleSteden();
  const aantalLocaties = alleLocaties().length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="m-0 text-3xl font-bold text-py-text sm:text-4xl">
        Voordelig parkeren in de stad
      </h1>
      <p className="mt-3 mb-8 max-w-2xl text-lg text-py-muted">
        Reserveer vooraf een plek en rij zo naar binnen. Je kenteken is je
        toegang, dus je hoeft niets uit te printen.
      </p>

      <h2 className="m-0 text-lg font-bold text-py-text">Kies je stad</h2>
      <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
        {steden.map((stad) => (
          <li key={stad.slug}>
            <Link
              href={`/parkeren/${stad.slug}`}
              className="inline-block rounded-py border border-py-line px-4 py-3 text-py-blue no-underline hover:border-py-blue"
            >
              {stad.naam}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-py-muted">
        {/*
          Phase 1 carries three real locations. The count is derived rather than
          written down so it cannot drift from the content.
        */}
        {aantalLocaties} locaties in deze fase.{" "}
        {`{{TODO-NL: de overige locaties toevoegen, in totaal 37}}`}
      </p>
    </main>
  );
}
