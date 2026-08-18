"use client";
import { useState } from "react";
import LeadOtpFields from "@/components/LeadOtpFields";
import { useLeadOtp } from "@/hooks/useLeadOtp";
import {
  getLandingOtpErrorMessage,
  verifyLandingLeadOtp,
} from "@/lib/landingLeadOtp";

export default function ContactForm({frmName}) {
  const [isLoading, setIsLoading] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [phone, setPhone] = useState("");
  const leadOtp = useLeadOtp(phone);

  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const leadController = async (e) => {
    e.preventDefault();
    const form = e.target;

    const verified = await verifyLandingLeadOtp(leadOtp, phone);
    if (!verified) {
      showPopupMessage(getLandingOtpErrorMessage(leadOtp));
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
    params.append("sheetName", frmName);
    params.append(
      "Time",
      date.toLocaleTimeString("en-US", {
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );

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
      showPopupMessage("Form submitted successfully!");
    } catch (err) {
      console.error("Error:", err);
      showPopupMessage("Error submitting form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={leadController}
        className="w-100 leadForm"
        style={{
          maxWidth: "611px",
          minHeight: "614px",
          display: "flex",
          flexDirection: "column",
          gap: "35px",
          paddingTop: "30px",
        }}
      >
        <input
          required
          name="Name"
          type="text"
          className="form-input-custom"
          placeholder="Name*"
        />

        <input
          required
          type="email"
          name="Email"
          className="form-input-custom"
          placeholder="Email*"
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          title="Please enter a valid email address"
        />

        <input
          required
          type="text"
          name="Phone"
          className="form-input-custom"
          placeholder="Phone*"
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
          name="Message"
          required
          className="form-input-custom"
          placeholder="Message*"
        />

        <label className="d-flex gap-3 ">
          <input type="checkbox" style={{ width: "16px", height: "14px" }} />
          <p
            style={{
              fontFamily: "moster_regular",
              fontWeight: "400",
              fontSize: "14px",
            }}
          >
            I accept the Terms & Conditions.
          </p>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="cta-button border-0"
          style={{ fontFamily: "moster_medium", width: "174px", backgroundColor:'black' }}
        >
          {isLoading ? "Submitting..." : "Contact Us"}
        </button>
      </form>

      {/* Loader */}
      {isLoading && (
        <div
          id="loader"
          className="position-fixed top-0 start-0 w-100 vh-100 d-flex justify-content-center align-items-center"
        >
          Submitting...
        </div>
      )}

      {/* Popup */}
      {showPopup && (
        <div
          id="popup"
          className="position-fixed top-0 start-0 w-100 vh-100 d-flex align-items-center justify-content-center"
        >
          <div className="popup-content">
            <p id="popupMessage" className="mb-4">
              {popupMessage}
            </p>
            <button onClick={closePopup} className="btn cta-button border-0">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
