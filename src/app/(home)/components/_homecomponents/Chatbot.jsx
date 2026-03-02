"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./Chatbot.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faTimes } from "@fortawesome/free-solid-svg-icons";

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_IMAGE_URL}properties`;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isInputDisabled, setIsInputDisabled] = useState(true);
  const [placeholder, setPlaceholder] = useState("Please select an option");

  const messagesEndRef = useRef(null);

  // Initialize session and welcome message
  useEffect(() => {
    const newSessionId =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    setSessionId(newSessionId);

    const initialBotMessage = {
      id: "initial",
      type: "bot",
      text: "Hi 👋\nWelcome to My Property Fact!\n\nReady to find the perfect property? 🏡✨\n\nPlease select your property type to get started.",
      options: ["Commercial", "Residential", "New Launch"],
    };
    setMessages([initialBotMessage]);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const addMessage = (
    text,
    sender,
    options = [],
    projectCards = [],
    followUp = null,
  ) => {
    const newMessage = {
      id: Date.now(),
      type: sender,
      text,
      options,
      projectCards,
      followUp,
    };
    setMessages((prev) => [...prev, newMessage]);
    setConversationHistory((prev) => [...prev, { sender, message: text }]);
  };

  const sendMessage = async (text = null) => {
    const userText = text || inputValue.trim();
    if (!userText) return;

    // Restart Logic: Clear history and start a new session
    if (["restart", "reset"].includes(userText.toLowerCase())) {
      const newSessionId =
        Math.random().toString(36).substring(2) + Date.now().toString(36);
      setSessionId(newSessionId);

      const initialBotMessage = {
        id: Date.now(),
        type: "bot",
        text: "Hi 👋\nWelcome to My Property Fact!\n\nReady to find the perfect property? 🏡✨\n\nPlease select your property type to get started.",
        options: ["Commercial", "Residential", "New Launch"],
      };

      setMessages([initialBotMessage]);
      setConversationHistory([]);
      setInputValue("");
      setIsInputDisabled(true);
      setPlaceholder("Please select an option");
      return;
    }

    // Add user message
    addMessage(userText, "user");
    setInputValue("");

    // Prepare for bot response
    setIsInputDisabled(false);
    setPlaceholder("Type a message...");
    setIsTyping(true);

    try {
      // Frontend Intercept for "Other" city or unknown cities
      const isCityPrompt = messages[messages.length - 1]?.text
        ?.toLowerCase()
        .includes("which city");
      const lowText = userText.toLowerCase();

      if (isCityPrompt && lowText === "other") {
        // Allow "other" to pass to backend for manual input prompt
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: userText,
        }),
      });
      const data = await response.json();
      setIsTyping(false);

      if (data.redirectUrl || data.redirectPath) {
        if (data.reply) addMessage(data.reply, "bot");
        setTimeout(() => {
          const redirectUrl = typeof data.redirectUrl === "string" ? data.redirectUrl : "";
          const redirectPath = typeof data.redirectPath === "string" ? data.redirectPath : "";
          const hasBrokenEnvPrefix =
            redirectUrl.startsWith("undefined") || redirectUrl.startsWith("null");

          if (redirectUrl && !hasBrokenEnvPrefix) {
            window.location.assign(redirectUrl);
            return;
          }
          if (redirectPath) {
            window.location.assign(redirectPath);
          }
        }, 1500);
      } else if (data.reply) {
        addMessage(
          data.reply,
          "bot",
          data.options || [],
          data.projectCards || [],
          data.followUp,
        );
      }

      if (data.options && data.options.length > 0) {
        setIsInputDisabled(true);
        setPlaceholder("Please select an option");
      } else {
        setIsInputDisabled(false);
        setPlaceholder("Type a message...");
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      addMessage("Error connecting to server.", "bot");
    }
  };

  const handleEnquirySuccess = (reply, followUp, options) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: "bot",
        text: reply,
        followUp: followUp,
        options: options,
      },
    ]);
    setIsInputDisabled(true);
    setPlaceholder("Please select an option");
  };

  return (
    <>
      {/* Launcher */}
      <button
        className={styles.launcher}
        onClick={toggleChat}
        aria-label="Open Chatbot"
      >
        {!isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2z"></path>
          </svg>
        ) : (
          <FontAwesomeIcon icon={faTimes} size="lg" />
        )}
      </button>

      {/* Container */}
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.messages}>
          {messages.map((msg, index) => (
            <React.Fragment key={msg.id}>
              {msg.text && (
                <div
                  className={`${styles.message} ${msg.type === "user" ? styles.userMessage : styles.botMessage}`}
                >
                  {msg.text.split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              )}

              {msg.projectCards && msg.projectCards.length > 0 && (
                <ProjectSlider
                  cards={msg.projectCards}
                  followUp={
                    msg.followUp || "Would you like to see more projects?"
                  }
                  options={msg.options}
                  disabled={index !== messages.length - 1}
                  onOptionClick={(opt) => {
                    const lowOpt = opt.toLowerCase();
                    if (
                      lowOpt === "yes" ||
                      lowOpt === "yes, please" ||
                      lowOpt === "sure"
                    ) {
                      // Redirection handled by backend or manual dynamic link implementation if needed
                      sendMessage(opt);
                    } else {
                      sendMessage(opt);
                    }
                  }}
                  onEnquire={(name) => {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: "form-" + Date.now(),
                        type: "form",
                        projectName: name,
                      },
                    ]);
                  }}
                />
              )}

              {msg.followUp &&
                (!msg.projectCards || msg.projectCards.length === 0) && (
                  <div className={`${styles.message} ${styles.botMessage}`}>
                    {msg.followUp}
                  </div>
                )}

              {msg.type === "form" && (
                <LeadForm
                  projectName={msg.projectName}
                  sessionId={sessionId}
                  onSuccess={handleEnquirySuccess}
                />
              )}

              {msg.options &&
                msg.options.length > 0 &&
                (!msg.projectCards || msg.projectCards.length === 0) && (
                  <div className={styles.chatOptions}>
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        className={styles.optionBtn}
                        onClick={() => sendMessage(opt)}
                        disabled={index !== messages.length - 1}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
            </React.Fragment>
          ))}
          {isTyping && (
            <div className={styles.typing}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <input
            type="text"
            className={styles.userInput}
            placeholder={placeholder}
            value={inputValue}
            disabled={isInputDisabled}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
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
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
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
  const [showArrow, setShowArrow] = useState(false);

  const checkScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setShowArrow(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [cards]);

  const scrollRight = () => {
    sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className={styles.sliderWrapper}>
      <div
        className={styles.projectSlider}
        ref={sliderRef}
        onScroll={checkScroll}
      >
        {cards.map((card, i) => (
          <div key={i} className={styles.projectCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.image}
              alt={card.name}
              loading="lazy"
              className="img-fluid"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/300x200?text=No+Image";
              }}
            />
            <div className={styles.pCardContent}>
              <h4>{card.name}</h4>
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
        className={`${styles.scrollArrow} ${showArrow ? styles.visible : ""}`}
        onClick={scrollRight}
      >
        &#8594;
      </button>

      {(followUp || (cards && cards.length > 0)) && (
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
          {followUp || "Would you like to see more projects?"}
        </div>
      )}

      {options && options.length > 0 && (
        <div
          className={styles.chatOptions}
          style={{ marginLeft: "0", marginTop: "8px", display: "flex" }}
        >
          {options.map((opt, i) => (
            <button
              key={i}
              className={styles.optionBtn}
              onClick={() => onOptionClick(opt)}
              disabled={disabled}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
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
    // Validation
    if (!name || name.length < 3) {
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
          name,
          mobile,
          email,
          project: projectName,
        }),
      });

      const res = await response.json();

      if (res.success) {
        setIsSuccess(true);
        onSuccess(res.reply, res.followUp, res.options);
      } else {
        setError(res.message || "Submission failed.");
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error(e);
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
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="tel"
        className={styles.formInput}
        placeholder="Mobile Number (10 digits) *"
        maxLength="10"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />
      <input
        type="email"
        className={styles.formInput}
        placeholder="Email ID *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting... ⏳" : "Submit"}
      </button>
      {error && <div className={styles.formError}>{error}</div>}
    </div>
  );
}
