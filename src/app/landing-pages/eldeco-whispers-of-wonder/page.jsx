'use client';

import { useEffect, useRef, useState } from "react";
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import styles from "./page.module.css";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

export default function HomePage() {
  const [popupPhone, setPopupPhone] = useState("");
  const [expertPhone, setExpertPhone] = useState("");
  const popupLeadOtp = useLeadOtp(popupPhone);
  const expertLeadOtp = useLeadOtp(expertPhone);
  const popupPhoneRef = useRef(popupPhone);
  const expertPhoneRef = useRef(expertPhone);
  const popupLeadOtpRef = useRef(popupLeadOtp);
  const expertLeadOtpRef = useRef(expertLeadOtp);

  useEffect(() => {
    popupPhoneRef.current = popupPhone;
    expertPhoneRef.current = expertPhone;
    popupLeadOtpRef.current = popupLeadOtp;
    expertLeadOtpRef.current = expertLeadOtp;
  }, [popupPhone, expertPhone, popupLeadOtp, expertLeadOtp]);
  
  useEffect(() => {
    // Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis();

// Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
lenis.on('scroll', ScrollTrigger.update);

// Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
// This ensures Lenis's smooth scroll animation updates on each GSAP tick
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // Convert time from seconds to milliseconds
});

// Disable lag smoothing in GSAP to prevent any delay in scroll animations
gsap.ticker.lagSmoothing(0);

    const cleanupFns = [];
    const timeouts = [];

    const initialize = () => {
      const { gsap } = window;
      const ScrollTrigger = window.ScrollTrigger;

      if (!gsap || !ScrollTrigger) {
        return false;
      }

      gsap.registerPlugin(ScrollTrigger);

      const menuButton = document.getElementById("menuButton");
      const closeButton = document.getElementById("closeButton");
      const nav = document.getElementById("sideNav");
      const navLinks = document.querySelectorAll(".nav_ul li");

      if (menuButton && closeButton && nav) {
        gsap.set(nav, { x: "-100%" });
        const tl = gsap.timeline({ paused: true });
        tl.to(nav, { x: "0%", duration: 0.7, ease: "power3.out" }).from(
          navLinks,
          {
            x: -30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.4"
        );

        const openMenu = () => tl.play();
        const closeMenu = () => tl.reverse();

        menuButton.addEventListener("click", openMenu);
        closeButton.addEventListener("click", closeMenu);

        navLinks.forEach((link) => {
          link.addEventListener("click", closeMenu);
        });

        cleanupFns.push(() => {
          menuButton.removeEventListener("click", openMenu);
          closeButton.removeEventListener("click", closeMenu);
          navLinks.forEach((link) => {
            link.removeEventListener("click", closeMenu);
          });
        });
      }

      const thankYouOkayBtn = document.getElementById("thankYouOkayBtn");
      if (thankYouOkayBtn) {
        const handleReload = () => {
          window.location.reload();
        };
        thankYouOkayBtn.addEventListener("click", handleReload);
        cleanupFns.push(() => thankYouOkayBtn.removeEventListener("click", handleReload));
      }

      const queryBtns = document.querySelectorAll(".query_form");
      const popupOverlay = document.getElementById("popupFormOverlay");
      const popupBox = document.getElementById("popupFormBox");
      const popupClose = document.getElementById("popupCloseBtn");

      const openPopup = () => {
        if (!popupOverlay || !popupBox) return;
        popupOverlay.classList.remove("hidden");
        gsap.fromTo(
          popupBox,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
        );
      };

      const closePopup = () => {
        if (!popupOverlay || !popupBox) return;
        gsap.to(popupBox, {
          scale: 0.9,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            popupOverlay.classList.add("hidden");
          },
        });
      };

      queryBtns.forEach((btn) => {
        btn.addEventListener("click", openPopup);
      });

      if (popupClose) {
        popupClose.addEventListener("click", closePopup);
      }

      if (popupOverlay) {
        const overlayHandler = (e) => {
          if (e.target === popupOverlay) {
            closePopup();
          }
        };
        popupOverlay.addEventListener("click", overlayHandler);
        cleanupFns.push(() => popupOverlay.removeEventListener("click", overlayHandler));
      }

      cleanupFns.push(() => {
        queryBtns.forEach((btn) => btn.removeEventListener("click", openPopup));
        if (popupClose) {
          popupClose.removeEventListener("click", closePopup);
        }
      });

      const autoPopupTimeout = window.setTimeout(() => {
        openPopup();
      }, 7000);
      timeouts.push(autoPopupTimeout);

      const endpoint =
        "https://script.google.com/macros/s/AKfycbzDpvJNU6NohPeFmoYu8DBz2Md84-B_cfdZfnwVRTe43ffmqNfRW5eySaxvhn4Sh2Kg/exec";

      const ensureLoader = () => {
        let overlay = document.getElementById("eldecowow-form-loader");
        if (!overlay) {
          overlay = document.createElement("div");
          overlay.id = "eldecowow-form-loader";
          Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            background: "rgba(0, 0, 0, 0.45)",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999999",
          });

          const spinner = document.createElement("div");
          Object.assign(spinner.style, {
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            border: "6px solid rgba(255, 255, 255, 0.25)",
            borderTopColor: "#ffffff",
            animation: "eldecowow-spin 0.8s linear infinite",
          });

          const styleEl = document.createElement("style");
          styleEl.textContent = `
            @keyframes eldecowow-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `;

          overlay.appendChild(spinner);
          overlay.appendChild(styleEl);
          document.body.appendChild(overlay);
        }
        return overlay;
      };

      const handleFormSubmit = (formId, btnId, statusId, phoneRef, leadOtpRef) => {
        const form = document.getElementById(formId);
        const btn = document.getElementById(btnId);
        const status = document.getElementById(statusId);

        if (!form || !btn || !status) return;

        const submitHandler = async (e) => {
          e.preventDefault();

          const name = form.name.value.trim();
          const contact = phoneRef.current;
          const email = form.email.value.trim();

          if (!name || !contact || !email) {
            status.textContent = "Please fill in all required fields.";
            status.style.color = "#dc2626";
            status.style.fontSize = "14px";
            status.classList.remove("hidden");
            return;
          }

          if (!/^\d{10}$/.test(contact)) {
            status.textContent = "Please enter a valid 10-digit mobile number.";
            status.style.color = "#dc2626";
            status.style.fontSize = "14px";
            status.classList.remove("hidden");
            return;
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            status.textContent = "Please enter a valid email address.";
            status.style.color = "#dc2626";
            status.style.fontSize = "14px";
            status.classList.remove("hidden");
            return;
          }

          const verified = await verifyLandingLeadOtp(leadOtpRef.current, contact);
          if (!verified) {
            status.textContent = getLandingOtpErrorMessage(leadOtpRef.current);
            status.style.color = "#dc2626";
            status.style.fontSize = "14px";
            status.classList.remove("hidden");
            return;
          }

          btn.disabled = true;
          btn.textContent = "Sending...";
          status.classList.add("hidden");
          status.style.color = "";
          status.style.fontSize = "14px";
          const loader = ensureLoader();
          loader.style.display = "flex";
          const date = new Date();
          const message = form.message ? form.message.value.trim() : "";
          const sourceValue = form.source ? form.source.value.trim() : "";
          try {
            // Prepare Google Sheets data
            const params = new URLSearchParams();
            params.append("sheetName", "Sheet1");
            params.append("Name", name);
            params.append("Email", email);
            params.append("Phone", contact);
            params.append("Message", message || "No Message");
            params.append(
              "Time",
              date.toLocaleTimeString("en-US", {
                hour12: true,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            );
            params.append("Date", date.toLocaleDateString("en-US"));
            if (sourceValue) {
              params.append("source", sourceValue);
            }
            // Prepare Sell.do API data
            const sellDoParams = new URLSearchParams();
            sellDoParams.append("sell_do[form][lead][name]", name);
            sellDoParams.append("sell_do[form][lead][email]", email);
            sellDoParams.append("sell_do[form][lead][phone]", contact);
            sellDoParams.append("api_key", `${process.env.NEXT_PUBLIC_ELDECO_API_KEY}`);
            sellDoParams.append("sell_do[form][note][content]", message || "No Message");
            sellDoParams.append("sell_do[campaign][srd]", "$Srd");
            const sellDoUrl = `https://app.sell.do/api/leads/create?${sellDoParams.toString()}`;
            
            // Send to both APIs in parallel
            const [sheetsResponse, sellDoResponse] = await Promise.allSettled([
              fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params.toString(),
              }),
              fetch(sellDoUrl, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              })
            ]);
            
            // Check Google Sheets response (primary)
            if (sheetsResponse.status === "fulfilled") {
              const result = await sheetsResponse.value.json();

              if (result.result === "success") {
                // Log Sell.do response (secondary)
                if (sellDoResponse.status === "fulfilled") {
                  try {
                    const sellDoResult = await sellDoResponse.value.json();
                    
                    // Check if Sell.do submission was successful
                    if (sellDoResult.sell_do_lead_id && (!sellDoResult.error || sellDoResult.error.length === 0)) {
                      if (sellDoResult.selldo_lead_details) {
                        console.log("Lead details:", {
                          stage: sellDoResult.selldo_lead_details.stage,
                          lead_already_exists: sellDoResult.selldo_lead_details.lead_already_exists,
                          created_at: sellDoResult.selldo_lead_details.lead_created_at
                        });
                      }
                    } else {
                      console.warn("Sell.do API response indicates issues:", sellDoResult);
                    }
                  } catch (err) {
                    console.error("Failed to parse Sell.do API response:", err);
                    const textResponse = await sellDoResponse.value.text();
                    console.log("Sell.do API raw response:", textResponse);
                  }
                } else {
                  console.warn("Sell.do API request failed:", sellDoResponse.reason);
                }

                status.textContent = "Your query has been submitted successfully!";
                status.style.color = "#16a34a";
                status.style.fontSize = "14px";
                status.classList.remove("hidden");
                form.reset();
                btn.textContent = "Submitted!";
                if (formId === "contactForm") {
                  closePopup();
                }
                window.setTimeout(() => {
                  window.location.href = "/landing-pages/eldeco-whispers-of-wonder/thankyou";
                }, 800);
              } else {
                throw new Error(result.error?.message || "Form submission failed.");
              }
            } else {
              throw new Error("Failed to submit to Google Sheets: " + sheetsResponse.reason?.message || "Network error");
            }
          } catch (error) {
            console.error("Form submission error:", error);
            status.textContent = error.message || "Something went wrong. Please try again.";
            status.style.color = "#dc2626";
            status.style.fontSize = "14px";
            status.classList.remove("hidden");
            btn.textContent = "Try Again";
          } finally {
            const loader = ensureLoader();
            loader.style.display = "none";
            window.setTimeout(() => {
              btn.disabled = false;
              btn.textContent =
                formId === "contactForm" ? "Submit" : "Talk to Our Expert Now";
            }, 3000);
          }
        };

        form.addEventListener("submit", submitHandler);
        cleanupFns.push(() => form.removeEventListener("submit", submitHandler));
      };

      handleFormSubmit("contactForm", "contactBtn", "contactStatus", popupPhoneRef, popupLeadOtpRef);
      handleFormSubmit("expertForm", "expertBtn", "expertStatus", expertPhoneRef, expertLeadOtpRef);

      const splitTextToSpans = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const text = el.textContent;
        el.innerHTML = "";
        text.split("").forEach((letter) => {
          const span = document.createElement("span");
          span.textContent = letter;
          span.style.color = "#aaa";
          el.appendChild(span);
        });
      };

      splitTextToSpans("animate-heading");
      splitTextToSpans("animate-paragraph");

      const headingSpans = document.querySelectorAll("#animate-heading span");
      const paragraphSpans = document.querySelectorAll("#animate-paragraph span");
      const allSpans = [...headingSpans, ...paragraphSpans];

      if (allSpans.length) {
        gsap.to(allSpans, {
          color: "#101214",
          ease: "none",
          stagger: 0.02,
          scrollTrigger: {
            trigger: "#image-container",
            start: "top 50%",
            end: "bottom 60%",
            scrub: true,
            once: true,
          },
        });
      }

      const aboutImage = document.getElementById("about-image");
      if (aboutImage) {
        gsap.fromTo(
          aboutImage,
          { scale: 0.75 },
          {
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: "#image-container",
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      gsap.utils.toArray(".amenity-card").forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 40,
          scale: 0.95,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
            once: true,
          },
        });
      });

      const floorPlansSection = document.getElementById("floor-plans");
      if (floorPlansSection) {
        gsap.from(floorPlansSection, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#floor-plans",
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
        });
      }

      gsap.utils.toArray(".floor-item").forEach((card, i) => {
        gsap.from(card, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          delay: i * 0.25,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
            once: true,
          },
        });

        const img = card.querySelector("img");
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.1 },
            {
              scale: 1,
              duration: 1.2,
              delay: i * 0.25,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 90%",
                toggleActions: "play none none none",
                once: true,
              },
            }
          );
        }
      });

      gsap.utils.toArray(".gallery-img").forEach((img, index) => {
        gsap.fromTo(
          img,
          { autoAlpha: 0, scale: 0.9 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1,
            delay: index * 0.1,
            scrollTrigger: {
              trigger: img,
              start: "top 90%",
              toggleActions: "play none none none",
              once: true,
            },
          }
        );
      });

      gsap.from("#location-list li", {
        opacity: 0,
        x: -50,
        stagger: 0.1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#location-list",
          start: "top 90%",
        },
      });

      gsap.from("#location-map", {
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#location-map",
          start: "top 90%",
        },
      });

      gsap.from("#contact-img", {
        opacity: 0,
        x: -100,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#contact-img",
          start: "top 80%",
        },
      });

      gsap.from("#contact-form", {
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#contact-form",
          start: "top 85%",
        },
      });

      gsap.from("#footer-logo", {
        opacity: 0,
        x: -50,
        duration: 1,
        scrollTrigger: {
          trigger: "#footer",
          start: "top 85%",
        },
      });

      gsap.from("#footer-links", {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.2,
        scrollTrigger: {
          trigger: "#footer",
          start: "top 85%",
        },
      });

      gsap.from("#footer-contact", {
        opacity: 0,
        x: 50,
        duration: 1,
        delay: 0.4,
        scrollTrigger: {
          trigger: "#footer",
          start: "top 85%",
        },
      });

      gsap.from("#footer-cta", {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.6,
        scrollTrigger: {
          trigger: "#footer",
          start: "top 85%",
        },
      });

      return true;
    };

    let initialized = false;
    const intervalId = window.setInterval(() => {
      if (!initialized) {
        initialized = initialize();
        if (initialized) {
          window.clearInterval(intervalId);
        }
      }
    }, 60);

    return () => {
      window.clearInterval(intervalId);
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      cleanupFns.forEach((fn) => fn());
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, []);

  return (
    <div>
      <div className={styles.fixedActionBar}>
        <button className={`${styles.actionButton} quote query_form`}>
          Get Quote Today
        </button>
        <div className={`${styles.actionDivider} bg-changer`}></div>
        <button className={`${styles.actionButton} get_call query_form`}>
          Get A call
        </button>
      </div>
      <div
        id="thankYouOverlay"
        className={`${styles.overlay} hidden`}
      >
        <div
          id="thankYouBox"
          className={styles.thankYouBox}
        >
          <div className={styles.iconWrapper}>
            <svg
              className={styles.thankYouIcon}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className={styles.thankYouTitle}>Thank You!</h2>
          <p className={styles.thankYouText}>
            We&apos;ve received your enquiry. Our expert will reach out to you shortly.
          </p>
          <button
            id="thankYouOkayBtn"
            className={styles.thankYouButton}
          >
            Okay, Got it!
          </button>
        </div>
      </div>

      <div
        id="popupFormOverlay"
        className={`${styles.popupOverlay} hidden`}
      >
        <div
          id="popupFormBox"
          className={`${styles.popupBox} bg-changer`}
        >
          <button
            id="popupCloseBtn"
            className={styles.popupClose}
          >
            &times;
          </button>

          <h3 className={styles.popupTitle}>
            Book Your Dream Home
          </h3>
          <form id="contactForm" className={styles.popupForm}>
            <input type="hidden" name="source" value="google-display" />
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              className={styles.formControl}
              required
            />
            <input
              name="contact"
              type="tel"
              placeholder="Mobile Number"
              className={styles.formControl}
              required
              value={popupPhone}
              onChange={(e) => setPopupPhone(e.target.value)}
            />
            <LeadOtpFields
              phone={popupPhone}
              otp={popupLeadOtp.otp}
              onOtpChange={popupLeadOtp.setOtp}
              otpSent={popupLeadOtp.otpSent}
              isVerified={popupLeadOtp.isVerified}
              sending={popupLeadOtp.sending}
              verifying={popupLeadOtp.verifying}
              error={popupLeadOtp.error}
              resendSeconds={popupLeadOtp.resendSeconds}
              onSendOtp={popupLeadOtp.sendOtp}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className={styles.formControl}
              required
            />
            <textarea
              name="message"
              placeholder="Message (Optional)"
              className={`${styles.formControl} ${styles.formTextarea}`}
            ></textarea>
            <button
              id="contactBtn"
              type="submit"
              className={styles.popupSubmit}
            >
              Submit
            </button>
            <p id="contactStatus" className={`${styles.statusMessage} hidden`}></p>
          </form>
        </div>
      </div>

      <section className={`${styles.homeSection} d_container`} id="home">
        <main className={styles.homeMain}>
          <header className={`${styles.siteHeader} header`}>
            <button
              id="menuButton"
              className={`${styles.menuButton} menuBtn`}
            >
              Menu
            </button>

            <nav
              id="sideNav"
              className={`${styles.sideNav} bg-changer`}
            >
              <button
                id="closeButton"
                className={styles.closeButton}
              >
                X
              </button>

              <div className={`${styles.logoWrapper} logo`}>
                <img src="/images/eldecoLogo-removebg-preview.png" alt="eledeco_logo" />
              </div>

              <ul className={`nav_ul ${styles.navList}`}>
                <li>
                  <a href="#home">Home</a>
                </li>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="#amenities">Amenities</a>
                </li>
                <li>
                  <a href="#floor-plans">Floor Plans</a>
                </li>
                <li>
                  <a href="#gallery">Gallery</a>
                </li>
                <li>
                  <a href="#location">Location</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>

              <button className={`cta_nav query_form ${styles.ctaNavButton}`}>
                Enquire Now
              </button>
            </nav>
          </header>
          <div className={styles.homeBanner}>
            <img
              className={`${styles.desktopBanner} img-fluid`}
              src="/images/up-banner.jpg"
              alt="Eldeco Banner Desktop"
            />
            <img
              className={`${styles.mobileBanner} img-fluid`}
              src="/images/banner-for-mobiles-with-logos.jpg"
              alt="Eldeco Banner Mobile"
            />
          </div>
        </main>
      </section>

      <section
        id="Floor-Plans"
        className={`${styles.ideaSection} s3`}
      >
        <div className={styles.ideaContent}>
          <div className={styles.ideaVisual}>
            <img
              src="/images/s3/s3.png"
              alt="Idea Image Desktop"
              className={`${styles.ideaImageDesktop} img-fluid`}
            />
            <img
              src="/images/eldeco-mb.jpg"
              alt="Idea Image Mobile"
              className={`${styles.ideaImageMobile} img-fluid`}
            />
          </div>

          <div className={styles.ideaDetails}>
            <div className={styles.ideaHeading}>
              <h2
                style={{ fontFamily: "MonstrSemiBold" }}
                className={styles.ideaTitle}
              >
                The Idea
              </h2>
              <p
                style={{ fontFamily: "Monstr" }}
                className={styles.ideaDescription}
              >
                #The_Wow_Life brings the comfort of podium living to a future-ready growth
                corridor. Homes rise above traffic and noise, opening into landscaped
                greens, light-filled lobbies, and purposeful amenities designed for
                everyday ease.
              </p>
            </div>

            <div style={{ fontFamily: "Monstr" }} className={styles.ideaFeatureList}>
              <div className={styles.ideaFeature}>
                <img
                  src="/images/s3/s3icn1.png"
                  alt="icon"
                  className={styles.ideaFeatureIcon}
                />
                <p className={styles.ideaFeatureText}>
                  G+32 towers | Podium-level living
                </p>
              </div>

              <div className={styles.ideaFeature}>
                <img
                  src="/images/s3/s3icn2.png"
                  alt="icon"
                  className={styles.ideaFeatureIcon}
                />
                <p className={styles.ideaFeatureText}>
                  Spacious 3 BHK formats &amp; limited duplexes
                </p>
              </div>

              <div className={styles.ideaFeature}>
                <img
                  src="/images/s3/s3icn3.png"
                  alt="icon"
                  className={styles.ideaFeatureIcon}
                />
                <p className={styles.ideaFeatureText}>
                  Modern construction tech for superior finish &amp; speed
                </p>
              </div>

              <div className={styles.ideaFeature}>
                <img
                  src="/images/s3/s3icn4.png"
                  alt="icon"
                  className={styles.ideaFeatureIcon}
                />
                <p className={styles.ideaFeatureText}>
                  Clubhouse with pool, courts, fitness &amp; co-working zones
                </p>
              </div>

              <div className={styles.ideaFeature}>
                <img
                  src="/images/s3/s3icn5.png"
                  alt="icon"
                  className={styles.ideaFeatureIcon}
                />
                <p className={styles.ideaFeatureText}>
                  Secure, access-controlled community with 24×7 services
                </p>
              </div>

              <div className={styles.ideaFeature}>
                <img
                  src="/images/s3/s3icn6.png"
                  alt="icon"
                  className={styles.ideaFeatureIcon}
                />
                <p className={styles.ideaFeatureText}>
                  Excellent connectivity via Yamuna Expressway; quick access to key
                  employment &amp; lifestyle hubs
                </p>
              </div>

              <div className={styles.ideaCtaWrapper}>
                <h2 className={styles.ideaCtaHeading}>
                  {" "}
                  3 BR VRV HOMES AT YAMUNA EXPRESSWAY <br /> ₹1.35CR.* NOW ONWARDS{" "}
                </h2>
                <div className={`${styles.ideaCtaButtonWrapper} btmBtn`}>
                  <img
                    src="/images/s3/s3btn.png"
                    alt="button"
                    className={styles.ideaCtaImage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className={`${styles.aboutSection} bg-changer d_container`}
      >
        <div id="image-container" className={styles.aboutImageContainer}>
          <img
            id="about-image"
            src="/images/elAbout.jpg"
            alt="About image"
            className={styles.aboutImage}
            style={{ transformOrigin: "center center" }}
          />
        </div>

        <div className={styles.aboutContent}>
          <h2 id="animate-heading" className={styles.aboutHeading}>
            About Us
          </h2>
          <p id="animate-paragraph" className={styles.aboutParagraph}>
            With 175+ delivered projects and presence across 30 cities, Eldeco Group
            stands for trust, innovation, and timely delivery. As a listed and established
            real estate powerhouse, Eldeco brings its legacy of quality and transparency to
            Greater Noida’s most promising new address.
          </p>
          <button className={`${styles.aboutButton} query_form`}>
            Know More About Eldeco
          </button>
        </div>
      </section>

      <section id="amenities" className={`d_container ${styles.amenitiesSection}`}>
        <h2 className={styles.amenitiesHeadingRow}>
          <span className={styles.amenitiesHeadingIcon}></span>
          <span className={styles.amenitiesTitle}>AMENITIES, FEATURES &amp; BENEFITS</span>
        </h2>

        <div className={styles.amenitiesGrid}>
          <div className={`${styles.amenityCard} amenity-card`}>
          <div className="text-4xl">💎</div>
            <h3 className={styles.amenityTitle}>Luxury Amenities</h3>
            <p className={styles.amenityText}>
              Clubhouse, Half Olympic-size Swimming Pool, Spa, Party Hall, Pet Park
            </p>
          </div>

          <div className={`${styles.amenityCard} amenity-card`}>
            <div className="text-4xl">🧘‍♂️</div>
            <h3 className={styles.amenityTitle}>Wellness &amp; Leisure</h3>
            <p className={styles.amenityText}>
              Yoga Lawn, Cycling Track, Badminton &amp; Squash Courts, Lawn Tennis,
              Basketball
            </p>
          </div>

          <div className={`${styles.amenityCard} amenity-card`}>
            <div className="text-4xl">👨‍👩‍👧‍👦</div>
            <h3 className={styles.amenityTitle}>Family-Centric</h3>
            <p className={styles.amenityText}>
              Kids&apos; Play Area, Senior Citizen Deck, Dedicated Parking
            </p>
          </div>

          <div className={`${styles.amenityCard} amenity-card`}>
            <div className="text-4xl">💡</div>
            <h3 className={styles.amenityTitle}>Smart Living</h3>
            <p className={styles.amenityText}>
              Home Automation, High-Speed Elevators, 24x7 Power &amp; Water Supply
            </p>
          </div>

          <div className={`${styles.amenityCard} amenity-card`}>
            <div className="text-4xl">🌳</div>
            <h3 className={styles.amenityTitle}>Nature-Focused</h3>
            <p className={styles.amenityText}>
              3-Acre Central Green, Multiple Water Bodies, 80% Open Area, Rainwater
              Harvesting
            </p>
          </div>
        </div>

        <div className={styles.amenitiesButtonWrap}>
          <button className={`${styles.amenitiesButton} query_form`}>
            Explore All Amenities
          </button>
        </div>
      </section>

      <section id="floor-plans" className={`bg-changer d_container ${styles.floorPlansSection}`}>
        <div className={styles.floorHeader}>
          <h2 className={styles.floorHeadingRow}>
            <span className={styles.floorHeadingIcon}></span> FLOOR PLANS
          </h2>
          <p className={styles.floorIntro}>
            Choose the Layout That Complements Your Lifestyle
          </p>
        </div>

        <ul className={styles.floorList}>
          <li className={`floor-item floor_list bg-changer ${styles.floorItem}`}>
            <div className={styles.floorImageWrapper}>
              <img
                src="/images/eldecoPlan.jpg"
                alt="3 BHK with 2 Toilets Floor Plan"
                className={styles.floorImage}
              />
            </div>
            <div className={styles.floorContent}>
              <div>
                <span className={styles.floorLabel}>
                  3 BHK with 2 Toilets – 1550 sq. ft.
                </span>
                <button
                  type="button"
                  className={`${styles.floorButton} query_form`}
                >
                  Request Floor Plan &amp; Pricing Details
                </button>
              </div>
            </div>
          </li>

          <li className={`floor-item floor_list bg-changer ${styles.floorItem}`}>
            <div className={styles.floorImageWrapper}>
              <img
                src="/images/eldecoPlan.jpg"
                alt="3 BHK with 3 Toilets Floor Plan"
                className={styles.floorImage}
              />
            </div>
            <div className={styles.floorContent}>
              <div>
                <span className={styles.floorLabel}>
                  3 BHK with 3 Toilets – Spacious &amp; Elegant
                </span>
                <button
                  type="button"
                  className={`${styles.floorButton} query_form`}
                >
                  Request Floor Plan &amp; Pricing Details
                </button>
              </div>
            </div>
          </li>
        </ul>

        <p className={styles.floorDescription}>
          Enjoy three-side open units, running balconies, natural light, and well-ventilated
          layouts that offer stunning green views and a clutter-free living experience.
        </p>
      </section>

      <section id="location" className={`d_container ${styles.locationSection}`}>
        <div className={styles.locationHeader}>
          <h2 className={styles.locationHeadingRow}>
            <span className={styles.locationHeadingIcon}></span> LOCATION ADVANTAGE – SECTOR
            22D, YAMUNA EXPRESSWAY
          </h2>
        </div>

        <div className={styles.locationContent}>
          <ul id="location-list" className={styles.locationList}>
            <li>
              <span>•</span>
              <span>Near Proposed Metro Line (YEIDA)</span>
            </li>
            <li>
              <span>•</span>
              <span>Close to Jewar International Airport</span>
            </li>
            <li>
              <span>•</span>
              <span>Minutes from Proposed Noida Film City</span>
            </li>
            <li>
              <span>•</span>
              <span>Seamless Access to Pari Chowk, Sector 150, Noida-Greater Noida Expressway</span>
            </li>
            <li>
              <span>•</span>
              <span>Near top schools, hospitals, malls &amp; entertainment hubs</span>
            </li>
            <li>
              <span>•</span>
              <span>Easy access to IGI Airport via Noida Expressway</span>
            </li>

            <li className={styles.locationButtonWrapper}>
              <button className={`${styles.locationButton} query_form`}>
                Explore Neighbourhood Map
              </button>
            </li>
          </ul>

          <div id="location-map" className={styles.locationMapWrapper}>
            <img
              src="/images/eldecoLocation.jpg"
              alt="Eldeco Location Map"
              className={styles.locationMapImage}
            />
          </div>
        </div>
      </section>

      <section id="contact" className={`d_container ${styles.contactSection}`}>
        <div className={styles.contactHeader}>
          <h2 className={styles.contactHeadingRow}>
            CONTACT US – CLAIM YOUR BLISSFUL ADDRESS TODAY
          </h2>
          <p className={styles.contactIntro}>
            Limited Inventory. High Returns. Luxury That Lasts.
          </p>
        </div>

        <div className={styles.contactContent}>
          <div id="contact-img" className={styles.contactImageWrapper}>
            <img
              src="/images/eldecoContract.jpg"
              alt="Contact Visual"
              className={styles.contactImage}
            />
          </div>

          <div id="contact-form" className={styles.contactFormWrapper}>
            <h3 className={styles.contactFormTitle}>
              Schedule Your Private Consultation Now – Before Pre-Launch Offers Expire!
            </h3>
            <form id="expertForm" className={styles.contactForm}>
              <input type="hidden" name="source" value="google-display" />
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                className={styles.contactInput}
                required
              />
              <input
                name="contact"
                type="tel"
                placeholder="Mobile Number"
                className={styles.contactInput}
                required
                value={expertPhone}
                onChange={(e) => setExpertPhone(e.target.value)}
              />
              <LeadOtpFields
                phone={expertPhone}
                otp={expertLeadOtp.otp}
                onOtpChange={expertLeadOtp.setOtp}
                otpSent={expertLeadOtp.otpSent}
                isVerified={expertLeadOtp.isVerified}
                sending={expertLeadOtp.sending}
                verifying={expertLeadOtp.verifying}
                error={expertLeadOtp.error}
                resendSeconds={expertLeadOtp.resendSeconds}
                onSendOtp={expertLeadOtp.sendOtp}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className={styles.contactInput}
                required
              />
              <textarea
                name="message"
                placeholder="Message (Optional)"
                rows="3"
                className={styles.contactTextarea}
              ></textarea>
              <div className={styles.contactActions}>
                <button
                  id="expertBtn"
                  type="submit"
                  className={`${styles.contactSubmit}`}
                >
                  Talk to Our Expert Now
                </button>
                <p id="expertStatus" className={`${styles.contactStatus} hidden`}></p>
              </div>
            </form>
          </div>
        </div>
      </section>

      <footer id="footer" className={`d_container ${styles.footerSection}`}>
        <div className={styles.footerGrid}>
          <div id="footer-logo">
            <img
              src="/images/eldecoLogo-removebg-preview.png"
              alt="Logo"
              className={styles.footerLogo}
            />
            <p className={styles.footerText}>
              Discover luxury living in the heart of Yamuna Expressway. Premium units,
              world-class amenities, and unmatched connectivity await you at our exclusive
              project.
            </p>
          </div>

          <div id="footer-links">
            <h3 className={styles.footerLinksTitle}>Quick Links</h3>
            <ul className={styles.footerLinksList}>
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#gallery">Gallery</a>
              </li>
              <li>
                <a href="#location">Location</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>

          <div id="footer-cta" className={styles.footerCta}>
            <h3 className={styles.footerCtaTitle}>Looking for BHK Options?</h3>
            <button className={`${styles.footerCtaButton} query_form`}>
              Enquire BHK Availability
            </button>
          </div>
        </div>

        <div className={styles.footerBottomRow}>
          © 2026 Eldeco Group. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

