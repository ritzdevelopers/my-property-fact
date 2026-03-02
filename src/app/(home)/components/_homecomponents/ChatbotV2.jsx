"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./Chatbot.module.css";
import {
  createInitialChatSession,
  generateClientChatResponse,
} from "./chatbotLogicClient";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";

function createSessionId() {
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function getInitialBotMessage() {
  return {
    id: `bot-initial-${Date.now()}`,
    type: "bot",
    text: "Hi 👋\nWelcome to My Property Fact!\n\nTell me your requirement and I will help you shortlist relevant projects.",
    options: ["Commercial", "Residential", "New Launch"],
    projectCards: [],
    followUp: null,
  };
}

function isRestartIntent(input = "") {
  const normalized = input.trim().toLowerCase();
  return ["restart", "reset", "start over", "start again"].includes(normalized);
}

function toMessage(payload, type = "bot") {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    text: payload?.reply || "",
    options: Array.isArray(payload?.options) ? payload.options : [],
    projectCards: Array.isArray(payload?.projectCards) ? payload.projectCards : [],
    followUp: payload?.followUp || null,
  };
}

export default function ChatbotV2() {
  const { projectList = [], projectTypes = [] } = useSiteData();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [chatSession, setChatSession] = useState(createInitialChatSession());
  const [isInputDisabled, setIsInputDisabled] = useState(true);
  const [placeholder, setPlaceholder] = useState("Please select an option");
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [hasShownOpenTyping, setHasShownOpenTyping] = useState(false);
  const messagesContainerRef = useRef(null);
  const latestProjectMessageRef = useRef(null);
  const messagesEndRef = useRef(null);
  const openTypingTimeoutRef = useRef(null);

  useEffect(() => {
    setSessionId(createSessionId());
  }, []);

  useEffect(() => {
    return () => {
      if (openTypingTimeoutRef.current) {
        clearTimeout(openTypingTimeoutRef.current);
      }
    };
  }, []);

  const updateScrollHint = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollHint(distanceFromBottom > 24);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return undefined;

    const handleScroll = () => updateScrollHint();
    container.addEventListener("scroll", handleScroll);
    updateScrollHint();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const latestMessage = messages[messages.length - 1];

    if (latestMessage?.projectCards?.length) {
      // Keep first visible area at project cards, not CTA/follow-up buttons.
      latestProjectMessageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setTimeout(updateScrollHint, 250);
      return;
    }

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      setTimeout(updateScrollHint, 250);
    }
  }, [messages, isTyping]);

  const startOpenTypingIntro = () => {
    if (openTypingTimeoutRef.current) {
      clearTimeout(openTypingTimeoutRef.current);
    }

    setMessages([]);
    setIsTyping(true);
    setIsInputDisabled(true);
    setPlaceholder("Please wait...");

    openTypingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setMessages([getInitialBotMessage()]);
      setIsInputDisabled(true);
      setPlaceholder("Please select an option");
      setHasShownOpenTyping(true);
      openTypingTimeoutRef.current = null;
    }, 900);
  };

  const toggleChat = () => {
    if (isOpen) {
      if (openTypingTimeoutRef.current) {
        clearTimeout(openTypingTimeoutRef.current);
        openTypingTimeoutRef.current = null;
      }
      setIsTyping(false);
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    if (!hasShownOpenTyping && messages.length === 0) {
      startOpenTypingIntro();
    }
  };

  const resetChatOnClient = () => {
    setSessionId(createSessionId());
    setChatSession(createInitialChatSession());
    setMessages([getInitialBotMessage()]);
    setInputValue("");
    setIsTyping(false);
    setIsInputDisabled(true);
    setPlaceholder("Please select an option");
    setHasShownOpenTyping(true);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: "user",
        text,
        options: [],
        projectCards: [],
        followUp: null,
      },
    ]);
  };

  const addBotMessageFromPayload = (payload) => {
    const nextBotMessage = toMessage(payload, "bot");
    setMessages((prev) => [...prev, nextBotMessage]);

    if (nextBotMessage.options.length > 0) {
      setIsInputDisabled(true);
      setPlaceholder("Please select an option");
    } else {
      setIsInputDisabled(false);
      setPlaceholder("Type a message...");
    }
  };

  const sendMessage = async (text = null) => {
    const messageText = (text ?? inputValue).trim();
    if (!messageText || !sessionId) return;

    if (isRestartIntent(messageText)) {
      resetChatOnClient();
      return;
    }

    addUserMessage(messageText);
    setInputValue("");
    setIsTyping(true);
    const typingStartTs = Date.now();
    const minTypingDurationMs = 900;

    try {
      const { nextSession, payload } = await generateClientChatResponse(
        messageText,
        chatSession,
        projectList,
        projectTypes,
      );
      const elapsedTypingMs = Date.now() - typingStartTs;
      if (elapsedTypingMs < minTypingDurationMs) {
        await new Promise((resolve) =>
          setTimeout(resolve, minTypingDurationMs - elapsedTypingMs)
        );
      }
      setChatSession(nextSession);
      setIsTyping(false);

      if (payload.reply || payload.projectCards || payload.options || payload.followUp) {
        addBotMessageFromPayload(payload);
      }

      if (payload.redirectUrl || payload.redirectPath) {
        setTimeout(() => {
          const redirectUrl =
            typeof payload.redirectUrl === "string" ? payload.redirectUrl : "";
          const redirectPath =
            typeof payload.redirectPath === "string" ? payload.redirectPath : "";
          const invalidUrl =
            redirectUrl.startsWith("undefined") || redirectUrl.startsWith("null");

          if (redirectUrl && !invalidUrl) {
            window.location.assign(redirectUrl);
            return;
          }
          if (redirectPath) {
            window.location.assign(redirectPath);
          }
        }, 900);
      }
    } catch (error) {
      console.error("Chatbot sendMessage failed:", error);
      const elapsedTypingMs = Date.now() - typingStartTs;
      if (elapsedTypingMs < minTypingDurationMs) {
        await new Promise((resolve) =>
          setTimeout(resolve, minTypingDurationMs - elapsedTypingMs)
        );
      }
      setIsTyping(false);
      addBotMessageFromPayload({
        reply: "Could not connect right now. Please try again.",
        options: ["Restart"],
      });
    }
  };

  const handleEnquirySuccess = (reply, followUp, options) => {
    const safeOptions = Array.isArray(options) ? options : ["Restart"];

    // Keep only the green success card from form; avoid duplicate white "Thank you" text.
    // Still show follow-up/options when available.
    if (followUp || safeOptions.length > 0) {
      addBotMessageFromPayload({
        reply: "",
        followUp,
        options: safeOptions,
      });
    }
  };

  const handleOptionClick = (optionText) => {
    if (isRestartIntent(optionText)) {
      resetChatOnClient();
      return;
    }
    sendMessage(optionText);
  };

  const scrollMessagesToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <>
      <button
        className={styles.launcher}
        onClick={toggleChat}
        aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
      >
        {!isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 32 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 6h8" />
            <path d="M16 3.5v2.5" />
            <rect x="6" y="7.5" width="20" height="15" rx="5.5" />
            <circle cx="12.2" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="19.8" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
            <path d="M12 18.5h8" />
            <path d="M10 22.5v3.2l3.2-3.2" />
            <path d="M20.5 22.5v2.2h-9v-2.2" />
            <path d="M13 24.7v-1.6h6v1.6" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </button>

      <div className={`${styles.container} ${!isOpen ? styles.hidden : ""}`}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              <Image
                src="/logo.webp"
                alt="MPF Logo"
                width={40}
                height={37}
                sizes="40px"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div>
              <h3>MyPropertyFact</h3>
              <span className={styles.status}>Online</span>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={toggleChat}
            aria-label="Close Chatbot"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.messages} ref={messagesContainerRef}>
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;

            return (
              <React.Fragment key={message.id}>
                {message.text ? (
                  <div
                    className={`${styles.message} ${message.type === "user" ? styles.userMessage : styles.botMessage}`}
                  >
                    {message.text.split("\n").map((line, lineIndex) => (
                      <div key={`${message.id}-${lineIndex}`}>{line}</div>
                    ))}
                  </div>
                ) : null}

                {message.projectCards?.length ? (
                  <div
                    ref={
                      isLastMessage && message.projectCards?.length
                        ? latestProjectMessageRef
                        : null
                    }
                  >
                    <ProjectSlider
                      cards={message.projectCards}
                      followUp={message.followUp}
                      options={message.options}
                      disabled={!isLastMessage}
                      onOptionClick={handleOptionClick}
                      onEnquire={(projectName) => {
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: `form-${Date.now()}`,
                            type: "form",
                            projectName,
                          },
                        ]);
                      }}
                    />
                  </div>
                ) : null}

                {message.followUp && !message.projectCards?.length ? (
                  <div className={`${styles.message} ${styles.botMessage}`}>
                    {message.followUp}
                  </div>
                ) : null}

                {message.type === "form" ? (
                  <LeadForm
                    projectName={message.projectName}
                    sessionId={sessionId}
                    onSuccess={handleEnquirySuccess}
                  />
                ) : null}

                {message.options?.length && !message.projectCards?.length ? (
                  <div className={styles.chatOptions}>
                    {message.options.map((opt) => (
                      <button
                        key={`${message.id}-${opt}`}
                        className={styles.optionBtn}
                        onClick={() => handleOptionClick(opt)}
                        disabled={!isLastMessage}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : null}
              </React.Fragment>
            );
          })}

          {isTyping ? (
            <div className={styles.typing}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        {showScrollHint ? (
          <button
            className={styles.chatScrollHint}
            onClick={scrollMessagesToBottom}
            aria-label="Scroll down"
            title="Scroll down"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        ) : null}

        <div className={styles.inputArea}>
          <input
            type="text"
            className={styles.userInput}
            placeholder={placeholder}
            value={inputValue}
            disabled={isInputDisabled}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage();
            }}
          />
          <button
            className={styles.sendBtn}
            onClick={() => sendMessage()}
            disabled={isInputDisabled || !inputValue.trim()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

function ProjectSlider({
  cards,
  onEnquire,
  followUp,
  options,
  onOptionClick,
  disabled,
}) {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [cards]);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className={styles.sliderWrapper}>
      <div
        className={styles.projectSlider}
        ref={sliderRef}
        onScroll={checkScroll}
      >
        {cards.map((card, index) => (
          <div key={`${card.id || card.name}-${index}`} className={styles.projectCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.image}
              alt={card.name}
              loading="lazy"
              className="img-fluid"
              onError={(event) => {
                event.currentTarget.src =
                  "https://via.placeholder.com/300x200?text=No+Image";
              }}
            />
            <div className={styles.pCardContent}>
              <div className={styles.pTitleRow}>
                <h4 className={styles.pTitle}>{card.name}</h4>
                {card.propertyType ? (
                  <span className={styles.pTypeTag}>{card.propertyType}</span>
                ) : null}
              </div>
              <p className={styles.pLoc}>📍 {card.location}</p>
              <div className={styles.pDetails}>
                <span className={styles.pPrice}>{card.price}</span>
                <span className={styles.pStatus}>{card.status}</span>
              </div>
              <p className={styles.pBuilder}>By {card.builder}</p>
              <button
                className={styles.pCta}
                onClick={() => window.open(card.link, "_blank")}
              >
                View Details
              </button>
              <button
                className={styles.pEnquire}
                onClick={() => onEnquire(card.name)}
              >
                Enquire
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className={`${styles.scrollArrow} ${styles.scrollArrowLeft} ${canScrollLeft ? styles.visible : ""}`}
        onClick={scrollLeft}
        aria-label="Scroll left"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <button
        className={`${styles.scrollArrow} ${styles.scrollArrowRight} ${canScrollRight ? styles.visible : ""}`}
        onClick={scrollRight}
        aria-label="Scroll right"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {followUp || cards?.length ? (
        <div
          className={`${styles.message} ${styles.botMessage}`}
          style={{
            marginTop: "16px",
            marginLeft: "0",
            alignSelf: "flex-start",
            display: "inline-block",
            width: "auto",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            backgroundColor: "#ffffff",
            padding: "10px 14px",
            borderRadius: "12px",
            fontSize: "0.95rem",
          }}
        >
          {followUp || "Choose what you want next."}
        </div>
      ) : null}

      {options?.length ? (
        <div
          className={styles.chatOptions}
          style={{ marginLeft: "0", marginTop: "8px", display: "flex" }}
        >
          {options.map((opt) => (
            <button
              key={`slider-option-${opt}`}
              className={styles.optionBtn}
              onClick={() => onOptionClick(opt)}
              disabled={disabled}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LeadForm({ projectName, sessionId, onSuccess }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!name || name.trim().length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          name: name.trim(),
          mobile,
          email: email.trim(),
          project: projectName,
        }),
      });

      const payload = await response.json();
      if (payload.success) {
        setIsSuccess(true);
        onSuccess(payload.reply, payload.followUp, payload.options);
      } else {
        setError(payload.message || "Submission failed.");
        setIsSubmitting(false);
      }
    } catch (submitError) {
      console.error("Lead form submit failed:", submitError);
      setError("Connection error.");
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.customForm}>
        <div className={styles.formSuccess}>
          Thank you for sharing your details. Our consultant will contact you
          within 24 hours.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.customForm}>
      <div className={styles.formTitle}>
        Please share your details for
        <br />
        <strong>{projectName}</strong>
      </div>
      <input
        type="text"
        className={styles.formInput}
        placeholder="Full Name *"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        type="tel"
        className={styles.formInput}
        placeholder="Mobile Number (10 digits) *"
        maxLength="10"
        value={mobile}
        onChange={(event) => setMobile(event.target.value)}
      />
      <input
        type="email"
        className={styles.formInput}
        placeholder="Email ID *"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting... ⏳" : "Submit"}
      </button>
      {error ? <div className={styles.formError}>{error}</div> : null}
    </div>
  );
}
