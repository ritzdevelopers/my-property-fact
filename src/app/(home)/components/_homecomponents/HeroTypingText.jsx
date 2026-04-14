"use client";

import { useEffect, useState } from "react";

export default function HeroTypingText({
  text = "",
  speedMs = 90,
  startDelayMs = 250,
}) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!text) return;
    setIsTyping(true);
    setDisplayText("");

    let timeoutId;
    let intervalId;
    let index = 0;

    timeoutId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1;
        setDisplayText(text.slice(0, index));
        if (index >= text.length) {
          window.clearInterval(intervalId);
          setIsTyping(false);
        }
      }, speedMs);
    }, startDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [text, speedMs, startDelayMs]);

  return (
    <span className="hero-typing-text" aria-label={text}>
      {displayText}
      {isTyping ? (
        <span className="hero-typing-cursor" aria-hidden>
          |
        </span>
      ) : null}
    </span>
  );
}

