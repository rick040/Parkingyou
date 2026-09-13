/**
 * Capture the phase screenshot set at 390px, the width the brief specifies
 * (an iPhone 12/13/14 viewport, and a realistic midrange Android too).
 *
 * Usage: node scripts/screenshots.mjs [baseUrl] [outDir]
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:3111";
const outDir = process.argv[3] ?? "screenshots";

const pages = [
  { naam: "home", pad: "/" },
  { naam: "stad-eindhoven", pad: "/parkeren/eindhoven" },
  { naam: "locatie-philips-stadion", pad: "/parkeren/eindhoven/philips-stadion" },
  { naam: "locatie-dll-parkeerdek", pad: "/parkeren/eindhoven/dll-parkeerdek" },
  { naam: "locatie-philips-bedrijfsschool-vermist", pad: "/parkeren/eindhoven/philips-bedrijfsschool" },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});

const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: "nl-NL",
});

const consoleErrors = [];
context.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

for (const { naam, pad } of pages) {
  const page = await context.newPage();
  // domcontentloaded, not networkidle: MapLibre retries tile requests, so on a
  // network where the tile host is unreachable the page never goes idle. That
  // is also the degraded path this script is useful for exercising.
  await page.goto(`${baseUrl}${pad}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page
    .locator(".py-marker")
    .first()
    .waitFor({ timeout: 8_000 })
    .catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/${naam}-390.png`, fullPage: true });

  const markers = await page.locator(".py-marker").count();
  const dimmed = await page.locator(".py-marker--gedimd").count();
  const canvas = await page.locator("canvas.maplibregl-canvas").count();
  console.log(
    `${naam.padEnd(22)} markers=${markers} gedimd=${dimmed} canvas=${canvas}`,
  );
  await page.close();
}

await browser.close();

if (consoleErrors.length > 0) {
  console.log("\nconsole errors:");
  for (const err of consoleErrors.slice(0, 12)) console.log("  -", err);
}
