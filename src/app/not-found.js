"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "./not-found.module.css";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page Not Found | My Property Fact";
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.illustration} aria-hidden>
          <svg
            width="160"
            height="120"
            viewBox="0 0 160 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* House / location theme */}
            <path
              d="M80 20L25 55v45h30V70h50v30h30V55L80 20z"
              fill="url(#notfound-green)"
              stroke="#0c2e23"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M80 45v25M65 55h30"
              stroke="#0c2e23"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="120" cy="45" r="18" fill="url(#notfound-gold)" stroke="#0c2e23" strokeWidth="2" />
            <text x="120" y="51" textAnchor="middle" fill="#0c2e23" fontSize="16" fontWeight="700" fontFamily="system-ui, sans-serif">?</text>
            <defs>
              <linearGradient id="notfound-green" x1="25" y1="20" x2="105" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0d5834" />
                <stop offset="1" stopColor="#68ac78" />
              </linearGradient>
              <linearGradient id="notfound-gold" x1="102" y1="27" x2="138" y2="63" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E6A315" />
                <stop offset="1" stopColor="#C9A24D" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.message}>
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s get you back on track.
        </p>
        <div className={styles.actions}>
          <Link title="Go to Home" href="/" className={`${styles.link} ${styles.linkPrimary}`}>
            Go to Home
          </Link>
          <Link title="Browse Properties" href="/projects" className={`${styles.link} ${styles.linkSecondary}`}>
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
