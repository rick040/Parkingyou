import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";

/*
 * Self-hosted via next/font. The legacy site loads Ubuntu from
 * fonts.googleapis.com, which sends every visitor's IP to Google and costs a
 * render-blocking round trip. next/font inlines the CSS and serves the files
 * from our own origin, which is both faster and EU-resident.
 */
const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ParkingYou, voordelig parkeren in de stad",
    template: "%s | ParkingYou",
  },
  description:
    "Parkeer voordelig en centraal in elf steden en regio's. Reserveer vooraf online en rij zo naar binnen.",
};

/*
 * Note what is absent: maximum-scale. The legacy site sets
 * `maximum-scale=1`, which blocks pinch zoom across every page and fails
 * WCAG 2.2 success criterion 1.4.4. See docs/LEGACY-BEHAVIOUR.md.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#374e9d",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className={ubuntu.variable}>{children}</body>
    </html>
  );
}
