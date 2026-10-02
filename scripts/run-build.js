/**
 * Cross-platform production build.
 * `set NODE_OPTIONS=...` only works in Windows cmd, so the Linux server
 * was compiling with no memory cap and the kernel SIGKILLed the worker.
 * 2 GB forces earlier garbage collection on a small VPS. A 4 GB cap on a
 * machine with less RAM makes the kernel kill Node instead.
 */
const { spawnSync } = require("child_process");
const path = require("path");

const heapFlag = "--max-old-space-size=2048";
const current = process.env.NODE_OPTIONS || "";
if (!current.includes("max-old-space-size")) {
  process.env.NODE_OPTIONS = `${current} ${heapFlag}`.trim();
}

const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status == null ? 1 : result.status);
