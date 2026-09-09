"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

const NAV_LINKS = [
  ["OVERVIEW", "#overview"],
  ["HIGHLIGHT", "#highlights"],
  ["PRICE", "#price"],
  ["FLOOR PLAN", "#floor-plan"],
  ["AMENITIES", "#amenities"],
  ["LOCATION", "#location"],
  ["GALLERY", "#gallery"],
] as const;

type SiteHeaderProps = {
  logoSrc: string;
};

export default function SiteHeader({ logoSrc }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const toggleMenu = () => setOpen((prev) => !prev);

  return (
    <>
      {/* Always pinned to top — fixed avoids sticky breaking when menu is open */}
      <header className="fixed inset-x-0 top-0 z-[100] w-full bg-white">
        <div className="relative z-[20] h-[85px] w-full bg-white max-[800px]:h-[72px]">
          <div className="mx-auto flex h-[85px] w-[min(1256px,calc(100%-48px))] items-center justify-between gap-12 max-[1100px]:gap-5 max-[800px]:h-[72px] max-[800px]:w-[calc(100%-28px)]">
            <a
              href="#top"
              onClick={closeMenu}
              className="block h-[50px] w-[238px] shrink-0 max-[800px]:h-8 max-[800px]:w-[150px]"
            >
              <Image
                src={logoSrc}
                alt="Eldeco 7 Peaks Residences"
                width={238}
                height={50}
                priority
                unoptimized
                className="h-full w-full object-cover"
              />
            </a>

            <nav
              className="hidden items-center gap-7 whitespace-nowrap text-base font-medium text-[#0a0a0a] min-[1024px]:flex max-[1100px]:gap-[15px] max-[1100px]:text-[13px] [&_a]:text-inherit [&_a]:transition-[color,font-weight,letter-spacing] [&_a]:duration-100 [&_a]:ease-[cubic-bezier(0.22,1,0.36,1)] hover:[&_a]:font-bold hover:[&_a]:tracking-[0.02em] hover:[&_a]:text-[#147B58]"
              aria-label="Primary navigation"
            >
              {NAV_LINKS.map(([label, href]) => (
                <a key={label} href={href}>
                  {label}
                </a>
              ))}
            </nav>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={toggleMenu}
              className="relative z-[30] inline-flex h-11 w-11 border-0 items-center justify-center bg-transparent p-0 text-[#0a0a0a] min-[1024px]:hidden"
            >
              <span className="relative flex h-7 w-7 items-center justify-center">
                <HiOutlineMenu
                  size={28}
                  className={`absolute transition-all duration-300 ease-out ${
                    open
                      ? "scale-75 rotate-90 opacity-0"
                      : "scale-100 rotate-0 opacity-100"
                  }`}
                />
                <HiOutlineX
                  size={28}
                  className={`absolute transition-all duration-300 ease-out ${
                    open
                      ? "scale-100 rotate-0 opacity-100"
                      : "scale-75 -rotate-90 opacity-0"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          id="mobile-nav"
          aria-hidden={!open}
          className={`absolute inset-x-0 top-full z-[40] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out min-[1024px]:hidden ${
            open
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-4 opacity-0 shadow-none"
          }`}
        >
          <nav
            aria-label="Mobile navigation"
            className="mx-auto flex max-h-[calc(100vh-85px)] w-[min(1256px,calc(100%-48px))] flex-col gap-1 overflow-y-auto py-4 max-[800px]:max-h-[calc(100vh-72px)] max-[800px]:w-[calc(100%-28px)]"
          >
            {NAV_LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={closeMenu}
                className="relative z-[40] border-b border-black/5 px-1 py-3 text-sm font-medium tracking-wide text-[#0a0a0a] hover:text-[#147B58]"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Spacer so page content isn't hidden under fixed header */}
      <div className="h-[85px] w-full max-[800px]:h-[72px]" aria-hidden="true" />

      {open ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={closeMenu}
          className="fixed inset-x-0 bottom-0 top-[85px] z-[90] bg-black/20 max-[800px]:top-[72px] min-[1024px]:hidden"
        />
      ) : null}
    </>
  );
}
