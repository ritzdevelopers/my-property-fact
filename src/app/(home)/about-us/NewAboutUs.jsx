"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { IoIosArrowBack, IoIosArrowForward, IoIosArrowDown } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import "./aboutus.css";
import WhyMyPropertyFact from "./WhyMyPropertyFact";

const slidesData = [
  {
    id: 1,
    title: "Neighbourhood LOCATE Scores",
    text: "Compare local economy, ongoing projects, connectivity, amenities, market trends, and supply–demand in one simple score. Drill into commute times, schools, hospitals, and transaction benchmarks to shortlist micro-markets that fit your lifestyle, budget, and future plans.",
  },
  {
    id: 2,
    title: "Verified, Carpet-First Listings",
    text: "See transparent carpet area, effective ₹/carpet sq ft, floor plans, approvals, OC/RERA status, and society health indicators. We prioritise usable space and paperwork quality, so you don’t overpay for super built-up numbers or vague promises.",
  },
  {
    id: 3,
    title: "Deal Math Calculators",
    text: "Estimate all-in cost in minutes, base price, parking, PLC, GST, stamp, registration, maintenance, and fit-outs. Stress-test EMIs, rental yields, vacancy, and exit costs to compare ready versus under-construction on true cash flows, not wishful thinking.",
  },
  {
    id: 4,
    title: "Due-Diligence Checklists",
    text: "Download step-by-step checklists for title, encumbrance, sanctioned plans, RERA, OC/CC, mutation, and society NOCs. Use our templates to organise documents, ask the right questions, and avoid expensive surprises at registration or during resale.",
  },
  {
    id: 5,
    title: "Expert Insights & Guides",
    text: "Plain-English explainers on GST, stamp duty, area metrics, and market cycles, plus city primers and hotspot maps. Learn to buy on milestones, price time saved and choose assets that rent quickly and exit cleanly.",
  },
  {
    id: 6,
    title: "SECURE TRANSACTION PLATFORM",
    text: "Enjoy a safe and secure platform for all your real estate transactions. Our verified listings and secure payment processing ensure your peace of mind throughout the process.",
  },
];

