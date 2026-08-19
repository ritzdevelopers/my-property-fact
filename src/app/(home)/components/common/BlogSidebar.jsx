"use client";

import "./common.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { searchBlogsAction } from "@/app/(home)/blog/actions";
import { trackSearchEvent } from "@/lib/trackSearchEvent";

function blogFeaturedImageAlt(blogTitle) {
  return blogTitle?.trim()
    ? `${blogTitle.trim()} — blog featured image on My Property Fact`
    : "Blog featured image on My Property Fact";
}

export default function BlogSidebar({
  onSearch,
  showSearch = true,
  showRecentPosts = true,
  showRecentTitle = true,
  showLatestProperty = true,
  openBlogLinksInNewTab = false,
  initialRecentPosts = [],
  initialLatestProject = null,
}) {
  const [query, setQuery] = useState("");
  const [latestProject, setLatestProject] = useState(initialLatestProject);
  const [recent, setRecent] = useState(initialRecentPosts);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const blogLinkProps = openBlogLinksInNewTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  useEffect(() => {
    setRecent(initialRecentPosts);
  }, [initialRecentPosts]);

  useEffect(() => {
    setLatestProject(initialLatestProject);
  }, [initialLatestProject]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch && onSearch(val);
  };

  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      return;
    }

    setIsSearching(true);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const filtered = await searchBlogsAction(query.trim());
        setSearchResults(filtered);
        trackSearchEvent({
          query: query.trim(),
          searchType: "blog",
          resultCount: Array.isArray(filtered) ? filtered.length : 0,
          sourcePath: typeof window !== "undefined" ? window.location?.pathname : "/blog",
        });
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  return (
    <div className="sidebar-sticky-wrapper">
      {showSearch && (
        <div className="search-container sidebar-align-right mb-4">
          <div className="blog-search-wrapper position-relative">
            <input
              type="text"
              className="blog-search-input"
              placeholder="Search..."
              value={query}
              onChange={handleSearch}
            />
            <FiSearch className="blog-search-icon" />
            {query.trim().length >= 2 && (
              <div className="blog-search-results">
                {isSearching ? (
                  <div className="blog-search-loader">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <ul className="blog-results-list">
                    {searchResults.map((b, i) => {
                      const thumbAlt = blogFeaturedImageAlt(b.blogTitle);
                      return (
                        <li key={b?.slugUrl ?? b?.id ?? i} className="blog-result-item">
                          <Link
                            href={`/blog/${b.slugUrl}`}
                            className="blog-result-link"
                            title={b.blogTitle}
                            {...blogLinkProps}
                          >
                            <div className="blog-result-thumb">
                              {b.blogImage && (
                                <img
                                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${b.blogImage}`}
                                  alt={thumbAlt}
                                  title={thumbAlt}
                                  width={44}
                                  height={44}
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="blog-result-text">
                              <div className="blog-result-title">
                                {(b.blogTitle || "").length > 60
                                  ? (b.blogTitle || "").slice(0, 60) + "..."
                                  : b.blogTitle}
                              </div>
                              <div className="blog-result-date">
                                {new Date(b.createdAt).toLocaleString("en-US", {
                                  dateStyle: "medium",
                                })}
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="blog-no-results">
                    No results for “{query}”
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {showRecentPosts && (
        <div className="recent-posts-container sidebar-align-right mb-4">
          {showRecentTitle && (
            <div className="blog-sidebar-section-title">Recent Posts</div>
          )}
          <div className="recent-posts-list">
            {recent.map((b, i) => {
              const recentThumbAlt = blogFeaturedImageAlt(b.blogTitle);
              return (
                <Link
                  key={b?.slugUrl ?? b?.id ?? i}
                  href={`/blog/${b.slugUrl}`}
                  className="recent-post-item text-decoration-none"
                  title={b.blogTitle}
                  {...blogLinkProps}
                >
                  <div className="recent-thumb">
                    {b.blogImage && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${b.blogImage}`}
                        alt={recentThumbAlt}
                        title={recentThumbAlt}
                        width={94}
                        height={27}
                      />
                    )}
                  </div>
                  <div className="recent-text">
                    <div className="recent-title">
                      {(b.blogTitle || "").length > 50
                        ? (b.blogTitle || "").slice(0, 50) + "..."
                        : b.blogTitle}
                    </div>
                    <div className="recent-date">
                      {new Date(b.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                      })}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      {showLatestProperty && (
        <div className="latest-property-container sidebar-align-right mb-4">
          <div className="blog-sidebar-section-title">Latest Property</div>
          <hr className="my-2" />
          <div className="latest-property-image">
            {latestProject ? (
              <Link
                href={`/${latestProject.slugURL}`}
                className="latest-property-link-fill"
                prefetch={false}
                target="_blank"
                rel="noopener noreferrer"
                title={
                  latestProject.projectName?.trim()
                    ? `View ${latestProject.projectName.trim()}`
                    : "View latest property"
                }
              >
                <img
                  src={
                    latestProject.projectBannerImage && latestProject.slugURL
                      ? `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}properties/${latestProject.slugURL}/${latestProject.projectBannerImage}`
                      : "/static/no_image.png"
                  }
                  alt={
                    latestProject.projectName?.trim()
                      ? `${latestProject.projectName.trim()} — featured property on My Property Fact blog sidebar`
                      : "Featured property — My Property Fact blog sidebar"
                  }
                  title={
                    latestProject.projectName?.trim()
                      ? `${latestProject.projectName.trim()} — featured property on My Property Fact blog sidebar`
                      : "Featured property — My Property Fact blog sidebar"
                  }
                />
              </Link>
            ) : (
              <img
                src="/static/generic-floorplan.jpg"
                alt="Latest property placeholder — My Property Fact blog sidebar"
                title="Latest property placeholder — My Property Fact blog sidebar"
              />
            )}
            <span className="latest-badge">Latest Property</span>
          </div>
        </div>
      )}
    </div>
  );
}
