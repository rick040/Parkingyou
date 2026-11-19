import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@/styles/prototype.css";
import { PyHeader } from "@/components/py/Header";
import { PyFooter } from "@/components/py/Footer";

/*
 * Ubuntu, self-hosted from the brand repository (rick040/py-assets, `fonts/`),
 * under the Ubuntu Font Licence 1.0 (src/fonts/UBUNTU-FONT-LICENCE.txt).
 *
 * Previously this pulled Ubuntu from next/font/google, which fetches the files
 * from Google at build time. Serving the brand's own licensed copy removes that
 * dependency, keeps the request EU-resident, and guarantees we ship the same
 * weights the huisstijlhandboek specifies: Light 300, Regular 400, Medium 500,
 * Bold 700. No italics, because the site uses none.
 */
const ubuntu = localFont({
  src: [
    { path: "../fonts/Ubuntu-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/Ubuntu-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Ubuntu-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Ubuntu-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-ubuntu",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "ParkingYou, voordelig parkeren in de stad",
    template: "%s | ParkingYou",
  },
  description:
    "Parkeer voordelig en centraal in elf steden en regio's. Reserveer vooraf online en rij zo naar binnen.",
  icons: { icon: "/brand/beeldmerk-color.svg" },
};

/*
 * Note what is absent: maximum-scale. The legacy site sets
 * `maximum-scale=1`, which blocks pinch zoom across every page and fails
 * WCAG 2.2 success criterion 1.4.4. See docs/LEGACY-BEHAVIOUR.md.
 *
 * themeColor is PY-Blauw from handbook 1.3.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a3580",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className={ubuntu.variable}>
        <a href="#inhoud" className="py-skip-link">
          Naar de inhoud
        </a>
        <PyHeader />
        <div id="inhoud">{children}</div>
        <PyFooter />
      </body>
    </html>
  );
}
