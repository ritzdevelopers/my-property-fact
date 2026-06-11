"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./SocialFeedsOfMPF.css";

export default function SocialFeedsOfMPF() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const videoRefs = useRef([]);
  const popupVideoRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isPopupOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPopupOpen]);

  const socialPosts = [
    {
      text: `Eden: India’s next lifestyle landmark. Watch the video to discover MORE! 83% Open Greens | 30,000 Sq. Ft. Clubhouse | 24×7 Security | Wave Galleria Market | Sector 62 Connectivity.`,
      position: "top",
      video: "https://otherassets.blob.core.windows.net/mpf/social-media/social11.mp4"
    },
    {
      text: `Some assets lose value with time. The right home only grows stronger. Watch the video to discover Palm Olympia - premium lifestyle residences backed by legacy, connectivity, luxury, and long-term value`,
      position: "bottom",
      video: "https://otherassets.blob.core.windows.net/mpf/social-media/social22.mp4"
    },
    {
      text: `Experience the beauty of balanced living at Eternia. Watch the video to explore a lifestyle powered by: Spacious Homes  | 25+ Lifestyle Amenities | 130m Wide Road Access | Green Surroundings `,
      position: "bottom",
      video: "https://otherassets.blob.core.windows.net/mpf/social-media/social33.mp4"
    },
    {
      text: "Watch the video before the best units are gone. Eternia Residences brings you open spaces, peaceful living, premium interiors, and everyday convenience : all in one iconic address.",
      position: "top",
      video: "https://otherassets.blob.core.windows.net/mpf/social-media/social44.mp4"
    }
  ];

  const handleVideoClick = (index) => {
    setSelectedVideoIndex(index);
    setIsPopupOpen(true);
  };

  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setSelectedVideoIndex(null);
  }, []);

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

  const primeVideoPreview = useCallback((videoEl) => {
    if (!videoEl || videoEl.dataset.primed === "true") return;

    const showFrame = () => {
      videoEl.dataset.primed = "true";
      const seekTime = Number.isFinite(videoEl.duration) && videoEl.duration > 0
        ? Math.min(0.1, videoEl.duration / 2)
        : 0.001;
      videoEl.currentTime = seekTime;
    };

    if (videoEl.readyState >= 1) {
      showFrame();
      return;
    }

    videoEl.addEventListener("loadeddata", showFrame, { once: true });
    if (videoEl.readyState === 0) {
      videoEl.load();
    }
  }, []);

  const startInlinePreview = useCallback((videoEl) => {
    if (!videoEl) return;

    primeVideoPreview(videoEl);

    const playPromise = videoEl.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        primeVideoPreview(videoEl);
      });
    }
  }, [primeVideoPreview]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          const video = target;
          if (isIntersecting) {
            startInlinePreview(video);
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.2, rootMargin: "40px" }
    );

    const observeVideos = () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.observe(video);
      });
    };

    observeVideos();

    const primeTimer = window.setTimeout(() => {
      videoRefs.current.forEach((video) => {
        if (video) primeVideoPreview(video);
      });
    }, 150);

    return () => {
      window.clearTimeout(primeTimer);
      observer.disconnect();
    };
  }, [startInlinePreview, primeVideoPreview, socialPosts.length]);

  const handleSwiperSlideChange = useCallback((swiper) => {
    const activeVideo = videoRefs.current[swiper.realIndex];
    if (activeVideo) {
      startInlinePreview(activeVideo);
    }
  }, [startInlinePreview]);

  useEffect(() => {
    if (!isPopupOpen || !popupVideoRef.current) return;

    const popupVideo = popupVideoRef.current;
    popupVideo.load();
    const playPromise = popupVideo.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  }, [isPopupOpen, selectedVideoIndex]);

  const selectedVideo = selectedVideoIndex !== null ? socialPosts[selectedVideoIndex] : null;

  return (
    <>
      <div className="social-feeds-section my-4 my-lg-5">
        <div className="container-fluid">
          <div className="section-header-wrapper mb-lg-5">
            <h2 className="text-center mb-0 plus-jakarta-sans-semi-bold">
              Social Feeds from MPF on Instagram
            </h2>

          </div>
          <div className="container">
            <div className="social-feeds-swiper-wrapper">
              <Swiper
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
                className="social-feeds-swiper"
              >
                {socialPosts.map((post, index) => (
                  <SwiperSlide key={index}>
                    <div
                      className="instagram-post-card"
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
                      <div className="post-video-wrapper" onClick={() => handleVideoClick(index)}>
                        <video
                          ref={(el) => {
                            videoRefs.current[index] = el;
                          }}
                          id={`social-video-${index}`}
                          className="post-video"
                          src={post.video}
                          loop
                          muted
                          playsInline
                          preload="auto"
                          aria-label={post.text.replace(/\s+/g, " ").trim().slice(0, 160)}
                        />
                        {/* Play Icon Overlay - Always show on hover */}
                        {hoveredIndex === index && (
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
                        {/* Text Overlay - Shows on hover with gradient background */}
                        <div className={`post-text-overlay ${post.position} ${hoveredIndex === index ? 'show-text' : ''}`}>
                          <div className="post-text-background">
                            <div className="text-content-wrapper">
                              <p className="post-text plus-jakarta-sans-semi-bold">{post.text}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>

      {/* Video Popup Modal */}
      {isPopupOpen && selectedVideo && (
        <div
          className="video-popup-overlay"
          onClick={handleBackdropClick}
        >
          <div className="video-popup-container">
            <button
              className="video-popup-close"
              onClick={closePopup}
              aria-label="Close video popup"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="video-popup-content">
              <video
                ref={popupVideoRef}
                className="video-popup-player"
                src={selectedVideo.video}
                controls
                loop
                playsInline
                autoPlay
                muted
                preload="auto"
                aria-label={selectedVideo.text.replace(/\s+/g, " ").trim().slice(0, 200)}
              />
              {selectedVideo.text && (
                <div className="video-popup-text">
                  <p>{selectedVideo.text}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
