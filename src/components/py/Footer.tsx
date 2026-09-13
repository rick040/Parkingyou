import Link from "next/link";
import { PyLogo } from "./Chrome";

const KOLOMMEN: ReadonlyArray<
  readonly [string, ReadonlyArray<readonly [string, string]>]
> = [
  [
    "Parkeren",
    [
      ["Vind een garage", "/locaties"],
      ["Reserveer nu", "/locaties"],
      ["Evenementen", "/evenementen"],
      ["App", "/app"],
    ],
  ],
  [
    "Producten",
    [
      ["Abonnementen", "/abonnementen"],
      ["ParkingPass", "/parkingpass"],
      ["Waardekaarten", "/zakelijk/waardekaarten"],
      ["GLOW", "/evenementen/glow"],
    ],
  ],
  [
    "Account",
    [
      ["Mijn dashboard", "/dashboard"],
      ["Over ons", "/over-ons"],
      ["Zakelijk", "/zakelijk"],
      ["Support", "/klantenservice"],
    ],
  ],
];

export function PyFooter() {
  return (
    <footer className="py-footer">
      <div className="py-container py-footer__grid">
        <div>
          <PyLogo inverted />
          <p>
            ParkingYou is de no-nonsense challenger op de parkeermarkt: digitaal
            waar het kan, menselijk wanneer het moet.
          </p>
        </div>
        {KOLOMMEN.map(([titel, links]) => (
          <nav key={titel} aria-label={titel}>
            <strong>{titel}</strong>
            {links.map(([label, href]) => (
              <Link key={label} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="py-container py-footer__bottom">
        <span>ParkingYou 2026 - The other way of parking.</span>
        <span>
          <Link href="/privacybeleid">Privacybeleid</Link>
        </span>
      </div>
    </footer>
  );
}
