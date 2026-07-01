import { revalidatePath } from "next/cache";
import { regenerateBlogSitemaps } from "@/lib/regenerateBlogSitemaps";

/** Bust blog pages and refresh sitemap-0.xml after admin blog changes. */
export async function revalidateBlogListingPages() {
  revalidatePath("/blog");
  revalidatePath("/blog", "layout");

  try {
    const result = await regenerateBlogSitemaps();
    if (!result.ok) {
      console.error(
        "[revalidateBlogListingPages] Sitemap regeneration failed:",
        result.error,
      );
    }
    return result;
  } catch (error) {
    console.error("[revalidateBlogListingPages] Sitemap regeneration threw:", error);
    return {
      ok: false,
      blogCount: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
