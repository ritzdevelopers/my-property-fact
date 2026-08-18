"use client";

import { useEffect, useRef } from "react";
import LeadOtpFields from "@/components/LeadOtpFields";
import { isLeadFormOtpActive } from "@/lib/leadFormOtpUi";

/**
 * OTP block for submit-first lead forms: hidden until SMS is sent on submit.
 * Pass autoSubmitFormRef or autoSubmitFormId to submit the lead automatically after verification.
 */
export default function LeadFormOtpStep({
  phone,
  leadOtp,
  className = "",
  inputClassName = "",
  buttonClassName = "",
  variant = "default",
  autoSubmitFormRef,
  autoSubmitFormId,
  onVerified,
}) {
  const verifiedHandledRef = useRef(false);

  useEffect(() => {
    if (!leadOtp?.isVerified) {
      verifiedHandledRef.current = false;
      return;
    }

    if (verifiedHandledRef.current) {
      return;
    }

    verifiedHandledRef.current = true;

    if (onVerified) {
      onVerified();
      return;
    }

    if (autoSubmitFormRef?.current) {
      autoSubmitFormRef.current.requestSubmit();
      return;
    }

    if (autoSubmitFormId) {
      document.getElementById(autoSubmitFormId)?.requestSubmit();
    }
  }, [
    leadOtp?.isVerified,
    onVerified,
    autoSubmitFormRef,
    autoSubmitFormId,
  ]);

  if (!isLeadFormOtpActive(leadOtp)) {
    return null;
  }

  const rootClass = ["lead-form-otp-step", className].filter(Boolean).join(" ");

  if (leadOtp.isVerified) {
    return (
      <div className={rootClass}>
        <div className={`lead-otp-panel lead-otp-panel--solo ${variant !== "default" ? `lead-otp-panel--${variant}` : ""}`}>
          <p className="lead-otp-panel__status lead-otp-panel__status--loading">
            Submitting your enquiry…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={rootClass}>
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
        submitFlow
        inputClassName={inputClassName}
        buttonClassName={buttonClassName}
        variant={variant}
      />
    </div>
  );
}
