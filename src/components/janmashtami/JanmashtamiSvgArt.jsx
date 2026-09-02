"use client";

import { forwardRef } from "react";

/**
 * Small stylised peacock feather.
 * Root <g> ref is used by GSAP for the "reaction scatter" tween on break.
 * The looping float/drift animation itself is pure CSS (see the
 * .feather / .featherDriftA|B|C classes in the stylesheet) for performance.
 */
export const PeacockFeather = forwardRef(function PeacockFeather(
  { className = "", style },
  ref
) {
  return (
    <div ref={ref} className={className} style={style} aria-hidden="true">
      <svg viewBox="0 0 60 100" width="100%" height="100%">
        <defs>
          <linearGradient id="featherShaft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#caa24a" />
            <stop offset="100%" stopColor="#7a5a22" />
          </linearGradient>
          <radialGradient id="featherEye" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#7fe3c9" />
            <stop offset="35%" stopColor="#1f8f8a" />
            <stop offset="70%" stopColor="#164a6b" />
            <stop offset="100%" stopColor="#0c2a3d" />
          </radialGradient>
          <linearGradient id="featherBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f8f6b" />
            <stop offset="100%" stopColor="#123d2c" />
          </linearGradient>
        </defs>

        {/* barb / plume */}
        <path
          d="M30 30 C10 38 4 55 12 74 C18 88 26 96 30 100 C34 96 42 88 48 74 C56 55 50 38 30 30 Z"
          fill="url(#featherBody)"
          opacity="0.9"
        />
        {/* eye */}
        <ellipse cx="30" cy="38" rx="17" ry="22" fill="url(#featherEye)" />
        <ellipse cx="30" cy="38" rx="9" ry="13" fill="#0a2233" opacity="0.7" />
        <ellipse cx="27" cy="32" rx="3" ry="4.5" fill="#eede9a" opacity="0.85" />
        {/* shaft */}
        <path
          d="M30 30 L30 0"
          stroke="url(#featherShaft)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M30 40 L30 96"
          stroke="url(#featherShaft)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
});

/**
 * Small creamy makhan (butter) blob used for the splash burst.
 * Root <g> ref is animated outward by GSAP once the handi cracks.
 */
export const MakhanBlob = forwardRef(function MakhanBlob(
  { className = "", style, size = 22 },
  ref
) {
  return (
    <div
      ref={ref}
      className={className}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" width="100%" height="100%">
        <defs>
          <radialGradient id="butterBlob" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fffdf6" />
            <stop offset="45%" stopColor="#fff2c9" />
            <stop offset="100%" stopColor="#e9d6a0" />
          </radialGradient>
        </defs>
        <path
          d="M20 3 C29 3 36 10 36 19 C36 29 28 37 20 37 C11 37 4 29 4 20 C4 10 11 3 20 3 Z"
          fill="url(#butterBlob)"
        />
        <ellipse cx="15" cy="12" rx="5" ry="3.2" fill="#ffffff" opacity="0.55" />
      </svg>
    </div>
  );
});
