"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.push("/landing-pages/eldeco-whispers-of-wonder");
    }
  }, [countdown, router]);

  const handleBackNow = () => {
    router.push("/landing-pages/eldeco-whispers-of-wonder");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <img
          src="/images/eldecoLogo-removebg-preview.png"
          alt="Eldeco Wow Logo"
          title="Eldeco Wow Logo"
          className={styles.logo}
        />

        <div className={styles.icon}>✓</div>

        <h1 className={styles.title}>Thank You!</h1>
        <p className={styles.message}>
          Your enquiry has been submitted successfully. Our team will reach out to you very soon.
        </p>

        <div className={styles.timerBox}>
          <div className={styles.timerLabel}>Redirecting you back to Eldeco Wow in</div>
          <div className={styles.timerValue}>{countdown} second{countdown === 1 ? "" : "s"}</div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={handleBackNow}>
            Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

