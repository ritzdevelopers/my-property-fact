"use client";

import { useReducedMotion } from "framer-motion";
import type { Transition, Variants } from "framer-motion";

export function useMotionSettings() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion: prefersReducedMotion ?? false,
    duration: prefersReducedMotion ? 0 : undefined,
    transition: (duration = 0.6, ease: Transition["ease"] = [0.22, 1, 0.36, 1]) =>
      prefersReducedMotion ? { duration: 0 } : { duration, ease },
  };
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -36 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 36 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const lineReveal: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1 },
};

export const staggerContainer = (stagger = 0.12, delayChildren = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

export const viewportOnce = {
  once: true,
  amount: 0.25,
  margin: "-80px",
} as const;
