import { NextResponse } from "next/server";
import { validateLeadPhone } from "@/lib/leadValidation";
import { sendLeadOtpSms } from "@/lib/leadOtpSms";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");
const BROKER_AUTH_SECRET = process.env.BROKER_AUTH_INTERNAL_SECRET || "";

/** Send broker portal OTP via SMS (CONTENAISSANCE). */
export async function POST(request) {
  try {
    const { phone } = await request.json();
    const phoneError = validateLeadPhone(phone);
    if (phoneError) {
      return NextResponse.json({ success: false, message: phoneError }, { status: 400 });
    }

    if (!API_BASE) {
      return NextResponse.json(
        { success: false, message: "Authentication service is not configured." },
        { status: 503 },
      );
    }

    if (!BROKER_AUTH_SECRET) {
      return NextResponse.json(
        { success: false, message: "Broker auth is not configured on the server." },
        { status: 503 },
      );
    }

    // Generate OTP in backend (shared persistent store), then deliver via SMS provider from Next.js.
    const backendRes = await fetch(`${API_BASE}app/auth/phone/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Broker-Auth-Secret": BROKER_AUTH_SECRET,
      },
      body: JSON.stringify({ phone }),
      cache: "no-store",
    });

    const data = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, message: data.message || data.error || "Could not send OTP" },
        { status: backendRes.status },
      );
    }

    const otpCode = data.otp || data.otpCode;
    if (!otpCode) {
      return NextResponse.json(
        { success: false, message: "OTP generation failed. Please try again." },
        { status: 502 },
      );
    }

    await sendLeadOtpSms(phone, String(otpCode));

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 300,
    });
  } catch (error) {
    const message = error?.message || "Could not send OTP. Please try again.";
    const status = message.includes("wait")
      ? 429
      : message.includes("temporarily unavailable")
        ? 503
        : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
