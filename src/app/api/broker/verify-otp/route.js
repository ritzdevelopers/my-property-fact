import { NextResponse } from "next/server";
import { validateLeadFields } from "@/lib/leadValidation";
import { verifyLeadOtp } from "@/lib/leadOtpStore";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");
const BROKER_AUTH_SECRET = process.env.BROKER_AUTH_INTERNAL_SECRET || "";

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, otp, fullName, email, userType } = body;

    const validation = validateLeadFields({ name: fullName, email, phone });
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.name || validation.email || validation.phone },
        { status: 400 },
      );
    }

    if (!otp || String(otp).trim().length !== 4) {
      return NextResponse.json(
        { success: false, message: "Please enter the 4-digit OTP" },
        { status: 400 },
      );
    }

    const localVerify = verifyLeadOtp(phone, otp);
    if (!localVerify.ok) {
      return NextResponse.json({ success: false, message: localVerify.message }, { status: 400 });
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

    const backendRes = await fetch(`${API_BASE}app/auth/phone/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Broker-Auth-Secret": BROKER_AUTH_SECRET,
      },
      body: JSON.stringify({
        phone,
        fullName: String(fullName).trim(),
        email: String(email).trim(),
        userType: userType || "BROKER",
      }),
      cache: "no-store",
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        { success: false, message: data.message || data.error || "Could not create account" },
        { status: backendRes.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error?.message || "Verification failed. Please try again." },
      { status: 500 },
    );
  }
}
