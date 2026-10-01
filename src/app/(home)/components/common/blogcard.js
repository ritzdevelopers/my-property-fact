"use client";
import Link from "next/link";
import { getBlogAuthorDisplayName } from "./blogAuthor";
import { buildHomeCardImageProps, HOME_BLOG_CARD_SIZES } from "@/lib/optimizedImage";
import './common.css';
export default function BlogCard({ blog }) {

    const featuredImageAlt = blog.blogTitle
      ? `${blog.blogTitle} — blog featured image on My Property Fact`
      : "Blog featured image on My Property Fact";

    const authorLabel = getBlogAuthorDisplayName(blog, "My Property Fact");

    const truncateWords = (text, wordLimit) => {
        const words = text.trim().split(/\s+/);
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(" ") + " ...";
    };

    return (
        <>
            <Link href={`/blog/${blog.slugUrl}`}
                className="card border-0 rounded-4 overflow-hidden blog-card my-3 text-decoration-none"
                title={blog?.blogTitle ? `Read ${blog.blogTitle}` : "Read blog post"}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <img
                    {...buildHomeCardImageProps({
                      src: `${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${blog.blogImage}`,
                      width: 800,
                      height: 450,
                      alt: featuredImageAlt,
                      sizes: HOME_BLOG_CARD_SIZES,
                      quality: 65,
                    })}
                    className="img-fluid"
                    width={800}
                    height={450}
                />
                <div className="card-body d-flex flex-column plus-jakarta-semi-bold">
                    <p className="blog-date m-0 mb-1 text-muted small">
                        By <span className="fw-semibold text-body">{authorLabel}</span>
                        {blog.createdAt ? (
                            <>
                                {" · "}
                                {new Date(blog.createdAt).toLocaleString("en-US", {
                                    dateStyle: "medium",
                                })}
                            </>
                        ) : null}
                    </p>
                    <h3 className="card-title fw-bold h4" title={blog.blogTitle}>{blog.blogTitle}</h3>

                    <div className="flex-grow-1 mb-1">
                        <p className="card-text text-muted small">
                            {truncateWords(blog.blogMetaDescription || 'Click below to continue reading...', 50)}
                        </p>
                    </div>

                    <button className="plus-jakarta-sans-regular mt-1 btn-continue-reading">
                        Continue Reading...
                    </button>
                </div>
            </Link>
        </>
    )
}