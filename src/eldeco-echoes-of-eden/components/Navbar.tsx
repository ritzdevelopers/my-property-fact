"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/eldeco-echoes-of-eden/config/site";
import { PhoneIcon } from "@/eldeco-echoes-of-eden/components/ui/PhoneIcon";

export function Navbar() {
  const { brand, contact, navigation } = siteConfig;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* <div className="h-1.5 bg-[#1D3B2F]" aria-hidden="true" /> */}

      <nav
        className="border-b border-[#1D3B2F]/10 bg-[#DBE4DD]"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-16 max-w-8xl items-stretch justify-between lg:h-[5.5rem]">
          <div className="flex min-w-0 flex-1 items-center px-4 sm:px-6 lg:px-8">
            <Link
              href={brand.href}
              className="text-2xl font-extrabold tracking-wide text-[#2E7D32] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E7D32] sm:text-[2.75rem]"
            >
              {brand.name}
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-end gap-4 pr-2 lg:flex xl:gap-6 xl:pr-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-[0.7rem] font-bold tracking-[0.08em] text-[#1D3B2F] transition-colors hover:text-[#2E7D32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F] xl:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* <a
            href={contact.phoneHref}
            className="hidden shrink-0 items-center gap-2 bg-[#1D3B2F] px-4 text-white transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F] sm:flex sm:px-5 lg:px-6"
            aria-label={`Call us at ${contact.phone}`}
          >
            <PhoneIcon className="size-5 shrink-0" />
            <span className="whitespace-nowrap text-sm font-bold tracking-wide lg:text-base">
              {contact.phone}
            </span>
          </a> */}

          <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
            {/* <a
              href={contact.phoneHref}
              className="flex size-11 items-center justify-center bg-[#1D3B2F] text-white transition-colors hover:bg-[#2A5244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F] sm:hidden"
              aria-label={`Call us at ${contact.phone}`}
            >
              <PhoneIcon className="size-5" />
            </a> */}

            <button
              type="button"
              className="flex size-11 items-center justify-center text-[#1D3B2F] transition-colors hover:bg-[#1D3B2F]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F]"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span className="relative block size-5">
                <span
                  className={`absolute left-0 top-0 block h-0.5 w-5 bg-current transition-transform ${
                    isMenuOpen ? "translate-y-2 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-2 block h-0.5 w-5 bg-current transition-opacity ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-4 block h-0.5 w-5 bg-current transition-transform ${
                    isMenuOpen ? "-translate-y-2 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={`overflow-hidden border-t border-[#1D3B2F]/10 bg-[#DBE4DD] transition-[max-height] duration-300 ease-in-out lg:hidden ${
            isMenuOpen ? "max-h-[32rem]" : "max-h-0"
          }`}
          aria-hidden={!isMenuOpen}
        >
          <ul className="space-y-1 px-4 py-4 sm:px-6">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-3 text-sm font-bold tracking-[0.08em] text-[#1D3B2F] transition-colors hover:bg-[#1D3B2F]/5 hover:text-[#2E7D32] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F]"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {/* <li className="pt-2 sm:hidden">
              <a
                href={contact.phoneHref}
                className="flex items-center justify-center gap-2 rounded-md bg-[#1D3B2F] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#2A5244]"
                onClick={closeMenu}
              >
                <PhoneIcon className="size-4" />
                {contact.phone}
              </a>
            </li> */}
          </ul>
        </div>
      </nav>
    </header>
  );
}
