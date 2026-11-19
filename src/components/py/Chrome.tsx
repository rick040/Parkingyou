import Image from "next/image";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface LogoProps {
  readonly inverted?: boolean;
}

export function PyLogo({ inverted = false }: LogoProps) {
  /*
   * The real brand logo from rick040/py-assets
   * (svg/atom/py-atom-logo-horizontal-{color,white}.svg), not the prototype's
   * approximation, which drew a blue circle with a letter P in it and set the
   * wordmark in live text. The wordmark is outlines in the official file, so it
   * no longer depends on the font loading.
   *
   * The tagline stays live text rather than using py-atom-text-tagline, which
   * is a live-text SVG and would need the font anyway. Its tracking is the
   * measured +60/1000 em from the brand repository.
   */
  return (
    <span className="py-logo" aria-label="ParkingYou">
      <Image
        src={inverted ? "/brand/horizontal-white.svg" : "/brand/horizontal-color.svg"}
        alt=""
        width={92}
        height={25}
        priority
        className="py-logo__mark-svg"
      />
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
