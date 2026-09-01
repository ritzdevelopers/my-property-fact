"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqConfig } from "@/eldeco-echoes-of-eden/config/faq";
import { renderAnswerText } from "@/eldeco-echoes-of-eden/lib/formatAnswer";
import {
  fadeUp,
  staggerContainer,
  useMotionSettings,
  viewportOnce,
} from "@/eldeco-echoes-of-eden/lib/motion";

export function Faq() {
  const [openId, setOpenId] = useState<string | null>(faqConfig.items[0]?.id ?? null);
  const { prefersReducedMotion, transition } = useMotionSettings();

  const toggleItem = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section
      id={faqConfig.id}
      className="scroll-mt-20 bg-[#DBE4DD] px-4 py-14 sm:px-6 sm:py-16 lg:py-18"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={transition(0.7)}
        >
          <h2
            id="faq-heading"
            className="font-serif text-4xl italic text-[#1D3B2F] sm:text-5xl"
          >
            {faqConfig.title}
          </h2>

          <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-16 bg-[#1D3B2F]/35 sm:w-24" />
            <span className="size-2 rotate-45 bg-[#1D3B2F]" />
            <span className="h-px w-16 bg-[#1D3B2F]/35 sm:w-24" />
          </div>
        </motion.div>

        <motion.div
          className="mt-8 space-y-2 sm:mt-10"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.08, 0.1)}
        >
          {faqConfig.items.map((item) => {
            const isOpen = openId === item.id;

            return (
              <motion.div
                key={item.id}
                variants={fadeUp}
                transition={transition(0.55)}
                className="overflow-hidden rounded-sm"
              >
                <button
                  type="button"
                  id={`faq-trigger-${item.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => toggleItem(item.id)}
                  className="flex w-full items-center justify-between gap-4 bg-[#1D3B2F] px-5 py-3 text-left text-white transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F] sm:px-6 sm:py-4"
                >
                  <span className="text-sm font-medium leading-6 sm:text-base sm:leading-7">
                    {item.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={transition(0.3)}
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    <ChevronDown className="size-5" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${item.id}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${item.id}`}
                      initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={transition(0.35)}
                      className="overflow-hidden bg-[#F5F7F5]"
                    >
                      <div className="px-5 py-5 text-sm leading-7 text-[#333333] sm:px-6 sm:py-6 sm:text-[0.95rem] sm:leading-8">
                        {renderAnswerText(item.answer)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
