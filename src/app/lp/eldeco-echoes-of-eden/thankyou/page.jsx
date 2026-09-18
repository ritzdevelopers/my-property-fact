"use client";

import { useEffect, useState } from "react";
import {
  ECHOES_EDEN_LANDING_PATH,
} from "@/components/eld-echoes-eden2/echoesEdenLeadSubmit";
import styles from "./thankyou.module.css";

export default function ThankYouPage() {
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (secondsLeft === 0) {
      window.location.href = ECHOES_EDEN_LANDING_PATH;
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const returnToLandingPage = () => {
    window.location.href = ECHOES_EDEN_LANDING_PATH;
  };

  return (
    <main className={styles.page}>
      <div className={styles.glowTop} aria-hidden="true" />
      <div className={styles.glowBottom} aria-hidden="true" />

      <section className={styles.card}>
        <div className={styles.check}>✓</div>
        <p className={styles.eyebrow}>Enquiry submitted</p>
        <h1 className={styles.title}>Thank you</h1>
        <p className={styles.copy}>
          Your enquiry for Eldeco Echoes of Eden has been received. A property
          advisor will contact you shortly with pricing and availability details.
        </p>

        <div className={styles.timer} aria-hidden="true">
          {secondsLeft}
        </div>
        <p className={styles.timerLabel} aria-live="polite">
          Redirecting to the landing page in {secondsLeft}{" "}
          {secondsLeft === 1 ? "second" : "seconds"}.
        </p>

        <button type="button" className={styles.button} onClick={returnToLandingPage}>
          Return to landing page
        </button>
      </section>
    </main>
  );
}
