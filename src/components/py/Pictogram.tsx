import Image from "next/image";

/**
 * Official ParkingYou pictograms, from the huisstijlhandboek via
 * rick040/py-assets (`svg/atom/`).
 *
 * These replace hand-drawn approximations. A visitor sees the same symbol on
 * the website as on the sign at the entrance, which is the entire point of a
 * wayfinding system.
 *
 * Deliberately NOT shipped here: the payment marks (`py-atom-payment-*`), the
 * RVV road signs and the escape-route symbols. The brand repository tags those
 * `third-party` and says "reference only: source the official files". Shipping
 * Mastercard and Maestro artwork out of a third party's handbook extract is a
 * trademark problem, not a design decision. The payment badges on the location
 * page keep a generic card icon until the official marks are licensed.
 */
export type PictogramName =
  | "accessible"
  | "car"
  | "ev"
  | "lift"
  | "pedestrian"
  | "toilet"
  | "info"
  | "family"
  | "motorcycle"
  | "stairs"
  | "escalator"
  | "payment-machine"
  | "camera"
  | "location-pin"
  | "calendar"
  | "headset"
  | "info-bubble"
  | "warning"
  | "max-height";

const BESTAND: Readonly<Record<PictogramName, string>> = {
  accessible: "picto-accessible",
  car: "picto-car",
  ev: "picto-ev",
  lift: "picto-lift",
  pedestrian: "picto-pedestrian",
  toilet: "picto-toilet",
  info: "picto-info",
  family: "picto-family",
  motorcycle: "picto-motorcycle",
  stairs: "picto-stairs",
  escalator: "picto-escalator",
  "payment-machine": "picto-payment-machine",
  camera: "sign-camera",
  "location-pin": "icon-location-pin",
  calendar: "icon-calendar",
  headset: "icon-headset-agent",
  "info-bubble": "icon-info-bubble",
  warning: "icon-warning-triangle",
  "max-height": "rvv-max-height",
};

interface PictogramProps {
  readonly name: PictogramName;
  readonly size?: number;
  /** Decorative by default; give a label when the symbol carries meaning alone. */
  readonly label?: string;
  readonly className?: string;
}

export function Pictogram({
  name,
  size = 24,
  label,
  className = "",
}: PictogramProps) {
  return (
    <Image
      src={`/pictogrammen/${BESTAND[name]}.svg`}
      alt={label ?? ""}
      width={size}
      height={size}
      aria-hidden={label === undefined}
      className={className}
      style={{ width: size, height: "auto" }}
    />
  );
}

/**
 * Map a Dutch facility label to its brand pictogram.
 *
 * Facility labels are free text in the CMS, so an editor can write
 * "Laadpalen (6x)" without a developer. That is why this matches on a prefix
 * rather than requiring an exact enum value, and why it returns null rather
 * than guessing when nothing fits: a wrong pictogram is worse than none.
 */
export function pictogramVoorFaciliteit(
  faciliteit: string,
): PictogramName | null {
  const f = faciliteit.toLowerCase();
  if (f.startsWith("laadp") || f.includes("elektrisch")) return "ev";
  if (f.startsWith("camera") || f.startsWith("bewaking")) return "camera";
  if (f.startsWith("lift")) return "lift";
  if (f.startsWith("toilet")) return "toilet";
  if (f.startsWith("rolstoel") || f.includes("minder valide") || f.includes("invalide"))
    return "accessible";
  if (f.startsWith("roltrap")) return "escalator";
  if (f.startsWith("trap")) return "stairs";
  if (f.startsWith("motor")) return "motorcycle";
  if (f.startsWith("betaal")) return "payment-machine";
  if (f.includes("hoogte")) return "max-height";
  return null;
}
