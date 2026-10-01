/**
 * Compress homepage static assets that are served far larger than displayed.
 * Usage: node scripts/optimize-home-static-images.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public");

const CITY_PILL_SOURCES = [
  ["agra", "agra_new.png"],
  ["delhi", "delhi_new.png"],
  ["noida", "noida_new.png"],
  ["ghaziabad", "ghaziabad_new.png"],
  ["gurugram", "gurugram_new.png"],
  ["bangalore", "bangalore_new.png"],
  ["jaipur", "jaipur_new.png"],
  ["mumbai", "mumbai_new.png"],
];

async function writeIfSmaller(outPath, buffer) {
  let before = 0;
  try {
    const stat = await fs.stat(outPath);
    before = stat.size;
  } catch {
    before = 0;
  }
  if (before > 0 && buffer.length >= before) {
    console.log("skip (not smaller)", path.relative(ROOT, outPath), `${Math.round(before / 1024)}KB kept`);
    return;
  }
  await fs.writeFile(outPath, buffer);
  console.log(
    "wrote",
    path.relative(ROOT, outPath),
    `${Math.round(buffer.length / 1024)}KB`,
    before ? `(was ${Math.round(before / 1024)}KB)` : "",
  );
}

async function buildCityPills() {
  const outDir = path.join(ROOT, "dream-cities", "pills");
  await fs.mkdir(outDir, { recursive: true });

  for (const [slug, file] of CITY_PILL_SOURCES) {
    const src = path.join(ROOT, "dream-cities", file);
    const out = path.join(outDir, `${slug}_pill.webp`);
    const buf = await sharp(src)
      .resize(48, 48, { fit: "cover", position: "centre" })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    await writeIfSmaller(out, buf);
  }
}

async function compressExpertInsightsBg() {
  const src = path.join(ROOT, "static", "home-meta-data", "bg image.png");
  const out = path.join(ROOT, "static", "home-meta-data", "bg-image-home.webp");
  const buf = await sharp(src)
    .resize(1920, null, { withoutEnlargement: true })
    .webp({ quality: 78, effort: 4 })
    .toBuffer();
  await writeIfSmaller(out, buf);
}

async function compressDreamSectionBg() {
  const src = path.join(ROOT, "dream-cities", "image 1009.png");
  const out = path.join(ROOT, "dream-cities", "dream-section-bg.webp");
  const buf = await sharp(src)
    .resize(1920, null, { withoutEnlargement: true })
    .webp({ quality: 78, effort: 4 })
    .toBuffer();
  await writeIfSmaller(out, buf);
}

await buildCityPills();
await compressExpertInsightsBg();
await compressDreamSectionBg();
