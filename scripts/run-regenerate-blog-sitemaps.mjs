import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { regenerateBlogSitemaps } = require("./sitemap-blog-regenerate.js");

const result = await regenerateBlogSitemaps();
process.stdout.write(`${JSON.stringify(result)}\n`);
process.exit(result.ok ? 0 : 1);
