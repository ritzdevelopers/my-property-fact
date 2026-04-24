import { fetchBlogs } from "@/app/_global_components/masterFunction";
import SocialFeed from "./socialfeed";

/**
 * Home "Investor Education Blog": only posts published on these calendar days (IST).
 * Change `year` when you want a different campaign window.
 */
const HOME_BLOG_DATE_FILTER = {
  year: 2026,
  month: 4,
  days: [15, 16, 17],
};

function getBlogTimestamp(b) {
  const raw = b?.createdAt ?? b?.updatedAt ?? b?.publishedAt;
  if (raw == null) return 0;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Parse published/created time in Asia/Kolkata and match filter. */
function blogMatchesHomeDateFilter(blog) {
  const raw = blog?.createdAt ?? blog?.updatedAt ?? blog?.publishedAt;
  if (raw == null) return false;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return false;
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const [y, m, day] = ymd.split("-").map((x) => parseInt(x, 10));
  return (
    y === HOME_BLOG_DATE_FILTER.year &&
    m === HOME_BLOG_DATE_FILTER.month &&
    HOME_BLOG_DATE_FILTER.days.includes(day)
  );
}

function blogsForHomeSection(content) {
  const list = Array.isArray(content) ? content : [];
  const filtered = list.filter(blogMatchesHomeDateFilter);
  if (filtered.length === 0) return [];
  const sorted = [...filtered].sort(
    (a, b) => getBlogTimestamp(b) - getBlogTimestamp(a),
  );
  return sorted.slice(0, 4);
}

export default async function SocialFeedPage() {
  // Fetch enough rows to find posts on the allowed days (API returns recent first).
  const list = await fetchBlogs(0, 200, "", "blog");
  const raw = list?.content ?? [];
  const forHome = blogsForHomeSection(raw);

  if (forHome.length === 0) {
    return null;
  }

  return <SocialFeed data={forHome} />;
}
