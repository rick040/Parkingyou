"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
// Required. Without it markers get no absolute positioning and stack below the
// canvas instead of sitting on it, and the controls and attribution are
// unstyled. It is a static import so it lands in the CSS bundle rather than
// arriving after the dynamically imported map.
import "maplibre-gl/dist/maplibre-gl.css";
import type { Coordinaat } from "@/lib/content/types";
import type { LocatieMetPrijs } from "@/lib/prijs";
import { markerLabel } from "@/lib/prijs";
import {
  ATTRIBUTIE,
  COOPERATIEVE_GEBAREN,
  MAX_ZOOM,
  STANDAARD_ZOOM,
  TEGEL_GROOTTE,
  TEGEL_URL,
} from "@/lib/kaart-config";

interface ParkeerKaartProps {
  readonly middelpunt: Coordinaat;
  readonly locaties: readonly LocatieMetPrijs[];
  readonly actieveSlug: string | null;
  readonly onSelecteer: (slug: string) => void;
}

/**
 * The parking map.
 *
 * Behaviour ported from the legacy site (see docs/LEGACY-BEHAVIOUR.md): a price
 * floats above every pin so someone can compare a whole city at a glance, and a
 * location without a live price is dimmed rather than hidden.
 *
 * What is not ported: Google Maps, and the InfoWindow-per-marker approach where
 * the label content is rewritten with String.replace() when a price arrives.
 * MapLibre markers take a DOM element, so the label is just an element we own.
 */
export function ParkeerKaart({
  middelpunt,
  locaties,
  actieveSlug,
  onSelecteer,
}: ParkeerKaartProps) {
  const houderRef = useRef<HTMLDivElement | null>(null);
  const kaartRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const [tegelsMislukt, setTegelsMislukt] = useState(false);
  const [geladen, setGeladen] = useState(false);

  // Keep the latest callback without making the map effect depend on it,
  // otherwise every parent render would tear the map down and rebuild it.
  const selecteerRef = useRef(onSelecteer);
  useEffect(() => {
    selecteerRef.current = onSelecteer;
  }, [onSelecteer]);

  useEffect(() => {
    const houder = houderRef.current;
    if (houder === null) return;

    let afgebroken = false;
    let kaart: MapLibreMap | null = null;
    // Captured here so the cleanup closes over this map, not over whatever
    // markersRef happens to point at when the effect tears down.
    const markers = markersRef.current;

    // Dynamic import keeps MapLibre out of the initial bundle. It is a large
    // library and no page needs it before hydration.
    void (async () => {
      const maplibre = await import("maplibre-gl");
      if (afgebroken) return;

      kaart = new maplibre.Map({
        container: houder,
        style: {
          version: 8,
          sources: {
            pdok: {
              type: "raster",
              tiles: [TEGEL_URL],
              tileSize: TEGEL_GROOTTE,
              attribution: ATTRIBUTIE,
            },
          },
          layers: [
            {
              id: "achtergrond",
              type: "background",
              paint: { "background-color": "#f5f7fb" },
            },
            { id: "pdok", type: "raster", source: "pdok" },
          ],
        },
        center: [middelpunt.lng, middelpunt.lat],
        zoom: STANDAARD_ZOOM,
        maxZoom: MAX_ZOOM,
        cooperativeGestures: COOPERATIEVE_GEBAREN,
        attributionControl: { compact: true },
      });

      kaartRef.current = kaart;

      kaart.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      kaart.on("load", () => {
        if (!afgebroken) setGeladen(true);
      });

      /*
       * If PDOK is unreachable the map still renders on the background colour
       * and the markers stay usable. A parking map that loses its basemap is
       * degraded; one that throws is broken.
       */
      kaart.on("error", (event: { sourceId?: string; error?: { message?: string } }) => {
        // Key on the source id rather than on the wording of the message.
        // MapLibre's tile errors do not reliably contain the word "tile", so
        // matching on the text silently never fires, which is exactly what the
        // first version of this did.
        if (event.sourceId === "pdok" && !afgebroken) {
          setTegelsMislukt(true);
        }
      });

      for (const { locatie, prijs } of locaties) {
        const element = document.createElement("button");
        element.type = "button";
        element.className = `py-marker${prijs.gedimd ? " py-marker--gedimd" : ""}`;
        element.setAttribute(
          "aria-label",
          `${locatie.naam}, ${markerLabel(prijs)}`,
        );

        const label = document.createElement("span");
        label.className = "py-marker__price";
        label.textContent = markerLabel(prijs);

        const pin = document.createElement("span");
        pin.className = "py-marker__pin";

        element.append(label, pin);
        element.addEventListener("click", () => {
          selecteerRef.current(locatie.slug);
        });

        const marker = new maplibre.Marker({ element })
          .setLngLat([locatie.coordinaten.lng, locatie.coordinaten.lat])
          .addTo(kaart);

        markers.set(locatie.slug, marker);
      }

      /*
       * Fit the view to the markers rather than trusting a fixed zoom.
       *
       * On a 390px viewport a city map centred on the city centre at a fixed
       * zoom routinely pushes outlying garages off the canvas: Eindhoven's
       * Evoluon sits about 2.5 km west of the centre and disappears entirely.
       * The legacy site has the same call, `map.fitBounds(bounds)`, but it is
       * commented out.
       *
       * Padding is asymmetric on purpose: a marker's price label sits above its
       * pin, so the top needs more room than the bottom.
       */
      if (locaties.length > 1) {
        const grenzen = new maplibre.LngLatBounds();
        for (const { locatie } of locaties) {
          grenzen.extend([locatie.coordinaten.lng, locatie.coordinaten.lat]);
        }
        /*
         * Padding has to clear the price label, not just the pin. A label is
         * centred on its point and runs to roughly 110px wide, so without
         * horizontal room the outermost labels are clipped by the map edge.
         */
        const halveLabelBreedte = 64;
        kaart.fitBounds(grenzen, {
          padding: {
            top: 64,
            bottom: 32,
            left: halveLabelBreedte,
            right: halveLabelBreedte,
          },
          maxZoom: 15,
          animate: false,
        });
      }
    })();

    return () => {
      afgebroken = true;
      markers.clear();
      kaart?.remove();
      kaartRef.current = null;
    };
    // The map is built once per city. Price changes are applied by the effect
    // below, which mutates the existing markers instead of remounting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [middelpunt.lat, middelpunt.lng]);

  // Highlight the selected location and pan to it.
  useEffect(() => {
    for (const [slug, marker] of markersRef.current) {
      marker.getElement().classList.toggle("py-marker--actief", slug === actieveSlug);
    }

    if (actieveSlug === null) return;
    const gekozen = locaties.find((item) => item.locatie.slug === actieveSlug);
    if (gekozen === undefined) return;

    kaartRef.current?.easeTo({
      center: [gekozen.locatie.coordinaten.lng, gekozen.locatie.coordinaten.lat],
      duration: 400,
    });
  }, [actieveSlug, locaties]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={houderRef}
        className="h-full w-full bg-py-paper"
        role="application"
        aria-label="Kaart met parkeerlocaties"
        data-testid="parkeerkaart"
        data-geladen={geladen ? "ja" : "nee"}
      />
      {tegelsMislukt ? (
        <p
          className="absolute left-3 top-3 max-w-xs rounded-py bg-py-surface px-3 py-2 text-sm text-py-muted shadow-py-sm"
          role="status"
        >
          De kaart kan nu niet geladen worden. De locaties staan hieronder op een
          rij.
        </p>
      ) : null}
    </div>
  );
}
