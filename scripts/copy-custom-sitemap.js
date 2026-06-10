const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "../data/sitemap-custom.xml");
const dest = path.join(__dirname, "../public/sitemap-custom.xml");

if (!fs.existsSync(src)) {
  console.error("[sitemap] data/sitemap-custom.xml not found — skipping custom sitemap copy");
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log("[sitemap] copied data/sitemap-custom.xml → public/sitemap-custom.xml");
