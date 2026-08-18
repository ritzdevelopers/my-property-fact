import { gateLeadFormOtp } from "@/lib/leadFormOtpGate";

/**
 * Gate landing-page lead submission behind mobile OTP verification.
 * Returns true when verified; false when OTP was just sent or verification failed.
 */
export async function verifyLandingLeadOtp(leadOtp, phone) {
  const result = await gateLeadFormOtp(leadOtp, phone);
  return result.ok;
}

export function getLandingOtpFeedback(leadOtp) {
  if (leadOtp.isVerified) {
    return { tone: "success", message: "" };
  }
  if (leadOtp.error) {
    return { tone: "error", message: leadOtp.error };
  }
  if (leadOtp.otpSent && !leadOtp.otp.trim()) {
    return {
      tone: "info",
      message: "Enter the 4-digit OTP sent to your mobile, then submit again.",
    };
  }
  return {
    tone: "info",
    message: "OTP sent to your mobile. Enter the 4-digit code below.",
  };
}

/** @deprecated Use getLandingOtpFeedback */
export function getLandingOtpErrorMessage(leadOtp) {
  return getLandingOtpFeedback(leadOtp).message;
}
