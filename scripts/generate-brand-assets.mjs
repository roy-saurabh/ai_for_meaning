/**
 * Generates the favicon suite, PWA icons and the Open Graph image from HTML/Canvas using Playwright.
 * Outputs are committed to public/; run again only when the brand mark changes:
 *   node scripts/generate-brand-assets.mjs
 * Fonts are fetched from Google Fonts at generation time only (never at site runtime).
 */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const out = path.resolve('public');
await mkdir(path.join(out, 'icons'), { recursive: true });

const orbScript = `
function drawOrb(ctx, cx, cy, R, { halo = 1, rim = true } = {}) {
  ctx.globalCompositeOperation = 'lighter';
  let g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 3.2);
  g.addColorStop(0, 'rgba(154,140,255,' + 0.16 * halo + ')');
  g.addColorStop(0.5, 'rgba(154,140,255,' + 0.05 * halo + ')');
  g.addColorStop(1, 'rgba(154,140,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 3.2, 0, 7); ctx.fill();
  g = ctx.createRadialGradient(cx, cy - R * 0.1, R * 0.05, cx, cy, R * 1.15);
  g.addColorStop(0, 'rgba(242,193,78,0.55)'); g.addColorStop(0.5, 'rgba(232,147,91,0.22)'); g.addColorStop(1, 'rgba(232,147,91,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.15, 0, 7); ctx.fill();
  g = ctx.createRadialGradient(cx, cy - R * 0.06, 0, cx, cy, R * 0.55);
  g.addColorStop(0, 'rgba(255,250,238,1)'); g.addColorStop(0.35, 'rgba(255,226,170,0.8)'); g.addColorStop(1, 'rgba(255,226,170,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 0.55, 0, 7); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  if (rim) { ctx.strokeStyle = 'rgba(154,140,255,0.35)'; ctx.lineWidth = Math.max(1, R * 0.06); ctx.beginPath(); ctx.arc(cx, cy, R * 1.55, 0, 7); ctx.stroke(); }
}`;

const browser = await chromium.launch();

async function renderIcon(size, { maskable = false } = {}) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:#09091A"><canvas id="c" width="${size}" height="${size}"></canvas><script>${orbScript}
    const c = document.getElementById('c'); const ctx = c.getContext('2d');
    ctx.fillStyle = '#09091A'; ctx.fillRect(0, 0, ${size}, ${size});
    const bg = ctx.createRadialGradient(${size / 2}, ${size / 2}, 0, ${size / 2}, ${size / 2}, ${size * 0.7});
    bg.addColorStop(0, '#15152F'); bg.addColorStop(1, '#09091A'); ctx.fillStyle = bg; ctx.fillRect(0, 0, ${size}, ${size});
    drawOrb(ctx, ${size / 2}, ${size / 2}, ${size * (maskable ? 0.16 : 0.22)}, { halo: 1, rim: ${size >= 48} });
  </script></body></html>`);
  const buf = await page.locator('#c').screenshot({ omitBackground: false });
  await page.close();
  return buf;
}

const sizes = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180, 'favicon-32.png': 32, 'favicon-16.png': 16 };
const pngs = {};
for (const [name, size] of Object.entries(sizes)) {
  pngs[name] = await renderIcon(size);
  await writeFile(path.join(out, 'icons', name), pngs[name]);
}
await writeFile(path.join(out, 'icons', 'maskable-512.png'), await renderIcon(512, { maskable: true }));
const fav48 = await renderIcon(48);

// favicon.ico: an ICO container holding PNG images (supported by all current browsers).
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  const entries = []; const datas = []; let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); e.writeUInt8(size >= 256 ? 0 : size, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(data.length, 8); e.writeUInt32LE(offset, 12);
    offset += data.length; entries.push(e); datas.push(data);
  }
  return Buffer.concat([header, ...entries, ...datas]);
}
await writeFile(path.join(out, 'favicon.ico'), ico([{ size: 16, data: pngs['favicon-16.png'] }, { size: 32, data: pngs['favicon-32.png'] }, { size: 48, data: fav48 }]));

// Open Graph image 1200×630
const og = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await og.setContent(`<html><head>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;1,9..144,400&family=Space+Mono&display=block" rel="stylesheet">
<style>
body{margin:0;width:1200px;height:630px;background:#09091A;overflow:hidden;font-family:'Fraunces',Georgia,serif;color:#F4F0E9}
.bg{position:absolute;inset:0;background:radial-gradient(700px 420px at 12% -10%,rgba(242,193,78,.08),transparent 60%),radial-gradient(760px 480px at 95% -8%,rgba(154,140,255,.13),transparent 60%),radial-gradient(900px 520px at 50% 120%,rgba(111,214,196,.07),transparent 60%)}
canvas{position:absolute;inset:0}
.t{position:absolute;left:0;right:0;top:372px;text-align:center}
h1{margin:0;font-weight:400;font-size:64px;letter-spacing:-.01em}
h1 i{color:#F2C14E}
p{margin:22px 0 0;font-style:italic;font-size:32px;color:#ADA6C2}
.m{position:absolute;bottom:40px;left:0;right:0;text-align:center;font-family:'Space Mono',monospace;font-size:15px;letter-spacing:.18em;color:#8A84AA;text-transform:uppercase}
</style></head><body><div class="bg"></div><canvas id="c" width="1200" height="630"></canvas>
<div class="t"><h1>AI for <i>Meaning</i></h1><p>A mirror, not a master.</p></div>
<div class="m">aiformeaning.com</div>
<script>${orbScript}
const ctx=document.getElementById('c').getContext('2d');drawOrb(ctx,600,212,58,{halo:1.2,rim:false});
</script></body></html>`, { waitUntil: 'networkidle' });
await og.evaluate(() => document.fonts.ready);
await og.screenshot({ path: path.join(out, 'og.png') });
await og.close();
await browser.close();

await writeFile(
  path.join(out, 'icons', 'icon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><radialGradient id="g" cx="50%" cy="47%" r="50%"><stop offset="0" stop-color="#FFF6E4"/><stop offset=".3" stop-color="#F2C14E"/><stop offset=".7" stop-color="#E8935B" stop-opacity=".35"/><stop offset="1" stop-color="#9A8CFF" stop-opacity="0"/></radialGradient></defs><rect width="64" height="64" rx="14" fill="#09091A"/><circle cx="32" cy="32" r="22" fill="none" stroke="#9A8CFF" stroke-opacity=".38" stroke-width="1.5"/><circle cx="32" cy="32" r="16" fill="url(#g)"/></svg>\n`,
);
console.log('Brand assets written to public/');
