// Generates public/og/children-ai-learning.png (1200x630), the cover for the children-and-AI article.
// Run: node scripts/make-og-children-ai.mjs
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const W = 1200;
const H = 630;
const font = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f2a43"/>
      <stop offset="100%" stop-color="#1d5a7a"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="80" y="90" width="8" height="300" rx="4" fill="#ffd36b"/>
  <text x="120" y="160" font-family="${font}" font-size="60" font-weight="700" fill="#ffffff">When AI can do a child's</text>
  <text x="120" y="238" font-family="${font}" font-size="60" font-weight="700" fill="#ffffff">homework, who ensures</text>
  <text x="120" y="316" font-family="${font}" font-size="60" font-weight="700" fill="#ffd36b">the child is learning?</text>
  <text x="120" y="390" font-family="${font}" font-size="30" fill="#cfe3ef">A shared responsibility: families, schools, AI companies, governments</text>
  <text x="80" y="560" font-family="${font}" font-size="32" font-weight="700" fill="#ffffff">Pavan Turlapati</text>
  <text x="80" y="598" font-family="${font}" font-size="24" fill="#cfe3ef">pavanturlapati.com</text>
</svg>`;

mkdirSync("public/og", { recursive: true });
await sharp(Buffer.from(svg)).png().toFile("public/og/children-ai-learning.png");
console.log("Wrote public/og/children-ai-learning.png");
