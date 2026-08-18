/**
 * Submit-first OTP gate: validates form, sends OTP on first submit, verifies on second.
 * Returns { ok: true } when the enquiry can proceed.
 */
export async function gateLeadFormOtp(leadOtp, phone) {
  if (leadOtp.isVerified) {
    return { ok: true };
  }

  const hasOtpInput = Boolean(String(leadOtp.otp || "").trim());

  if (!leadOtp.otpSent && !hasOtpInput) {
    const sent = await leadOtp.sendOtp();
    if (!sent) {
      return {
        ok: false,
        tone: "error",
        message: leadOtp.error || "Could not send OTP. Please try again.",
      };
    }
    return {
      ok: false,
      tone: "info",
      message: "OTP sent to your mobile. Enter the 4-digit code below.",
    };
  }

  if (!hasOtpInput) {
    return {
      ok: false,
      tone: "info",
      message: "Enter the 4-digit code sent to your mobile.",
    };
  }

  const verified = await leadOtp.verifyOtp();
  if (verified) {
    return { ok: true };
  }

  return {
    ok: false,
    tone: "error",
    message: leadOtp.error || "Invalid code. Please try again.",
  };
}
