"use client";

import Link from "next/link";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-black text-light pt-5 pb-4">
      {/* Top Section */}
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-start gap-4">
        {/* Logo + Description */}
        <div className="w-100 w-md-50">
          <Link title="Sikka Logo" href="/" className="text-decoration-none">
            <div className="d-inline-block mb-3">
              <img
                src={logo}
                alt="Sikka Logo"
                width={120}
                height={60}
                style={{ objectFit: 'contain' }}
                className="img-fluid"
              />
            </div>
          </Link>
          <p className="text-white small lh-base pe-md-5 mb-0">
            Experience luxurious living at Sikka Kimaya Greens with world-class
            amenities and premium design in the heart of Dehradun.
          </p>
        </div>

        {/* Quick Links */}
        <div className="w-100 w-md-25 text-center text-md-end">
          <h4 className="h6 fw-semibold text-white mb-3">Quick Links</h4>
          <ul className="list-unstyled small mb-0">
            {[
              { label: "Home", href: "#home" },
              { label: "About", href: "#about" },
              { label: "Floor Plans", href: "#floorPlan" },
              { label: "Amenities", href: "#amenities" },
            ].map(({ label, href }) => (
              <li key={label} className="mb-2">
                <Link
                  title={label}
                  href={href}
                  className="text-white text-decoration-none d-inline-block"
                  style={{
                    transition: 'all 0.3s ease',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#A8BE04';
                    e.target.style.backgroundColor = 'rgba(168, 190, 4, 0.1)';
                    e.target.style.transform = 'translateX(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'white';
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'translateX(0)';
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-secondary mt-4 mb-3" style={{ opacity: 0.3 }} />

      {/* Bottom Section */}
      <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center text-center text-sm-start small text-white gap-2">
        <p className="mb-0" style={{ opacity: 0.8 }}>
          &copy; {new Date().getFullYear()} Sikka. All rights reserved. | Built
          with <span style={{ color: '#A8BE04' }}>❤️</span> in Dehradun.
        </p>
        <p className="mb-0" style={{ opacity: 0.8 }}>
          <span className="fw-medium">RERA No:</span> UKREP09170000018
        </p>
      </div>
    </footer>
  );
}