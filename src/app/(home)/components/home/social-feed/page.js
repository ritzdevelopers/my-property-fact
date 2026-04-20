import { fetchBlogs } from "@/app/_global_components/masterFunction";
import SocialFeed from "./socialfeed";

export const dynamic = "force-dynamic";

/** Latest first; used to drop the newest post from the home section. */
function getBlogTimestamp(b) {
  const raw = b?.createdAt ?? b?.updatedAt ?? b?.publishedAt;
  if (raw == null) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Home shows up to 4 older posts. The single newest post (by date) is omitted so it
 * only appears on /blog until it is no longer the newest.
 */
function blogsForHomeSection(content) {
  const list = Array.isArray(content) ? content : [];
  if (list.length === 0) return [];
  const sorted = [...list].sort(
    (a, b) => getBlogTimestamp(b) - getBlogTimestamp(a),
  );
  const withoutNewest = sorted.slice(1);
  return withoutNewest.slice(0, 4);
}

export default async function SocialFeedPage() {
  const list = await fetchBlogs(0, 16, "", "blog");
  const raw = list?.content ?? [];
  const forHome = blogsForHomeSection(raw);

  if (forHome.length === 0) {
    return null;
  }

  return <SocialFeed data={forHome} />;
}
