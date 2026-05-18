import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const publicDir = resolve(process.cwd(), 'public');

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="18 24 110 112" width="110" height="112">
  <defs>
    <style>
      .hub-center { fill: #0F6E56; }
      .hub-mid { fill: #1D9E75; }
      .hub-outer { fill: #5DCAA5; }
      .hub-arc { stroke: #5DCAA5; fill: none; }
      .hub-line { stroke: #1D9E75; }
    </style>
  </defs>
  <circle cx="72" cy="80" r="52" class="hub-arc" stroke-width="0.8" opacity="0.2" stroke-dasharray="5 5"/>
  <circle cx="72" cy="80" r="34" class="hub-arc" stroke-width="0.7" opacity="0.15" stroke-dasharray="4 5"/>
  <line x1="72" y1="80" x2="72"  y2="46"  class="hub-line" stroke-width="1.1" opacity="0.35"/>
  <line x1="72" y1="80" x2="101" y2="97"  class="hub-line" stroke-width="1.1" opacity="0.35"/>
  <line x1="72" y1="80" x2="43"  y2="97"  class="hub-line" stroke-width="1.1" opacity="0.35"/>
  <line x1="72" y1="80" x2="118" y2="52"  class="hub-line" stroke-width="0.8" opacity="0.2"/>
  <line x1="72" y1="80" x2="122" y2="114" class="hub-line" stroke-width="0.8" opacity="0.2"/>
  <line x1="72" y1="80" x2="42"  y2="130" class="hub-line" stroke-width="0.8" opacity="0.2"/>
  <circle cx="72"  cy="46"  r="6.5" class="hub-mid"   opacity="0.9"/>
  <circle cx="101" cy="97"  r="6.5" class="hub-mid"   opacity="0.9"/>
  <circle cx="43"  cy="97"  r="6.5" class="hub-mid"   opacity="0.9"/>
  <circle cx="118" cy="52"  r="4.5" class="hub-outer" opacity="0.65"/>
  <circle cx="122" cy="114" r="4.5" class="hub-outer" opacity="0.65"/>
  <circle cx="42"  cy="130" r="4.5" class="hub-outer" opacity="0.65"/>
  <circle cx="72" cy="80" r="22" class="hub-center" opacity="0.08"/>
  <circle cx="72" cy="80" r="13" class="hub-center" opacity="0.14"/>
  <circle cx="72" cy="80" r="7"  class="hub-center" opacity="1"/>
</svg>`;

// Write the icon SVG so it lives alongside the full logo
writeFileSync(resolve(publicDir, 'logo-icon.svg'), iconSvg);
console.log('Wrote public/logo-icon.svg');

// Convert full logo — 2× scale (1040×320)
const fullSvg = readFileSync(resolve(publicDir, 'logo-full.svg'));
await sharp(fullSvg, { density: 192 })
  .png()
  .toFile(resolve(publicDir, 'logo-full.png'));
console.log('Wrote public/logo-full.png  (1040×320 @2×)');

// Convert icon — 256×256 (square, good for favicons / app icons)
await sharp(Buffer.from(iconSvg), { density: 192 })
  .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(resolve(publicDir, 'logo-icon.png'));
console.log('Wrote public/logo-icon.png  (256×256, transparent bg)');
