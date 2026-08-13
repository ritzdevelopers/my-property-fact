"use client";

import { motion } from "framer-motion";
import styles from "./IndependenceDayTab.module.css";

export default function IndependenceDayTab() {
  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <motion.div
        className={styles.tab}
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <span className={styles.shine} />

        <span className={styles.flag}>🇮🇳</span>

        <span className={styles.text}>
          स्वतंत्रता दिवस
        </span>

        <span className={styles.jaiHind}>जय हिंद</span>
      </motion.div>
    </motion.div>
  );
}