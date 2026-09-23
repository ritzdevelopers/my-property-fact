"use client";
import React, { useState } from "react";
import { useModal } from "../layout";

function Navbar() {
  const { openModal } = useModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#amenities", label: "Amenities" },
    { href: "#floor-plans", label: "Floor Plans" },
    { href: "#gallery", label: "Gallery" },
    { href: "#location", label: "Location" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <>
      <nav
        className="dolera-navbar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          zIndex: 9999,
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: "1440px",
            margin: "0 auto",
            padding: "16px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <div
            className="logo"
            style={{
              width: "129px",
              height: "37px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <img
              src="/dolera/dolera-logo.png"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              alt="Dolera Logo" title="Dolera Logo"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <ul
              style={{
                display: "flex",
                listStyle: "none",
                margin: 0,
                padding: 0,
                gap: "58px",
                alignItems: "center",
              }}
            >
              {navLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    style={{
                      fontWeight: "400",
                      fontSize: "16px",
                      color: "#000000",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      cursor: "pointer",
                      position: "relative",
                      padding: "8px 0",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "rgba(14, 76, 144, 1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "#000000";
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop CTA Button */}
          <button
            className="enquire-btn"
            onClick={() => openModal("Enquiry")}
            style={{
              width: "164px",
              height: "52px",
              color: "white",
              borderRadius: "4px",
              backgroundColor: "rgba(14, 76, 144, 1)",
              fontWeight: 600,
              fontSize: "16px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgb(271, 73, 52)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(14, 76, 144, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "rgba(14, 76, 144, 1)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            Enquire Now
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: "none",
              backgroundColor: "rgba(14, 76, 144, 1)",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              flexShrink: 0,
              color: "white",
              borderRadius: "4px",
            }}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className="mobile-menu"
          style={{
            display: isMobileMenuOpen ? "block" : "none",
            position: "fixed",
            top: "69px",
            left: 0,
            width: "100%",
            backgroundColor: "#ffffff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 9998,
            padding: "24px 32px",
            maxHeight: "calc(100vh - 69px)",
            overflowY: "auto",
            animation: isMobileMenuOpen ? "slideDown 0.3s ease" : "none",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {navLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    fontWeight: "400",
                    fontSize: "16px",
                    color: "#000000",
                    textDecoration: "none",
                    display: "block",
                    padding: "12px 0",
                    borderBottom: "1px solid #f0f0f0",
                    transition: "color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "rgba(14, 76, 144, 1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#000000";
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li style={{ marginTop: "8px" }}>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openModal("Enquiry");
                }}
                style={{
                  width: "100%",
                  height: "52px",
                  color: "white",
                  borderRadius: "4px",
                  backgroundColor: "rgba(14, 76, 144, 1)",
                  fontWeight: 600,
                  fontSize: "16px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(14, 76, 144, 0.9)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "rgba(14, 76, 144, 1)";
                }}
              >
                Enquire Now
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Responsive Styles */}
      <style jsx>{`
        /* Desktop Navigation - Show only after lg screen (> 1024px) */
        @media (min-width: 1025px) {
          .desktop-nav {
            display: block !important;
          }
          .mobile-menu-toggle {
            display: none !important;
          }
          .enquire-btn {
            display: block !important;
          }
        }

        /* Mobile Navigation - Show on lg and below (≤ 1024px) */
        @media (max-width: 1024px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: block !important;
          }
          .enquire-btn {
            display: none !important;
          }
          .dolera-navbar > div {
            padding: 16px 20px !important;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Adjust desktop nav gap on smaller large screens */
        @media (min-width: 1025px) and (max-width: 1200px) {
          .desktop-nav ul {
            gap: 24px !important;
          }
        }

        @media (min-width: 1025px) and (max-width: 1400px) {
          .desktop-nav ul {
            gap: 32px !important;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;
