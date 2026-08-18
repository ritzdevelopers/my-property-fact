"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import "./style/TimelineSection.css";
import { timelineData } from "./timelineData";

export default function TimelineSection() {
  const [active, setActive] = useState(0);

  const timer = useRef(null);

  const nextSlide = () => {
    setActive((prev) => (prev + 1) % timelineData.length);
  };

  useEffect(() => {
    startAutoPlay();

    return () => clearInterval(timer.current);
  }, []);

  const startAutoPlay = () => {
    clearInterval(timer.current);

    timer.current = setInterval(() => {
      nextSlide();
    }, 5000);
  };

  const handleClick = (index) => {
    setActive(index);
    startAutoPlay();
  };

  const item = timelineData[active];

  return (
    <section className="timeline-section">

      <div className="section-container">

        <div className="timeline-content">

          {/* LEFT IMAGE */}

          <AnimatePresence mode="wait">

            <motion.div
              key={item.year}
              className="timeline-image"
              initial={{
                opacity: 0,
                x: -70,
                rotate: -15,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                x: 0,
                rotate: -10,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                x: 70,
                scale: 0.9,
              }}
              transition={{
                duration: 0.6,
              }}
            >
              <img src={item.image} alt={item.year} />
            </motion.div>

          </AnimatePresence>

          {/* RIGHT CONTENT */}

          <div className="timeline-right">

            <AnimatePresence mode="wait">

              <motion.div
                key={item.year + "text"}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -30,
                }}
                transition={{
                  duration: 0.45,
                }}
              >
                <p className="timeline-year heading">
                  {item.year}
                </p>

                <p className="timeline-description paragraph">
                  {item.description}
                </p>
              </motion.div>

            </AnimatePresence>

          </div>

        </div>

        {/* TIMELINE */}

        <div className="timeline-years">

          {timelineData.map((year, index) => (

            <div
              className="timeline-item"
              key={year.year}
              onClick={() => handleClick(index)}
            >

              <div
                className={`timeline-pill ${active === index ? "active" : ""
                  }`}
              >
                <motion.div
                  className="timeline-fill"
                  animate={{
                    width: active === index ? "calc(100% + 4px)" : 0,
                  }}
                  transition={{
                    duration: 0.45,
                  }}
                />
              </div>

              <span
                className={`timeline-label ${active === index ? "active" : ""
                  }`}
              >
                {year.year}
              </span>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
}