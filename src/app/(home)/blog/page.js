import {
  fetchBlogs,
  fetchAllProjects,
  getWeeklyProject,
} from "@/app/_global_components/masterFunction";
import Blog from "./blog";

export const metadata = {
  title:
    "Real Estate Blogs | Market Trends & Property Insights – MyPropertyFact",
  description:
    "Explore expert articles on real estate trends, property investment tips, and market insights across India. Stay informed with MyPropertyFact's latest blogs.",
  alternates: {
    canonical: "/blog",
  },
};

export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const pageNum = Math.max(
    1,
    parseInt(String(sp?.page ?? "1"), 10) || 1,
  );
  const pageIndex = pageNum - 1;
  const pageSize = 3;

  const [blogsData, recentData, projects] = await Promise.all([
    fetchBlogs(pageIndex, pageSize, ""),
    fetchBlogs(0, 3, ""),
    fetchAllProjects(),
  ]);

  const blogsList = blogsData?.content ?? [];
  const totalPages = Math.max(1, blogsData?.totalPages ?? 1);
  const sidebarRecentPosts = recentData?.content ?? [];
  const projectArr = Array.isArray(projects) ? projects : [];
  const sidebarLatestProject = getWeeklyProject(projectArr);

  return (
    <Blog
      initialBlogs={blogsList}
      initialPageIndex={pageIndex}
      totalPages={totalPages}
      sidebarRecentPosts={sidebarRecentPosts}
      sidebarLatestProject={sidebarLatestProject}
    />
  );
}
