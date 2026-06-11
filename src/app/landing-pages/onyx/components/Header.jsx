"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import logo from "../assets/logo.webp";

export default function Header() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [hideHeader, setHideHeader] = useState(false);

  // Scroll hide/show logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > lastScroll) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }
      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? "hidden" : "";
  }, [showMobileMenu]);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#overview", label: "OverView" },
    { href: "#offerings", label: "Project Offerings" },
    { href: "#amenities", label: "Amenities" },
    { href: "#floors", label: "Floor Plans" },
    { href: "#gallery", label: "Gallery" },
    { href: "#highlight", label: "Highlight" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <>
      {/* HEADER */}
      <header
        id="header"
        className={`position-fixed top-0 start-0 w-100 bg-white shadow z-3 px-4 px-md-5 py-3 ${
          hideHeader ? "translate-up" : ""
        }`}
        style={{ transition: "transform 0.3s ease-in-out", zIndex: 1050 }}
        data-aos="fade-down"
      >
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Logo */}
          <div className="fw-bold">
            <img
              src={logo}
              alt="logo"
              width={150}
              height={40}
              style={{ height: "auto" }}
            />
          </div>

          {/* Desktop Nav */}
          <nav className="d-none d-md-flex gap-3 fw-medium text-dark">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link px-2 link-dark"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Hamburger Icon */}
          <div
            className="d-md-none"
            style={{ cursor: "pointer" }}
            onClick={() => setShowMobileMenu(true)}
          >
            <svg
              className="text-dark"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`position-fixed top-0 start-0 w-100 h-100 bg-white d-md-none ${
          showMobileMenu ? "translate-x-0" : "translate-x-minus"
        }`}
        style={{
          transition: "transform 0.3s ease-in-out",
          zIndex: 1040,
        }}
        onClick={(e) => {
          if (!e.target.closest("nav")) setShowMobileMenu(false);
        }}
      >
        <div className="d-flex flex-column h-100 p-4 position-relative">
          <button
            className="position-absolute top-0 end-0 m-3 fs-2 text-secondary border-0 bg-transparent"
            onClick={() => setShowMobileMenu(false)}
          >
            &times;
          </button>
          <nav className="mt-5 pt-4 d-flex flex-column gap-4 fs-5 fw-medium text-dark">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link"
                onClick={() => setShowMobileMenu(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Header hide style */}
      <style jsx>{`
        .translate-up {
          transform: translateY(-100%);
        }
        .translate-x-minus {
          transform: translateX(-100%);
        }
        .translate-x-0 {
          transform: translateX(0);
        }
      `}</style>
    </>
  );
}
