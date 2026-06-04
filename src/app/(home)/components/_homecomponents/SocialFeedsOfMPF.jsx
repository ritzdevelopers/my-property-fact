"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "./SocialFeedsOfMPF.css";
import { FaInstagram, FaYoutube, FaPlay, FaHeart, FaRegComment, FaShare, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";

// ══════════════════════════════════════════════════════
//  ★★★ SIRF YAHAN URLS DAALO — KUCH AUR NAHI CHAHIYE ★★★
// ══════════════════════════════════════════════════════
function getInstagramEmbedUrl(postUrl) {
  const m = postUrl.match(/\/(p|reel|tv)\/([^/?#]+)/i);
  if (!m) return null;
  return `https://www.instagram.com/${m[1].toLowerCase()}/${m[2]}/embed/captioned/`;
}

const INSTAGRAM_URLS = [
  "https://www.instagram.com/my.property.fact/reel/DR1n2a_jxYV/",
  "https://www.instagram.com/my.property.fact/reel/DRj42M4lXn9/",
  "https://www.instagram.com/my.property.fact/reel/DReP_pxjIxH/",
  "https://www.instagram.com/my.property.fact/reel/DZJ0iKdih74/",
  "https://www.instagram.com/my.property.fact/p/DZJiB93gS9d/",
  "https://www.instagram.com/my.property.fact/p/DZIWGvnlEln/",
  "https://www.instagram.com/my.property.fact/p/DZHWBVoEUyA/",
  "https://www.instagram.com/my.property.fact/p/DZHRqhGFM8d/",
  "https://www.instagram.com/my.property.fact/p/DZFas7zADL7/",
  "https://www.instagram.com/my.property.fact/p/DZFMWa2FD_Z/",
  "https://www.instagram.com/my.property.fact/p/DZCq-5ejp5l/",
  "https://www.instagram.com/my.property.fact/p/DZCSLYXgP8i/",

];

function IgCard({ url, onExpand }) {
  const [data,    setData]    = useState(null);  // { thumbnail_url, caption, author_name, html }
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/ig-post?url=${encodeURIComponent(url)}`);
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Instagram load failed");
        if (!d.thumbnail_url) throw new Error("No thumbnail");
        if (!cancelled) setData(d);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [url]);

  const isReel = url.includes("/reel/");

  // ── Skeleton ──
  if (loading) return (
    <div className="ig-card ig-card-skeleton">
      <div className="ig-skel-img" />
      <div className="ig-skel-body">
        <div className="ig-skel-line" style={{ width: "70%" }} />
        <div className="ig-skel-line" style={{ width: "50%" }} />
      </div>
    </div>
  );

  // ── Error fallback ──
  if (error || !data?.thumbnail_url) return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="ig-card ig-card-error">
      <FaInstagram style={{ fontSize: 36, color: "#DD2A7B" }} />
      <span>Post dekho ↗</span>
    </a>
  );

  const caption = data.caption || data.author_name || "";

  return (
    <div
      className="ig-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onExpand({ url, data, isReel })}
    >
      {/* ── Thumbnail ── */}
      <img
        src={data.thumbnail_url}
        alt={caption.slice(0, 60) || "Instagram post"}
        className="ig-card-img"
        loading="lazy"
      />

      {/* ── Reel badge ── */}
      {isReel && <span className="ig-reel-badge">▶ Reel</span>}

      {/* ── Hover overlay ── */}
      <div className={`ig-overlay ${hovered ? "ig-overlay--show" : ""}`}>

        {/* Caption */}
        {caption && (
          <p className="ig-ov-caption">
            {caption.length > 100 ? caption.slice(0, 100) + "…" : caption}
          </p>
        )}

        {/* Action icons + counts */}
        <div className="ig-ov-actions">
          <span className="ig-ov-action">
            <FaHeart />
          </span>
          <span className="ig-ov-action">
            <FaRegComment />
          </span>
          <span className="ig-ov-action">
            <FaShare />
          </span>
        </div>

        {/* View on Instagram link */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ig-ov-link"
          onClick={e => e.stopPropagation()}
        >
          <FaInstagram />
          Instagram pe dekho
          <FaExternalLinkAlt style={{ fontSize: 10 }} />
        </a>

      </div>
    </div>
  );
}

// Popup par scroll block (YouTube — ek video, scroll nahi)
function useBlockPopupScroll(ref, enabled) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const block = e => e.preventDefault();
    el.addEventListener("wheel", block, { passive: false });
    el.addEventListener("touchmove", block, { passive: false });
    return () => {
      el.removeEventListener("wheel", block);
      el.removeEventListener("touchmove", block);
    };
  }, [enabled]);
}

function IgPopupSlide({ url, index, active, cachedData }) {
  const [data, setData] = useState(cachedData || null);
  const [loading, setLoading] = useState(!cachedData?.thumbnail_url);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef(null);
  const isReel = url.includes("/reel/") || url.includes("/tv/");
  const embedUrl = getInstagramEmbedUrl(url);
  const isVideoPost = data?.is_video || isReel;
  const useEmbedPlayer = isVideoPost && (!data?.video_url || videoFailed) && embedUrl;

  useEffect(() => {
    setVideoFailed(false);
    if (cachedData?.thumbnail_url) {
      setData(cachedData);
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/ig-post?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [url, cachedData]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !data?.video_url || videoFailed || useEmbedPlayer) return;
    if (active) {
      v.muted = true;
      v.play().catch(() => setVideoFailed(true));
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [active, data?.video_url, videoFailed, useEmbedPlayer]);

  const caption = data?.caption || data?.author_name || "";

  return (
    <section className="sfmpf-ig-popup-slide" data-ig-index={index}>
      <div
        className={`sfmpf-ig-popup-media${useEmbedPlayer ? " sfmpf-ig-popup-media--embed" : ""}`}
      >
        {loading && <div className="sfmpf-ig-popup-loading">Loading…</div>}
        {!loading && isVideoPost && data?.video_url && !videoFailed && !useEmbedPlayer && (
          <video
            ref={videoRef}
            src={data.video_url}
            className="sfmpf-ig-popup-video"
            poster={data.thumbnail_url || undefined}
            playsInline
            loop
            muted
            controls
            onError={() => setVideoFailed(true)}
          />
        )}
        {!loading && useEmbedPlayer && (
          <iframe
            src={active ? embedUrl : undefined}
            title="Instagram reel"
            className="sfmpf-ig-popup-embed"
            scrolling="no"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
        {!loading && !isVideoPost && data?.thumbnail_url && (
          <img
            src={data.thumbnail_url}
            alt={caption.slice(0, 60) || "Instagram post"}
            className="sfmpf-ig-popup-img"
          />
        )}
        {!loading && isVideoPost && !data?.video_url && !useEmbedPlayer && data?.thumbnail_url && (
          <img
            src={data.thumbnail_url}
            alt={caption.slice(0, 60) || "Instagram reel"}
            className="sfmpf-ig-popup-img"
          />
        )}
        {!loading && !data?.thumbnail_url && !useEmbedPlayer && (
          <div className="sfmpf-ig-popup-loading">Preview unavailable</div>
        )}
        {isReel && <span className="sfmpf-ig-popup-reel-badge">Reel</span>}
      </div>
      <div className="sfmpf-ig-popup-footer">
        <p className="sfmpf-ig-popup-caption">
          <strong>my.property.fact</strong>{" "}
          {caption.length > 120 ? caption.slice(0, 120) + "…" : caption}
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="sfmpf-ig-open-btn">
          <FaInstagram /> 
        </a>
      </div>
    </section>
  );
}

function InstagramPopup({ startUrl, cachedData, onClose }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, INSTAGRAM_URLS.indexOf(startUrl))
  );
  const startIndex = Math.max(0, INSTAGRAM_URLS.indexOf(startUrl));

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const slide = root.querySelector(`[data-ig-index="${startIndex}"]`);
    slide?.scrollIntoView({ block: "start" });
    setActiveIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const slides = [...root.querySelectorAll(".sfmpf-ig-popup-slide")];
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            const idx = Number(entry.target.getAttribute("data-ig-index"));
            if (!Number.isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root, threshold: [0.55, 0.75] }
    );
    slides.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sfmpf-modal-backdrop" onClick={onClose}>
      <div className="sfmpf-ig-popup" onClick={e => e.stopPropagation()}>
        <button type="button" className="sfmpf-modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <p className="sfmpf-ig-popup-counter">
          {activeIndex + 1} / {INSTAGRAM_URLS.length}
        </p>
        <div className="sfmpf-ig-popup-scroll" ref={scrollRef}>
          {INSTAGRAM_URLS.map((url, index) => (
            <IgPopupSlide
              key={url}
              url={url}
              index={index}
              active={index === activeIndex}
              cachedData={url === startUrl ? cachedData : null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function YouTubePopup({ video, onClose }) {
  const popupRef = useRef(null);
  useBlockPopupScroll(popupRef, true);

  return (
    <div className="sfmpf-modal-backdrop" onClick={onClose}>
      <div
        className="sfmpf-yt-popup"
        ref={popupRef}
        onClick={e => e.stopPropagation()}
      >
        <button type="button" className="sfmpf-modal-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <div className="sfmpf-yt-iframe-box">
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
        <div className="sfmpf-yt-modal-info">
          <p className="sfmpf-yt-modal-title">{video.title}</p>
          <div className="sfmpf-yt-modal-meta">
            <span>{video.author}</span>
            {video.published && (
              <span>
                {" "}
                ·{" "}
                {new Date(video.published).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="sfmpf-yt-open-btn"
          >
            <FaYoutube /> 
          </a>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  YOUTUBE CARD
// ─────────────────────────────────────────────────────
function YtCard({ video, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="yt-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <img
        src={video.thumbnails.high}
        alt={video.title}
        className="yt-card-img"
        loading="lazy"
        onError={(e) => {
          if (e.currentTarget.src !== video.thumbnails.maxres) {
            e.currentTarget.src = video.thumbnails.maxres;
          }
        }}
      />
      <div className={`yt-play-wrap ${hovered ? "yt-play-wrap--show" : ""}`}>
        <div className="yt-play-btn"><FaPlay /></div>
      </div>
      <span className="yt-badge">▶ YouTube</span>
      <div className="yt-title-bar">{video.title}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────
export default function SocialFeedsOfMPF() {
  const [activeTab,  setActiveTab]  = useState("instagram");
  const [modal,      setModal]      = useState(null);   // { type, data }
  const [ytVideos,   setYtVideos]   = useState([]);
  const [ytLoading,  setYtLoading]  = useState(false);
  const [ytError,    setYtError]    = useState(null);
  const ytFetched = useRef(false);

  // body scroll lock
  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  // YouTube RSS fetch
  useEffect(() => {
    if (ytFetched.current) return;
    ytFetched.current = true;
    setYtLoading(true);
    setYtError(null);
    fetch("/api/youtube-feed?limit=12")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "YouTube feed failed");
        setYtVideos(d.videos || []);
      })
      .catch((e) => setYtError(e.message))
      .finally(() => setYtLoading(false));
  }, []);

  // Escape key closes modal
  useEffect(() => {
    const fn = e => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div className="container py-5">

      {/* TITLE */}
      <h2 className="text-center fw-bold mb-4">Social Media Feed</h2>
      {/* <p className="text-center text-muted mb-4" style={{ fontSize: 14 }}>
        @my.property.fact
      </p> */}

      {/* TABS */}
      <div className="social-feed-tabs" role="tablist" aria-label="Social media feed">

<button
  type="button"
  role="tab"
  aria-selected={activeTab === "instagram"}
  className={`social-feed-tab ${
    activeTab === "instagram" ? "social-feed-tab--active" : ""
  }`}
  onClick={() => setActiveTab("instagram")}
>
  <FaInstagram className="social-feed-tab__icon social-feed-tab__icon--instagram" aria-hidden />
  <span>Instagram</span>
</button>

<button
  type="button"
  role="tab"
  aria-selected={activeTab === "youtube"}
  className={`social-feed-tab ${
    activeTab === "youtube" ? "social-feed-tab--active" : ""
  }`}
  onClick={() => setActiveTab("youtube")}
>
  <FaYoutube className="social-feed-tab__icon social-feed-tab__icon--youtube" aria-hidden />
  <span>YouTube</span>
</button>

</div>

      {/* SWIPER */}
      <div className="position-relative overflow-hidden">
        <button className="social-prev btn position-absolute translate-middle-y z-3"
          style={{ width:45, height:45, borderRadius:"40%", backgroundColor:"#0D5834", color:"#fff", top:"40%", left:"-15px" }}>❮</button>
        <button className="social-next btn position-absolute translate-middle-y z-3"
          style={{ width:45, height:45, borderRadius:"40%", backgroundColor:"#0D5834", color:"#fff", top:"40%", right:"-15px" }}>❯</button>

        <Swiper
          key={activeTab}
          modules={[Navigation]}
          navigation={{ nextEl:".social-next", prevEl:".social-prev" }}
          spaceBetween={16}
          breakpoints={{ 320:{slidesPerView:1}, 640:{slidesPerView:2}, 1024:{slidesPerView:3}, 1280:{slidesPerView:4} }}
        >

          {/* ── INSTAGRAM ── */}
          {activeTab === "instagram" && INSTAGRAM_URLS.map((url, i) => (
            <SwiperSlide key={url}>
              <IgCard
                url={url}
                onExpand={(d) => setModal({ type: "instagram", ...d })}
              />
            </SwiperSlide>
          ))}

          {/* ── YOUTUBE SKELETONS ── */}
          {activeTab === "youtube" && ytLoading && Array.from({ length: 4 }).map((_, i) => (
            <SwiperSlide key={`sk${i}`}>
              <div className="yt-skeleton" />
            </SwiperSlide>
          ))}

          {/* ── YOUTUBE VIDEOS ── */}
          {activeTab === "youtube" && !ytLoading && ytVideos.map((v, i) => (
            <SwiperSlide key={v.videoId}>
              <YtCard
                video={v}
                onClick={() => setModal({ type: "youtube", video: v })}
              />
            </SwiperSlide>
          ))}

        </Swiper>
      </div>

      {activeTab === "youtube" && !ytLoading && ytError && (
        <p className="text-center text-danger small mt-3">
          YouTube load nahi hua: {ytError}
        </p>
      )}

      {activeTab === "youtube" && !ytLoading && !ytError && ytVideos.length === 0 && (
        <p className="text-center text-muted small mt-3">
          Abhi koi YouTube video nahi mili.
        </p>
      )}

      {/* ════════════════════════════════════════
          MODAL
          ════════════════════════════════════════ */}
      {modal?.type === "instagram" && (
        <InstagramPopup
          startUrl={modal.url}
          cachedData={modal.data}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "youtube" && (
        <YouTubePopup video={modal.video} onClose={() => setModal(null)} />
      )}

    </div>
  );
}