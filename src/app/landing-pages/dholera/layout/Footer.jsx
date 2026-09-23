"use client";
import React from "react";

function Footer() {
  return (
    <footer
      style={{
        width: "100vw",
        minHeight: "368px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Row 1 */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
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
      </div>

      {/* Row 2  */}
      <div
        style={{
          width: "75%",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontWeight: 400,
            fontSize: "16px",
            color: "black",
          }}
        >
          Disclaimer :The information provided on this website is intended
          exclusively for informational purposes and should not be construed as
          an offer of services. The pricing information presented on this
          website is subject to alteration without advance notification, and the
          assurance of property availability cannot be guaranteed. The images
          showcased on this website are for representational purposes only and
          may not accurately reflect the actual properties.
        </p>
      </div>

      <div
        style={{
          width: "100%",
        }}
      >
        {" "}
        {/* Row 3  */}
        <div
          style={{
            width: "100%",
            height: "62px",
            backgroundColor: "rgba(231, 73, 52, 1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "35px",
            paddingTop: "15px",
          }}
        >
          <p
            style={{
              fontWeight: 400,
              fontSize: "16px",
              color: "#ffffff",
            }}
          >
            Disclaimer Privacy Policy
          </p>
        </div>
        {/* Row 4  */}
        <div
          style={{
            width: "100%",
            height: "62px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "35px",
          }}
        >
          <p
            style={{
              fontWeight: 400,
              fontSize: "16px",
              color: "rgba(0, 0, 0, 0.4)",
            }}
          >
            © 2026. dholera township | All right reserved. Digital Media Planned
            By Ritz Media World
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
