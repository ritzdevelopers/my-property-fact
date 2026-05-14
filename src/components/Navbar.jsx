"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Overview", href: "#overview" },
  { label: "Highlights", href: "#highlights" },
  { label: "Amenities", href: "#amenities" },
  { label: "Price", href: "#price" },
  { label: "Gallery", href: "#gallery" },
  { label: "Location", href: "#location" },
  { label: "Virtual Tour", href: "#virtual-tour" },
  { label: "Contact", href: "#contact" },
];

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateNavbar = () => {
      setIsScrolled(window.scrollY > 0);
    };

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });

    return () => window.removeEventListener("scroll", updateNavbar);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleNavClick = (
    event,
    href,
  ) => {
    event.preventDefault();
    setIsMenuOpen(false);

    const target = document.querySelector(href);

    if (target) {
      const headerOffset = 68;
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
      window.history.pushState(null, "", href);
    }
  };

  return (
    <header
      className={`fixed left-0 top-0 z-50 h-[68px] w-full transition-all duration-300 py-[20px] ${
        isScrolled ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1250px] items-center justify-between px-4 md:px-12 xl:px-0">
        <a href="#home" aria-label="Eldeco home" className="shrink-0">
          <img
            src={
              isScrolled
                ? "/eld-imgs/logo/eldecologo.png"
                : "/eld-imgs/logo/eldeco-logo-white.png"
            }
            alt="Eldeco"
            className="h-auto w-[196px]"
          />
        </a>

        <nav className="ml-[35px] flex-1 items-center justify-between max-lg:hidden lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(event) => handleNavClick(event, link.href)}
              className={`${styles.paragraph} whitespace-nowrap cursor-pointer xl:text-[15px] text-[12px] font-[600] leading-none transition-colors ${
                isScrolled
                  ? "text-[#222] hover:text-[#c29b37]"
                  : "text-white hover:text-[#e0ca72]"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
          className={`flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded lg:hidden ${
            isScrolled ? "text-[#222]" : "text-white"
          }`}
        >
          <span className="h-[2px] w-6 bg-current" />
          <span className="h-[2px] w-6 bg-current" />
          <span className="h-[2px] w-6 bg-current" />
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-black/55 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsMenuOpen(false)}
            />

            <motion.aside
              className="fixed right-0 top-0 z-[70] flex h-screen w-[82%]  max-w-[360px] flex-col bg-white px-6 py-6 shadow-[-14px_0_35px_rgba(0,0,0,0.18)] lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-between">
                <a
                  href="#home"
                  aria-label="Eldeco home"
                  onClick={(event) => handleNavClick(event, "#home")}
                  className="shrink-0"
                >
                  <img
                    src="/eld-imgs/logo/eldecologo.png"
                    alt="Eldeco"
                    className="h-auto w-[160px]"
                  />
                </a>

                <button
                  type="button"
                  aria-label="Close navigation menu"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center text-[30px] leading-none text-[#222]"
                >
                  ×
                </button>
              </div>

              <nav className="mt-8 flex flex-col gap-5">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(event) => handleNavClick(event, link.href)}
                    className={`${styles.paragraph} border-b border-black/10 pb-3 text-[17px] font-[600] text-[#222] transition-colors hover:text-[#c29b37]`}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
