import { normalizeIndianPhone } from "@/lib/leadValidation";

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export async function sendLeadOtp(phone) {
  const response = await fetch("/api/lead/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: normalizeIndianPhone(phone) }),
  });
  return parseJsonResponse(response);
}

export async function verifyLeadOtpClient(phone, otp) {
  const response = await fetch("/api/lead/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: normalizeIndianPhone(phone),
      otp: String(otp || "").trim(),
    }),
  });
  return parseJsonResponse(response);
}

/**
 * Ensures OTP is verified before running submit callback.
 * If OTP not sent yet, sends it and returns false.
 * If OTP entered but not verified, verifies first.
 */
export async function ensureLeadOtpVerified({
  phone,
  otp,
  isVerified,
  sendOtp,
  verifyOtp,
}) {
  if (isVerified) return true;

  if (!String(otp || "").trim()) {
    await sendOtp();
    return false;
  }

  return verifyOtp();
}
