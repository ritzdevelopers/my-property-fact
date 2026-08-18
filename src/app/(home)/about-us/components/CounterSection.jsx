"use client";

import "./style/CounterSection.css";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import Image from "next/image";

const UNITS_DISPLAY = 10030;

export default function CounterSection({
  citiesCount = 29,
  buildersCount = 482,
  projectsCount = 1341,
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.25,
  });

  const stats = [
    {
      image: "/static/footer/icon1.svg",
      alt: "Cities covered",
      number: Number(citiesCount),
      label: "Cities",
    },
    {
      image: "/static/footer/icon2.svg",
      alt: "Verified builders",
      number: Number(buildersCount),
      label: "Builders",
    },
    {
      image: "/static/footer/icon3.svg",
      alt: "Listed projects",
      number: Number(projectsCount),
      label: "Projects",
    },
    {
      image: "/static/footer/icon4.svg",
      alt: "Property units",
      number: UNITS_DISPLAY,
      label: "Units",
    },
  ];

  return (
    <section className="statsSection" aria-labelledby="why-trust-mpf-heading">
      <div className="statsContainer" ref={ref}>
        <div className="statsGrid">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              className="statCard"
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.94,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              viewport={{ once: true }}
              transition={{
                duration: 0.55,
                delay: index * 0.12,
              }}
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
            >
              <div className="iconBox">
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={28}
                  height={28}
                />
              </div>

              <p className="statNumber">
                {inView ? (
                  <CountUp
                    start={0}
                    end={item.number}
                    duration={2.5}
                    separator=","
                    useEasing
                  />
                ) : (
                  "0"
                )}
                +
              </p>

              <h3>{item.label}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}