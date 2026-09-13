"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PyButton } from "./Button";
import { PyLogo } from "./Chrome";
import { Icon } from "./Icon";

/**
 * Dutch labels, Dutch paths. The prototype's hash routes become the real URL
 * structure from docs/IA.md.
 */
const NAV: ReadonlyArray<readonly [string, string]> = [
  ["Locaties", "/locaties"],
  ["Evenementen", "/evenementen"],
  ["Abonnementen", "/abonnementen"],
  ["ParkingPass", "/parkingpass"],
  ["Zakelijk", "/zakelijk"],
  ["Over ons", "/over-ons"],
];

export function PyHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`py-header ${scrolled ? "is-scrolled" : ""}`.trim()}>
      <div className="py-container py-header__inner">
        <Link href="/" className="py-header__brand">
          <PyLogo />
        </Link>
        <nav className="py-header__nav" aria-label="Hoofdmenu">
          {NAV.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={pathname.startsWith(href) ? "is-active" : ""}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="py-header__actions">
          <a className="py-header__phone" href="tel:0854011647">
            <Icon name="phone" size={16} />
            <span>085 4011647</span>
          </a>
          <Link href="/dashboard" className="py-header__icon-btn" title="Mijn account">
            <Icon name="user" size={20} />
          </Link>
          <PyButton href="/locaties" variant="primary">
            Direct reserveren
          </PyButton>
        </div>
        <button
          type="button"
          className="py-menu-button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menu"
        >
          <Icon name={open ? "x" : "menu"} size={28} stroke={2.3} />
        </button>
      </div>
      {open ? (
        <div className="py-mobile-nav">
          {NAV.map(([label, href]) => (
            // Close on click rather than in an effect keyed on the pathname:
            // the click is the intent, and an effect that calls setState on
            // every navigation is a render-loop hazard.
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <PyButton href="/locaties" variant="primary">
            Direct reserveren
          </PyButton>
        </div>
      ) : null}
    </header>
  );
}
