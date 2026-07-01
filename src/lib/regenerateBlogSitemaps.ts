import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

export type RegenerateBlogSitemapsResult = {
  ok: boolean;
  blogCount: number;
  error?: string;
};

/** Regenerate blog URLs in public/sitemap-0.xml (runs outside the Next.js bundle). */
export async function regenerateBlogSitemaps(): Promise<RegenerateBlogSitemapsResult> {
  const scriptPath = path.join(
    process.cwd(),
    "scripts/run-regenerate-blog-sitemaps.mjs",
  );

  try {
    const { stdout } = await execFileAsync(process.execPath, [scriptPath], {
      cwd: process.cwd(),
      env: process.env,
      maxBuffer: 10 * 1024 * 1024,
    });

    const line = stdout.trim().split("\n").filter(Boolean).pop() || "{}";
    return JSON.parse(line) as RegenerateBlogSitemapsResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[regenerateBlogSitemaps] Failed to run sitemap script:", error);
    return { ok: false, blogCount: 0, error: message };
  }
}
