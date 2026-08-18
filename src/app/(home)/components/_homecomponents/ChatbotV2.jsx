"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./Chatbot.module.css";
import {
  createInitialChatSession,
  generateClientChatResponse,
} from "./chatbotLogicClient";
import { useSiteData } from "@/app/_global_components/contexts/SiteDataContext";

import { usePathname, useRouter } from "next/navigation";
import { buildEnquirySubmitData } from "@/lib/leadTracker";
import {
  validateLeadEmail,
  validateLeadName,
  validateLeadPhone,
} from "@/lib/leadValidation";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import { ensureLeadOtpVerified } from "@/lib/leadOtpClient";

/** Animated GIF must load via `<img>` (next/image optimizes away animation). File: `public/static/icon/chatbot.gif`. */
const CHATBOT_LAUNCHER_LOGO = "/static/icon/chatbot.gif";
const CHATBOT_HEADER_LOGO = "/logo.webp";
const PROMPT_DISMISS_KEY = "mpf-chat-prompt-dismissed";

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
  const {
    projectList = [],
    projectTypes = [],
    setQueryFilters,
    setQuickProjectFilter,
    resetProjectFilters,
  } = useSiteData();
  const router = useRouter();
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
  /** hidden → typing (three dots) → expanded (full invite dialog) */
  const [promptPhase, setPromptPhase] = useState("hidden");
  const messagesContainerRef = useRef(null);
  const latestProjectMessageRef = useRef(null);
  const messagesEndRef = useRef(null);
  const openTypingTimeoutRef = useRef(null);
  const promptTypingTimeoutRef = useRef(null);

  useEffect(() => {
    setSessionId(createSessionId());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPromptPhase("hidden");
      return undefined;
    }

    if (
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(PROMPT_DISMISS_KEY)
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => setPromptPhase("typing"), 2500);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (promptPhase !== "typing") return undefined;

    promptTypingTimeoutRef.current = window.setTimeout(() => {
      setPromptPhase("expanded");
      promptTypingTimeoutRef.current = null;
    }, 1200);

    return () => {
      if (promptTypingTimeoutRef.current) {
        window.clearTimeout(promptTypingTimeoutRef.current);
        promptTypingTimeoutRef.current = null;
      }
    };
  }, [promptPhase]);

  useEffect(() => {
    return () => {
      if (openTypingTimeoutRef.current) {
        clearTimeout(openTypingTimeoutRef.current);
      }
      if (promptTypingTimeoutRef.current) {
        clearTimeout(promptTypingTimeoutRef.current);
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

  const dismissPrompt = () => {
    if (promptTypingTimeoutRef.current) {
      clearTimeout(promptTypingTimeoutRef.current);
      promptTypingTimeoutRef.current = null;
    }
    setPromptPhase("hidden");
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(PROMPT_DISMISS_KEY, "1");
    }
  };

  const openChat = () => {
    if (promptTypingTimeoutRef.current) {
      clearTimeout(promptTypingTimeoutRef.current);
      promptTypingTimeoutRef.current = null;
    }
    setPromptPhase("hidden");
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(PROMPT_DISMISS_KEY, "1");
    }
    setIsOpen(true);
    if (!hasShownOpenTyping && messages.length === 0) {
      startOpenTypingIntro();
    }
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

    openChat();
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

      if (payload.navigateToProjects && payload.queryFilters) {
        setTimeout(() => {
          setQuickProjectFilter("All");
          resetProjectFilters();
          setQueryFilters(payload.queryFilters);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("mpf-querry", JSON.stringify(payload.queryFilters));
          }
          router.push("/projects");
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
      <div className={`${styles.launcherWrap} mpf-chatbot-launcher`}>
        {!isOpen && promptPhase === "typing" ? (
          <div
            className={styles.promptTypingBubble}
            aria-live="polite"
            aria-label="Assistant is typing"
          >
            <span className={styles.promptDot} />
            <span className={styles.promptDot} />
            <span className={styles.promptDot} />
          </div>
        ) : null}

        {!isOpen && promptPhase === "expanded" ? (
          <div
            className={styles.promptBubble}
            role="dialog"
            aria-label="Chat invitation"
            aria-live="polite"
          >
            <button
              type="button"
              className={styles.promptClose}
              onClick={dismissPrompt}
              aria-label="Dismiss chat invitation"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className={styles.promptHeader}>
              <div className={styles.promptAvatar}>
                <img
                  src={CHATBOT_HEADER_LOGO}
                  alt=""
                  width={32}
                  height={30}
                  aria-hidden
                />
              </div>
              <div className={styles.promptHeaderText}>
                <div className={styles.promptTitle}>MPF Assistant</div>
                <div className={styles.promptSubtitle}>Typically replies instantly</div>
              </div>
            </div>

            <p className={styles.promptMessage}>Hi there! 👋 Need help with anything?</p>

            <button
              type="button"
              className={styles.promptReplyBtn}
              onClick={openChat}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Reply
            </button>
          </div>
        ) : null}

        <button
          type="button"
          className={styles.launcher}
          onClick={toggleChat}
          aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
          title={isOpen ? "Close chat" : "Open My Property Fact chat"}
        >
          {!isOpen ? (
            // eslint-disable-next-line @next/next/no-img-element -- GIF animation requires native img
            <img
              src={CHATBOT_LAUNCHER_LOGO}
              alt="Open My Property Fact chat — assistant"
              title="Open My Property Fact chat"
              width={78}
              height={78}
              className={styles.launcherGif}
              draggable={false}
            />
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

          {!isOpen && promptPhase !== "hidden" ? (
            <span className={styles.launcherBadge} aria-hidden="true">
              1
            </span>
          ) : null}
        </button>
      </div>

      <div className={`${styles.container} ${!isOpen ? styles.hidden : ""}`}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.avatar}>
              <img
                src={CHATBOT_HEADER_LOGO}
                alt="My Property Fact logo — chat widget header"
                title="My Property Fact logo — chat widget header"
                width={80}
                height={74}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div>
              <div>MyPropertyFact</div>
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
                      onEnquire={(projectName, projectLink) => {
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: `form-${Date.now()}`,
                            type: "form",
                            projectName,
                            projectLink,
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
                    projectLink={message.projectLink}
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
        {cards.map((card, index) => {
          const cardPreviewAlt = card.name ? `${card.name} — project preview` : "Project preview";
          return (
          <div key={`${card.id || card.name}-${index}`} className={styles.projectCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.image}
              alt={cardPreviewAlt}
              title={cardPreviewAlt}
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
                onClick={() => onEnquire(card.name, card.link)}
              >
                Enquire
              </button>
            </div>
          </div>
        );
        })}
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

function LeadForm({ projectName, projectLink, sessionId, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    enquiryFrom: "",
    projectLink: "",
    pageName: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const pathName = usePathname();
  const leadOtp = useLeadOtp(formData.phone);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const nameError = validateLeadName(formData.name);
    if (nameError) {
      setError(nameError);
      return;
    }
    const phoneError = validateLeadPhone(formData.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    const emailError = validateLeadEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const otpVerified = await ensureLeadOtpVerified({
        phone: formData.phone,
        otp: leadOtp.otp,
        isVerified: leadOtp.isVerified,
        sendOtp: leadOtp.sendOtp,
        verifyOtp: leadOtp.verifyOtp,
      });
      if (!otpVerified) {
        if (!leadOtp.otpSent) {
          setError("OTP sent to your mobile. Enter it and submit again.");
        } else {
          setError(leadOtp.error || "Please verify OTP before submitting.");
        }
        setIsSubmitting(false);
        return;
      }

      const submitData = await buildEnquirySubmitData(
        {
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/\D/g, "").slice(-10),
          message: formData.message || `Enquiry for ${projectName || "project"} from Chatbot`,
          enquiryFrom: "Chatbot",
          projectLink: projectLink || (() => {
            const base = (process.env.NEXT_PUBLIC_UI_URL || "").replace(/\/$/, "");
            return projectName
              ? `${base}/${String(projectName).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`
              : `${base}/`;
          })(),
          pageName: projectName ? `Chatbot - ${projectName}` : "Chatbot - Home",
          sessionId,
        },
        projectName
          ? {
              property: {
                property_name: projectName,
                project: projectName,
              },
            }
          : undefined,
      );

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}enquiry/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const payload = await response.json();
      const isOk = payload.success || payload.isSuccess === 1;
      if (isOk) {
        setIsSuccess(true);
        leadOtp.reset();
        onSuccess(
          payload.reply || "Enquiry sent successfully. Our consultant will contact you within 24 hours.",
          payload.followUp,
          payload.options
        );
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
          Enquiry sent successfully. Our consultant will contact you within 24 hours.
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
        value={formData.name}
        onChange={(e) => handleChange("name", e.target.value)}
      />
      <input
        type="tel"
        className={styles.formInput}
        placeholder="Mobile Number (10 digits) *"
        maxLength="10"
        value={formData.phone}
        onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
      />
      <LeadOtpFields
        phone={formData.phone}
        otp={leadOtp.otp}
        onOtpChange={leadOtp.setOtp}
        otpSent={leadOtp.otpSent}
        isVerified={leadOtp.isVerified}
        sending={leadOtp.sending}
        verifying={leadOtp.verifying}
        error={leadOtp.error}
        resendSeconds={leadOtp.resendSeconds}
        onSendOtp={leadOtp.sendOtp}
        className={styles.chatOtpFields}
      />
      <input
        type="email"
        className={styles.formInput}
        placeholder="Email ID *"
        value={formData.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />
      <textarea
        className={styles.formInput}
        placeholder="Message (optional)"
        rows={3}
        value={formData.message}
        onChange={(e) => handleChange("message", e.target.value)}
        style={{ resize: "vertical", minHeight: "60px" }}
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
