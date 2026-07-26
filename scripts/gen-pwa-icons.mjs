// Generates the PWA / TWA icon PNGs from the brand SVG (app/icon.svg).
// Vector is rasterized directly at each target size for crisp output.
//
//   node scripts/gen-pwa-icons.mjs
//
// Output: public/icons/icon-{192,512}.png  (declared "any maskable")
// Re-run any time the source SVG changes.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "app/icon.svg");
const OUT_DIR = join(root, "public/icons");

const SIZES = [192, 512];

async function main() {
  const svg = await readFile(SRC, "utf8");
  await mkdir(OUT_DIR, { recursive: true });

  for (const size of SIZES) {
    // Inject explicit width/height so sharp rasterizes the vector at the
    // target resolution instead of upscaling a small intrinsic raster.
    const sized = svg.replace(
      /<svg /,
      `<svg width="${size}" height="${size}" `,
    );
    const dest = join(OUT_DIR, `icon-${size}.png`);
    await sharp(Buffer.from(sized)).png().toFile(dest);
    console.log(`✓ ${dest} (${size}×${size})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
