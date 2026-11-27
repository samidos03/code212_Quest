#!/usr/bin/env node
/**
 * Génère l'emblème « Directeur · Super Admin » de Code212 Quest.
 *
 * Sorties :
 *   public/avatars/super-admin.svg        (vectoriel, police embarquée)
 *   public/avatars/super-admin-{512,256,128,64}.png
 *
 * Le SVG est la source de vérité : les PNG sont des exports de ce même fichier.
 * Usage : node scripts/generate-avatar-assets.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const outDir = path.join(root, 'public', 'avatars')
fs.mkdirSync(outDir, { recursive: true })

/* ------------------------------------------------------- police embarquée */

const fontB64 = fs.readFileSync(path.join(root, 'public', 'fonts', 'rajdhani-700.woff2')).toString('base64')

/* ------------------------------------------------------------- géométrie */

const CX = 256
const CY = 256

/** Feuille de laurier positionnée le long d'un arc, inclinée vers l'extérieur. */
function laurel(side) {
  const leaves = []
  const cx = CX
  const cy = CY + 16
  const r = 172
  // Arc de bas en haut, symétrique gauche/droite. La longueur s'affine aux extrémités.
  const angles = [122, 131, 140, 149, 158, 167, 176, 185, 194, 203, 212, 221]
  angles.forEach((deg, i) => {
    const rad = (deg * Math.PI) / 180
    const x = cx + side * Math.cos(rad) * r
    const y = cy + Math.sin(rad) * r
    const taper = 0.62 + 0.38 * Math.sin((i / (angles.length - 1)) * Math.PI)
    const ry = 17 * taper
    const rx = 5.6 * taper
    const tangent = deg + (side > 0 ? 90 : -90)
    leaves.push(
      `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="url(#gold)" opacity="${(0.55 + 0.4 * taper).toFixed(2)}" transform="rotate(${tangent.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`,
    )
  })
  // Tige du laurier
  const stem = angles
    .map((deg) => {
      const rad = (deg * Math.PI) / 180
      return `${(cx + side * Math.cos(rad) * (r + 13)).toFixed(1)},${(cy + Math.sin(rad) * (r + 13)).toFixed(1)}`
    })
    .join(' ')
  leaves.push(`<polyline points="${stem}" fill="none" stroke="#c89b2c" stroke-width="2.4" stroke-linecap="round" opacity="0.55"/>`)
  return leaves.join('\n      ')
}

/** Étoile à quatre branches (éclat de la charte). */
function sparkle(x, y, size, color, opacity = 1) {
  const h = size / 2
  const w = size / 6
  return `<path d="M ${x} ${y - h} Q ${x + w} ${y - w} ${x + h} ${y} Q ${x + w} ${y + w} ${x} ${y + h} Q ${x - w} ${y + w} ${x - h} ${y} Q ${x - w} ${y - w} ${x} ${y - h} Z" fill="${color}" opacity="${opacity}"/>`
}

