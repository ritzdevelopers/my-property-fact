/**
 * Builds Independence Day hero variants from the desktop banner.
 *
 *   Mobile  360 × 811  (stored at 2× → 720 × 1622)
 *   Tablet  1024 × 630
 *
 * Usage: node scripts/build-i80-hero-banners.mjs
 */
import path from "node:path";
import sharp from "sharp";

const SRC = path.join(
  process.cwd(),
  "public/static/banners/mpf-i80-hero-desktop.jpg",
);
const OUT_DIR = path.join(process.cwd(), "public/static/banners");

const JPEG = {
  quality: 90,
  mozjpeg: true,
  chromaSubsampling: "4:4:4",
};

async function write(pipeline, file) {
  const info = await pipeline
    .sharpen({ sigma: 0.55 })
    .jpeg(JPEG)
    .toFile(path.join(OUT_DIR, file));
  console.log(file, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
}

const { width: srcW, height: srcH } = await sharp(SRC).metadata();

// Tablet — 1024 × 630. Source is a bit wider, so crop the sun flare on the
// far left and keep India Gate, the waterfront towers and the flag.
const tabletRatio = 1024 / 630;
const tabletExtractW = Math.min(srcW, Math.round(srcH * tabletRatio));
const tabletLeft = Math.max(0, srcW - tabletExtractW - 40);

await write(
  sharp(SRC)
    .extract({ left: tabletLeft, top: 0, width: tabletExtractW, height: srcH })
    .resize(1024, 630, { fit: "fill", kernel: "lanczos3" }),
  "mpf-i80-hero-tablet.jpg",
);

// Mobile — 360 × 811 artboard, written at 2× for retina. Vertical slice of
// the right side: towers, flag, gardens. A little extra sky is sampled from
// the top row so the tall frame does not stretch the buildings.
const mobileW = 720;
const mobileH = 1622;
const sliceW = 560;
const sliceLeft = srcW - sliceW;
const slice = await sharp(SRC)
  .extract({ left: sliceLeft, top: 0, width: sliceW, height: srcH })
  .png()
  .toBuffer();

const skyPad = Math.round(sliceW * (mobileH / mobileW) - srcH);
const wash = await sharp(slice)
  .extract({ left: 0, top: 0, width: sliceW, height: 8 })
  .resize({ width: sliceW, height: skyPad + 80, fit: "fill" })
  .blur(18)
  .toBuffer();

const composed = await sharp({
  create: {
    width: sliceW,
    height: srcH + skyPad,
    channels: 3,
    background: { r: 176, g: 210, b: 230 },
  },
})
  .composite([
    { input: wash, left: 0, top: 0 },
    { input: slice, left: 0, top: skyPad },
  ])
  .png()
  .toBuffer();

await write(
  sharp(composed).resize(mobileW, mobileH, { fit: "cover", position: "top", kernel: "lanczos3" }),
  "mpf-i80-hero-mobile.jpg",
);
