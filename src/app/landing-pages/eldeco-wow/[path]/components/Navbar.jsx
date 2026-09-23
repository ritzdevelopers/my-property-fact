"use client";
import { useState } from "react";
import MobileMenu from "./MobileMenu";

export default function Navbar({ setFormPopup }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar-custom position-fixed top-0 start-0 w-100 d-flex align-items-center justify-content-between py-3 px-3 px-lg-5">
        {/* Logo */}
        <div className="logo">
          <img
            src="/images/eldeco-log.png"
            className="w-137 h-27"
            alt="Eldeco-Wow"
            title="Eldeco-Wow"
            style={{ width: "137px", height: "27px" }}
          />
        </div>

        {/* Menu for Desktop */}
        <div className="d-none d-lg-flex">
          <ul
            className="d-flex align-items-center mb-0"
            style={{
              fontFamily: "moster_regular",
              fontWeight: "400",
              fontSize: "16px",
              listStyle: "none",
              gap: "40px",
            }}
          >
            <li>
              <a href="#home" className="text-decoration-none text-dark">
                Home
              </a>
            </li>
            <li>
              <a href="#about" className="text-decoration-none text-dark">
                About
              </a>
            </li>
            <li>
              <a href="#amenities" className="text-decoration-none text-dark">
                Amenities
              </a>
            </li>
            <li>
              <a href="#floor-plans" className="text-decoration-none text-dark">
                Floor Plans
              </a>
            </li>
            <li>
              <a href="#gallery" className="text-decoration-none text-dark">
                Gallery
              </a>
            </li>
            <li>
              <a href="#location" className="text-decoration-none text-dark">
                Location
              </a>
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <div className="d-none d-lg-block">
          <button className="cta-button" onClick={() => setFormPopup(true)}>
            Enquiry Now
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="d-lg-none">
          <button
            className="btn p-0 border-0"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
