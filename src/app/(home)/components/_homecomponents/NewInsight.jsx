// app/page.tsx
"use client";
import { useState } from "react";
import "./newinsight.css";
import LatestProject from "./LatesProject";


export default function NewInsight() {
  const [activeTool, setActiveTool] = useState("emi");
  return (
    <>
      <section className="expert-section" >
        <div className="container">
          <div className="mb-5">
            <h2 className="section-title">
              Expert Insights & Resources
            </h2>
            <p className="section-desc">
              Expert resources to help you navigate your next big move with confidence.
            </p>
          </div>
          <div className="row align-items-center gap-2 gy-5">
            <div className="col-lg-4 col-md-4 col-sm-12">
              <div className="left-card">
                
              <div
                  className={`tool-box ${activeTool === "emi" ? "active" : ""}`}
                  onClick={() => setActiveTool("emi")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="icon-box">
                    <img src="/static/emi.gif" alt="EMI Calculator" title="EMI Calculator"
                      height={40} width={30} />
                  </div>
                  <h5 className="tool-title">
                    EMI Calculator
                  </h5>
                </div>
                <div
                  className={`tool-box ${activeTool === "locate" ? "active" : ""}`}
                  onClick={() => setActiveTool("locate")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="icon-box">
                    <img src="/static/locat.gif" alt="Locate Score" title="Locate Score"
                      height={40} width={30} />
                  </div>
                  <h5 className="tool-title">
                    Locate Score
                  </h5>
                </div>
                <img
                  src={
                    activeTool === "emi"
                      ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop"
                      : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
                  }
                  alt="Tool"
                  className="home-image"
                />
                <p className="small-text">
                  Expert resources to help you navigate your next big
                  move with confidence.
                </p>
              </div>
            </div>
            <div className="col-lg-7 col-md-7 col-sm-12">
            {
            activeTool === "emi" ? (
              <>
              <div className="d-flex align-items-center flex-wrap mb-4">
                <span className="badge-custom">
                  Financial Tool
                </span>
                <span className="read-time">
                  • 5 min read
                </span>
              </div>
              <h3 className="section-title" style={{ fontWeight: 600, lineHeight: "40px" }}>
                Master Your Mortgage with the EMI Calculator
              </h3>
              <p className="section-desc" style={{ fontWeight: 400, fontSize: "18px",lineHeight:"29px" }}>
                Take the guesswork out of home financing. Our advanced EMI
                calculator provides a complete amortization schedule, helps
                you understand the impact of prepayments, and allows you
                to compare different loan offers side-by-side.
              </p>
              <button className="main-btn" onClick={() => window.location.href = "/emi-calculator"}>
                Open EMI Calculator
              </button>
              </>
              ):(
  <>
       <div className="d-flex align-items-center flex-wrap mb-4">
                <span className="badge-custom">
                  Locate Score
                </span>
                <span className="read-time">
                  • 5 min read
                </span>
              </div>
              <h3 className="section-title" style={{ fontWeight: 600, lineHeight: "40px" }}>
                Master Your Mortgage with the Locate Score
              </h3>
              <p className="section-desc" style={{ fontWeight: 400, fontSize: "18px",lineHeight:"29px" }}>
                Take the guesswork out of home financing. Our advanced EMI
                calculator provides a complete amortization schedule, helps
                you understand the impact of prepayments, and allows you
                to compare different loan offers side-by-side.
              </p>
              <button className="main-btn" onClick={() => window.location.href = "/locate-score"}>
                Open Locate Score
              </button>
              </>
)}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}