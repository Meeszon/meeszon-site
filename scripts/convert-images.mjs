// One-shot: convert raster screenshots in public/images to WebP.
// Downscales to <=1920px on the long edge (lightbox-safe) and deletes the
// originals once a smaller WebP is written. SVGs and videos are left alone.
import sharp from "sharp";
import { readdir, stat, unlink } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = "public/images";
const MAX_DIM = 1920;
const QUALITY = 80;
const RASTER = new Set([".png", ".jpg", ".jpeg"]);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const fmt = (n) => (n / 1024).toFixed(0).padStart(5) + " KB";
let totalBefore = 0,
  totalAfter = 0,
  count = 0;

for await (const file of walk(ROOT)) {
  if (!RASTER.has(extname(file).toLowerCase())) continue;
  const out = file.replace(/\.(png|jpe?g)$/i, ".webp");
  const before = (await stat(file)).size;

  await sharp(file)
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(out);

  const after = (await stat(out)).size;
  await unlink(file);

  totalBefore += before;
  totalAfter += after;
  count++;
  const pct = (100 * (1 - after / before)).toFixed(0);
  console.log(`${fmt(before)} -> ${fmt(after)}  (-${pct}%)  ${file}`);
}

console.log("\n" + "-".repeat(60));
console.log(
  `${count} files   ${fmt(totalBefore)} -> ${fmt(totalAfter)}  ` +
    `(-${(100 * (1 - totalAfter / totalBefore)).toFixed(0)}%, saved ${fmt(totalBefore - totalAfter)})`,
);
