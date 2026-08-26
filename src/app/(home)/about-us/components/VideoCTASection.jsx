"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./style/VideoCTASection.css";

const OTHER_PODCASTS = [
  {
    img: "/about/podcasts/pd1.jpg",
    title: "MPF Podcast 1",
    iframeUrl:
      "<iframe width='560' height='315' src='https://www.youtube.com/embed/KdiOxsIj8lc?si=KYiCsq2ZnDXZpzxs' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
  },
  {
    img: "/about/podcasts/pd2.jpg",
    title: "MPF Podcast 2",
    iframeUrl:
      "<iframe width='560' height='315' src='https://www.youtube.com/embed/7z2-277kK7w?si=3taphnDLGLraLwal' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
  },
  {
    img: "/about/podcasts/pd3.jpg",
    title: "MPF Podcast 3",
    iframeUrl:
      "<iframe width='560' height='315' src='https://www.youtube.com/embed/vAUTVfKpWW4?si=lKks0ozSfhoOnXKF' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
  },
  {
    img: "/about/podcasts/pd4.jpg",
    title: "MPF Podcast 4",
    iframeUrl:
      "<iframe width='560' height='315' src='https://www.youtube.com/embed/VpgMlo7dz1I?si=4b13m3uLBgDArFEt' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
  },
  {
    img: "/about/podcasts/pd5.jpg",
    title: "MPF Podcast 5",
    iframeUrl:
      "<iframe width='560' height='315' src='https://www.youtube.com/embed/ToAkzbKIrjU?si=b-9QmxvnnVqgc2xw' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
  },
  {
    img: "/about/podcasts/pd6.jpg",
    title: "MPF Podcast 6",
    iframeUrl:
      "<iframe width='560' height='315' src='https://www.youtube.com/embed/AeAJ_x8ljtU?si=97xckF0K8u6v-Yua' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
  },
  {
    img: "/about/podcasts/pd7.jpg",
    title: "MPF Podcast 7",
    iframeUrl:
      "<iframe width='560' height='315' src='https://www.youtube.com/embed/ua7ylOB_eRI?si=DC-bh7UaT0E_6yAh' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
  },
  {
    img: "/about/podcasts/pd8.jpg",
    title: "MPF Podcast 8",
    iframeUrl:
      "<iframe width='560' height='315' src='https://www.youtube.com/embed/7AkbiH3YPh4?si=qvDDHHQ-eS07NXzv' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
  },
  {
    img: "/about/podcasts/pd9.jpg",
    title: "MPF Podcast 9",
    iframeUrl:
      "<iframe width='560' height='315' src='https://www.youtube.com/embed/GT8UyKTYx3s?si=JhjALO2ulA1oDUN8' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
  },
];

const INITIAL_DEFAULT_PODCAST = {
  img: "/about/podcasts/default.jpg",
  title: "MPF Podcast",
  iframeUrl:
    "<iframe width='560' height='315' src='https://www.youtube.com/embed/jKLAEVW-PGo?si=wRqY1JjxekM6XF19' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>",
};

function extractEmbedSrc(iframeHtml) {
  const match = String(iframeHtml || "").match(/\ssrc=['"]([^'"]+)['"]/i);
  return match?.[1] || "";
}

/** Build player URL; autoplay needs mute for browser policies. */
function buildPlayerSrc(iframeHtml, autoplay) {
  const raw = extractEmbedSrc(iframeHtml);
  if (!raw) return "";

  try {
    const url = new URL(raw);
    if (autoplay) {
      url.searchParams.set("autoplay", "1");
      url.searchParams.set("mute", "1");
    } else {
      url.searchParams.delete("autoplay");
      url.searchParams.delete("mute");
    }
    url.searchParams.set("rel", "0");
    return url.toString();
  } catch {
    return raw;
  }
}

function PodcastCard({ podcast, duplicate = false, index, onSelect }) {
  return (
    <button
      type="button"
      className="videoPodcastCard"
      title={podcast.title}
      aria-label={`Play ${podcast.title}`}
      aria-hidden={duplicate ? "true" : undefined}
      tabIndex={duplicate ? -1 : undefined}
      onClick={() => {
        if (!duplicate) onSelect?.(podcast, index);
      }}
    >
      <img
        src={podcast.img}
        alt={duplicate ? "" : podcast.title}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <span className="videoPodcastPlay" aria-hidden="true">
        <svg viewBox="0 0 68 48" width="54" height="38" focusable="false">
          <path
            className="videoPodcastPlayBg"
            d="M66.52 7.52c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.33c-2.93.78-4.63 3.26-5.42 6.19C.46 12.83 0 24 0 24s.46 11.17 1.48 16.48c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.33c2.93-.78 4.64-3.26 5.42-6.19C67.54 35.17 68 24 68 24s-.46-11.17-1.48-16.48z"
          />
          <path className="videoPodcastPlayIcon" d="M45 24 27 14v20" />
        </svg>
      </span>
    </button>
  );
}

