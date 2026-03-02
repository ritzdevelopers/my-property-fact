 "use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchBlogs } from "@/app/_global_components/masterFunction";
import { getWeeklyProject } from "@/app/_global_components/masterFunction";
import { FiSearch } from "react-icons/fi";
export default function BlogSidebar({ onSearch, showSearch = true, showRecentPosts = true, showLatestProperty = true }) {
  const [query, setQuery] = useState("");
  const [latestProject, setLatestProject] = useState(null);
  const [recent, setRecent] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchBlogs(0, 3);
        setRecent(res.content || []);
      } catch {}
    };
    load();
  }, []);
  useEffect(() => {
    const loadTopPick = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const resp = await fetch(`${apiUrl}projects`, { method: "GET" });
        const projects = await resp.json();
        const pick = getWeeklyProject(projects);
        setLatestProject(pick || null);
      } catch {}
    };
    loadTopPick();
  }, []);
  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch && onSearch(val);
  };
  useEffect(() => {
    if (query.trim().length >= 2) {
      setIsSearching(true);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          const resp = await fetch(`${apiUrl}blog/get-all`, { method: "GET" });
          const allBlogs = await resp.json();
          const list = Array.isArray(allBlogs)
            ? allBlogs
            : (allBlogs?.content || allBlogs?.data || []);
          const q = query.trim().toLowerCase();
          const filtered = list
            .filter((b) => {
              const t = (b.blogTitle || "").toLowerCase();
              const d = (b.blogMetaDescription || "").toLowerCase();
              return t.includes(q) || d.includes(q);
            })
            .slice(0, 8);
          setSearchResults(filtered);
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    }
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
                    {searchResults.map((b, i) => (
                      <li key={i} className="blog-result-item">
                        <Link
                          href={`/blog/${b.slugUrl}`}
                          className="blog-result-link"
                          title={b.blogTitle}
                        >
                          <div className="blog-result-thumb">
                            {b.blogImage && (
                              <Image
                                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${b.blogImage}`}
                                alt={b.blogTitle}
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
                    ))}
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
          <h6 className="fw-semibold mb-2">Recent Posts</h6>
          <div className="recent-posts-list">
            {recent.map((b, i) => (
              <Link
                key={i}
                href={`/blog/${b.slugUrl}`}
                className="recent-post-item text-decoration-none"
                title={b.blogTitle}
              >
                <div className="recent-thumb">
                  {b.blogImage && (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${b.blogImage}`}
                      alt={b.blogTitle}
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
            ))}
          </div>
        </div>
      )}
      {showLatestProperty && (
        <div className="latest-property-container sidebar-align-right mb-4">
          <h6 className="fw-semibold mb-2">Latest Property</h6>
          <hr className="my-2" />
          <div className="latest-property-image">
            {latestProject ? (
              <Link href={`/${latestProject.slugURL}`} className="latest-property-link-fill" prefetch={false}>
                <Image
                  src={
                    latestProject.projectBannerImage && latestProject.slugURL
                      ? `${process.env.NEXT_PUBLIC_IMAGE_URL || ""}properties/${latestProject.slugURL}/${latestProject.projectBannerImage}`
                      : "/static/no_image.png"
                  }
                  alt={latestProject.projectName || "Latest Property"}
                  fill
                  sizes="(max-width: 992px) 100vw, 100vw"
                  style={{ objectFit: "cover" }}
                />
              </Link>
            ) : (
              <Image
                src="/static/generic-floorplan.jpg"
                alt="Latest Property"
                fill
                sizes="(max-width: 992px) 100vw, 100vw"
                style={{ objectFit: "cover" }}
              />
            )}
            <span className="latest-badge">Latest Property</span>
          </div>
        </div>
      )}
    </div>
  );
}
