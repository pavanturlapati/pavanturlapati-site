// Generates public/og/face-greeter.png (1200x630), the share image for the Face Greeter write-up.
// Run: node scripts/make-og-face-greeter.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const W = 1200;
const H = 630;
const font = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="75%">
      <stop offset="0%" stop-color="#fff7d6"/>
      <stop offset="40%" stop-color="#ffd36b"/>
      <stop offset="100%" stop-color="#b8741a"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <text x="50%" y="275" text-anchor="middle" font-family="${font}" font-size="104" font-weight="700" fill="#3a2200">Good night, Pavan!</text>
  <text x="50%" y="345" text-anchor="middle" font-family="${font}" font-size="36" fill="#6b4a1a">The door is open. Come on in.</text>
  <text x="50%" y="520" text-anchor="middle" font-family="${font}" font-size="44" font-weight="700" fill="#3a2200">Face Greeter</text>
  <text x="50%" y="568" text-anchor="middle" font-family="${font}" font-size="28" fill="#6b4a1a">greeter.pavanturlapati.com</text>
</svg>`;

mkdirSync("public/og", { recursive: true });
await sharp(Buffer.from(svg)).png().toFile("public/og/face-greeter.png");
console.log("Wrote public/og/face-greeter.png");
