// Generates the app's brand icons (rising sun over a horizon, on the
// pre-dawn night-0 background) from a single inline SVG source.
//
// Run with: node scripts/generate-icons.mjs
// Requires the `sharp` devDependency. Outputs:
//   public/favicon.svg            (vector, browser tab)
//   public/pwa-192.png            (PWA icon, rounded)
//   public/pwa-512.png            (PWA icon, rounded)
//   public/pwa-maskable-512.png   (PWA icon, full-bleed for adaptive masks)

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');

const NIGHT_0 = '#0F0E16';
const EMBER = '#F4703B';
const GOLD = '#FBBE5A';
const HORIZON = 'rgba(237, 230, 218, 0.4)'; // cream, dimmed — a hazy line, not a stroke

/**
 * Rising-sun mark: a warm ember-to-gold semicircle resting on a thin
 * horizon line, centered in a 512x512 canvas. Every mark coordinate stays
 * within ~120px of the 256,256 center, comfortably inside the ~205px
 * (80% diameter) safe circle that adaptive icon masks crop to.
 *
 * @param {boolean} rounded - bake rounded corners into the background
 *   (true for favicon/regular icons). Maskable icons must stay full-bleed
 *   square so the OS's own mask shape has no gaps to show through.
 */
function iconSvg({ rounded }) {
  const bg = rounded
    ? `<rect width="512" height="512" rx="115" fill="${NIGHT_0}"/>`
    : `<rect width="512" height="512" fill="${NIGHT_0}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="sun" x1="256" y1="160" x2="256" y2="280" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${GOLD}"/>
      <stop offset="1" stop-color="${EMBER}"/>
    </linearGradient>
  </defs>
  ${bg}
  <rect x="136" y="278" width="240" height="5" rx="2.5" fill="${HORIZON}"/>
  <path d="M 136 280 A 120 120 0 0 1 376 280 Z" fill="url(#sun)"/>
</svg>`;
}

async function renderPng(svg, size, outPath) {
  await sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`wrote ${outPath}`);
}

async function main() {
  if (!existsSync(publicDir)) await mkdir(publicDir, { recursive: true });

  const regular = iconSvg({ rounded: true });
  const maskable = iconSvg({ rounded: false });

  // Favicon: same mark, written straight to disk as vector.
  const faviconPath = resolve(publicDir, 'favicon.svg');
  await writeFile(faviconPath, regular);
  console.log(`wrote ${faviconPath}`);

  await renderPng(regular, 192, resolve(publicDir, 'pwa-192.png'));
  await renderPng(regular, 512, resolve(publicDir, 'pwa-512.png'));
  await renderPng(maskable, 512, resolve(publicDir, 'pwa-maskable-512.png'));

  // Unused Vite scaffold icon — superseded by the generated set above.
  const scaffoldIcons = resolve(publicDir, 'icons.svg');
  if (existsSync(scaffoldIcons)) {
    await rm(scaffoldIcons);
    console.log(`removed ${scaffoldIcons}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
