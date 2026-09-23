"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/landing-pages/dholera");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(timer);
  }, [router]);

  const handleBackToHome = () => {
    router.push("/landing-pages/dholera");
  };

  return (
    <div
      className="thankyou-page-wrapper"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        padding: "20px",
        paddingTop: "80px",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <div
              className="thankyou-card"
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                padding: "40px 30px",
                textAlign: "center",
                position: "relative",
              }}
            >
              {/* Dholera Logo */}
              <div
                className="logo-container"
                style={{
                  marginBottom: "30px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src="/dolera/dolera-logo.png"
                  alt="Dholera Logo" title="Dholera Logo"
                  style={{
                    maxWidth: "180px",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Success Icon */}
              <div
                className="success-icon"
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 30px",
                  backgroundColor: "#28a745",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "40px",
                  color: "#ffffff",
                  boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
                }}
              >
                ✓
              </div>

              {/* Title */}
              <h1
                className="thankyou-title"
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#0e4c90",
                  marginBottom: "20px",
                  lineHeight: "1.3",
                }}
              >
                Thank You!
              </h1>

              {/* Description */}
              <p
                className="thankyou-description"
                style={{
                  fontSize: "16px",
                  color: "#6c757d",
                  marginBottom: "30px",
                  lineHeight: "1.6",
                }}
              >
                Your enquiry has been successfully submitted. Our team will get
                back to you shortly.
              </p>

              {/* Timer */}
              <div
                className="timer-container"
                style={{
                  marginBottom: "30px",
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "10px",
                  border: "2px solid #e9ecef",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6c757d",
                    marginBottom: "8px",
                  }}
                >
                  Redirecting you to home page in
                </p>
                <div
                  className="timer-countdown"
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#0e4c90",
                  }}
                >
                  {countdown} {countdown === 1 ? "second" : "seconds"}
                </div>
              </div>

              {/* Back to Home Button */}
              <Button
                onClick={handleBackToHome}
                className="back-home-btn"
                style={{
                  backgroundColor: "#0e4c90",
                  borderColor: "#0e4c90",
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "600",
                  padding: "12px 40px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(14, 76, 144, 0.2)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#0a3d73";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 6px 16px rgba(14, 76, 144, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#0e4c90";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(14, 76, 144, 0.2)";
                }}
              >
                Back to Home
              </Button>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .thankyou-card {
            padding: 30px 20px !important;
          }

          .thankyou-title {
            font-size: 28px !important;
          }

          .thankyou-description {
            font-size: 15px !important;
          }

          .logo-container img {
            max-width: 150px !important;
          }

          .success-icon {
            width: 70px !important;
            height: 70px !important;
            font-size: 35px !important;
          }

          .timer-countdown {
            font-size: 24px !important;
          }
        }

        @media (max-width: 576px) {
          .thankyou-card {
            padding: 25px 15px !important;
          }

          .thankyou-title {
            font-size: 24px !important;
          }

          .thankyou-description {
            font-size: 14px !important;
          }

          .logo-container img {
            max-width: 120px !important;
          }

          .success-icon {
            width: 60px !important;
            height: 60px !important;
            font-size: 30px !important;
          }

          .timer-countdown {
            font-size: 20px !important;
          }

          .back-home-btn {
            width: 100% !important;
            padding: 12px 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
