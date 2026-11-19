import type { Metadata } from "next";
import { LocatiesOverzicht } from "@/components/locaties/LocatiesOverzicht";
import { alleLocaties, alleSteden } from "@/lib/content";
import { metPrijzen } from "@/lib/prijs";

export const metadata: Metadata = {
  title: "Alle parkeerlocaties",
  description:
    "Bekijk alle ParkingYou parkeerlocaties op de kaart. Filter op stad, vergelijk tarieven en reserveer vooraf een plek.",
  alternates: { canonical: "/locaties" },
};

/** Roughly the centre of the country, for the unfiltered view. */
const NEDERLAND = { lat: 52.1, lng: 5.1 };

export default function LocatiesPage() {
  const locaties = metPrijzen(alleLocaties());

  return (
    <main>
      {/* py-page-hero carries the prototype's h1 scale; py-section's 92px of
          padding would otherwise leave the heading floating in whitespace. */}
      <section className="py-page-hero">
        <div className="py-container">
          <h1>Alle parkeerlocaties</h1>
          <p className="py-locaties-intro">
            Klik op een pin of kies een locatie uit de lijst. Je ziet meteen wat
            parkeren er kost en je kunt vooraf een plek reserveren.
          </p>
        </div>
      </section>

      <section className="py-locaties-sectie">
        <div className="py-container">
          <LocatiesOverzicht
            steden={alleSteden()}
            locaties={locaties}
            middelpunt={NEDERLAND}
          />
        </div>
      </section>
    </main>
  );
}
