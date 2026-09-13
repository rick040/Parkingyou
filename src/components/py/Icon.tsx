import type { ReactNode } from "react";

/**
 * The prototype's icon set, ported verbatim.
 *
 * Typed as a union rather than a string, so a typo is a build error instead of
 * an invisibly empty SVG. The prototype indexes a plain object with
 * `paths[name]`, which silently renders nothing for an unknown name.
 */
export type IconName =
  | "search"
  | "pin"
  | "calendar"
  | "clock"
  | "card"
  | "car"
  | "bolt"
  | "shield"
  | "menu"
  | "x"
  | "arrow"
  | "chevron"
  | "down"
  | "check"
  | "phone"
  | "ticket"
  | "user"
  | "star"
  | "wallet"
  | "ev"
  | "elevator"
  | "camera"
  | "map"
  | "info"
  | "trending"
  | "bicycle"
  | "tag";

const PATHS: Readonly<Record<IconName, ReactNode>> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2.5" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="6" width="19" height="13" rx="2.5" />
      <path d="M2.5 11h19M6 15h3" />
    </>
  ),
  car: (
    <>
      <path d="M5 16h14M7 16v3M17 16v3M4 12l2.2-5.2A3 3 0 0 1 9 5h6a3 3 0 0 1 2.8 1.8L20 12" />
      <path d="M5 12h14v4H5z" />
      <circle cx="8" cy="14" r="1" />
      <circle cx="16" cy="14" r="1" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  down: <path d="m6 9 6 6 6-6" />,
  check: <path d="M20 6 9 17l-5-5" />,
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z" />
  ),
  ticket: (
    <>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2Z" />
      <path d="M13 5v2M13 17v2M13 11v2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </>
  ),
  star: (
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  ),
  wallet: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 12h.01M2 10h20" />
    </>
  ),
  ev: (
    <>
      <path d="M7 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
      <path d="M9 17v2m6-2v2M12 5v4" />
      <path d="m9 9 3-4 3 4" />
    </>
  ),
  elevator: (
    <>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M9 10h6M9 14h6" />
      <path d="m12 6-2 2 2-2 2 2" />
    </>
  ),
  camera: (
    <>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 0 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </>
  ),
  map: (
    <>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <path d="M9 3v15M15 6v15" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  trending: (
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>
  ),
  bicycle: (
    <>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 0 0-1-1h-3L9 11l4 4 4-3-2-6Z" />
      <path d="m5.5 14 1.5-4.5L10 14" />
    </>
  ),
  tag: (
    <>
      <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l8.29-8.29a1 1 0 0 0 0-1.42L12 2Z" />
      <path d="M7 7h.01" />
    </>
  ),
};

interface IconProps {
  readonly name: IconName;
  readonly size?: number;
  readonly stroke?: number;
  readonly color?: string;
  readonly className?: string;
}

export function Icon({
  name,
  size = 20,
  stroke = 1.9,
  color = "currentColor",
  className = "",
}: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
