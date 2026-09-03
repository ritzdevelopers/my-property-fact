"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./page.module.css";

export default function JanmashtamiLoader() {
  const containerRef = useRef(null);
  const sceneShakeRef = useRef(null);
  const handiGroupRef = useRef(null);
  const leftRopeRef = useRef(null);
  const rightRopeRef = useRef(null);
  const leftRopeTwistRef = useRef(null);
  const rightRopeTwistRef = useRef(null);
  const ropeNetRef = useRef(null);

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
  const crackBranch3Ref = useRef(null);
  const crackBranch4Ref = useRef(null);
  const crackGlowRef = useRef(null);
  const shockwaveRef = useRef(null);
  const dustBurstRef = useRef(null);
  const textRef = useRef(null);
  const clayGrainRef = useRef(null);
  const claySpecularRef = useRef(null);

  // Pot Fragments
  const fragTopLeftRef = useRef(null);
  const fragTopRightRef = useRef(null);
  const fragMidLeftRef = useRef(null);
  const fragMidRightRef = useRef(null);
  const fragBottomRef = useRef(null);
  const fragChipLeftRef = useRef(null);
  const fragChipRightRef = useRef(null);
  const fragChipTopRef = useRef(null);
  const rimFragRef = useRef(null);

  // Makhan Liquid Elements
  const makhanMainRef = useRef(null);
  const makhanLargeBlobsRef = useRef(null);
  const makhanMediumBlobsRef = useRef(null);
  const makhanDropletsRef = useRef(null);
  const makhanSplatRef = useRef(null);
  const mouthHoleRef = useRef(null);

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
          fragChipLeftRef.current,
          fragChipRightRef.current,
          fragChipTopRef.current,
          rimFragRef.current,
          makhanMainRef.current,
          makhanLargeBlobsRef.current,
          makhanMediumBlobsRef.current,
          makhanDropletsRef.current,
          makhanSplatRef.current,
          sceneShakeRef.current,
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

      // Subtle glossy sheen drifting across the clay body — sells "premium" glazed clay
      gsap.to(claySpecularRef.current, {
        x: 14,
        opacity: 0.22,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
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
      gsap.set([leftRopeRef.current, leftRopeTwistRef.current], {
        attr: { d: "M 112 0 Q 106 78 126 138" },
      });
      gsap.set([rightRopeRef.current, rightRopeTwistRef.current], {
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
          [leftRopeRef.current, leftRopeTwistRef.current],
          {
            attr: { d: "M 112 0 Q 124 78 126 138" },
          },
          0,
        )
        .to(
          [rightRopeRef.current, rightRopeTwistRef.current],
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
        )
        .to(
          ropeNetRef.current,
          {
            skewX: 1.4,
            rotation: 1.2,
          },
          0,
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
          claySpecularRef.current,
          ropeNetRef.current,
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
            [leftRopeRef.current, leftRopeTwistRef.current],
            {
              attr: { d: "M 112 0 Q 115 72 126 138" },
              duration: 0.5,
              ease: "power2.inOut",
            },
            0,
          )
          .to(
            [rightRopeRef.current, rightRopeTwistRef.current],
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
          )
          .to(
            ropeNetRef.current,
            { skewX: 0, rotation: 0, duration: 0.5, ease: "power2.inOut" },
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
          // ---- Anticipation: rope net snaps first, pot flexes under impact ----
          .to(ropeNetRef.current, {
            opacity: 0,
            scaleY: 1.03,
            duration: 0.16,
            ease: "power1.in",
          })
          .to(
            handiGroupRef.current,
            {
              keyframes: [
                { x: -2.4, y: 1.2, scale: 1.018, duration: 0.045 },
                { x: 2.6, y: -1.4, scale: 1.03, duration: 0.045 },
                { x: -2, y: 1, scale: 1.024, duration: 0.045 },
                { x: 1.6, y: -0.8, scale: 1.02, duration: 0.045 },
                { x: -1, y: 0.5, scale: 1.012, duration: 0.05 },
                { x: 0, y: 0, scale: 1, duration: 0.06 },
              ],
              ease: "none",
            },
            "<"
          )

          // Camera-shake on the whole scene sells the weight of the impact
          .to(
            sceneShakeRef.current,
            {
              keyframes: [
                { x: -3, y: 2, duration: 0.04 },
                { x: 4, y: -3, duration: 0.04 },
                { x: -3, y: 2, duration: 0.04 },
                { x: 2, y: -1, duration: 0.05 },
                { x: 0, y: 0, duration: 0.06 },
              ],
              ease: "none",
            },
            "<"
          )

          // Expanding shockwave ring right at the fracture origin
          .fromTo(
            shockwaveRef.current,
            { attr: { r: 3 }, strokeWidth: 7, opacity: 0.85 },
            {
              attr: { r: 78 },
              strokeWidth: 0.4,
              opacity: 0,
              duration: 0.55,
              ease: "power2.out",
            },
            "-=0.1"
          )

          // Fine radiating dust/grit thrown off at the moment of fracture
          .to(
            `.${styles.debrisBit}`,
            {
              x: (i) => gsap.utils.random(-70, 70),
              y: (i) => gsap.utils.random(-20, 70),
              opacity: 0,
              scale: 0.2,
              duration: 0.75,
              stagger: { each: 0.012, from: "random" },
              ease: "power2.out",
            },
            "-=0.45"
          )

          .to(
            [
              crackMainRef.current,
              crackBranch1Ref.current,
              crackBranch2Ref.current,
              crackBranch3Ref.current,
              crackBranch4Ref.current,
            ],
            {
              opacity: 1,
              strokeDashoffset: 0,
              duration: 0.3,
              stagger: 0.035,
              ease: "power2.out",
            },
            "-=0.5"
          )
          // Soft crack glow — no hard flash
          .to(
            crackGlowRef.current,
            {
              opacity: 0.6,
              duration: 0.18,
              ease: "sine.out",
            },
            "<0.05"
          )
          .to(
            crackGlowRef.current,
            {
              opacity: 0,
              duration: 0.35,
              ease: "sine.in",
            },
            ">-0.04"
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

          // ---- Shatter fragments — gravity-weighted arcs for a realistic tumble ----
          .to(
            rimFragRef.current,
            {
              x: 6,
              y: -55,
              rotation: 24,
              scale: 0.94,
              opacity: 0,
              duration: 0.95,
              ease: "power1.in",
            },
            "+=0.03"
          )
          .to(
            fragChipTopRef.current,
            {
              x: -18,
              y: -70,
              rotation: -80,
              opacity: 0,
              duration: 0.8,
              ease: "power1.in",
            },
            "<0.02"
          )
          .to(
            fragTopLeftRef.current,
            {
              keyframes: [
                { x: -46, y: -62, rotation: -26, duration: 0.32, ease: "power2.out" },
                { x: -108, y: 44, rotation: -58, opacity: 0, duration: 0.78, ease: "power2.in" },
              ],
            },
            "<-0.01"
          )
          .to(
            fragTopRightRef.current,
            {
              keyframes: [
                { x: 48, y: -58, rotation: 28, duration: 0.32, ease: "power2.out" },
                { x: 112, y: 46, rotation: 62, opacity: 0, duration: 0.78, ease: "power2.in" },
              ],
            },
            "<0.03"
          )
          .to(
            fragChipLeftRef.current,
            {
              x: -80,
              y: 10,
              rotation: -140,
              opacity: 0,
              duration: 0.85,
              ease: "power1.in",
            },
            "<0.04"
          )
          .to(
            fragChipRightRef.current,
            {
              x: 84,
              y: 14,
              rotation: 150,
              opacity: 0,
              duration: 0.85,
              ease: "power1.in",
            },
            "<0.02"
          )
          .to(
            fragMidLeftRef.current,
            {
              keyframes: [
                { x: -30, y: 6, rotation: -18, duration: 0.22, ease: "power1.out" },
                { x: -128, y: 118, rotation: -78, opacity: 0, duration: 0.92, ease: "power2.in" },
              ],
            },
            "<0.05"
          )
          .to(
            fragMidRightRef.current,
            {
              keyframes: [
                { x: 32, y: 8, rotation: 20, duration: 0.22, ease: "power1.out" },
                { x: 134, y: 122, rotation: 84, opacity: 0, duration: 0.92, ease: "power2.in" },
              ],
            },
            "<0.02"
          )
          .to(
            fragBottomRef.current,
            {
              y: 148,
              rotation: 22,
              opacity: 0,
              duration: 1.0,
              ease: "power2.in",
            },
            "<0.03"
          )

          // Butter splash bursts loose the instant the shell gives way
          .to(
            mouthHoleRef.current,
            { opacity: 0.9, duration: 0.12, ease: "none" },
            "<-0.55"
          )
          .to(
            [
              makhanMainRef.current,
              makhanLargeBlobsRef.current,
              makhanMediumBlobsRef.current,
            ],
            {
              scale: 1.7,
              y: 86,
              opacity: 0,
              stagger: 0.045,
              duration: 0.9,
              ease: "power2.out",
            },
            "<-0.4"
          )
          .to(
            makhanDropletsRef.current,
            {
              keyframes: [
                { y: "-=14", opacity: 1, duration: 0.18, ease: "power2.out" },
                { y: "+=70", opacity: 0, duration: 0.62, ease: "power2.in" },
              ],
            },
            "<"
          )
          // Creamy splat catching light where it lands
          .fromTo(
            makhanSplatRef.current,
            { scale: 0.2, opacity: 0.85 },
            {
              scale: 1,
              opacity: 0,
              duration: 0.9,
              ease: "power2.out",
              transformOrigin: "50% 50%",
            },
            "<0.1"
          )

          // Peacock Feather Drifts Away with a gentle organic wobble
          .to(
            featherGroupRef.current,
            {
              keyframes: [
                { y: -30, x: 14, rotation: 10, duration: 0.4, ease: "power1.out" },
                { y: -68, x: 34, rotation: 30, duration: 0.5, ease: "sine.inOut" },
                { y: -108, x: 58, rotation: 46, opacity: 0, duration: 0.55, ease: "power1.in" },
              ],
            },
            "-=1.5"
          )

          // Dissolve Ropes & progress line
          .to(
            [
              leftRopeRef.current,
              rightRopeRef.current,
              leftRopeTwistRef.current,
              rightRopeTwistRef.current,
            ],
            {
              opacity: 0,
              duration: 0.5,
              ease: "power1.out",
            },
            "<0.15"
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
          .to({}, { duration: 0.16 })

          // A last soft bloom of warm light — a premium "reveal" cue — before the cut to page
          .to(
            containerRef.current,
            {
              "--reveal-glow": 0.5,
              duration: 0.22,
              ease: "sine.out",
            },
            ">-0.05"
          )
          .to(containerRef.current, {
            autoAlpha: 0,
            duration: 0.48,
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

  // Small radiating debris bits scattered around the fracture point
  const debrisBits = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const radius = 3 + (i % 3);
    return {
      cx: 150 + Math.cos(angle) * radius,
      cy: 168 + Math.sin(angle) * radius * 0.6,
      r: (i % 3 === 0 ? 1.6 : 1) * ((i % 2) + 1),
    };
  });

  return (
    <div ref={containerRef} className={styles.loaderContainer}>
      {/* Background Soft Ambient Lighting */}
      <div className={styles.amberGlow} />
      <div className={styles.emeraldGlow} />
      <div className={styles.blueAura} />
      <div className={styles.revealBloom} />

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
        <div ref={sceneShakeRef} className={styles.shakeLayer}>
        <svg
          viewBox="0 0 300 400"
          className={styles.svgContainer}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Detailed SVG Gradients & Filters */}
          <defs>
            {/* Terracotta Clay Gradients */}
            <radialGradient id="clayBodyGrad" cx="30%" cy="25%" r="72%">
              <stop offset="0%" stopColor="#EE9268" />
              <stop offset="22%" stopColor="#DA6D3E" />
              <stop offset="48%" stopColor="#B85128" />
              <stop offset="75%" stopColor="#832E11" />
              <stop offset="100%" stopColor="#3D1204" />
            </radialGradient>

            {/* Cooler bounce-light along the trailing edge — sells a rounded, lit form */}
            <linearGradient id="clayBounceGrad" x1="100%" y1="30%" x2="55%" y2="80%">
              <stop offset="0%" stopColor="#FFB88A" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFB88A" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="clayRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5C1C08" />
              <stop offset="22%" stopColor="#D97247" />
              <stop offset="48%" stopColor="#F5A87D" />
              <stop offset="52%" stopColor="#F5A87D" />
              <stop offset="78%" stopColor="#B34B24" />
              <stop offset="100%" stopColor="#4A1605" />
            </linearGradient>

            <radialGradient id="clayMouthGrad" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#1C0A03" />
              <stop offset="70%" stopColor="#2E0E04" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#5C1C08" stopOpacity="0" />
            </radialGradient>

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

            <radialGradient id="makhanSplatGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#FEF3C7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
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

            <filter id="softBlur6" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" />
            </filter>

            <filter id="softBlur2" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2" />
            </filter>

            {/* Fine clay grain — subtle imperfection so the terracotta reads as handmade */}
            <filter id="clayGrainFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
              <feColorMatrix
                in="noise"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0"
              />
            </filter>

            <clipPath id="potBodyClip">
              <path d="M 150 140 C 122 140 98 147 90 162 C 84 174 82 195 82 210 C 82 238 98 262 120 274 C 132 281 168 281 180 274 C 202 262 218 238 218 210 C 218 195 216 174 210 162 C 202 147 178 140 150 140 Z" />
            </clipPath>
          </defs>

          {/* Realistic Braided Rope Hangers (twin-strand twist) */}
          <path
            ref={leftRopeRef}
            d="M 112 0 Q 106 78 126 138"
            stroke="#7C5C46"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            ref={leftRopeTwistRef}
            d="M 112 0 Q 106 78 126 138"
            stroke="#C9A57C"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="5 4"
            opacity="0.85"
          />
          <path
            ref={rightRopeRef}
            d="M 188 0 Q 178 78 174 138"
            stroke="#7C5C46"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            ref={rightRopeTwistRef}
            d="M 188 0 Q 178 78 174 138"
            stroke="#C9A57C"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="5 4"
            opacity="0.85"
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

              {/* Bounce-light + fine grain layered over the intact body for a handmade, glazed feel */}
              <g clipPath="url(#potBodyClip)">
                <rect x="70" y="130" width="160" height="160" fill="url(#clayBounceGrad)" />
                <rect
                  ref={clayGrainRef}
                  x="70"
                  y="130"
                  width="160"
                  height="160"
                  filter="url(#clayGrainFilter)"
                />
                <ellipse
                  ref={claySpecularRef}
                  cx="112"
                  cy="168"
                  rx="10"
                  ry="34"
                  fill="#FFFFFF"
                  opacity="0.16"
                  filter="url(#softBlur6)"
                />
              </g>

              {/* Small extra shards for a more granular shatter */}
              <path
                ref={fragChipLeftRef}
                d="M 96 158 L 110 152 L 106 172 L 92 176 Z"
                fill="url(#clayBodyGrad)"
              />
              <path
                ref={fragChipRightRef}
                d="M 204 158 L 190 152 L 194 172 L 208 176 Z"
                fill="url(#clayBodyGrad)"
              />
              <path
                ref={fragChipTopRef}
                d="M 132 141 L 150 138 L 146 152 L 130 150 Z"
                fill="url(#clayRimGrad)"
              />

              {/* Raised rim / lip, drawn as its own piece so it can break away first */}
              <g ref={rimFragRef}>
                <path
                  d="M 98 148 C 98 142, 202 142, 202 148 C 202 154, 98 154, 98 148 Z"
                  fill="url(#clayRimGrad)"
                  stroke="#3A1003"
                  strokeWidth="0.8"
                />
                <path
                  d="M 100 145.5 C 122 141.5, 178 141.5, 200 145.5"
                  stroke="#FCD9BE"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                <ellipse cx="150" cy="148" rx="42" ry="4.2" fill="url(#clayMouthGrad)" />
              </g>

              {/* Thrown-pottery texture rings following the belly curve */}
              <path
                d="M 88 178 Q 150 198 212 178"
                stroke="#5C1C08"
                strokeWidth="1"
                opacity="0.35"
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
              <path
                d="M 96 238 Q 150 258 204 238"
                stroke="#5C1C08"
                strokeWidth="1"
                opacity="0.3"
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

              {/* Diamond rope-net cradling the pot, typical of a hung dahi-handi */}
              <g ref={ropeNetRef} opacity="0.85">
                <path
                  d="M 112 150 L 150 210 M 150 210 L 188 150 M 96 172 L 150 232 M 150 232 L 204 172 M 88 198 L 140 252 M 140 252 L 160 252 L 212 198"
                  stroke="#8B6A4C"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.75"
                />
                <circle cx="150" cy="210" r="2.6" fill="#6F5238" />
                <circle cx="150" cy="232" r="2.4" fill="#6F5238" />
                <circle cx="112" cy="150" r="2.2" fill="#6F5238" />
                <circle cx="188" cy="150" r="2.2" fill="#6F5238" />
              </g>
            </g>

            {/* Crack Overlay */}
            <g id="crack-overlay">
              <circle
                ref={shockwaveRef}
                cx="150"
                cy="168"
                r="3"
                fill="none"
                stroke="#FDE68A"
                strokeWidth="6"
                opacity="0"
              />
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
              <path
                ref={crackBranch3Ref}
                d="M 148 158 L 130 152"
                stroke="#FFFBEB"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0"
                style={{ strokeDasharray: 32, strokeDashoffset: 32 }}
              />
              <path
                ref={crackBranch4Ref}
                d="M 140 234 L 152 250"
                stroke="#FFFBEB"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0"
                style={{ strokeDasharray: 32, strokeDashoffset: 32 }}
              />

              {/* Fine debris bits thrown off at the fracture point */}
              <g ref={dustBurstRef}>
                {debrisBits.map((d, i) => (
                  <circle
                    key={i}
                    className={styles.debrisBit}
                    cx={d.cx}
                    cy={d.cy}
                    r={d.r}
                    fill={i % 2 === 0 ? "#F59E0B" : "#7C3A17"}
                    opacity="0.9"
                  />
                ))}
              </g>
            </g>

            {/* Dark opening revealed once the makhan overflow clears */}
            <ellipse
              ref={mouthHoleRef}
              cx="150"
              cy="150"
              rx="40"
              ry="6"
              fill="url(#clayMouthGrad)"
              opacity="0"
            />

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
              <circle cx="130" cy="188" r="2.2" fill="#FFFBEB" />
              <circle cx="162" cy="192" r="2.4" fill="#FFFFFF" />
            </g>

            {/* Butter catching the light as it lands, just below the pot */}
            <ellipse
              ref={makhanSplatRef}
              cx="150"
              cy="252"
              rx="46"
              ry="10"
              fill="url(#makhanSplatGrad)"
              opacity="0"
              filter="url(#softBlur2)"
            />
          </g>
        </svg>
        </div>
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