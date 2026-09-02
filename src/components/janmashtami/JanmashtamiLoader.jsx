"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./page.module.css";

export default function JanmashtamiLoader() {
  const containerRef = useRef(null);
  const handiGroupRef = useRef(null);
  const leftRopeRef = useRef(null);
  const rightRopeRef = useRef(null);

  // Loader Visual Elements
  const progressBarFillRef = useRef(null);
  const progressCounterRef = useRef(null);
  const statusTextRef = useRef(null);

  // Feather Assembly
  const featherGroupRef = useRef(null);
  const featherBarbsLeftRef = useRef(null);
  const featherBarbsRightRef = useRef(null);
  const featherEyeRef = useRef(null);

  // Crack Paths & Flash Glow
  const crackMainRef = useRef(null);
  const crackBranch1Ref = useRef(null);
  const crackBranch2Ref = useRef(null);
  const crackGlowRef = useRef(null);
  const textRef = useRef(null);

  // Pot Fragments
  const fragTopLeftRef = useRef(null);
  const fragTopRightRef = useRef(null);
  const fragMidLeftRef = useRef(null);
  const fragMidRightRef = useRef(null);
  const fragBottomRef = useRef(null);

  // Makhan Liquid Elements
  const makhanMainRef = useRef(null);
  const makhanLargeBlobsRef = useRef(null);
  const makhanMediumBlobsRef = useRef(null);
  const makhanDropletsRef = useRef(null);

  const [isDestroyed, setIsDestroyed] = useState(false);
  /** When true, cleanup must kill() not revert() — revert restores opacity and causes a blink. */
  const hasExitedCleanly = useRef(false);

  useEffect(() => {
    if (isDestroyed) return;

    // Smoother frame pacing on busy pages
    gsap.ticker.lagSmoothing(500, 33);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      gsap.set(
        [
          handiGroupRef.current,
          featherGroupRef.current,
          featherBarbsLeftRef.current,
          featherBarbsRightRef.current,
          featherEyeRef.current,
          fragTopLeftRef.current,
          fragTopRightRef.current,
          fragMidLeftRef.current,
          fragMidRightRef.current,
          fragBottomRef.current,
          makhanMainRef.current,
          makhanLargeBlobsRef.current,
          makhanMediumBlobsRef.current,
          makhanDropletsRef.current,
          containerRef.current,
        ],
        { force3D: true },
      );

      // ---------------------------------------------------------------------
      // PHASE 1: Progress line & counter (0% → 100%)
      // ---------------------------------------------------------------------
      gsap.set(progressBarFillRef.current, {
        scaleX: 0,
        transformOrigin: "left center",
        force3D: true,
      });

      const progressObj = { value: 0 };
      let lastShownPercent = -1;

      gsap.to(progressBarFillRef.current, {
        scaleX: 1,
        duration: 2.8,
        ease: "power2.inOut",
      });

      gsap.to(progressObj, {
        value: 100,
        duration: 2.8,
        ease: "power2.inOut",
        onUpdate: () => {
          const val = Math.round(progressObj.value);
          if (val === lastShownPercent) return;
          lastShownPercent = val;
          if (progressCounterRef.current) {
            progressCounterRef.current.textContent = `${val}%`;
          }
        },
      });

      gsap.to(statusTextRef.current, {
        opacity: 0.4,
        duration: 1.35,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(`.${styles.amberGlow}`, {
        scale: 1.1,
        opacity: 0.88,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(`.${styles.emeraldGlow}`, {
        scale: 1.07,
        opacity: 0.92,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.5,
      });
      gsap.to(`.${styles.blueAura}`, {
        scale: 1.05,
        opacity: 0.9,
        duration: 4.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.9,
      });

      // ---------------------------------------------------------------------
      // PHASE 2: Smooth left ↔ right handi pendulum + rope flex
      // ---------------------------------------------------------------------
      // Real pendulum needs both sides (−deg → +deg). svgOrigin = rope hang point.
      gsap.set(handiGroupRef.current, {
        svgOrigin: "150 0",
        rotation: -5,
        y: 0,
        force3D: true,
      });
      gsap.set(leftRopeRef.current, {
        attr: { d: "M 112 0 Q 106 78 126 138" },
      });
      gsap.set(rightRopeRef.current, {
        attr: { d: "M 188 0 Q 178 78 174 138" },
      });
      gsap.set(featherGroupRef.current, {
        transformOrigin: "50% 100%",
        rotation: -3.5,
        force3D: true,
      });

      const SWING_DURATION = 3.4;
      const SWING_EASE = "sine.inOut";

      const pendulumTL = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: { duration: SWING_DURATION, ease: SWING_EASE },
      });

      pendulumTL
        .to(
          handiGroupRef.current,
          {
            rotation: 5,
            y: 2.5,
          },
          0,
        )
        .to(
          leftRopeRef.current,
          {
            attr: { d: "M 112 0 Q 124 78 126 138" },
          },
          0,
        )
        .to(
          rightRopeRef.current,
          {
            attr: { d: "M 188 0 Q 194 78 174 138" },
          },
          0,
        )
        .to(
          featherGroupRef.current,
          {
            rotation: 6.5,
          },
          0.1,
        );

      gsap.to(featherBarbsLeftRef.current, {
        skewY: 2,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(featherBarbsRightRef.current, {
        skewY: -2,
        duration: 2.35,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(featherEyeRef.current, {
        scale: 1.035,
        transformOrigin: "50% 50%",
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(`.${styles.goldDust}`, {
        y: "-=36",
        x: "+=8",
        opacity: 0.75,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.18, from: "random" },
        ease: "sine.inOut",
        force3D: true,
      });

      // ---------------------------------------------------------------------
      // PHASE 3: Crack & Shatter Transition (Triggered at 100%)
      // ---------------------------------------------------------------------
      const triggerBreakSequence = () => {
        pendulumTL.pause();
        gsap.killTweensOf([
          featherGroupRef.current,
          featherBarbsLeftRef.current,
          featherBarbsRightRef.current,
          featherEyeRef.current,
        ]);

        // Ease pot back to center before impact (no hard kill mid-swing)
        gsap
          .timeline({
            onComplete: () => {
              pendulumTL.kill();
              startBreakImpact();
            },
          })
          .to(handiGroupRef.current, {
            rotation: 0,
            y: 0,
            duration: 0.5,
            ease: "power2.inOut",
            svgOrigin: "150 0",
          })
          .to(
            leftRopeRef.current,
            {
              attr: { d: "M 112 0 Q 115 72 126 138" },
              duration: 0.5,
              ease: "power2.inOut",
            },
            0,
          )
          .to(
            rightRopeRef.current,
            {
              attr: { d: "M 188 0 Q 185 72 174 138" },
              duration: 0.5,
              ease: "power2.inOut",
            },
            0,
          )
          .to(
            featherGroupRef.current,
            {
              rotation: 0,
              duration: 0.5,
              ease: "power2.inOut",
            },
            0,
          );
      };

      const startBreakImpact = () => {
        const breakTL = gsap.timeline({
          defaults: { force3D: true },
          onComplete: () => {
            hasExitedCleanly.current = true;
            setIsDestroyed(true);
          },
        });

        breakTL
          .to(handiGroupRef.current, {
            keyframes: [
              { x: -2, y: 1, scale: 1.015, duration: 0.045 },
              { x: 2.2, y: -1.2, scale: 1.025, duration: 0.045 },
              { x: -1.6, y: 0.8, scale: 1.02, duration: 0.045 },
              { x: 1.4, y: -0.6, scale: 1.018, duration: 0.045 },
              { x: -0.8, y: 0.4, scale: 1.01, duration: 0.045 },
              { x: 0, y: 0, scale: 1, duration: 0.06 },
            ],
            ease: "none",
          })

          .to(
            [crackMainRef.current, crackBranch1Ref.current, crackBranch2Ref.current],
            {
              opacity: 1,
              strokeDashoffset: 0,
              duration: 0.32,
              stagger: 0.04,
              ease: "power2.out",
            },
            "-=0.12"
          )
          // Soft crack glow — no hard flash
          .to(
            crackGlowRef.current,
            {
              opacity: 0.55,
              duration: 0.2,
              ease: "sine.out",
            },
            "<0.06"
          )
          .to(
            crackGlowRef.current,
            {
              opacity: 0,
              duration: 0.35,
              ease: "sine.in",
            },
            ">-0.05"
          )

          // Fade out loading UI and text elements
          .to(
            textRef.current,
            {
              autoAlpha: 0,
              y: -8,
              duration: 0.45,
              ease: "power2.out",
            },
            "<"
          )

          // Shatter fragments — softer ease, slight stagger for fluidity
          .to(
            fragTopLeftRef.current,
            {
              x: -95,
              y: -40,
              rotation: -42,
              opacity: 0,
              duration: 1.05,
              ease: "power2.out",
            },
            "+=0.04"
          )
          .to(
            fragTopRightRef.current,
            {
              x: 100,
              y: -35,
              rotation: 48,
              opacity: 0,
              duration: 1.05,
              ease: "power2.out",
            },
            "<0.04"
          )
          .to(
            fragMidLeftRef.current,
            {
              x: -115,
              y: 50,
              rotation: -65,
              opacity: 0,
              duration: 1.1,
              ease: "power2.out",
            },
            "<0.03"
          )
          .to(
            fragMidRightRef.current,
            {
              x: 120,
              y: 55,
              rotation: 70,
              opacity: 0,
              duration: 1.1,
              ease: "power2.out",
            },
            "<0.03"
          )
          .to(
            fragBottomRef.current,
            {
              y: 130,
              rotation: 18,
              opacity: 0,
              duration: 1.15,
              ease: "power2.out",
            },
            "<0.02"
          )

          // Makhan Splash
          .to(
            [
              makhanMainRef.current,
              makhanLargeBlobsRef.current,
              makhanMediumBlobsRef.current,
              makhanDropletsRef.current,
            ],
            {
              scale: 1.65,
              y: 80,
              opacity: 0,
              stagger: 0.04,
              duration: 0.95,
              ease: "power2.out",
            },
            "<"
          )

          // Peacock Feather Drifts Away
          .to(
            featherGroupRef.current,
            {
              y: -95,
              x: 55,
              rotation: 42,
              opacity: 0,
              duration: 1.35,
              ease: "power2.inOut",
            },
            "<"
          )

          // Dissolve Ropes & progress line
          .to(
            [leftRopeRef.current, rightRopeRef.current],
            {
              opacity: 0,
              duration: 0.55,
              ease: "power1.out",
            },
            "<0.12"
          )

          // Fade ambient glows with the scene (keep solid dark backdrop until end)
          .to(
            [`.${styles.amberGlow}`, `.${styles.emeraldGlow}`, `.${styles.blueAura}`, `.${styles.particlesWrapper}`],
            {
              autoAlpha: 0,
              duration: 0.5,
              ease: "power1.out",
            },
            "<"
          )

          // Brief hold — dark overlay still fully covers the site (no header bleed)
          .to({}, { duration: 0.18 })

          // Only NOW fade the solid overlay away (no overlap with shatter)
          .to(containerRef.current, {
            autoAlpha: 0,
            duration: 0.5,
            ease: "power2.inOut",
          });
      };

      // Ensure minimum display presentation duration before trigger
      const MIN_PRESENTATION_TIME = 3000;
      const startTime = Date.now();

      const onPageReady = () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_PRESENTATION_TIME - elapsed);
        gsap.delayedCall(remaining / 1000, triggerBreakSequence);
      };

      if (document.readyState === "complete") {
        onPageReady();
      } else {
        window.addEventListener("load", onPageReady);
      }

      return () => window.removeEventListener("load", onPageReady);
    }, containerRef);

    return () => {
      document.body.style.overflow = previousOverflow;
      // Successful exit: kill without reverting styles (avoids 1-frame opacity flash)
      if (hasExitedCleanly.current) {
        ctx.kill();
      } else {
        ctx.revert();
      }
    };
  }, [isDestroyed]);

  if (isDestroyed) return null;

  return (
    <div ref={containerRef} className={styles.loaderContainer}>
      {/* Background Soft Ambient Lighting */}
      <div className={styles.amberGlow} />
      <div className={styles.emeraldGlow} />
      <div className={styles.blueAura} />

      {/* Atmospheric Floating Golden Particles */}
      <div className={styles.particlesWrapper}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={styles.goldDust}
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              top: `${(i * 5.2) % 100}%`,
              left: `${(i * 9.7) % 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main Vector Scene Container */}
      <div className={styles.sceneWrapper}>
        <svg
          viewBox="0 0 300 400"
          className={styles.svgContainer}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Detailed SVG Gradients & Filters */}
          <defs>
            {/* Terracotta Clay Gradients */}
            <radialGradient id="clayBodyGrad" cx="30%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#E2845B" />
              <stop offset="35%" stopColor="#C45A30" />
              <stop offset="70%" stopColor="#8F3413" />
              <stop offset="100%" stopColor="#4A1605" />
            </radialGradient>

            <linearGradient id="clayRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6A220B" />
              <stop offset="25%" stopColor="#D97247" />
              <stop offset="50%" stopColor="#ED926B" />
              <stop offset="75%" stopColor="#B34B24" />
              <stop offset="100%" stopColor="#4A1605" />
            </linearGradient>

            <radialGradient id="clayInnerShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
              <stop offset="80%" stopColor="#3A1003" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6A220B" stopOpacity="0" />
            </radialGradient>

            {/* Makhan Cream Gradients */}
            <radialGradient id="makhanTopGrad" cx="35%" cy="25%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#FFFDF7" />
              <stop offset="80%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.45" />
            </radialGradient>

            {/* Peacock Feather Gradients */}
            <radialGradient id="eyeHaloGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="85%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064E3B" stopOpacity="0.8" />
            </radialGradient>

            <radialGradient id="eyeCoreGrad" cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="40%" stopColor="#1D4ED8" />
              <stop offset="80%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            <linearGradient id="stemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </linearGradient>

            {/* Filters */}
            <filter id="crackGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="potShadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Realistic Braided Rope Hangers */}
          <path
            ref={leftRopeRef}
            d="M 112 0 Q 106 78 126 138"
            stroke="#9C7A67"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="4 2"
          />
          <path
            ref={rightRopeRef}
            d="M 188 0 Q 178 78 174 138"
            stroke="#9C7A67"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="4 2"
          />

          {/* MAIN SWINGING ASSEMBLY */}
          <g ref={handiGroupRef} filter="url(#potShadow)">
            {/* Peacock Feather Assembly */}
            <g ref={featherGroupRef} id="peacock-feather">
              <path
                d="M 150 145 Q 115 75 132 20"
                stroke="url(#stemGrad)"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              {/* Left Barbs */}
              <g ref={featherBarbsLeftRef}>
                <path
                  d="M 144 135 Q 112 118 92 112 M 140 115 Q 106 95 86 85 M 136 95 Q 102 75 88 58 M 133 75 Q 105 52 98 38 M 132 55 Q 114 38 112 25"
                  stroke="#059669"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  d="M 142 125 Q 118 108 98 102 M 138 105 Q 110 85 92 72 M 134 85 Q 110 65 94 48"
                  stroke="#10B981"
                  strokeWidth="0.9"
                  opacity="0.75"
                />
              </g>

              {/* Right Barbs */}
              <g ref={featherBarbsRightRef}>
                <path
                  d="M 148 130 Q 170 110 190 102 M 143 110 Q 172 88 194 75 M 139 90 Q 170 68 184 48 M 135 70 Q 164 48 172 32 M 133 50 Q 155 35 160 22"
                  stroke="#047857"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  d="M 146 120 Q 175 100 185 92 M 141 100 Q 172 78 186 62 M 137 80 Q 164 58 174 40"
                  stroke="#34D399"
                  strokeWidth="0.9"
                  opacity="0.75"
                />
              </g>

              <path
                d="M 147 142 Q 138 132 132 140 M 150 140 Q 158 130 162 138"
                stroke="#6EE7B7"
                strokeWidth="1"
                opacity="0.8"
              />

              {/* Peacock Eye */}
              <g ref={featherEyeRef} id="feather-eye">
                <ellipse
                  cx="132"
                  cy="28"
                  rx="18"
                  ry="24"
                  fill="url(#eyeHaloGrad)"
                  transform="rotate(-16 132 28)"
                />
                <ellipse
                  cx="132"
                  cy="29"
                  rx="11"
                  ry="15"
                  fill="url(#eyeCoreGrad)"
                  transform="rotate(-16 132 29)"
                />
                <ellipse
                  cx="132"
                  cy="30"
                  rx="5.5"
                  ry="7.5"
                  fill="#020617"
                  transform="rotate(-16 132 30)"
                />
                <ellipse
                  cx="128"
                  cy="24"
                  rx="2.5"
                  ry="4"
                  fill="#FFFFFF"
                  opacity="0.85"
                  transform="rotate(-30 128 24)"
                />
              </g>
            </g>

            {/* Terracotta Handi Fragments */}
            <g id="handi-terracotta">
              <ellipse cx="150" cy="150" rx="46" ry="10" fill="url(#clayInnerShadow)" />

              <path
                ref={fragTopLeftRef}
                d="M 150 140 C 122 140 98 147 90 162 C 84 174 82 195 82 210 L 150 210 Z"
                fill="url(#clayBodyGrad)"
              />
              <path
                ref={fragTopRightRef}
                d="M 150 140 C 178 140 202 147 210 162 C 216 174 218 195 218 210 L 150 210 Z"
                fill="url(#clayBodyGrad)"
              />
              <path
                ref={fragMidLeftRef}
                d="M 82 210 C 82 238 98 262 120 274 L 150 210 Z"
                fill="url(#clayBodyGrad)"
              />
              <path
                ref={fragMidRightRef}
                d="M 218 210 C 218 238 202 262 180 274 L 150 210 Z"
                fill="url(#clayBodyGrad)"
              />
              <path
                ref={fragBottomRef}
                d="M 120 274 C 132 281 168 281 180 274 C 160 288 140 288 120 274 Z"
                fill="#3A1003"
              />

              <path
                d="M 98 148 C 98 142, 202 142, 202 148 C 202 154, 98 154, 98 148 Z"
                fill="url(#clayRimGrad)"
                stroke="#3A1003"
                strokeWidth="0.8"
              />

              <path
                d="M 92 188 Q 150 212 208 188"
                stroke="#F59E0B"
                strokeWidth="2.2"
                strokeDasharray="5 3"
                opacity="0.8"
              />
              <path
                d="M 87 218 Q 150 248 213 218"
                stroke="#D97706"
                strokeWidth="1.8"
                strokeDasharray="7 4"
                opacity="0.65"
              />
              <circle cx="150" cy="202" r="3" fill="#F59E0B" opacity="0.85" />
              <circle cx="130" cy="200" r="2" fill="#F59E0B" opacity="0.7" />
              <circle cx="170" cy="200" r="2" fill="#F59E0B" opacity="0.7" />

              <path
                d="M 94 172 C 90 198 94 232 110 252"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.16"
              />
            </g>

            {/* Crack Overlay */}
            <g id="crack-overlay">
              <path
                ref={crackGlowRef}
                d="M 150 144 L 144 172 L 156 200 L 140 234 L 150 276"
                stroke="#FDE68A"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0"
                filter="url(#crackGlowFilter)"
              />
              <path
                ref={crackMainRef}
                d="M 150 144 L 144 172 L 156 200 L 140 234 L 150 276"
                stroke="#FFFFFF"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0"
                style={{ strokeDasharray: 220, strokeDashoffset: 220 }}
              />
              <path
                ref={crackBranch1Ref}
                d="M 144 172 L 128 184"
                stroke="#FFFBEB"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0"
                style={{ strokeDasharray: 50, strokeDashoffset: 50 }}
              />
              <path
                ref={crackBranch2Ref}
                d="M 156 200 L 176 214"
                stroke="#FFFBEB"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0"
                style={{ strokeDasharray: 50, strokeDashoffset: 50 }}
              />
            </g>

            {/* Makhan Overflow */}
            <g ref={makhanMainRef} id="makhan-overflow">
              <path
                d="M 96 148 C 102 132, 126 128, 150 128 C 174 128, 198 132, 204 148 C 210 162, 188 166, 150 164 C 112 166, 90 162, 96 148 Z"
                fill="url(#makhanTopGrad)"
              />
              <path
                d="M 112 156 C 110 174, 122 182, 124 156 C 140 168, 158 184, 162 158 C 178 174, 188 170, 186 154"
                fill="#FFFDF5"
              />
              <ellipse cx="136" cy="136" rx="16" ry="5" fill="#FFFFFF" opacity="0.8" />
            </g>

            <g ref={makhanLargeBlobsRef}>
              <path d="M 122 154 C 116 168, 130 176, 134 158 Z" fill="#FFFBEB" />
              <path d="M 154 156 C 148 174, 168 180, 164 158 Z" fill="#FFFFFF" />
            </g>

            <g ref={makhanMediumBlobsRef}>
              <circle cx="108" cy="160" r="5" fill="#FFFDF5" />
              <circle cx="190" cy="158" r="5.5" fill="#FFFBEB" />
            </g>

            <g ref={makhanDropletsRef}>
              <circle cx="118" cy="170" r="2.8" fill="#FFFFFF" />
              <circle cx="144" cy="178" r="3.2" fill="#FFFDF5" />
              <circle cx="174" cy="172" r="2.8" fill="#FFFFFF" />
            </g>
          </g>
        </svg>
      </div>

      {/* -----------------------------------------------------------------
          DYNAMIC LOADER TYPOGRAPHY & PERCENTAGE DISPLAY
         ----------------------------------------------------------------- */}
      <div ref={textRef} className={styles.textWrapper}>
        <p className={styles.greetingText}>Happy Janmashtami</p>
        <span ref={progressCounterRef} className={styles.progressCounter}>
          0%
        </span>
        <div className={styles.progressTrack} aria-hidden="true">
          <div ref={progressBarFillRef} className={styles.progressFill} />
        </div>
        <p ref={statusTextRef} className={styles.loadingStatus}>
          Loading Experience...
        </p>
      </div>
    </div>
  );
}