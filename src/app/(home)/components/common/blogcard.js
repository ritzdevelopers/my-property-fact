"use client";
import Image from "next/image";
import Link from "next/link";
import './common.css';
export default function BlogCard({ blog }) {

    const featuredImageAlt = blog.blogTitle
      ? `${blog.blogTitle} — blog featured image on My Property Fact`
      : "Blog featured image on My Property Fact";

    const truncateWords = (text, wordLimit) => {
        const words = text.trim().split(/\s+/);
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(" ") + " ...";
    };

    return (
        <>
            <Link href={`/blog/${blog.slugUrl}`}
                className="card border-0 rounded-4 overflow-hidden blog-card my-3 text-decoration-none"
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                <Image
                    width={1200}
                    height={628}
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${blog.blogImage}`}
                    alt={featuredImageAlt}
                    title={featuredImageAlt}
                    className="img-fluid"
                    
                />
                <div className="card-body d-flex flex-column plus-jakarta-semi-bold">
                    <p className="blog-date m-0 mb-2">{new Date(blog.createdAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        // timeStyle: 'short'
                    })}</p>
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