"use client";
import React from "react";
import { TiHome } from "react-icons/ti";
import "./NewS2.css";

function NewS2() {
  return (
    <section className="s2-section">
      {/* Left Side Div  (Squares) */}
      <div className="s2-left">
        <div className="s2-rotated-wrapper">
          {/* Square 1 */}
          <div className="s2-square s2-blue">
            <div className="s2-square-content">
              <TiHome className="s2-icon white" />
              <p className="s2-label white">Starting Size&apos;s</p>
              <p className="s2-value white">130 Sq.Yd.</p>
            </div>
          </div>

          {/* Square 2 */}
          <div className="s2-square s2-light">
            <div className="s2-square-content">
              <TiHome className="s2-icon black" />
              <p className="s2-label black">Amenities</p>
              <p className="s2-value black">Infrastructure & Connectivity</p>
            </div>
          </div>

          {/* Square 3 */}
          <div className="s2-square s2-light">
            <div className="s2-square-content">
              <TiHome className="s2-icon black" />
              <p className="s2-label black">Types</p>
              <p className="s2-value black">Plots</p>
            </div>
          </div>

          {/* Square 4 */}
          <div className="s2-square s2-light">
            <div className="s2-square-content">
              <TiHome className="s2-icon black" />
              <p className="s2-label black">Price</p>
              <p className="s2-value black">₹ 10 Lacs*</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Div */}
      <div className="s2-right">
        <div className="s2-brochure-bg">
          <button className="s2-btn">Download A Brochure</button>
        </div>

        <div className="s2-image-container">
          <img src="/dolera/s2/dol-s2-i1.png" alt="section visual" title="section visual" />
        </div>
      </div>
    </section>
  );
}

export default NewS2;
