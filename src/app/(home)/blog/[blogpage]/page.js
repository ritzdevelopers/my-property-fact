import { notFound } from "next/navigation";
import BlogDetail from "./blogpage";
import {
  fetchBlogBySlug,
  fetchLatestBlogs,
} from "@/app/_global_components/masterFunction";
import JsonLdScript from "@/app/_global_components/jsonLd/JsonLdScript";
import {
  buildBlogArticleJsonLd,
  buildFaqJsonLd,
  resolveBlogFaqItemsForSchema,
} from "@/app/_global_components/jsonLd/buildJsonLd";

export async function generateMetadata({ params }) {
    const { blogpage } = await params;
    const res = await fetchBlogBySlug(blogpage);

    if (!res) {
      return {
        title: "Blog Not Found | My Property Fact",
        description: "The requested blog article could not be found.",
        alternates: {
          canonical: `/blog/${blogpage}`,
        },
      };
    }

    return {
        title: res.blogTitle,
        description: res.blogMetaDescription,
        keywords: res.blogKeywords,
        alternates: {
            canonical: `/blog/${blogpage}`,
        },
    };
}

export default async function BlogPage({ params }) {
  const { blogpage } = await params;
  const blogDetail = await fetchBlogBySlug(blogpage);

  if (!blogDetail) {
    notFound();
  }

  const articleSchema = buildBlogArticleJsonLd(blogDetail);
  const faqSchema = buildFaqJsonLd(resolveBlogFaqItemsForSchema(blogDetail));

  const sidebarRecentPosts = await fetchLatestBlogs(3);

  return (
    <>
      <JsonLdScript data={[articleSchema, faqSchema]} />
      <BlogDetail
        blogDetail={blogDetail}
        sidebarRecentPosts={sidebarRecentPosts}
      />
    </>
  );
}