import { NextResponse } from "next/server";
import { fetchAllProjects, fetchLatestBlogs } from "@/app/_global_components/masterFunction";
import { projectLatestTimestamp } from "@/app/(home)/components/home/recommendedSpotlight";

function toTime(value) {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

export async function GET() {
  try {
    const [blogs, projects] = await Promise.all([fetchLatestBlogs(1), fetchAllProjects()]);
    const blog = Array.isArray(blogs) ? blogs[0] : null;
    const blogSlug = blog?.slugUrl || blog?.slugURL;
    const project = Array.isArray(projects)
      ? [...projects]
          .filter((item) => item?.slugURL && item?.projectName)
          .sort((a, b) => projectLatestTimestamp(b) - projectLatestTimestamp(a))[0]
      : null;

    const items = [];
    if (blog && blogSlug && blog.blogTitle) {
      items.push({
        kind: "blog",
        eyebrow: "Newly added",
        title: "Have a look at this story",
        href: `/blog/${blogSlug}`,
        at: toTime(blog.updatedAt || blog.createdAt),
        name: String(blog.blogTitle).trim(),
      });
    }
    if (project?.slugURL && project.projectName) {
      items.push({
        kind: "project",
        eyebrow: "Newly added",
        title: "Have a look on this property",
        href: `/${project.slugURL}`,
        at: projectLatestTimestamp(project),
        name: String(project.projectName).trim(),
      });
    }

    items.sort((a, b) => (b.at || 0) - (a.at || 0));
    return NextResponse.json({ items }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
