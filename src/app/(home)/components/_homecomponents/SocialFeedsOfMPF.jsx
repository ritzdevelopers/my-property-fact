"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { MPF_SOCIAL_REELS_OPEN_CLASS } from "@/app/_global_components/mpfGatewayEvents";
import "./SocialFeedsOfMPF.css";

const getInstagramEmbedUrl = (reelId, { captioned = false } = {}) => {
  const base = `https://www.instagram.com/reel/${reelId}/embed`;
  return captioned ? `${base}/captioned/` : `${base}/`;
};

const getInstagramThumbnailUrl = (reelId) =>
  `https://www.instagram.com/reel/${reelId}/media/?size=l`;

const getYoutubeEmbedUrl = (videoId, options = {}) => {
  const {
    autoplay = false,
    muted = true,
    controls = true,
    loop = false,
  } = options;

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
  });

  if (autoplay) params.set("autoplay", "1");
  if (muted) params.set("mute", "1");
  params.set("controls", controls ? "1" : "0");
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const getYoutubeThumbnail = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

export default function SocialFeedsOfMPF() {
  const [activePlatform, setActivePlatform] = useState("instagram");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const [popupActiveIndex, setPopupActiveIndex] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activeYoutubeIndices, setActiveYoutubeIndices] = useState(() => new Set([0]));
  const [activeInstagramPopupIndices, setActiveInstagramPopupIndices] = useState(() => new Set());
  const wrapperRefs = useRef([]);
  const popupScrollRef = useRef(null);
  const popupItemRefs = useRef([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll and hide floating UI while reels lightbox is open
  useEffect(() => {
    if (isPopupOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add(MPF_SOCIAL_REELS_OPEN_CLASS);
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove(MPF_SOCIAL_REELS_OPEN_CLASS);
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.classList.remove(MPF_SOCIAL_REELS_OPEN_CLASS);
    };
  }, [isPopupOpen]);

  const instagramPosts = [
    {
      text: `Eden: India’s next lifestyle landmark. Watch the video to discover MORE! 83% Open Greens | 30,000 Sq. Ft. Clubhouse | 24×7 Security | Wave Galleria Market | Sector 62 Connectivity.`,
      position: "top",
      reelId: "DZcQalCE9HT",
    },
    {
      text: `Some assets lose value with time. The right home only grows stronger. Watch the video to discover Palm Olympia - premium lifestyle residences backed by legacy, connectivity, luxury, and long-term value`,
      position: "bottom",
      reelId: "DZg62TblKL-",
    },
    {
      text: `Experience the beauty of balanced living at Eternia. Watch the video to explore a lifestyle powered by: Spacious Homes  | 25+ Lifestyle Amenities | 130m Wide Road Access | Green Surroundings `,
      position: "bottom",
      reelId: "DZXpBeQTQj7",
    },
    {
      text: `Watch the latest reel from My Property Fact.`,
      position: "top",
      reelId: "DYjaKn5nEKg",
    },
  ];

  const youtubePosts = [
    {
      text: "Watch the latest property insights from My Property Fact on YouTube.",
      position: "top",
      youtubeId: "7z2-277kK7w",
      video: "https://youtu.be/7z2-277kK7w",
    },
    {
      text: "Explore premium real estate projects and market updates on MPF YouTube.",
      position: "bottom",
      youtubeId: "vAUTVfKpWW4",
      video: "https://youtu.be/vAUTVfKpWW4",
    },
    {
      text: "Discover lifestyle-led homes and investment opportunities on YouTube.",
      position: "bottom",
      youtubeId: "tjy-IDnQV7U",
      video: "https://youtu.be/tjy-IDnQV7U",
    },
    {
      text: "Stay updated with My Property Fact videos, trends, and project highlights.",
      position: "top",
      youtubeId: "ToAkzbKIrjU",
      video: "https://youtu.be/ToAkzbKIrjU",
    },
  ];

  const platformConfig = {
    instagram: {
      label: "Instagram",
      icon: "/static/icon/image 1037.png",
      iconAlt: "Instagram — My Property Fact social feeds",
      iconTitle: "Instagram — My Property Fact social feeds",
      title: "Social Feeds from MPF on Instagram",
      posts: instagramPosts,
    },
    youtube: {
      label: "Youtube",
      icon: "/static/icon/image 1037 (1).png",
      iconAlt: "YouTube — My Property Fact social feeds",
      iconTitle: "YouTube — My Property Fact social feeds",
      title: "Social Feeds from MPF on Youtube",
      posts: youtubePosts,
    },
  };

  const socialPosts = platformConfig[activePlatform].posts;
  const isYoutubeFeed = activePlatform === "youtube";
  const isInstagramFeed = activePlatform === "instagram";

  const handleVideoClick = (event, index) => {
    if (isYoutubeFeed || isInstagramFeed) {
      setPopupActiveIndex(index);
      setSelectedVideoIndex(index);
      setIsPopupOpen(true);
      return;
    }

    // Fallback: keep behavior safe for any future non-embed post types
    setSelectedVideoIndex(index);
    setIsPopupOpen(true);
  };

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setSelectedVideoIndex(null);
    setPopupActiveIndex(null);
    setActiveInstagramPopupIndices(new Set());
  }, []);

  const handlePlatformChange = (platform) => {
    if (platform === activePlatform) return;
    closePopup();
    setHoveredIndex(null);
    setActiveYoutubeIndices(new Set([0]));
    setActivePlatform(platform);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closePopup();
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && isPopupOpen) {
      closePopup();
    }
  }, [isPopupOpen, closePopup]);

  useEffect(() => {
    if (isPopupOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isPopupOpen, handleKeyDown]);

  useEffect(() => {
    if (!isYoutubeFeed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setActiveYoutubeIndices((prev) => {
          const next = new Set(prev);
          entries.forEach(({ target, isIntersecting }) => {
            const index = Number(target.dataset.youtubeIndex);
            if (Number.isNaN(index)) return;
            if (isIntersecting) {
              next.add(index);
            }
          });
          return next;
        });
      },
      { threshold: 0.55, rootMargin: "0px" }
    );

    wrapperRefs.current.forEach((wrapper) => {
      if (wrapper) observer.observe(wrapper);
    });

    return () => observer.disconnect();
  }, [isYoutubeFeed, socialPosts.length, activePlatform]);

  useEffect(() => {
    // (Instagram cards render thumbnails only — no iframe lazy-load needed.)
  }, [isInstagramFeed, socialPosts.length, activePlatform]);

  const handleSwiperSlideChange = useCallback((swiper) => {
    if (isYoutubeFeed) {
      const visible = new Set([swiper.realIndex]);
      if (swiper.params.slidesPerView > 1) {
        const perView = Math.ceil(swiper.params.slidesPerView);
        for (let offset = 1; offset < perView; offset += 1) {
          visible.add((swiper.realIndex + offset) % socialPosts.length);
        }
      }
      setActiveYoutubeIndices(visible);
      return;
    }
  }, [isYoutubeFeed, socialPosts.length]);

  // Instagram popup: snap-scroll through embeds, lazy-load as user scrolls
  useEffect(() => {
    if (!isPopupOpen || !isInstagramFeed || selectedVideoIndex === null) return;
    setPopupActiveIndex(selectedVideoIndex);
    setActiveInstagramPopupIndices(new Set([selectedVideoIndex]));

    const scrollEl = popupScrollRef.current;
    const target = popupItemRefs.current[selectedVideoIndex];
    if (scrollEl && target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: "start", behavior: "instant" });
      });
    }
  }, [isPopupOpen, isInstagramFeed, selectedVideoIndex]);

  useEffect(() => {
    if (!isPopupOpen || !isInstagramFeed) return;
    const root = popupScrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
          if (!isIntersecting || intersectionRatio < 0.6) return;
          const idx = Number(target.dataset.instagramPopupIndex);
          if (Number.isNaN(idx)) return;
          setPopupActiveIndex(idx);
          setActiveInstagramPopupIndices((prev) => {
            const next = new Set(prev);
            next.add(idx);
            return next;
          });
        });
      },
      { root, threshold: [0.6, 0.75, 0.9] }
    );

    popupItemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isPopupOpen, isInstagramFeed, socialPosts.length]);

  useEffect(() => {
    const origin = "https://otherassets.blob.core.windows.net";
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = origin;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const effectivePopupIndex = isInstagramFeed
    ? (popupActiveIndex ?? selectedVideoIndex)
    : selectedVideoIndex;
  const selectedVideo = effectivePopupIndex !== null ? socialPosts[effectivePopupIndex] : null;

  return (
    <>
      <div className="social-feeds-section my-4 my-lg-5">
        <div className="container-fluid">
          <div className="section-header-wrapper mb-lg-5">
            <h2 className="social-feeds-section-title mb-0">
              {platformConfig[activePlatform].title}
            </h2>

            <div
              className="social-platform-toggle"
              role="tablist"
              aria-label="Social feed platform"
            >
              {Object.entries(platformConfig).map(([platformKey, platform]) => (
                <button
                  key={platformKey}
                  type="button"
                  role="tab"
                  aria-selected={activePlatform === platformKey}
                  className={`social-platform-btn${activePlatform === platformKey ? " is-active" : ""}`}
                  onClick={() => handlePlatformChange(platformKey)}
                >
                  <img
                    src={platform.icon}
                    alt={platform.iconAlt}
                    title={platform.iconTitle}
                    width={20}
                    height={20}
                    className="social-platform-btn-icon"
                  />
                  <span>{platform.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="container">
            <div className="social-feeds-swiper-wrapper">
              <Swiper
                key={activePlatform}
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                centeredSlides={false}
                navigation={{
                  enabled: true,
                  hideOnClick: false,
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                  dynamicMainBullets: 3,
                }}
                loop={socialPosts.length > 1}
                grabCursor={true}
                speed={600}
                watchSlidesProgress={true}
                onSlideChangeTransitionEnd={handleSwiperSlideChange}
                breakpoints={{
                  320: {
                    slidesPerView: 1,
                    spaceBetween: 15,
                    centeredSlides: true,
                  },
                  480: {
                    slidesPerView: 1.5,
                    spaceBetween: 15,
                    centeredSlides: true,
                  },
                  576: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                    centeredSlides: false,
                  },
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 24,
                    centeredSlides: false,
                  },
                  992: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                    centeredSlides: false,
                  },
                  1200: {
                    slidesPerView: 4,
                    spaceBetween: 24,
                    centeredSlides: false,
                  },
                  1400: {
                    slidesPerView: 4,
                    spaceBetween: 30,
                    centeredSlides: false,
                  },
                }}
                className={`social-feeds-swiper${isYoutubeFeed ? " social-feeds-swiper--youtube" : ""}`}
              >
                {socialPosts.map((post, index) => (
                  <SwiperSlide key={`${activePlatform}-${post.youtubeId || post.reelId || post.video}-${index}`}>
                    <div
                      className={`instagram-post-card${isYoutubeFeed ? " youtube-post-card" : ""}`}
                      onMouseEnter={() => !isMobile && setHoveredIndex(index)}
                      onMouseLeave={() => !isMobile && setHoveredIndex(null)}
                      onTouchStart={() => isMobile && setHoveredIndex(index)}
                      onTouchEnd={() => {
                        setTimeout(() => {
                          if (isMobile) setHoveredIndex(null);
                        }, 2000);
                      }}
                    >
                      <div className="card-border-gradient"></div>
                      <div
                        className={`post-video-wrapper${isYoutubeFeed ? " post-video-wrapper--youtube" : ""}`}
                        ref={(el) => {
                          wrapperRefs.current[index] = el;
                        }}
                        data-youtube-index={isYoutubeFeed ? index : undefined}
                        onClick={(event) => handleVideoClick(event, index)}
                      >
                        <div className="post-video-placeholder" aria-hidden="true" />
                        {isYoutubeFeed && post.youtubeId ? (
                          activeYoutubeIndices.has(index) ? (
                            <iframe
                              src={getYoutubeEmbedUrl(post.youtubeId, {
                                autoplay: true,
                                muted: true,
                                controls: false,
                                loop: true,
                              })}
                              title={post.text.replace(/\s+/g, " ").trim().slice(0, 160)}
                              className="youtube-card-embed"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              loading="lazy"
                            />
                          ) : (
                            <img
                              src={getYoutubeThumbnail(post.youtubeId)}
                              alt={post.text.replace(/\s+/g, " ").trim().slice(0, 160)}
                              className="post-video youtube-thumbnail"
                              loading="lazy"
                            />
                          )
                        ) : post.reelId ? (
                          <img
                            src={post.thumbnail || getInstagramThumbnailUrl(post.reelId)}
                            alt={post.text.replace(/\s+/g, " ").trim().slice(0, 160)}
                            className="post-video instagram-thumbnail"
                            loading="lazy"
                            draggable="false"
                          />
                        ) : null}
                        {/* Play Icon Overlay - Always show on hover */}
                        {!isYoutubeFeed && hoveredIndex === index && (
                          <div className="play-icon-overlay show-on-hover">
                            <div className="play-icon-circle">
                              <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 5V19L19 12L8 5Z"
                                  fill="white"
                                  stroke="white"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                        {/* Instagram Logo Badge */}
                        {/* <div className="instagram-badge">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="white"/>
                          </svg>
                        </div> */}
                        {!isYoutubeFeed && (
                          <div className={`post-text-overlay ${post.position} ${hoveredIndex === index ? 'show-text' : ''}`}>
                            <div className="post-text-background">
                              <div className="text-content-wrapper">
                                <p className="post-text plus-jakarta-sans-semi-bold">{post.text}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {isYoutubeFeed && (
                          <div className="youtube-card-badge" aria-hidden="true">
                            <img
                              src="/static/icon/image 1037 (1).png"
                              alt="YouTube — My Property Fact social feeds"
                              title="YouTube — My Property Fact social feeds"
                              width={18}
                              height={18}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      {/* Video Popup Modal — Reel + info cloud side-by-side */}
      {isPopupOpen && selectedVideo && (
        <div
          className={`video-popup-overlay${isInstagramFeed ? " video-popup-overlay--instagram" : ""}`}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label="Social reel viewer"
        >
          <div className="video-popup-container">
            <div
              className={`video-popup-shell${isInstagramFeed ? " video-popup-shell--solo" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Left: reel frame ── */}
              <div className="video-popup-frame">
                {/* top bar inside frame */}
                <div className="video-popup-top-bar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.webp"
                    alt=""
                    width={28}
                    height={28}
                    className="video-popup-avatar"
                  />
                  <span className="video-popup-handle">my.property.fact</span>
                </div>

                {isInstagramFeed && (
                  <>
                    <div className="video-popup-instagram-hint" aria-hidden="true">
                      Scroll to next reel
                    </div>
                  </>
                )}
                <div
                  className="video-popup-player-slot"
                  aria-label={selectedVideo.text.replace(/\s+/g, " ").trim().slice(0, 200)}
                >
                  {isYoutubeFeed && selectedVideo.youtubeId ? (
                    <iframe
                      src={getYoutubeEmbedUrl(selectedVideo.youtubeId, {
                        autoplay: true,
                        muted: false,
                        controls: true,
                      })}
                      title={selectedVideo.text.replace(/\s+/g, " ").trim().slice(0, 160)}
                      className="video-popup-youtube-embed"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : isInstagramFeed ? (
                    <div ref={popupScrollRef} className="video-popup-instagram-scroll">
                      {socialPosts.map((post, idx) => (
                        <div
                          key={`ig-popup-${post.reelId}-${idx}`}
                          ref={(el) => {
                            popupItemRefs.current[idx] = el;
                          }}
                          className="video-popup-instagram-item"
                          data-instagram-popup-index={idx}
                        >
                          {activeInstagramPopupIndices.has(idx) ? (
                            <iframe
                              src={getInstagramEmbedUrl(post.reelId, { captioned: false })}
                              title={post.text.replace(/\s+/g, " ").trim().slice(0, 160)}
                              className="video-popup-instagram-embed"
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                            />
                          ) : (
                            <div className="video-popup-instagram-fallback" aria-label="Instagram reel loading" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="video-popup-player-slot-inner" />
                  )}
                </div>
              </div>

              {/* ── Right: speech-bubble cloud ── */}
              {selectedVideo.text && !isInstagramFeed && (
                <div className="video-popup-cloud-wrap">
                  <div className="video-popup-cloud">
                    <div className="video-popup-cloud__tail" aria-hidden="true" />
                    <p className="video-popup-cloud__label">
                      {isYoutubeFeed ? "About this video" : "About this reel"}
                    </p>
                    <p className="video-popup-cloud__text">{selectedVideo.text}</p>
                  </div>
                </div>
              )}

              {/* ── Close button — outside frame, top-right of shell ── */}
              <button
                type="button"
                className="video-popup-close"
                onClick={closePopup}
                aria-label="Close reel"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
