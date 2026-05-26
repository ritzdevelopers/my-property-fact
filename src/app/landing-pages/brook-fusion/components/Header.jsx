"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import parentLogo from "../assets/fusion-logo.webp";
import mainLogo from "../assets/BrookLogo.png";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [mobileMenuOpen]);

  return (
    <header
      className={`w-100 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white bg-opacity-75"
      }`}
      style={{
        position: "fixed", // Sticky behavior
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        transition: "all 0.3s ease",
        backdropFilter: isScrolled ? "none" : "blur(6px)",
        zIndex: 10000,
      }}
    >
      <div className="container-fluid py-2 px-3">
        <div
          className="d-flex align-items-center justify-content-between"
          style={{ height: "4rem" }}
        >
          {/* Left Side Logos */}
          <div className="d-flex align-items-center">
            {/* Desktop Logo */}
            <div className="d-none d-md-block">
              <Image
                src={isScrolled ? mainLogo : parentLogo}
                alt="Logo"
                height={isScrolled ? 80 : 40}
                style={{ width: "auto" }}
              />
            </div>
            {/* Mobile Logo */}
            <div className="d-md-none d-flex align-items-center">
              <Image
                src={isScrolled ? mainLogo : parentLogo}
                alt="Mobile Logo"
                height={isScrolled ? 60 : 40}
                style={{ width: "auto" }}
              />
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="d-none d-md-flex gap-4">
            {[
              ["#", "Home"],
              ["#about", "About"],
              ["#highlights", "Highlights"],
              ["#amenities", "Amenities"],
              ["#location", "Location"],
              ["#floorPlan", "Floor Plans"],
              ["#contact", "Contact"],
            ].map(([href, label]) => (
              <Link
                title={label}
                key={label}
                href={href}
                className="nav-link text-dark fs-5 px-2 py-1"
                style={{ transition: "color 0.3s" }}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Hamburger Menu Button */}
          <div
            className="d-md-none"
            style={{ zIndex: 1100, position: "relative" }}
          >
            <button
              className="btn p-0 border-0 bg-transparent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              style={{ zIndex: 1101, position: "relative" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Full-Screen Mobile Menu */}
          <div
            className={`d-md-none position-fixed top-0 start-0 w-100 vh-100 bg-white ${
              mobileMenuOpen ? "show" : ""
            }`}
            style={{
              transition: "transform 0.5s ease-in-out, opacity 0.5s",
              transform: mobileMenuOpen ? "translateY(0)" : "translateY(-100%)",
              opacity: mobileMenuOpen ? 1 : 0,
              pointerEvents: mobileMenuOpen ? "auto" : "none",
              zIndex: 1050,
            }}
          >
            <div className="d-flex flex-column px-4 pt-5 pb-3 gap-3">
              {[
                ["#", "Home"],
                ["#about", "About"],
                ["#highlights", "Highlights"],
                ["#amenities", "Amenities"],
                ["#location", "Location"],
                ["#floorPlan", "Floor Plans"],
                ["#contact", "Contact"],
              ].map(([href, label]) => (
                <Link
                  title={label}
                  key={label}
                  href={href}
                  className="fs-5 text-dark text-decoration-none"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ transition: "color 0.3s" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
