"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./IndependenceCorner.module.css";

export default function IndependenceCorner() {
  return (
    <motion.div
      className={styles.corner}
      aria-hidden="true"
      initial={{ opacity: 0, x: 40, y: 20 }}
      animate={{
        opacity: 1,
        x: 0,
        y: [0, -5, 0],
      }}
      transition={{
        opacity: {
          duration: 0.8,
          ease: "easeOut",
        },
        x: {
          duration: 0.8,
          ease: "easeOut",
        },
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      <Image
        src="/independence/independence-corner.jpg"
        alt=""
        width={600}
        height={600}
        priority
        className={styles.image}
      />
    </motion.div>
  );
}