/* --------------------------------------------------------------- assemblage */

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="Blason Directeur Code212">
  <title>Code212 Quest — Directeur / Super Admin</title>
  <defs>
    <style>@font-face{font-family:'Rajdhani';font-style:normal;font-weight:700;src:url(data:font/woff2;base64,${fontB64}) format('woff2');}</style>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c5027f"/>
      <stop offset="52%" stop-color="#6701e6"/>
      <stop offset="100%" stop-color="#00dfff"/>
    </linearGradient>
    <radialGradient id="core" cx="50%" cy="34%" r="72%">
      <stop offset="0%" stop-color="#331863"/>
      <stop offset="58%" stop-color="#190c30"/>
      <stop offset="100%" stop-color="#0a0517"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="0.25" y2="1">
      <stop offset="0%" stop-color="#fff0c2"/>
      <stop offset="42%" stop-color="#e8b84b"/>
      <stop offset="100%" stop-color="#9d7012"/>
    </linearGradient>
    <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c5027f"/>
      <stop offset="55%" stop-color="#6701e6"/>
      <stop offset="100%" stop-color="#00dfff"/>
    </linearGradient>
    <linearGradient id="crown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffeab0"/>
      <stop offset="55%" stop-color="#e8b84b"/>
      <stop offset="100%" stop-color="#b07f1c"/>
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="34%" r="62%">
      <stop offset="55%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#05030d" stop-opacity="0.75"/>
    </radialGradient>
    <radialGradient id="aura" cx="50%" cy="50%" r="50%">
      <stop offset="55%" stop-color="#6701e6" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#6701e6" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0a0517" flood-opacity="0.55"/>
    </filter>
    <clipPath id="disc"><circle cx="${CX}" cy="${CY}" r="214"/></clipPath>
  </defs>

  <!-- aura -->
  <circle cx="${CX}" cy="${CY}" r="250" fill="url(#aura)"/>

  <!--anneau extérieur -->
  <circle cx="${CX}" cy="${CY}" r="238" fill="none" stroke="url(#rim)" stroke-width="13"/>
  <circle cx="${CX}" cy="${CY}" r="238" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.22"/>

  <!-- núcleo -->
  <circle cx="${CX}" cy="${CY}" r="216" fill="url(#core)"/>
  <circle cx="${CX}" cy="${CY}" r="216" fill="none" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="${CX}" cy="${CY}" r="201" fill="none" stroke="#e8b84b" stroke-width="1.6" stroke-dasharray="3 10" opacity="0.45"/>
  <circle cx="${CX}" cy="${CY}" r="216" fill="url(#vignette)" opacity="0.55"/>

  <g clip-path="url(#disc)">
    <!-- lauriers -->
    <g>
      ${laurel(1)}
    </g>
    <g>
      ${laurel(-1)}
    </g>

    <!-- écarts -->
    ${sparkle(152, 232, 26, '#00dfff', 0.9)}
    ${sparkle(364, 268, 20, '#ffffff', 0.75)}
    ${sparkle(340, 178, 15, '#ffe6a3', 0.8)}
    ${sparkle(168, 322, 14, '#c5027f', 0.85)}

    <!-- tuile 212 -->
    <g filter="url(#shadow)">
      <rect x="170" y="198" width="172" height="172" rx="42" fill="url(#tile)"/>
      <rect x="170" y="198" width="172" height="172" rx="42" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.28"/>
      <text x="256" y="312" text-anchor="middle" font-family="Rajdhani, Inter, sans-serif" font-weight="700" font-size="118" letter-spacing="-6" fill="#ffffff">212</text>
    </g>

    <!-- devise -->
    <path d="M 186 396 L 326 396" stroke="url(#gold)" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
  </g>
  <!-- couronne de direction, posée sur l'anneau -->
  <g filter="url(#shadow)">
    <path d="M 190 100 L 190 48 L 219 78 L 256 32 L 293 78 L 322 48 L 322 100 Z" fill="url(#crown)"/>
    <path d="M 190 100 L 322 100 L 322 114 L 190 114 Z" fill="url(#gold)"/>
    <path d="M 190 100 L 322 100 L 322 106 L 190 106 Z" fill="#fff6dd" opacity="0.45"/>
    <circle cx="190" cy="44" r="8" fill="#fff3cd"/>
    <circle cx="322" cy="44" r="8" fill="#fff3cd"/>
    <circle cx="256" cy="28" r="10" fill="#00dfff"/>
    <circle cx="256" cy="28" r="18" fill="#00dfff" opacity="0.3"/>
  </g>
</svg>
`

const svgPath = path.join(outDir, 'super-admin.svg')
fs.writeFileSync(svgPath, svg, 'utf8')
console.log('✓', path.relative(root, svgPath))

/* ------------------------------------------------------------ exports PNG */

async function exportPng() {
  let chromium
  try {
    const mod = await import('/usr/local/lib/node_modules/playwright/index.js')
    chromium = mod.default.chromium
  } catch {
    console.warn('· Playwright indisponible : exports PNG ignorés.')
    return
  }

  const executablePath = [
    '/root/.cache/ms-playwright/chromium-1243/chrome-linux/chrome',
    '/workspace/.home/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
  ].find((p) => fs.existsSync(p))

  const browser = await chromium.launch({
    executablePath,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })

  for (const size of [512, 256, 128, 64]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
    await page.setContent(
      `<!doctype html><html><body style="margin:0;background:transparent">${svg.replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`,
    )
    await page.waitForTimeout(400)
    const file = path.join(outDir, `super-admin-${size}.png`)
    await page.screenshot({ path: file, omitBackground: true })
    await page.close()
    console.log('✓', path.relative(root, file))
  }

  await browser.close()
}

await exportPng()
