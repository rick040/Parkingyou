import { NextResponse } from "next/server";
import { bouwBoekingslink, type Boekingsvenster } from "@/lib/aeroparker/boekingslink";
import { locatieBySlug } from "@/lib/content";

/**
 * Resolve a booking deep link, on the server.
 *
 * It lives on the server for one reason: the Aeroparker API key is a
 * credential, and building the URL in the browser would ship it to every
 * visitor. The browser gets a finished URL and never the key.
 *
 * This route reads. It does not create, amend or cancel anything in Aeroparker,
 * and it holds no personal data: the request carries a location and a date
 * window, nothing about the customer.
 */

function leesVenster(v: unknown): Boekingsvenster | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  const velden = ["aankomstDatum", "aankomstTijd", "vertrekDatum", "vertrekTijd"] as const;
  for (const veld of velden) {
    if (typeof o[veld] !== "string") return null;
  }
  return {
    aankomstDatum: o.aankomstDatum as string,
    aankomstTijd: o.aankomstTijd as string,
    vertrekDatum: o.vertrekDatum as string,
    vertrekTijd: o.vertrekTijd as string,
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { soort: "niet-beschikbaar", reden: "Ongeldig verzoek." },
      { status: 400 },
    );
  }

  const o = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const stad = typeof o.stad === "string" ? o.stad : null;
  const slug = typeof o.locatie === "string" ? o.locatie : null;
  const venster = leesVenster(o.venster);

  if (stad === null || slug === null || venster === null) {
    return NextResponse.json(
      { soort: "niet-beschikbaar", reden: "Ongeldig verzoek." },
      { status: 400 },
    );
  }

  const locatie = locatieBySlug(stad, slug);
  if (locatie === undefined) {
    return NextResponse.json(
      { soort: "niet-beschikbaar", reden: "Deze locatie kennen we niet." },
      { status: 404 },
    );
  }

  return NextResponse.json(bouwBoekingslink(locatie.aeroparker, venster));
}
