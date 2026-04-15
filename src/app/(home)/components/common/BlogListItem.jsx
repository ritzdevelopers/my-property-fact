import Image from "next/image";
import Link from "next/link";
import "./common.css";

function blogFeaturedImageAlt(blogTitle) {
  return blogTitle?.trim()
    ? `${blogTitle.trim()} — blog featured image on My Property Fact`
    : "Blog featured image on My Property Fact";
}

export default function BlogListItem({ blog }) {
  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", { dateStyle: "medium" });
  const excerpt =
    (blog.blogMetaDescription || "").split(/\s+/).slice(0, 35).join(" ") +
    " ...";
  const featuredAlt = blogFeaturedImageAlt(blog.blogTitle);
  const authorLabel = String(blog?.authorName || "").trim() || "Admin";
  return (
    <div className="card-blog border-0 shadow-sm mb-4">
      {blog.blogImage && (
        <Link href={`/blog/${blog.slugUrl}`} className="d-block" title={blog.blogTitle}>
          <Image
            width={1200}
            height={628}
            src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${blog.blogImage}`}
            alt={featuredAlt}
            title={featuredAlt}
            className="img-fluid"
          />
        </Link>
      )}
      <div className="p-4">
        <h3 className="mb-2 blog-typography-title">
          <Link
            href={`/blog/${blog.slugUrl}`}
            className="text-decoration-none"
            title={blog.blogTitle}
          >
            {blog.blogTitle}
          </Link>
        </h3>
        <div className="text-muted mb-3">
          By <span className="fw-semibold">{authorLabel}</span>,{" "}
          {formatDate(blog.createdAt)}
        </div>
        <div className="blog-meta-divider mb-3"></div>
        <p className="mb-3 blog-typography-content">{excerpt}</p>
        <Link href={`/blog/${blog.slugUrl}`} className="read-more-link">
          Read more <span>→</span>
        </Link>
      </div>
    </div>
  );
}