export default function VideoCTASection() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const directionRef = useRef(1);
  const pausedRef = useRef(false);
  const defaultPodcastRef = useRef(INITIAL_DEFAULT_PODCAST);

  const [defaultPodcast, setDefaultPodcast] = useState(INITIAL_DEFAULT_PODCAST);
  const [marqueePodcasts, setMarqueePodcasts] = useState(OTHER_PODCASTS);
  const [autoplay, setAutoplay] = useState(false);

  defaultPodcastRef.current = defaultPodcast;

  const handleSelectPodcast = useCallback((podcast, index) => {
    if (!podcast || typeof index !== "number") return;

    const previous = defaultPodcastRef.current;
    if (podcast.img === previous.img) return;

    // Swap in place so marquee position / motion stay uninterrupted.
    setMarqueePodcasts((list) => {
      const next = list.slice();
      next[index] = previous;
      return next;
    });
    setDefaultPodcast(podcast);
    setAutoplay(true);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return undefined;

    const marquee = section.querySelector(".videoPodcastMarquee");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let lastScrollY = window.scrollY;
    let scrollRaf = 0;
    let resizeRaf = 0;
    let distance = 0;
    let pos = 0;

    const sets = () => gsap.utils.toArray(".videoPodcastSet", track);

    const pixelsPerSecond = () => {
      const w = window.innerWidth;
      if (w < 480) return 28;
      if (w < 768) return 34;
      if (w < 1200) return 42;
      return 48;
    };

    const measure = () => {
      const firstSet = sets()[0];
      distance = firstSet?.offsetWidth || 0;
      if (distance > 0) {
        pos = gsap.utils.wrap(-distance, 0, pos);
        gsap.set(track, { x: pos, force3D: true });
      }
    };

    const onTick = (_time, deltaTime) => {
      if (pausedRef.current || reducedMotion || !distance) return;
      pos -= (deltaTime / 1000) * pixelsPerSecond() * directionRef.current;
      pos = gsap.utils.wrap(-distance, 0, pos);
      gsap.set(track, { x: pos, force3D: true });
    };

    const ctx = gsap.context(() => {
      gsap.set(track, { x: 0, force3D: true });
      measure();
      if (!reducedMotion) gsap.ticker.add(onTick);
    }, section);

    const pauseMarquee = () => {
      pausedRef.current = true;
    };

    const resumeMarquee = () => {
      pausedRef.current = false;
    };

    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = 0;
        measure();
      });
    };

    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(() => {
        scrollRaf = 0;
        const y = window.scrollY;
        const delta = y - lastScrollY;
        lastScrollY = y;
        if (Math.abs(delta) < 1) return;
        directionRef.current = delta > 0 ? 1 : -1;
      });
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    marquee?.addEventListener("pointerenter", pauseMarquee);
    marquee?.addEventListener("pointerleave", resumeMarquee);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      marquee?.removeEventListener("pointerenter", pauseMarquee);
      marquee?.removeEventListener("pointerleave", resumeMarquee);
      if (scrollRaf) window.cancelAnimationFrame(scrollRaf);
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      gsap.ticker.remove(onTick);
      ctx.revert();
    };
  }, []);

  const activeEmbedSrc = buildPlayerSrc(defaultPodcast.iframeUrl, autoplay);

  return (
    <section ref={sectionRef} className="videoCTASection">
      <div className="videoCTAContainer">
        <h2 className="videoTitle heading">
          <span>Turn Your Property Into An</span>
          <span>Opportunity</span>
        </h2>

        <div className="videoWrapper">
          <iframe
            key={activeEmbedSrc}
            src={activeEmbedSrc}
            title={defaultPodcast.title || "My Property Fact Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <div
          className="videoPodcastMarquee"
          aria-label="More My Property Fact podcasts"
        >
          <div className="videoPodcastTrack" ref={trackRef}>
            <div className="videoPodcastSet">
              {marqueePodcasts.map((podcast, index) => (
                <PodcastCard
                  key={`slot-a-${index}`}
                  index={index}
                  podcast={podcast}
                  onSelect={handleSelectPodcast}
                />
              ))}
            </div>
            <div className="videoPodcastSet" aria-hidden="true">
              {marqueePodcasts.map((podcast, index) => (
                <PodcastCard
                  key={`slot-b-${index}`}
                  index={index}
                  podcast={podcast}
                  duplicate
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
