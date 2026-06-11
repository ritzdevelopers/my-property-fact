"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import logo from "../assets/logo.png";
import kimayaLogo from "../assets/Website_Logo_Kimaya.png";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = useCallback(() => {
    window.dispatchEvent(new Event("openPopup"));
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prevOpen) => !prevOpen);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <header className="bg-white shadow-sm fixed-top py-2 px-3" style={{ zIndex: 1030 }}>
      <div className="container-fluid">
        <div className="row align-items-center">
          {/* Left: Logos */}
          <div className="col-auto flex-grow-1 flex-sm-grow-0">
            <div className="d-flex align-items-center">
              <Link title="First Logo" href="/" className="me-1 me-sm-2">
                <img loading="eager"
                  src={logo}
                  alt="Logo"
                  width={100}
                  height={32}
                  className="img-fluid d-none d-sm-block"
                />
                <img loading="eager"
                  src={logo}
                  alt="Logo"
                  width={80}
                  height={26}
                  className="img-fluid d-block d-sm-none"
                />
              </Link>

              <div className="vr mx-1 mx-sm-2 d-none d-sm-block" />

              <Link title="Second Logo" href="/" className="d-none d-sm-block">
                <img loading="eager"
                  src={kimayaLogo}
                  alt="Second Logo"
                  width={110}
                  height={42}
                  className="img-fluid"
                />
              </Link>
            </div>
          </div>

          {/* Desktop Nav - Hidden on mobile */}
          <div className="col d-none d-md-flex justify-content-center">
            <nav className="d-flex gap-4 text-dark fw-medium">
              {[
                { href: "#home", label: "Home" },
                { href: "#about", label: "About" },
                { href: "#floorPlan", label: "Floor Plans" },
                { href: "#amenities", label: "Amenities" },
                { href: "#location", label: "Location" },
              ].map(({ href, label }) => (
                <Link
                  title={label}
                  key={href}
                  href={href}
                  className="nav-link position-relative text-dark text-decoration-none"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* CTA Button - Desktop Only */}
          <div className="col-auto d-none d-lg-block">
            <button
              className="btn btn-success rounded-pill px-4"
              style={{ backgroundColor: "#A8BE04", borderColor: "#A8BE04" }}
              onClick={openPopup}
            >
              Schedule a Visit
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="col-auto d-md-none">
            <button
              className="btn btn-outline-secondary border-0 p-2"
              onClick={toggleMenu}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
            >
              <i className={`bi ${isOpen ? "bi-x" : "bi-list"} fs-5`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="row d-md-none mt-3">
            <div className="col-12">
              <div className="d-flex flex-column text-center gap-3 py-3 border-top">
                {[
                  { href: "#home", label: "Home" },
                  { href: "#about", label: "About" },
                  { href: "#floorPlan", label: "Floor Plans" },
                  { href: "#amenities", label: "Amenities" },
                  { href: "#location", label: "Location" },
                ].map(({ href, label }) => (
                  <Link
                    title={label}
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className="nav-link text-dark text-decoration-none fw-medium py-2"
                  >
                    {label}
                  </Link>
                ))}
                <div className="mt-2">
                  <button
                    className="btn rounded-pill px-4 py-2"
                    style={{
                      backgroundColor: "#A8BE04",
                      color: "white",
                      border: "none"
                    }}
                    onClick={() => {
                      openPopup();
                      closeMenu();
                    }}
                  >
                    Schedule a Visit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}