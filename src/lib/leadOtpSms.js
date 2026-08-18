import { normalizeIndianPhone } from "@/lib/leadValidation";

function readSmsEnv(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function getSmsConfig() {
  const apiUrl = readSmsEnv("SMS_API_URL");
  const apiKey = readSmsEnv("SMS_API_KEY");
  const senderId = readSmsEnv("SMS_SENDER_ID");

  return { apiUrl, apiKey, senderId, isConfigured: Boolean(apiUrl && apiKey && senderId) };
}

function buildSmsMessage(otp) {
  return `${otp} is your MPF Portal verification code. Don't share your code with anyone. Team CONTENAISSANCE`;
}

export async function sendLeadOtpSms(phone, otp) {
  const { apiUrl, apiKey, senderId, isConfigured } = getSmsConfig();

  if (!isConfigured) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[lead-otp] SMS not configured — dev OTP:", otp, "for", phone);
      return { success: true, devBypass: true };
    }
    throw new Error("OTP service is temporarily unavailable. Please try again later.");
  }

  const number = normalizeIndianPhone(phone);
  if (number.length !== 10) {
    throw new Error("Invalid phone number");
  }

  const message = buildSmsMessage(otp);
  const url = new URL(apiUrl);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("senderid", senderId);
  url.searchParams.set("number", number);
  url.searchParams.set("message", message);

  const response = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  const body = await response.text();

  if (!response.ok) {
    console.error("[lead-otp] SMS provider error:", response.status, body.slice(0, 200));
    throw new Error("Could not send OTP. Please try again.");
  }

  return { success: true, providerResponse: body.trim() };
}
