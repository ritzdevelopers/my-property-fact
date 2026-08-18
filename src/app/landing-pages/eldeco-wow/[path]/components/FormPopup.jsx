"use client";
import { useState } from "react";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

export default function FormPopup({ setFormPopup, frmName }) {
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [phone, setPhone] = useState("");
  const leadOtp = useLeadOtp(phone);

  const closePopup = () => setShowPopup(false);

  const leadController = async (e) => {
    e.preventDefault();
    const form = e.target;

    const verified = await verifyLandingLeadOtp(leadOtp, phone);
    if (!verified) {
      setPopupMessage(getLandingOtpErrorMessage(leadOtp));
      return;
    }

    setIsLoading(true);

    const date = new Date();
    const params = new URLSearchParams();
    params.append("Name", form.Name.value);
    params.append("Email", form.Email.value);
    params.append("Phone", phone);
    params.append("Message", form.Message?.value || "No Message");
    params.append("Date", date.toLocaleDateString("en-US"));
    params.append(
      "Time",
      date.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
    params.append("sheetName", frmName);

    const scriptURL =
      "https://script.google.com/macros/s/AKfycbw5Ma1R2K1RqW0fnXBXwC-NujxZF4IpLe11e0v3Icm4ZMqrBMDIBQc1VThnjGXze2kc/exec";

    try {
      const res = await fetch(scriptURL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      await res.json();
      form.reset();
      setPopupMessage("✅ Form submitted successfully!");
    } catch (err) {
      console.error(err);
      setPopupMessage("❌ Error submitting form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 vh-100 d-flex justify-content-center align-items-center"
        style={{
          backgroundColor: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(5px)",
          zIndex: 9999,
        }}
      >
        <div
          className="bg-white p-5 rounded-4 shadow-lg animate__animated animate__fadeInUp"
          style={{
            width: "100%",
            maxWidth: "600px",
            minHeight: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            position: "relative",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setFormPopup(false)}
            className="btn-close position-absolute"
            style={{
              top: "15px",
              right: "15px",
              filter: "invert(40%)",
            }}
          ></button>

          {/* Title */}
          <h4
            className="fw-bold text-center mb-1"
            style={{
              fontSize: "35px",
            }}
          >
            Get in Touch
          </h4>
          <p className="text-muted text-center" style={{ fontSize: "14px" }}>
            Fill in the form below and we’ll get back to you soon.
          </p>

          {/* Popup Message */}
          {popupMessage ? (
            <div className="text-center mt-4">
              <p className="fw-semibold">{popupMessage}</p>
              <button
                className="btn btn-dark mt-3 px-4 rounded-pill"
                onClick={() => setPopupMessage("")}
              >
                Close
              </button>
            </div>
          ) : (
            <form
              onSubmit={leadController}
              className="d-flex flex-column gap-3 mt-3"
            >
              <input
                required
                name="Name"
                type="text"
                className="form-control rounded-pill px-3 py-2"
                placeholder="Full Name*"
              />
              <input
                required
                name="Email"
                type="email"
                className="form-control rounded-pill px-3 py-2"
                placeholder="Email Address*"
              />
              <input
                required
                name="Phone"
                type="text"
                className="form-control rounded-pill px-3 py-2"
                placeholder="Phone Number*"
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <LeadOtpFields
                phone={phone}
                otp={leadOtp.otp}
                onOtpChange={leadOtp.setOtp}
                otpSent={leadOtp.otpSent}
                isVerified={leadOtp.isVerified}
                sending={leadOtp.sending}
                verifying={leadOtp.verifying}
                error={leadOtp.error}
                resendSeconds={leadOtp.resendSeconds}
                onSendOtp={leadOtp.sendOtp}
              />
              <textarea
                required
                name="Message"
                rows="4"
                className="form-control rounded-3 px-3 py-2"
                placeholder="Your Message*"
                style={{
                  resize: "none",
                }}
              />

              <button
                type="submit"
                className="btn btn-dark mt-3 py-2 rounded-pill fw-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Loader Overlay */}
      {isLoading && (
        <div
          className="position-fixed top-0 start-0 w-100 vh-100 d-flex justify-content-center align-items-center text-white fw-bold fs-5"
          style={{
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 10000,
          }}
        >
          <div className="spinner-border text-light me-3" role="status"></div>
          Submitting...
        </div>
      )}
    </>
  );
}
