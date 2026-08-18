import { normalizeIndianPhone } from "@/lib/leadValidation";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

/** @type {Map<string, { otp: string, expiresAt: number, attempts: number, lastSentAt: number }>} */
const otpStore = globalThis.__leadOtpStore ?? new Map();
if (!globalThis.__leadOtpStore) {
  globalThis.__leadOtpStore = otpStore;
}

function storeKey(phone) {
  return normalizeIndianPhone(phone);
}

export function createLeadOtp(phone) {
  const key = storeKey(phone);
  if (!key || key.length !== 10) {
    throw new Error("Invalid phone number");
  }

  const existing = otpStore.get(key);
  const now = Date.now();
  if (existing?.lastSentAt && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil(
      (RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000,
    );
    throw new Error(`Please wait ${waitSec}s before requesting another OTP`);
  }

  const otp = String(Math.floor(1000 + Math.random() * 9000));
  otpStore.set(key, {
    otp,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: now,
  });

  return otp;
}

export function verifyLeadOtp(phone, submittedOtp) {
  const key = storeKey(phone);
  const record = otpStore.get(key);

  if (!record) {
    return { ok: false, message: "OTP expired or not sent. Please request a new code." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return { ok: false, message: "OTP has expired. Please request a new code." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key);
    return {
      ok: false,
      message: "Too many incorrect attempts. Please request a new OTP.",
    };
  }

  const code = String(submittedOtp || "").trim();
  if (code !== record.otp) {
    record.attempts += 1;
    otpStore.set(key, record);
    return { ok: false, message: "Invalid OTP. Please check and try again." };
  }

  otpStore.delete(key);
  return { ok: true };
}
