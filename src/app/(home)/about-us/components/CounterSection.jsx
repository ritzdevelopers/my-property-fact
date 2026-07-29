"use client";

import "./style/CounterSection.css";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

import {
  MapPinned,
  Building,
  Building2,
  House,
} from "lucide-react";

const stats = [
  {
    icon: MapPinned,
    value: 29,
    title: "Cities",
    desc: "Presence Across India",
  },
  {
    icon: Building,
    value: 482,
    title: "Builders",
    desc: "Verified Partners",
  },
  {
    icon: Building2,
    value: 1341,
    title: "Projects",
    desc: "Premium Properties",
  },
  {
    icon: House,
    value: 10030,
    title: "Units",
    desc: "Happy Homebuyers",
  },
];

export default function CounterSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <section className="statsSection">
      <div className="statsContainer" ref={ref}>
        <div className="statsGrid">
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                className="statCard"
                initial={{ opacity: 0, y: 35 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                }}
                whileHover={{
                  y: -6,
                }}
              >
                <div className="iconBox">
                  <Icon size={28} strokeWidth={2} />
                </div>

                <h3>
                  {inView && (
                    <CountUp
                      end={item.value}
                      duration={2}
                      separator=","
                    />
                  )}
                  +
                </h3>

                <h4>{item.title}</h4>

                <p>{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}