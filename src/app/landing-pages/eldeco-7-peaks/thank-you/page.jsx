'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const INITIAL_COUNT = 7;

export default function Page() {
  const [countdown, setCountdown] = useState(INITIAL_COUNT);
  const intervalRef = useRef(null);
  const router = useRouter();

  const redirectToPrevious = () => {
    if (typeof window === 'undefined') return;
    const previousUrl = sessionStorage.getItem('previousUrl') || document.referrer;
    sessionStorage.removeItem('previousUrl');

    if (previousUrl && previousUrl !== window.location.href && previousUrl.includes(window.location.origin)) {
      window.location.href = previousUrl;
    } else if (previousUrl && previousUrl !== window.location.href) {
      window.location.href = previousUrl;
    } else {
      router.push('/landing-pages/eldeco-7-peaks');
    }
  };

  const handleBackClick = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    redirectToPrevious();
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          redirectToPrevious();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.iconWrap}>
          <div className={styles.iconCircle}>
            <svg
              className={styles.iconSvg}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className={styles.title}>Thank You!</h1>
        <p className={styles.message}>
          We have received your request. Our team will get back to you shortly.
        </p>

        <div className={styles.countdownSection}>
          <div className={styles.countdownBox}>
            <p className={styles.countdownLabel}>You will be redirected automatically in</p>
            <div className={styles.countdownRow}>
              <span className={styles.countdownNum} id="countdown">
                {countdown}
              </span>
              <span className={styles.countdownUnit}>seconds</span>
            </div>
          </div>
        </div>

        <div className={styles.btnWrap}>
          <button
            type="button"
            onClick={handleBackClick}
            className={styles.btn}
          >
            <svg
              className={styles.btnSvg}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}
