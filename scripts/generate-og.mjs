import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const fontPath = resolve(__dir, '../public/fonts/InterVariable.ttf');
const fontB64 = readFileSync(fontPath).toString('base64');
const outDir = resolve(__dir, '../public/images');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const pages = [
  {
    out: 'og-home.png',
    tag: 'Subscription Tracker',
    lines: ['Track every subscription.', 'Spend nothing on surprises.'],
    fontSize: 68,
  },
  {
    out: 'og-pricing.png',
    tag: 'Pricing',
    lines: ['Simple, honest pricing.'],
    fontSize: 76,
  },
  {
    out: 'og-faqs.png',
    tag: 'FAQs',
    lines: ['Common questions,', 'honest answers.'],
    fontSize: 76,
  },
  {
    out: 'og-contact.png',
    tag: 'Contact',
    lines: ["We're here to help."],
    fontSize: 76,
  },
];

// Rough character width estimation for badge sizing (Inter, font-size 18)
function estimateBadgeWidth(text) {
  return Math.round(text.length * 10.5 + 48);
}

function buildSvg({ tag, lines, fontSize }) {
  const badgeW = estimateBadgeWidth(tag);
  const lh = Math.round(fontSize * 1.2);
  const titleY = lines.length === 1
    ? Math.round(630 / 2 + fontSize * 0.35)
    : Math.round(630 / 2 - lh * 0.1);

  const textLines = lines
    .map((line, i) => {
      const y = lines.length === 1 ? titleY : titleY + i * lh;
      return `<text x="96" y="${y}" font-family="Inter" font-size="${fontSize}" font-weight="700" fill="#1a1a1a">${escXml(line)}</text>`;
    })
    .join('\n  ');

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: 'Inter';
        src: url('data:font/ttf;base64,${fontB64}');
        font-weight: 100 900;
      }
    </style>
  </defs>
  <rect width="1200" height="630" fill="#f5f0eb"/>
  <rect x="96" y="68" width="${badgeW}" height="42" rx="21" fill="none" stroke="#ff592c" stroke-width="2"/>
  <text x="${96 + badgeW / 2}" y="94.5" text-anchor="middle" dominant-baseline="middle"
        font-family="Inter" font-size="18" font-weight="500" fill="#ff592c">${escXml(tag)}</text>
  ${textLines}
  <text x="96" y="574" font-family="Inter" font-size="32" font-weight="700" fill="#ff592c">Countist</text>
  <text x="1104" y="574" text-anchor="end" font-family="Inter" font-size="20" font-weight="400" fill="#706860">countist.app</text>
</svg>`;
}

function escXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function generate(page) {
  const svg = buildSvg(page);
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png = resvg.render().asPng();
  writeFileSync(resolve(outDir, page.out), png);
  console.log(`  ✓ ${page.out}`);
}

console.log('Generating OG images...');
for (const page of pages) await generate(page);
console.log('Done.');
