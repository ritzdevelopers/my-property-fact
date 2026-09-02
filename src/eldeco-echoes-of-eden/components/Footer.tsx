"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import { siteConfig } from "@/eldeco-echoes-of-eden/config/site";
import { FloatingActionButtons } from "@/eldeco-echoes-of-eden/components/ui/FloatingActionButtons";
import { MobileEnquireBar } from "@/eldeco-echoes-of-eden/components/ui/MobileEnquireBar";
import { QrCodePlaceholder } from "@/eldeco-echoes-of-eden/components/ui/QrCodePlaceholder";

export function Footer() {
  const pathname = usePathname();
  const isThankYouPage = pathname?.includes("/thankyou") ?? false;
  const { footer } = siteConfig;
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(false);

  const disclaimerText = isDisclaimerExpanded
    ? footer.disclaimer.fullText
    : footer.disclaimer.shortText;

  return (
    <>
      <footer className="mt-auto">
        <section
          className="bg-[#1D3B2F] px-4 py-10 text-center text-white sm:px-6 sm:py-12 lg:py-14"
          aria-labelledby="footer-company-heading"
        >
          <div className="mx-auto max-w-6xl">
            <h2
              id="footer-company-heading"
              className="text-2xl font-bold tracking-wide sm:text-3xl"
            >
              {footer.companyName}
            </h2>
            <p className="mx-auto mt-5 max-w-6xl text-sm leading-6 text-white/90 sm:text-[0.95rem] sm:leading-7">
              {footer.description}
            </p>
          </div>
        </section>

        <section
          className="bg-[#D4E0D8] px-4 pb-8 pt-10 text-center sm:px-6 sm:pt-12 lg:pb-24 lg:pt-12"
          aria-labelledby="footer-legal-heading"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="footer-legal-heading" className="sr-only">
              Legal information
            </h2>

            <QrCodePlaceholder
              alt={footer.qrCode.alt}
              src={footer.qrCode.src || undefined}
              size={120}
            />

            <div className="mt-5 space-y-1 text-sm text-[#1D3B2F]">
              <p>
                {footer.rera.projectLabel} : {footer.rera.projectValue}
              </p>
              {/* <p>
                {footer.rera.agentLabel} : {footer.rera.agentValue}
              </p> */}
            </div>

            <div className="mx-auto mt-6 max-w-7xl text-center text-xs leading-5 text-[#1D3B2F] sm:text-[0.8125rem] sm:leading-6">
              <p>
                <span className="font-medium">
                  {footer.disclaimer.label}
                </span>{" "}
                {footer.disclaimer.shortText}
              </p>

              {isDisclaimerExpanded && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.35 }}
                  className="mt-4"
                >
                  {footer.disclaimer.fullText}
                </motion.p>
              )}

              <button
                type="button"
                className="mt-4 text-sm font-medium text-[#1D3B2F] transition-colors hover:text-[#2E7D32] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F]"
                onClick={() =>
                  setIsDisclaimerExpanded((expanded) => !expanded)
                }
                aria-expanded={isDisclaimerExpanded}
              >
                {isDisclaimerExpanded
                  ? footer.disclaimer.readLessLabel
                  : footer.disclaimer.readMoreLabel}
              </button>
            </div>

            <Link
              href={footer.privacyPolicy.href}
              id="disclaimer-privacy"
              className="mt-8 inline-block text-sm font-medium text-[#1D3B2F] underline underline-offset-4 transition-colors hover:text-[#2E7D32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F]"
            >
              {footer.privacyPolicy.label}
            </Link>
          </div>
        </section>
      </footer>

      {!isThankYouPage && (
        <>
          <MobileEnquireBar />
          <FloatingActionButtons />
        </>
      )}
    </>
  );
}
