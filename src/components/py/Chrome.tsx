import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface LogoProps {
  readonly inverted?: boolean;
}

export function PyLogo({ inverted = false }: LogoProps) {
  return (
    <span
      className={`py-logo ${inverted ? "py-logo--inverted" : ""}`.trim()}
      aria-label="ParkingYou"
    >
      <span className="py-logo__mark">P</span>
      <span>
        <strong>ParkingYou</strong>
        <small>The other way of parking</small>
      </span>
    </span>
  );
}

interface PriceBlobProps {
  readonly price: string;
  readonly unit?: string;
  readonly tone?: "aqua" | "orange";
}

export function PyPriceBlob({
  price,
  unit = "per dag",
  tone = "aqua",
}: PriceBlobProps) {
  return (
    <span className={`py-price-blob py-price-blob--${tone}`}>
      <strong>EUR {price}</strong>
      <small>{unit}</small>
    </span>
  );
}

interface SectionIntroProps {
  /** The word or phrase rendered in italics, as `<em>` in the prototype. */
  readonly titleBefore: string;
  readonly titleEmphasis: string;
  readonly titleAfter: string;
  readonly children?: ReactNode;
  readonly align?: "left" | "center";
}

/**
 * The prototype builds these headings with `dangerouslySetInnerHTML` and an
 * HTML string containing `<em>`. Split into three props instead: same output,
 * no HTML injection path, and the copy stays translatable as text.
 */
export function PySectionIntro({
  titleBefore,
  titleEmphasis,
  titleAfter,
  children,
  align = "left",
}: SectionIntroProps) {
  return (
    <div className={`py-section-intro py-section-intro--${align}`}>
      <div>
        <h2>
          {titleBefore}
          <em>{titleEmphasis}</em>
          {titleAfter}
        </h2>
        {children === undefined ? null : <p>{children}</p>}
      </div>
    </div>
  );
}

interface LocationTypeBadgeProps {
  readonly type: string;
}

export function PyLocationTypeBadge({ type }: LocationTypeBadgeProps) {
  return (
    <span className="py-location-type-badge">
      <Icon name="car" size={14} />
      {type}
    </span>
  );
}
