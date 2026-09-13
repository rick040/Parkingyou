import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "aqua" | "outline" | "ghost";

interface CommonProps {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  /** Pass null for no trailing icon. Defaults to the arrow, as in the prototype. */
  readonly icon?: IconName | null;
  readonly className?: string;
}

type ButtonProps = CommonProps & {
  readonly href?: undefined;
  readonly onClick?: () => void;
  readonly type?: "button" | "submit";
  readonly disabled?: boolean;
};

type LinkProps = CommonProps & {
  readonly href: string;
};

export function PyButton(props: ButtonProps | LinkProps) {
  const { children, variant = "primary", icon = "arrow", className = "" } = props;
  const classes = `py-button py-button--${variant} ${className}`.trim();

  const inner = (
    <>
      <span>{children}</span>
      {icon === null ? null : <Icon name={icon} size={18} stroke={2.25} />}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    // External links and tel: cannot go through next/link's router.
    const extern = /^(https?:|tel:|mailto:|#)/.test(props.href);
    if (extern) {
      return (
        <a href={props.href} className={classes}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled ?? false}
      className={classes}
    >
      {inner}
    </button>
  );
}
