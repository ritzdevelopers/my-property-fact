"use client";
/**
 * BlogPreviewModal
 * Shows admins exactly how a blog will look on the live website,
 * including the rendered HTML body, hero image, author chip, TOC, etc.
 */
import { useEffect, useRef, useState } from "react";
import {
  X,
  ExternalLink,
  Eye,
  EyeOff,
  Calendar,
  User,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import styles from "./BlogPreviewModal.module.css";
import {
  getBlogPublicationState,
  getBlogStatusLabel,
  isBlogActive,
} from "../common-model/adminContentFilters";

/* ─── helpers (same logic as the live blogpage.js) ─── */
function demoteH1(html) {
  if (!html) return "";
  return html
    .replace(/<h1\b([^>]*)>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>");
}

function buildToc(html) {
  if (!html) return { html: "", toc: [] };
  const toc = [];
  const usedIds = new Set();
  const slug = (text) => {
    const raw = text
      .toLowerCase()
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return raw || "section";
  };
  const unique = (text) => {
    const base = slug(text);
    let id = base;
    let i = 2;
    while (usedIds.has(id)) id = `${base}-${i++}`;
    usedIds.add(id);
    return id;
  };
  const out = html.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs, inner) => {
    const existingId = /id=["']([^"']+)["']/.exec(attrs);
    const id = existingId ? existingId[1] : unique(inner);
    const plainText = inner.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/gi, " ").trim();
    toc.push({ id, text: plainText });
    if (existingId) return match;
    return `<h2 id="${id}"${attrs}>${inner}</h2>`;
  });
  return { html: out, toc };
}

function readingTime(html) {
  if (!html) return 1;
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(value) {
  if (!value) return "";
  try {
    const d = Array.isArray(value)
      ? new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0)
      : new Date(value);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

/* ─── TOC sidebar ─── */
function Toc({ toc, activeId }) {
  if (!toc.length) return null;
  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <p className={styles.tocTitle}>Contents</p>
      <ol className={styles.tocList}>
        {toc.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`${styles.tocLink} ${activeId === item.id ? styles.tocLinkActive : ""}`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ─── main export ─── */
export default function BlogPreviewModal({ blog, onClose }) {
  const [activeId, setActiveId] = useState("");
  const [showToc, setShowToc] = useState(false);
  const bodyRef = useRef(null);
  const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";

  const rawHtml = demoteH1(blog?.blogDescription || "");
  const { html: processedHtml, toc } = buildToc(rawHtml);
  const mins = readingTime(rawHtml);
  const publicationState = getBlogPublicationState(blog);
  const isActive = isBlogActive(blog);
  const statusLabel = getBlogStatusLabel(blog);
  const liveUrl = blog?.slugUrl ? `/blog/${blog.slugUrl}` : null;
  const heroSrc = blog?.blogImage ? `${imageBase}blog/${blog.blogImage}` : null;

  /* track active TOC heading on scroll */
  useEffect(() => {
    if (!bodyRef.current || !toc.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { root: bodyRef.current, rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    toc.forEach(({ id }) => {
      const el = bodyRef.current?.querySelector(`#${id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [toc, processedHtml]);

  /* lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Blog preview">
      {/* backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.sheet}>
        {/* ── top bar ── */}
        <header className={styles.bar}>
          <div className={styles.barLeft}>
            <span className={styles.barEyebrow}>
              <Eye className={styles.barEyebrowIcon} />
              Admin Preview
            </span>
            <span className={`${styles.barBadge} ${isActive ? styles.barBadgeActive : styles.barBadgeDraft}`}>
              {isActive ? (
                <><CheckCircle2 size={11} /> {statusLabel}</>
              ) : publicationState === "scheduled" ? (
                <><Clock size={11} /> {statusLabel}{blog?.scheduledPublishAt ? ` · ${formatDate(blog.scheduledPublishAt)}` : ""}</>
              ) : (
                <><AlertCircle size={11} /> {statusLabel}</>
              )}
            </span>
          </div>
          <div className={styles.barRight}>
            {toc.length > 0 && (
              <button
                className={styles.barBtn}
                onClick={() => setShowToc((v) => !v)}
                title="Toggle table of contents"
              >
                {showToc ? <EyeOff size={15} /> : <Eye size={15} />}
                {showToc ? "Hide TOC" : "Show TOC"}
              </button>
            )}
            {liveUrl && isActive && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.barBtn} ${styles.barBtnPrimary}`}
              >
                <ExternalLink size={15} />
                View live
              </a>
            )}
            <button className={styles.barClose} onClick={onClose} aria-label="Close preview">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* ── article ── */}
        <div className={styles.body} ref={bodyRef}>
          <div className={`${styles.layout} ${showToc && toc.length ? styles.layoutWithToc : ""}`}>

            {/* TOC (sticky sidebar) */}
            {showToc && toc.length > 0 && (
              <aside className={styles.tocCol}>
                <Toc toc={toc} activeId={activeId} />
              </aside>
            )}

            {/* main article */}
            <article className={styles.article}>

              {/* meta chips */}
              <div className={styles.meta}>
                {blog?.blogCategory && (
                  <span className={styles.metaChip}>
                    <Tag size={11} />
                    {blog.blogCategory}
                  </span>
                )}
                {blog?.authorName && (
                  <span className={styles.metaChip}>
                    <User size={11} />
                    {blog.authorName}
                  </span>
                )}
                {blog?.createdAt && (
                  <span className={styles.metaChip}>
                    <Calendar size={11} />
                    {formatDate(blog.createdAt)}
                  </span>
                )}
                <span className={styles.metaChip}>
                  <Clock size={11} />
                  {mins} min read
                </span>
              </div>

              {/* headline */}
              <h1 className={styles.title}>{blog?.blogTitle || "Untitled blog"}</h1>

              {/* meta description as lead text */}
              {blog?.blogMetaDescription && (
                <p className={styles.lead}>{blog.blogMetaDescription}</p>
              )}

              {/* hero image */}
              {heroSrc && (
                <div className={styles.heroWrap}>
                  <img
                    src={heroSrc}
                    alt={blog.blogTitle || "Blog image"}
                    className={styles.hero}
                  />
                </div>
              )}

              {/* body HTML */}
              {processedHtml ? (
                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{ __html: processedHtml }}
                />
              ) : (
                <div className={styles.empty}>
                  <AlertCircle size={36} strokeWidth={1.4} />
                  <p>No content yet — write the blog description in the editor and save to preview it here.</p>
                </div>
              )}

              {/* slug info strip */}
              {blog?.slugUrl && (
                <div className={styles.slugStrip}>
                  <span className={styles.slugLabel}>Live URL</span>
                  <code className={styles.slugValue}>/blog/{blog.slugUrl}</code>
                  {isActive && (
                    <a href={`/blog/${blog.slugUrl}`} target="_blank" rel="noopener noreferrer" className={styles.slugLink}>
                      <ExternalLink size={13} />
                      Open
                    </a>
                  )}
                </div>
              )}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
