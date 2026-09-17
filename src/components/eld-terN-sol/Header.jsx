"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Close, Menu } from "./ui/Icons";
import { ASSETS } from "./ui/assets";

const NAV_LINKS = [
  { label: "Home", href: "#home", active: false },
  { label: "Overview", href: "#overview", active: true },
  { label: "Highlights", href: "#highlights", active: false },
  { label: "Amenities", href: "#amenities", active: false },
  { label: "Price", href: "#price", active: false },
  { label: "Gallery", href: "#gallery", active: false },
  { label: "Location", href: "#location", active: false },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateHeaderBackground = () => setIsScrolled(window.scrollY > 0);

    updateHeaderBackground();
    window.addEventListener("scroll", updateHeaderBackground, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderBackground);
  }, []);

  return (
    <div
      className={`fixed top-0 right-0 left-0 z-50 text-white transition-colors duration-300 ${
        isScrolled ? "bg-black" : "bg-transparent"
      }`}
    >
      <header className="mx-auto flex w-full max-w-frame shrink-0 items-center justify-between px-4 py-5 sm:px-8 lg:px-[64px] lg:py-[16px]">
        <a href="#home" className="flex shrink-0 flex-col items-start">
          <span className="relative block h-10 w-[158px] lg:h-[64px] lg:w-[253px]">
            <Image
              src={ASSETS.logo.src}
              alt="Eldeco Terra & Sol"
              fill
              sizes="253px"
              loading="eager"
              className="object-cover"
            />
          </span>
        </a>

        <nav className="hidden xl:block">
          <ul className="flex items-center gap-[34px]">
            {NAV_LINKS.map((link) => (
              <li key={link.label} className="flex flex-col items-start justify-center">
                <a
                  href={link.href}
                  className={`text-[15px] leading-[normal] font-semibold whitespace-nowrap transition-colors hover:text-eld-gold ${
                    link.active ? "text-white" : "text-eld-on-dark"
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-[16px]">
          <a
            href="#callback"
            data-open-popup
            className="hidden items-center gap-[8px] rounded-[4px] bg-white px-[24px] py-[12px] drop-shadow-[0px_4px_8px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-90 sm:flex"
          >
            <span className="text-[13px] leading-[normal] font-bold whitespace-nowrap text-eld-ink uppercase">
              Enquire Now
            </span>
            <ArrowRight className="size-[12px] shrink-0 text-eld-ink" />
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className={`flex items-center justify-center rounded-[4px] bg-white px-[10px] py-[10px] drop-shadow-[0px_4px_8px_rgba(0,0,0,0.25)] transition-transform duration-300 xl:hidden ${
              menuOpen ? "rotate-90" : "rotate-0"
            }`}
          >
            {menuOpen ? (
              <Close className="size-[20px] text-eld-ink" />
            ) : (
              <Menu className="size-[20px] text-eld-ink" />
            )}
          </button>
        </div>
      </header>

      <div
        aria-hidden={!menuOpen}
        className={`grid  backdrop-blur transition-[grid-template-rows,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] xl:hidden ${
          menuOpen
            ? "grid-rows-[1fr] border-y border-white/15"
            : "pointer-events-none grid-rows-[0fr] border-y border-transparent"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <ul
            className={`mx-auto flex w-full max-w-frame flex-col gap-1 px-4 py-4 transition-[opacity,transform] duration-300 sm:px-8 ${
              menuOpen ? "translate-y-0 opacity-100 delay-150" : "-translate-y-3 opacity-0"
            }`}
          >
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-[15px] font-semibold text-eld-on-dark transition-colors hover:text-eld-gold"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