export default function NewAboutUs({ platformStats }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isReadMore, setIsReadMore] = useState(false);
  // Responsive cards per view
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      if (width <= 480) {
        setCardsPerView(1);
      } else if (width <= 768) {
        setCardsPerView(1);
      } else if (width <= 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate total slides based on responsive cardsPerView
  const totalSlides = Math.max(
    1,
    Math.ceil((slidesData.length - cardsPerView) / cardsPerView) + 1
  );

  // Reset slide when cardsPerView changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [cardsPerView]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.7, delay: 0.2, ease: "easeOut" } 
    },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.7, delay: 0.2, ease: "easeOut" } 
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.6, delay: 0.3, ease: "easeOut" } 
    },
  };

  const bounceIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.4,
      },
    },
  };

  const cardStagger = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  const textFadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, delay: 0.3 } 
    },
  };

  const headingFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, delay: 0.2 } 
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = totalSlides - 1;
      return prev < maxSlide ? prev + 1 : prev;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      return prev > 0 ? prev - 1 : prev;
    });
  };

  const isPrevDisabled = currentSlide === 0;
  const isNextDisabled = currentSlide >= totalSlides - 1;

  const aboutUsIntroImageAlt =
    "About Us — My Property Fact introduction section image on About Us page";
  const whatWeOfferBackgroundAlt =
    "What We Offer — background graphic on My Property Fact About Us page";

  return (
    <>
      <div className="container-fluid">
        <motion.div
          className="new-about-us-container"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.div
            className="new-about-us-container-image-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={slideInLeft}
          >
            <Image
              src="/static/about-us/about_us_section.jpg"
              alt={aboutUsIntroImageAlt}
              title={aboutUsIntroImageAlt}
              width={441}
              height={515}
              className="img-fluid"
            />
          </motion.div>
          <motion.div
            className="new-about-us-container-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={slideInRight}
          >
            <motion.h2 
              className="new-about-us-container-content-heading plus-jakarta-sans-semi-bold"
              variants={headingFadeIn}
            >
              About Us
            </motion.h2>
            <motion.p 
              className="new-about-us-container-content-text1"
              variants={textFadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              My Property Fact (MPF) is India&apos;s buyer-first real estate guide. We combine data, on-ground verification, and plain-English advice to help you choose confidently. Our proprietary LOCATE Score compares neighbourhoods on economy, projects, connectivity, amenities, trends, and supply and demand. We demystify carpet area, approvals, GST, and stamp duty, and normalise every home to an effective price per usable square foot. Whether you&apos;re shortlisting your first 2-BHK or benchmarking a portfolio, MPF gives you clear checklists, calculators, and market insights you can actually use. No hype, just transparent comparisons, verified documentation support, and milestone-based decision frameworks so you can buy once, buy right, and sleep well.
            </motion.p>
            <AnimatePresence>
              {isReadMore && (
                <motion.p
                  className="new-about-us-container-content-text2"
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                    opacity: { duration: 0.3 },
                    height: { duration: 0.4 },
                  }}
                >
                  Welcome to My Property Fact, your go-to platform for discovering
                  the perfect real estate opportunities. Whether you&apos;re an investor hunting for the next big project, a business owner scouting commercial space, or a family looking for a new home to call your own. We bring together all types of properties, from high-end apartments and cozy farmhouses to strategic commercial plots and premium office spaces for both buying and renting.
                </motion.p>
              )}
            </AnimatePresence>
            <motion.div variants={bounceIn}>
              <motion.button
                type="button"
                className="new-about-us-container-content-button"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsReadMore(!isReadMore)}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isReadMore ? "less" : "more"}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    style={{ display: "inline-block" }}
                  >
                    {isReadMore ? "Read Less" : "Read More"}
                  </motion.span>
                </AnimatePresence>
                <motion.span
                  animate={{
                    rotate: isReadMore ? 180 : 0,
                    y: isReadMore ? 0 : [0, 4, 0],
                  }}
                  transition={{
                    rotate: { duration: 0.3 },
                    y: {
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <IoIosArrowDown />
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      <div className="container-fluid d-flex justify-content-center">
        <motion.div
          className="new-about-us-section-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2 
            className="new-about-us-section-2-heading text-center plus-jakarta-sans-semi-bold"
            variants={headingFadeIn}
          >
            Our Story & Vision
          </motion.h2>
          <motion.p 
            className="new-about-us-section-2-text"
            variants={textFadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            MPF began as a simple spreadsheet that an investor built to compare homes fairly. Friends shared it, then clients, then developers seeking honest feedback. We still work the same way: evidence over slogans, carpet-area math over brochure gloss. Our vision is to be India&apos;s most trusted property decision system, where every buyer, in every city and budget, can see risks, costs, and upside clearly, and use data, not noise, to make life&apos;s biggest purchase with confidence.
          </motion.p>
          <motion.div
            className="new-about-us-section-2-image-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={scaleIn}
          >
            {/* <motion.div 
              className="new-about-us-section-2-orange-banner"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            ></motion.div> */}
            {/* <Image
              src="/static/about-us/vision_and_mission.png"
              alt="Vision and Mission"
              width={1040}
              height={492}
              className="img-fluid"
            /> */}
            <video 
              src="/static/about-us/mission.mp4" 
              autoPlay 
              muted 
              loop 
              playsInline
              className="new-about-us-video"
            />
          </motion.div>
        </motion.div>
      </div>
      <div
        className="container-fluid position-relative"
        style={{ background: "#EDF4FF", padding: "64px 0" }}
      >
        <motion.div 
          className="new-about-us-section-3-container-bg-image"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <Image
            src="/static/about-us/about-us-background.png"
            alt={whatWeOfferBackgroundAlt}
            title={whatWeOfferBackgroundAlt}
            width={561}
            height={373}
            className="img-fluid"
          />
        </motion.div>
        <motion.div
          className="new-about-us-section-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2 
            className="new-about-us-section-3-heading text-center plus-jakarta-sans-semi-bold"
            variants={headingFadeIn}
          >
            What We Offer
          </motion.h2>

          <div className="new-about-us-section-3-cards-wrapper">
            <motion.div
              className="new-about-us-section-3-cards"
              animate={{
                x: windowWidth > 768 
                  ? `-${currentSlide * (100 / cardsPerView)}%`
                  : `-${currentSlide * 100}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              {slidesData.map((slide, index) => (
                <motion.div
                  key={slide.id}
                  className="new-about-us-section-3-card text-center"
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={cardStagger}
                  whileHover={{ y: windowWidth > 768 ? -4 : 0, transition: { duration: 0.2 } }}
                  style={{
                    flex: `0 0 calc((100% - ${(cardsPerView - 1) * 24}px) / ${cardsPerView})`,
                    minWidth: `calc((100% - ${(cardsPerView - 1) * 24}px) / ${cardsPerView})`,
                    maxWidth: `calc((100% - ${(cardsPerView - 1) * 24}px) / ${cardsPerView})`,
                  }}
                >
                  <h3 className="new-about-us-section-3-card-title plus-jakarta-sans-semi-bold">
                    {slide.title}
                  </h3>
                  <p className="new-about-us-section-3-card-text">
                    {slide.text}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div 
            className="new-about-us-section-3-navigation"
            variants={bounceIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.button
              className="new-about-us-section-3-nav-button"
              onClick={prevSlide}
              disabled={isPrevDisabled}
              aria-label="Previous slide"
              whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <IoIosArrowBack />
            </motion.button>
            <motion.button
              className="new-about-us-section-3-nav-button"
              onClick={nextSlide}
              disabled={isNextDisabled}
              aria-label="Next slide"
              whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <IoIosArrowForward />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      <WhyMyPropertyFact platformStats={platformStats} />
    </>
  );
}