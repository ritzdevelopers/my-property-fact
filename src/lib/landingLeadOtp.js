import { ensureLeadOtpVerified } from "@/lib/leadOtpClient";

/**
 * Gate landing-page lead submission behind mobile OTP verification.
 * Returns true when verified; false when OTP was just sent or verification failed.
 */
export async function verifyLandingLeadOtp(leadOtp, phone) {
  return ensureLeadOtpVerified({
    phone,
    otp: leadOtp.otp,
    isVerified: leadOtp.isVerified,
    sendOtp: leadOtp.sendOtp,
    verifyOtp: leadOtp.verifyOtp,
  });
}

export function getLandingOtpErrorMessage(leadOtp) {
  if (leadOtp.isVerified) return "";
  if (!leadOtp.otpSent && !leadOtp.otp.trim()) {
    return "OTP sent to your mobile number. Enter it and submit again.";
  }
  return leadOtp.error || "Please verify your mobile number with OTP.";
}
