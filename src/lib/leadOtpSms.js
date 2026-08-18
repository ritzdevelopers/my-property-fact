import { normalizeIndianPhone } from "@/lib/leadValidation";

function buildSmsMessage(otp) {
  return `${otp} is your MPF Portal verification code. Don't share your code with anyone. Team CONTENAISSANCE`;
}

export async function sendLeadOtpSms(phone, otp) {
  const apiUrl = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID;

  if (!apiUrl || !apiKey || !senderId) {
    throw new Error("SMS service is not configured");
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
    throw new Error("Failed to send OTP SMS");
  }

  return { success: true, providerResponse: body.trim() };
}
